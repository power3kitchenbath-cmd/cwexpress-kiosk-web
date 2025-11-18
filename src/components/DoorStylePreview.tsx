import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface DoorStyleSpec {
  name: string;
  price: number;
  image: string;
  style: string;
  material: string;
  finish: string[];
  features: string[];
  description: string;
}

interface DoorStylePreviewProps {
  doorStyle: DoorStyleSpec;
  children: React.ReactNode;
}

export const DoorStylePreview = ({ doorStyle, children }: DoorStylePreviewProps) => {
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        side="right" 
        className="w-96 p-0 bg-background/95 backdrop-blur-sm border-2 border-border shadow-2xl"
      >
        <div className="space-y-4">
          {/* Image */}
          <div className="relative h-64 w-full overflow-hidden rounded-t-lg bg-muted">
            <img
              src={doorStyle.image}
              alt={doorStyle.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                ${doorStyle.price}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="px-4 pb-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{doorStyle.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{doorStyle.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Style</p>
                <p className="font-medium">{doorStyle.style}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Material</p>
                <p className="font-medium">{doorStyle.material}</p>
              </div>
            </div>

            {/* Finish Options */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Available Finishes</p>
              <div className="flex flex-wrap gap-1">
                {doorStyle.finish.map((finish) => (
                  <Badge key={finish} variant="outline" className="text-xs">
                    {finish}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Features</p>
              <ul className="space-y-1">
                {doorStyle.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
