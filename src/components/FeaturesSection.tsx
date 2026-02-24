import { FlaskConical, HeartPulse, ArrowRightLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: FlaskConical,
    title: "Ingredient Breakdown",
    description:
      "Decode every ingredient, additive, and E-code in your packaged food with clear health ratings.",
  },
  {
    icon: HeartPulse,
    title: "Health Impact Analysis",
    description:
      "Visualize how each ingredient affects your body organs with an interactive body diagram.",
  },
  {
    icon: ArrowRightLeft,
    title: "Better Alternatives",
    description:
      "Compare products side-by-side and discover healthier alternatives in the same category.",
  },
];

export const FeaturesSection = () => (
  <section className="px-4 py-16 md:py-24">
    <div className="max-w-5xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground">
        Premium <span className="text-primary">Features</span>
      </h2>
      <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
        Everything you need to make informed food choices, powered by data and AI.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {features.map((f) => (
          <Card
            key={f.title}
            className="group border-2 border-border hover:border-primary/40 transition-all duration-300 hover:shadow-health hover:-translate-y-1"
          >
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <f.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);
