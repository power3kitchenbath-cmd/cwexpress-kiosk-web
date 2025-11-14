-- Create countertop_types table
CREATE TABLE public.countertop_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price_per_linear_ft NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.countertop_types ENABLE ROW LEVEL SECURITY;

-- Create policies for countertop_types
CREATE POLICY "Anyone can view countertop types"
  ON public.countertop_types
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert countertop types"
  ON public.countertop_types
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update countertop types"
  ON public.countertop_types
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete countertop types"
  ON public.countertop_types
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Modify estimates table to add countertop columns
ALTER TABLE public.estimates
  ADD COLUMN countertop_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN countertop_total NUMERIC NOT NULL DEFAULT 0;