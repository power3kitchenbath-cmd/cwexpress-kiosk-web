import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { Mail, Phone, MapPin, Calendar, DollarSign } from "lucide-react";
import { TaskManagementTab } from "./TaskManagementTab";
import { ProjectAssignmentsTab } from "./ProjectAssignmentsTab";
import ProjectLaborSummary from "@/components/admin/ProjectLaborSummary";
import TimeTrackingLog from "@/components/admin/TimeTrackingLog";

interface ProjectDetailsDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function ProjectDetailsDialog({ projectId, open, onOpenChange, onUpdate }: ProjectDetailsDialogProps) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && projectId) {
      fetchProjectDetails();
    }
  }, [open, projectId]);

  const fetchProjectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("install_projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error: any) {
      console.error("Error fetching project:", error);
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from("install_projects")
        .update({ status: newStatus })
        .eq("id", projectId);

      if (error) throw error;
      
      toast.success("Status updated");
      fetchProjectDetails();
      onUpdate();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!project) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      in_progress: "bg-green-500/10 text-green-500 border-green-500/20",
      on_hold: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      completed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[status] || "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{project.project_name}</DialogTitle>
            <Badge variant="outline" className={getStatusColor(project.status)}>
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="time">Time Tracking</TabsTrigger>
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Project Information</CardTitle>
                    <CardDescription>Customer and project details</CardDescription>
                  </div>
                  <Select value={project.status} onValueChange={updateStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Customer</h4>
                    <p className="font-medium">{project.customer_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {project.customer_email}
                    </div>
                    {project.customer_phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {project.customer_phone}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Location</h4>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p>{project.address.street}</p>
                        <p>
                          {project.address.city}, {project.address.state} {project.address.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Timeline</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Start: {format(new Date(project.start_date), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Target: {format(new Date(project.target_completion_date), "MMM dd, yyyy")}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Budget</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>Budget: ${project.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>Spent: ${project.actual_cost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.services.map((service: string) => (
                      <Badge key={service} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                {project.notes && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Notes</h4>
                    <p className="text-sm text-muted-foreground">{project.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <ProjectAssignmentsTab projectId={projectId} />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManagementTab projectId={projectId} />
          </TabsContent>

          <TabsContent value="time" className="space-y-4">
            <ProjectLaborSummary projectId={projectId} />
            <TimeTrackingLog projectId={projectId} />
          </TabsContent>

          <TabsContent value="kpis">
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Track project performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  KPI tracking features coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
