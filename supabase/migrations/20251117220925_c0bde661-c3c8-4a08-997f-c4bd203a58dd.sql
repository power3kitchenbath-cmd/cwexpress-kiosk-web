-- Add installation fields to estimates table
ALTER TABLE public.estimates 
ADD COLUMN installation_requested boolean NOT NULL DEFAULT false,
ADD COLUMN installation_cost numeric NOT NULL DEFAULT 0;

-- Add comment explaining the installation cost calculation
COMMENT ON COLUMN public.estimates.installation_cost IS 'Calculated as 15% of materials subtotal when installation is requested';