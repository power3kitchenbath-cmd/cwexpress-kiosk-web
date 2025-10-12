-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create storage bucket for design files
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-files', 'design-files', true);

-- Create table for storing design projects
CREATE TABLE public.design_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  cabinet_list_file TEXT,
  design_drawing_file TEXT,
  cabinet_data JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.design_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own designs"
ON public.design_projects
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own designs"
ON public.design_projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs"
ON public.design_projects
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs"
ON public.design_projects
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all designs
CREATE POLICY "Admins can view all designs"
ON public.design_projects
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for design files
CREATE POLICY "Users can upload their own design files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'design-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own design files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'design-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own design files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'design-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own design files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'design-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public read access for design files (for kiosk display)
CREATE POLICY "Anyone can view design files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'design-files');

-- Trigger for updated_at
CREATE TRIGGER update_design_projects_updated_at
BEFORE UPDATE ON public.design_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();