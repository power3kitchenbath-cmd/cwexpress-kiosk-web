import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/use-user-role";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Calendar, Users, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { CreateProjectDialog } from "@/components/installs/CreateProjectDialog";
import { ProjectDetailsDialog } from "@/components/installs/ProjectDetailsDialog";
import { TeamManagementDialog } from "@/components/installs/TeamManagementDialog";

type Project = {
  id: string;
  project_name: string;
  customer_name: string;
  customer_email: string;
  project_type: string;
  status: string;
  priority: string;
  start_date: string;
  target_completion_date: string;
  budget: number;
  actual_cost: number;
  created_at: string;
};

export default function InstallProjectsDashboard() {
  const navigate = useNavigate();
  const { isAdmin, isProjectManager, loading: roleLoading } = useUserRole();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    active: 0,
    onSchedule: 0,
    behindSchedule: 0,
    totalBudget: 0,
    actualCost: 0,
  });

  useEffect(() => {
    if (!roleLoading && !isProjectManager) {
      navigate("/");
      toast.error("Access denied. Project managers only.");
    }
  }, [isProjectManager, roleLoading, navigate]);

  useEffect(() => {
    if (isProjectManager) {
      fetchProjects();
      subscribeToProjects();
    }
  }, [isProjectManager]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("install_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProjects(data || []);
      calculateStats(data || []);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToProjects = () => {
    const channel = supabase
      .channel("install_projects_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "install_projects",
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const calculateStats = (projectsData: Project[]) => {
    const active = projectsData.filter(
      (p) => p.status === "in_progress" || p.status === "scheduled"
    ).length;

    const now = new Date();
    let onSchedule = 0;
    let behindSchedule = 0;

    projectsData.forEach((p) => {
      if (p.status !== "completed" && p.status !== "cancelled") {
        const targetDate = new Date(p.target_completion_date);
        if (targetDate < now) {
          behindSchedule++;
        } else {
          onSchedule++;
        }
      }
    });

    const totalBudget = projectsData.reduce((sum, p) => sum + Number(p.budget), 0);
    const actualCost = projectsData.reduce((sum, p) => sum + Number(p.actual_cost), 0);

    setStats({ active, onSchedule, behindSchedule, totalBudget, actualCost });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      in_progress: "bg-green-500/10 text-green-500 border-green-500/20",
      on_hold: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      completed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[status] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      urgent: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[priority] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (roleLoading || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Power 3 Installs Dashboard</h1>
          <p className="text-muted-foreground">Manage installation projects and teams</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setTeamDialogOpen(true)} variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Teams
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">In progress or scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">On Schedule</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.onSchedule}</div>
            <p className="text-xs text-muted-foreground">Meeting target dates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Behind Schedule</CardTitle>
            <AlertCircle className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.behindSchedule}</div>
            <p className="text-xs text-muted-foreground">Past target date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.actualCost.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              of ${stats.totalBudget.toLocaleString()} budget
            </p>
            <Progress 
              value={(stats.actualCost / stats.totalBudget) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>View and manage all installation projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Target Completion</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No projects found. Create your first project to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => (
                    <TableRow 
                      key={project.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedProject(project.id)}
                    >
                      <TableCell className="font-medium">{project.project_name}</TableCell>
                      <TableCell>{project.customer_name}</TableCell>
                      <TableCell className="capitalize">{project.project_type.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(project.start_date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{format(new Date(project.target_completion_date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>${project.budget.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project.id);
                        }}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateProjectDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={fetchProjects} />
      <TeamManagementDialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen} />
      {selectedProject && (
        <ProjectDetailsDialog 
          projectId={selectedProject} 
          open={!!selectedProject} 
          onOpenChange={(open) => !open && setSelectedProject(null)}
          onUpdate={fetchProjects}
        />
      )}
    </div>
  );
}
