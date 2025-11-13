-- Create table for email warm-up configuration and tracking
CREATE TABLE IF NOT EXISTS public.email_warmup_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  start_date DATE NOT NULL,
  current_day INTEGER NOT NULL DEFAULT 1,
  daily_limit INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(domain, start_date)
);

-- Create table for daily warm-up tracking
CREATE TABLE IF NOT EXISTS public.email_warmup_daily_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  warmup_schedule_id UUID NOT NULL REFERENCES public.email_warmup_schedule(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  emails_sent INTEGER NOT NULL DEFAULT 0,
  target_volume INTEGER NOT NULL,
  percentage_used NUMERIC NOT NULL DEFAULT 0,
  exceeded_limit BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(warmup_schedule_id, date)
);

-- Enable RLS
ALTER TABLE public.email_warmup_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_warmup_daily_stats ENABLE ROW LEVEL SECURITY;

-- Policies for email_warmup_schedule
CREATE POLICY "Admins can view warmup schedules"
  ON public.email_warmup_schedule
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert warmup schedules"
  ON public.email_warmup_schedule
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update warmup schedules"
  ON public.email_warmup_schedule
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete warmup schedules"
  ON public.email_warmup_schedule
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for email_warmup_daily_stats
CREATE POLICY "Admins can view warmup daily stats"
  ON public.email_warmup_daily_stats
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert warmup daily stats"
  ON public.email_warmup_daily_stats
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update warmup daily stats"
  ON public.email_warmup_daily_stats
  FOR UPDATE
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_email_warmup_schedule_updated_at
  BEFORE UPDATE ON public.email_warmup_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate recommended daily sending volume based on warm-up day
CREATE OR REPLACE FUNCTION public.calculate_warmup_daily_limit(day_number INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN CASE
    WHEN day_number <= 3 THEN 20 + (day_number - 1) * 15
    WHEN day_number <= 7 THEN 50 + (day_number - 4) * 12
    WHEN day_number <= 14 THEN 100 + (day_number - 8) * 57
    WHEN day_number <= 21 THEN 500 + (day_number - 15) * 71
    WHEN day_number <= 28 THEN 1000 + (day_number - 22) * 143
    WHEN day_number <= 35 THEN 2000 + (day_number - 29) * 428
    ELSE 5000 + (day_number - 36) * 500
  END;
END;
$$;