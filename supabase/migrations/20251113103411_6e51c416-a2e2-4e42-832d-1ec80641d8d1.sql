-- Create notifications table for admin alerts
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('email_delivery_warning', 'email_delivery_critical', 'high_bounce_rate', 'system_alert')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);
CREATE INDEX idx_admin_notifications_read ON public.admin_notifications(read) WHERE read = FALSE;

-- Enable Row Level Security
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin notifications
CREATE POLICY "Admins can view all notifications"
  ON public.admin_notifications
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update notifications"
  ON public.admin_notifications
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert notifications"
  ON public.admin_notifications
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime for notifications
ALTER TABLE public.admin_notifications REPLICA IDENTITY FULL;

-- Create function to calculate email delivery rate
CREATE OR REPLACE FUNCTION public.calculate_email_delivery_rate()
RETURNS TABLE (
  total_emails BIGINT,
  failed_emails BIGINT,
  delivery_rate NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_emails,
    COUNT(*) FILTER (WHERE status IN ('failed', 'bounced'))::BIGINT as failed_emails,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE status NOT IN ('failed', 'bounced'))::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
      ELSE 100.0
    END as delivery_rate
  FROM public.email_tracking
  WHERE created_at >= NOW() - INTERVAL '24 hours';
END;
$$;

-- Create function to check delivery rates and create alerts
CREATE OR REPLACE FUNCTION public.check_email_delivery_health()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_emails BIGINT;
  v_failed_emails BIGINT;
  v_delivery_rate NUMERIC;
  v_recent_alert TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current delivery rate
  SELECT * INTO v_total_emails, v_failed_emails, v_delivery_rate
  FROM public.calculate_email_delivery_rate();

  -- Only check if we have meaningful data (at least 10 emails in last 24 hours)
  IF v_total_emails < 10 THEN
    RETURN;
  END IF;

  -- Check for recent alerts of the same type (don't spam)
  SELECT created_at INTO v_recent_alert
  FROM public.admin_notifications
  WHERE type = 'email_delivery_warning'
    AND created_at >= NOW() - INTERVAL '2 hours'
  ORDER BY created_at DESC
  LIMIT 1;

  -- If delivery rate is below 80% (warning threshold)
  IF v_delivery_rate < 80 AND v_recent_alert IS NULL THEN
    INSERT INTO public.admin_notifications (type, severity, title, message, data, expires_at)
    VALUES (
      'email_delivery_warning',
      CASE WHEN v_delivery_rate < 60 THEN 'critical' ELSE 'warning' END,
      'Low Email Delivery Rate',
      format('Email delivery rate has dropped to %s%% in the last 24 hours. %s out of %s emails failed.',
        v_delivery_rate, v_failed_emails, v_total_emails),
      jsonb_build_object(
        'delivery_rate', v_delivery_rate,
        'failed_emails', v_failed_emails,
        'total_emails', v_total_emails,
        'period', '24 hours'
      ),
      NOW() + INTERVAL '24 hours'
    );
  END IF;

  -- Check bounce rate (last 100 emails)
  DECLARE
    v_recent_bounces BIGINT;
  BEGIN
    SELECT COUNT(*) INTO v_recent_bounces
    FROM (
      SELECT * FROM public.email_tracking
      ORDER BY created_at DESC
      LIMIT 100
    ) recent
    WHERE status = 'bounced';

    -- If more than 20% of recent emails bounced
    IF v_recent_bounces > 20 THEN
      SELECT created_at INTO v_recent_alert
      FROM public.admin_notifications
      WHERE type = 'high_bounce_rate'
        AND created_at >= NOW() - INTERVAL '2 hours'
      ORDER BY created_at DESC
      LIMIT 1;

      IF v_recent_alert IS NULL THEN
        INSERT INTO public.admin_notifications (type, severity, title, message, data, expires_at)
        VALUES (
          'high_bounce_rate',
          'critical',
          'High Email Bounce Rate Detected',
          format('High bounce rate detected: %s out of last 100 emails bounced (%s%%). Check email list quality.',
            v_recent_bounces, ROUND((v_recent_bounces::NUMERIC / 100) * 100, 1)),
          jsonb_build_object(
            'bounce_count', v_recent_bounces,
            'sample_size', 100,
            'bounce_rate', ROUND((v_recent_bounces::NUMERIC / 100) * 100, 1)
          ),
          NOW() + INTERVAL '24 hours'
        );
      END IF;
    END IF;
  END;
END;
$$;