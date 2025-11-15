-- Create install_projects table
CREATE TABLE public.install_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  order_id UUID REFERENCES public.orders(id),
  quote_request_id UUID REFERENCES public.quote_requests(id),
  project_type TEXT NOT NULL CHECK (project_type IN ('kitchen', 'bath', 'full_renovation')),
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  address JSONB NOT NULL,
  start_date DATE NOT NULL,
  target_completion_date DATE NOT NULL,
  actual_completion_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  budget NUMERIC NOT NULL DEFAULT 0,
  actual_cost NUMERIC NOT NULL DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  assigned_pm UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create install_teams table
CREATE TABLE public.install_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  specialty TEXT NOT NULL CHECK (specialty IN ('general', 'plumbing', 'electrical', 'flooring', 'countertops', 'painting')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.install_teams(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  specialty TEXT NOT NULL,
  hourly_rate NUMERIC,
  certification_level TEXT NOT NULL CHECK (certification_level IN ('apprentice', 'journeyman', 'master')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  hire_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_assignments table
CREATE TABLE public.project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.install_projects(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.install_teams(id) ON DELETE CASCADE NOT NULL,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scheduled_start DATE NOT NULL,
  scheduled_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'reassigned')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_tasks table
CREATE TABLE public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.install_projects(id) ON DELETE CASCADE NOT NULL,
  task_name TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('milestone', 'inspection', 'installation', 'quality_check')),
  description TEXT,
  assigned_to_team UUID REFERENCES public.install_teams(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE NOT NULL,
  completed_date DATE,
  estimated_hours NUMERIC,
  actual_hours NUMERIC,
  dependencies JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_kpis table
CREATE TABLE public.project_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.install_projects(id) ON DELETE CASCADE NOT NULL,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completion_percentage NUMERIC NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  budget_used_percentage NUMERIC NOT NULL DEFAULT 0 CHECK (budget_used_percentage >= 0),
  schedule_variance_days INTEGER NOT NULL DEFAULT 0,
  quality_score NUMERIC CHECK (quality_score >= 0 AND quality_score <= 100),
  customer_satisfaction NUMERIC CHECK (customer_satisfaction >= 0 AND customer_satisfaction <= 5),
  issues_count INTEGER NOT NULL DEFAULT 0,
  safety_incidents INTEGER NOT NULL DEFAULT 0,
  team_efficiency_rating NUMERIC CHECK (team_efficiency_rating >= 0 AND team_efficiency_rating <= 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_issues table
CREATE TABLE public.project_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.install_projects(id) ON DELETE CASCADE NOT NULL,
  issue_type TEXT NOT NULL CHECK (issue_type IN ('delay', 'quality', 'safety', 'budget', 'customer', 'equipment')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  reported_by UUID REFERENCES auth.users(id) NOT NULL,
  reported_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  resolution TEXT,
  resolved_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.install_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.install_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_issues ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admins and Project Managers have full access

-- install_projects policies
CREATE POLICY "Admins and PMs can manage projects"
ON public.install_projects FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role));

-- install_teams policies
CREATE POLICY "Admins and PMs can manage teams"
ON public.install_teams FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role));

-- team_members policies
CREATE POLICY "Admins and PMs can manage team members"
ON public.team_members FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role));

-- project_assignments policies
CREATE POLICY "Admins and PMs can manage assignments"
ON public.project_assignments FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role));

-- project_tasks policies
CREATE POLICY "Admins and PMs can manage tasks"
ON public.project_tasks FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role));

-- project_kpis policies
CREATE POLICY "Admins and PMs can manage KPIs"
ON public.project_kpis FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role));

-- project_issues policies
CREATE POLICY "Admins and PMs can manage issues"
ON public.project_issues FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_install_projects_updated_at
  BEFORE UPDATE ON public.install_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_install_teams_updated_at
  BEFORE UPDATE ON public.install_teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_assignments_updated_at
  BEFORE UPDATE ON public.project_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_issues_updated_at
  BEFORE UPDATE ON public.project_issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.install_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_kpis;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_issues;