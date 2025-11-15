import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import calacattaBonita from "@/assets/countertops/calacatta-bonita.jpg";
import calacattaFiona from "@/assets/countertops/calacatta-fiona.jpg";
import calacattaGris from "@/assets/countertops/calacatta-gris.jpg";
import calacattaIvory from "@/assets/countertops/calacatta-ivory.jpg";
import calacattaLuna from "@/assets/countertops/calacatta-luna.jpg";
import calacattaNova from "@/assets/countertops/calacatta-nova.jpg";
import calacattaVenus from "@/assets/countertops/calacatta-venus.jpg";

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
}

export const CalacattaHero = ({ onFilterCalacatta, onSelectCountertop }: CalacattaHeroProps) => {
  const handleCTAClick = () => {
    onFilterCalacatta();
    setTimeout(() => {
      const countertopSection = document.querySelector('[data-section="countertops"]');
      countertopSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleImageClick = (name: string) => {
    onFilterCalacatta();
    onSelectCountertop(name.toLowerCase());
    setTimeout(() => {
      const countertopSection = document.querySelector('[data-section="countertops"]');
      countertopSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };
  return (
    <Card className="mb-8 overflow-hidden border-2 border-accent/30 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="p-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-accent" />
          <h2 className="text-3xl font-bold text-foreground">
            Premium Calacatta Collection
          </h2>
          <Sparkles className="w-8 h-8 text-accent" />
        </div>
        
        <p className="text-center text-muted-foreground mb-6 max-w-2xl mx-auto">
          Discover our exclusive collection of 7 stunning Calacatta quartz countertops. 
          Timeless elegance meets modern durability.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          {calacattaImages.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-lg border-2 border-border hover:border-accent transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
              onClick={() => handleImageClick(image.name)}
            >
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
                    Click to select
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="default"
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            onClick={handleCTAClick}
          >
            Add Calacatta to Your Estimate
          </Button>
        </div>
      </div>
    </Card>
  );
};
