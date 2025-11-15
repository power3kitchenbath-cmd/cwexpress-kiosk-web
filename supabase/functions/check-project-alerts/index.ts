import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Project {
  id: string;
  project_name: string;
  target_completion_date: string;
  budget: number;
  actual_cost: number;
  status: string;
}

interface Task {
  id: string;
  project_id: string;
  task_name: string;
  due_date: string;
  status: string;
  priority: string;
  install_projects: {
    project_name: string;
  };
}

interface Assignment {
  id: string;
  project_id: string;
  team_id: string;
  scheduled_start: string;
  scheduled_end: string;
  install_projects: {
    project_name: string;
  };
  install_teams: {
    team_name: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting project alerts check...');

    // Check for deadline alerts (projects and tasks due within 7 days)
    await checkDeadlineAlerts(supabase);

    // Check for budget alerts (>80% budget used)
    await checkBudgetAlerts(supabase);

    // Check for scheduling conflicts
    await checkSchedulingConflicts(supabase);

    // Check for overdue tasks
    await checkOverdueTasks(supabase);

    console.log('Project alerts check completed');

    return new Response(
      JSON.stringify({ success: true, message: 'Alerts checked successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error checking project alerts:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function checkDeadlineAlerts(supabase: any) {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  // Check projects
  const { data: projects, error: projectsError } = await supabase
    .from('install_projects')
    .select('id, project_name, target_completion_date, budget, actual_cost, status')
    .in('status', ['pending', 'scheduled', 'in_progress'])
    .lte('target_completion_date', sevenDaysFromNow.toISOString())
    .gte('target_completion_date', new Date().toISOString());

  if (projectsError) throw projectsError;

  for (const project of projects || []) {
    const daysUntilDue = Math.ceil(
      (new Date(project.target_completion_date).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Check if notification already exists today
    const { data: existingNotif } = await supabase
      .from('admin_notifications')
      .select('id')
      .eq('type', 'deadline_approaching')
      .eq('data->>project_id', project.id)
      .gte('created_at', new Date().toISOString().split('T')[0]);

    if (!existingNotif || existingNotif.length === 0) {
      await supabase.from('admin_notifications').insert({
        type: 'deadline_approaching',
        severity: daysUntilDue <= 3 ? 'critical' : 'warning',
        title: 'Project Deadline Approaching',
        message: `${project.project_name} is due in ${daysUntilDue} days`,
        data: {
          project_id: project.id,
          project_name: project.project_name,
          days_until_due: daysUntilDue,
          target_date: project.target_completion_date,
        },
        expires_at: new Date(project.target_completion_date).toISOString(),
      });
      console.log(`Created deadline alert for project: ${project.project_name}`);
    }
  }

  // Check tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('project_tasks')
    .select(`
      id,
      project_id,
      task_name,
      due_date,
      status,
      priority,
      install_projects (project_name)
    `)
    .eq('status', 'pending')
    .lte('due_date', sevenDaysFromNow.toISOString())
    .gte('due_date', new Date().toISOString());

  if (tasksError) throw tasksError;

  for (const task of tasks || []) {
    const daysUntilDue = Math.ceil(
      (new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    const { data: existingNotif } = await supabase
      .from('admin_notifications')
      .select('id')
      .eq('type', 'task_deadline_approaching')
      .eq('data->>task_id', task.id)
      .gte('created_at', new Date().toISOString().split('T')[0]);

    if (!existingNotif || existingNotif.length === 0) {
      await supabase.from('admin_notifications').insert({
        type: 'task_deadline_approaching',
        severity: task.priority === 'high' && daysUntilDue <= 2 ? 'critical' : 'warning',
        title: 'Task Deadline Approaching',
        message: `Task "${task.task_name}" is due in ${daysUntilDue} days`,
        data: {
          task_id: task.id,
          task_name: task.task_name,
          project_id: task.project_id,
          project_name: task.install_projects?.project_name,
          days_until_due: daysUntilDue,
          priority: task.priority,
        },
        expires_at: new Date(task.due_date).toISOString(),
      });
      console.log(`Created deadline alert for task: ${task.task_name}`);
    }
  }
}

async function checkBudgetAlerts(supabase: any) {
  const { data: projects, error } = await supabase
    .from('install_projects')
    .select('id, project_name, budget, actual_cost, status')
    .in('status', ['in_progress', 'scheduled'])
    .gt('budget', 0);

  if (error) throw error;

  for (const project of projects || []) {
    const budgetPercentage = (project.actual_cost / project.budget) * 100;

    if (budgetPercentage >= 80) {
      // Check if notification already exists today
      const { data: existingNotif } = await supabase
        .from('admin_notifications')
        .select('id')
        .eq('type', 'budget_exceeded')
        .eq('data->>project_id', project.id)
        .gte('created_at', new Date().toISOString().split('T')[0]);

      if (!existingNotif || existingNotif.length === 0) {
        await supabase.from('admin_notifications').insert({
          type: 'budget_exceeded',
          severity: budgetPercentage >= 100 ? 'critical' : 'warning',
          title: 'Budget Alert',
          message: `${project.project_name} has used ${budgetPercentage.toFixed(1)}% of budget`,
          data: {
            project_id: project.id,
            project_name: project.project_name,
            budget: project.budget,
            actual_cost: project.actual_cost,
            budget_percentage: budgetPercentage.toFixed(1),
          },
        });
        console.log(`Created budget alert for project: ${project.project_name}`);
      }
    }
  }
}

async function checkSchedulingConflicts(supabase: any) {
  const { data: assignments, error } = await supabase
    .from('project_assignments')
    .select(`
      id,
      project_id,
      team_id,
      scheduled_start,
      scheduled_end,
      install_projects (project_name),
      install_teams (team_name)
    `)
    .eq('status', 'scheduled');

  if (error) throw error;

  const teamAssignments: Record<string, Assignment[]> = {};
  
  for (const assignment of assignments || []) {
    if (!teamAssignments[assignment.team_id]) {
      teamAssignments[assignment.team_id] = [];
    }
    teamAssignments[assignment.team_id].push(assignment);
  }

  for (const [teamId, teamAssigns] of Object.entries(teamAssignments)) {
    for (let i = 0; i < teamAssigns.length; i++) {
      for (let j = i + 1; j < teamAssigns.length; j++) {
        const assign1 = teamAssigns[i];
        const assign2 = teamAssigns[j];

        const start1 = new Date(assign1.scheduled_start);
        const end1 = new Date(assign1.scheduled_end);
        const start2 = new Date(assign2.scheduled_start);
        const end2 = new Date(assign2.scheduled_end);

        const hasConflict =
          (start1 <= start2 && end1 >= start2) ||
          (start2 <= start1 && end2 >= start1);

        if (hasConflict) {
          const { data: existingNotif } = await supabase
            .from('admin_notifications')
            .select('id')
            .eq('type', 'scheduling_conflict')
            .eq('data->>assignment1_id', assign1.id)
            .eq('data->>assignment2_id', assign2.id)
            .gte('created_at', new Date().toISOString().split('T')[0]);

          if (!existingNotif || existingNotif.length === 0) {
            await supabase.from('admin_notifications').insert({
              type: 'scheduling_conflict',
              severity: 'critical',
              title: 'Scheduling Conflict Detected',
              message: `Team ${assign1.install_teams?.team_name} has overlapping assignments`,
              data: {
                team_id: teamId,
                team_name: assign1.install_teams?.team_name,
                assignment1_id: assign1.id,
                assignment2_id: assign2.id,
                project1: assign1.install_projects?.project_name,
                project2: assign2.install_projects?.project_name,
              },
            });
            console.log(`Created conflict alert for team: ${assign1.install_teams?.team_name}`);
          }
        }
      }
    }
  }
}

async function checkOverdueTasks(supabase: any) {
  const { data: tasks, error } = await supabase
    .from('project_tasks')
    .select(`
      id,
      project_id,
      task_name,
      due_date,
      priority,
      install_projects (project_name)
    `)
    .eq('status', 'pending')
    .lt('due_date', new Date().toISOString());

  if (error) throw error;

  for (const task of tasks || []) {
    const daysOverdue = Math.ceil(
      (new Date().getTime() - new Date(task.due_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    const { data: existingNotif } = await supabase
      .from('admin_notifications')
      .select('id')
      .eq('type', 'task_overdue')
      .eq('data->>task_id', task.id)
      .gte('created_at', new Date().toISOString().split('T')[0]);

    if (!existingNotif || existingNotif.length === 0) {
      await supabase.from('admin_notifications').insert({
        type: 'task_overdue',
        severity: 'critical',
        title: 'Overdue Task',
        message: `Task "${task.task_name}" is ${daysOverdue} days overdue`,
        data: {
          task_id: task.id,
          task_name: task.task_name,
          project_id: task.project_id,
          project_name: task.install_projects?.project_name,
          days_overdue: daysOverdue,
          priority: task.priority,
        },
      });
      console.log(`Created overdue alert for task: ${task.task_name}`);
    }
  }
}
