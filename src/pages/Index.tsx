import { useState } from "react";
import { SearchInterface } from "@/components/SearchInterface";
import { ProductAnalysis, type ProductData } from "@/components/ProductAnalysis";
import { sampleProducts } from "@/data/sampleProducts";

const Index = () => {
  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = (query: string, type: 'text' | 'barcode' | 'photo') => {
    // Demo implementation - match sample products
    const normalizedQuery = query.toLowerCase();
    
    let foundProduct: ProductData | null = null;
    
    if (normalizedQuery.includes('oreo') || query === "8901030803987") {
      foundProduct = sampleProducts.oreo;
    } else if (normalizedQuery.includes('maggi') || normalizedQuery.includes('noodles')) {
      foundProduct = sampleProducts.maggi;
    } else {
      // For demo purposes, default to Oreo for any other search
      foundProduct = sampleProducts.oreo;
    }
    
    setCurrentProduct(foundProduct);
    setSearchQuery(query);
  };

  const handleBack = () => {
    setCurrentProduct(null);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      {currentProduct ? (
        <ProductAnalysis product={currentProduct} onBack={handleBack} />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <SearchInterface onSearch={handleSearch} />
          
          {/* Features Section */}
          <div className="mt-16 max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Discover What's Really in Your Food
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get detailed ingredient analysis, health impact visualization, and find healthier alternatives 
                for any packaged food product available in India.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-health rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Analysis</h3>
                <p className="text-muted-foreground">
                  AI-powered ingredient analysis with health effects and organ impact visualization
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-health rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🫀</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Body Impact</h3>
                <p className="text-muted-foreground">
                  Interactive body diagram showing how each ingredient affects your organs
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-health rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Better Choices</h3>
                <p className="text-muted-foreground">
                  Get personalized recommendations for healthier alternatives in the same category
                </p>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-card rounded-2xl p-8 max-w-2xl mx-auto shadow-card-custom">
              <h3 className="text-2xl font-bold mb-4">Ready to Make Healthier Choices?</h3>
              <p className="text-muted-foreground mb-6">
                Start by searching for any packaged food product above. Try "Oreo" or "Maggi" for a demo!
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button 
                  onClick={() => handleSearch("Oreo", 'text')}
                  className="px-6 py-2 bg-gradient-health text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Try Oreo Analysis
                </button>
                <button 
                  onClick={() => handleSearch("Maggi", 'text')}
                  className="px-6 py-2 bg-gradient-warning text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Try Maggi Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
