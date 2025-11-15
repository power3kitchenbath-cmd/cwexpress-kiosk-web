import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, MousePointer, Eye, Target } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface AnalyticsEvent {
  id: string;
  created_at: string;
  event_type: string;
  event_label: string;
  event_category: string;
  user_id: string | null;
  page_path: string;
}

interface DailyStats {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

interface EventBreakdown {
  label: string;
  count: number;
  percentage: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--muted))'];

export const CalacattaBannerAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [dateRange, setDateRange] = useState(7); // Last 7 days
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [eventBreakdown, setEventBreakdown] = useState<EventBreakdown[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalImpressions: 0,
    totalClicks: 0,
    averageCTR: 0,
    uniqueUsers: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = startOfDay(subDays(new Date(), dateRange));
      const endDate = endOfDay(new Date());

      // Fetch all Calacatta banner events
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_category', 'calacatta_banner')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      setEvents(data || []);
      processAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (data: AnalyticsEvent[]) => {
    // Calculate daily stats
    const dailyMap = new Map<string, { impressions: number; clicks: number }>();
    
    // We'll simulate impressions as page views where the banner is shown
    // For clicks, we count actual click events
    data.forEach(event => {
      const date = format(new Date(event.created_at), 'MMM dd');
      const current = dailyMap.get(date) || { impressions: 0, clicks: 0 };
      
      if (event.event_type === 'click') {
        current.clicks += 1;
      }
      // Count each event as an impression opportunity
      current.impressions += 1;
      
      dailyMap.set(date, current);
    });

    const daily = Array.from(dailyMap.entries()).map(([date, stats]) => ({
      date,
      impressions: stats.impressions,
      clicks: stats.clicks,
      ctr: stats.impressions > 0 ? parseFloat(((stats.clicks / stats.impressions) * 100).toFixed(2)) : 0
    }));

    setDailyStats(daily);

    // Calculate event breakdown
    const labelMap = new Map<string, number>();
    let totalClicks = 0;
    
    data.forEach(event => {
      if (event.event_type === 'click') {
        totalClicks += 1;
        const current = labelMap.get(event.event_label) || 0;
        labelMap.set(event.event_label, current + 1);
      }
    });

    const breakdown = Array.from(labelMap.entries()).map(([label, count]) => ({
      label: label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      percentage: totalClicks > 0 ? parseFloat(((count / totalClicks) * 100).toFixed(1)) : 0
    }));

    setEventBreakdown(breakdown);

    // Calculate total stats
    const uniqueUsers = new Set(data.filter(e => e.user_id).map(e => e.user_id)).size;
    const totalImpressions = data.length;
    const avgCTR = totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;

    setTotalStats({
      totalImpressions,
      totalClicks,
      averageCTR: avgCTR,
      uniqueUsers
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalImpressions}</div>
            <p className="text-xs text-muted-foreground">Last {dateRange} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalClicks}</div>
            <p className="text-xs text-muted-foreground">Banner interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.averageCTR}%</div>
            <p className="text-xs text-muted-foreground">Average CTR</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">Engaged users</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Time Range</CardTitle>
          <CardDescription>Select the period for analytics data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[7, 14, 30, 90].map(days => (
              <Badge
                key={days}
                variant={dateRange === days ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setDateRange(days)}
              >
                Last {days} days
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Click-Through Rate</CardTitle>
              <CardDescription>Impressions vs Clicks over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="impressions" stroke="hsl(var(--primary))" name="Impressions" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="hsl(var(--accent))" name="Clicks" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="ctr" stroke="hsl(var(--secondary))" name="CTR %" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Comparison</CardTitle>
              <CardDescription>Daily engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="clicks" fill="hsl(var(--primary))" name="Clicks" />
                  <Bar dataKey="impressions" fill="hsl(var(--muted))" name="Impressions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Click Distribution</CardTitle>
                <CardDescription>Where users click on the banner</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ label, percentage }) => `${label}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {eventBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Breakdown</CardTitle>
                <CardDescription>Detailed click statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{item.count} clicks</span>
                        <Badge variant="secondary">{item.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                  {eventBreakdown.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No click data available for this period
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Latest Calacatta banner interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Page</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.slice(0, 50).reverse().map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-xs">
                        {format(new Date(event.created_at), 'MMM dd, HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={event.event_type === 'click' ? 'default' : 'secondary'}>
                          {event.event_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {event.event_label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {event.user_id ? event.user_id.slice(0, 8) + '...' : 'Anonymous'}
                      </TableCell>
                      <TableCell className="text-xs">{event.page_path}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {events.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No events recorded yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};