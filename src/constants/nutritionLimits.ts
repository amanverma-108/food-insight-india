// Based on WHO guidelines and FSSAI regulations for Indian adults (per 100g product)

export const NUTRITION_LIMITS_PER_100G = {
  calories:      { high: 400,  very_high: 500,  unit: 'kcal', daily_reference: 2000 },
  fat:           { high: 17.5, very_high: 25,   unit: 'g',    daily_reference: 70   },
  saturated_fat: { high: 5,    very_high: 10,   unit: 'g',    daily_reference: 20   },
  trans_fat:     { high: 0.5,  very_high: 2,    unit: 'g',    daily_reference: 2    },
  sugar:         { high: 10,   very_high: 22.5, unit: 'g',    daily_reference: 50   },
  salt:          { high: 600,  very_high: 1500, unit: 'mg',   daily_reference: 2000 },
  sodium:        { high: 600,  very_high: 1500, unit: 'mg',   daily_reference: 2000 },
  protein:       { low: 5,     unit: 'g',       daily_reference: 50   },
  fiber:         { low: 3,     unit: 'g',       daily_reference: 25   },
} as const;

export type NutrientKey = keyof typeof NUTRITION_LIMITS_PER_100G;

export interface ThresholdWarning {
  nutrient: string;
  value: number;
  unit: string;
  level: 'high' | 'very_high' | 'low';
  message: string;
  who_guideline: string;
  percent_of_daily: number;
}

export function generateThresholdWarnings(nutrition: Record<string, number>): ThresholdWarning[] {
  const warnings: ThresholdWarning[] = [];

  const checks: Array<{
    key: string;
    nutrientKey: NutrientKey;
    label: string;
    who: string;
  }> = [
    { key: 'calories',      nutrientKey: 'calories',      label: 'Calories',       who: 'Recommended max 2000 kcal/day (WHO)' },
    { key: 'fat',           nutrientKey: 'fat',           label: 'Total fat',      who: 'Recommended max 70g fat/day (WHO)' },
    { key: 'saturated_fat', nutrientKey: 'saturated_fat', label: 'Saturated fat',  who: 'Max 20g saturated fat/day (WHO)' },
    { key: 'trans_fat',     nutrientKey: 'trans_fat',     label: 'Trans fat',      who: 'Max 2g trans fat/day — WHO recommends eliminating entirely' },
    { key: 'sugar',         nutrientKey: 'sugar',         label: 'Total sugars',   who: 'WHO recommends < 25g free sugars/day' },
    { key: 'salt',          nutrientKey: 'salt',          label: 'Sodium/Salt',    who: 'WHO recommends < 2000mg sodium/day (< 5g salt)' },
    { key: 'protein',       nutrientKey: 'protein',       label: 'Protein',        who: 'Recommended 50g protein/day' },
    { key: 'fiber',         nutrientKey: 'fiber',         label: 'Dietary fiber',  who: 'WHO recommends ≥ 25g fiber/day' },
  ];

  for (const { key, nutrientKey, label, who } of checks) {
    const value = nutrition[key];
    if (value === undefined || value === null) continue;

    const limits = NUTRITION_LIMITS_PER_100G[nutrientKey];
    if (!limits) continue;

    const dailyRef = limits.daily_reference;
    const percentOfDaily = Math.round((value / dailyRef) * 100);

    if ('very_high' in limits && value >= limits.very_high) {
      warnings.push({
        nutrient: label, value, unit: limits.unit, level: 'very_high',
        message: `Very high ${label.toLowerCase()} detected — ${value}${limits.unit} per 100g is ${percentOfDaily}% of your entire daily limit in just 100g of this product.`,
        who_guideline: who, percent_of_daily: percentOfDaily,
      });
    } else if ('high' in limits && value >= (limits as any).high) {
      warnings.push({
        nutrient: label, value, unit: limits.unit, level: 'high',
        message: `High ${label.toLowerCase()} — ${value}${limits.unit} per 100g represents ${percentOfDaily}% of your recommended daily intake.`,
        who_guideline: who, percent_of_daily: percentOfDaily,
      });
    }

    if ('low' in limits && value <= (limits as any).low) {
      warnings.push({
        nutrient: label, value, unit: limits.unit, level: 'low',
        message: `Very low ${label.toLowerCase()} — only ${value}${limits.unit} per 100g. This product provides minimal nutritional value for ${label.toLowerCase()}.`,
        who_guideline: who, percent_of_daily: percentOfDaily,
      });
    }
  }

  if (nutrition.trans_fat > 0.1) {
    const exists = warnings.find(w => w.nutrient === 'Trans fat');
    if (!exists) {
      warnings.push({
        nutrient: 'Trans fat', value: nutrition.trans_fat, unit: 'g', level: 'high',
        message: `Trans fat detected — ${nutrition.trans_fat}g per 100g. WHO recommends eliminating trans fats entirely from diet.`,
        who_guideline: 'WHO recommends eliminating industrial trans fats completely',
        percent_of_daily: Math.round((nutrition.trans_fat / 2) * 100),
      });
    }
  }

  return warnings.sort((a, b) => {
    const order = { very_high: 0, high: 1, low: 2 };
    return order[a.level] - order[b.level];
  });
}
