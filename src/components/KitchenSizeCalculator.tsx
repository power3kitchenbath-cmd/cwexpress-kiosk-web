import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, ChefHat, TrendingDown, LayoutGrid } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type KitchenTier = "good" | "better" | "best";

export function KitchenSizeCalculator() {
  const [kitchenSize, setKitchenSize] = useState<string>("1");
  const [tier, setTier] = useState<KitchenTier>("good");
  const [cabinetUpgrade, setCabinetUpgrade] = useState(false);
  const [countertopUpgrade, setCountertopUpgrade] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<string>("");

  // Kitchen layout presets
  const kitchenPresets = [
    { value: "standard-10x10", label: "Standard 10x10 Kitchen", multiplier: 1.0, description: "Base reference size" },
    { value: "small-galley", label: "Small Galley Kitchen", multiplier: 0.6, description: "8x8 compact layout" },
    { value: "medium-galley", label: "Medium Galley Kitchen", multiplier: 0.8, description: "9x10 efficient design" },
    { value: "small-l-shape", label: "Small L-Shaped Kitchen", multiplier: 1.0, description: "10x10 corner layout" },
    { value: "medium-l-shape", label: "Medium L-Shaped Kitchen", multiplier: 1.3, description: "11x12 open design" },
    { value: "large-l-shape", label: "Large L-Shaped Kitchen", multiplier: 1.6, description: "12x14 spacious" },
    { value: "small-u-shape", label: "Small U-Shaped Kitchen", multiplier: 1.2, description: "10x12 enclosed" },
    { value: "medium-u-shape", label: "Medium U-Shaped Kitchen", multiplier: 1.5, description: "12x14 functional" },
    { value: "large-u-shape", label: "Large U-Shaped Kitchen", multiplier: 1.8, description: "14x16 premium" },
    { value: "island-kitchen", label: "Kitchen with Island", multiplier: 1.4, description: "10x12 + island" },
    { value: "open-concept", label: "Open Concept Kitchen", multiplier: 2.0, description: "12x18 expansive" },
    { value: "custom", label: "Custom Size", multiplier: 0, description: "Enter your own multiplier" }
  ];

  const handleLayoutChange = (value: string) => {
    setSelectedLayout(value);
    const preset = kitchenPresets.find(kitchen => kitchen.value === value);
    if (preset && preset.multiplier > 0) {
      setKitchenSize(preset.multiplier.toString());
      setShowResults(false);
    } else if (value === "custom") {
      setKitchenSize("1");
      setShowResults(false);
    }
  };

  // Base pricing per tier (for 10x10 kitchen)
  const tierPricing = {
    good: {
      base: 9500, // Average of $8,500-$10,500
      competitorMin: 8800,
      competitorMax: 11000,
      label: "Good Tier",
      description: "Quality cabinets with standard finishes"
    },
    better: {
      base: 12750, // Average of $11,000-$14,500
      competitorMin: 11500,
      competitorMax: 15000,
      label: "Better Tier",
      description: "Premium cabinets with enhanced features"
    },
    best: {
      base: 18500, // Average of $15,000-$22,000
      competitorMin: 15500,
      competitorMax: 24000,
      label: "Best Tier",
      description: "Luxury cabinets with custom options"
    }
  };

  const upgrades = {
    cabinet: {
      cost: 1850, // Average of $1,200-$2,500
      label: "Cabinet Upgrade",
      description: "Premium wood species and custom finishes"
    },
    countertop: {
      cost: 2650, // Average of $1,800-$3,500
      label: "Countertop Upgrade",
      description: "Premium quartz or granite countertops"
    }
  };

  const calculateCosts = () => {
    const multiplier = parseFloat(kitchenSize);
    if (isNaN(multiplier) || multiplier <= 0) return null;

    const selectedTier = tierPricing[tier];
    let basePrice = selectedTier.base * multiplier;
    let totalUpgrades = 0;

    if (cabinetUpgrade) {
      totalUpgrades += upgrades.cabinet.cost * multiplier;
    }
    if (countertopUpgrade) {
      totalUpgrades += upgrades.countertop.cost * multiplier;
    }

    const totalCost = basePrice + totalUpgrades;

    // Competitor pricing (average)
    const competitorBase = ((selectedTier.competitorMin + selectedTier.competitorMax) / 2) * multiplier;
    const competitorUpgrades = (cabinetUpgrade ? 2000 : 0) + (countertopUpgrade ? 3000 : 0);
    const competitorTotal = (competitorBase + competitorUpgrades) * multiplier;

    const savings = competitorTotal - totalCost;

    return {
      basePrice,
      cabinetUpgradeCost: cabinetUpgrade ? upgrades.cabinet.cost * multiplier : 0,
      countertopUpgradeCost: countertopUpgrade ? upgrades.countertop.cost * multiplier : 0,
      totalUpgrades,
      totalCost,
      competitorTotal,
      savings
    };
  };

  const handleCalculate = () => {
    if (kitchenSize && parseFloat(kitchenSize) > 0) {
      setShowResults(true);
    }
  };

  const results = showResults ? calculateCosts() : null;

  return (
    <Card className="bg-gradient-to-br from-secondary/5 via-background to-primary/5 border-2 border-secondary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-secondary/10">
            <ChefHat className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Kitchen Cabinet Cost Calculator</CardTitle>
            <CardDescription>
              Estimate your kitchen installation costs based on size and tier
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="kitchenLayout" className="text-base font-semibold mb-2 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" />
                Kitchen Layout
              </Label>
              <Select value={selectedLayout} onValueChange={handleLayoutChange}>
                <SelectTrigger id="kitchenLayout" className="text-lg h-12 bg-background z-50">
                  <SelectValue placeholder="Select a kitchen layout or enter custom size" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {kitchenPresets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value} className="cursor-pointer">
                      <div className="flex flex-col">
                        <span className="font-medium">{preset.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {preset.multiplier > 0 ? `${preset.multiplier}x • ${preset.description}` : preset.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                Quick presets for common kitchen layouts
              </p>
            </div>

            <div>
              <Label htmlFor="kitchenSize" className="text-base font-semibold mb-2 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Kitchen Size Multiplier
              </Label>
              <Input
                id="kitchenSize"
                type="number"
                placeholder="Enter multiplier (e.g., 1.5)"
                value={kitchenSize}
                onChange={(e) => {
                  setKitchenSize(e.target.value);
                  setSelectedLayout("custom");
                }}
                min="0.5"
                step="0.1"
                className="text-lg h-12"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Or enter a custom size multiplier (1.0 = standard 10x10 kitchen)
              </p>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Installation Tier</Label>
              <RadioGroup value={tier} onValueChange={(value: any) => setTier(value)}>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="good" id="good" />
                  <Label htmlFor="good" className="cursor-pointer flex-1">
                    <div className="font-semibold">Good Tier</div>
                    <div className="text-sm text-muted-foreground">$8,500-$10,500 • Quality standard cabinets</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="better" id="better" />
                  <Label htmlFor="better" className="cursor-pointer flex-1">
                    <div className="font-semibold">Better Tier</div>
                    <div className="text-sm text-muted-foreground">$11,000-$14,500 • Premium features</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="best" id="best" />
                  <Label htmlFor="best" className="cursor-pointer flex-1">
                    <div className="font-semibold">Best Tier</div>
                    <div className="text-sm text-muted-foreground">$15,000-$22,000 • Luxury custom options</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Optional Upgrades</Label>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    id="cabinetUpgrade" 
                    checked={cabinetUpgrade}
                    onCheckedChange={(checked) => setCabinetUpgrade(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="cabinetUpgrade" className="cursor-pointer font-semibold">
                      Cabinet Upgrade
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      +${upgrades.cabinet.cost.toFixed(0)}/kitchen • {upgrades.cabinet.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    id="countertopUpgrade" 
                    checked={countertopUpgrade}
                    onCheckedChange={(checked) => setCountertopUpgrade(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="countertopUpgrade" className="cursor-pointer font-semibold">
                      Countertop Upgrade
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      +${upgrades.countertop.cost.toFixed(0)}/kitchen • {upgrades.countertop.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleCalculate} 
              size="lg" 
              className="w-full"
              disabled={!kitchenSize || parseFloat(kitchenSize) <= 0}
            >
              <Calculator className="w-5 h-5 mr-2" />
              Calculate Total Cost
            </Button>
          </div>

          {results && (
            <div className="space-y-4">
              <div className="p-6 rounded-lg bg-secondary/10 border-2 border-secondary/30">
                <h3 className="font-semibold text-lg mb-4 text-secondary">Your Estimated Costs</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-secondary/20">
                    <span className="text-muted-foreground">Base Package ({tierPricing[tier].label}):</span>
                    <span className="font-semibold">${results.basePrice.toFixed(2)}</span>
                  </div>
                  {results.cabinetUpgradeCost > 0 && (
                    <div className="flex justify-between items-center pb-2 border-b border-secondary/20">
                      <span className="text-muted-foreground">Cabinet Upgrade:</span>
                      <span className="font-semibold">+${results.cabinetUpgradeCost.toFixed(2)}</span>
                    </div>
                  )}
                  {results.countertopUpgradeCost > 0 && (
                    <div className="flex justify-between items-center pb-2 border-b border-secondary/20">
                      <span className="text-muted-foreground">Countertop Upgrade:</span>
                      <span className="font-semibold">+${results.countertopUpgradeCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">Total Cost:</span>
                    <span className="text-2xl font-bold text-secondary">${results.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground text-center pt-2 border-t border-secondary/20">
                    Complete installation package
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
                  <strong>Note:</strong> Price includes cabinets, countertops, hardware, and professional installation. 
                  Final pricing may vary based on kitchen layout, plumbing/electrical needs, and material selection.
                </p>
              </div>
            </div>
          )}

          {!results && (
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg">
              <div className="text-center text-muted-foreground">
                <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Enter Kitchen Details</p>
                <p className="text-sm">Fill in the kitchen size and select your preferred tier to see your cost estimate</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
