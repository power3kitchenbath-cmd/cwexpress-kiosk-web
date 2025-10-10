-- Create cabinet types table
CREATE TABLE public.cabinet_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price_per_unit DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create flooring types table
CREATE TABLE public.flooring_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price_per_sqft DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create estimates table
CREATE TABLE public.estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cabinet_items JSONB NOT NULL DEFAULT '[]',
  flooring_items JSONB NOT NULL DEFAULT '[]',
  cabinet_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  flooring_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  grand_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cabinet_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flooring_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cabinet_types (readable by all)
CREATE POLICY "Anyone can view cabinet types"
  ON public.cabinet_types FOR SELECT
  USING (true);

-- RLS Policies for flooring_types (readable by all)
CREATE POLICY "Anyone can view flooring types"
  ON public.flooring_types FOR SELECT
  USING (true);

-- RLS Policies for estimates
CREATE POLICY "Users can view their own estimates"
  ON public.estimates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own estimates"
  ON public.estimates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Seed cabinet types
INSERT INTO public.cabinet_types (name, price_per_unit) VALUES
  ('base', 350.00),
  ('wall', 275.00),
  ('tall', 450.00),
  ('corner', 400.00);

-- Seed flooring types
INSERT INTO public.flooring_types (name, price_per_sqft) VALUES
  ('hardwood', 8.50),
  ('laminate', 4.25),
  ('tile', 6.75),
  ('vinyl', 3.50),
  ('carpet', 3.00);