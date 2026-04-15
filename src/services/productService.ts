import { supabase } from "@/integrations/supabase/client";
import type { ProductData } from "@/components/ProductAnalysis";

interface DBProduct {
  id: string;
  product_name: string;
  category: string;
  health_score: number;
  health_rating: string;
  health_summary: string;
  brand?: string;
  barcode?: string;
  off_verified?: boolean;
  nutrition_source?: string;
  nova_group?: number;
  nutriscore_grade?: string;
  image_url?: string;
  raw_ingredients_text?: string;
  key_concerns?: string[];
  consumption_advice?: string;
  ingredients: Array<{
    name: string;
    function: string;
    health_effect: string;
    rating: 'harmful' | 'neutral' | 'beneficial';
    affected_organs: string[];
    concern_level?: string;
    daily_limit_context?: string;
  }>;
  nutrition_facts: {
    calories: number;
    fat: number;
    saturated_fat?: number;
    trans_fat?: number;
    protein: number;
    carbohydrates: number;
    sugar: number;
    added_sugar?: number;
    salt: number;
    sodium?: number;
    fiber?: number;
  };
  additives: Array<{
    code: string;
    name: string;
    function: string;
    concern_level: 'low' | 'medium' | 'high';
  }>;
  threshold_warnings?: Array<{
    nutrient: string;
    value: number;
    unit: string;
    level: 'high' | 'very_high' | 'low';
    message: string;
    who_guideline: string;
    percent_of_daily: number;
  }>;
  alternatives: Array<{
    name: string;
    health_score: number;
    health_rating: string;
    reason: string;
    what_is_better?: string[];
  }>;
}

function mapToProductData(db: DBProduct): ProductData {
  return {
    name: db.product_name,
    category: db.category || "Food Product",
    healthScore: db.health_score,
    healthSummary: db.health_summary || "",
    brand: db.brand || "",
    offVerified: db.off_verified || false,
    nutritionSource: (db.nutrition_source as 'open_food_facts' | 'ai_estimated') || "ai_estimated",
    novaGroup: db.nova_group || null,
    nutriscoreGrade: db.nutriscore_grade || "",
    keyConcerns: db.key_concerns || [],
    consumptionAdvice: db.consumption_advice || "",
    thresholdWarnings: (db.threshold_warnings || []).map((w) => ({
      nutrient: w.nutrient,
      value: w.value,
      unit: w.unit,
      level: w.level,
      message: w.message,
      whoGuideline: w.who_guideline,
      percentOfDaily: w.percent_of_daily,
    })),
    ingredients: (db.ingredients || []).map((i) => ({
      name: i.name,
      function: i.function,
      healthEffect: i.health_effect,
      rating: i.rating,
      affectedOrgans: i.affected_organs || [],
      concernLevel: i.concern_level || "none",
      dailyLimitContext: i.daily_limit_context || "",
    })),
    nutrition: {
      calories: db.nutrition_facts?.calories || 0,
      fat: db.nutrition_facts?.fat || 0,
      saturatedFat: db.nutrition_facts?.saturated_fat || 0,
      transFat: db.nutrition_facts?.trans_fat || 0,
      protein: db.nutrition_facts?.protein || 0,
      carbs: db.nutrition_facts?.carbohydrates || 0,
      sugar: db.nutrition_facts?.sugar || 0,
      addedSugar: db.nutrition_facts?.added_sugar || 0,
      salt: db.nutrition_facts?.salt || 0,
      sodium: db.nutrition_facts?.sodium || 0,
      fiber: db.nutrition_facts?.fiber || 0,
    },
    additives: (db.additives || []).map((a) => ({
      code: a.code,
      name: a.name,
      function: a.function,
      concern: a.concern_level === 'medium' ? 'moderate' : a.concern_level as 'low' | 'moderate' | 'high',
    })),
    alternatives: (db.alternatives || []).map((alt) => ({
      name: alt.name,
      healthScore: alt.health_score,
      reason: alt.reason,
      whatIsBetter: alt.what_is_better || [],
    })),
  };
}

export async function searchProduct(productName: string): Promise<ProductData> {
  const { data, error } = await supabase.functions.invoke("analyze-product", {
    body: { productName },
  });

  if (error) {
    throw new Error(error.message || "Failed to analyze product");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return mapToProductData(data.product);
}

export async function getTrendingProducts(): Promise<string[]> {
  const { data } = await supabase
    .from("products" as any)
    .select("product_name")
    .order("search_count", { ascending: false })
    .limit(4);

  if (data && data.length >= 2) {
    return (data as any[]).map((p: any) => p.product_name);
  }
  return [];
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function identifyProductFromImage(file: File): Promise<string | null> {
  const imageBase64 = await fileToBase64(file);
  const mimeType = file.type || "image/jpeg";

  const { data, error } = await supabase.functions.invoke("identify-product", {
    body: { imageBase64, mimeType },
  });

  if (error) {
    throw new Error(error.message || "Failed to identify product");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data?.productName || null;
}
