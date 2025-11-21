import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Layers, 
  Wrench, 
  ArrowRight,
  Calendar,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";

interface DashboardStats {
  totalOrders: number;
  totalQuotes: number;
  totalDesigns: number;
  totalProjects: number;
  totalSpent: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
}

interface Quote {
  id: string;
  tier: string;
  grand_total: number;
  status: string;
  created_at: string;
  type: 'kitchen' | 'vanity';
}

interface Design {
  id: string;
  project_name: string;
  created_at: string;
  cabinet_data: any;
}

interface Project {
  id: string;
  project_name: string;
  status: string;
  created_at: string;
  start_date: string;
}

export default function CustomerPortal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalQuotes: 0,
    totalDesigns: 0,
    totalProjects: 0,
    totalSpent: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch all data in parallel
      const [ordersData, kitchenQuotesData, vanityQuotesData, designsData, projectsData] = await Promise.all([
        supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("kitchen_quotes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("vanity_quotes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("design_projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("install_projects").select("*").eq("customer_email", user.email).order("created_at", { ascending: false }).limit(5)
      ]);

      // Process orders
      const ordersResult = ordersData.data || [];
      setOrders(ordersResult);

      // Process quotes
      const kitchenQuotes = (kitchenQuotesData.data || []).map(q => ({ ...q, type: 'kitchen' as const }));
      const vanityQuotes = (vanityQuotesData.data || []).map(q => ({ ...q, type: 'vanity' as const }));
      const allQuotes = [...kitchenQuotes, ...vanityQuotes].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 5);
      setQuotes(allQuotes);

      // Process designs
      setDesigns(designsData.data || []);

      // Process projects
      setProjects(projectsData.data || []);

      // Calculate stats
      const totalSpent = ordersResult.reduce((sum, order) => sum + Number(order.total), 0);
      
      // Get total counts
      const [ordersCount, kitchenCount, vanityCount, designsCount, projectsCount] = await Promise.all([
        supabase.from("orders").select("id", { count: 'exact', head: true }).eq("user_id", user.id),
        supabase.from("kitchen_quotes").select("id", { count: 'exact', head: true }).eq("user_id", user.id),
        supabase.from("vanity_quotes").select("id", { count: 'exact', head: true }).eq("user_id", user.id),
        supabase.from("design_projects").select("id", { count: 'exact', head: true }).eq("user_id", user.id),
        supabase.from("install_projects").select("id", { count: 'exact', head: true }).eq("customer_email", user.email)
      ]);

      setStats({
        totalOrders: ordersCount.count || 0,
        totalQuotes: (kitchenCount.count || 0) + (vanityCount.count || 0),
        totalDesigns: designsCount.count || 0,
        totalProjects: projectsCount.count || 0,
        totalSpent
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({ title: "Error", description: "Failed to load dashboard data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "secondary",
      processing: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
      draft: "secondary",
      sent: "default"
    };
    return statusMap[status] || "secondary";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LayoutDashboard className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome to your customer portal</p>
            </div>
            <Button onClick={() => navigate("/online-shop")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuotes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Designs</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDesigns}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for detailed views */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="designs">Designs</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Recent Orders</h2>
              <Button variant="outline" onClick={() => navigate("/orders")}>
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            {orders.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
                <Button onClick={() => navigate("/online-shop")}>Browse Products</Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orders.map(order => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/orders")}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                            <Badge variant={getStatusColor(order.status) as any}>{order.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Recent Quotes</h2>
              <Button variant="outline" onClick={() => navigate("/quote-comparison")}>
                Compare Quotes <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            {quotes.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No quotes yet</h3>
                <p className="text-muted-foreground mb-4">Get started with a kitchen or vanity quote</p>
                <Button onClick={() => navigate("/estimator")}>Get a Quote</Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {quotes.map(quote => (
                  <Card key={`${quote.type}-${quote.id}`} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold capitalize">{quote.tier} {quote.type}</p>
                            <Badge variant={getStatusColor(quote.status) as any}>{quote.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(quote.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${quote.grand_total.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Designs Tab */}
          <TabsContent value="designs" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Recent Designs</h2>
              <Button variant="outline" onClick={() => navigate("/design-gallery")}>
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            {designs.length === 0 ? (
              <Card className="p-12 text-center">
                <Layers className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No designs yet</h3>
                <p className="text-muted-foreground mb-4">Import your KCDW designs to get started</p>
                <Button onClick={() => navigate("/design-import")}>Import Design</Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {designs.map(design => (
                  <Card key={design.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/design/${design.id}`)}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold">{design.project_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(design.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(design.cabinet_data) ? design.cabinet_data.length : 0} cabinets
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Installation Projects</h2>
            </div>
            
            {projects.length === 0 ? (
              <Card className="p-12 text-center">
                <Wrench className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No installation projects</h3>
                <p className="text-muted-foreground">Your installation projects will appear here</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {projects.map(project => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{project.project_name}</p>
                            <Badge variant={getStatusColor(project.status) as any}>{project.status}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Starts {format(new Date(project.start_date), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
