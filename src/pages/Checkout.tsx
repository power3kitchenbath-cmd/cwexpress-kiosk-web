import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShoppingBag, Truck, Zap, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useEffect, useState } from "react";
import logoImg from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Shipping address validation schema
const shippingSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  street: z.string().trim().min(1, "Street address is required").max(200, "Street address must be less than 200 characters"),
  city: z.string().trim().min(1, "City is required").max(100, "City must be less than 100 characters"),
  state: z.string().trim().length(2, "State must be 2 characters").toUpperCase(),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format (use 12345 or 12345-6789)"),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart, user } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express" | "free">("standard");
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

    // Validate shipping address with Zod schema
    const validationResult = shippingSchema.safeParse(shippingAddress);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message).join(", ");
      toast({
        title: "Invalid shipping information",
        description: errorMessages,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const subtotal = totalPrice;
      const installationCost = includeInstallation ? subtotal * 0.15 : 0;
      const tax = (subtotal + installationCost) * 0.0825;
      
      // Calculate shipping based on method and subtotal
      let shipping = 0;
      if (shippingMethod === "free") {
        shipping = 0;
      } else if (shippingMethod === "express") {
        shipping = 199;
      } else {
        // Standard shipping: free over $2500, otherwise $99
        shipping = subtotal > 2500 ? 0 : 99;
      }
      
      const total = subtotal + installationCost + tax + shipping;

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

      // If installation is included, create install project
      if (includeInstallation) {
        const { data: userData } = await supabase.auth.getUser();
        
        // Get user email
        const userEmail = userData.user?.email || "";
        
        const { error: projectError } = await supabase
          .from("install_projects")
          .insert({
            project_name: `Installation for Order #${order.id.slice(0, 8)}`,
            customer_name: shippingAddress.name,
            customer_email: userEmail,
            customer_phone: null,
            project_type: "cabinet_installation",
            status: "pending",
            priority: "medium",
            services: ["cabinet_installation"],
            address: {
              street: shippingAddress.street,
              city: shippingAddress.city,
              state: shippingAddress.state,
              zip: shippingAddress.zip,
            },
            start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
            target_completion_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
            budget: installationCost,
            actual_cost: 0,
            created_by: user.id,
            order_id: order.id,
            notes: `Auto-generated from online order. Installation cost: $${installationCost.toFixed(2)}`,
          });

        if (projectError) {
          console.error("Error creating install project:", projectError);
          // Don't fail the order if project creation fails, just log it
          toast({
            title: "Warning",
            description: "Order placed successfully, but there was an issue creating the installation project. Please contact support.",
            variant: "destructive",
          });
        }
      }

      // Send order receipt email (non-blocking)
      try {
        const { data, error: emailError } = await supabase.functions.invoke("send-order-receipt", {
          body: { orderId: order.id, emailType: "confirmation" },
        });
        
        if (emailError) {
          console.error("Email service error:", emailError);
          toast({
            title: "Order placed successfully",
            description: "Your order was created, but we couldn't send the confirmation email. Please contact support if you don't receive a copy.",
            variant: "default",
          });
        }
      } catch (emailError) {
        console.error("Error sending order receipt:", emailError);
        // Order still succeeds even if email fails
        toast({
          title: "Order placed successfully",
          description: "Your order was created, but we couldn't send the confirmation email. Please contact support if you don't receive a copy.",
          variant: "default",
        });
      }

      // Clear cart
      await clearCart();

      toast({
        title: "Order placed!",
        description: includeInstallation 
          ? "Your order has been placed successfully and an installation project has been created. We'll contact you soon to schedule the installation."
          : "Your order has been placed successfully. You will receive a confirmation email shortly.",
      });

      navigate("/orders");
    } catch (error: any) {
      console.error("Order error:", error);
      toast({
        title: "Order failed",
        description: error.message || "There was a problem placing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subtotal = totalPrice;
  const installationCost = includeInstallation ? subtotal * 0.15 : 0;
  const tax = (subtotal + installationCost) * 0.0825;
  
  // Calculate shipping based on method and subtotal
  let shipping = 0;
  if (shippingMethod === "free") {
    shipping = 0;
  } else if (shippingMethod === "express") {
    shipping = 199;
  } else {
    // Standard shipping: free over $2500, otherwise $99
    shipping = subtotal > 2500 ? 0 : 99;
  }
  
  const total = subtotal + installationCost + tax + shipping;

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary to-primary-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src={logoImg} alt="Logo" className="h-12 w-12 object-contain" />
            <h1 className="text-3xl font-bold text-primary-foreground">Checkout</h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/online-shop")}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="mr-2" />
            Back to Shop
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

            {/* Shipping Options */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Shipping Method</h2>
              <RadioGroup value={shippingMethod} onValueChange={(value: any) => setShippingMethod(value)}>
                <div className="space-y-3">
                  {/* Standard Shipping */}
                  <Label
                    htmlFor="standard"
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      shippingMethod === "standard" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="standard" id="standard" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">Standard Shipping</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        5-7 business days
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {subtotal > 2500 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          "$99.00"
                        )}
                      </p>
                      {subtotal <= 2500 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Free shipping on orders over $2,500
                        </p>
                      )}
                    </div>
                  </Label>

                  {/* Express Shipping */}
                  <Label
                    htmlFor="express"
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      shippingMethod === "express" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="express" id="express" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-5 w-5 text-accent" />
                        <span className="font-semibold text-foreground">Express Shipping</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        2-3 business days
                      </p>
                      <p className="text-sm font-medium text-foreground">$199.00</p>
                    </div>
                  </Label>

                  {/* Free Shipping (Admin Override) */}
                  <Label
                    htmlFor="free"
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      shippingMethod === "free" 
                        ? "border-accent bg-accent/5" 
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <RadioGroupItem value="free" id="free" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Gift className="h-5 w-5 text-accent" />
                        <span className="font-semibold text-foreground">Free Shipping</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        5-7 business days
                      </p>
                      <p className="text-sm font-medium text-green-600">FREE</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Promotional or admin override
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
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
                
                {/* Installation Option */}
                <div className="bg-accent/5 border border-accent/20 rounded-md p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      id="include-installation-checkout"
                      checked={includeInstallation}
                      onChange={(e) => setIncludeInstallation(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="include-installation-checkout" className="cursor-pointer text-sm font-medium text-foreground">
                      Add Professional Installation
                    </label>
                  </div>
                  {includeInstallation && (
                    <>
                      <div className="flex justify-between text-sm mt-2 pl-6">
                        <span className="text-muted-foreground">Installation (15%)</span>
                        <span className="font-medium text-green-600">+${installationCost.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-6 mt-1">
                        Project will be scheduled within 1-2 weeks
                      </p>
                    </>
                  )}
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
