import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductGridSkeleton } from "@/components/ui/product-card-skeleton";
import { Download, ArrowLeft, ShoppingCart, ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  sku: string | null;
  specifications: any;
}

const CalacattaCollection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("price-low");
  const { addItem } = useCart();

  useEffect(() => {
    fetchCalacattaProducts();
  }, []);

  const fetchCalacattaProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'Countertops')
        .like('sku', 'CAL-%');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching Calacatta products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "sku":
        return (a.sku || "").localeCompare(b.sku || "");
      case "name":
        return a.name.localeCompare(b.name);
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url || '',
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleDownloadBrochure = () => {
    const link = document.createElement('a');
    link.href = '/documents/calacatta-2025-catalog.pdf';
    link.download = 'Calacatta-2025-Collection.pdf';
    link.click();
    toast.success('Downloading brochure...');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/online-shop">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
            <Link to="/checkout">
              <Button variant="outline" size="sm">
                <ShoppingCart className="w-4 h-4 mr-2" />
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-amber-50 via-yellow-50/50 to-amber-100/80">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-4" variant="secondary">
            2025 Collection
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Calacatta Collection
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover our premium Calacatta quartz countertop collection. Seven exquisite 
            variations combining the timeless elegance of Italian marble with modern durability 
            and performance. Each surface tells a unique story of luxury and craftsmanship.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" onClick={handleDownloadBrochure}>
              <Download className="w-5 h-5 mr-2" />
              Download Brochure
            </Button>
            <Link to="/estimator">
              <Button size="lg" variant="outline">
                Request Quote
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Collection Info */}
      <section className="py-12 px-4 bg-amber-100/30 border-y border-amber-200/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-3xl font-bold mb-2">7</h3>
              <p className="text-muted-foreground">Unique Variations</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-2">3cm</h3>
              <p className="text-muted-foreground">Premium Thickness</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-2">100%</h3>
              <p className="text-muted-foreground">Polished Finish</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Gallery */}
      <section className="py-16 px-4 bg-gradient-to-b from-amber-50/50 to-background">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <h2 className="text-3xl font-bold text-center md:text-left">
              Explore the Collection
            </h2>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sku">SKU Number</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">Price (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <ProductGridSkeleton count={7} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden group hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-[hsl(225,75%,42%)] to-[hsl(225,80%,32%)] p-3">
                  {/* Product Image */}
                  <div className="aspect-[4/3] rounded-md overflow-hidden bg-muted">
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="p-6 space-y-4 bg-background rounded-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {product.sku}
                        </Badge>
                        <h3 className="text-xl font-semibold">{product.name}</h3>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {product.description}
                    </p>

                    {/* Specifications */}
                    {product.specifications && (
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {product.specifications.material && (
                          <span className="px-2 py-1 rounded bg-muted">
                            {product.specifications.material}
                          </span>
                        )}
                        {product.specifications.finish && (
                          <span className="px-2 py-1 rounded bg-muted">
                            {product.specifications.finish}
                          </span>
                        )}
                        {product.specifications.thickness && (
                          <span className="px-2 py-1 rounded bg-muted">
                            {product.specifications.thickness}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price and Action */}
                    <div className="pt-4 border-t space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">
                          ${product.price}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          per linear ft
                        </span>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Space?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our design team is ready to help you select the perfect Calacatta variation 
            for your project. Get a detailed quote or schedule a consultation.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/estimator">
              <Button size="lg">
                Get Free Estimate
              </Button>
            </Link>
            <Button size="lg" variant="outline" onClick={handleDownloadBrochure}>
              <Download className="w-5 h-5 mr-2" />
              Download Full Specs
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 Calacatta Collection. Premium Quartz Countertops.</p>
        </div>
      </footer>
    </div>
  );
};

export default CalacattaCollection;
