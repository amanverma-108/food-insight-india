import { useState } from "react";
import { Star, Heart, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BodyVisualization } from "./BodyVisualization";
import { IngredientTable } from "./IngredientTable";

interface ProductData {
  name: string;
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
  };
  additives: Array<{
    code: string;
    name: string;
    function: string;
    concern: 'low' | 'moderate' | 'high';
  }>;
  healthSummary: string;
  alternatives: Array<{
    name: string;
    healthScore: number;
    reason: string;
  }>;
}

interface ProductAnalysisProps {
  product: ProductData;
  onBack: () => void;
}

export const ProductAnalysis = ({ product, onBack }: ProductAnalysisProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'body' | 'alternatives'>('overview');
  const [expandedSections, setExpandedSections] = useState<string[]>(['nutrition']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'health-excellent';
    if (score >= 60) return 'health-good';
    if (score >= 40) return 'health-moderate';
    if (score >= 20) return 'health-poor';
    return 'health-harmful';
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 60) return 'bg-gradient-health';
    if (score >= 40) return 'bg-gradient-warning';
    return 'bg-gradient-danger';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Back to Search
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
          <Badge variant="secondary" className="mt-2">{product.category}</Badge>
        </div>
        
        <Card className={`${getHealthScoreBg(product.healthScore)} text-white border-0 shadow-health`}>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{product.healthScore}</div>
            <div className="text-sm opacity-90">Health Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b">
        {[
          { key: 'overview', label: 'Overview', icon: Info },
          { key: 'ingredients', label: 'Ingredients', icon: Star },
          { key: 'body', label: 'Body Effects', icon: Heart },
          { key: 'alternatives', label: 'Alternatives', icon: AlertTriangle }
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={activeTab === key ? "default" : "outline"}
            onClick={() => setActiveTab(key as any)}
            className={activeTab === key ? "bg-gradient-health border-0" : ""}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </Button>
        ))}
      </div>

      {/* Content Sections */}
      {activeTab === 'overview' && (
        <div className="grid gap-6">
          {/* Health Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Health Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{product.healthSummary}</p>
            </CardContent>
          </Card>

          {/* Nutrition Facts */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('nutrition')}>
              <CardTitle className="flex items-center justify-between">
                Nutrition Facts (per 100g)
                {expandedSections.includes('nutrition') ? <ChevronUp /> : <ChevronDown />}
              </CardTitle>
            </CardHeader>
            {expandedSections.includes('nutrition') && (
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(product.nutrition).map(([key, value]) => (
                    <div key={key} className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{value}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {key === 'carbs' ? 'Carbs' : key}
                        {key === 'calories' ? '' : key === 'protein' || key === 'fat' || key === 'carbs' || key === 'sugar' ? 'g' : key === 'salt' ? 'mg' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Additives */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('additives')}>
              <CardTitle className="flex items-center justify-between">
                Additives & E-Codes
                {expandedSections.includes('additives') ? <ChevronUp /> : <ChevronDown />}
              </CardTitle>
            </CardHeader>
            {expandedSections.includes('additives') && (
              <CardContent>
                <div className="space-y-3">
                  {product.additives.map((additive, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">{additive.code} - {additive.name}</div>
                        <div className="text-sm text-muted-foreground">{additive.function}</div>
                      </div>
                      <Badge 
                        variant={
                          additive.concern === 'high' ? 'destructive' : 
                          additive.concern === 'moderate' ? 'default' : 
                          'secondary'
                        }
                      >
                        {additive.concern} concern
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'ingredients' && (
        <IngredientTable ingredients={product.ingredients} />
      )}

      {activeTab === 'body' && (
        <BodyVisualization ingredients={product.ingredients} />
      )}

      {activeTab === 'alternatives' && (
        <div className="grid gap-4">
          <h3 className="text-xl font-semibold">Healthier Alternatives</h3>
          {product.alternatives.map((alt, index) => (
            <Card key={index} className="hover:shadow-health transition-all duration-300">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">{alt.name}</div>
                  <div className="text-sm text-muted-foreground">{alt.reason}</div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold text-${getHealthScoreColor(alt.healthScore)}`}>
                    {alt.healthScore}
                  </div>
                  <div className="text-sm text-muted-foreground">Health Score</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export type { ProductData };