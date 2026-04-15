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

// ── Open Food Facts ──────────────────────────────────────────────

interface OFFNutrition {
  calories: number;
  fat: number;
  saturated_fat: number;
  trans_fat: number;
  carbohydrates: number;
  sugar: number;
  added_sugar: number;
  protein: number;
  salt: number;
  sodium: number;
  fiber: number;
}

interface OFFResult {
  id: string;
  barcode: string;
  product_name: string;
  brand: string;
  category: string;
  ingredients_text: string;
  ingredients_parsed: Array<{ text: string; percent_estimate?: number }>;
  nutrition: OFFNutrition;
  nutriscore_grade: string;
  nova_group: number;
  image_url: string;
}

async function fetchFromOFF(productName: string): Promise<OFFResult | null> {
  const fields = "id,code,product_name,brands,categories,ingredients_text,ingredients,nutriments,nutriscore_grade,nova_group,image_front_url";
  const urls = [
    `https://in.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&search_simple=1&action=process&json=1&page_size=10&fields=${fields}`,
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&search_simple=1&action=process&json=1&page_size=10&fields=${fields}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const products: any[] = data.products || [];
      const best = pickBestMatch(productName, products);
      if (best) return parseOFFResult(best);
    } catch (e) {
      console.warn("OFF search failed:", url, e);
    }
  }
  return null;
}

function pickBestMatch(query: string, products: any[]): any | null {
  if (!products.length) return null;
  const q = query.toLowerCase().trim();
  const queryWords = q.split(/\s+/).filter((w) => w.length > 2);

  const scored = products
    .filter((p) => {
      const hasName = p.product_name && p.product_name.trim().length > 0;
      const hasNutrition = p.nutriments && (p.nutriments["energy-kcal_100g"] || p.nutriments["energy_100g"]);
      return hasName && hasNutrition;
    })
    .map((p) => {
      const name = `${p.product_name || ""} ${p.brands || ""}`.toLowerCase();
      let score = 0;
      if (name.trim() === q) score += 200;
      if (name.includes(q)) score += 80;
      queryWords.forEach((word) => { if (name.includes(word)) score += 15; });
      if (p.nutriments?.["energy-kcal_100g"]) score += 30;
      if (p.ingredients_text) score += 20;
      if (p.nova_group) score += 10;
      return { p, score };
    })
    .filter((x) => x.score > 20)
    .sort((a, b) => b.score - a.score);

  return scored.length > 0 ? scored[0].p : null;
}

function parseOFFResult(p: any): OFFResult {
  const n = p.nutriments || {};
  let calories = n["energy-kcal_100g"];
  if (!calories && n["energy_100g"]) calories = Math.round(n["energy_100g"] / 4.184);
  if (!calories) calories = 0;

  const sodiumG = n["sodium_100g"] || 0;
  const saltG = n["salt_100g"] || 0;
  const sodiumMg = sodiumG > 0 ? Math.round(sodiumG * 1000) : Math.round(saltG * 400);
  const saltMg = saltG > 0 ? Math.round(saltG * 1000) : Math.round(sodiumG * 2540);

  const r1 = (v: number) => Math.round(v * 10) / 10;

  return {
    id: p.id || p.code || "",
    barcode: p.code || "",
    product_name: p.product_name || "",
    brand: p.brands || "",
    category: p.categories || "",
    ingredients_text: p.ingredients_text || "",
    ingredients_parsed: (p.ingredients || []).map((ing: any) => ({
      text: ing.text || "",
      percent_estimate: ing.percent_estimate,
    })),
    nutrition: {
      calories: Math.round(calories),
      fat: r1(n["fat_100g"] || 0),
      saturated_fat: r1(n["saturated-fat_100g"] || 0),
      trans_fat: r1(n["trans-fat_100g"] || 0),
      carbohydrates: r1(n["carbohydrates_100g"] || 0),
      sugar: r1(n["sugars_100g"] || 0),
      added_sugar: r1(n["added-sugars_100g"] || 0),
      protein: r1(n["proteins_100g"] || 0),
      salt: saltMg,
      sodium: sodiumMg,
      fiber: r1(n["fiber_100g"] || 0),
    },
    nutriscore_grade: p.nutriscore_grade || "",
    nova_group: p.nova_group || 0,
    image_url: p.image_front_url || "",
  };
}

