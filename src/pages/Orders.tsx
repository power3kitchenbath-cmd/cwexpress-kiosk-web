import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Package, ShoppingBag, History } from "lucide-react";
import { format } from "date-fns";
import { OrderStatusHistory } from "@/components/admin/OrderStatusHistory";

interface OrderItem {
  id: string;
  quantity: number;
  price_at_purchase: number;
  product_name: string;
  product_image_url: string | null;
}

interface Order {
  id: string;
  status: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  created_at: string;
  items: OrderItem[];
}

const Orders = () => {
  const navigate = useNavigate();
  const { user, addItem } = useCart();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProPrompt, setShowProPrompt] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchOrders();
    checkProStatus();
  }, [user, navigate]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      if (ordersData) {
        const ordersWithItems = await Promise.all(
          ordersData.map(async (order) => {
            const { data: itemsData } = await supabase
              .from("order_items")
              .select("*")
              .eq("order_id", order.id);

            return {
              ...order,
              items: itemsData || [],
            };
          })
        );

        setOrders(ordersWithItems);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error loading orders",
        description: "Could not load your order history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkProStatus = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("order_count, is_pro")
        .eq("id", user.id)
        .single();

      if (profile) {
        setOrderCount(profile.order_count);
        // Show prompt if user has made at least 1 order and hasn't completed pro profile
        if (profile.order_count >= 1 && !profile.is_pro) {
          setShowProPrompt(true);
        }
      }
    } catch (error) {
      console.error("Error checking pro status:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      processing: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleReorder = async (order: Order) => {
    try {
      // Get current product data to check inventory
      const productIds = order.items.map(item => item.id);
      const { data: products } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds);

      if (!products) {
        toast({
          title: "Cannot reorder",
          description: "Some products are no longer available",
          variant: "destructive",
        });
        return;
      }

      // Add each item back to cart
      for (const item of order.items) {
        const product = products.find(p => p.id === item.id);
        if (product) {
          await addItem(product);
        }
      }

      toast({
        title: "Items added to cart",
        description: "Order items have been added to your cart",
      });

      navigate("/online-shop");
    } catch (error) {
      console.error("Error reordering:", error);
      toast({
        title: "Reorder failed",
        description: "Could not add items to cart",
        variant: "destructive",
      });
    }
  };

  const handleViewHistory = (orderId: string) => {
    setSelectedOrderId(orderId);
    setHistoryDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/online-shop")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">My Orders</h1>
                <p className="text-sm text-muted-foreground">
                  View your order history and track shipments
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/quote-comparison")}>
              Compare Quotes
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {showProPrompt && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <ShoppingBag className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  Become a Pro Customer!
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You've made {orderCount} {orderCount === 1 ? "order" : "orders"}! Complete your business profile to unlock:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li>• Save billing and shipping addresses</li>
                  <li>• Access to bulk discounts</li>
                  <li>• Priority customer support</li>
                  <li>• Faster checkout process</li>
                  <li>• Dedicated account manager</li>
                </ul>
                <Button onClick={() => navigate("/profile")}>
                  Complete Pro Profile
                </Button>
              </div>
            </div>
          </Card>
        )}

        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here
            </p>
            <Button onClick={() => navigate("/online-shop")}>
              Browse Products
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <div className="p-6 border-b bg-card/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), "PPP")}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      {item.product_image_url ? (
                        <img
                          src={item.product_image_url}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-secondary rounded flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ${(item.price_at_purchase * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>${order.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleReorder(order)}
                  >
                    Reorder
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => handleViewHistory(order.id)}
                  >
                    <History className="mr-2 h-4 w-4" />
                    View Status History
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {selectedOrderId && (
        <OrderStatusHistory
          orderId={selectedOrderId}
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
        />
      )}
    </div>
  );
};

export default Orders;
