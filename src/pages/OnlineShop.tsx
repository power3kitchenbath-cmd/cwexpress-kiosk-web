import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "@/assets/logo.png";

const OnlineShop = () => {
  const navigate = useNavigate();

  const products = [
    {
      id: 1,
      name: "Cabinet Hardware",
      description: "Premium quality cabinet knobs, pulls, and handles in various finishes",
      category: "Hardware",
      image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      name: "Quartz Vanity Tops",
      description: "Custom-size Quartz Vanity Top with Single Bowl Sink",
      category: "Countertops",
      image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      name: "Kitchen Cabinets",
      description: "Factory direct RTA kitchen cabinets in multiple styles and finishes",
      category: "Cabinets",
      image: "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=400&h=300&fit=crop",
    },
    {
      id: 4,
      name: "Countertop Slabs",
      description: "Granite, quartz, and marble slabs for kitchen and bathroom",
      category: "Countertops",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    },
    {
      id: 5,
      name: "Luxury Vinyl Flooring",
      description: "Waterproof luxury vinyl plank flooring in wood and stone looks",
      category: "Flooring",
      image: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&h=300&fit=crop",
    },
    {
      id: 6,
      name: "Bathroom Vanities",
      description: "Complete bathroom vanity sets with tops and mirrors",
      category: "Cabinets",
      image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop",
    },
  ];

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
            Explore our full catalog online and order 24/7
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    {product.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground">{product.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
                <Button
                  onClick={handleOrderClick}
                  className="w-full bg-primary hover:bg-primary/90 gap-2"
                >
                  View on Website
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

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
