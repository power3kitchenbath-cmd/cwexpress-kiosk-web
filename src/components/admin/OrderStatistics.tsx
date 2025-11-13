import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";

interface Statistics {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  totalCustomers: number;
  proCustomers: number;
}

export const OrderStatistics = () => {
  const [stats, setStats] = useState<Statistics>({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
    proCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("total");

      if (ordersError) throw ordersError;

      // Fetch customer counts
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("is_pro");

      if (profilesError) throw profilesError;

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const totalCustomers = profiles?.length || 0;
      const proCustomers = profiles?.filter(p => p.is_pro).length || 0;

      setStats({
        totalOrders,
        totalRevenue,
        avgOrderValue,
        totalCustomers,
        proCustomers,
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading statistics...</div>;
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: "All-time revenue",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      description: "Orders placed",
    },
    {
      title: "Avg Order Value",
      value: `$${stats.avgOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      description: "Per order",
    },
    {
      title: "Customers",
      value: stats.totalCustomers.toString(),
      icon: Users,
      description: `${stats.proCustomers} Pro members`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
