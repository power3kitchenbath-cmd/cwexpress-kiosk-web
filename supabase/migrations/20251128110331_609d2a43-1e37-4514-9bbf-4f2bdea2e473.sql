-- Create kiosk_quotes table for storing customer quote requests from the kiosk system
CREATE TABLE public.kiosk_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Customer information
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  
  -- Kitchen dimensions
  size_mode TEXT NOT NULL DEFAULT 'PRESET', -- 'PRESET' or 'MANUAL'
  preset_id TEXT, -- 'SMALL', 'MEDIUM', 'LARGE'
  length_ft NUMERIC NOT NULL,
  width_ft NUMERIC NOT NULL,
  cabinet_lf NUMERIC NOT NULL, -- Cabinet linear feet
  countertop_lf NUMERIC NOT NULL, -- Countertop linear feet
  area_sf NUMERIC NOT NULL, -- Total area in square feet
  
  -- Material selections
  tier TEXT NOT NULL, -- 'GOOD', 'BETTER', 'BEST'
  countertop_material TEXT NOT NULL, -- 'quartz', 'granite'
  flooring_material TEXT NOT NULL, -- 'lvp', 'tile'
  
  -- Add-ons
  plumbing_moves INTEGER NOT NULL DEFAULT 0,
  include_demo BOOLEAN NOT NULL DEFAULT false,
  
  -- Estimate details
  estimate_low NUMERIC NOT NULL,
  estimate_high NUMERIC NOT NULL,
  estimate_subtotal NUMERIC NOT NULL,
  deposit_amount NUMERIC NOT NULL DEFAULT 28.75,
  
  -- Appointment information
  appointment_slot TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'appointment_booked', 'confirmed', 'completed', 'cancelled'
  reference_code TEXT UNIQUE,
  
  -- Payment tracking
  deposit_paid BOOLEAN NOT NULL DEFAULT false,
  deposit_paid_at TIMESTAMP WITH TIME ZONE,
  payment_receipt TEXT,
  
  -- Notes and metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_kiosk_quotes_user_id ON public.kiosk_quotes(user_id);
CREATE INDEX idx_kiosk_quotes_status ON public.kiosk_quotes(status);
CREATE INDEX idx_kiosk_quotes_reference_code ON public.kiosk_quotes(reference_code);
CREATE INDEX idx_kiosk_quotes_customer_email ON public.kiosk_quotes(customer_email);
CREATE INDEX idx_kiosk_quotes_appointment_date ON public.kiosk_quotes(appointment_date);

-- Enable Row Level Security
ALTER TABLE public.kiosk_quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anyone (including anonymous users) to create kiosk quotes
CREATE POLICY "Anyone can create kiosk quotes"
ON public.kiosk_quotes
FOR INSERT
WITH CHECK (true);

-- Users can view their own quotes (by user_id or email)
CREATE POLICY "Users can view their own kiosk quotes"
ON public.kiosk_quotes
FOR SELECT
USING (
  auth.uid() = user_id 
  OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR user_id IS NULL
);

-- Users can update their own quotes
CREATE POLICY "Users can update their own kiosk quotes"
ON public.kiosk_quotes
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Admins can view all kiosk quotes
CREATE POLICY "Admins can view all kiosk quotes"
ON public.kiosk_quotes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all kiosk quotes
CREATE POLICY "Admins can update all kiosk quotes"
ON public.kiosk_quotes
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete kiosk quotes
CREATE POLICY "Admins can delete kiosk quotes"
ON public.kiosk_quotes
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_kiosk_quotes_updated_at
BEFORE UPDATE ON public.kiosk_quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();