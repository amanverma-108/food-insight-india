
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  product_name_normalized TEXT NOT NULL UNIQUE,
  category TEXT,
  health_score INTEGER DEFAULT 0,
  health_rating TEXT DEFAULT 'poor',
  health_summary TEXT,
  ingredients JSONB DEFAULT '[]',
  nutrition_facts JSONB DEFAULT '{}',
  additives JSONB DEFAULT '[]',
  body_effects JSONB DEFAULT '[]',
  alternatives JSONB DEFAULT '[]',
  search_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.validate_product_health_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.health_score < 0 OR NEW.health_score > 100 THEN
    RAISE EXCEPTION 'health_score must be between 0 and 100';
  END IF;
  IF NEW.health_rating NOT IN ('poor', 'average', 'good') THEN
    RAISE EXCEPTION 'health_rating must be poor, average, or good';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_product_before_insert ON public.products;
CREATE TRIGGER validate_product_before_insert
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.validate_product_health_score();

CREATE TABLE IF NOT EXISTS public.search_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  cache_hit BOOLEAN DEFAULT FALSE,
  searched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_name_normalized ON public.products(product_name_normalized);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow public read products') THEN
    CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow public insert products') THEN
    CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow public update products') THEN
    CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_logs' AND policyname = 'Allow public insert search_logs') THEN
    CREATE POLICY "Allow public insert search_logs" ON public.search_logs FOR INSERT WITH CHECK (true);
  END IF;
END $$;
