import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export const AiQuerySection = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleAsk = async () => {
    const q = input.trim();
    if (!q || isLoading) return;

    const userMsg: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${resp.status})`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { /* ignore */ }
        }
      }
    } catch (e: any) {
      console.error("Chat error:", e);
      toast({ title: "AI Error", description: e.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
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
          Ask me anything — ingredients, health, nutrition, or any topic…
        </p>
      </div>

      <div className="mt-8 max-w-2xl mx-auto">
        {messages.length > 0 && (
          <div ref={scrollRef} className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {messages.map((msg, i) => (
              <Card
                key={i}
                className={`${
                  msg.role === "assistant"
                    ? "bg-card border-primary/20"
                    : "bg-accent/60 border-transparent ml-auto max-w-[85%]"
                }`}
              >
                <CardContent className="p-4 flex gap-3">
                  {msg.role === "assistant" && (
                    <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="text-sm leading-relaxed text-foreground prose prose-sm prose-headings:text-foreground prose-strong:text-foreground prose-p:text-foreground max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
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

        <div className="flex gap-2 items-center rounded-full border-2 border-border bg-card px-4 py-2 shadow-sm focus-within:border-primary transition-colors">
          <Sparkles className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Ask about any ingredient, health effect, or anything else..."
            className="flex-1 bg-transparent outline-none text-sm md:text-base placeholder:text-muted-foreground text-foreground"
            disabled={isLoading}
          />
          <Button
            onClick={handleAsk}
            size="sm"
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </section>
  );
};
