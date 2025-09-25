export const sampleProducts = {
  "oreo": {
    name: "Oreo Original Cookies",
    image: "/placeholder.svg",
    barcode: "8901030803987",
    brand: "Mondelez",
    category: "Biscuits & Cookies",
    healthScore: 25,
    ingredients: [
      {
        name: "Wheat Flour",
        function: "Base ingredient",
        healthEffect: "Source of carbohydrates and energy. Refined flour lacks fiber and nutrients.",
        rating: "neutral" as const,
        affectedOrgans: ["stomach", "intestines"]
      },
      {
        name: "Sugar",
        function: "Sweetener",
        healthEffect: "High sugar content can lead to blood sugar spikes, tooth decay, and weight gain. May contribute to diabetes risk.",
        rating: "harmful" as const,
        affectedOrgans: ["pancreas", "liver", "brain"]
      },
      {
        name: "Palm Oil",
        function: "Fat source",
        healthEffect: "High in saturated fats, may increase cholesterol levels and cardiovascular disease risk when consumed regularly.",
        rating: "harmful" as const,
        affectedOrgans: ["heart", "liver"]
      },
      {
        name: "Cocoa Powder",
        function: "Flavoring",
        healthEffect: "Contains antioxidants and may have mood-boosting properties. Good source of minerals like iron and magnesium.",
        rating: "beneficial" as const,
        affectedOrgans: ["brain", "heart"]
      },
      {
        name: "Glucose-Fructose Syrup",
        function: "Sweetener",
        healthEffect: "High fructose content can lead to fatty liver, insulin resistance, and metabolic syndrome.",
        rating: "harmful" as const,
        affectedOrgans: ["liver", "pancreas"]
      },
      {
        name: "Leavening Agent (E500)",
        function: "Rising agent",
        healthEffect: "Sodium bicarbonate - generally safe in small amounts but high sodium content may affect blood pressure.",
        rating: "neutral" as const,
        affectedOrgans: ["kidneys", "heart"]
      },
      {
        name: "Salt",
        function: "Flavor enhancer",
        healthEffect: "Excessive sodium intake can lead to high blood pressure, kidney strain, and fluid retention.",
        rating: "harmful" as const,
        affectedOrgans: ["kidneys", "heart"]
      },
      {
        name: "Emulsifier (E322 - Lecithin)",
        function: "Texture improver",
        healthEffect: "Generally safe, may support brain function and cholesterol metabolism.",
        rating: "neutral" as const,
        affectedOrgans: ["brain", "liver"]
      },
      {
        name: "Artificial Vanilla Flavoring",
        function: "Flavoring",
        healthEffect: "Synthetic flavoring with minimal nutritional value. Some people may be sensitive to artificial additives.",
        rating: "neutral" as const,
        affectedOrgans: ["stomach"]
      }
    ],
    nutrition: {
      calories: 478,
      fat: 20.7,
      protein: 4.7,
      carbs: 71.4,
      sugar: 37.2,
      salt: 550,
      fiber: 2.1,
      sodium: 550,
    },
    additives: [
      {
        code: "E500",
        name: "Sodium Bicarbonate",
        function: "Leavening agent",
        concern: "low" as const
      },
      {
        code: "E322",
        name: "Lecithin",
        function: "Emulsifier",
        concern: "low" as const
      }
    ],
    healthSummary: "Oreo cookies are a high-calorie, high-sugar processed food with minimal nutritional value. The combination of refined flour, palm oil, and multiple forms of sugar creates a product that can contribute to blood sugar spikes, weight gain, and increased risk of cardiovascular disease when consumed regularly. While cocoa powder provides some antioxidants, the overall nutritional profile is poor. The high sugar and sodium content particularly affect metabolic organs like the pancreas and liver, while palm oil impacts cardiovascular health.",
    healthEffects: {
      liver: { level: 'moderate' as const, description: 'Palm oil and sugar processing may stress liver function' },
      heart: { level: 'poor' as const, description: 'High saturated fat and sugar content increase cardiovascular risk' },
      digestive: { level: 'moderate' as const, description: 'Processed ingredients may affect digestive health' },
      brain: { level: 'neutral' as const, description: 'Cocoa provides some cognitive benefits but high sugar causes spikes' },
    },
    alternatives: [
      {
        name: "Parle Digestive Biscuits",
        brand: "Parle",
        healthScore: 45,
        reason: "Lower sugar content and includes digestive enzymes"
      },
      {
        name: "Britannia Nutrichoice Oats Cookies",
        brand: "Britannia",
        healthScore: 65,
        reason: "Contains oats for fiber and lower overall sugar content"
      },
      {
        name: "Sunfeast Dark Fantasy Choco Fills",
        brand: "ITC",
        healthScore: 35,
        reason: "Similar category but with real chocolate and slightly better ingredients"
      }
    ]
  },
  "maggi": {
    name: "Maggi 2-Minute Noodles Masala",
    image: "/placeholder.svg",
    barcode: "8901030800485",
    brand: "Nestle",
    category: "Instant Noodles",
    healthScore: 20,
    ingredients: [
      {
        name: "Refined Wheat Flour",
        function: "Base ingredient",
        healthEffect: "Provides carbohydrates but lacks fiber and essential nutrients. High glycemic index.",
        rating: "neutral" as const,
        affectedOrgans: ["stomach", "intestines"]
      },
      {
        name: "Palm Oil",
        function: "Frying medium",
        healthEffect: "High in saturated fats and trans fats due to processing. Increases cardiovascular disease risk.",
        rating: "harmful" as const,
        affectedOrgans: ["heart", "liver"]
      },
      {
        name: "Sodium (Salt)",
        function: "Flavor enhancer",
        healthEffect: "Extremely high sodium content (900mg per serving) can cause hypertension and kidney problems.",
        rating: "harmful" as const,
        affectedOrgans: ["kidneys", "heart"]
      },
      {
        name: "Monosodium Glutamate (MSG)",
        function: "Flavor enhancer",
        healthEffect: "Can cause headaches and nausea in sensitive individuals. Generally recognized as safe in moderate amounts.",
        rating: "neutral" as const,
        affectedOrgans: ["brain"]
      },
      {
        name: "Onion Powder",
        function: "Flavoring",
        healthEffect: "Natural flavoring with some antioxidant properties and potential cardiovascular benefits.",
        rating: "beneficial" as const,
        affectedOrgans: ["heart"]
      },
      {
        name: "Garlic Powder",
        function: "Flavoring",
        healthEffect: "Contains allicin which has antimicrobial and cardiovascular benefits.",
        rating: "beneficial" as const,
        affectedOrgans: ["heart", "liver"]
      },
      {
        name: "Artificial Colors (E102, E110)",
        function: "Coloring",
        healthEffect: "Tartrazine and Sunset Yellow may cause hyperactivity in children and allergic reactions.",
        rating: "harmful" as const,
        affectedOrgans: ["brain"]
      },
      {
        name: "Preservatives (E319, E320)",
        function: "Preservation",
        healthEffect: "TBHQ and BHA may have carcinogenic properties and can affect liver function.",
        rating: "harmful" as const,
        affectedOrgans: ["liver"]
      }
    ],
    nutrition: {
      calories: 356,
      fat: 13.8,
      protein: 9.8,
      carbs: 52.9,
      sugar: 2.1,
      salt: 900,
      fiber: 1.2,
      sodium: 900,
    },
    additives: [
      {
        code: "E102",
        name: "Tartrazine",
        function: "Yellow coloring",
        concern: "moderate" as const
      },
      {
        code: "E110",
        name: "Sunset Yellow FCF",
        function: "Orange coloring",
        concern: "moderate" as const
      },
      {
        code: "E319",
        name: "TBHQ",
        function: "Antioxidant preservative",
        concern: "high" as const
      },
      {
        code: "E320",
        name: "BHA",
        function: "Antioxidant preservative",
        concern: "high" as const
      }
    ],
    healthSummary: "Maggi instant noodles are highly processed with concerning levels of sodium, trans fats, and artificial additives. The combination of palm oil, artificial colors, and preservatives creates a product with significant health risks. The extremely high sodium content poses immediate risks for blood pressure and kidney function, while the artificial colors may affect brain function, particularly in children. The preservatives used have potential carcinogenic properties.",
    healthEffects: {
      liver: { level: 'harmful' as const, description: 'Preservatives and trans fats can damage liver function' },
      heart: { level: 'harmful' as const, description: 'Extremely high sodium and palm oil increase cardiovascular disease risk' },
      digestive: { level: 'poor' as const, description: 'Artificial additives and preservatives disrupt gut health' },
      brain: { level: 'poor' as const, description: 'Artificial colors may cause hyperactivity and cognitive issues' },
      kidneys: { level: 'harmful' as const, description: 'Excessive sodium content strains kidney function' },
    },
    alternatives: [
      {
        name: "Atta Noodles (Whole Wheat)",
        brand: "Various",
        healthScore: 55,
        reason: "Made with whole wheat flour, higher fiber content"
      },
      {
        name: "Homemade Vegetable Noodles",
        brand: "Homemade",
        healthScore: 80,
        reason: "Fresh ingredients, no artificial additives, controlled sodium"
      },
      {
        name: "Hakka Noodles with Vegetables",
        brand: "Various",
        healthScore: 60,
        reason: "Contains vegetables and can be prepared with less oil and salt"
      }
    ]
  }
};

export type ProductData = typeof sampleProducts.oreo;