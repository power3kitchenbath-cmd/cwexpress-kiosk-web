-- Fix security definer view issue by replacing with a security invoker function
-- This ensures the function runs with the caller's permissions, not elevated privileges

-- Drop the existing view
DROP VIEW IF EXISTS public.failed_emails_summary;

-- Create a function that returns the same data structure with SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.get_failed_emails_summary()
RETURNS TABLE (
  recipient_email text,
  failure_count bigint,
  last_failure timestamp with time zone,
  failure_reasons text[],
  bounce_types text[],
  affected_orders uuid[]
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
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
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_failed_emails_summary() TO authenticated;