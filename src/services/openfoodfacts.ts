const OPENFOODFACTS_BASE_URL = 'https://world.openfoodfacts.org/api/v2';

export interface OpenFoodFactsProduct {
  code: string;
  product: {
    product_name?: string;
    image_url?: string;
    image_front_url?: string;
    ingredients_text?: string;
    nutriments?: {
      energy_100g?: number;
      fat_100g?: number;
      'saturated-fat_100g'?: number;
      carbohydrates_100g?: number;
      sugars_100g?: number;
      fiber_100g?: number;
      proteins_100g?: number;
      salt_100g?: number;
      sodium_100g?: number;
    };
    categories?: string;
    brands?: string;
    additives_tags?: string[];
  };
}

export const searchProductByBarcode = async (barcode: string): Promise<OpenFoodFactsProduct | null> => {
  try {
    const response = await fetch(`${OPENFOODFACTS_BASE_URL}/product/${barcode}`);
    const data = await response.json();
    
    if (data.status === 1 && data.product) {
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching product by barcode:', error);
    return null;
  }
};

export const searchProductByName = async (name: string): Promise<OpenFoodFactsProduct[]> => {
  try {
    const response = await fetch(
      `${OPENFOODFACTS_BASE_URL}/search?search_terms=${encodeURIComponent(name)}&search_simple=1&action=process&json=1&page_size=10&fields=code,product_name,image_url,image_front_url,ingredients_text,nutriments,categories,brands,additives_tags`
    );
    const data = await response.json();
    
    if (data.products && data.products.length > 0) {
      return data.products.map((product: any) => ({
        code: product.code,
        product: product
      }));
    }
    return [];
  } catch (error) {
    console.error('Error searching products by name:', error);
    return [];
  }
};

export const extractTextFromImage = async (imageFile: File): Promise<string | null> => {
  // This would typically use an OCR service like Google Vision API
  // For now, we'll return a mock result
  console.log('Processing image:', imageFile.name);
  
  // Simulate OCR processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock OCR result
  return "Britannia Good Day";
};