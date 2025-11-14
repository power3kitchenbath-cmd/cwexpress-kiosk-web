import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { CartItem } from "./CartItem";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col data-[state=open]:animate-[slideInRight_300ms_ease-out] data-[state=closed]:animate-[slideOutRight_200ms_ease-in]">
        <SheetHeader className="opacity-0 data-[state=open]:animate-[fadeIn_400ms_ease-out_100ms_forwards]">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <ShoppingCart className="w-5 h-5" />
            Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 opacity-0 animate-[fadeIn_400ms_ease-out_200ms_forwards]">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Add products to get started</p>
            <Button onClick={() => setIsCartOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-4 opacity-0 animate-[fadeIn_400ms_ease-out_150ms_forwards]">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div 
                    key={item.id}
                    className="opacity-0 animate-[fadeInUp_400ms_ease-out_forwards]"
                    style={{ animationDelay: `${200 + (index * 50)}ms` }}
                  >
                    <CartItem item={item} />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-4 opacity-0 animate-[fadeIn_400ms_ease-out_250ms_forwards]">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">${totalPrice.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleCheckout} 
                  className="w-full gap-2"
                  size="lg"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={clearCart} 
                  variant="outline" 
                  className="w-full"
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
