-- Create table for analytics report configuration
CREATE TABLE IF NOT EXISTS public.analytics_report_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'disabled')),
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_report_config ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view report configs
CREATE POLICY "Admins can view report configs"
  ON public.analytics_report_config
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Only admins can insert report configs
CREATE POLICY "Admins can insert report configs"
  ON public.analytics_report_config
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Only admins can update report configs
CREATE POLICY "Admins can update report configs"
  ON public.analytics_report_config
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Only admins can delete report configs
CREATE POLICY "Admins can delete report configs"
  ON public.analytics_report_config
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_analytics_report_config_updated_at
  BEFORE UPDATE ON public.analytics_report_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();