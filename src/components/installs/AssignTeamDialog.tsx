import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { format, isAfter, isBefore, isWithinInterval, parseISO } from "date-fns";
import { Calendar as CalendarIcon, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Team {
  id: string;
  team_name: string;
  specialty: string;
  is_active: boolean;
}

interface Conflict {
  project_name: string;
  scheduled_start: string;
  scheduled_end: string;
}

interface AssignTeamDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AssignTeamDialog({ projectId, open, onOpenChange, onSuccess }: AssignTeamDialogProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [conflicts, setConflicts] = useState<Record<string, Conflict[]>>({});
  const [workload, setWorkload] = useState<Record<string, number>>({});

  useEffect(() => {
    if (open) {
      fetchTeams();
      fetchWorkload();
    }
  }, [open]);

  useEffect(() => {
    if (selectedTeamId && startDate && endDate) {
      checkConflicts(selectedTeamId, startDate, endDate);
    }
  }, [selectedTeamId, startDate, endDate]);

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
    }
  };

  const fetchWorkload = async () => {
    try {
      const { data, error } = await supabase
        .from("project_assignments")
        .select("team_id")
        .in("status", ["scheduled", "in_progress"]);

      if (error) throw error;

      const workloadMap: Record<string, number> = {};
      data?.forEach((assignment) => {
        workloadMap[assignment.team_id] = (workloadMap[assignment.team_id] || 0) + 1;
      });
      setWorkload(workloadMap);
    } catch (error: any) {
      console.error("Error fetching workload:", error);
    }
  };

  const checkConflicts = async (teamId: string, start: Date, end: Date) => {
    try {
      const { data, error } = await supabase
        .from("project_assignments")
        .select(`
          scheduled_start,
          scheduled_end,
          install_projects (
            project_name
          )
        `)
        .eq("team_id", teamId)
        .neq("project_id", projectId)
        .in("status", ["scheduled", "in_progress"]);

      if (error) throw error;

      const conflictList: Conflict[] = [];
      data?.forEach((assignment) => {
        const assignStart = parseISO(assignment.scheduled_start);
        const assignEnd = parseISO(assignment.scheduled_end);

        const hasOverlap =
          isWithinInterval(start, { start: assignStart, end: assignEnd }) ||
          isWithinInterval(end, { start: assignStart, end: assignEnd }) ||
          (isBefore(start, assignStart) && isAfter(end, assignEnd));

        if (hasOverlap) {
          conflictList.push({
            project_name: (assignment.install_projects as any)?.project_name || "Unknown Project",
            scheduled_start: assignment.scheduled_start,
            scheduled_end: assignment.scheduled_end,
          });
        }
      });

      setConflicts({ [teamId]: conflictList });
    } catch (error: any) {
      console.error("Error checking conflicts:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeamId || !startDate || !endDate) {
      toast.error("Please select a team and date range");
      return;
    }

    if (isAfter(startDate, endDate)) {
      toast.error("Start date must be before end date");
      return;
    }

    if (conflicts[selectedTeamId]?.length > 0) {
      toast.error("Cannot assign team with scheduling conflicts");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("project_assignments").insert({
        project_id: projectId,
        team_id: selectedTeamId,
        scheduled_start: format(startDate, "yyyy-MM-dd"),
        scheduled_end: format(endDate, "yyyy-MM-dd"),
        status: "scheduled",
        notes: notes || null,
      });

      if (error) throw error;

      toast.success("Team assigned successfully");
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Error assigning team:", error);
      toast.error("Failed to assign team");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedTeamId("");
    setStartDate(undefined);
    setEndDate(undefined);
    setNotes("");
    setConflicts({});
    onOpenChange(false);
  };

  const getWorkloadColor = (count: number) => {
    if (count === 0) return "bg-green-500/10 text-green-500";
    if (count <= 2) return "bg-yellow-500/10 text-yellow-500";
    return "bg-red-500/10 text-red-500";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Team to Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label>Select Team</Label>
            <RadioGroup value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <div className="grid gap-3">
                {teams.map((team) => {
                  const teamWorkload = workload[team.id] || 0;
                  const teamConflicts = conflicts[team.id] || [];

                  return (
                    <Card
                      key={team.id}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedTeamId === team.id && "border-primary"
                      )}
                      onClick={() => setSelectedTeamId(team.id)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <RadioGroupItem value={team.id} id={team.id} />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor={team.id} className="cursor-pointer font-semibold">
                                {team.team_name}
                              </Label>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={getWorkloadColor(teamWorkload)}
                                >
                                  <Users className="w-3 h-3 mr-1" />
                                  {teamWorkload} active projects
                                </Badge>
                                {!team.is_active && (
                                  <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{team.specialty}</p>
                            
                            {selectedTeamId === team.id && teamConflicts.length > 0 && (
                              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-destructive mb-2">
                                      Scheduling Conflicts Detected
                                    </p>
                                    {teamConflicts.map((conflict, idx) => (
                                      <p key={idx} className="text-sm text-muted-foreground">
                                        {conflict.project_name}:{" "}
                                        {format(parseISO(conflict.scheduled_start), "MMM dd")} -{" "}
                                        {format(parseISO(conflict.scheduled_end), "MMM dd, yyyy")}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {selectedTeamId === team.id && startDate && endDate && teamConflicts.length === 0 && (
                              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  <p className="text-sm text-green-600">
                                    No conflicts - Team is available for selected dates
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => isBefore(date, new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => !startDate || isBefore(date, startDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions or notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !selectedTeamId ||
                !startDate ||
                !endDate ||
                (conflicts[selectedTeamId]?.length > 0)
              }
            >
              {loading ? "Assigning..." : "Assign Team"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
