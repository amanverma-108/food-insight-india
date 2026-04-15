import { useState } from "react";
import { Star, Heart, AlertTriangle, Info, ChevronDown, ChevronUp, ChevronLeft, ArrowUp, ShieldCheck, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BodyVisualization } from "./BodyVisualization";
import { IngredientTable } from "./IngredientTable";

interface ThresholdWarningData {
  nutrient: string;
  value: number;
  unit: string;
  level: 'high' | 'very_high' | 'low';
  message: string;
  whoGuideline: string;
  percentOfDaily: number;
}

interface ProductData {
  name: string;
  category: string;
  healthScore: number;
  brand?: string;
  offVerified?: boolean;
  nutritionSource?: 'open_food_facts' | 'ai_estimated';
  novaGroup?: number | null;
  nutriscoreGrade?: string;
  keyConcerns?: string[];
  consumptionAdvice?: string;
  thresholdWarnings?: ThresholdWarningData[];
  ingredients: Array<{
    name: string;
    function: string;
    healthEffect: string;
    rating: 'beneficial' | 'neutral' | 'harmful';
    affectedOrgans: string[];
    concernLevel?: string;
    dailyLimitContext?: string;
  }>;
  nutrition: {
    calories: number;
    fat: number;
    saturatedFat?: number;
    transFat?: number;
    protein: number;
    carbs: number;
    sugar: number;
    addedSugar?: number;
    salt: number;
    sodium?: number;
    fiber?: number;
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
    whatIsBetter?: string[];
  }>;
}

interface ProductAnalysisProps {
  product: ProductData;
  onBack: () => void;
  onAlternativeClick?: (name: string) => void;
}

