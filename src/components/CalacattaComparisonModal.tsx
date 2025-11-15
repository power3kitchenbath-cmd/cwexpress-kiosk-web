import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CalacattaImage {
  src: string;
  name: string;
}

interface CountertopPricing {
  [key: string]: number;
}

interface CalacattaComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedImages: CalacattaImage[];
  onSelectCountertop: (name: string) => void;
  onClearComparison: () => void;
  pricing: CountertopPricing;
}

export const CalacattaComparisonModal = ({
  open,
  onOpenChange,
  selectedImages,
  onSelectCountertop,
  onClearComparison,
  pricing,
}: CalacattaComparisonModalProps) => {
  const handleSelect = (name: string) => {
    onSelectCountertop(name);
    onOpenChange(false);
    onClearComparison();
  };

  const getPriceForCountertop = (name: string): number => {
    const normalizedName = name.toLowerCase();
    return pricing[normalizedName] || 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            Compare Calacatta Options
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Compare up to {selectedImages.length} selected Calacatta countertops side by side
          </DialogDescription>
        </DialogHeader>

        <div className={`grid gap-6 ${
          selectedImages.length === 2 ? 'grid-cols-2' : 
          selectedImages.length === 3 ? 'grid-cols-3' : 
          'grid-cols-2 md:grid-cols-4'
        }`}>
          {selectedImages.map((image, index) => {
            const pricePerLinearFt = getPriceForCountertop(image.name);
            return (
              <div key={index} className="space-y-3">
                <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-border group">
                  <img
                    src={image.src}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <Button
                      size="sm"
                      onClick={() => handleSelect(image.name.toLowerCase())}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      Select This
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{image.name}</h3>
                    {pricePerLinearFt > 0 && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-accent">${pricePerLinearFt}</p>
                        <p className="text-xs text-muted-foreground">per linear ft</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Material:</span>
                      <span className="font-medium text-foreground">Quartz</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Finish:</span>
                      <span className="font-medium text-foreground">Polished</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thickness:</span>
                      <span className="font-medium text-foreground">3cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pattern:</span>
                      <span className="font-medium text-foreground">Veined Marble</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleSelect(image.name.toLowerCase())}
                  >
                    Add to Estimate
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-3 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClearComparison}
          >
            Clear Selection
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
