import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BodyVisualization } from "./BodyVisualization";
import { IngredientTable } from "./IngredientTable";

export interface ProductData {
  name: string;
  image: string;
  barcode?: string;
  brand: string;
  category: string;
  healthScore: number;
  ingredients: Array<{
    name: string;
    function: string;
    healthEffect: string;
    rating: 'beneficial' | 'neutral' | 'harmful';
    affectedOrgans: string[];
  }>;
  nutrition: {
    calories: number;
    fat: number;
    protein: number;
    carbs: number;
    sugar: number;
    salt: number;
    fiber: number;
    sodium: number;
  };
  additives: Array<{
    code: string;
    name: string;
    function: string;
    concern: 'low' | 'moderate' | 'high';
  }>;
  healthEffects: {
    [organ: string]: {
      level: 'beneficial' | 'neutral' | 'moderate' | 'poor' | 'harmful';
      description: string;
    };
  };
  alternatives: Array<{
    name: string;
    brand: string;
    healthScore: number;
    reason: string;
  }>;
}

interface ProductAnalysisProps {
  product: ProductData;
  onBack: () => void;
}

export const ProductAnalysis = ({ product, onBack }: ProductAnalysisProps) => {
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'bg-health-excellent';
    if (score >= 60) return 'bg-health-good';
    if (score >= 40) return 'bg-health-moderate';
    if (score >= 20) return 'bg-health-poor';
    return 'bg-health-harmful';
  };

  const alternatives = [
    {
      name: "Britannia Marie Gold",
      brand: "Britannia",
      healthScore: 75,
      reason: "Lower sugar content and added vitamins"
    },
    {
      name: "Parle-G Gold",
      brand: "Parle",
      healthScore: 70,
      reason: "Fortified with iron and vitamins"
    },
    {
      name: "Sunfeast Farmlite Digestive",
      brand: "ITC",
      healthScore: 80,
      reason: "High fiber content and no artificial colors"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto px-4 py-8">
        <Button 
          onClick={onBack}
          variant="outline"
          className="mb-6 hover:border-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        {/* Product Header with Image */}
        <Card className="mb-8 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-48 h-48 flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <p className="text-lg text-muted-foreground mb-4">{product.brand}</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${getHealthScoreColor(product.healthScore)}`}></div>
                    <span className="font-medium">Health Score: {product.healthScore}/100</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Category: {product.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Barcode:</span>
                  <span className="text-sm font-mono">{product.barcode || 'Not available'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">
              Nutrition <span className="brand-highlight">Facts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{product.nutrition.calories}</div>
                <div className="text-sm text-muted-foreground">Calories</div>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{product.nutrition.protein}g</div>
                <div className="text-sm text-muted-foreground">Protein</div>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{product.nutrition.carbs}g</div>
                <div className="text-sm text-muted-foreground">Carbs</div>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{product.nutrition.fat}g</div>
                <div className="text-sm text-muted-foreground">Fat</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Ingredient Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">
              Ingredient <span className="brand-highlight">Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <IngredientTable ingredients={product.ingredients} />
          </CardContent>
        </Card>

        {/* Additives Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Additives & E-Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {product.additives.map((additive, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="font-medium">{additive.code} - {additive.name}</div>
                    <div className="text-sm text-muted-foreground">{additive.function}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    additive.concern === 'high' ? 'bg-red-100 text-red-800' :
                    additive.concern === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {additive.concern} concern
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Body Effects Visualization */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">
              Effects on <span className="brand-highlight">Body</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BodyVisualization ingredients={product.ingredients} />
          </CardContent>
        </Card>

        {/* Healthier Alternatives */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Healthier <span className="brand-highlight">Alternatives</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alternatives.map((alt, index) => (
                <div key={index} className="p-4 border rounded-lg hover:shadow-health transition-shadow">
                  <h4 className="font-semibold mb-2">{alt.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{alt.brand}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getHealthScoreColor(alt.healthScore)}`}></div>
                    <span className="text-sm font-medium">Score: {alt.healthScore}/100</span>
                  </div>
                  <p className="text-sm text-green-600">{alt.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};