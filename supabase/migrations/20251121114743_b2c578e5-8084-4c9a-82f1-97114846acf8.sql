-- Add vanity items column to estimates table
ALTER TABLE public.estimates 
ADD COLUMN IF NOT EXISTS vanity_items jsonb NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS vanity_total numeric NOT NULL DEFAULT 0;