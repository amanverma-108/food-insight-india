import { useState } from "react";
import { Star, Heart, AlertTriangle, Info, ChevronDown, ChevronUp, ChevronLeft, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const NUTRITION_META: Record<string, { label: string; unit: string; dailyMax: number; barColor: string }> = {
  calories: { label: "Calories", unit: "kcal", dailyMax: 2000, barColor: "bg-[hsl(0,84%,60%)]" },
  fat: { label: "Fat", unit: "g", dailyMax: 70, barColor: "bg-[hsl(0,84%,60%)]" },
  protein: { label: "Protein", unit: "g", dailyMax: 50, barColor: "bg-[hsl(145,80%,42%)]" },
  carbs: { label: "Carbohydrates", unit: "g", dailyMax: 300, barColor: "bg-[hsl(0,84%,60%)]" },
  sugar: { label: "Sugar", unit: "g", dailyMax: 30, barColor: "bg-[hsl(0,84%,60%)]" },
  salt: { label: "Salt", unit: "mg", dailyMax: 2300, barColor: "bg-[hsl(45,95%,60%)]" },
};

const getHealthScoreColor = (score: number) => {
  if (score >= 66) return "hsl(145, 80%, 42%)";
  if (score >= 41) return "hsl(45, 95%, 50%)";
  return "hsl(0, 84%, 55%)";
};

const getHealthScoreLabel = (score: number) => {
  if (score >= 66) return "Good";
  if (score >= 41) return "Average";
  return "Poor";
};

const getHealthScoreBg = (score: number) => {
  if (score >= 66) return "bg-[hsl(145,80%,42%)]";
  if (score >= 41) return "bg-[hsl(45,95%,50%)]";
  return "bg-[hsl(0,84%,55%)]";
};

const getConcernStyle = (concern: 'low' | 'moderate' | 'high') => {
  switch (concern) {
    case 'low': return { bg: "bg-[#e8f5ee]", text: "text-[#0f6e56]", dot: "bg-[#0f6e56]" };
    case 'moderate': return { bg: "bg-[#faeeda]", text: "text-[#854f0b]", dot: "bg-[#854f0b]" };
    case 'high': return { bg: "bg-[#fcebeb]", text: "text-[#a32d2d]", dot: "bg-[#a32d2d]" };
  }
};

const getAltScoreColor = (score: number) => {
  if (score >= 66) return "#1d9e75";
  if (score >= 41) return "#e8a020";
  return "#e05a3a";
};

const getAltBorderColor = (score: number) => {
  if (score >= 66) return "border-l-[#1d9e75]";
  if (score >= 41) return "border-l-[#e8a020]";
  return "border-l-[#e05a3a]";
};

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

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button
            variant="outline"
            onClick={onBack}
            className="mb-4 rounded-full border px-5 py-2 hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Search
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
          <Badge variant="secondary" className="mt-2">{product.category}</Badge>
        </div>

        <Card className={`${getHealthScoreBg(product.healthScore)} text-white border-0 shadow-health`}>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{product.healthScore}</div>
            <div className="text-sm opacity-90">Health Score</div>
            <div className="text-xs opacity-80 mt-1">
              {getHealthScoreLabel(product.healthScore)} · out of 100
            </div>
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
            className={activeTab === key ? "bg-primary border-0" : ""}
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
              <CardDescription className="text-xs">AI-generated based on ingredient analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{product.healthSummary}</p>
            </CardContent>
          </Card>

          {/* Nutrition Facts */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('nutrition')}>
              <CardTitle className="flex items-center justify-between">
                <span>
                  Nutrition Facts{" "}
                  <span className="text-xs font-normal text-muted-foreground ml-2">per 100 g</span>
                </span>
                {expandedSections.includes('nutrition') ? <ChevronUp /> : <ChevronDown />}
              </CardTitle>
              <CardDescription className="text-xs">Compared to recommended daily intake</CardDescription>
            </CardHeader>
            {expandedSections.includes('nutrition') && (
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(product.nutrition).map(([key, value]) => {
                    const meta = NUTRITION_META[key];
                    const pct = Math.min((value / meta.dailyMax) * 100, 100);
                    return (
                      <div key={key} className="text-center p-3 bg-muted rounded-lg overflow-hidden relative">
                        <div className="text-2xl font-bold text-primary">
                          {value}
                          <span className="text-xs font-normal text-muted-foreground ml-0.5">{meta.unit}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{meta.label}</div>
                        <div className="mt-2 h-1 w-full rounded-full bg-border overflow-hidden">
                          <div className={`h-full rounded-full ${meta.barColor}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
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
              <CardDescription className="text-xs">Identified additives and safety ratings</CardDescription>
            </CardHeader>
            {expandedSections.includes('additives') && (
              <CardContent>
                <div className="space-y-3">
                  {product.additives.map((additive, index) => {
                    const style = getConcernStyle(additive.concern);
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                          <div>
                            <div className="font-medium">{additive.code} - {additive.name}</div>
                            <div className="text-sm text-muted-foreground">{additive.function}</div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text}`}>
                          {additive.concern} concern
                        </span>
                      </div>
                    );
                  })}
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
          {product.alternatives.map((alt, index) => {
            const color = getAltScoreColor(alt.healthScore);
            const label = getHealthScoreLabel(alt.healthScore);
            return (
              <Card key={index} className={`hover:shadow-health transition-all duration-300 border-l-4 ${getAltBorderColor(alt.healthScore)}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{alt.name}</div>
                    <div className="text-sm text-muted-foreground">{alt.reason}</div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="text-2xl font-bold" style={{ color }}>
                      {alt.healthScore}
                    </div>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: `${color}18`, color }}
                    >
                      {label}
                    </span>
                    <div className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <ArrowUp className="h-3 w-3" />
                      Health Score
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export type { ProductData };
