import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, TrendingUp, DollarSign, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import * as React from "react";

interface FlooringImage {
  src: string;
  name: string;
  label: string;
}

interface FlooringComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedImages: FlooringImage[];
  onSelectFlooring: (flooringType: string) => void;
  onClearComparison: () => void;
  pricing: Record<string, number>;
}

export const FlooringComparisonModal = ({
  open,
  onOpenChange,
  selectedImages,
  onSelectFlooring,
  onClearComparison,
  pricing,
}: FlooringComparisonModalProps) => {
  const [sortOrder, setSortOrder] = React.useState<'none' | 'asc' | 'desc'>('none');

  const handleSelect = (name: string) => {
    onSelectFlooring(name);
    onOpenChange(false);
  };

  const getPriceForFlooring = (name: string) => {
    const normalizedName = name.toLowerCase().replace(/\s+/g, '-');
    return pricing[normalizedName] || 4.99;
  };

  const sortedImages = React.useMemo(() => {
    if (sortOrder === 'none') return selectedImages;
    
    return [...selectedImages].sort((a, b) => {
      const priceA = getPriceForFlooring(a.name);
      const priceB = getPriceForFlooring(b.name);
      
      if (sortOrder === 'asc') {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    });
  }, [selectedImages, sortOrder, pricing]);

  const priceRange = React.useMemo(() => {
    const prices = sortedImages
      .map(img => getPriceForFlooring(img.name))
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
                Compare LVP Flooring Options
              </DialogTitle>
              <DialogDescription>
                Compare up to {selectedImages.length} selected luxury vinyl plank options side by side
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
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6 rounded-lg border border-border/50 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">Price Range Overview</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-background/50 rounded-md">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Lowest</p>
                  <p className="text-xl font-bold text-foreground">${priceRange.min.toFixed(2)}/sq ft</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-background/50 rounded-md">
                <DollarSign className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Average</p>
                  <p className="text-xl font-bold text-foreground">${priceRange.avg.toFixed(2)}/sq ft</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-background/50 rounded-md">
                <DollarSign className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Highest</p>
                  <p className="text-xl font-bold text-foreground">${priceRange.max.toFixed(2)}/sq ft</p>
                </div>
              </div>
            </div>
            
            {priceRange.max > priceRange.min && (
              <div className="mt-4 p-3 bg-accent/10 rounded-md border border-accent/20">
                <p className="text-sm text-foreground">
                  <span className="font-semibold text-accent">Potential Savings:</span> Up to ${(priceRange.max - priceRange.min).toFixed(2)}/sq ft by choosing the most economical option
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
            const pricePerSqFt = getPriceForFlooring(image.name);
            return (
              <div key={index} className="space-y-3">
                <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg group">
                  <img
                    src={image.src}
                    alt={image.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <Badge className="bg-accent text-accent-foreground font-bold shadow-lg">
                      {image.label}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">{image.name}</h4>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-accent">${pricePerSqFt.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">/sq ft</span>
                  </div>

                  <Button
                    onClick={() => handleSelect(image.name)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="sm"
                  >
                    Select for Estimate
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClearComparison}
            size="sm"
          >
            Clear Selection
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Comparing {selectedImages.length} flooring option{selectedImages.length !== 1 ? 's' : ''}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
