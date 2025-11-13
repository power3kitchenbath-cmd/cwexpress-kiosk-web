import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Calendar, 
  Mail, 
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  Plus
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface WarmupSchedule {
  id: string;
  domain: string;
  start_date: string;
  current_day: number;
  daily_limit: number;
  status: "active" | "paused" | "completed";
  created_at: string;
}

interface DailyStats {
  date: string;
  emails_sent: number;
  target_volume: number;
  percentage_used: number;
  exceeded_limit: boolean;
}

export const EmailWarmupTracker = () => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<WarmupSchedule[]>([]);
  const [dailyStats, setDailyStats] = useState<Record<string, DailyStats[]>>({});
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data: schedulesData, error: schedulesError } = await supabase
        .from("email_warmup_schedule" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (schedulesError) throw schedulesError;

      const schedules = (schedulesData as unknown as WarmupSchedule[]) || [];
      setSchedules(schedules);

      // Fetch daily stats for each schedule
      const statsPromises = schedules.map(async (schedule) => {
        const { data, error } = await supabase
          .from("email_warmup_daily_stats" as any)
          .select("*")
          .eq("warmup_schedule_id", schedule.id)
          .order("date", { ascending: true })
          .limit(30);

        if (error) {
          console.error("Error fetching daily stats:", error);
          return { scheduleId: schedule.id, stats: [] };
        }

        return { scheduleId: schedule.id, stats: data as unknown as DailyStats[] };
      });

      const statsResults = await Promise.all(statsPromises);
      const statsMap: Record<string, DailyStats[]> = {};
      statsResults.forEach(({ scheduleId, stats }) => {
        statsMap[scheduleId] = stats;
      });
      setDailyStats(statsMap);
    } catch (error) {
      console.error("Error fetching warm-up schedules:", error);
      toast({
        title: "Error",
        description: "Failed to load warm-up schedules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartWarmup = async () => {
    if (!newDomain) {
      toast({
        title: "Domain Required",
        description: "Please enter a domain to start warm-up",
        variant: "destructive",
      });
      return;
    }

    try {
      setAdding(true);
      
      // Calculate initial daily limit (day 1)
      const initialLimit = 20;

      const { error } = await supabase
        .from("email_warmup_schedule" as any)
        .insert({
          domain: newDomain,
          start_date: new Date().toISOString().split("T")[0],
          current_day: 1,
          daily_limit: initialLimit,
          status: "active",
        } as any);

      if (error) throw error;

      toast({
        title: "Warm-up Started",
        description: `Email warm-up schedule created for ${newDomain}`,
      });

      setNewDomain("");
      fetchSchedules();
    } catch (error) {
      console.error("Error starting warm-up:", error);
      toast({
        title: "Error",
        description: "Failed to start warm-up schedule",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleToggleStatus = async (schedule: WarmupSchedule) => {
    try {
      const newStatus = schedule.status === "active" ? "paused" : "active";
      
      const { error } = await supabase
        .from("email_warmup_schedule" as any)
        .update({ status: newStatus } as any)
        .eq("id", schedule.id);

      if (error) throw error;

      toast({
        title: `Warm-up ${newStatus === "active" ? "Resumed" : "Paused"}`,
        description: `Schedule for ${schedule.domain} is now ${newStatus}`,
      });

      fetchSchedules();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update warm-up status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "paused":
        return <Badge variant="secondary">Paused</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getDaysElapsed = (startDate: string) => {
    return differenceInDays(new Date(), new Date(startDate)) + 1;
  };

  const getWarmupProgress = (currentDay: number) => {
    const totalDays = 35; // Standard warm-up period
    return Math.min((currentDay / totalDays) * 100, 100);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Warm-up Tracker</CardTitle>
          <CardDescription>Loading warm-up schedules...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Email Warm-up Tracker
          </CardTitle>
          <CardDescription>
            Gradually increase sending volume to build sender reputation for new domains or IPs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertTitle>About Email Warm-up</AlertTitle>
            <AlertDescription>
              Email warm-up is the process of gradually increasing your sending volume when using
              a new domain or IP address. This builds trust with email providers and prevents your
              emails from being marked as spam. A typical warm-up takes 35-45 days.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="domain">Domain to Warm Up</Label>
              <Input
                id="domain"
                placeholder="mail.example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleStartWarmup} disabled={adding}>
                <Plus className="mr-2 h-4 w-4" />
                Start Warm-up
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No warm-up schedules yet. Start one above to begin building sender reputation.
            </p>
          </CardContent>
        </Card>
      ) : (
        schedules.map((schedule) => {
          const stats = dailyStats[schedule.id] || [];
          const daysElapsed = getDaysElapsed(schedule.start_date);
          const progress = getWarmupProgress(daysElapsed);
          const todayStats = stats.find((s) => s.date === new Date().toISOString().split("T")[0]);

          return (
            <Card key={schedule.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {schedule.domain}
                      {getStatusBadge(schedule.status)}
                    </CardTitle>
                    <CardDescription>
                      Started {format(new Date(schedule.start_date), "PPP")} • Day {daysElapsed}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(schedule)}
                  >
                    {schedule.status === "active" ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Resume
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Warm-up Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {progress.toFixed(0)}% Complete
                    </span>
                  </div>
                  <Progress value={progress} />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended warm-up period: 35 days
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Today's Limit</span>
                    </div>
                    <div className="text-2xl font-bold">{schedule.daily_limit}</div>
                  </div>

                  {todayStats && (
                    <>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Today's Usage</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold">{todayStats.emails_sent}</div>
                          <span className="text-sm text-muted-foreground">
                            ({todayStats.percentage_used.toFixed(0)}%)
                          </span>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {todayStats.exceeded_limit ? (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                          <span className="text-sm text-muted-foreground">Status</span>
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            todayStats.exceeded_limit ? "text-destructive" : "text-green-500"
                          }`}
                        >
                          {todayStats.exceeded_limit ? "Limit Exceeded!" : "On Track"}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {stats.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-4">Sending Volume History</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={stats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => format(new Date(value), "MMM dd")}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) => format(new Date(value as string), "PPP")}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="target_volume"
                          stroke="hsl(var(--muted-foreground))"
                          name="Target"
                          strokeDasharray="5 5"
                        />
                        <Line
                          type="monotone"
                          dataKey="emails_sent"
                          stroke="hsl(var(--primary))"
                          name="Actual Sent"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Warm-up Best Practices</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Send to your most engaged recipients first</li>
                    <li>• Maintain consistent sending patterns (same time each day)</li>
                    <li>• Monitor bounce rates and spam complaints closely</li>
                    <li>• Avoid sudden spikes in volume</li>
                    <li>• Ensure high-quality content and list hygiene</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};
