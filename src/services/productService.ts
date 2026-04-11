import { supabase } from "@/integrations/supabase/client";
import type { ProductData } from "@/components/ProductAnalysis";

interface DBProduct {
  id: string;
  product_name: string;
  category: string;
  health_score: number;
  health_rating: string;
  health_summary: string;
  ingredients: Array<{
    name: string;
    function: string;
    health_effect: string;
    rating: 'harmful' | 'neutral' | 'beneficial';
    affected_organs: string[];
  }>;
  nutrition_facts: {
    calories: number;
    fat: number;
    protein: number;
    carbohydrates: number;
    sugar: number;
    salt: number;
  };
  additives: Array<{
    code: string;
    name: string;
    function: string;
    concern_level: 'low' | 'medium' | 'high';
  }>;
  alternatives: Array<{
    name: string;
    health_score: number;
    health_rating: string;
    reason: string;
  }>;
}

function mapToProductData(db: DBProduct): ProductData {
  return {
    name: db.product_name,
    category: db.category || "Food Product",
    healthScore: db.health_score,
    healthSummary: db.health_summary || "",
    ingredients: (db.ingredients || []).map((i) => ({
      name: i.name,
      function: i.function,
      healthEffect: i.health_effect,
      rating: i.rating,
      affectedOrgans: i.affected_organs || [],
    })),
    nutrition: {
      calories: db.nutrition_facts?.calories || 0,
      fat: db.nutrition_facts?.fat || 0,
      protein: db.nutrition_facts?.protein || 0,
      carbs: db.nutrition_facts?.carbohydrates || 0,
      sugar: db.nutrition_facts?.sugar || 0,
      salt: db.nutrition_facts?.salt || 0,
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
