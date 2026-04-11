import { useState, useEffect } from "react";
import { ProductAnalysis, type ProductData } from "@/components/ProductAnalysis";
import { HeroSection } from "@/components/HeroSection";
import { AiQuerySection } from "@/components/AiQuerySection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { Footer } from "@/components/Footer";
import { searchProduct, getTrendingProducts } from "@/services/productService";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([
    "Oreo", "Maggi", "Parle-G", "Lays Chips",
  ]);

  useEffect(() => {
    getTrendingProducts().then((trending) => {
      if (trending.length >= 2) {
        setSuggestions(trending);
      }
    });
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setLoadingMessage("Checking our database...");

    try {
      await new Promise((r) => setTimeout(r, 300));
      setLoadingMessage("Analysing ingredients with AI...");

      const data = await searchProduct(query);
      setCurrentProduct(data);
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Could not analyse this product. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleBack = () => {
    setCurrentProduct(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg font-medium text-foreground">{loadingMessage}</p>
          <p className="text-sm text-muted-foreground">
            First-time searches take 3–5 seconds. Repeat searches are instant.
          </p>
        </div>
      </div>
    );
  }

  if (currentProduct) {
    return (
      <div className="min-h-screen bg-background">
        <ProductAnalysis product={currentProduct} onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onSearch={handleSearch} suggestions={suggestions} />
      <AiQuerySection />
      <FeaturesSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
};

export default Index;
