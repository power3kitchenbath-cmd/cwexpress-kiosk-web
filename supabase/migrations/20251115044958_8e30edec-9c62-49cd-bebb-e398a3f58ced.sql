-- Create hardware_types table for cabinet hardware selection
CREATE TABLE public.hardware_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price_per_unit NUMERIC NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'handle',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.hardware_types ENABLE ROW LEVEL SECURITY;

-- Create policies for hardware_types
CREATE POLICY "Anyone can view hardware types" 
ON public.hardware_types 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert hardware types" 
ON public.hardware_types 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update hardware types" 
ON public.hardware_types 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete hardware types" 
ON public.hardware_types 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add hardware_items column to estimates table
ALTER TABLE public.estimates 
ADD COLUMN hardware_items JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN hardware_total NUMERIC NOT NULL DEFAULT 0;

-- Insert some sample hardware types
INSERT INTO public.hardware_types (name, price_per_unit, category, image_url) VALUES
  ('Modern Bar Handle - Brushed Nickel', 8.50, 'handle', 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=200&h=200&fit=crop'),
  ('Classic Round Knob - Bronze', 5.25, 'knob', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=200&h=200&fit=crop'),
  ('Contemporary Square Handle - Matte Black', 9.75, 'handle', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'),
  ('Traditional Round Knob - Brass', 6.00, 'knob', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=200&h=200&fit=crop'),
  ('Sleek Handle - Chrome', 10.50, 'handle', 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=200&h=200&fit=crop');