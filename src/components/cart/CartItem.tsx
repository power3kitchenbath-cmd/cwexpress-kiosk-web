import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image_url: string | null;
    category: string;
    inventory_count: number;
  };
}

export const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    updateQuantity(item.id, newQuantity);
  };

  const increment = () => {
    if (quantity < item.inventory_count) {
      handleQuantityChange(quantity + 1);
    }
  };

  const decrement = () => {
    if (quantity > 1) {
      handleQuantityChange(quantity - 1);
    }
  };

  return (
    <div className="flex gap-4 p-4 bg-card rounded-lg border">
      <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
        <img
          src={item.image_url || 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=200&h=200&fit=crop'}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <div>
              <h4 className="font-semibold text-foreground text-sm">{item.name}</h4>
              <p className="text-xs text-muted-foreground">{item.category}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeItem(item.id)}
              className="h-8 w-8 -mt-1 -mr-2 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm font-bold text-primary">${item.price.toFixed(2)}</p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={decrement}
              disabled={quantity <= 1}
              className="h-8 w-8"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                if (val >= 1 && val <= item.inventory_count) {
                  handleQuantityChange(val);
                }
              }}
              className="w-16 h-8 text-center"
              min="1"
              max={item.inventory_count}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={increment}
              disabled={quantity >= item.inventory_count}
              className="h-8 w-8"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <div className="text-sm font-semibold text-foreground">
            ${(item.price * quantity).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};
