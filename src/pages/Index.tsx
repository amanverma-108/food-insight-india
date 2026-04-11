import { useState, useEffect, useCallback } from "react";
import { ProductAnalysis, type ProductData } from "@/components/ProductAnalysis";
import { HeroSection } from "@/components/HeroSection";
import { AiQuerySection } from "@/components/AiQuerySection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { Footer } from "@/components/Footer";
import { searchProduct, getTrendingProducts, identifyProductFromImage } from "@/services/productService";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
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

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.productName) {
        searchProduct(event.state.productName).then(setCurrentProduct).catch(() => {
          setCurrentProduct(null);
        });
      } else {
        setCurrentProduct(null);
        setNavigationHistory([]);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setLoadingMessage("Checking our database...");

    try {
      await new Promise((r) => setTimeout(r, 300));
      setLoadingMessage("Analysing ingredients with AI...");

      const data = await searchProduct(query);
      setCurrentProduct(data);
      setNavigationHistory([]);
      window.history.pushState(
        { productName: query },
        "",
        `?product=${encodeURIComponent(query)}`
      );
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Could not analyse this product. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  }, []);

  const handleAlternativeClick = useCallback(async (alternativeName: string) => {
    if (currentProduct) {
      setNavigationHistory((prev) => [...prev, currentProduct.name]);
    }
    setIsLoading(true);
    setLoadingMessage("Loading alternative product...");

    try {
      const data = await searchProduct(alternativeName);
      setCurrentProduct(data);
      window.history.pushState(
        { productName: alternativeName },
        "",
        `?product=${encodeURIComponent(alternativeName)}`
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Could not load this alternative. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  }, [currentProduct]);

  const handleCameraIdentify = useCallback(async (file: File) => {
    setIsLoading(true);
    setLoadingMessage("Scanning your image...");

    try {
      const msgs = ["Identifying the product...", "Searching our database...", "Analysing ingredients with AI..."];
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % msgs.length;
        setLoadingMessage(msgs[i]);
      }, 1500);

      const name = await identifyProductFromImage(file);
      clearInterval(interval);

      if (name) {
        setLoadingMessage("Analysing ingredients with AI...");
        const data = await searchProduct(name);
        setCurrentProduct(data);
        setNavigationHistory([]);
        window.history.pushState(
          { productName: name },
          "",
          `?product=${encodeURIComponent(name)}`
        );
      } else {
        toast.error("No food product detected. Try a clearer photo of the packaging.");
      }
    } catch {
      toast.error("Image scan failed. Please try again or type the product name.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  }, []);

  const handleBack = useCallback(() => {
    setCurrentProduct(null);
    setNavigationHistory([]);
    window.history.pushState(null, "", "/");
  }, []);

  const loadHistoryProduct = useCallback(async (name: string, index: number) => {
    if (index >= navigationHistory.length - 1) return; // current product, no-op
    setIsLoading(true);
    setLoadingMessage("Loading product...");
    try {
      const data = await searchProduct(name);
      setCurrentProduct(data);
      setNavigationHistory((prev) => prev.slice(0, index));
    } catch {
      toast.error("Could not load product.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  }, [navigationHistory]);

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
        {/* Breadcrumb */}
        {navigationHistory.length > 0 && (
          <div className="max-w-6xl mx-auto px-6 pt-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span
              onClick={handleBack}
              className="cursor-pointer text-primary hover:underline"
            >
              Search
            </span>
            {navigationHistory.map((name, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="opacity-40">›</span>
                <span
                  onClick={() => loadHistoryProduct(name, i)}
                  className="cursor-pointer text-primary hover:underline"
                >
                  {name}
                </span>
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="opacity-40">›</span>
              <span className="font-medium text-foreground">{currentProduct.name}</span>
            </span>
          </div>
        )}
        <ProductAnalysis
          product={currentProduct}
          onBack={handleBack}
          onAlternativeClick={handleAlternativeClick}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        onSearch={handleSearch}
        onCameraIdentify={handleCameraIdentify}
        suggestions={suggestions}
      />
      <AiQuerySection />
      <FeaturesSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
};

export default Index;
