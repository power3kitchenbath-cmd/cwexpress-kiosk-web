import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Shield,
  TrendingDown,
  Info
} from "lucide-react";

interface InsightData {
  bounceTypes: Record<string, number>;
  failureReasons: Record<string, number>;
  totalFailed: number;
  totalBounced: number;
  totalSent: number;
  deliveryRate: number;
  recentTrend: "improving" | "declining" | "stable";
}

interface Insight {
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  recommendations: string[];
  icon: React.ReactNode;
}

export const DeliverabilityInsights = () => {
  const [data, setData] = useState<InsightData | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliverabilityData();
  }, []);

  const fetchDeliverabilityData = async () => {
    try {
      // Fetch last 30 days of email data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: emailData, error } = await supabase
        .from("email_tracking")
        .select("*")
        .gte("sent_at", thirtyDaysAgo.toISOString());

      if (error) throw error;

      if (!emailData || emailData.length === 0) {
        setData(null);
        setInsights([]);
        return;
      }

      // Analyze bounce types
      const bounceTypes: Record<string, number> = {};
      const failureReasons: Record<string, number> = {};
      let totalFailed = 0;
      let totalBounced = 0;
      let totalSent = emailData.length;

      emailData.forEach((email) => {
        if (email.bounce_type) {
          bounceTypes[email.bounce_type] = (bounceTypes[email.bounce_type] || 0) + 1;
          totalBounced++;
        }
        if (email.status === "failed") {
          totalFailed++;
          if (email.failure_reason) {
            const reason = email.failure_reason.substring(0, 100); // Truncate long reasons
            failureReasons[reason] = (failureReasons[reason] || 0) + 1;
          }
        }
      });

      const deliveryRate = totalSent > 0 
        ? ((totalSent - totalFailed - totalBounced) / totalSent) * 100 
        : 100;

      // Determine trend (simplified - comparing last 15 days vs previous 15 days)
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      
      const recentEmails = emailData.filter(e => new Date(e.sent_at) >= fifteenDaysAgo);
      const olderEmails = emailData.filter(e => new Date(e.sent_at) < fifteenDaysAgo);
      
      const recentFailureRate = recentEmails.length > 0
        ? (recentEmails.filter(e => e.status === "failed" || e.status === "bounced").length / recentEmails.length) * 100
        : 0;
      
      const olderFailureRate = olderEmails.length > 0
        ? (olderEmails.filter(e => e.status === "failed" || e.status === "bounced").length / olderEmails.length) * 100
        : 0;

      let trend: "improving" | "declining" | "stable" = "stable";
      if (recentFailureRate < olderFailureRate - 2) trend = "improving";
      else if (recentFailureRate > olderFailureRate + 2) trend = "declining";

      const insightData: InsightData = {
        bounceTypes,
        failureReasons,
        totalFailed,
        totalBounced,
        totalSent,
        deliveryRate,
        recentTrend: trend,
      };

      setData(insightData);
      generateInsights(insightData);
    } catch (error) {
      console.error("Error fetching deliverability data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (data: InsightData) => {
    const newInsights: Insight[] = [];

    // Critical: High bounce rate
    if (data.totalBounced > data.totalSent * 0.05) {
      newInsights.push({
        severity: "critical",
        title: "High Bounce Rate Detected",
        description: `${((data.totalBounced / data.totalSent) * 100).toFixed(1)}% of emails are bouncing`,
        recommendations: [
          "Clean your email list regularly to remove invalid addresses",
          "Implement double opt-in for new subscribers",
          "Remove hard bounces immediately from your mailing list",
          "Verify email addresses before sending",
        ],
        icon: <XCircle className="h-5 w-5" />,
      });
    }

    // Analyze hard bounces
    if (data.bounceTypes["hard"]) {
      newInsights.push({
        severity: "critical",
        title: "Hard Bounces Detected",
        description: `${data.bounceTypes["hard"]} hard bounces indicate permanent delivery failures`,
        recommendations: [
          "Immediately remove these email addresses from your list",
          "Hard bounces damage your sender reputation",
          "Implement email validation at signup to prevent invalid addresses",
          "Use a email verification service for existing contacts",
        ],
        icon: <XCircle className="h-5 w-5" />,
      });
    }

    // Analyze soft bounces
    if (data.bounceTypes["soft"]) {
      newInsights.push({
        severity: "warning",
        title: "Soft Bounces Detected",
        description: `${data.bounceTypes["soft"]} soft bounces indicate temporary delivery issues`,
        recommendations: [
          "Retry sending to soft bounces after 72 hours",
          "If an address soft bounces repeatedly (3-5 times), treat it as a hard bounce",
          "Check if you're hitting rate limits with email providers",
          "Monitor inbox capacity issues (mailbox full)",
        ],
        icon: <AlertTriangle className="h-5 w-5" />,
      });
    }

    // Spam complaints
    if (data.bounceTypes["spam"]) {
      newInsights.push({
        severity: "critical",
        title: "Spam Complaints",
        description: `${data.bounceTypes["spam"]} emails marked as spam`,
        recommendations: [
          "Review your email content for spam trigger words",
          "Ensure you have proper unsubscribe links in all emails",
          "Only send to recipients who explicitly opted in",
          "Improve email authentication (SPF, DKIM, DMARC)",
          "Consider warming up your sending domain if it's new",
        ],
        icon: <Shield className="h-5 w-5" />,
      });
    }

    // Low delivery rate
    if (data.deliveryRate < 90) {
      newInsights.push({
        severity: data.deliveryRate < 80 ? "critical" : "warning",
        title: "Below Target Delivery Rate",
        description: `Current delivery rate is ${data.deliveryRate.toFixed(1)}% (target: 95%+)`,
        recommendations: [
          "Audit your email list quality",
          "Implement authentication protocols (SPF, DKIM, DMARC)",
          "Maintain a consistent sending schedule",
          "Monitor your sender reputation score",
          "Use a dedicated sending IP address if sending high volumes",
        ],
        icon: <TrendingDown className="h-5 w-5" />,
      });
    }

    // Declining trend
    if (data.recentTrend === "declining") {
      newInsights.push({
        severity: "warning",
        title: "Declining Deliverability Trend",
        description: "Your email deliverability has worsened in the last 15 days",
        recommendations: [
          "Review recent changes to email content or sending patterns",
          "Check if you've been added to any blacklists",
          "Reduce sending frequency temporarily",
          "Focus on engaged subscribers only",
          "Review email authentication records",
        ],
        icon: <TrendingDown className="h-5 w-5" />,
      });
    }

    // Good deliverability
    if (data.deliveryRate >= 95 && data.recentTrend !== "declining") {
      newInsights.push({
        severity: "info",
        title: "Excellent Deliverability",
        description: `Maintaining a ${data.deliveryRate.toFixed(1)}% delivery rate`,
        recommendations: [
          "Continue current best practices",
          "Keep monitoring bounce rates regularly",
          "Maintain list hygiene practices",
          "Stay updated on email deliverability best practices",
        ],
        icon: <CheckCircle2 className="h-5 w-5" />,
      });
    }

    setInsights(newInsights);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "warning":
        return "default";
      case "info":
        return "secondary";
      default:
        return "default";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-destructive";
      case "warning":
        return "text-yellow-500";
      case "info":
        return "text-blue-500";
      default:
        return "text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deliverability Insights</CardTitle>
          <CardDescription>Loading insights...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deliverability Insights</CardTitle>
          <CardDescription>No email data available for analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Data</AlertTitle>
            <AlertDescription>
              Send some emails to start receiving deliverability insights and recommendations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Deliverability Insights
          </CardTitle>
          <CardDescription>
            Analysis of email delivery performance and actionable recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Delivery Rate</div>
              <div className="flex items-center gap-2">
                <Progress value={data.deliveryRate} className="flex-1" />
                <span className="text-lg font-bold">{data.deliveryRate.toFixed(1)}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total Bounced</div>
              <div className="text-2xl font-bold">{data.totalBounced}</div>
              <div className="text-xs text-muted-foreground">
                {((data.totalBounced / data.totalSent) * 100).toFixed(1)}% of total
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Recent Trend</div>
              <Badge
                variant={
                  data.recentTrend === "improving"
                    ? "default"
                    : data.recentTrend === "declining"
                    ? "destructive"
                    : "secondary"
                }
              >
                {data.recentTrend === "improving" && "📈 Improving"}
                {data.recentTrend === "declining" && "📉 Declining"}
                {data.recentTrend === "stable" && "➡️ Stable"}
              </Badge>
            </div>
          </div>

          {Object.keys(data.bounceTypes).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Bounce Types Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(data.bounceTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{type} Bounce</span>
                    <Badge variant="outline">
                      {count} ({((count / data.totalBounced) * 100).toFixed(1)}%)
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {insights.length > 0 && (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <Alert key={index} variant={getSeverityColor(insight.severity) as any}>
              <div className={getSeverityIcon(insight.severity)}>
                {insight.icon}
              </div>
              <AlertTitle>{insight.title}</AlertTitle>
              <AlertDescription>
                <p className="mb-3">{insight.description}</p>
                <div className="space-y-1">
                  <p className="font-medium text-sm">Recommendations:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {insight.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {Object.keys(data.failureReasons).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Common Failure Reasons</CardTitle>
            <CardDescription>
              Most frequent error messages from failed deliveries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.failureReasons)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([reason, count]) => (
                  <div key={reason} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{count} occurrences</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{reason}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
