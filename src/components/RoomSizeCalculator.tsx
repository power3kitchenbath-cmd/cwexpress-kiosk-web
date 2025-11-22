import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Home, TrendingDown, Layers } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function RoomSizeCalculator() {
  const [squareFeet, setSquareFeet] = useState<string>("");
  const [flooringGrade, setFlooringGrade] = useState<"standard" | "premium">("standard");
  const [showResults, setShowResults] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<string>("");

  // Room type presets
  const roomPresets = [
    { value: "small-bedroom", label: "Small Bedroom", sqft: 150 },
    { value: "medium-bedroom", label: "Medium Bedroom", sqft: 175 },
    { value: "large-bedroom", label: "Large Bedroom", sqft: 200 },
    { value: "small-living", label: "Small Living Room", sqft: 200 },
    { value: "medium-living", label: "Medium Living Room", sqft: 250 },
    { value: "large-living", label: "Large Living Room", sqft: 300 },
    { value: "small-kitchen", label: "Small Kitchen", sqft: 100 },
    { value: "medium-kitchen", label: "Medium Kitchen", sqft: 125 },
    { value: "large-kitchen", label: "Large Kitchen", sqft: 150 },
    { value: "dining-room", label: "Dining Room", sqft: 180 },
    { value: "home-office", label: "Home Office", sqft: 120 },
    { value: "hallway", label: "Hallway", sqft: 80 },
    { value: "custom", label: "Custom Size", sqft: 0 }
  ];

  const handleRoomTypeChange = (value: string) => {
    setSelectedRoomType(value);
    const preset = roomPresets.find(room => room.value === value);
    if (preset && preset.sqft > 0) {
      setSquareFeet(preset.sqft.toString());
      setShowResults(false);
    } else if (value === "custom") {
      setSquareFeet("");
      setShowResults(false);
    }
  };

  // Pricing data from PricingComparisonChart
  const pricing = {
    standard: {
      material: 3.49,
      competitors: { homeDepot: 3.99, lowes: 3.79 }
    },
    premium: {
      material: 5.74, // Average of $4.99-$6.49
      competitors: { homeDepot: 6.49, lowes: 6.29 }
    },
    labor: {
      min: 2.0,
      max: 3.5,
      avg: 2.75
    }
  };

  const calculateCosts = () => {
    const sqft = parseFloat(squareFeet);
    if (isNaN(sqft) || sqft <= 0) return null;

    const materialPrice = flooringGrade === "standard" ? pricing.standard.material : pricing.premium.material;
    const materialCost = sqft * materialPrice;
    const laborCost = sqft * pricing.labor.avg;
    const totalCost = materialCost + laborCost;

    const competitorPrice = flooringGrade === "standard" 
      ? pricing.standard.competitors.homeDepot 
      : pricing.premium.competitors.homeDepot;
    const competitorMaterial = sqft * competitorPrice;
    const competitorLabor = sqft * 3.5; // Competitors typically charge more for labor
    const competitorTotal = competitorMaterial + competitorLabor;

    const savings = competitorTotal - totalCost;

    return {
      materialCost,
      laborCost,
      totalCost,
      competitorTotal,
      savings,
      pricePerSqft: totalCost / sqft
    };
  };

  const handleCalculate = () => {
    if (squareFeet && parseFloat(squareFeet) > 0) {
      setShowResults(true);
    }
  };

  const results = showResults ? calculateCosts() : null;

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Calculator className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">LVP Flooring Cost Calculator</CardTitle>
            <CardDescription>
              Estimate your total installation costs based on room size
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="roomType" className="text-base font-semibold mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Room Configuration
              </Label>
              <Select value={selectedRoomType} onValueChange={handleRoomTypeChange}>
                <SelectTrigger id="roomType" className="text-lg h-12 bg-background z-50">
                  <SelectValue placeholder="Select a room type or enter custom size" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {roomPresets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value} className="cursor-pointer">
                      {preset.label}
                      {preset.sqft > 0 && (
                        <span className="text-muted-foreground ml-2">({preset.sqft} sqft)</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                Quick presets for common room sizes
              </p>
            </div>

            <div>
              <Label htmlFor="squareFeet" className="text-base font-semibold mb-2 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Room Size (Square Feet)
              </Label>
              <Input
                id="squareFeet"
                type="number"
                placeholder="Enter square footage (e.g., 250)"
                value={squareFeet}
                onChange={(e) => {
                  setSquareFeet(e.target.value);
                  setSelectedRoomType("custom");
                }}
                min="1"
                step="1"
                className="text-lg h-12"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Or enter a custom square footage value
              </p>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Flooring Grade</Label>
              <RadioGroup value={flooringGrade} onValueChange={(value: any) => setFlooringGrade(value)}>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard" className="cursor-pointer flex-1">
                    <div className="font-semibold">Standard Grade</div>
                    <div className="text-sm text-muted-foreground">$3.49/sqft • Cocoa, Butternut, Fog, Blondie</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="premium" id="premium" />
                  <Label htmlFor="premium" className="cursor-pointer flex-1">
                    <div className="font-semibold">Premium Grade</div>
                    <div className="text-sm text-muted-foreground">$4.99-$6.49/sqft • Enhanced durability & design</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              onClick={handleCalculate} 
              size="lg" 
              className="w-full"
              disabled={!squareFeet || parseFloat(squareFeet) <= 0}
            >
              <Calculator className="w-5 h-5 mr-2" />
              Calculate Total Cost
            </Button>
          </div>

          {results && (
            <div className="space-y-4">
              <div className="p-6 rounded-lg bg-primary/10 border-2 border-primary/30">
                <h3 className="font-semibold text-lg mb-4 text-primary">Your Estimated Costs</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-primary/20">
                    <span className="text-muted-foreground">Material Cost:</span>
                    <span className="font-semibold">${results.materialCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-primary/20">
                    <span className="text-muted-foreground">Labor Cost:</span>
                    <span className="font-semibold">${results.laborCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">Total Cost:</span>
                    <span className="text-2xl font-bold text-primary">${results.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground text-center pt-2 border-t border-primary/20">
                    ${results.pricePerSqft.toFixed(2)} per square foot (all-in)
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-secondary/10 border border-border">
                <h3 className="font-semibold text-lg mb-4">Competitor Comparison</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Typical Competitor Price:</span>
                    <span className="font-semibold text-muted-foreground line-through">
                      ${results.competitorTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">Your Savings:</span>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      <TrendingDown className="w-5 h-5 mr-2" />
                      ${results.savings.toFixed(2)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Price includes professional installation by our in-house team. 
                  Final pricing may vary based on room layout, subfloor condition, and additional services like furniture moving.
                </p>
              </div>
            </div>
          )}

          {!results && (
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg">
              <div className="text-center text-muted-foreground">
                <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Enter Room Details</p>
                <p className="text-sm">Fill in the room size and select flooring grade to see your cost estimate</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
