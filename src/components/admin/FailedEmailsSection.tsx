import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Mail, RefreshCw, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface FailedEmailSummary {
  recipient_email: string;
  failure_count: number;
  last_failure: string;
  failure_reasons: string[];
  bounce_types: string[];
  affected_orders: string[];
}

export const FailedEmailsSection = () => {
  const [failedEmails, setFailedEmails] = useState<FailedEmailSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFailedEmails();
  }, []);

  const fetchFailedEmails = async () => {
    setLoading(true);
    try {
      // Query the email_tracking table directly instead of the view
      const { data, error } = await supabase
        .from("email_tracking")
        .select("*")
        .in("status", ["failed", "bounced"])
        .order("failed_at", { ascending: false });

      if (error) throw error;

      // Group by email address
      const grouped = data?.reduce((acc: any, item: any) => {
        if (!acc[item.recipient_email]) {
          acc[item.recipient_email] = {
            recipient_email: item.recipient_email,
            failure_count: 0,
            last_failure: item.failed_at,
            failure_reasons: [],
            bounce_types: [],
            affected_orders: [],
          };
        }
        acc[item.recipient_email].failure_count++;
        if (item.failure_reason && !acc[item.recipient_email].failure_reasons.includes(item.failure_reason)) {
          acc[item.recipient_email].failure_reasons.push(item.failure_reason);
        }
        if (item.bounce_type && !acc[item.recipient_email].bounce_types.includes(item.bounce_type)) {
          acc[item.recipient_email].bounce_types.push(item.bounce_type);
        }
        if (!acc[item.recipient_email].affected_orders.includes(item.order_id)) {
          acc[item.recipient_email].affected_orders.push(item.order_id);
        }
        return acc;
      }, {});

      setFailedEmails(Object.values(grouped || {}));
    } catch (error) {
      console.error("Error fetching failed emails:", error);
      toast({
        title: "Error",
        description: "Failed to fetch email failure data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetryFailedEmails = async () => {
    setRetrying(true);
    try {
      const { data, error } = await supabase.functions.invoke("retry-failed-emails");

      if (error) throw error;

      toast({
        title: "Retry process completed",
        description: `Retried ${data.results.retried} emails. ${data.results.succeeded} succeeded, ${data.results.failed} failed.`,
      });

      // Refresh the list after retries
      await fetchFailedEmails();
    } catch (error) {
      console.error("Error retrying failed emails:", error);
      toast({
        title: "Error",
        description: "Failed to retry emails",
        variant: "destructive",
      });
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Failed Emails
          </CardTitle>
          <CardDescription>Loading email failure data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (failedEmails.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-green-600" />
            Failed Emails
          </CardTitle>
          <CardDescription>All emails delivered successfully! No failures detected.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Failed Emails ({failedEmails.length})
            </CardTitle>
            <CardDescription>
              Email addresses with delivery failures or bounces • Auto-retry enabled
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleRetryFailedEmails} 
              variant="default" 
              size="sm"
              disabled={retrying || failedEmails.length === 0}
            >
              {retrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Retry Failed Now
                </>
              )}
            </Button>
            <Button onClick={fetchFailedEmails} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email Address</TableHead>
                <TableHead>Failures</TableHead>
                <TableHead>Last Failure</TableHead>
                <TableHead>Bounce Types</TableHead>
                <TableHead>Affected Orders</TableHead>
                <TableHead>Reasons</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {failedEmails.map((email) => (
                <TableRow key={email.recipient_email}>
                  <TableCell className="font-medium">
                    {email.recipient_email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive">
                      {email.failure_count}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(email.last_failure), "MMM d, yyyy h:mm a")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {email.bounce_types.filter(Boolean).map((type) => (
                        <Badge key={type} variant="outline" className="capitalize">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {email.affected_orders.length} order(s)
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs text-xs text-muted-foreground truncate">
                      {email.failure_reasons.filter(Boolean).join(", ") || "Unknown"}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
