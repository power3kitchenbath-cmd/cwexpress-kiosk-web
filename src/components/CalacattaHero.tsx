import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, GitCompare, X } from "lucide-react";
import calacattaBonita from "@/assets/countertops/calacatta-bonita.jpg";
import calacattaFiona from "@/assets/countertops/calacatta-fiona.jpg";
import calacattaGris from "@/assets/countertops/calacatta-gris.jpg";
import calacattaIvory from "@/assets/countertops/calacatta-ivory.jpg";
import calacattaLuna from "@/assets/countertops/calacatta-luna.jpg";
import calacattaNova from "@/assets/countertops/calacatta-nova.jpg";
import calacattaVenus from "@/assets/countertops/calacatta-venus.jpg";
import { useState } from "react";

const calacattaImages = [
  { src: calacattaBonita, name: "Calacatta Bonita" },
  { src: calacattaFiona, name: "Calacatta Fiona" },
  { src: calacattaGris, name: "Calacatta Gris" },
  { src: calacattaIvory, name: "Calacatta Ivory" },
  { src: calacattaLuna, name: "Calacatta Luna" },
  { src: calacattaNova, name: "Calacatta Nova" },
  { src: calacattaVenus, name: "Calacatta Venus" },
];

interface CalacattaHeroProps {
  onFilterCalacatta: () => void;
  onSelectCountertop: (countertopName: string) => void;
  onCompare: (images: { src: string; name: string }[]) => void;
}

export const CalacattaHero = ({ onFilterCalacatta, onSelectCountertop, onCompare }: CalacattaHeroProps) => {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);

  const handleCTAClick = () => {
    onFilterCalacatta();
    setTimeout(() => {
      const countertopSection = document.querySelector('[data-section="countertops"]');
      countertopSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleImageClick = (name: string, index: number) => {
    if (compareMode) {
      // Toggle selection in compare mode
      setSelectedForCompare(prev => 
        prev.includes(index) 
          ? prev.filter(i => i !== index)
          : prev.length < 4 ? [...prev, index] : prev
      );
    } else {
      // Direct select in normal mode
      onFilterCalacatta();
      onSelectCountertop(name.toLowerCase());
      setTimeout(() => {
        const countertopSection = document.querySelector('[data-section="countertops"]');
        countertopSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const handleCompare = () => {
    const imagesToCompare = selectedForCompare.map(index => calacattaImages[index]);
    onCompare(imagesToCompare);
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    setSelectedForCompare([]);
  };
  return (
    <Card className="mb-8 overflow-hidden border-2 border-accent/30 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 justify-center">
            <Sparkles className="w-8 h-8 text-accent" />
            <h2 className="text-3xl font-bold text-foreground">
              Premium Calacatta Collection
            </h2>
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          
          <Button
            variant={compareMode ? "default" : "outline"}
            size="sm"
            onClick={toggleCompareMode}
            className={compareMode ? "bg-accent text-accent-foreground" : ""}
          >
            {compareMode ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Exit Compare
              </>
            ) : (
              <>
                <GitCompare className="w-4 h-4 mr-2" />
                Compare
              </>
            )}
          </Button>
        </div>
        
        <p className="text-center text-muted-foreground mb-6 max-w-2xl mx-auto">
          {compareMode 
            ? "Select up to 4 countertops to compare side by side"
            : "Discover our exclusive collection of 7 stunning Calacatta quartz countertops. Timeless elegance meets modern durability."
          }
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          {calacattaImages.map((image, index) => {
            const isSelected = selectedForCompare.includes(index);
            return (
              <div
                key={index}
                className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${
                  isSelected 
                    ? 'border-accent ring-2 ring-accent ring-offset-2' 
                    : 'border-border hover:border-accent'
                }`}
                onClick={() => handleImageClick(image.name, index)}
              >
                {isSelected && (
                  <Badge className="absolute top-2 right-2 z-10 bg-accent text-accent-foreground">
                    Selected
                  </Badge>
                )}
                <img
                  src={image.src}
                  alt={image.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-xs font-semibold text-foreground text-center">
                      {image.name}
                    </p>
                    <p className="text-[10px] text-accent text-center mt-1 font-medium">
                      {compareMode ? (isSelected ? 'Click to deselect' : 'Click to select') : 'Click to select'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-3">
          {compareMode && selectedForCompare.length >= 2 ? (
            <>
              <Button
                variant="default"
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                onClick={handleCompare}
              >
                <GitCompare className="w-5 h-5 mr-2" />
                Compare Selected ({selectedForCompare.length})
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setSelectedForCompare([])}
              >
                Clear Selection
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              onClick={handleCTAClick}
              disabled={compareMode}
            >
              Add Calacatta to Your Estimate
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
