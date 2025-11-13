-- Add email failure tracking columns to email_tracking table
ALTER TABLE public.email_tracking
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'bounced')),
ADD COLUMN IF NOT EXISTS failure_reason TEXT,
ADD COLUMN IF NOT EXISTS bounce_type TEXT CHECK (bounce_type IN ('hard', 'soft', 'complaint')),
ADD COLUMN IF NOT EXISTS failed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0;

-- Create index for filtering failed emails
CREATE INDEX IF NOT EXISTS idx_email_tracking_status ON public.email_tracking(status);
CREATE INDEX IF NOT EXISTS idx_email_tracking_failed_at ON public.email_tracking(failed_at) WHERE failed_at IS NOT NULL;

-- Create a view for admins to easily see problematic emails
CREATE OR REPLACE VIEW public.failed_emails_summary AS
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

-- Grant access to the view for admins
GRANT SELECT ON public.failed_emails_summary TO authenticated;