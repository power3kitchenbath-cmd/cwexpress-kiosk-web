import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  category: string;
  inventory_count: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  user: User | null;
  cartBadgePulse: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [cartBadgePulse, setCartBadgePulse] = useState(false);
  const { toast } = useToast();

  // Load cart from localStorage on mount (for guest users)
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Set up auth listener and load cart from database if authenticated
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // User logged in - merge localStorage cart with database cart
        setTimeout(async () => {
          await syncCartOnLogin(session.user.id);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        // User logged out - keep localStorage cart only
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadCartFromDatabase(session.user.id);
      }
      
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoadingAuth) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isLoadingAuth]);

  // Load cart from database for authenticated users
  const loadCartFromDatabase = async (userId: string) => {
    try {
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(`
          quantity,
          products (
            id,
            name,
            price,
            image_url,
            category,
            inventory_count
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      if (cartItems && cartItems.length > 0) {
        const formattedItems: CartItem[] = cartItems
          .filter(item => item.products)
          .map(item => ({
            id: (item.products as any).id,
            name: (item.products as any).name,
            price: (item.products as any).price,
            quantity: item.quantity,
            image_url: (item.products as any).image_url,
            category: (item.products as any).category,
            inventory_count: (item.products as any).inventory_count,
          }));
        
        setItems(formattedItems);
      }
    } catch (error) {
      console.error('Error loading cart from database:', error);
    }
  };

  // Sync localStorage cart with database on login
  const syncCartOnLogin = async (userId: string) => {
    const localCart = localStorage.getItem('cart');
    if (!localCart) {
      await loadCartFromDatabase(userId);
      return;
    }

    const localItems: CartItem[] = JSON.parse(localCart);
    
    try {
      // Get current database cart
      const { data: dbCartItems } = await supabase
        .from('cart_items')
        .select('product_id, quantity')
        .eq('user_id', userId);

      const dbCartMap = new Map(
        (dbCartItems || []).map(item => [item.product_id, item.quantity])
      );

      // Merge local cart with database cart
      for (const localItem of localItems) {
        const dbQuantity = dbCartMap.get(localItem.id);
        
        if (dbQuantity) {
          // Item exists in both - update to max quantity
          const newQuantity = Math.min(
            Math.max(localItem.quantity, dbQuantity),
            localItem.inventory_count
          );
          
          await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('user_id', userId)
            .eq('product_id', localItem.id);
        } else {
          // Item only in localStorage - add to database
          await supabase
            .from('cart_items')
            .insert({
              user_id: userId,
              product_id: localItem.id,
              quantity: localItem.quantity,
            });
        }
      }

      // Reload cart from database to get merged result
      await loadCartFromDatabase(userId);
      
      toast({
        title: "Cart synced",
        description: "Your cart has been synced across devices",
      });
    } catch (error) {
      console.error('Error syncing cart:', error);
      toast({
        title: "Sync failed",
        description: "Could not sync cart, but your items are safe",
        variant: "destructive",
      });
    }
  };

  const addItem = async (product: any) => {
    const existingItem = items.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.inventory_count) {
        toast({
          title: "Cannot add more",
          description: `Only ${product.inventory_count} available in stock`,
          variant: "destructive",
        });
        return;
      }
      
      const newQuantity = existingItem.quantity + 1;
      
      // Update in database if authenticated
      if (user) {
        try {
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('user_id', user.id)
            .eq('product_id', product.id);
          
          if (error) throw error;
        } catch (error) {
          console.error('Error updating cart in database:', error);
          toast({
            title: "Update failed",
            description: "Could not sync to database, but item updated locally",
            variant: "destructive",
          });
        }
      }
      
      setItems(currentItems =>
        currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      
      // Trigger badge pulse animation
      setCartBadgePulse(true);
      setTimeout(() => setCartBadgePulse(false), 600);
      
      toast({
        title: "Updated cart",
        description: `${product.name} quantity increased`,
      });
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image_url: product.image_url,
        category: product.category,
        inventory_count: product.inventory_count,
      };
      
      // Add to database if authenticated
      if (user) {
        try {
          const { error } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: product.id,
              quantity: 1,
            });
          
          if (error) throw error;
        } catch (error) {
          console.error('Error adding to cart in database:', error);
          toast({
            title: "Sync failed",
            description: "Item added locally, but could not sync to database",
            variant: "destructive",
          });
        }
      }
      
      setItems(currentItems => [...currentItems, newItem]);
      
      // Trigger badge pulse animation
      setCartBadgePulse(true);
      setTimeout(() => setCartBadgePulse(false), 600);
      
      toast({
        title: "Added to cart",
        description: `${product.name} added to your cart`,
      });
    }
  };

  const removeItem = async (productId: string) => {
    // Remove from database if authenticated
    if (user) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error removing from cart in database:', error);
      }
    }
    
    setItems(currentItems => currentItems.filter(item => item.id !== productId));
    toast({
      title: "Removed from cart",
      description: "Item removed from your cart",
    });
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }

    const item = items.find(i => i.id === productId);
    if (!item) return;

    if (quantity > item.inventory_count) {
      toast({
        title: "Cannot update quantity",
        description: `Only ${item.inventory_count} available in stock`,
        variant: "destructive",
      });
      return;
    }

    // Update in database if authenticated
    if (user) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error updating quantity in database:', error);
      }
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    // Clear from database if authenticated
    if (user) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error clearing cart in database:', error);
      }
    }
    
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items removed from cart",
    });
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        user,
        cartBadgePulse,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
