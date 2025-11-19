import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, AlertTriangle, RefreshCw, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface EmailAttempt {
  id: string;
  email_type: string;
  recipient_email: string;
  status: string;
  sent_at: string;
  failure_reason: string | null;
  order_id: string;
}

interface DiagnosticsStats {
  total: number;
  sent: number;
  failed: number;
  successRate: number;
}

export function EmailDiagnosticsDashboard() {
  const { toast } = useToast();
  const [recentAttempts, setRecentAttempts] = useState<EmailAttempt[]>([]);
  const [stats, setStats] = useState<DiagnosticsStats>({
    total: 0,
    sent: 0,
    failed: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDiagnostics = async () => {
    try {
      // Fetch recent 20 email attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from("email_tracking")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(20);

      if (attemptsError) throw attemptsError;

      // Fetch stats for last 24 hours
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: statsData, error: statsError } = await supabase
        .from("email_tracking")
        .select("status")
        .gte("sent_at", last24Hours);

      if (statsError) throw statsError;

      const total = statsData?.length || 0;
      const sent = statsData?.filter((e) => e.status === "sent" || e.status === "opened").length || 0;
      const failed = statsData?.filter((e) => e.status === "failed" || e.status === "bounced").length || 0;
      const successRate = total > 0 ? (sent / total) * 100 : 100;

      setRecentAttempts(attempts || []);
      setStats({
        total,
        sent,
        failed,
        successRate,
      });
    } catch (error: any) {
      console.error("Error fetching email diagnostics:", error);
      toast({
        title: "Error loading diagnostics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDiagnostics();
  };

  const handleUpdateApiKey = () => {
    toast({
      title: "Update API Key",
      description: "Please contact your administrator to update the Resend API key in the backend secrets.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
      case "opened":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
      case "bounced":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      sent: "default",
      opened: "secondary",
      failed: "destructive",
      bounced: "destructive",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status}
      </Badge>
    );
  };

  const getEmailTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      confirmation: "Order Confirmation",
      status_update: "Status Update",
      delivery_confirmation: "Delivery Confirmation",
      manual: "Manual Receipt",
      test: "Test Email",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Diagnostics</CardTitle>
          <CardDescription>Loading diagnostics...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Last 24 Hours</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total Attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-3xl">{stats.successRate.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{stats.sent} successful</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Failed Emails</CardDescription>
            <CardTitle className="text-3xl text-red-500">{stats.failed}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(1) : 0}% failure rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>System Status</CardDescription>
            <CardTitle className="flex items-center gap-2">
              {stats.successRate >= 80 ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <span className="text-xl">Healthy</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <span className="text-xl">Issues</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpdateApiKey}
              className="w-full"
            >
              <Key className="h-4 w-4 mr-2" />
              Update API Key
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attempts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Email Attempts</CardTitle>
              <CardDescription>Last 20 email send attempts</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAttempts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No email attempts found
              </p>
            ) : (
              recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(attempt.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">
                          {attempt.recipient_email}
                        </p>
                        {getStatusBadge(attempt.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getEmailTypeLabel(attempt.email_type)} • {format(new Date(attempt.sent_at), "MMM d, h:mm a")}
                      </p>
                      {attempt.failure_reason && (
                        <p className="text-xs text-red-500 mt-1">
                          Error: {attempt.failure_reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Order #{attempt.order_id.slice(0, 8)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Tips */}
      {stats.successRate < 80 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-red-600 dark:text-red-300">
              Your email delivery rate is below 80%. This typically indicates an issue with your Resend API key or domain configuration.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpdateApiKey}
                className="bg-white dark:bg-gray-900"
              >
                <Key className="h-4 w-4 mr-2" />
                Update API Key
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://resend.com/domains", "_blank")}
                className="bg-white dark:bg-gray-900"
              >
                Verify Domain
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
