import { useState } from "react";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Ingredient {
  name: string;
  function: string;
  healthEffect: string;
  rating: 'beneficial' | 'neutral' | 'harmful';
  affectedOrgans: string[];
}

interface BodyVisualizationProps {
  ingredients: Ingredient[];
}

interface OrganData {
  name: string;
  position: { x: number; y: number };
  labelOffset: { dx: number; dy: number };
  ingredients: Array<{
    name: string;
    effect: string;
    rating: 'beneficial' | 'neutral' | 'harmful';
  }>;
}

export const BodyVisualization = ({ ingredients }: BodyVisualizationProps) => {
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);

  const organData: { [key: string]: OrganData } = {
    brain: {
      name: "Brain",
      position: { x: 50, y: 12 },
      labelOffset: { dx: 0, dy: -7 },
      ingredients: []
    },
    heart: {
      name: "Heart",
      position: { x: 42, y: 33 },
      labelOffset: { dx: -12, dy: 0 },
      ingredients: []
    },
    liver: {
      name: "Liver",
      position: { x: 60, y: 38 },
      labelOffset: { dx: 12, dy: 0 },
      ingredients: []
    },
    stomach: {
      name: "Stomach",
      position: { x: 42, y: 45 },
      labelOffset: { dx: -13, dy: 0 },
      ingredients: []
    },
    pancreas: {
      name: "Pancreas",
      position: { x: 50, y: 50 },
      labelOffset: { dx: 0, dy: 5 },
      ingredients: []
    },
    kidneys: {
      name: "Kidneys",
      position: { x: 60, y: 52 },
      labelOffset: { dx: 12, dy: 0 },
      ingredients: []
    },
    intestines: {
      name: "Intestines",
      position: { x: 50, y: 62 },
      labelOffset: { dx: 0, dy: 6 },
      ingredients: []
    }
  };

  ingredients.forEach(ingredient => {
    ingredient.affectedOrgans.forEach(organName => {
      const organKey = organName.toLowerCase();
      if (organData[organKey]) {
        organData[organKey].ingredients.push({
          name: ingredient.name,
          effect: ingredient.healthEffect,
          rating: ingredient.rating
        });
      }
    });
  });

  const getOrganColor = (organ: OrganData) => {
    if (organ.ingredients.length === 0) return '#e5e7eb';
    const harmfulCount = organ.ingredients.filter(i => i.rating === 'harmful').length;
    const beneficialCount = organ.ingredients.filter(i => i.rating === 'beneficial').length;
    if (harmfulCount > beneficialCount) return '#ef4444';
    if (beneficialCount > harmfulCount) return '#10b981';
    return '#f59e0b';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Interactive Body Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg p-4 min-h-[500px]">
            <svg viewBox="0 0 100 80" className="w-full h-full max-h-[460px] mx-auto">
              {/* Body silhouette */}
              <ellipse cx="50" cy="12" rx="8" ry="9" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="0.4" />
              <rect x="43" y="20" width="14" height="4" rx="2" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="0.3" />
              <ellipse cx="50" cy="40" rx="14" ry="18" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="0.4" />
              <ellipse cx="50" cy="68" rx="6" ry="10" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="0.3" />
              <ellipse cx="42" cy="68" rx="5" ry="10" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="0.3" />
              <ellipse cx="58" cy="68" rx="5" ry="10" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="0.3" />

              {Object.entries(organData).map(([key, organ]) => {
                const isSelected = selectedOrgan === key;
                return (
                  <g key={key} className="cursor-pointer" onClick={() => setSelectedOrgan(selectedOrgan === key ? null : key)}>
                    <circle
                      cx={organ.position.x}
                      cy={organ.position.y}
                      r={isSelected ? 4.5 : 3.5}
                      fill={getOrganColor(organ)}
                      stroke={isSelected ? "#fff" : "rgba(255,255,255,0.6)"}
                      strokeWidth={isSelected ? 1 : 0.5}
                      style={{ transition: "r 0.2s, stroke-width 0.2s" }}
                    />
                    <text
                      x={organ.position.x + organ.labelOffset.dx}
                      y={organ.position.y + organ.labelOffset.dy}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-foreground pointer-events-none select-none"
                      style={{ fontSize: '2.8px', fontWeight: isSelected ? 700 : 500 }}
                    >
                      {organ.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="flex justify-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(145,80%,42%)]" />
                <span className="text-xs">Beneficial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(45,95%,60%)]" />
                <span className="text-xs">Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(0,84%,60%)]" />
                <span className="text-xs">Harmful</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedOrgan ? organData[selectedOrgan]?.name : 'Select an Organ'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedOrgan && organData[selectedOrgan] ? (
            <div className="space-y-4">
              {organData[selectedOrgan].ingredients.length > 0 ? (
                organData[selectedOrgan].ingredients.map((ingredient, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{ingredient.name}</h4>
                      <Badge
                        className={
                          ingredient.rating === 'beneficial' ? 'bg-[hsl(145,80%,42%)] text-white' :
                          ingredient.rating === 'harmful' ? 'bg-[hsl(0,84%,60%)] text-white' :
                          'bg-[hsl(45,95%,60%)] text-foreground'
                        }
                      >
                        {ingredient.rating}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{ingredient.effect}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No ingredients affect this organ.</p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Click on an organ in the body diagram to see how ingredients affect it.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
