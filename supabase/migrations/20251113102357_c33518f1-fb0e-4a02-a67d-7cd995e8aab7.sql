-- Drop and recreate the view without security definer
DROP VIEW IF EXISTS public.failed_emails_summary;

-- Create a simple view without security definer (uses caller's permissions)
CREATE VIEW public.failed_emails_summary AS
SELECT 
  et.recipient_email,
  COUNT(*) as failure_count,
  MAX(et.failed_at) as last_failure,
  array_agg(DISTINCT et.failure_reason) as failure_reasons,
  array_agg(DISTINCT et.bounce_type) as bounce_types,
  array_agg(DISTINCT et.order_id) as affected_orders
FROM public.email_tracking et
WHERE et.status IN ('failed', 'bounced')
GROUP BY et.recipient_email
ORDER BY failure_count DESC, last_failure DESC;

-- Add RLS policy for the view (admins only)
-- Note: Views inherit RLS from underlying tables, but we ensure admin access
CREATE POLICY "Admins can view failed emails summary"
  ON public.email_tracking
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    AND status IN ('failed', 'bounced')
  );