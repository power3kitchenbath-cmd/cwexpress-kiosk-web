import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface TimeTrackingLogProps {
  projectId: string;
}

interface TimeEntry {
  id: string;
  clock_in_time: string;
  clock_out_time: string | null;
  hours_worked: number | null;
  labor_cost: number | null;
  notes: string | null;
  team_member: {
    name: string;
  };
  task: {
    task_name: string;
  };
}

export default function TimeTrackingLog({ projectId }: TimeTrackingLogProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, [projectId]);

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("time_tracking_entries")
        .select(`
          *,
          team_member:team_members(name),
          task:project_tasks(task_name, project_id)
        `)
        .eq("task.project_id", projectId)
        .order("clock_in_time", { ascending: false });

      if (error) throw error;
      setEntries(data as any || []);
    } catch (error: any) {
      console.error("Error loading time entries:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Tracking Log
          </span>
          <Badge variant="secondary">{entries.length} entries</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No time entries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-sm">{entry.team_member.name}</h4>
                          {!entry.clock_out_time && (
                            <Badge variant="default" className="bg-green-500">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {entry.task.task_name}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(entry.clock_in_time), "MMM d, h:mm a")}
                          </span>
                          {entry.clock_out_time && (
                            <>
                              <span>→</span>
                              <span>{format(new Date(entry.clock_out_time), "h:mm a")}</span>
                            </>
                          )}
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            "{entry.notes}"
                          </p>
                        )}
                      </div>
                      {entry.hours_worked && (
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1 text-lg font-bold">
                            <Clock className="h-4 w-4" />
                            {entry.hours_worked.toFixed(2)}h
                          </div>
                          {entry.labor_cost && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <DollarSign className="h-3 w-3" />
                              {entry.labor_cost.toFixed(2)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
