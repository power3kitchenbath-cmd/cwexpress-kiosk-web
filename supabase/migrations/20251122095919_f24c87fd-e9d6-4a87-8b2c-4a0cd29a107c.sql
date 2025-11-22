-- Add follow-up tracking to pricing_guide_requests
ALTER TABLE public.pricing_guide_requests 
ADD COLUMN IF NOT EXISTS follow_ups_sent jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.pricing_guide_requests.follow_ups_sent IS 'Tracks which follow-up emails have been sent (array of {day: number, sent_at: timestamp})';