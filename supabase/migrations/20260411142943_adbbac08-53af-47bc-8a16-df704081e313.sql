
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
$$ LANGUAGE plpgsql SET search_path = public;
