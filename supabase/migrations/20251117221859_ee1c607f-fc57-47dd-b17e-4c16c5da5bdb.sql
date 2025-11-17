-- Create installation_photos table for progress photos
CREATE TABLE IF NOT EXISTS public.installation_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.install_projects(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL,
  photo_url text NOT NULL,
  photo_type text NOT NULL CHECK (photo_type IN ('before', 'progress', 'after', 'issue')),
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  task_id uuid REFERENCES public.project_tasks(id) ON DELETE SET NULL
);

-- Enable RLS on installation_photos
ALTER TABLE public.installation_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for installation_photos
CREATE POLICY "Installers can view photos for their assigned projects"
ON public.installation_photos FOR SELECT
USING (
  has_role(auth.uid(), 'installer'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.project_assignments pa
    JOIN public.team_members tm ON tm.team_id = pa.team_id
    WHERE pa.project_id = installation_photos.project_id
    AND tm.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

CREATE POLICY "Installers can upload photos for their assigned projects"
ON public.installation_photos FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'installer'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.project_assignments pa
    JOIN public.team_members tm ON tm.team_id = pa.team_id
    WHERE pa.project_id = project_id
    AND tm.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  ) AND
  uploaded_by = auth.uid()
);

CREATE POLICY "Admins and PMs can view all installation photos"
ON public.installation_photos FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'project_manager'::app_role)
);

CREATE POLICY "Admins and PMs can manage installation photos"
ON public.installation_photos FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'project_manager'::app_role)
);

-- Add RLS policy for installers to view their assigned projects
CREATE POLICY "Installers can view their assigned projects"
ON public.install_projects FOR SELECT
USING (
  has_role(auth.uid(), 'installer'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.project_assignments pa
    JOIN public.team_members tm ON tm.team_id = pa.team_id
    WHERE pa.project_id = install_projects.id
    AND tm.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Add RLS policy for installers to view project assignments
CREATE POLICY "Installers can view their team assignments"
ON public.project_assignments FOR SELECT
USING (
  has_role(auth.uid(), 'installer'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = project_assignments.team_id
    AND tm.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Add RLS policy for installers to update assignment status
CREATE POLICY "Installers can update their assignment status"
ON public.project_assignments FOR UPDATE
USING (
  has_role(auth.uid(), 'installer'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = project_assignments.team_id
    AND tm.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Add RLS policy for installers to view their tasks
CREATE POLICY "Installers can view their team tasks"
ON public.project_tasks FOR SELECT
USING (
  has_role(auth.uid(), 'installer'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = project_tasks.assigned_to_team
    AND tm.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Add RLS policy for installers to update task status
CREATE POLICY "Installers can update their task status"
ON public.project_tasks FOR UPDATE
USING (
  has_role(auth.uid(), 'installer'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = project_tasks.assigned_to_team
    AND tm.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Create storage bucket for installation photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'installation-photos',
  'installation-photos',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for installation photos
CREATE POLICY "Installers can upload photos for their projects"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'installation-photos' AND
  has_role(auth.uid(), 'installer'::app_role) AND
  (storage.foldername(name))[1] IN (
    SELECT pa.project_id::text
    FROM public.project_assignments pa
    JOIN public.team_members tm ON tm.team_id = pa.team_id
    WHERE tm.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

CREATE POLICY "Installers can view photos for their projects"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'installation-photos' AND
  (
    has_role(auth.uid(), 'installer'::app_role) AND
    (storage.foldername(name))[1] IN (
      SELECT pa.project_id::text
      FROM public.project_assignments pa
      JOIN public.team_members tm ON tm.team_id = pa.team_id
      WHERE tm.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
);

CREATE POLICY "Admins and PMs can view all installation photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'installation-photos' AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'project_manager'::app_role)
  )
);

CREATE POLICY "Admins and PMs can delete installation photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'installation-photos' AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'project_manager'::app_role)
  )
);