import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

interface CabinetItem {
  type: string;
  quantity: number;
  pricePerUnit: number;
}

interface FlooringItem {
  type: string;
  squareFeet: number;
  pricePerSqFt: number;
}

const CABINET_PRICES: Record<string, number> = {
  "base-cabinet": 450,
  "wall-cabinet": 350,
  "tall-cabinet": 650,
  "corner-cabinet": 550,
  "island-cabinet": 850,
};

const FLOORING_PRICES: Record<string, number> = {
  "hardwood": 8.50,
  "laminate": 4.25,
  "tile": 6.75,
  "vinyl": 3.50,
  "carpet": 3.00,
};

export default function Estimator() {
  const navigate = useNavigate();
  const [cabinetType, setCabinetType] = useState("");
  const [cabinetQuantity, setCabinetQuantity] = useState("");
  const [cabinets, setCabinets] = useState<CabinetItem[]>([]);
  
  const [flooringType, setFlooringType] = useState("");
  const [flooringSquareFeet, setFlooringSquareFeet] = useState("");
  const [flooring, setFlooring] = useState<FlooringItem[]>([]);

  const addCabinet = () => {
    if (cabinetType && cabinetQuantity) {
      const quantity = parseInt(cabinetQuantity);
      if (quantity > 0) {
        setCabinets([...cabinets, {
          type: cabinetType,
          quantity,
          pricePerUnit: CABINET_PRICES[cabinetType],
        }]);
        setCabinetType("");
        setCabinetQuantity("");
      }
    }
  };

  const addFlooring = () => {
    if (flooringType && flooringSquareFeet) {
      const sqFt = parseFloat(flooringSquareFeet);
      if (sqFt > 0) {
        setFlooring([...flooring, {
          type: flooringType,
          squareFeet: sqFt,
          pricePerSqFt: FLOORING_PRICES[flooringType],
        }]);
        setFlooringType("");
        setFlooringSquareFeet("");
      }
    }
  };

  const cabinetTotal = cabinets.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);
  const flooringTotal = flooring.reduce((sum, item) => sum + (item.squareFeet * item.pricePerSqFt), 0);
  const grandTotal = cabinetTotal + flooringTotal;

  const formatCabinetName = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatFlooringName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary to-primary-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="mr-2" />
            Back to Home
          </Button>
          <img src={logo} alt="The Cabinet Store" className="h-16 object-contain" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary-foreground mb-2 flex items-center justify-center gap-3">
              <Calculator className="w-10 h-10" />
              Price Estimator
            </h1>
            <p className="text-primary-foreground/80">Calculate your cabinet and flooring costs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Cabinet Calculator */}
            <Card>
              <CardHeader>
                <CardTitle>Cabinets</CardTitle>
                <CardDescription>Add cabinets to your estimate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Cabinet Type</Label>
                  <Select value={cabinetType} onValueChange={setCabinetType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cabinet type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="base-cabinet">Base Cabinet - $450</SelectItem>
                      <SelectItem value="wall-cabinet">Wall Cabinet - $350</SelectItem>
                      <SelectItem value="tall-cabinet">Tall Cabinet - $650</SelectItem>
                      <SelectItem value="corner-cabinet">Corner Cabinet - $550</SelectItem>
                      <SelectItem value="island-cabinet">Island Cabinet - $850</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Enter quantity"
                    value={cabinetQuantity}
                    onChange={(e) => setCabinetQuantity(e.target.value)}
                  />
                </div>

                <Button onClick={addCabinet} className="w-full" variant="kiosk">
                  Add Cabinet
                </Button>

                {cabinets.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <h4 className="font-semibold">Added Cabinets:</h4>
                    {cabinets.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{formatCabinetName(item.type)} x{item.quantity}</span>
                        <span className="font-semibold">${(item.quantity * item.pricePerUnit).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Cabinet Subtotal:</span>
                      <span>${cabinetTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Flooring Calculator */}
            <Card>
              <CardHeader>
                <CardTitle>Flooring</CardTitle>
                <CardDescription>Add flooring to your estimate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Flooring Type</Label>
                  <Select value={flooringType} onValueChange={setFlooringType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select flooring type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hardwood">Hardwood - $8.50/sq ft</SelectItem>
                      <SelectItem value="laminate">Laminate - $4.25/sq ft</SelectItem>
                      <SelectItem value="tile">Tile - $6.75/sq ft</SelectItem>
                      <SelectItem value="vinyl">Vinyl - $3.50/sq ft</SelectItem>
                      <SelectItem value="carpet">Carpet - $3.00/sq ft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Square Feet</Label>
                  <Input
                    type="number"
                    min="1"
                    step="0.1"
                    placeholder="Enter square feet"
                    value={flooringSquareFeet}
                    onChange={(e) => setFlooringSquareFeet(e.target.value)}
                  />
                </div>

                <Button onClick={addFlooring} className="w-full" variant="kiosk">
                  Add Flooring
                </Button>

                {flooring.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <h4 className="font-semibold">Added Flooring:</h4>
                    {flooring.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{formatFlooringName(item.type)} - {item.squareFeet} sq ft</span>
                        <span className="font-semibold">${(item.squareFeet * item.pricePerSqFt).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Flooring Subtotal:</span>
                      <span>${flooringTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Total Summary */}
          {(cabinets.length > 0 || flooring.length > 0) && (
            <Card className="border-accent border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Total Estimate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-lg">
                  <div className="flex justify-between">
                    <span>Cabinets:</span>
                    <span className="font-semibold">${cabinetTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flooring:</span>
                    <span className="font-semibold">${flooringTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-bold pt-4 border-t-2">
                    <span>Grand Total:</span>
                    <span className="text-accent">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  * This is an estimate. Final pricing may vary based on specific requirements and installation.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
