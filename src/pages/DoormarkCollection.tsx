import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductGridSkeleton } from "@/components/ui/product-card-skeleton";
import { ArrowLeft, ShoppingCart, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  sku: string | null;
  specifications: any;
}

const DoormarkCollection = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [finishFilter, setFinishFilter] = useState<string>("all");
  const [styleFilter, setStyleFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("price-low");
  const { addItem } = useCart();

  useEffect(() => {
    fetchDoormarkProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, finishFilter, styleFilter, priceFilter, sortBy]);

  const fetchDoormarkProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'Cabinet Doors & Drawers')
        .like('sku', 'DOOR-%')
        .order('price', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching Doormark products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Filter by finish
    if (finishFilter !== "all") {
      filtered = filtered.filter(product => 
        product.specifications?.finish?.toLowerCase() === finishFilter.toLowerCase()
      );
    }

    // Filter by style
    if (styleFilter !== "all") {
      filtered = filtered.filter(product => 
        product.specifications?.style?.toLowerCase().includes(styleFilter.toLowerCase())
      );
    }

    // Filter by price
    if (priceFilter !== "all") {
      if (priceFilter === "under-50") {
        filtered = filtered.filter(product => product.price < 50);
      } else if (priceFilter === "50-100") {
        filtered = filtered.filter(product => product.price >= 50 && product.price < 100);
      } else if (priceFilter === "over-100") {
        filtered = filtered.filter(product => product.price >= 100);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
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

    setFilteredProducts(filtered);
  };

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

  const clearFilters = () => {
    setFinishFilter("all");
    setStyleFilter("all");
    setPriceFilter("all");
  };

  const hasActiveFilters = finishFilter !== "all" || styleFilter !== "all" || priceFilter !== "all";

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
      <section className="relative py-20 px-4 bg-gradient-to-br from-[hsl(225,75%,42%)] to-[hsl(225,80%,32%)]">
        {/* Soft white vignette effect */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_50%,rgba(255,255,255,0.12)_100%)]" />
        
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20" variant="secondary">
            Premium Quality
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Doormark Cabinet Doors
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Transform your kitchen with premium replacement cabinet doors and drawer fronts 
            from Doormark. Proudly crafted in South Florida with precision and quality that 
            stands the test of time.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate("/cabinet-visualizer")}
              className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Try Virtual Visualizer
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => {
                const element = document.getElementById('products-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-accent hover:text-accent-foreground hover:border-accent"
            >
              Browse Styles
            </Button>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section id="products-section" className="border-b border-border bg-muted/20">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Filter Products</h2>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => navigate("/cabinet-visualizer")}
              >
                Try Visualizer
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Finish Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  Finish
                </label>
                <Select value={finishFilter} onValueChange={setFinishFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Finishes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Finishes</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="espresso">Espresso</SelectItem>
                    <SelectItem value="gray">Gray</SelectItem>
                    <SelectItem value="natural">Natural</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Style Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  Style
                </label>
                <Select value={styleFilter} onValueChange={setStyleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Styles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Styles</SelectItem>
                    <SelectItem value="shaker">Shaker</SelectItem>
                    <SelectItem value="flat">Flat Panel</SelectItem>
                    <SelectItem value="raised">Raised Panel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  Price Range
                </label>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Prices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="under-50">Under $50</SelectItem>
                    <SelectItem value="50-100">$50 - $100</SelectItem>
                    <SelectItem value="over-100">Over $100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground">
                  <ArrowUpDown className="w-4 h-4 inline mr-1" />
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
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
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <ProductGridSkeleton />
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                No products match your filters
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-muted-foreground">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      <img
                        src={product.image_url || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.specifications?.style && (
                        <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur">
                          {product.specifications.style}
                        </Badge>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs">
                          {product.sku}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      {product.specifications && (
                        <div className="mb-4 space-y-1 text-sm">
                          {product.specifications.finish && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">Finish:</span> {product.specifications.finish}
                            </p>
                          )}
                          {product.specifications.material && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">Material:</span> {product.specifications.material}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-2xl font-bold text-primary">
                          ${product.price.toFixed(2)}
                        </span>
                        <Button 
                          onClick={() => handleAddToCart(product)}
                          className="gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-semibold text-lg mb-2">Premium Quality</h3>
              <p className="text-muted-foreground text-sm">
                Crafted with precision using the finest materials for lasting beauty
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Made in South Florida</h3>
              <p className="text-muted-foreground text-sm">
                Locally manufactured with pride by skilled craftspeople
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Custom Sizing</h3>
              <p className="text-muted-foreground text-sm">
                Contact us for custom sizes to perfectly fit your space
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DoormarkCollection;
