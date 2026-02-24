import { useState } from "react";
import { ProductAnalysis, type ProductData } from "@/components/ProductAnalysis";
import { sampleProducts } from "@/data/sampleProducts";
import { HeroSection } from "@/components/HeroSection";
import { AiQuerySection } from "@/components/AiQuerySection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(null);

  const handleSearch = (query: string) => {
    const normalizedQuery = query.toLowerCase();
    let foundProduct: ProductData | null = null;

    if (normalizedQuery.includes('oreo') || query === "8901030803987") {
      foundProduct = sampleProducts.oreo;
    } else if (normalizedQuery.includes('maggi') || normalizedQuery.includes('noodles')) {
      foundProduct = sampleProducts.maggi;
    } else {
      foundProduct = sampleProducts.oreo;
    }

    setCurrentProduct(foundProduct);
  };

  const handleBack = () => {
    setCurrentProduct(null);
  };

  if (currentProduct) {
    return (
      <div className="min-h-screen bg-background">
        <ProductAnalysis product={currentProduct} onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onSearch={handleSearch} />
      <AiQuerySection />
      <FeaturesSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
};

export default Index;
