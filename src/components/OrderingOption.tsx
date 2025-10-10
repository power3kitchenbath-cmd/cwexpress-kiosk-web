import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OrderingOptionProps {
  title: string;
  description: string;
  image: string;
  buttonText: string;
  onButtonClick?: () => void;
  highlight?: boolean;
}

export const OrderingOption = ({
  title,
  description,
  image,
  buttonText,
  onButtonClick,
  highlight = false,
}: OrderingOptionProps) => {
  return (
    <Card
      className={cn(
        "overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl",
        highlight ? "border-accent bg-card" : "border-border bg-card"
      )}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-6 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        <Button
          variant="kiosk"
          size="lg"
          onClick={onButtonClick}
          className="w-full"
        >
          {buttonText}
        </Button>
      </div>
    </Card>
  );
};
