import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Message {
  role: "user" | "ai";
  text: string;
}

const sampleResponses: Record<string, string> = {
  sugar:
    "Sugar (sucrose) provides quick energy but excessive intake is linked to obesity, type 2 diabetes, and tooth decay. The WHO recommends limiting added sugars to less than 10% of daily calories. In packaged foods, look for hidden names like dextrose, maltose, and high-fructose corn syrup.",
  "palm oil":
    "Palm oil is high in saturated fat, which can raise LDL cholesterol and increase cardiovascular risk. It's widely used in Indian snacks for its stability and low cost. Alternatives like sunflower or rice bran oil are generally healthier choices.",
  default:
    "That's a great question! In general, always check ingredient lists for excessive sugar, sodium, and trans fats. Look for whole-grain, high-fiber options and prefer products with shorter, more recognizable ingredient lists.",
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

    const key = Object.keys(sampleResponses).find((k) =>
      q.toLowerCase().includes(k)
    );
    const answer = sampleResponses[key ?? "default"];

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
                  <p className="text-sm leading-relaxed text-foreground">
                    {msg.text}
                  </p>
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
