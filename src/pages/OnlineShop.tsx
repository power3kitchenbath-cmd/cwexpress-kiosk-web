import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ShoppingCart, Package, AlertCircle, User, LogOut, Building2, Sparkles, ArrowRight, ArrowUpDown, Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@/assets/logo.png";
import { useCart } from "@/contexts/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { ProductGridSkeleton } from "@/components/ui/product-card-skeleton";
import doormarkShakerImg from "@/assets/cabinet-doors/doormark-shaker-abacoa.png";
import doormarkBalHarborImg from "@/assets/cabinet-doors/doormark-bal-harbor.png";
import doormarkCaprisImg from "@/assets/cabinet-doors/doormark-capris.png";
import doormarkEuroImg from "@/assets/cabinet-doors/doormark-euro-shaker.png";
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
  const [sortBy, setSortBy] = useState<string>("category");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
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
        .select('*');

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

  const filteredAndSortedProducts = [...products]
    .filter(product => {
      // Category filter
      if (categoryFilter !== "all" && product.category !== categoryFilter) {
        return false;
      }
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesSKU = product.sku?.toLowerCase().includes(query);
        const matchesDescription = product.description.toLowerCase().includes(query);
        
        return matchesName || matchesSKU || matchesDescription;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "sku":
          return (a.sku || "").localeCompare(b.sku || "");
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "category":
        default:
          return a.category.localeCompare(b.category);
      }
    });

  const availableCategories = [...new Set(products.map(p => p.category))].sort();

  const clearAllFilters = () => {
    setCategoryFilter("all");
    setSearchQuery("");
  };

  const hasActiveFilters = categoryFilter !== "all" || searchQuery.trim() !== "";

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

  const trackEvent = async (eventType: string, eventLabel: string, eventValue?: number) => {
    try {
      await supabase.from('analytics_events').insert({
        event_type: eventType,
        event_category: 'calacatta_banner',
        event_label: eventLabel,
        event_value: eventValue,
        user_id: user?.id || null,
        page_path: window.location.pathname,
        metadata: {
          timestamp: new Date().toISOString(),
          referrer: document.referrer
        }
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-[hsl(225,75%,42%)] to-[hsl(225,80%,32%)] text-white py-3 text-center">
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
      <section className="bg-gradient-to-br from-[hsl(225,75%,42%)] to-[hsl(225,80%,32%)] text-white py-16 relative">
        {/* Soft white vignette effect */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_50%,rgba(255,255,255,0.12)_100%)]" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
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

      {/* Featured Collection Banner */}
      <section className="container mx-auto px-4 py-8">
        <Card 
          className="relative overflow-hidden bg-gradient-to-br from-[hsl(225,75%,42%)] to-[hsl(225,80%,32%)] border-2 border-white/20 hover:border-accent/40 transition-all duration-300 cursor-pointer group"
          onClick={() => {
            trackEvent('click', 'banner_card');
            navigate("/collections/calacatta");
          }}
        >
          {/* Soft white vignette effect */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_50%,rgba(255,255,255,0.08)_100%)]" />
          
          <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center relative z-10">
            {/* Left Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                  New 2025 Collection
                </Badge>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Calacatta Premium Collection
              </h2>
              
              <p className="text-white/90 text-lg">
                Discover 7 exquisite Calacatta quartz variations combining Italian marble elegance 
                with modern durability. From $85/ft.
              </p>
              
              <div className="flex flex-wrap gap-3 pt-2">
                <Button 
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    trackEvent('click', 'explore_collection_button');
                    navigate("/collections/calacatta");
                  }}
                  className="group/btn bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Explore Collection
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    trackEvent('click', 'get_quote_button');
                    navigate("/estimator");
                  }}
                  className="bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-accent hover:text-accent-foreground hover:border-accent"
                >
                  Get Quote
                </Button>
              </div>
            </div>

            {/* Right Content - Image Grid Preview */}
            <div className="relative h-64 md:h-80">
              <div className="grid grid-cols-2 gap-3 h-full">
                <div className="space-y-3">
                  <div className="h-32 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                    <img 
                      src="/src/assets/countertops/calacatta-nova.jpg" 
                      alt="Calacatta Nova"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="h-32 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                    <img 
                      src="/src/assets/countertops/calacatta-venus.jpg" 
                      alt="Calacatta Venus"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
                <div className="space-y-3 pt-6">
                  <div className="h-32 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                    <img 
                      src="/src/assets/countertops/calacatta-gris.jpg" 
                      alt="Calacatta Gris"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="h-32 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                    <img 
                      src="/src/assets/countertops/calacatta-luna.jpg" 
                      alt="Calacatta Luna"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Overlay badge */}
              <div className="absolute -bottom-2 -right-2 bg-accent text-accent-foreground rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-xl font-bold">7</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Doormark Featured Collection Banner */}
      <section className="container mx-auto px-4 py-8">
        <Card 
          className="relative overflow-hidden bg-gradient-to-br from-[hsl(225,75%,38%)] to-[hsl(225,80%,28%)] border-2 border-white/20 hover:border-accent/40 transition-all duration-300 cursor-pointer group"
          onClick={() => {
            trackEvent('click', 'doormark_banner_card');
            navigate("/collections/doormark");
          }}
        >
          {/* Soft white vignette effect */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_50%,rgba(255,255,255,0.08)_100%)]" />
          
          <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center relative z-10">
            {/* Left Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                  Made in South Florida
                </Badge>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Doormark Cabinet Doors
              </h2>
              
              <p className="text-white/90 text-lg">
                Premium replacement cabinet doors and drawer fronts. Transform your kitchen 
                with quality craftsmanship. Multiple styles and finishes available.
              </p>
              
              <div className="flex flex-wrap gap-3 pt-2">
                <Button 
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    trackEvent('click', 'doormark_explore_button');
                    navigate("/collections/doormark");
                  }}
                  className="group/btn bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Explore Door Styles
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    trackEvent('click', 'doormark_contact_button');
                    navigate("/collections/doormark");
                  }}
                  className="bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-accent hover:text-accent-foreground hover:border-accent"
                >
                  View Pricing
                </Button>
              </div>
              
              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground border-t border-border/50">
                <span>🛠️ Custom Sizing Available</span>
                <span>⭐ Premium Quality</span>
              </div>
            </div>

            {/* Right Content - Image Grid Preview */}
            <div className="relative h-64 md:h-80">
              <div className="grid grid-cols-2 gap-3 h-full">
                <div className="space-y-3">
                  <div className="h-32 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow bg-muted">
                    <img 
                      src={doormarkShakerImg} 
                      alt="Shaker Abacoa"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="h-32 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow bg-muted">
                    <img 
                      src={doormarkBalHarborImg} 
                      alt="Bal Harbor"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
                <div className="space-y-3 pt-6">
                  <div className="h-32 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow bg-muted">
                    <img 
                      src={doormarkCaprisImg} 
                      alt="Capris"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="h-32 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow bg-muted">
                    <img 
                      src={doormarkEuroImg} 
                      alt="Euro Shaker"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Overlay badge */}
              <div className="absolute -bottom-2 -right-2 bg-amber-600 text-white rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-xl font-bold">6+</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="space-y-6 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Our Product Categories
              </h2>
              <p className="text-muted-foreground text-lg">
                Real-time pricing and inventory • Order 24/7
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {availableCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="sku">SKU Number</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="price-low">Price (Low to High)</SelectItem>
                    <SelectItem value="price-high">Price (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by product name, SKU, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-12 text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 justify-center">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {categoryFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Category: {categoryFilter}
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {searchQuery.trim() && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-7"
              >
                Clear All
              </Button>
            </div>
          )}

          {/* Results Count */}
          {!loading && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters ? (
                  <>
                    Showing <span className="font-semibold">{filteredAndSortedProducts.length}</span> of{" "}
                    <span className="font-semibold">{products.length}</span> products
                  </>
                ) : (
                  <>
                    <span className="font-semibold">{products.length}</span> products available
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <ProductGridSkeleton count={6} />
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters 
                ? "No products match your search criteria. Try adjusting your filters."
                : "No products available at this time."
              }
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredAndSortedProducts.map((product, index) => (
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
