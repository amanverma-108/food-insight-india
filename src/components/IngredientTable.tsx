import { CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Ingredient {
  name: string;
  function: string;
  healthEffect: string;
  rating: 'beneficial' | 'neutral' | 'harmful';
  affectedOrgans: string[];
}

interface IngredientTableProps {
  ingredients: Ingredient[];
}

export const IngredientTable = ({ ingredients }: IngredientTableProps) => {
  const getRatingIcon = (rating: 'beneficial' | 'neutral' | 'harmful') => {
    switch (rating) {
      case 'beneficial':
        return <CheckCircle className="h-5 w-5 text-effect-beneficial" />;
      case 'neutral':
        return <AlertCircle className="h-5 w-5 text-effect-neutral" />;
      case 'harmful':
        return <XCircle className="h-5 w-5 text-effect-harmful" />;
    }
  };

  const getRatingBadge = (rating: 'beneficial' | 'neutral' | 'harmful') => {
    const variants = {
      beneficial: 'bg-effect-beneficial text-white',
      neutral: 'bg-effect-neutral text-foreground',
      harmful: 'bg-effect-harmful text-white'
    };
    
    return (
      <Badge className={variants[rating]}>
        {rating.charAt(0).toUpperCase() + rating.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Ingredient Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold">Ingredient</th>
                <th className="text-left p-3 font-semibold">Function</th>
                <th className="text-left p-3 font-semibold">Health Effects</th>
                <th className="text-left p-3 font-semibold">Rating</th>
                <th className="text-left p-3 font-semibold">Affected Organs</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient, index) => (
                <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {getRatingIcon(ingredient.rating)}
                      <span className="font-medium">{ingredient.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {ingredient.function}
                  </td>
                  <td className="p-3 text-sm max-w-xs">
                    {ingredient.healthEffect}
                  </td>
                  <td className="p-3">
                    {getRatingBadge(ingredient.rating)}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {ingredient.affectedOrgans.map((organ, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {organ}
                        </Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};