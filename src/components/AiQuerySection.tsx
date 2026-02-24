import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Message {
  role: "user" | "ai";
  text: string;
}

const foodKeywords = [
  "sugar", "salt", "fat", "oil", "palm", "protein", "carb", "fiber", "vitamin",
  "mineral", "calorie", "sodium", "cholesterol", "trans", "saturated", "msg",
  "preservative", "additive", "emulsifier", "colorant", "sweetener", "aspartame",
  "caffeine", "gluten", "lactose", "organic", "processed", "ingredient", "nutrition",
  "health", "food", "eat", "diet", "snack", "biscuit", "noodle", "drink", "beverage",
  "cereal", "bread", "milk", "cheese", "butter", "cream", "chocolate", "candy",
  "chip", "cookie", "oreo", "maggi", "maida", "atta", "ghee", "paneer",
  "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "tartrazine", "tbhq",
  "bha", "bht", "lecithin", "guar", "xanthan", "citric", "acetic", "benzoate",
  "sorbate", "nitrate", "nitrite", "sulfite", "carrageenan", "pectin",
  "alternative", "safer", "healthy", "unhealthy", "harmful", "beneficial", "risk",
  "cancer", "diabetes", "heart", "liver", "kidney", "obesity", "allergy",
];

const isFoodRelated = (query: string): boolean => {
  const lower = query.toLowerCase();
  return foodKeywords.some((kw) => lower.includes(kw));
};

const OFF_TOPIC_RESPONSE =
  "🚫 I'm **FoodInsight AI**, and I specialize exclusively in food products, ingredients, additives, nutrition, and health effects.\n\nI can't help with that topic, but feel free to ask me things like:\n- *\"Is palm oil harmful?\"*\n- *\"What does E102 do?\"*\n- *\"What are healthier alternatives to Maggi?\"*";

const sampleResponses: Record<string, string> = {
  sugar:
    "**🔬 Ingredient Overview**\nSugar (sucrose) is a simple carbohydrate used as a sweetener in most packaged foods. It appears under many names: dextrose, maltose, high-fructose corn syrup, and invert sugar.\n\n**⚠️ Health Impact**\nExcessive intake is linked to obesity, type 2 diabetes, tooth decay, fatty liver disease, and chronic inflammation. The WHO recommends limiting added sugars to <10% of daily calories (~25g).\n\n**🔴 Risk Level: High** (when consumed in excess)\n\n**✅ Safer Alternatives**\n- **Jaggery** – contains iron and minerals (use sparingly)\n- **Stevia** – zero-calorie natural sweetener\n- **Dates/fruit purée** – natural sweetness with fiber",
  "palm oil":
    "**🔬 Ingredient Overview**\nPalm oil is a vegetable oil high in saturated fat, widely used in Indian snacks and packaged foods for its low cost and heat stability.\n\n**⚠️ Health Impact**\nRaises LDL (bad) cholesterol, increasing cardiovascular disease risk. Refined palm oil loses most antioxidants. Also linked to environmental concerns (deforestation).\n\n**🔴 Risk Level: Moderate–High** (with regular consumption)\n\n**✅ Safer Alternatives**\n- **Rice bran oil** – balanced fatty acid profile\n- **Sunflower oil** – lower in saturated fat\n- **Mustard oil** – traditional, heart-healthy option",
  msg:
    "**🔬 Ingredient Overview**\nMonosodium Glutamate (MSG / E621) is a flavor enhancer that adds umami taste. Commonly found in instant noodles, chips, and Chinese food.\n\n**⚠️ Health Impact**\nGenerally recognized as safe (GRAS) by FDA. Some sensitive individuals may experience headaches, flushing, or nausea (\"Chinese Restaurant Syndrome\"). No strong evidence of long-term harm in moderate amounts.\n\n**🟡 Risk Level: Low–Moderate**\n\n**✅ Safer Alternatives**\n- **Nutritional yeast** – natural umami flavor\n- **Mushroom powder** – rich umami without additives\n- **Tamari/soy sauce** – natural fermented flavor",
  tartrazine:
    "**🔬 Ingredient Overview**\nTartrazine (E102) is a synthetic yellow azo dye used in snacks, drinks, sweets, and instant noodles to add bright color.\n\n**⚠️ Health Impact**\nLinked to hyperactivity in children, allergic reactions (especially in aspirin-sensitive individuals), and potential attention disorders. Banned or restricted in several European countries.\n\n**🔴 Risk Level: Moderate–High** (especially for children)\n\n**✅ Safer Alternatives**\n- **Turmeric extract** – natural yellow color with anti-inflammatory benefits\n- **Beta-carotene** – natural orange-yellow pigment\n- Products labeled \"No artificial colors\"",
  maida:
    "**🔬 Ingredient Overview**\nMaida (refined wheat flour) is stripped of bran and germ, leaving mainly starch. It's the base of most Indian packaged biscuits, breads, and noodles.\n\n**⚠️ Health Impact**\nHigh glycemic index causes rapid blood sugar spikes. Lacks fiber, vitamins, and minerals. Regular consumption linked to insulin resistance, weight gain, and digestive issues.\n\n**🟡 Risk Level: Moderate**\n\n**✅ Safer Alternatives**\n- **Whole wheat atta** – retains fiber and nutrients\n- **Ragi (finger millet) flour** – high in calcium and fiber\n- **Multigrain flour** – balanced nutrition profile",
  default:
    "**🔬 Ingredient Overview**\nGreat question! Here's some general guidance on evaluating packaged food products.\n\n**⚠️ Health Impact**\nAlways check for excessive sugar (>10g/serving), sodium (>400mg/serving), and trans fats (any amount). Prefer products with shorter, recognizable ingredient lists. Whole-grain and high-fiber options are generally better.\n\n**🟡 Risk Level: Varies by product**\n\n**✅ Safer Alternatives**\n- Choose products with the **FSSAI** mark\n- Look for **\"No added sugar\"** and **\"No artificial colors\"** labels\n- Compare nutrition labels side-by-side before buying",
};

