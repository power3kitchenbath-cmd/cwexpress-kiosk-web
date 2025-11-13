import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useEffect } from "react";
import logoImg from "@/assets/logo.png";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();

  useEffect(() => {
    if (items.length === 0) {
      navigate("/online-shop");
    }
  }, [items, navigate]);

  const handlePlaceOrder = () => {
    // In a real app, this would integrate with payment processing
    window.open("https://thecabinetstore.org/shop", "_blank");
    clearCart();
    navigate("/online-shop");
  };

  const subtotal = totalPrice;
  const tax = subtotal * 0.0825; // 8.25% tax
  const shipping = subtotal > 2500 ? 0 : 99; // Free shipping over $2500
  const total = subtotal + tax + shipping;

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
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-4">
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
                >
                  <ShoppingBag className="w-4 h-4" />
                  Complete Order
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  You'll be redirected to complete your purchase
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
