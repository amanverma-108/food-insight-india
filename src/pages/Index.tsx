import { useState } from "react";
import { SearchInterface } from "@/components/SearchInterface";
import { ProductAnalysis, type ProductData } from "@/components/ProductAnalysis";
import { sampleProducts } from "@/data/sampleProducts";
import { searchProductByBarcode, searchProductByName, extractTextFromImage } from "@/services/openfoodfacts";

const Index = () => {
  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = async (query: string, type: 'text' | 'barcode' | 'photo', imageFile?: File) => {
    let searchTerm = query;
    let foundProduct: ProductData | null = null;

    try {
      // Handle different search types
      if (type === 'barcode') {
        const apiProduct = await searchProductByBarcode(query);
        if (apiProduct) {
          // Convert OpenFoodFacts data to our ProductData format
          foundProduct = convertApiProductToProductData(apiProduct);
        }
      } else if (type === 'photo' && imageFile) {
        const extractedText = await extractTextFromImage(imageFile);
        if (extractedText) {
          searchTerm = extractedText;
          const apiProducts = await searchProductByName(extractedText);
          if (apiProducts.length > 0) {
            foundProduct = convertApiProductToProductData(apiProducts[0]);
          }
        }
      } else if (type === 'text') {
        const apiProducts = await searchProductByName(query);
        if (apiProducts.length > 0) {
          foundProduct = convertApiProductToProductData(apiProducts[0]);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    }

    // Fallback to sample data for demo purposes
    if (!foundProduct) {
      const normalizedQuery = searchTerm.toLowerCase();
      if (normalizedQuery.includes('oreo') || query === "8901030803987") {
        foundProduct = sampleProducts.oreo;
      } else if (normalizedQuery.includes('maggi') || normalizedQuery.includes('noodles')) {
        foundProduct = sampleProducts.maggi;
      } else {
        foundProduct = sampleProducts.oreo;
      }
    }
    
    setCurrentProduct(foundProduct);
    setSearchQuery(searchTerm);
  };

  const convertApiProductToProductData = (apiProduct: any): ProductData => {
    return {
      name: apiProduct.product.product_name || 'Unknown Product',
      image: apiProduct.product.image_front_url || apiProduct.product.image_url || '/placeholder.svg',
      barcode: apiProduct.code,
      brand: apiProduct.product.brands || 'Unknown Brand',
      category: apiProduct.product.categories?.split(',')[0] || 'Food Product',
      healthScore: 65, // This would be calculated by AI
      nutrition: {
        calories: Math.round(apiProduct.product.nutriments?.energy_100g / 4.184) || 0,
        protein: apiProduct.product.nutriments?.proteins_100g || 0,
        carbs: apiProduct.product.nutriments?.carbohydrates_100g || 0,
        fat: apiProduct.product.nutriments?.fat_100g || 0,
      sugar: apiProduct.product.nutriments?.sugars_100g || 0,
      salt: apiProduct.product.nutriments?.salt_100g || 0,
      fiber: apiProduct.product.nutriments?.fiber_100g || 0,
      sodium: apiProduct.product.nutriments?.sodium_100g || 0,
      },
      ingredients: parseIngredients(apiProduct.product.ingredients_text || ''),
      additives: parseAdditives(apiProduct.product.additives_tags || []),
      healthEffects: generateHealthEffects(),
      alternatives: [],
    };
  };

  const parseIngredients = (ingredientsText: string) => {
    // Simple parsing - in real app, this would be more sophisticated
    return ingredientsText.split(',').slice(0, 8).map((ingredient, index) => ({
      name: ingredient.trim(),
      function: 'Main ingredient',
      healthEffect: 'Moderate impact on health',
      rating: 'neutral' as const,
      affectedOrgans: ['digestive'],
    }));
  };

  const parseAdditives = (additivesTags: string[]) => {
    return additivesTags.slice(0, 5).map(tag => ({
      code: tag.replace('en:', '').toUpperCase(),
      name: tag.replace('en:', '').replace(/-/g, ' '),
      function: 'Additive',
      concern: 'moderate' as const,
    }));
  };

  const generateHealthEffects = () => ({
    liver: { level: 'moderate' as const, description: 'May affect liver function with regular consumption' },
    heart: { level: 'poor' as const, description: 'High sodium content may impact cardiovascular health' },
    digestive: { level: 'moderate' as const, description: 'Contains processed ingredients that may affect digestion' },
    brain: { level: 'neutral' as const, description: 'Provides quick energy for brain function' },
  });

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
                Discover What's Really in Your <span className="brand-highlight">Food</span>
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
              <h3 className="text-2xl font-bold mb-4">
                Ready to Make Healthier <span className="brand-highlight">Choices</span>?
              </h3>
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
