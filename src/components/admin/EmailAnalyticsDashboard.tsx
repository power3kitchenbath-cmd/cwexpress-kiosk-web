import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Mail, MailOpen, XCircle, TrendingUp } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

interface EmailStats {
  total: number;
  sent: number;
  opened: number;
  failed: number;
  bounced: number;
  deliveryRate: number;
  openRate: number;
  failureRate: number;
}

interface DailyStats {
  date: string;
  sent: number;
  opened: number;
  failed: number;
  bounced: number;
  deliveryRate: number;
  openRate: number;
}

const COLORS = {
  sent: "hsl(var(--primary))",
  opened: "hsl(142, 76%, 36%)",
  failed: "hsl(var(--destructive))",
  bounced: "hsl(25, 95%, 53%)",
};

export const EmailAnalyticsDashboard = () => {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = startOfDay(subDays(new Date(), days));

      // Fetch all email tracking data for the time range
      const { data: emailData, error } = await supabase
        .from("email_tracking")
        .select("*")
        .gte("sent_at", startDate.toISOString());

      if (error) throw error;

      if (!emailData || emailData.length === 0) {
        setStats({
          total: 0,
          sent: 0,
          opened: 0,
          failed: 0,
          bounced: 0,
          deliveryRate: 0,
          openRate: 0,
          failureRate: 0,
        });
        setDailyStats([]);
        return;
      }

      // Calculate overall stats
      const total = emailData.length;
      const sent = emailData.filter(e => e.status === "sent" || e.status === "delivered").length;
      const opened = emailData.filter(e => e.opened_at !== null).length;
      const failed = emailData.filter(e => e.status === "failed").length;
      const bounced = emailData.filter(e => e.status === "bounced").length;

      const deliveryRate = total > 0 ? ((sent / total) * 100) : 0;
      const openRate = sent > 0 ? ((opened / sent) * 100) : 0;
      const failureRate = total > 0 ? (((failed + bounced) / total) * 100) : 0;

      setStats({
        total,
        sent,
        opened,
        failed,
        bounced,
        deliveryRate,
        openRate,
        failureRate,
      });

      // Calculate daily stats
      const dailyMap = new Map<string, DailyStats>();

      emailData.forEach((email) => {
        const date = format(new Date(email.sent_at), "MMM dd");
        const existing = dailyMap.get(date) || {
          date,
          sent: 0,
          opened: 0,
          failed: 0,
          bounced: 0,
          deliveryRate: 0,
          openRate: 0,
        };

        if (email.status === "sent" || email.status === "delivered") existing.sent++;
        if (email.opened_at) existing.opened++;
        if (email.status === "failed") existing.failed++;
        if (email.status === "bounced") existing.bounced++;

        dailyMap.set(date, existing);
      });

      const daily = Array.from(dailyMap.values()).map((day) => ({
        ...day,
        deliveryRate: day.sent > 0 ? (day.sent / (day.sent + day.failed + day.bounced)) * 100 : 0,
        openRate: day.sent > 0 ? (day.opened / day.sent) * 100 : 0,
      }));

      setDailyStats(daily);
    } catch (error) {
      console.error("Error fetching email analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Analytics</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Analytics</CardTitle>
          <CardDescription>No email data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const pieData = [
    { name: "Delivered", value: stats.sent, color: COLORS.sent },
    { name: "Opened", value: stats.opened, color: COLORS.opened },
    { name: "Failed", value: stats.failed, color: COLORS.failed },
    { name: "Bounced", value: stats.bounced, color: COLORS.bounced },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Email Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive email delivery and engagement metrics
          </p>
        </div>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.sent} successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deliveryRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.failed + stats.bounced} failed or bounced
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <MailOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.opened} emails opened
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failureRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Failed: {stats.failed}, Bounced: {stats.bounced}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Email Volume Over Time</CardTitle>
            <CardDescription>Daily email sending and engagement</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sent"
                    stroke={COLORS.sent}
                    name="Sent"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="opened"
                    stroke={COLORS.opened}
                    name="Opened"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    stroke={COLORS.failed}
                    name="Failed"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No data available for the selected time range
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery & Open Rates</CardTitle>
            <CardDescription>Percentage metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="deliveryRate"
                    stroke={COLORS.sent}
                    name="Delivery Rate"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="openRate"
                    stroke={COLORS.opened}
                    name="Open Rate"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No data available for the selected time range
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Status Distribution</CardTitle>
            <CardDescription>Overall breakdown of email statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No data available for the selected time range
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Email Comparison</CardTitle>
            <CardDescription>Sent vs opened emails by day</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill={COLORS.sent} name="Sent" />
                  <Bar dataKey="opened" fill={COLORS.opened} name="Opened" />
                  <Bar dataKey="failed" fill={COLORS.failed} name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No data available for the selected time range
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
