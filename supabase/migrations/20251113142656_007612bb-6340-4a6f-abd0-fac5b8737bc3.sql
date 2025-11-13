-- Fix search_path for calculate_warmup_daily_limit function
DROP FUNCTION IF EXISTS public.calculate_warmup_daily_limit(INTEGER);

CREATE OR REPLACE FUNCTION public.calculate_warmup_daily_limit(day_number INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  CASE
    WHEN day_number <= 3 THEN RETURN 20 + (day_number - 1) * 15;
    WHEN day_number <= 7 THEN RETURN 50 + (day_number - 4) * 12;
    WHEN day_number <= 14 THEN RETURN 100 + (day_number - 8) * 57;
    WHEN day_number <= 21 THEN RETURN 500 + (day_number - 15) * 71;
    WHEN day_number <= 28 THEN RETURN 1000 + (day_number - 22) * 143;
    WHEN day_number <= 35 THEN RETURN 2000 + (day_number - 29) * 428;
    ELSE RETURN 5000 + (day_number - 36) * 500;
  END CASE;
END;
$$;