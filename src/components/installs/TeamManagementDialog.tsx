import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { TeamMembersDialog } from "./TeamMembersDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface TeamManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Team = {
  id: string;
  team_name: string;
  specialty: string;
  is_active: boolean;
  created_at: string;
};

export function TeamManagementDialog({ open, onOpenChange }: TeamManagementDialogProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchTeams();
      subscribeToTeams();
    }
  }, [open]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("install_teams")
        .select("*")
        .order("team_name");

      if (error) throw error;
      setTeams(data || []);
    } catch (error: any) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToTeams = () => {
    const channel = supabase
      .channel("teams_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "install_teams",
        },
        () => {
          fetchTeams();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      const { error } = await supabase
        .from("install_teams")
        .delete()
        .eq("id", teamToDelete);

      if (error) throw error;

      toast.success("Team deleted successfully");
      setDeleteDialogOpen(false);
      setTeamToDelete(null);
      fetchTeams();
    } catch (error: any) {
      console.error("Error deleting team:", error);
      toast.error("Failed to delete team. It may have active assignments.");
    }
  };

  const toggleTeamStatus = async (teamId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("install_teams")
        .update({ is_active: !currentStatus })
        .eq("id", teamId);

      if (error) throw error;

      toast.success(`Team ${!currentStatus ? "activated" : "deactivated"}`);
      fetchTeams();
    } catch (error: any) {
      console.error("Error updating team status:", error);
      toast.error("Failed to update team status");
    }
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors: Record<string, string> = {
      general: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      plumbing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      electrical: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      flooring: "bg-green-500/10 text-green-500 border-green-500/20",
      countertops: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      painting: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    };
    return colors[specialty] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Team Management</DialogTitle>
                <DialogDescription>Manage installation teams and members</DialogDescription>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Team
              </Button>
            </div>
          </DialogHeader>

          <Card>
            <CardHeader>
              <CardTitle>Installation Teams</CardTitle>
              <CardDescription>View and manage your teams by specialty</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading teams...</div>
              ) : teams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No teams yet. Create your first team to get started.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Team Name</TableHead>
                        <TableHead>Specialty</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teams.map((team) => (
                        <TableRow key={team.id}>
                          <TableCell className="font-medium">{team.team_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getSpecialtyColor(team.specialty)}>
                              {team.specialty}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleTeamStatus(team.id, team.is_active)}
                            >
                              <Badge
                                variant={team.is_active ? "default" : "secondary"}
                              >
                                {team.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTeamId(team.id);
                                  setMembersDialogOpen(true);
                                }}
                              >
                                <Users className="w-4 h-4 mr-1" />
                                Members
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setTeamToDelete(team.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <CreateTeamDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchTeams}
      />

      {selectedTeamId && (
        <TeamMembersDialog
          teamId={selectedTeamId}
          open={membersDialogOpen}
          onOpenChange={(open) => {
            setMembersDialogOpen(open);
            if (!open) setSelectedTeamId(null);
          }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this team? This action cannot be undone.
              Team members will not be deleted but will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTeamToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTeam} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