// ── AI Prompt ────────────────────────────────────────────────────

function buildAnalysisPrompt(productName: string, offData: OFFResult | null): string {
  const ingredientsList = offData?.ingredients_parsed?.length
    ? offData.ingredients_parsed.map((i, idx) =>
        `${idx + 1}. ${i.text}${i.percent_estimate ? ` (~${i.percent_estimate.toFixed(1)}%)` : ""}`
      ).join("\n")
    : "Not available from label — use your knowledge of this product";

  const nutritionSummary = offData?.nutrition
    ? `
VERIFIED NUTRITION (per 100g — from product label, DO NOT change these numbers):
- Calories:       ${offData.nutrition.calories} kcal
- Total Fat:      ${offData.nutrition.fat} g
- Saturated Fat:  ${offData.nutrition.saturated_fat} g
- Trans Fat:      ${offData.nutrition.trans_fat} g
- Carbohydrates:  ${offData.nutrition.carbohydrates} g
- Total Sugars:   ${offData.nutrition.sugar} g
- Added Sugars:   ${offData.nutrition.added_sugar} g
- Protein:        ${offData.nutrition.protein} g
- Sodium:         ${offData.nutrition.sodium} mg
- Dietary Fiber:  ${offData.nutrition.fiber} g
NOVA Processing Group: ${offData.nova_group}/4 (4 = ultra-processed)
Nutri-Score: ${offData.nutriscore_grade?.toUpperCase() || "N/A"} (A=best, E=worst)`
    : "Nutrition data not available from label database. Estimate based on your knowledge.";

  return `
You are a certified nutritionist and food safety expert.

PRODUCT: "${productName}"

${nutritionSummary}

INGREDIENTS FROM LABEL:
${ingredientsList}

RAW INGREDIENTS TEXT: "${offData?.ingredients_text || "Not available"}"

YOUR TASK:
Analyze this product using the REAL data above. Do not invent or change any nutrition numbers.

IMPORTANT RULES:
1. For common ingredients like Sugar, Salt, Palm Oil, Maida — if present IN HIGH AMOUNTS, flag them explicitly.
2. For every ingredient, explain its FUNCTION and health impact.
3. Use the actual nutrition numbers when discussing health impacts.
4. Health score must reflect the nutrition data — high sugar/fat/sodium = lower score.
5. Be specific with numbers and percentages.

Return ONLY valid JSON. No markdown. No backticks.

{
  "product_name": "exact name with brand",
  "category": "specific category",
  "health_score": <0-100>,
  "health_rating": "<poor|average|good>",
  "health_summary": "3-4 sentences with specific numbers from nutrition data",
  "key_concerns": ["One-line specific concern with actual numbers"],
  "ingredients": [
    {
      "name": "ingredient name",
      "function": "specific role in this product",
      "health_effect": "detailed health impact with numbers",
      "rating": "<harmful|neutral|beneficial>",
      "affected_organs": ["organ1", "organ2"],
      "concern_level": "<none|low|medium|high|very_high>",
      "daily_limit_context": "e.g. This product's sugar content alone uses 74% of WHO daily sugar limit"
    }
  ],
  "nutrition_facts": {
    "calories": <number>,
    "fat": <number>,
    "saturated_fat": <number>,
    "trans_fat": <number>,
    "carbohydrates": <number>,
    "sugar": <number>,
    "added_sugar": <number>,
    "protein": <number>,
    "salt": <number in mg>,
    "sodium": <number in mg>,
    "fiber": <number>
  },
  "additives": [
    {
      "code": "E-code or NA",
      "name": "chemical name",
      "function": "specific role",
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
      "reason": "specific nutritional comparison",
      "what_is_better": ["specific improvement 1", "specific improvement 2"]
    }
  ],
  "consumption_advice": "Specific advice on safe consumption amount and frequency"
}

Health score guidelines:
- Start at 85, apply deductions, minimum 5
- Calories > 500/100g: -15, Sugar > 20g: -20, Sugar > 10g: -10
- Saturated fat > 10g: -15, Trans fat > 0.5g: -20
- Sodium > 1000mg: -15, Sodium > 600mg: -8
- Fiber < 1g: -5, Protein < 3g: -5, NOVA 4: -10
`;
}

