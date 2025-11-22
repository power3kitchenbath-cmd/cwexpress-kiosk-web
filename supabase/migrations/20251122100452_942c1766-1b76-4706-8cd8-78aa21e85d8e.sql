-- Add unsubscribe tracking to pricing_guide_requests
ALTER TABLE public.pricing_guide_requests 
ADD COLUMN IF NOT EXISTS unsubscribed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS unsubscribed_at timestamp with time zone;

COMMENT ON COLUMN public.pricing_guide_requests.unsubscribed IS 'Whether the customer has unsubscribed from follow-up emails';
COMMENT ON COLUMN public.pricing_guide_requests.unsubscribed_at IS 'When the customer unsubscribed';