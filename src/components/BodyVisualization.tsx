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
  ingredients: Array<{
    name: string;
    effect: string;
    rating: 'beneficial' | 'neutral' | 'harmful';
  }>;
}

export const BodyVisualization = ({ ingredients }: BodyVisualizationProps) => {
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);

  // Map ingredients to organs
  const organData: { [key: string]: OrganData } = {
    brain: {
      name: "Brain",
      position: { x: 50, y: 15 },
      ingredients: []
    },
    heart: {
      name: "Heart",
      position: { x: 45, y: 35 },
      ingredients: []
    },
    liver: {
      name: "Liver",
      position: { x: 60, y: 40 },
      ingredients: []
    },
    kidneys: {
      name: "Kidneys",
      position: { x: 55, y: 50 },
      ingredients: []
    },
    pancreas: {
      name: "Pancreas",
      position: { x: 50, y: 45 },
      ingredients: []
    },
    stomach: {
      name: "Stomach",
      position: { x: 48, y: 42 },
      ingredients: []
    },
    intestines: {
      name: "Intestines",
      position: { x: 50, y: 55 },
      ingredients: []
    }
  };

  // Populate organ data with ingredients
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
    if (organ.ingredients.length === 0) return '#e5e7eb'; // neutral gray
    
    const harmfulCount = organ.ingredients.filter(i => i.rating === 'harmful').length;
    const beneficialCount = organ.ingredients.filter(i => i.rating === 'beneficial').length;
    
    if (harmfulCount > beneficialCount) return '#ef4444'; // red
    if (beneficialCount > harmfulCount) return '#10b981'; // green
    return '#f59e0b'; // yellow
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Body Diagram */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Interactive Body Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg p-8 min-h-[500px]">
            {/* Simple Body SVG */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full max-h-[500px] mx-auto"
            >
              {/* Body outline */}
              <ellipse cx="50" cy="85" rx="15" ry="12" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="0.5" />
              <ellipse cx="50" cy="65" rx="18" ry="15" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="0.5" />
              <ellipse cx="50" cy="45" rx="16" ry="18" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="0.5" />
              <circle cx="50" cy="15" r="12" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="0.5" />
              
              {/* Organs */}
              {Object.entries(organData).map(([key, organ]) => (
                <g key={key}>
                  <circle
                    cx={organ.position.x}
                    cy={organ.position.y}
                    r="4"
                    fill={getOrganColor(organ)}
                    stroke="#ffffff"
                    strokeWidth="0.5"
                    className="cursor-pointer hover:r-5 transition-all duration-200"
                    onClick={() => setSelectedOrgan(selectedOrgan === key ? null : key)}
                  />
                  <text
                    x={organ.position.x}
                    y={organ.position.y - 6}
                    textAnchor="middle"
                    className="text-xs fill-current text-foreground font-medium"
                    style={{ fontSize: '2px' }}
                  >
                    {organ.name}
                  </text>
                </g>
              ))}
            </svg>
            
            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-effect-beneficial"></div>
                <span className="text-xs">Beneficial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-effect-neutral"></div>
                <span className="text-xs">Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-effect-harmful"></div>
                <span className="text-xs">Harmful</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organ Details */}
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
                          ingredient.rating === 'beneficial' ? 'bg-effect-beneficial text-white' :
                          ingredient.rating === 'harmful' ? 'bg-effect-harmful text-white' :
                          'bg-effect-neutral text-foreground'
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