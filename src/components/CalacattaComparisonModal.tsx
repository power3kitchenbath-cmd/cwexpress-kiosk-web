import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, TrendingUp, DollarSign, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import * as React from "react";

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
  const [sortOrder, setSortOrder] = React.useState<'none' | 'asc' | 'desc'>('none');

  const handleSelect = (name: string) => {
    onSelectCountertop(name);
    onOpenChange(false);
    onClearComparison();
  };

  const getPriceForCountertop = (name: string): number => {
    const normalizedName = name.toLowerCase();
    return pricing[normalizedName] || 0;
  };

  const sortedImages = React.useMemo(() => {
    if (sortOrder === 'none') return selectedImages;
    
    return [...selectedImages].sort((a, b) => {
      const priceA = getPriceForCountertop(a.name);
      const priceB = getPriceForCountertop(b.name);
      
      if (sortOrder === 'asc') {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    });
  }, [selectedImages, sortOrder, pricing]);

  const priceRange = React.useMemo(() => {
    const prices = sortedImages
      .map(img => getPriceForCountertop(img.name))
      .filter(price => price > 0);
    
    if (prices.length === 0) return null;
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    
    return { min, max, avg };
  }, [sortedImages, pricing]);

  const cycleSortOrder = () => {
    if (sortOrder === 'none') {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder('none');
    }
  };

  const getSortIcon = () => {
    if (sortOrder === 'asc') return <ArrowUp className="w-4 h-4" />;
    if (sortOrder === 'desc') return <ArrowDown className="w-4 h-4" />;
    return <ArrowUpDown className="w-4 h-4" />;
  };

  const getSortLabel = () => {
    if (sortOrder === 'asc') return 'Price: Low to High';
    if (sortOrder === 'desc') return 'Price: High to Low';
    return 'Sort by Price';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-3">
                Compare Calacatta Options
              </DialogTitle>
              <DialogDescription>
                Compare up to {selectedImages.length} selected Calacatta countertops side by side
              </DialogDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={sortOrder !== 'none' ? 'default' : 'outline'}
                size="sm"
                onClick={cycleSortOrder}
                className={sortOrder !== 'none' ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : ''}
              >
                {getSortIcon()}
                <span className="ml-2">{getSortLabel()}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {priceRange && (
          <div className="bg-accent/10 border-2 border-accent/30 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Price Range</h3>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Lowest</p>
                  <p className="text-xl font-bold text-accent">${priceRange.min}</p>
                </div>
                
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Highest</p>
                  <p className="text-xl font-bold text-accent">${priceRange.max}</p>
                </div>
                
                {priceRange.min !== priceRange.max && (
                  <>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Average</p>
                      <p className="text-lg font-semibold text-foreground">${priceRange.avg.toFixed(2)}</p>
                    </div>
                  </>
                )}
              </div>
              
              <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/40">
                per linear ft
              </Badge>
            </div>
            
            {priceRange.min !== priceRange.max && (
              <div className="mt-3 pt-3 border-t border-accent/20">
                <p className="text-xs text-muted-foreground text-center">
                  Price difference: <span className="font-semibold text-foreground">${(priceRange.max - priceRange.min).toFixed(2)}</span> per linear ft
                </p>
              </div>
            )}
          </div>
        )}

        <div className={`grid gap-6 ${
          sortedImages.length === 2 ? 'grid-cols-2' : 
          sortedImages.length === 3 ? 'grid-cols-3' : 
          'grid-cols-2 md:grid-cols-4'
        }`}>
          {sortedImages.map((image, index) => {
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
