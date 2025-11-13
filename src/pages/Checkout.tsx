import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useEffect, useState } from "react";
import logoImg from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart, user } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    name: "",
  });

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to complete your order",
      });
      navigate("/auth");
      return;
    }

    // Redirect if cart is empty
    if (items.length === 0) {
      navigate("/online-shop");
    }
  }, [items, navigate, user, toast]);

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Validate shipping address
    if (!shippingAddress.name || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
      toast({
        title: "Missing information",
        description: "Please fill in all shipping address fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const subtotal = totalPrice;
      const tax = subtotal * 0.0825;
      const shipping = subtotal > 2500 ? 0 : 99;
      const total = subtotal + tax + shipping;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "pending",
          subtotal,
          tax,
          shipping,
          total,
          shipping_address: shippingAddress,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price,
        product_name: item.name,
        product_image_url: item.image_url,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update user's order count
      const { data: profile } = await supabase
        .from("profiles")
        .select("order_count")
        .eq("id", user.id)
        .single();

      await supabase
        .from("profiles")
        .update({ order_count: (profile?.order_count || 0) + 1 })
        .eq("id", user.id);

      // Clear cart
      await clearCart();

      // Send confirmation email (don't block checkout if it fails)
      try {
        await supabase.functions.invoke("send-order-receipt", {
          body: {
            orderId: order.id,
            emailType: "confirmation",
          },
        });
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Continue anyway - order was successful
      }

      toast({
        title: "Order placed successfully!",
        description: "Thank you for your order. Confirmation email sent.",
      });

      navigate("/orders");
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Order failed",
        description: "Could not place your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subtotal = totalPrice;
  const tax = subtotal * 0.0825; // 8.25% tax
  const shipping = subtotal > 2500 ? 0 : 99; // Free shipping over $2500
  const total = subtotal + tax + shipping;

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/online-shop")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Button>
            <img 
              src={logoImg} 
              alt="The Cabinet Store" 
              className="h-16 w-16"
            />
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Checkout Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items & Shipping */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={shippingAddress.name}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, name: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, street: e.target.value })
                    }
                    placeholder="123 Main St"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, city: e.target.value })
                      }
                      placeholder="City"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, state: e.target.value })
                      }
                      placeholder="ST"
                      maxLength={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={shippingAddress.zip}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, zip: e.target.value })
                      }
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Items */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Order Items</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=200&h=200&fit=crop'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                        <span className="font-semibold text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                  <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8.25%)</span>
                  <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-foreground">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                {subtotal < 2500 && subtotal > 0 && (
                  <div className="bg-accent/10 border border-accent/20 rounded-md p-3 text-xs">
                    <p className="text-foreground">
                      💡 Add ${(2500 - subtotal).toFixed(2)} more to get free shipping!
                    </p>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handlePlaceOrder}
                  className="w-full gap-2"
                  size="lg"
                  disabled={loading}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {loading ? "Processing..." : "Place Order"}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  By placing this order, you agree to our terms and conditions
                </p>
              </div>

              {subtotal >= 2500 && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-xs font-semibold text-green-800">
                    ✨ 10% discount applied on orders over $2500!
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
