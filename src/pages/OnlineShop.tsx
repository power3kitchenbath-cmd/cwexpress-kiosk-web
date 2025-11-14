import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Package, AlertCircle, User, LogOut, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@/assets/logo.png";
import { useCart } from "@/contexts/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { ProductGridSkeleton } from "@/components/ui/product-card-skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string | null;
  thumbnail_url?: string | null;
  specifications: any;
  inventory_count: number;
  inventory_status: string;
  sku: string | null;
}

const OnlineShop = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { totalItems, setIsCartOpen, user } = useCart();
  const { cartBadgePulse } = useCart();

  useEffect(() => {
    fetchProducts();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          console.log('Product inventory updated');
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInventoryBadge = (status: string, count: number) => {
    if (status === 'out_of_stock' || count === 0) {
      return (
        <Badge variant="destructive" className="gap-1.5 shadow-lg">
          <AlertCircle className="w-3 h-3" />
          Out of Stock
        </Badge>
      );
    }
    if (status === 'low_stock' || count < 10) {
      return (
        <Badge variant="secondary" className="gap-1.5 bg-orange-500 text-white hover:bg-orange-600 shadow-lg">
          <AlertCircle className="w-3 h-3" />
          Low Stock ({count})
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="gap-1.5 bg-green-600 hover:bg-green-700 shadow-lg">
        <Package className="w-3 h-3" />
        In Stock ({count})
      </Badge>
    );
  };

  const { addItem } = useCart();

  const handleAddToCart = (product: Product) => {
    if (product.inventory_status === 'out_of_stock') {
      return;
    }
    addItem(product);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Promotional Banner */}
      <div className="bg-primary text-primary-foreground py-3 text-center">
        <p className="text-sm md:text-base font-semibold">
          ✨ Get 10% off Cabinets, Countertops, & Flooring this month when you order $2500 or more ✨
        </p>
      </div>

      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            <img 
              src={logoImg} 
              alt="The Cabinet Store" 
              className="h-16 w-16"
            />
            <Button
              onClick={() => setIsCartOpen(true)}
              className="gap-2 relative"
              variant="outline"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart
              {totalItems > 0 && (
                <span className={`absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ${cartBadgePulse ? 'animate-bounce' : ''}`}>
                  {totalItems}
                </span>
              )}
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <User className="w-4 h-4" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    <Package className="w-4 h-4 mr-2" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <Building2 className="w-4 h-4 mr-2" />
                    Pro Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={async () => {
                      await supabase.auth.signOut();
                      toast({
                        title: "Signed out",
                        description: "You have been logged out successfully",
                      });
                      navigate("/");
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate("/auth")} variant="default">
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary to-[hsl(215,85%,45%)] text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
            ELIMINATE THE MIDDLEMAN
          </h1>
          <p className="text-xl md:text-2xl font-semibold text-accent mb-2">
            BUY FACTORY DIRECT AND SAVE!
          </p>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mt-4">
            Browse our complete selection of cabinets, countertops, and flooring online at thecabinetstore.org
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Product Categories
          </h2>
          <p className="text-muted-foreground text-lg">
            Real-time pricing and inventory • Order 24/7
          </p>
        </div>

        {loading ? (
          <ProductGridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {products.map((product, index) => (
              <Card 
                key={product.id} 
                className="overflow-hidden transition-all duration-300 group opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards] hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="overflow-hidden relative">
                  <ProgressiveImage
                    src={product.image_url || 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop'}
                    thumbnailSrc={product.thumbnail_url || undefined}
                    alt={product.name}
                    aspectRatio="aspect-[4/3]"
                    className="group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    {getInventoryBadge(product.inventory_status, product.inventory_count)}
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                      {product.category}
                    </span>
                    {product.sku && (
                      <span className="text-xs text-muted-foreground">
                        SKU: {product.sku}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{product.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                  
                  {/* Pricing */}
                  <div className="pt-2 border-t">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.category === 'Flooring' && (
                        <span className="text-sm text-muted-foreground">per sq ft</span>
                      )}
                      {product.category === 'Hardware' && (
                        <span className="text-sm text-muted-foreground">each</span>
                      )}
                    </div>
                  </div>

                  {/* Specifications */}
                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div className="pt-2 space-y-1">
                      <p className="text-xs font-semibold text-foreground uppercase">Specifications</p>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {Object.entries(product.specifications).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium">{key}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
                    disabled={product.inventory_status === 'out_of_stock'}
                  >
                    {product.inventory_status === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
                    {product.inventory_status !== 'out_of_stock' && <ShoppingCart className="w-4 h-4" />}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-2">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Complete Your Order?
            </h3>
            <p className="text-muted-foreground mb-6">
              Review your cart and proceed to checkout to finalize your purchase.
            </p>
            <Button
              onClick={() => setIsCartOpen(true)}
              size="lg"
              className="gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              View Cart {totalItems > 0 && `(${totalItems})`}
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(215,85%,35%)] text-primary-foreground py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            CABINETS • COUNTERTOPS • FLOORS
          </h2>
          <p className="text-accent text-lg font-semibold">
            Factory Direct Pricing - Professional Quality
          </p>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
};

export default OnlineShop;
