import { OrderingOption } from "@/components/OrderingOption";
import { Monitor, Store, Globe, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import showroomImg from "@/assets/showroom.jpg";
import kioskImg from "@/assets/kiosk-screen.jpg";
import logoImg from "@/assets/logo.png";
import { FlooringHero } from "@/components/FlooringHero";
import { FlooringComparisonModal } from "@/components/FlooringComparisonModal";
import cocoaImg from "@/assets/flooring/lvp/cocoa.png";
import butternutImg from "@/assets/flooring/lvp/butternut.png";
import fogImg from "@/assets/flooring/lvp/fog.png";
import blondieImg from "@/assets/flooring/lvp/blondie.png";

const flooringImages = [
  { src: blondieImg, name: "LVP - Cocoa", label: "COCOA" },
  { src: fogImg, name: "LVP - Butternut", label: "BUTTERNUT" },
  { src: butternutImg, name: "LVP - Fog", label: "FOG" },
  { src: cocoaImg, name: "LVP - Blondie", label: "BLONDIE" },
];

const flooringPricing: Record<string, number> = {
  "lvp-cocoa": 4.99,
  "lvp-butternut": 4.99,
  "lvp-fog": 4.99,
  "lvp-blondie": 4.99,
};

const Index = () => {
  const navigate = useNavigate();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);
  
  const handleKioskClick = () => {
    navigate("/estimator");
  };

  const handleShowroomClick = () => {
    navigate("/design-import");
  };

  const handleWebsiteClick = () => {
    navigate("/online-shop");
  };

  const handleToggleSelection = (name: string) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(name)) {
        return prev.filter((n) => n !== name);
      } else if (prev.length < 4) {
        return [...prev, name];
      }
      return prev;
    });
  };

  const handleOpenComparison = () => {
    if (selectedForComparison.length >= 2) {
      setIsComparisonModalOpen(true);
    } else {
      setCompareMode(true);
    }
  };

  const handleSelectFlooring = (flooringType: string) => {
    navigate(`/estimator?flooring=${encodeURIComponent(flooringType)}`);
  };

  const handleClearComparison = () => {
    setSelectedForComparison([]);
    setCompareMode(false);
  };

  const selectedImagesForModal = flooringImages.filter((img) =>
    selectedForComparison.includes(img.name)
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary via-primary to-[hsl(215,85%,45%)]">
      {/* Hero Header */}
      <header className="py-12 text-center">
        <div className="container mx-auto px-4">
          {isAuthenticated && (
            <div className="flex justify-end mb-4">
              <Button 
                variant="secondary" 
                onClick={() => navigate("/portal")}
                className="flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                My Dashboard
              </Button>
            </div>
          )}
          <img 
            src={logoImg} 
            alt="3 Power Logo" 
            className="w-32 h-32 mx-auto mb-6 drop-shadow-lg"
          />
          <h1 className="text-6xl md:text-8xl font-extrabold text-primary-foreground mb-4 tracking-tight drop-shadow-lg animate-fade-in">
            ORDER TODAY
          </h1>
          <div className="flex gap-3 justify-center mb-6">
            <Button 
              size="lg" 
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={() => navigate("/estimates")}
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-background/10 backdrop-blur-sm border-accent text-accent hover:bg-background/20"
              onClick={() => navigate("/quote-comparison")}
            >
              Compare Prices
            </Button>
          </div>
          <div className="flex items-center justify-center gap-4 flex-wrap text-accent font-bold text-xl md:text-2xl">
            <span className="flex items-center gap-2">
              <Monitor className="w-6 h-6" />
              CW EXPRESS KIOSK
            </span>
            <span className="text-primary-foreground">✦</span>
            <span className="flex items-center gap-2">
              <Store className="w-6 h-6" />
              SHOWROOM
            </span>
            <span className="text-primary-foreground">✦</span>
            <span className="flex items-center gap-2">
              <Globe className="w-6 h-6" />
              OUR ONLINE WEBSITE
            </span>
          </div>
        </div>
      </header>

      {/* Main Content - Three Options */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <OrderingOption
            title="CW EXPRESS KIOSK"
            description="Use our self-service kiosk to browse products, get instant quotes, and place orders right here in-store."
            image={kioskImg}
            buttonText="Get Started Now"
            onButtonClick={handleKioskClick}
          />
          
          <OrderingOption
            title="IMPORT KCDW DESIGN"
            description="Upload your KCDW cabinet designs and drawings to automatically generate estimates and present to clients."
            image={showroomImg}
            buttonText="Import Design"
            onButtonClick={handleShowroomClick}
            highlight={true}
          />
          
          <OrderingOption
            title="ONLINE ORDERING"
            description="Browse our full catalog and place orders 24/7 from the comfort of your home at thecabinetstore.org"
            image={kioskImg}
            buttonText="Visit Website"
            onButtonClick={handleWebsiteClick}
          />
        </div>
      </section>

      {/* Flooring Hero Section */}
      <FlooringHero
        onSelectFlooring={handleSelectFlooring}
        onOpenComparison={handleOpenComparison}
        selectedForComparison={selectedForComparison}
        onToggleSelection={handleToggleSelection}
        compareMode={compareMode}
      />

      {/* Flooring Comparison Modal */}
      <FlooringComparisonModal
        open={isComparisonModalOpen}
        onOpenChange={setIsComparisonModalOpen}
        selectedImages={selectedImagesForModal}
        onSelectFlooring={handleSelectFlooring}
        onClearComparison={handleClearComparison}
        pricing={flooringPricing}
      />

      {/* Bottom Banner */}
      <footer className="bg-[hsl(215,85%,35%)] py-8 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
            CABINETS • COUNTERTOPS • FLOORS
          </h2>
          <p className="text-accent text-lg font-semibold">
            Factory Direct Pricing - Professional Quality
          </p>
          <button
            onClick={() => navigate("/admin")}
            className="absolute bottom-2 right-2 text-xs text-primary-foreground/40 hover:text-primary-foreground/60 transition-colors"
          >
            Admin
          </button>
        </div>
      </footer>
    </main>
  );
};

export default Index;
