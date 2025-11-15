import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Calendar, Users, AlertTriangle, Trash2 } from "lucide-react";
import { AssignTeamDialog } from "./AssignTeamDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Assignment {
  id: string;
  team_id: string;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  notes: string | null;
  install_teams: {
    team_name: string;
    specialty: string;
    is_active: boolean;
  };
}

interface ProjectAssignmentsTabProps {
  projectId: string;
}

export function ProjectAssignmentsTab({ projectId }: ProjectAssignmentsTabProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();

    const channel = supabase
      .channel('project-assignments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_assignments',
          filter: `project_id=eq.${projectId}`
        },
        () => fetchAssignments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from("project_assignments")
        .select(`
          *,
          install_teams (
            team_name,
            specialty,
            is_active
          )
        `)
        .eq("project_id", projectId)
        .order("scheduled_start", { ascending: true });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error: any) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to load team assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("project_assignments")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;
      toast.success("Assignment removed");
      setDeleteId(null);
    } catch (error: any) {
      console.error("Error deleting assignment:", error);
      toast.error("Failed to remove assignment");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      in_progress: "bg-green-500/10 text-green-500 border-green-500/20",
      completed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[status] || "";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Team Assignments</CardTitle>
              <CardDescription>
                Teams scheduled for this project with workload balancing
              </CardDescription>
            </div>
            <Button onClick={() => setShowAssignDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Assign Team
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No teams assigned yet</p>
              <p className="text-sm mt-2">Click "Assign Team" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">
                            {assignment.install_teams.team_name}
                          </h4>
                          <Badge variant="outline" className={getStatusColor(assignment.status)}>
                            {assignment.status.replace('_', ' ')}
                          </Badge>
                          {!assignment.install_teams.is_active && (
                            <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                              Inactive Team
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {assignment.install_teams.specialty}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {format(new Date(assignment.scheduled_start), "MMM dd, yyyy")} →{" "}
                              {format(new Date(assignment.scheduled_end), "MMM dd, yyyy")}
                            </span>
                          </div>
                        </div>

                        {assignment.notes && (
                          <div className="mt-3 p-3 bg-muted rounded-md">
                            <p className="text-sm">{assignment.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(assignment.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AssignTeamDialog
        projectId={projectId}
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        onSuccess={fetchAssignments}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this team assignment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
