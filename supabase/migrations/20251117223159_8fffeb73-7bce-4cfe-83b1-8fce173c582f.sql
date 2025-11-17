-- Create time tracking table for installers
CREATE TABLE public.time_tracking_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.project_tasks(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  clock_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  clock_out_time TIMESTAMP WITH TIME ZONE,
  hours_worked NUMERIC(10, 2),
  hourly_rate NUMERIC(10, 2),
  labor_cost NUMERIC(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_time_tracking_task_id ON public.time_tracking_entries(task_id);
CREATE INDEX idx_time_tracking_team_member_id ON public.time_tracking_entries(team_member_id);
CREATE INDEX idx_time_tracking_clock_in ON public.time_tracking_entries(clock_in_time);

-- Enable RLS
ALTER TABLE public.time_tracking_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for time tracking
CREATE POLICY "Admins and PMs can manage all time entries"
  ON public.time_tracking_entries
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role));

CREATE POLICY "Installers can view their team's time entries"
  ON public.time_tracking_entries
  FOR SELECT
  USING (
    has_role(auth.uid(), 'installer'::app_role) AND
    EXISTS (
      SELECT 1 FROM public.team_members tm
      JOIN public.project_tasks pt ON pt.assigned_to_team = tm.team_id
      WHERE tm.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND pt.id = time_tracking_entries.task_id
    )
  );

CREATE POLICY "Installers can create their own time entries"
  ON public.time_tracking_entries
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'installer'::app_role) AND
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.id = time_tracking_entries.team_member_id
      AND tm.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Installers can update their own time entries"
  ON public.time_tracking_entries
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'installer'::app_role) AND
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.id = time_tracking_entries.team_member_id
      AND tm.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Trigger to automatically calculate hours and labor cost
CREATE OR REPLACE FUNCTION public.calculate_time_tracking_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only calculate if clock_out_time is set
  IF NEW.clock_out_time IS NOT NULL THEN
    -- Calculate hours worked
    NEW.hours_worked := EXTRACT(EPOCH FROM (NEW.clock_out_time - NEW.clock_in_time)) / 3600.0;
    
    -- Get hourly rate from team member if not set
    IF NEW.hourly_rate IS NULL THEN
      SELECT hourly_rate INTO NEW.hourly_rate
      FROM public.team_members
      WHERE id = NEW.team_member_id;
    END IF;
    
    -- Calculate labor cost
    IF NEW.hourly_rate IS NOT NULL THEN
      NEW.labor_cost := NEW.hours_worked * NEW.hourly_rate;
    END IF;
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_calculate_time_tracking_metrics
  BEFORE INSERT OR UPDATE ON public.time_tracking_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_time_tracking_metrics();

-- Function to get project labor summary
CREATE OR REPLACE FUNCTION public.get_project_labor_summary(project_id_param UUID)
RETURNS TABLE (
  total_hours NUMERIC,
  total_cost NUMERIC,
  team_member_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(tte.hours_worked), 0) as total_hours,
    COALESCE(SUM(tte.labor_cost), 0) as total_cost,
    COUNT(DISTINCT tte.team_member_id) as team_member_count
  FROM public.time_tracking_entries tte
  JOIN public.project_tasks pt ON pt.id = tte.task_id
  WHERE pt.project_id = project_id_param
  AND tte.clock_out_time IS NOT NULL;
END;
$$;