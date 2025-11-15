-- Create table for saved cabinet designs
CREATE TABLE IF NOT EXISTS public.saved_cabinet_designs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  design_name TEXT NOT NULL,
  room_image_url TEXT NOT NULL,
  door_style TEXT NOT NULL,
  opacity NUMERIC NOT NULL DEFAULT 70,
  brightness NUMERIC NOT NULL DEFAULT 100,
  scale NUMERIC NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_cabinet_designs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own cabinet designs"
ON public.saved_cabinet_designs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cabinet designs"
ON public.saved_cabinet_designs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cabinet designs"
ON public.saved_cabinet_designs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cabinet designs"
ON public.saved_cabinet_designs
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all designs
CREATE POLICY "Admins can view all cabinet designs"
ON public.saved_cabinet_designs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_saved_cabinet_designs_updated_at
BEFORE UPDATE ON public.saved_cabinet_designs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_saved_cabinet_designs_user_id ON public.saved_cabinet_designs(user_id);
CREATE INDEX idx_saved_cabinet_designs_created_at ON public.saved_cabinet_designs(created_at DESC);