export const AiQuerySection = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);

  const handleAsk = () => {
    const q = input.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTyping(true);

    let answer: string;
    if (!isFoodRelated(q)) {
      answer = OFF_TOPIC_RESPONSE;
    } else {
      const key = Object.keys(sampleResponses).find((k) =>
        q.toLowerCase().includes(k)
      );
      answer = sampleResponses[key ?? "default"];
    }

    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", text: answer }]);
      setTyping(false);
    }, 1500);
  };

  return (
    <section className="px-4 py-16 md:py-24 bg-muted/40">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI Powered</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Ask <span className="text-primary">FoodInsight</span> AI
        </h2>
        <p className="mt-2 text-muted-foreground">
          Ask about any ingredient, chemical, or health effect…
        </p>
      </div>

      <div className="mt-8 max-w-2xl mx-auto">
        {/* Messages */}
        {messages.length > 0 && (
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {messages.map((msg, i) => (
              <Card
                key={i}
                className={`${
                  msg.role === "ai"
                    ? "bg-card border-primary/20"
                    : "bg-accent/60 border-transparent ml-auto max-w-[85%]"
                }`}
              >
                <CardContent className="p-4 flex gap-3">
                  {msg.role === "ai" && (
                    <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="text-sm leading-relaxed text-foreground prose prose-sm prose-headings:text-foreground prose-strong:text-foreground prose-p:text-foreground max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ))}
            {typing && (
              <Card className="bg-card border-primary/20">
                <CardContent className="p-4 flex gap-3 items-center">
                  <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 items-center rounded-full border-2 border-border bg-card px-4 py-2 shadow-card-custom focus-within:border-primary transition-colors">
          <Sparkles className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Ask about any ingredient, chemical, or health effect..."
            className="flex-1 bg-transparent outline-none text-sm md:text-base placeholder:text-muted-foreground text-foreground"
          />
          <Button
            onClick={handleAsk}
            size="sm"
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};
