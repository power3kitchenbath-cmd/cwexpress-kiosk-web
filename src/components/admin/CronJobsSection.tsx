import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Info, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CronJob {
  jobid: number;
  schedule: string;
  command: string;
  nodename: string;
  nodeport: number;
  database: string;
  username: string;
  active: boolean;
  jobname: string;
}

export const CronJobsSection = () => {
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCronJobs();
  }, []);

  const fetchCronJobs = async () => {
    try {
      setLoading(true);
      
      // @ts-ignore - get_cron_jobs function will be available after migration
      const { data, error } = await supabase.rpc('get_cron_jobs');

      if (error) {
        console.error("Error fetching cron jobs:", error);
        toast.error("Failed to fetch cron jobs");
        return;
      }

      setCronJobs((data as unknown as CronJob[]) || []);
    } catch (error) {
      console.error("Error in fetchCronJobs:", error);
      toast.error("Failed to fetch cron jobs");
    } finally {
      setLoading(false);
    }
  };

  const formatSchedule = (schedule: string) => {
    if (schedule === "*/30 * * * *") return "Every 30 minutes";
    if (schedule === "*/5 * * * *") return "Every 5 minutes";
    if (schedule === "0 * * * *") return "Every hour";
    if (schedule === "0 0 * * *") return "Daily at midnight";
    return schedule;
  };

  const getJobDescription = (jobname: string) => {
    if (jobname.includes("retry")) return "Automatically retries failed email deliveries";
    if (jobname.includes("health-check")) return "Monitors email delivery rates and alerts admins";
    return "Scheduled database task";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduled Jobs
          </CardTitle>
          <CardDescription>
            Automated background tasks running on schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading scheduled jobs...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Scheduled Jobs
        </CardTitle>
        <CardDescription>
          Automated background tasks running on schedule
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cronJobs.length === 0 ? (
          <div className="flex items-center gap-2 p-4 border rounded-lg">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <p className="text-muted-foreground">No scheduled jobs found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cronJobs.map((job) => (
              <div
                key={job.jobid}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{job.jobname}</h4>
                      <Badge variant={job.active ? "default" : "secondary"} className="gap-1">
                        {job.active && <CheckCircle className="h-3 w-3" />}
                        {job.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getJobDescription(job.jobname)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatSchedule(job.schedule)}</span>
                </div>
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono break-all">
                  {job.command.length > 100 ? job.command.substring(0, 100) + "..." : job.command}
                </div>
              </div>
            ))}
            
            <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/50 mt-6">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium mb-1">Email Retry Schedule</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  When emails fail, they are automatically retried with exponential backoff
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Retry 1</Badge>
                    <span className="text-muted-foreground">After 5 minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Retry 2</Badge>
                    <span className="text-muted-foreground">After 30 minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Retry 3</Badge>
                    <span className="text-muted-foreground">After 2 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Retry 4</Badge>
                    <span className="text-muted-foreground">After 6 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