// ── Threshold warnings ───────────────────────────────────────────

interface ThresholdWarning {
  nutrient: string;
  value: number;
  unit: string;
  level: "high" | "very_high" | "low";
  message: string;
  who_guideline: string;
  percent_of_daily: number;
}

function generateThresholdWarnings(nutrition: Record<string, number>): ThresholdWarning[] {
  const limits: Record<string, any> = {
    calories:      { high: 400,  very_high: 500,  unit: "kcal", daily_reference: 2000 },
    fat:           { high: 17.5, very_high: 25,   unit: "g",    daily_reference: 70   },
    saturated_fat: { high: 5,    very_high: 10,   unit: "g",    daily_reference: 20   },
    trans_fat:     { high: 0.5,  very_high: 2,    unit: "g",    daily_reference: 2    },
    sugar:         { high: 10,   very_high: 22.5, unit: "g",    daily_reference: 50   },
    salt:          { high: 600,  very_high: 1500, unit: "mg",   daily_reference: 2000 },
    sodium:        { high: 600,  very_high: 1500, unit: "mg",   daily_reference: 2000 },
    protein:       { low: 5,     unit: "g",       daily_reference: 50   },
    fiber:         { low: 3,     unit: "g",       daily_reference: 25   },
  };

  const warnings: ThresholdWarning[] = [];
  const checks = [
    { key: "calories",      label: "Calories",       who: "Recommended max 2000 kcal/day (WHO)" },
    { key: "fat",           label: "Total fat",      who: "Recommended max 70g fat/day (WHO)" },
    { key: "saturated_fat", label: "Saturated fat",  who: "Max 20g saturated fat/day (WHO)" },
    { key: "trans_fat",     label: "Trans fat",      who: "Max 2g trans fat/day (WHO)" },
    { key: "sugar",         label: "Total sugars",   who: "WHO recommends < 25g free sugars/day" },
    { key: "salt",          label: "Sodium/Salt",    who: "WHO recommends < 2000mg sodium/day" },
    { key: "protein",       label: "Protein",        who: "Recommended 50g protein/day" },
    { key: "fiber",         label: "Dietary fiber",  who: "WHO recommends ≥ 25g fiber/day" },
  ];

  for (const { key, label, who } of checks) {
    const value = nutrition[key];
    if (value === undefined || value === null) continue;
    const lim = limits[key];
    if (!lim) continue;
    const pct = Math.round((value / lim.daily_reference) * 100);

    if (lim.very_high !== undefined && value >= lim.very_high) {
      warnings.push({ nutrient: label, value, unit: lim.unit, level: "very_high",
        message: `Very high ${label.toLowerCase()} — ${value}${lim.unit} per 100g is ${pct}% of your daily limit.`,
        who_guideline: who, percent_of_daily: pct });
    } else if (lim.high !== undefined && value >= lim.high) {
      warnings.push({ nutrient: label, value, unit: lim.unit, level: "high",
        message: `High ${label.toLowerCase()} — ${value}${lim.unit} per 100g is ${pct}% of daily intake.`,
        who_guideline: who, percent_of_daily: pct });
    }
    if (lim.low !== undefined && value <= lim.low) {
      warnings.push({ nutrient: label, value, unit: lim.unit, level: "low",
        message: `Very low ${label.toLowerCase()} — only ${value}${lim.unit} per 100g.`,
        who_guideline: who, percent_of_daily: pct });
    }
  }

  if (nutrition.trans_fat > 0.1 && !warnings.find((w) => w.nutrient === "Trans fat")) {
    warnings.push({ nutrient: "Trans fat", value: nutrition.trans_fat, unit: "g", level: "high",
      message: `Trans fat detected — ${nutrition.trans_fat}g per 100g. WHO recommends eliminating trans fats entirely.`,
      who_guideline: "WHO recommends eliminating industrial trans fats completely",
      percent_of_daily: Math.round((nutrition.trans_fat / 2) * 100) });
  }

  return warnings.sort((a, b) => {
    const order: Record<string, number> = { very_high: 0, high: 1, low: 2 };
    return order[a.level] - order[b.level];
  });
}

