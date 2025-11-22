import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, Bath, TrendingDown } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type VanityTier = "good" | "better" | "best";
type VanityType = "single" | "double";

export function VanitySizeCalculator() {
  const [quantity, setQuantity] = useState<string>("1");
  const [vanityType, setVanityType] = useState<VanityType>("single");
  const [tier, setTier] = useState<VanityTier>("good");
  const [singleToDouble, setSingleToDouble] = useState(false);
  const [plumbingWallChange, setPlumbingWallChange] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  // Bathroom presets
  const bathroomPresets = [
    { value: "powder-room", label: "Powder Room", type: "single" as VanityType, qty: 1, description: "Small half bath" },
    { value: "guest-bath", label: "Guest Bathroom", type: "single" as VanityType, qty: 1, description: "Standard guest bath" },
    { value: "master-bath-single", label: "Master Bath (Single Vanity)", type: "single" as VanityType, qty: 1, description: "Large single vanity" },
    { value: "master-bath-double", label: "Master Bath (Double Vanity)", type: "double" as VanityType, qty: 1, description: "His & hers sinks" },
    { value: "jack-and-jill", label: "Jack & Jill Bathroom", type: "double" as VanityType, qty: 1, description: "Shared bathroom" },
    { value: "multi-bath", label: "Multiple Bathrooms", type: "single" as VanityType, qty: 2, description: "2+ bathrooms" },
    { value: "custom", label: "Custom Configuration", type: "single" as VanityType, qty: 0, description: "Enter your details" }
  ];

  // Base pricing per tier (for single vanity)
  const tierPricing = {
    single: {
      good: {
        base: 2150, // Average of $1,800-$2,500
        competitorMin: 1950,
        competitorMax: 2800,
        label: "Good Tier",
        description: "Quality vanity with standard finishes"
      },
      better: {
        base: 3100, // Average of $2,700-$3,500
        competitorMin: 2850,
        competitorMax: 4000,
        label: "Better Tier",
        description: "Premium vanity with enhanced features"
      },
      best: {
        base: 4650, // Average of $3,800-$5,500
        competitorMin: 4000,
        competitorMax: 6500,
        label: "Best Tier",
        description: "Luxury vanity with custom options"
      }
    },
    double: {
      good: {
        base: 2800,
        competitorMin: 2600,
        competitorMax: 3600,
        label: "Good Tier",
        description: "Quality double vanity with standard finishes"
      },
      better: {
        base: 3900,
        competitorMin: 3500,
        competitorMax: 5000,
        label: "Better Tier",
        description: "Premium double vanity with enhanced features"
      },
      best: {
        base: 5150, // Average of double vanity best tier
        competitorMin: 4500,
        competitorMax: 7000,
        label: "Best Tier",
        description: "Luxury double vanity with custom options"
      }
    }
  };

  const conversionCost = 650; // Single to double conversion
  const plumbingCost = 450; // Plumbing wall change

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    const preset = bathroomPresets.find(bath => bath.value === value);
    if (preset && preset.qty > 0) {
      setVanityType(preset.type);
      setQuantity(preset.qty.toString());
      setShowResults(false);
      // Reset options when changing preset
      if (preset.type === "double") {
        setSingleToDouble(false);
      }
    } else if (value === "custom") {
      setQuantity("1");
      setShowResults(false);
    }
  };

  const calculateCosts = () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) return null;

    const selectedTier = tierPricing[vanityType][tier];
    let basePrice = selectedTier.base * qty;
    let totalAddons = 0;

    // Add conversion cost if converting single to double
    if (vanityType === "single" && singleToDouble) {
      totalAddons += conversionCost * qty;
    }

    // Add plumbing cost if changing plumbing wall
    if (plumbingWallChange) {
      totalAddons += plumbingCost * qty;
    }

    const totalCost = basePrice + totalAddons;

    // Competitor pricing (average)
    const competitorBase = ((selectedTier.competitorMin + selectedTier.competitorMax) / 2) * qty;
    const competitorConversion = (vanityType === "single" && singleToDouble) ? 800 * qty : 0;
    const competitorPlumbing = plumbingWallChange ? 600 * qty : 0;
    const competitorTotal = competitorBase + competitorConversion + competitorPlumbing;

    const savings = competitorTotal - totalCost;

    return {
      basePrice,
      conversionCost: (vanityType === "single" && singleToDouble) ? conversionCost * qty : 0,
      plumbingCost: plumbingWallChange ? plumbingCost * qty : 0,
      totalAddons,
      totalCost,
      competitorTotal,
      savings,
      perVanity: totalCost / qty
    };
  };

  const handleCalculate = () => {
    if (quantity && parseInt(quantity) > 0) {
      setShowResults(true);
    }
  };

  const results = showResults ? calculateCosts() : null;

  return (
    <Card className="bg-gradient-to-br from-accent/5 via-background to-primary/5 border-2 border-accent/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-accent/10">
            <Bath className="w-6 h-6 text-accent" />
          </div>
          <div>
            <CardTitle className="text-2xl">Vanity Installation Cost Calculator</CardTitle>
            <CardDescription>
              Estimate your bathroom vanity installation costs
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="bathroomPreset" className="text-base font-semibold mb-2 flex items-center gap-2">
                <Bath className="w-4 h-4" />
                Bathroom Configuration
              </Label>
              <Select value={selectedPreset} onValueChange={handlePresetChange}>
                <SelectTrigger id="bathroomPreset" className="text-lg h-12 bg-background z-50">
                  <SelectValue placeholder="Select a bathroom type or custom" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {bathroomPresets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value} className="cursor-pointer">
                      <div className="flex flex-col">
                        <span className="font-medium">{preset.label}</span>
                        <span className="text-xs text-muted-foreground">{preset.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                Quick presets for common bathroom configurations
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">Vanity Type</Label>
                <RadioGroup value={vanityType} onValueChange={(value: any) => {
                  setVanityType(value);
                  if (value === "double") setSingleToDouble(false);
                  setSelectedPreset("custom");
                }}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single" className="cursor-pointer">Single Sink</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="double" id="double" />
                    <Label htmlFor="double" className="cursor-pointer">Double Sink</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="quantity" className="text-base font-semibold mb-2 block">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="# of vanities"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setSelectedPreset("custom");
                  }}
                  min="1"
                  step="1"
                  className="text-lg h-12"
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Installation Tier</Label>
              <RadioGroup value={tier} onValueChange={(value: any) => setTier(value)}>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="good" id="good-vanity" />
                  <Label htmlFor="good-vanity" className="cursor-pointer flex-1">
                    <div className="font-semibold">Good Tier</div>
                    <div className="text-sm text-muted-foreground">
                      ${tierPricing[vanityType].good.base.toFixed(0)} • Quality standard vanity
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="better" id="better-vanity" />
                  <Label htmlFor="better-vanity" className="cursor-pointer flex-1">
                    <div className="font-semibold">Better Tier</div>
                    <div className="text-sm text-muted-foreground">
                      ${tierPricing[vanityType].better.base.toFixed(0)} • Premium features
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="best" id="best-vanity" />
                  <Label htmlFor="best-vanity" className="cursor-pointer flex-1">
                    <div className="font-semibold">Best Tier</div>
                    <div className="text-sm text-muted-foreground">
                      ${tierPricing[vanityType].best.base.toFixed(0)} • Luxury custom options
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Optional Services</Label>
              <div className="space-y-3">
                {vanityType === "single" && (
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox 
                      id="singleToDouble" 
                      checked={singleToDouble}
                      onCheckedChange={(checked) => setSingleToDouble(checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor="singleToDouble" className="cursor-pointer font-semibold">
                        Single to Double Conversion
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        +${conversionCost}/vanity • Convert single sink to double
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    id="plumbingWallChange" 
                    checked={plumbingWallChange}
                    onCheckedChange={(checked) => setPlumbingWallChange(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="plumbingWallChange" className="cursor-pointer font-semibold">
                      Plumbing Wall Change
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      +${plumbingCost}/vanity • Relocate plumbing connections
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleCalculate} 
              size="lg" 
              className="w-full"
              disabled={!quantity || parseInt(quantity) <= 0}
            >
              <Calculator className="w-5 h-5 mr-2" />
              Calculate Total Cost
            </Button>
          </div>

          {results && (
            <div className="space-y-4">
              <div className="p-6 rounded-lg bg-accent/10 border-2 border-accent/30">
                <h3 className="font-semibold text-lg mb-4 text-accent">Your Estimated Costs</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-accent/20">
                    <span className="text-muted-foreground">
                      Base Package ({tierPricing[vanityType][tier].label}):
                    </span>
                    <span className="font-semibold">${results.basePrice.toFixed(2)}</span>
                  </div>
                  {results.conversionCost > 0 && (
                    <div className="flex justify-between items-center pb-2 border-b border-accent/20">
                      <span className="text-muted-foreground">Single to Double Conversion:</span>
                      <span className="font-semibold">+${results.conversionCost.toFixed(2)}</span>
                    </div>
                  )}
                  {results.plumbingCost > 0 && (
                    <div className="flex justify-between items-center pb-2 border-b border-accent/20">
                      <span className="text-muted-foreground">Plumbing Wall Change:</span>
                      <span className="font-semibold">+${results.plumbingCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">Total Cost:</span>
                    <span className="text-2xl font-bold text-accent">${results.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground text-center pt-2 border-t border-accent/20">
                    ${results.perVanity.toFixed(2)} per vanity • Complete installation
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-primary/10 border border-border">
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
                  <strong>Note:</strong> Price includes vanity, countertop, sink(s), faucet, and professional installation. 
                  Final pricing may vary based on material selection, plumbing requirements, and bathroom layout.
                </p>
              </div>
            </div>
          )}

          {!results && (
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg">
              <div className="text-center text-muted-foreground">
                <Bath className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Enter Vanity Details</p>
                <p className="text-sm">Fill in the vanity configuration and select your preferred tier to see your cost estimate</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
