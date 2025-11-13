import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, ShoppingCart, Package, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@/assets/logo.png";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string | null;
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

  const handleOrderClick = () => {
    window.open("https://thecabinetstore.org/shop", "_blank");
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
              onClick={handleOrderClick}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <ShoppingCart className="w-4 h-4" />
              Shop Online
            </Button>
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
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground animate-pulse mb-4" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
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
                    onClick={handleOrderClick}
                    className="w-full bg-primary hover:bg-primary/90 gap-2"
                    disabled={product.inventory_status === 'out_of_stock'}
                  >
                    {product.inventory_status === 'out_of_stock' ? 'Out of Stock' : 'Order Now'}
                    {product.inventory_status !== 'out_of_stock' && <ExternalLink className="w-4 h-4" />}
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
              Ready to Start Your Project?
            </h3>
            <p className="text-muted-foreground mb-6">
              Visit our online store to browse the complete catalog, get detailed specifications, and place your order.
            </p>
            <Button
              onClick={handleOrderClick}
              size="lg"
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <ExternalLink className="w-5 h-5" />
              Visit TheCabinetStore.org
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
    </div>
  );
};

export default OnlineShop;
