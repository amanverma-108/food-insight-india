import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

const buildPrompt = (productName: string): string => `
You are a food health analysis expert specializing in packaged food products.
Analyze the product: "${productName}"

Return ONLY a valid JSON object with NO markdown, NO backticks, NO explanation. Just raw JSON.

The JSON must follow this exact structure:
{
  "product_name": "exact product name with brand",
  "category": "category like Biscuits & Cookies / Chips & Snacks / Instant Noodles / Beverages / etc.",
  "health_score": <number 0-100>,
  "health_rating": "<poor|average|good>",
  "health_summary": "2-3 sentence summary of overall health impact",
  "ingredients": [
    {
      "name": "ingredient name",
      "function": "role in the product e.g. Sweetener / Preservative / Emulsifier",
      "health_effect": "detailed description of health impact",
      "rating": "<harmful|neutral|beneficial>",
      "affected_organs": ["organ1", "organ2"]
    }
  ],
  "nutrition_facts": {
    "calories": <number>,
    "fat": <number in grams>,
    "protein": <number in grams>,
    "carbohydrates": <number in grams>,
    "sugar": <number in grams>,
    "salt": <number in mg>
  },
  "additives": [
    {
      "code": "E-code like E322 or NA",
      "name": "chemical name",
      "function": "what it does",
      "concern_level": "<low|medium|high>"
    }
  ],
  "body_effects": [
    {
      "organ": "<brain|heart|lungs|liver|stomach|pancreas|kidneys|intestines>",
      "ingredients": [
        {
          "name": "ingredient name",
          "type": "<harmful|neutral|beneficial>",
          "description": "specific effect on this organ"
        }
      ]
    }
  ],
  "alternatives": [
    {
      "name": "healthier alternative product name",
      "health_score": <number>,
      "health_rating": "<poor|average|good>",
      "reason": "why this is a better choice"
    }
  ]
}

Rules:
- health_score: 0-30 = poor, 31-65 = average, 66-100 = good
- Include 3-5 alternatives
- Include all major ingredients with E-codes if applicable
- body_effects must cover all 8 organs: brain, heart, lungs, liver, stomach, pancreas, kidneys, intestines
- Be accurate, specific, and medically sound
- If the product is not a real/known product, still generate plausible analysis based on the product type
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName } = await req.json();
    if (!productName || typeof productName !== "string" || productName.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Product name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const normalized = normalizeName(productName);

    // Step 1: Check DB cache
    const { data: existing } = await supabase
      .from("products")
      .select("*")
      .eq("product_name_normalized", normalized)
      .single();

    if (existing) {
      // Cache hit — increment search count and log
      await supabase
        .from("products")
        .update({ search_count: (existing.search_count || 1) + 1, updated_at: new Date().toISOString() })
        .eq("id", existing.id);

      await supabase.from("search_logs").insert({ product_name: productName, cache_hit: true });

      return new Response(
        JSON.stringify({ product: existing, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Cache miss — call AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a food analysis expert. Return only valid JSON, no markdown." },
          { role: "user", content: buildPrompt(productName) },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error(`AI service error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const text = aiData.choices?.[0]?.message?.content;
    if (!text) throw new Error("No response from AI");

    // Clean markdown formatting
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let analysisData;
    try {
      analysisData = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", cleaned);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Step 3: Save to DB
    const productRow = {
      product_name: analysisData.product_name || productName,
      product_name_normalized: normalized,
      category: analysisData.category,
      health_score: analysisData.health_score,
      health_rating: analysisData.health_rating,
      health_summary: analysisData.health_summary,
      ingredients: analysisData.ingredients,
      nutrition_facts: analysisData.nutrition_facts,
      additives: analysisData.additives,
      body_effects: analysisData.body_effects,
      alternatives: analysisData.alternatives,
      search_count: 1,
    };

    const { data: saved, error: insertError } = await supabase
      .from("products")
      .insert(productRow)
      .select()
      .single();

    if (insertError) {
      console.error("DB insert error:", insertError);
      // Return data even if save fails
      return new Response(
        JSON.stringify({ product: { id: crypto.randomUUID(), ...productRow, created_at: new Date().toISOString() }, cached: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log cache miss
    await supabase.from("search_logs").insert({ product_name: productName, cache_hit: false });

    return new Response(
      JSON.stringify({ product: saved, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-product error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
