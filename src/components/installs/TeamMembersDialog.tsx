import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { AddTeamMemberDialog } from "./AddTeamMemberDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface TeamMembersDialogProps {
  teamId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TeamMember = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  specialty: string;
  hourly_rate: number | null;
  certification_level: string;
  is_active: boolean;
  hire_date: string;
  notes: string | null;
};

type Team = {
  id: string;
  team_name: string;
  specialty: string;
};

export function TeamMembersDialog({ teamId, open, onOpenChange }: TeamMembersDialogProps) {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (open && teamId) {
      fetchTeamAndMembers();
      subscribeToMembers();
    }
  }, [open, teamId]);

  const fetchTeamAndMembers = async () => {
    try {
      const [teamResult, membersResult] = await Promise.all([
        supabase.from("install_teams").select("*").eq("id", teamId).single(),
        supabase.from("team_members").select("*").eq("team_id", teamId).order("name"),
      ]);

      if (teamResult.error) throw teamResult.error;
      if (membersResult.error) throw membersResult.error;

      setTeam(teamResult.data);
      setMembers(membersResult.data || []);
    } catch (error: any) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMembers = () => {
    const channel = supabase
      .channel("team_members_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_members",
          filter: `team_id=eq.${teamId}`,
        },
        () => {
          fetchTeamAndMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberToDelete);

      if (error) throw error;

      toast.success("Team member removed successfully");
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
      fetchTeamAndMembers();
    } catch (error: any) {
      console.error("Error deleting member:", error);
      toast.error("Failed to remove team member");
    }
  };

  const toggleMemberStatus = async (memberId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .update({ is_active: !currentStatus })
        .eq("id", memberId);

      if (error) throw error;

      toast.success(`Member ${!currentStatus ? "activated" : "deactivated"}`);
      fetchTeamAndMembers();
    } catch (error: any) {
      console.error("Error updating member status:", error);
      toast.error("Failed to update member status");
    }
  };

  const getCertificationColor = (level: string) => {
    const colors: Record<string, string> = {
      apprentice: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      journeyman: "bg-green-500/10 text-green-500 border-green-500/20",
      master: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    };
    return colors[level] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  if (!team) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{team.team_name} - Members</DialogTitle>
                <DialogDescription>
                  Manage team members for this {team.specialty} team
                </DialogDescription>
              </div>
              <Button onClick={() => setAddMemberDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>
          </DialogHeader>

          <Card>
            <CardHeader>
              <CardTitle>Team Members ({members.length})</CardTitle>
              <CardDescription>View and manage member details</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading members...</div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No team members yet. Add your first member to get started.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Specialty</TableHead>
                        <TableHead>Certification</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Hire Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell>{member.specialty}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getCertificationColor(member.certification_level)}
                            >
                              {member.certification_level}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {member.phone && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="w-3 h-3" />
                                  {member.phone}
                                </div>
                              )}
                              {member.email && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Mail className="w-3 h-3" />
                                  {member.email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(member.hire_date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleMemberStatus(member.id, member.is_active)}
                            >
                              <Badge variant={member.is_active ? "default" : "secondary"}>
                                {member.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingMember(member);
                                  setAddMemberDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setMemberToDelete(member.id);
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

      <AddTeamMemberDialog
        teamId={teamId}
        member={editingMember}
        open={addMemberDialogOpen}
        onOpenChange={(open) => {
          setAddMemberDialogOpen(open);
          if (!open) setEditingMember(null);
        }}
        onSuccess={fetchTeamAndMembers}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this team member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
