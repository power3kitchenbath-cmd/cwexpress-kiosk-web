-- Create project share tokens table for secure customer access
CREATE TABLE public.project_share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.install_projects(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Create index for faster token lookups
CREATE INDEX idx_project_share_tokens_token ON public.project_share_tokens(token);
CREATE INDEX idx_project_share_tokens_project_id ON public.project_share_tokens(project_id);

-- Enable RLS
ALTER TABLE public.project_share_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for share tokens
CREATE POLICY "Admins and PMs can manage share tokens"
  ON public.project_share_tokens
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role));

-- Function to generate secure random token
CREATE OR REPLACE FUNCTION public.generate_project_share_token(project_id_param UUID, expires_days INTEGER DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_token TEXT;
  token_exists BOOLEAN;
BEGIN
  -- Check if user has permission
  IF NOT (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role)) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Generate unique token
  LOOP
    new_token := encode(gen_random_bytes(32), 'base64');
    new_token := replace(new_token, '/', '_');
    new_token := replace(new_token, '+', '-');
    new_token := replace(new_token, '=', '');
    
    SELECT EXISTS(SELECT 1 FROM project_share_tokens WHERE token = new_token) INTO token_exists;
    EXIT WHEN NOT token_exists;
  END LOOP;
  
  -- Insert token
  INSERT INTO project_share_tokens (project_id, token, expires_at, created_by)
  VALUES (
    project_id_param,
    new_token,
    CASE WHEN expires_days IS NOT NULL THEN now() + (expires_days || ' days')::INTERVAL ELSE NULL END,
    auth.uid()
  );
  
  RETURN new_token;
END;
$$;

-- Function to get project details by share token (public access)
CREATE OR REPLACE FUNCTION public.get_project_by_share_token(token_param TEXT)
RETURNS TABLE (
  project_id UUID,
  project_name TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  address JSONB,
  status TEXT,
  priority TEXT,
  services JSONB,
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  notes TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if token exists and is not expired
  IF NOT EXISTS (
    SELECT 1 FROM project_share_tokens 
    WHERE token = token_param 
    AND (expires_at IS NULL OR expires_at > now())
  ) THEN
    RAISE EXCEPTION 'Invalid or expired token';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.project_name,
    p.customer_name,
    p.customer_email,
    p.customer_phone,
    p.address,
    p.status,
    p.priority,
    p.services,
    p.start_date,
    p.target_completion_date,
    p.actual_completion_date,
    p.notes
  FROM install_projects p
  JOIN project_share_tokens t ON t.project_id = p.id
  WHERE t.token = token_param
  AND (t.expires_at IS NULL OR t.expires_at > now());
END;
$$;