import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calculator, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/use-user-role";
import { z } from "zod";
import logo from "@/assets/logo.png";

const cabinetSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(1000, "Quantity cannot exceed 1000")
});

const flooringSchema = z.object({
  squareFeet: z.number().min(0.1, "Square feet must be at least 0.1").max(100000, "Square feet cannot exceed 100,000")
});

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

interface CabinetType {
  id: string;
  name: string;
  price_per_unit: number;
}

interface FlooringType {
  id: string;
  name: string;
  price_per_sqft: number;
}

export default function Estimator() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const { toast } = useToast();
  const { isAdmin } = useUserRole();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [cabinetTypes, setCabinetTypes] = useState<CabinetType[]>([]);
  const [flooringTypes, setFlooringTypes] = useState<FlooringType[]>([]);
  
  const [cabinetType, setCabinetType] = useState("");
  const [cabinetQuantity, setCabinetQuantity] = useState("");
  const [cabinets, setCabinets] = useState<CabinetItem[]>([]);
  
  const [flooringType, setFlooringType] = useState("");
  const [flooringSquareFeet, setFlooringSquareFeet] = useState("");
  const [flooring, setFlooring] = useState<FlooringItem[]>([]);

  useEffect(() => {
    checkAuth();
    fetchPrices();
    if (editId) {
      loadEstimate(editId);
    }
    // Handle imported cabinets from design import
    if (location.state?.importedCabinets) {
      loadImportedCabinets(location.state.importedCabinets);
    }
  }, [editId, location.state]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  };

  const fetchPrices = async () => {
    const { data: cabinetData } = await supabase
      .from("cabinet_types")
      .select("*")
      .order("name");
    
    const { data: flooringData } = await supabase
      .from("flooring_types")
      .select("*")
      .order("name");

    if (cabinetData) {
      setCabinetTypes(cabinetData);
      if (cabinetData.length > 0 && !cabinetType) {
        setCabinetType(cabinetData[0].name);
      }
    }
    
    if (flooringData) {
      setFlooringTypes(flooringData);
      if (flooringData.length > 0 && !flooringType) {
        setFlooringType(flooringData[0].name);
      }
    }
  };

  const loadEstimate = async (id: string) => {
    const { data, error } = await supabase
      .from("estimates")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Failed to load estimate",
        variant: "destructive",
      });
      return;
    }

    setCabinets((data.cabinet_items as unknown) as CabinetItem[]);
    setFlooring((data.flooring_items as unknown) as FlooringItem[]);
  };

  const loadImportedCabinets = (importedCabinets: any[]) => {
    const matchedCabinets: CabinetItem[] = [];
    let unmatchedCount = 0;

    importedCabinets.forEach((imported) => {
      // Try to match by name (case-insensitive, partial match)
      const matchedType = cabinetTypes.find((ct) =>
        ct.name.toLowerCase().includes(imported.name.toLowerCase()) ||
        imported.name.toLowerCase().includes(ct.name.toLowerCase())
      );

      if (matchedType) {
        matchedCabinets.push({
          type: matchedType.name,
          quantity: imported.quantity || 1,
          pricePerUnit: matchedType.price_per_unit,
        });
      } else {
        unmatchedCount++;
      }
    });

    if (matchedCabinets.length > 0) {
      setCabinets(matchedCabinets);
      toast({
        title: "Cabinets Imported",
        description: `Successfully imported ${matchedCabinets.length} cabinet(s).${
          unmatchedCount > 0 ? ` ${unmatchedCount} cabinet(s) could not be matched.` : ""
        }`,
      });
    } else {
      toast({
        title: "No Matches Found",
        description: "Could not match imported cabinets with available types. Please add them manually.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const addCabinet = () => {
    if (cabinetType && cabinetQuantity) {
      const quantity = parseInt(cabinetQuantity);
      
      try {
        cabinetSchema.parse({ quantity });
        
        const selectedType = cabinetTypes.find(c => c.name === cabinetType);
        if (selectedType) {
          setCabinets([...cabinets, {
            type: cabinetType,
            quantity,
            pricePerUnit: selectedType.price_per_unit,
          }]);
          setCabinetQuantity("");
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast({
            title: "Invalid Input",
            description: error.errors[0].message,
            variant: "destructive",
          });
        }
      }
    }
  };

  const addFlooring = () => {
    if (flooringType && flooringSquareFeet) {
      const sqFt = parseFloat(flooringSquareFeet);
      
      try {
        flooringSchema.parse({ squareFeet: sqFt });
        
        const selectedType = flooringTypes.find(f => f.name === flooringType);
        if (selectedType) {
          setFlooring([...flooring, {
            type: flooringType,
            squareFeet: sqFt,
            pricePerSqFt: selectedType.price_per_sqft,
          }]);
          setFlooringSquareFeet("");
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast({
            title: "Invalid Input",
            description: error.errors[0].message,
            variant: "destructive",
          });
        }
      }
    }
  };

  const cabinetTotal = cabinets.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);
  const flooringTotal = flooring.reduce((sum, item) => sum + (item.squareFeet * item.pricePerSqFt), 0);
  const totalCabinetQuantity = cabinets.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cabinetTotal + flooringTotal;
  
  let markupPercentage = 0;
  let markupLabel = "";
  if (totalCabinetQuantity < 10) {
    markupPercentage = 0.45;
    markupLabel = "Small Order Markup (45%)";
  } else if (totalCabinetQuantity >= 12 && totalCabinetQuantity <= 15) {
    markupPercentage = 0.35;
    markupLabel = "Order Markup (35%)";
  } else if (totalCabinetQuantity >= 18) {
    markupPercentage = 0.30;
    markupLabel = "Order Markup (30%)";
  }
  
  const markupAmount = subtotal * markupPercentage;
  const grandTotal = subtotal + markupAmount;

  const formatName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const saveEstimate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editId) {
      // Update existing estimate
      const { error } = await supabase
        .from("estimates")
        .update({
          cabinet_items: cabinets as any,
          flooring_items: flooring as any,
          cabinet_total: cabinetTotal,
          flooring_total: flooringTotal,
          grand_total: grandTotal,
        })
        .eq("id", editId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update estimate",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Estimate updated successfully",
        });
        navigate("/estimates");
      }
    } else {
      // Create new estimate
      const { error } = await supabase.from("estimates").insert({
        user_id: user.id,
        cabinet_items: cabinets as any,
        flooring_items: flooring as any,
        cabinet_total: cabinetTotal,
        flooring_total: flooringTotal,
        grand_total: grandTotal,
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to save estimate",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Estimate saved successfully",
        });
      }
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary to-primary-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="mr-2" />
              Back to Home
            </Button>
            {isAdmin && (
              <Button
                variant="ghost"
                onClick={() => navigate("/admin")}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Shield className="mr-2" />
                Admin
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              Logout
            </Button>
          </div>
          <img src={logo} alt="The Cabinet Store" className="h-16 object-contain" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary-foreground mb-2 flex items-center justify-center gap-3">
              <Calculator className="w-10 h-10" />
              {editId ? "Edit Estimate" : "Price Estimator"}
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
                      {cabinetTypes.map((cabinet) => (
                        <SelectItem key={cabinet.id} value={cabinet.name}>
                          {formatName(cabinet.name)} - ${cabinet.price_per_unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="Enter quantity (1-1000)"
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
                        <span>{formatName(item.type)} x{item.quantity}</span>
                        <span className="font-semibold">${(item.quantity * item.pricePerUnit).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Factory Price:</span>
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
                      {flooringTypes.map((flooring) => (
                        <SelectItem key={flooring.id} value={flooring.name}>
                          {formatName(flooring.name)} - ${flooring.price_per_sqft}/sq ft
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Square Feet</Label>
                  <Input
                    type="number"
                    min="0.1"
                    max="100000"
                    step="0.1"
                    placeholder="Enter square feet (0.1-100,000)"
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
                        <span>{formatName(item.type)} - {item.squareFeet} sq ft</span>
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
                  <div className="flex justify-between pt-2 border-t">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  {markupPercentage > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <span>{markupLabel}:</span>
                      <span className="font-semibold">${markupAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-bold pt-4 border-t-2">
                    <span>Grand Total:</span>
                    <span className="text-accent">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                <Button 
                  onClick={saveEstimate} 
                  className="mt-6 w-full"
                  variant="kiosk"
                  disabled={cabinets.length === 0 && flooring.length === 0}
                >
                  {editId ? "Update Estimate" : "Save Estimate"}
                </Button>
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
