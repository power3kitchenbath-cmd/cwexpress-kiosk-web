import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, Plus, Trash2, Home, ChefHat, Bath, TrendingDown, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RoomEstimate {
  id: string;
  type: "room";
  name: string;
  squareFeet: number;
  grade: "standard" | "premium";
  cost: number;
}

interface KitchenEstimate {
  id: string;
  type: "kitchen";
  name: string;
  multiplier: number;
  tier: "good" | "better" | "best";
  cabinetUpgrade: boolean;
  countertopUpgrade: boolean;
  cost: number;
}

interface VanityEstimate {
  id: string;
  type: "vanity";
  name: string;
  quantity: number;
  vanityType: "single" | "double";
  tier: "good" | "better" | "best";
  singleToDouble: boolean;
  plumbingWallChange: boolean;
  cost: number;
}

type ProjectEstimate = RoomEstimate | KitchenEstimate | VanityEstimate;

export function MultiProjectEstimator() {
  const [projects, setProjects] = useState<ProjectEstimate[]>([]);
  const [activeTab, setActiveTab] = useState<string>("room");

  // Room form state
  const [roomName, setRoomName] = useState("");
  const [roomSqft, setRoomSqft] = useState("");
  const [roomGrade, setRoomGrade] = useState<"standard" | "premium">("standard");

  // Kitchen form state
  const [kitchenName, setKitchenName] = useState("");
  const [kitchenMultiplier, setKitchenMultiplier] = useState("");
  const [kitchenTier, setKitchenTier] = useState<"good" | "better" | "best">("good");
  const [kitchenCabinetUpgrade, setKitchenCabinetUpgrade] = useState(false);
  const [kitchenCountertopUpgrade, setKitchenCountertopUpgrade] = useState(false);

  // Vanity form state
  const [vanityName, setVanityName] = useState("");
  const [vanityQuantity, setVanityQuantity] = useState("");
  const [vanityType, setVanityType] = useState<"single" | "double">("single");
  const [vanityTier, setVanityTier] = useState<"good" | "better" | "best">("good");
  const [vanitySingleToDouble, setVanitySingleToDouble] = useState(false);
  const [vanityPlumbingWall, setVanityPlumbingWall] = useState(false);

  // Pricing data
  const roomPricing = {
    standard: { material: 3.49, labor: 2.75 },
    premium: { material: 5.74, labor: 2.75 }
  };

  const kitchenPricing = {
    good: 9500,
    better: 12750,
    best: 18500
  };

  const vanityPricing = {
    single: { good: 2150, better: 3100, best: 4650 },
    double: { good: 2800, better: 3900, best: 5150 }
  };

  const calculateRoomCost = (sqft: number, grade: "standard" | "premium"): number => {
    const pricing = roomPricing[grade];
    return sqft * (pricing.material + pricing.labor);
  };

  const calculateKitchenCost = (
    multiplier: number,
    tier: "good" | "better" | "best",
    cabinetUpgrade: boolean,
    countertopUpgrade: boolean
  ): number => {
    let cost = kitchenPricing[tier] * multiplier;
    if (cabinetUpgrade) cost += 1850 * multiplier;
    if (countertopUpgrade) cost += 2650 * multiplier;
    return cost;
  };

  const calculateVanityCost = (
    quantity: number,
    type: "single" | "double",
    tier: "good" | "better" | "best",
    singleToDouble: boolean,
    plumbingWallChange: boolean
  ): number => {
    let cost = vanityPricing[type][tier] * quantity;
    if (type === "single" && singleToDouble) cost += 650 * quantity;
    if (plumbingWallChange) cost += 450 * quantity;
    return cost;
  };

  const addRoom = () => {
    const sqft = parseFloat(roomSqft);
    if (!roomName || isNaN(sqft) || sqft <= 0) return;

    const cost = calculateRoomCost(sqft, roomGrade);
    const newRoom: RoomEstimate = {
      id: `room-${Date.now()}`,
      type: "room",
      name: roomName,
      squareFeet: sqft,
      grade: roomGrade,
      cost
    };

    setProjects([...projects, newRoom]);
    setRoomName("");
    setRoomSqft("");
  };

  const addKitchen = () => {
    const multiplier = parseFloat(kitchenMultiplier);
    if (!kitchenName || isNaN(multiplier) || multiplier <= 0) return;

    const cost = calculateKitchenCost(
      multiplier,
      kitchenTier,
      kitchenCabinetUpgrade,
      kitchenCountertopUpgrade
    );

    const newKitchen: KitchenEstimate = {
      id: `kitchen-${Date.now()}`,
      type: "kitchen",
      name: kitchenName,
      multiplier,
      tier: kitchenTier,
      cabinetUpgrade: kitchenCabinetUpgrade,
      countertopUpgrade: kitchenCountertopUpgrade,
      cost
    };

    setProjects([...projects, newKitchen]);
    setKitchenName("");
    setKitchenMultiplier("");
    setKitchenCabinetUpgrade(false);
    setKitchenCountertopUpgrade(false);
  };

  const addVanity = () => {
    const quantity = parseInt(vanityQuantity);
    if (!vanityName || isNaN(quantity) || quantity <= 0) return;

    const cost = calculateVanityCost(
      quantity,
      vanityType,
      vanityTier,
      vanitySingleToDouble,
      vanityPlumbingWall
    );

    const newVanity: VanityEstimate = {
      id: `vanity-${Date.now()}`,
      type: "vanity",
      name: vanityName,
      quantity,
      vanityType,
      tier: vanityTier,
      singleToDouble: vanitySingleToDouble,
      plumbingWallChange: vanityPlumbingWall,
      cost
    };

    setProjects([...projects, newVanity]);
    setVanityName("");
    setVanityQuantity("");
    setVanitySingleToDouble(false);
    setVanityPlumbingWall(false);
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const getTotalCost = () => {
    return projects.reduce((sum, project) => sum + project.cost, 0);
  };

  const getEstimatedSavings = () => {
    // Conservative estimate: 15% savings vs competitors on average
    return getTotalCost() * 0.15;
  };

  const getProjectsByType = (type: string) => {
    return projects.filter(p => p.type === type);
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/20">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Multi-Project Estimate Builder</CardTitle>
            <CardDescription>
              Combine multiple rooms, kitchens, and bathrooms for a complete project estimate
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="room" className="gap-2">
              <Home className="w-4 h-4" />
              Add Room
            </TabsTrigger>
            <TabsTrigger value="kitchen" className="gap-2">
              <ChefHat className="w-4 h-4" />
              Add Kitchen
            </TabsTrigger>
            <TabsTrigger value="vanity" className="gap-2">
              <Bath className="w-4 h-4" />
              Add Vanity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="room" className="space-y-4 mt-4">
            <div className="p-4 border rounded-lg bg-background">
              <h3 className="font-semibold mb-4">LVP Flooring</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="roomName">Room Name</Label>
                  <Input
                    id="roomName"
                    placeholder="e.g., Master Bedroom"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="roomSqft">Square Feet</Label>
                    <Input
                      id="roomSqft"
                      type="number"
                      placeholder="200"
                      value={roomSqft}
                      onChange={(e) => setRoomSqft(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="roomGrade">Grade</Label>
                    <Select value={roomGrade} onValueChange={(value: any) => setRoomGrade(value)}>
                      <SelectTrigger id="roomGrade" className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="standard">Standard ($3.49/sqft)</SelectItem>
                        <SelectItem value="premium">Premium ($5.74/sqft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addRoom} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Add Room to Estimate
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="kitchen" className="space-y-4 mt-4">
            <div className="p-4 border rounded-lg bg-background">
              <h3 className="font-semibold mb-4">Kitchen Installation</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="kitchenName">Kitchen Name</Label>
                  <Input
                    id="kitchenName"
                    placeholder="e.g., Main Kitchen"
                    value={kitchenName}
                    onChange={(e) => setKitchenName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="kitchenMultiplier">Size Multiplier</Label>
                    <Input
                      id="kitchenMultiplier"
                      type="number"
                      placeholder="1.0"
                      value={kitchenMultiplier}
                      onChange={(e) => setKitchenMultiplier(e.target.value)}
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kitchenTier">Tier</Label>
                    <Select value={kitchenTier} onValueChange={(value: any) => setKitchenTier(value)}>
                      <SelectTrigger id="kitchenTier" className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="good">Good ($9,500)</SelectItem>
                        <SelectItem value="better">Better ($12,750)</SelectItem>
                        <SelectItem value="best">Best ($18,500)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={kitchenCabinetUpgrade}
                      onChange={(e) => setKitchenCabinetUpgrade(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Cabinet Upgrade (+$1,850)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={kitchenCountertopUpgrade}
                      onChange={(e) => setKitchenCountertopUpgrade(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Countertop Upgrade (+$2,650)</span>
                  </label>
                </div>
                <Button onClick={addKitchen} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Add Kitchen to Estimate
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vanity" className="space-y-4 mt-4">
            <div className="p-4 border rounded-lg bg-background">
              <h3 className="font-semibold mb-4">Vanity Installation</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="vanityName">Bathroom Name</Label>
                  <Input
                    id="vanityName"
                    placeholder="e.g., Master Bath"
                    value={vanityName}
                    onChange={(e) => setVanityName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="vanityQuantity">Quantity</Label>
                    <Input
                      id="vanityQuantity"
                      type="number"
                      placeholder="1"
                      value={vanityQuantity}
                      onChange={(e) => setVanityQuantity(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vanityTypeSelect">Type</Label>
                    <Select value={vanityType} onValueChange={(value: any) => setVanityType(value)}>
                      <SelectTrigger id="vanityTypeSelect" className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="single">Single Sink</SelectItem>
                        <SelectItem value="double">Double Sink</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="vanityTierSelect">Tier</Label>
                    <Select value={vanityTier} onValueChange={(value: any) => setVanityTier(value)}>
                      <SelectTrigger id="vanityTierSelect" className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="better">Better</SelectItem>
                        <SelectItem value="best">Best</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-4">
                  {vanityType === "single" && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vanitySingleToDouble}
                        onChange={(e) => setVanitySingleToDouble(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Convert to Double (+$650)</span>
                    </label>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vanityPlumbingWall}
                      onChange={(e) => setVanityPlumbingWall(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Plumbing Change (+$450)</span>
                  </label>
                </div>
                <Button onClick={addVanity} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Add Vanity to Estimate
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {projects.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Project Summary</h3>
              
              <div className="space-y-2">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                    <div className="flex items-center gap-3">
                      {project.type === "room" && <Home className="w-5 h-5 text-primary" />}
                      {project.type === "kitchen" && <ChefHat className="w-5 h-5 text-secondary" />}
                      {project.type === "vanity" && <Bath className="w-5 h-5 text-accent" />}
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.type === "room" && `${(project as RoomEstimate).squareFeet} sqft • ${(project as RoomEstimate).grade}`}
                          {project.type === "kitchen" && `${(project as KitchenEstimate).multiplier}x • ${(project as KitchenEstimate).tier} tier`}
                          {project.type === "vanity" && `${(project as VanityEstimate).quantity}x ${(project as VanityEstimate).vanityType} • ${(project as VanityEstimate).tier} tier`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">${project.cost.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProject(project.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="p-6 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/40">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{getProjectsByType("room").length}</div>
                      <div className="text-sm text-muted-foreground">Rooms</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-secondary">{getProjectsByType("kitchen").length}</div>
                      <div className="text-sm text-muted-foreground">Kitchens</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-accent">{getProjectsByType("vanity").length}</div>
                      <div className="text-sm text-muted-foreground">Bathrooms</div>
                    </div>
                  </div>

                  <Separator className="bg-primary/20" />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-semibold">${getTotalCost().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Estimated Savings:</span>
                      <Badge variant="secondary" className="gap-1">
                        <TrendingDown className="w-4 h-4" />
                        ${getEstimatedSavings().toFixed(2)}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="bg-primary/20" />

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xl font-bold">Total Project Cost:</span>
                    <span className="text-3xl font-bold text-primary">${getTotalCost().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> This is a comprehensive estimate for your entire project. 
                  Final pricing will be confirmed after a site visit and consultation with our team. 
                  All prices include materials, labor, and professional installation.
                </p>
              </div>
            </div>
          </>
        )}

        {projects.length === 0 && (
          <div className="text-center p-12 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">No Projects Added Yet</p>
            <p className="text-sm text-muted-foreground">
              Add rooms, kitchens, or bathrooms using the tabs above to build your complete project estimate
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