// ── Main handler ─────────────────────────────────────────────────

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

    // 1. Check DB cache
    const { data: existing } = await supabase
      .from("products")
      .select("*")
      .eq("product_name_normalized", normalized)
      .single();

    if (existing) {
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

    // 2. Fetch from Open Food Facts
    console.log("[FoodInsight] Fetching from Open Food Facts:", productName);
    const offData = await fetchFromOFF(productName);
    if (offData) {
      console.log("[FoodInsight] OFF match found:", offData.product_name);
    } else {
      console.log("[FoodInsight] No OFF match — AI will estimate");
    }

    // 3. Call AI with real data
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
          { role: "user", content: buildAnalysisPrompt(productName, offData) },
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

    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let analysisData;
    try {
      analysisData = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", cleaned);
      throw new Error("Failed to parse AI response as JSON");
    }

    // 4. Generate threshold warnings from real nutrition data
    const nutritionForWarnings = offData?.nutrition || analysisData.nutrition_facts || {};
    const thresholdWarnings = generateThresholdWarnings(nutritionForWarnings as Record<string, number>);

    // 5. Merge everything — OFF nutrition takes priority over AI
    const productRow = {
      product_name: offData?.product_name || analysisData.product_name || productName,
      product_name_normalized: normalized,
      brand: offData?.brand || "",
      category: offData?.category || analysisData.category || "",
      barcode: offData?.barcode || "",
      health_score: analysisData.health_score,
      health_rating: analysisData.health_rating,
      health_summary: analysisData.health_summary,
      nutrition_facts: offData?.nutrition || analysisData.nutrition_facts || {},
      nutrition_source: offData ? "open_food_facts" : "ai_estimated",
      off_id: offData?.id || null,
      off_verified: !!offData,
      ingredients: analysisData.ingredients || [],
      raw_ingredients_text: offData?.ingredients_text || "",
      threshold_warnings: thresholdWarnings,
      additives: analysisData.additives || [],
      body_effects: analysisData.body_effects || [],
      alternatives: analysisData.alternatives || [],
      search_count: 1,
    };

    // 6. Save to DB
    const { data: saved, error: insertError } = await supabase
      .from("products")
      .insert(productRow)
      .select()
      .single();

    if (insertError) {
      console.error("DB insert error:", insertError);
      return new Response(
        JSON.stringify({
          product: {
            id: crypto.randomUUID(),
            ...productRow,
            created_at: new Date().toISOString(),
            // Extra fields for frontend
            key_concerns: analysisData.key_concerns || [],
            consumption_advice: analysisData.consumption_advice || "",
            nova_group: offData?.nova_group || null,
            nutriscore_grade: offData?.nutriscore_grade || "",
            image_url: offData?.image_url || "",
          },
          cached: false,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase.from("search_logs").insert({ product_name: productName, cache_hit: false });

    return new Response(
      JSON.stringify({
        product: {
          ...saved,
          key_concerns: analysisData.key_concerns || [],
          consumption_advice: analysisData.consumption_advice || "",
          nova_group: offData?.nova_group || null,
          nutriscore_grade: offData?.nutriscore_grade || "",
          image_url: offData?.image_url || "",
        },
        cached: false,
      }),
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
