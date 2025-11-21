-- Create kitchen_quotes table for 10x10 kitchen installation quotes
CREATE TABLE IF NOT EXISTS public.kitchen_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('good', 'better', 'best')),
  quantity INTEGER NOT NULL DEFAULT 1,
  base_price NUMERIC NOT NULL,
  cabinet_upgrade BOOLEAN NOT NULL DEFAULT false,
  countertop_upgrade BOOLEAN NOT NULL DEFAULT false,
  cabinet_cost NUMERIC NOT NULL DEFAULT 0,
  countertop_cost NUMERIC NOT NULL DEFAULT 0,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  grand_total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  email_sent_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kitchen_quotes ENABLE ROW LEVEL SECURITY;

-- Users can view their own kitchen quotes
CREATE POLICY "Users can view their own kitchen quotes"
  ON public.kitchen_quotes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own kitchen quotes
CREATE POLICY "Users can create their own kitchen quotes"
  ON public.kitchen_quotes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own kitchen quotes
CREATE POLICY "Users can update their own kitchen quotes"
  ON public.kitchen_quotes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own kitchen quotes
CREATE POLICY "Users can delete their own kitchen quotes"
  ON public.kitchen_quotes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all kitchen quotes
CREATE POLICY "Admins can view all kitchen quotes"
  ON public.kitchen_quotes
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Create index for efficient queries
CREATE INDEX idx_kitchen_quotes_user_id ON public.kitchen_quotes(user_id);
CREATE INDEX idx_kitchen_quotes_status ON public.kitchen_quotes(status);
CREATE INDEX idx_kitchen_quotes_created_at ON public.kitchen_quotes(created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_kitchen_quotes_updated_at
  BEFORE UPDATE ON public.kitchen_quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add kitchen columns to estimates table
ALTER TABLE public.estimates 
  ADD COLUMN IF NOT EXISTS kitchen_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS kitchen_total NUMERIC NOT NULL DEFAULT 0;