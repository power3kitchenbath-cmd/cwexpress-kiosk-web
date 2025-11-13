-- Create email tracking table
CREATE TABLE IF NOT EXISTS public.email_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('confirmation', 'manual', 'delivery')),
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  opened_count INTEGER NOT NULL DEFAULT 0,
  tracking_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_email_tracking_order_id ON public.email_tracking(order_id);
CREATE INDEX idx_email_tracking_token ON public.email_tracking(tracking_token);

-- Enable Row Level Security
ALTER TABLE public.email_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all email tracking"
  ON public.email_tracking
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own email tracking"
  ON public.email_tracking
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = email_tracking.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Allow the service role to insert email tracking records
CREATE POLICY "Service role can insert email tracking"
  ON public.email_tracking
  FOR INSERT
  WITH CHECK (true);

-- Allow the service role to update email tracking records
CREATE POLICY "Service role can update email tracking"
  ON public.email_tracking
  FOR UPDATE
  USING (true);

-- Enable realtime for email tracking
ALTER TABLE public.email_tracking REPLICA IDENTITY FULL;