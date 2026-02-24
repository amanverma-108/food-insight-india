import { ScanLine, ListChecks, Leaf } from "lucide-react";

const steps = [
  { icon: ScanLine, label: "Enter or Scan Product", step: 1 },
  { icon: ListChecks, label: "View Ingredients & Effects", step: 2 },
  { icon: Leaf, label: "Discover Healthier Alternatives", step: 3 },
];

export const HowItWorksSection = () => (
  <section className="px-4 py-16 md:py-24 bg-muted/40">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground">
        How It <span className="text-primary">Works</span>
      </h2>

      <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4">
        {steps.map((s, i) => (
          <div key={s.step} className="flex items-center gap-4 md:gap-0 md:flex-col">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <s.icon className="h-8 w-8" />
              </div>
              <span className="mt-3 text-xs font-bold text-primary">
                STEP {s.step}
              </span>
              <span className="mt-1 text-sm font-medium text-foreground text-center max-w-[140px]">
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="hidden md:block w-20 h-0.5 bg-border mx-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);
