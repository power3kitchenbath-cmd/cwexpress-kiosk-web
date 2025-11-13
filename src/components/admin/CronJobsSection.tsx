import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Info } from "lucide-react";

export const CronJobsSection = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Automated Email Retry
            </CardTitle>
            <CardDescription>
              Background task automatically retries failed emails
            </CardDescription>
          </div>
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/50">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium mb-1">Email Retry Schedule</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Runs every 30 minutes to automatically retry failed email deliveries
              </p>
              <div className="space-y-2 text-sm">
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

          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium mb-1">How It Works</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>System checks for failed emails every 30 minutes</li>
                <li>Uses exponential backoff to avoid overwhelming mail servers</li>
                <li>After 4 failed attempts, emails are marked as permanently bounced</li>
                <li>You can also trigger retries manually using the "Retry Failed Now" button below</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
