-- Create table to track pricing guide requests
CREATE TABLE IF NOT EXISTS public.pricing_guide_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  company_name TEXT,
  request_type TEXT NOT NULL DEFAULT 'download', -- 'download' or 'email'
  user_id UUID REFERENCES auth.users(id),
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  tracking_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pricing_guide_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own requests
CREATE POLICY "Users can create pricing guide requests"
ON public.pricing_guide_requests
FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR user_id IS NULL
);

-- Policy: Users can view their own requests
CREATE POLICY "Users can view their own pricing guide requests"
ON public.pricing_guide_requests
FOR SELECT
USING (
  auth.uid() = user_id OR user_id IS NULL
);

-- Policy: Admins can view all requests
CREATE POLICY "Admins can view all pricing guide requests"
ON public.pricing_guide_requests
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Policy: Service role can update tracking data
CREATE POLICY "Service role can update pricing guide requests"
ON public.pricing_guide_requests
FOR UPDATE
USING (true);

-- Create index on email for faster lookups
CREATE INDEX idx_pricing_guide_requests_email ON public.pricing_guide_requests(email);

-- Create index on created_at for analytics
CREATE INDEX idx_pricing_guide_requests_created_at ON public.pricing_guide_requests(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_pricing_guide_requests_updated_at
BEFORE UPDATE ON public.pricing_guide_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();