const NUTRITION_META: Record<string, { label: string; unit: string; dailyMax: number; barColor: string }> = {
  calories:     { label: "Calories",       unit: "kcal", dailyMax: 2000, barColor: "bg-[hsl(0,84%,60%)]" },
  fat:          { label: "Total Fat",      unit: "g",    dailyMax: 70,   barColor: "bg-[hsl(0,84%,60%)]" },
  saturatedFat: { label: "Saturated Fat",  unit: "g",    dailyMax: 20,   barColor: "bg-[hsl(0,84%,60%)]" },
  transFat:     { label: "Trans Fat",      unit: "g",    dailyMax: 2,    barColor: "bg-[hsl(0,84%,60%)]" },
  carbs:        { label: "Carbohydrates",  unit: "g",    dailyMax: 300,  barColor: "bg-[hsl(45,95%,60%)]" },
  sugar:        { label: "Total Sugars",   unit: "g",    dailyMax: 50,   barColor: "bg-[hsl(0,84%,60%)]" },
  addedSugar:   { label: "Added Sugars",   unit: "g",    dailyMax: 25,   barColor: "bg-[hsl(0,84%,60%)]" },
  protein:      { label: "Protein",        unit: "g",    dailyMax: 50,   barColor: "bg-[hsl(145,80%,42%)]" },
  sodium:       { label: "Sodium",         unit: "mg",   dailyMax: 2000, barColor: "bg-[hsl(45,95%,60%)]" },
  fiber:        { label: "Dietary Fiber",  unit: "g",    dailyMax: 25,   barColor: "bg-[hsl(145,80%,42%)]" },
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

export const ProductAnalysis = ({ product, onBack, onAlternativeClick }: ProductAnalysisProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'body' | 'alternatives'>('overview');
  const [expandedSections, setExpandedSections] = useState<string[]>(['nutrition']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  // Build nutrition entries for display
  const nutritionEntries = Object.entries(NUTRITION_META)
    .map(([key, meta]) => {
      const value = (product.nutrition as any)[key];
      if (value === undefined || value === null) return null;
      return { key, value, meta };
    })
    .filter(Boolean) as Array<{ key: string; value: number; meta: typeof NUTRITION_META[string] }>;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button variant="outline" onClick={onBack} className="mb-4 rounded-full border px-5 py-2 hover:bg-muted transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Search
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="secondary">{product.category}</Badge>
            {product.novaGroup && (
              <Badge variant="outline" className={
                product.novaGroup >= 4 ? "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]" :
                product.novaGroup === 3 ? "bg-[#fffbeb] text-[#92400e] border-[#fde68a]" :
                "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]"
              }>
                NOVA {product.novaGroup} · {
                  product.novaGroup === 1 ? 'Unprocessed' :
                  product.novaGroup === 2 ? 'Processed ingredient' :
                  product.novaGroup === 3 ? 'Processed food' : 'Ultra-processed'
                }
              </Badge>
            )}
          </div>
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
              <CardDescription className="text-xs">
                {product.offVerified ? "Based on verified product label data" : "AI-generated based on ingredient analysis"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{product.healthSummary}</p>
              {/* Key concerns */}
              {product.keyConcerns && product.keyConcerns.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {product.keyConcerns.map((concern, i) => (
                    <span key={i} className="text-[11px] px-2.5 py-1 bg-[#fef2f2] text-[#991b1b] rounded-full border border-[#fecaca]">
                      {concern}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Threshold Warnings */}
          {product.thresholdWarnings && product.thresholdWarnings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#e05a3a]">
                  <AlertTriangle className="h-5 w-5" />
                  Nutritional Concerns
                </CardTitle>
                <CardDescription className="text-xs">Based on WHO / FSSAI daily safe limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {product.thresholdWarnings.map((w, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-3 border-l-4 ${
                      w.level === 'very_high' ? 'bg-[#fef2f2] border-l-[#e05a3a]' :
                      w.level === 'high' ? 'bg-[#fffbeb] border-l-[#e8a020]' :
                      'bg-[#eff6ff] border-l-[#378add]'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-medium ${
                        w.level === 'very_high' ? 'text-[#991b1b]' :
                        w.level === 'high' ? 'text-[#92400e]' : 'text-[#1e40af]'
                      }`}>
                        {w.nutrient}
                        <span className="ml-2 text-xs font-normal opacity-80">
                          {w.value}{w.unit} per 100g
                        </span>
                      </span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        w.level === 'very_high' ? 'bg-[#fee2e2] text-[#991b1b]' : 'bg-[#fef3c7] text-[#92400e]'
                      }`}>
                        {w.percentOfDaily}% of daily limit
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${
                      w.level === 'very_high' ? 'text-[#7f1d1d]' : 'text-[#78350f]'
                    }`}>
                      {w.message}
                    </p>
                    <p className="text-[11px] mt-1 text-muted-foreground italic">{w.whoGuideline}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Nutrition Facts */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('nutrition')}>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>Nutrition Facts</span>
                  <span className="text-xs font-normal text-muted-foreground">per 100 g</span>
                  {product.offVerified ? (
                    <Badge variant="outline" className="bg-[#f0fdf4] text-[#166534] border-[#bbf7d0] text-[10px]">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Verified from label
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-[#fffbeb] text-[#92400e] border-[#fde68a] text-[10px]">
                      <ShieldAlert className="h-3 w-3 mr-1" /> AI estimated
                    </Badge>
                  )}
                </div>
                {expandedSections.includes('nutrition') ? <ChevronUp /> : <ChevronDown />}
              </CardTitle>
              <CardDescription className="text-xs">Compared to recommended daily intake</CardDescription>
            </CardHeader>
            {expandedSections.includes('nutrition') && (
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {nutritionEntries.map(({ key, value, meta }) => {
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
                        <div className="text-[10px] text-muted-foreground mt-1">{Math.round(pct)}% daily</div>
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

          {/* Consumption Advice */}
          {product.consumptionAdvice && (
            <Card className="bg-[#f0fdf4] border-[#bbf7d0]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">💡</span>
                  <span className="text-sm font-medium text-[#166534]">Consumption Advice</span>
                </div>
                <p className="text-sm text-[#14532d] leading-relaxed">{product.consumptionAdvice}</p>
              </CardContent>
            </Card>
          )}
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
          <p className="text-xs text-muted-foreground -mt-2">Click any alternative to see its full analysis</p>
          {product.alternatives.map((alt, index) => {
            const color = getAltScoreColor(alt.healthScore);
            const label = getHealthScoreLabel(alt.healthScore);
            return (
              <Card
                key={index}
                className={`hover:shadow-health transition-all duration-300 border-l-4 ${getAltBorderColor(alt.healthScore)} cursor-pointer hover:border-primary hover:-translate-y-0.5`}
                onClick={() => onAlternativeClick?.(alt.name)}
              >
                <CardContent className="p-4 flex items-center justify-between relative">
                  <div className="pr-8 flex-1">
                    <div className="font-semibold text-lg">{alt.name}</div>
                    <div className="text-sm text-muted-foreground">{alt.reason}</div>
                    {/* What is better */}
                    {alt.whatIsBetter && alt.whatIsBetter.length > 0 && (
                      <div className="mt-2 space-y-0.5">
                        {alt.whatIsBetter.map((item, j) => (
                          <div key={j} className="text-xs text-[#166534] flex items-center gap-1">
                            <ArrowUp className="h-3 w-3 text-primary" /> {item}
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="inline-block mt-2 text-[10px] text-primary opacity-70">
                      Tap to analyse →
                    </span>
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
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-40 text-lg">→</div>
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
