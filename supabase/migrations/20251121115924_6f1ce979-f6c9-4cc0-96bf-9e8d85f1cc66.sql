-- Create table for storing vanity quotes
CREATE TABLE public.vanity_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('good', 'better', 'best')),
  quantity INTEGER NOT NULL,
  base_price NUMERIC NOT NULL,
  single_to_double BOOLEAN NOT NULL DEFAULT false,
  plumbing_wall_change BOOLEAN NOT NULL DEFAULT false,
  conversion_cost NUMERIC NOT NULL DEFAULT 0,
  plumbing_cost NUMERIC NOT NULL DEFAULT 0,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  grand_total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'declined')),
  email_sent_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vanity_quotes ENABLE ROW LEVEL SECURITY;

-- Create policies for vanity quotes
CREATE POLICY "Users can view their own vanity quotes"
ON public.vanity_quotes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vanity quotes"
ON public.vanity_quotes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vanity quotes"
ON public.vanity_quotes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vanity quotes"
ON public.vanity_quotes
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all vanity quotes"
ON public.vanity_quotes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vanity_quotes_updated_at
BEFORE UPDATE ON public.vanity_quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_vanity_quotes_user_id ON public.vanity_quotes(user_id);
CREATE INDEX idx_vanity_quotes_status ON public.vanity_quotes(status);
CREATE INDEX idx_vanity_quotes_created_at ON public.vanity_quotes(created_at DESC);