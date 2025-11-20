import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Eye, Image } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import cocoaImg from "@/assets/flooring/lvp/cocoa.png";
import butternutImg from "@/assets/flooring/lvp/butternut.png";
import fogImg from "@/assets/flooring/lvp/fog.png";
import blondieImg from "@/assets/flooring/lvp/blondie.png";

interface FlooringImage {
  src: string;
  name: string;
  label: string;
}

const flooringImages: FlooringImage[] = [
  { src: blondieImg, name: "LVP - Cocoa", label: "COCOA" },
  { src: fogImg, name: "LVP - Butternut", label: "BUTTERNUT" },
  { src: butternutImg, name: "LVP - Fog", label: "FOG" },
  { src: cocoaImg, name: "LVP - Blondie", label: "BLONDIE" },
];

interface FlooringHeroProps {
  onSelectFlooring?: (flooringType: string) => void;
  onOpenComparison?: () => void;
  selectedForComparison?: string[];
  onToggleSelection?: (name: string) => void;
  compareMode?: boolean;
}

export const FlooringHero = ({
  onSelectFlooring,
  onOpenComparison,
  selectedForComparison = [],
  onToggleSelection,
  compareMode = false,
}: FlooringHeroProps) => {
  const navigate = useNavigate();

  const handleFlooringClick = (flooringName: string) => {
    if (compareMode && onToggleSelection) {
      onToggleSelection(flooringName);
    } else {
      if (onSelectFlooring) {
        onSelectFlooring(flooringName);
      }
      navigate(`/estimator?flooring=${encodeURIComponent(flooringName)}`);
    }
  };

  const isSelected = (name: string) => selectedForComparison.includes(name);

  return (
    <section className="bg-gradient-to-br from-[hsl(225,75%,42%)] to-[hsl(225,80%,32%)] py-16 relative">
      {/* Soft white vignette effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_50%,rgba(255,255,255,0.12)_100%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            FEATURED LUXURY VINYL PLANK
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-6">
            Premium waterproof flooring with authentic wood look. Durable, easy to install, and perfect for any room.
          </p>
          {compareMode && (
            <Badge variant="secondary" className="text-base px-4 py-2">
              Select 2-4 options to compare • {selectedForComparison.length} selected
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-8">
          {flooringImages.map((flooring, index) => (
            <div
              key={index}
              onClick={() => handleFlooringClick(flooring.name)}
              className={`group relative cursor-pointer overflow-hidden rounded-lg shadow-lg transition-all duration-300 border-2 ${
                isSelected(flooring.name)
                  ? "border-accent ring-2 ring-accent ring-offset-2 shadow-[0_0_20px_rgba(251,191,36,0.4)] scale-105"
                  : "border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:border-accent hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] hover:scale-105"
              }`}
            >
              <div className="aspect-square">
                <img
                  src={flooring.src}
                  alt={flooring.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                <Badge className="bg-accent text-accent-foreground font-bold text-sm px-4 py-1 shadow-lg">
                  {flooring.label}
                </Badge>
              </div>

              {isSelected(flooring.name) && (
                <div className="absolute top-3 right-3 bg-accent text-accent-foreground rounded-full p-2 shadow-lg">
                  <Check className="w-5 h-5" />
                </div>
              )}

              {!compareMode && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    variant="secondary"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl"
                  >
                    Select for Estimate
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {!compareMode && onOpenComparison && (
          <div className="text-center flex gap-4 justify-center">
            <Button
              onClick={onOpenComparison}
              variant="outline"
              size="lg"
              className="bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all"
            >
              <Eye className="mr-2 h-5 w-5" />
              Compare LVP Options
            </Button>
            
            <Button
              onClick={() => navigate("/flooring-visualizer")}
              variant="default"
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
            >
              <Image className="mr-2 h-5 w-5" />
              Try Visualizer
            </Button>
          </div>
        )}

        {compareMode && selectedForComparison.length >= 2 && (
          <div className="text-center">
            <Button
              onClick={onOpenComparison}
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
            >
              <Eye className="mr-2 h-5 w-5" />
              Compare Selected ({selectedForComparison.length})
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
