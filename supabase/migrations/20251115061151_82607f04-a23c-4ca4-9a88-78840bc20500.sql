-- Create storage bucket for visualizer room images
INSERT INTO storage.buckets (id, name, public)
VALUES ('visualizer-rooms', 'visualizer-rooms', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for visualizer-rooms bucket
CREATE POLICY "Users can upload their own visualizer rooms"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'visualizer-rooms' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own visualizer rooms"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'visualizer-rooms' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own visualizer rooms"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'visualizer-rooms' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create saved_flooring_designs table
CREATE TABLE public.saved_flooring_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  design_name TEXT NOT NULL,
  room_image_url TEXT NOT NULL,
  flooring_type TEXT NOT NULL,
  opacity NUMERIC NOT NULL DEFAULT 0.7,
  brightness NUMERIC NOT NULL DEFAULT 100,
  is_sample_room BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_flooring_designs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_flooring_designs
CREATE POLICY "Users can view their own saved designs"
ON public.saved_flooring_designs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved designs"
ON public.saved_flooring_designs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved designs"
ON public.saved_flooring_designs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved designs"
ON public.saved_flooring_designs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_saved_flooring_designs_updated_at
BEFORE UPDATE ON public.saved_flooring_designs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();