import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Clock, PlayCircle, StopCircle, Calendar } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface TimeTrackingCardProps {
  taskId: string;
  taskName: string;
  teamMemberId: string;
}

interface ActiveEntry {
  id: string;
  clock_in_time: string;
  notes: string | null;
}

export default function TimeTrackingCard({ taskId, taskName, teamMemberId }: TimeTrackingCardProps) {
  const { toast } = useToast();
  const [activeEntry, setActiveEntry] = useState<ActiveEntry | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState("");

  useEffect(() => {
    checkActiveEntry();
  }, [taskId, teamMemberId]);

  useEffect(() => {
    if (!activeEntry) return;

    const interval = setInterval(() => {
      const elapsed = formatDistanceToNow(new Date(activeEntry.clock_in_time), { 
        includeSeconds: true 
      });
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEntry]);

  const checkActiveEntry = async () => {
    try {
      const { data, error } = await supabase
        .from("time_tracking_entries")
        .select("id, clock_in_time, notes")
        .eq("task_id", taskId)
        .eq("team_member_id", teamMemberId)
        .is("clock_out_time", null)
        .order("clock_in_time", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setActiveEntry(data);
        setNotes(data.notes || "");
      }
    } catch (error: any) {
      console.error("Error checking active entry:", error);
    }
  };

  const handleClockIn = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("time_tracking_entries")
        .insert({
          task_id: taskId,
          team_member_id: teamMemberId,
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: "Clocked In",
        description: `Started tracking time for ${taskName}`,
      });

      setNotes("");
      await checkActiveEntry();
    } catch (error: any) {
      console.error("Error clocking in:", error);
      toast({
        title: "Error",
        description: "Failed to clock in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!activeEntry) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("time_tracking_entries")
        .update({
          clock_out_time: new Date().toISOString(),
          notes: notes || null,
        })
        .eq("id", activeEntry.id);

      if (error) throw error;

      toast({
        title: "Clocked Out",
        description: `Stopped tracking time for ${taskName}`,
      });

      setActiveEntry(null);
      setNotes("");
    } catch (error: any) {
      console.error("Error clocking out:", error);
      toast({
        title: "Error",
        description: "Failed to clock out",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Tracking
          </span>
          {activeEntry && (
            <Badge variant="default" className="bg-green-500">
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeEntry ? (
          <>
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  Currently Tracking
                </span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {elapsedTime}
                </span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Started {format(new Date(activeEntry.clock_in_time), "MMM d 'at' h:mm a")}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this work session..."
                rows={3}
              />
            </div>

            <Button 
              onClick={handleClockOut} 
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              <StopCircle className="h-4 w-4 mr-2" />
              Clock Out
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes before starting..."
                rows={3}
              />
            </div>

            <Button 
              onClick={handleClockIn} 
              disabled={loading}
              className="w-full"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Clock In
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
