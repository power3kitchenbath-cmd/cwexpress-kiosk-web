import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Eye, Download, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";

interface PricingGuideRequest {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  company_name: string | null;
  request_type: string;
  sent_at: string | null;
  opened_at: string | null;
  created_at: string;
}

export function PricingGuideAnalytics() {
  const [requests, setRequests] = useState<PricingGuideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    emailsSent: 0,
    emailsOpened: 0,
    openRate: 0,
    downloadsOnly: 0,
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("pricing_guide_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRequests(data || []);

      // Calculate stats
      const totalRequests = data?.length || 0;
      const emailsSent = data?.filter(r => r.request_type === "email").length || 0;
      const emailsOpened = data?.filter(r => r.opened_at).length || 0;
      const openRate = emailsSent > 0 ? (emailsOpened / emailsSent) * 100 : 0;
      const downloadsOnly = data?.filter(r => r.request_type === "download").length || 0;

      setStats({
        totalRequests,
        emailsSent,
        emailsOpened,
        openRate,
        downloadsOnly,
      });
    } catch (error: any) {
      console.error("Error fetching pricing guide requests:", error);
      toast.error("Failed to load pricing guide analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading pricing guide analytics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailsSent}</div>
            <p className="text-xs text-muted-foreground">Via email delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Opened</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailsOpened}</div>
            <p className="text-xs text-muted-foreground">{stats.openRate.toFixed(1)}% open rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Direct Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.downloadsOnly}</div>
            <p className="text-xs text-muted-foreground">PDF downloads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Email engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Pricing Guide Requests</CardTitle>
          <CardDescription>
            Track who has requested or downloaded the pricing guide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No pricing guide requests yet
              </p>
            ) : (
              requests.slice(0, 20).map((request) => (
                <div
                  key={request.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{request.email}</span>
                      {request.name && (
                        <span className="text-sm text-muted-foreground">({request.name})</span>
                      )}
                    </div>
                    {request.company_name && (
                      <p className="text-sm text-muted-foreground">
                        Company: {request.company_name}
                      </p>
                    )}
                    {request.phone && (
                      <p className="text-sm text-muted-foreground">
                        Phone: {request.phone}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(request.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant={request.request_type === "email" ? "default" : "secondary"}>
                      {request.request_type === "email" ? (
                        <>
                          <Mail className="w-3 h-3 mr-1" />
                          Email
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </>
                      )}
                    </Badge>
                    {request.opened_at && (
                      <Badge variant="outline" className="gap-1">
                        <Eye className="w-3 h-3" />
                        Opened
                      </Badge>
                    )}
                    {request.sent_at && !request.opened_at && (
                      <span className="text-xs text-muted-foreground">Sent, not opened</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
