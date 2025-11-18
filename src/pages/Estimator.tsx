import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageSelect, ImageSelectTrigger, ImageSelectContent, ImageSelectItem } from "@/components/ui/image-select";
import { ArrowLeft, Calculator, Shield, Trash2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/use-user-role";
import { z } from "zod";
import logo from "@/assets/logo.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CalacattaHero } from "@/components/CalacattaHero";
import { CalacattaComparisonModal } from "@/components/CalacattaComparisonModal";
import cocoaImg from "@/assets/flooring/lvp/cocoa.png";
import butternutImg from "@/assets/flooring/lvp/butternut.png";
import fogImg from "@/assets/flooring/lvp/fog.png";
import blondieImg from "@/assets/flooring/lvp/blondie.png";
import balHarborImg from "@/assets/cabinet-doors/doormark-bal-harbor.png";
import biscayneImg from "@/assets/cabinet-doors/doormark-biscayne.png";
import caprisImg from "@/assets/cabinet-doors/doormark-capris.png";
import euroShakerImg from "@/assets/cabinet-doors/doormark-euro-shaker.png";
import hollyHillImg from "@/assets/cabinet-doors/doormark-holly-hill.png";
import shakerAbacoaImg from "@/assets/cabinet-doors/doormark-shaker-abacoa.png";
import { DoorStylePreview } from "@/components/DoorStylePreview";

const cabinetSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(1000, "Quantity cannot exceed 1000")
});

const flooringSchema = z.object({
  squareFeet: z.number().min(0.1, "Square feet must be at least 0.1").max(100000, "Square feet cannot exceed 100,000")
});

const countertopSchema = z.object({
  linearFeet: z.number().min(0.1, "Linear feet must be at least 0.1").max(10000, "Linear feet cannot exceed 10,000")
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
  image_url?: string;
  thumbnail_url?: string;
}

const flooringImageMap: Record<string, string> = {
  "LVP - Cocoa": blondieImg,
  "LVP - Butternut": fogImg,
  "LVP - Fog": butternutImg,
  "LVP - Blondie": cocoaImg,
};

const doorStyleImageMap: Record<string, string> = {
  "Doormark Bal Harbor": balHarborImg,
  "Doormark Biscayne": biscayneImg,
  "Doormark Capris": caprisImg,
  "Doormark Euro Shaker": euroShakerImg,
  "Doormark Holly Hill": hollyHillImg,
  "Doormark Shaker Abacoa": shakerAbacoaImg,
};

const doorStyleSpecs: Record<string, any> = {
  "Doormark Bal Harbor": {
    style: "Modern Coastal",
    material: "MDF with veneer",
    finish: ["White", "Gray", "Navy", "Natural"],
    features: [
      "Clean horizontal lines",
      "Recessed center panel",
      "Contemporary coastal design",
      "Durable moisture-resistant finish"
    ],
    description: "Modern coastal style with clean lines perfect for beach-inspired kitchens"
  },
  "Doormark Biscayne": {
    style: "Sleek Contemporary",
    material: "Thermofoil MDF",
    finish: ["High Gloss White", "Matte Gray", "Black", "Cappuccino"],
    features: [
      "Full overlay frameless design",
      "Ultra-smooth surface",
      "Easy to clean and maintain",
      "Seamless modern appearance"
    ],
    description: "Sleek contemporary design with a smooth, seamless finish for modern spaces"
  },
  "Doormark Capris": {
    style: "Classic Shaker",
    material: "Solid wood frame",
    finish: ["White", "Dove Gray", "Espresso", "Natural Oak"],
    features: [
      "5-piece construction",
      "Recessed square panel",
      "Timeless versatile design",
      "Complements any decor style"
    ],
    description: "Classic shaker style that works beautifully in traditional and transitional kitchens"
  },
  "Doormark Euro Shaker": {
    style: "Minimalist European",
    material: "Premium plywood",
    finish: ["Pure White", "Light Gray", "Taupe", "Walnut"],
    features: [
      "Slim profile frame",
      "Flat center panel",
      "European hinges ready",
      "Minimalist aesthetic"
    ],
    description: "Minimalist European design with slim profiles and clean lines"
  },
  "Doormark Holly Hill": {
    style: "Premium Traditional",
    material: "Solid hardwood",
    finish: ["Antique White", "Cherry", "Maple", "Mahogany"],
    features: [
      "Raised panel design",
      "Decorative molding details",
      "Premium solid wood construction",
      "Heirloom quality craftsmanship"
    ],
    description: "Premium traditional style with raised panels and elegant detailing"
  },
  "Doormark Shaker Abacoa": {
    style: "Versatile Transitional",
    material: "Hybrid wood composite",
    finish: ["Soft White", "Greige", "Navy Blue", "Sage Green"],
    features: [
      "Balanced proportions",
      "Subtle grain texture",
      "Works with multiple styles",
      "Durable everyday finish"
    ],
    description: "Versatile transitional design that bridges traditional and contemporary styles"
  }
};

interface CountertopItem {
  type: string;
  linearFeet: number;
  pricePerLinearFt: number;
}

interface CountertopType {
  id: string;
  name: string;
  price_per_linear_ft: number;
}

interface HardwareItem {
  type: string;
  quantity: number;
  pricePerUnit: number;
  imageUrl?: string;
}

interface HardwareType {
  id: string;
  name: string;
  price_per_unit: number;
  image_url?: string;
  category: string;
}

export default function Estimator() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const preSelectedFlooring = searchParams.get("flooring");
  const { toast } = useToast();
  const { isAdmin } = useUserRole();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const flooringSectionRef = useRef<HTMLDivElement>(null);
  
  const [cabinetTypes, setCabinetTypes] = useState<CabinetType[]>([]);
  const [flooringTypes, setFlooringTypes] = useState<FlooringType[]>([]);
  const [hardwareTypes, setHardwareTypes] = useState<HardwareType[]>([]);
  
  // Installation state
  const [includeInstallation, setIncludeInstallation] = useState(false);
  
  const [cabinetType, setCabinetType] = useState("");
  const [cabinetQuantity, setCabinetQuantity] = useState("");
  const [cabinets, setCabinets] = useState<CabinetItem[]>([]);
  
  // Replacement doors state
  const [replacementDoorType, setReplacementDoorType] = useState("");
  const [replacementDoorQuantity, setReplacementDoorQuantity] = useState("");
  const [replacementDoors, setReplacementDoors] = useState<CabinetItem[]>([]);
  
  const [flooringType, setFlooringType] = useState("");
  const [flooringSquareFeet, setFlooringSquareFeet] = useState("");
  const [flooring, setFlooring] = useState<FlooringItem[]>([]);
  
  const [countertopTypes, setCountertopTypes] = useState<CountertopType[]>([]);
  const [countertopType, setCountertopType] = useState("");
  const [countertopLinearFeet, setCountertopLinearFeet] = useState("");
  const [countertops, setCountertops] = useState<CountertopItem[]>([]);
  const [calacattaFilter, setCalacattaFilter] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [comparisonImages, setComparisonImages] = useState<{ src: string; name: string }[]>([]);
  
  const [hardwareType, setHardwareType] = useState("");
  const [hardwareQuantity, setHardwareQuantity] = useState("");
  const [hardware, setHardware] = useState<HardwareItem[]>([]);
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'cabinet' | 'flooring' | 'countertop' | 'hardware' | 'door' | null;
    index: number;
    itemName: string;
  }>({ open: false, type: null, index: -1, itemName: '' });

  const [clearAllDialog, setClearAllDialog] = useState<{
    open: boolean;
    type: 'cabinet' | 'flooring' | 'countertop' | 'hardware' | 'door' | null;
  }>({ open: false, type: null });

  const [undoState, setUndoState] = useState<{
    action: 'remove' | 'clear' | null;
    type: 'cabinet' | 'flooring' | 'countertop' | 'hardware' | 'door' | null;
    data: CabinetItem[] | FlooringItem[] | CountertopItem[] | HardwareItem[] | null;
  }>({ action: null, type: null, data: null });

  const [editingItem, setEditingItem] = useState<{
    type: 'cabinet' | 'flooring' | 'countertop' | 'hardware' | 'door' | null;
    index: number;
    value: string;
  }>({ type: null, index: -1, value: '' });

  const [emailDialog, setEmailDialog] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

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

  // Handle pre-selected flooring from URL parameter
  useEffect(() => {
    if (preSelectedFlooring && flooringTypes.length > 0) {
      const matchingFlooring = flooringTypes.find(
        f => f.name === preSelectedFlooring
      );
      if (matchingFlooring) {
        setFlooringType(matchingFlooring.name);
        // Auto-scroll to flooring section
        setTimeout(() => {
          flooringSectionRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 500);
      }
    }
  }, [preSelectedFlooring, flooringTypes]);

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
    
    const { data: countertopData } = await supabase
      .from("countertop_types" as any)
      .select("*")
      .order("name");
    
    const { data: hardwareData } = await supabase
      .from("hardware_types" as any)
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

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
    
    if (countertopData) {
      setCountertopTypes(countertopData as unknown as CountertopType[]);
      if (countertopData.length > 0 && !countertopType) {
        setCountertopType((countertopData[0] as any).name);
      }
    }
    
    if (hardwareData) {
      setHardwareTypes(hardwareData as unknown as HardwareType[]);
      if (hardwareData.length > 0 && !hardwareType) {
        setHardwareType((hardwareData[0] as any).name);
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
    setCountertops(((data as any).countertop_items as unknown) as CountertopItem[]);
    setHardware(((data as any).hardware_items as unknown) as HardwareItem[] || []);
    setIncludeInstallation((data as any).installation_requested || false);
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

  const addCountertop = () => {
    if (countertopType && countertopLinearFeet) {
      const linearFt = parseFloat(countertopLinearFeet);
      
      try {
        countertopSchema.parse({ linearFeet: linearFt });
        
        const selectedType = countertopTypes.find(c => c.name === countertopType);
        if (selectedType) {
          setCountertops([...countertops, {
            type: countertopType,
            linearFeet: linearFt,
            pricePerLinearFt: selectedType.price_per_linear_ft,
          }]);
          setCountertopLinearFeet("");
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

  const addHardware = () => {
    if (hardwareType && hardwareQuantity) {
      const quantity = parseInt(hardwareQuantity);
      
      try {
        cabinetSchema.parse({ quantity });
        
        const selectedType = hardwareTypes.find(h => h.name === hardwareType);
        if (selectedType) {
          setHardware([...hardware, {
            type: hardwareType,
            quantity,
            pricePerUnit: selectedType.price_per_unit,
            imageUrl: selectedType.image_url,
          }]);
          setHardwareQuantity("");
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

  const addReplacementDoor = () => {
    if (replacementDoorType && replacementDoorQuantity) {
      const quantity = parseInt(replacementDoorQuantity);
      
      try {
        cabinetSchema.parse({ quantity });
        
        const selectedType = cabinetTypes.find(c => c.name === replacementDoorType);
        if (selectedType) {
          setReplacementDoors([...replacementDoors, {
            type: replacementDoorType,
            quantity,
            pricePerUnit: selectedType.price_per_unit,
          }]);
          setReplacementDoorQuantity("");
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

  const confirmRemoveReplacementDoor = (index: number) => {
    const item = replacementDoors[index];
    setDeleteDialog({
      open: true,
      type: 'door',
      index,
      itemName: `${formatName(item.type)} x${item.quantity}`
    });
  };

  const confirmRemoveCabinet = (index: number) => {
    const item = cabinets[index];
    setDeleteDialog({
      open: true,
      type: 'cabinet',
      index,
      itemName: `${formatName(item.type)} x${item.quantity}`
    });
  };

  const confirmRemoveFlooring = (index: number) => {
    const item = flooring[index];
    setDeleteDialog({
      open: true,
      type: 'flooring',
      index,
      itemName: `${formatName(item.type)} - ${item.squareFeet} sq ft`
    });
  };

  const confirmRemoveCountertop = (index: number) => {
    const item = countertops[index];
    setDeleteDialog({
      open: true,
      type: 'countertop',
      index,
      itemName: `${formatName(item.type)} - ${item.linearFeet} linear ft`
    });
  };

  const confirmRemoveHardware = (index: number) => {
    const item = hardware[index];
    setDeleteDialog({
      open: true,
      type: 'hardware',
      index,
      itemName: `${formatName(item.type)} x${item.quantity}`
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.type === 'cabinet') {
      const removedItem = cabinets[deleteDialog.index];
      setUndoState({ action: 'remove', type: 'cabinet', data: [removedItem] });
      setCabinets(cabinets.filter((_, i) => i !== deleteDialog.index));
      toast({
        title: "Item Removed",
        description: "Cabinet removed from estimate",
        action: <Button variant="outline" size="sm" onClick={handleUndo}>Undo</Button>
      });
    } else if (deleteDialog.type === 'door') {
      const removedItem = replacementDoors[deleteDialog.index];
      setUndoState({ action: 'remove', type: 'door', data: [removedItem] });
      setReplacementDoors(replacementDoors.filter((_, i) => i !== deleteDialog.index));
      toast({
        title: "Item Removed",
        description: "Replacement door removed from estimate",
        action: <Button variant="outline" size="sm" onClick={handleUndo}>Undo</Button>
      });
    } else if (deleteDialog.type === 'flooring') {
      const removedItem = flooring[deleteDialog.index];
      setUndoState({ action: 'remove', type: 'flooring', data: [removedItem] });
      setFlooring(flooring.filter((_, i) => i !== deleteDialog.index));
      toast({
        title: "Item Removed",
        description: "Flooring removed from estimate",
        action: <Button variant="outline" size="sm" onClick={handleUndo}>Undo</Button>
      });
    } else if (deleteDialog.type === 'countertop') {
      const removedItem = countertops[deleteDialog.index];
      setUndoState({ action: 'remove', type: 'countertop', data: [removedItem] });
      setCountertops(countertops.filter((_, i) => i !== deleteDialog.index));
      toast({
        title: "Item Removed",
        description: "Countertop removed from estimate",
        action: <Button variant="outline" size="sm" onClick={handleUndo}>Undo</Button>
      });
    } else if (deleteDialog.type === 'hardware') {
      const removedItem = hardware[deleteDialog.index];
      setUndoState({ action: 'remove', type: 'hardware', data: [removedItem] });
      setHardware(hardware.filter((_, i) => i !== deleteDialog.index));
      toast({
        title: "Item Removed",
        description: "Hardware removed from estimate",
        action: <Button variant="outline" size="sm" onClick={handleUndo}>Undo</Button>
      });
    }
    setDeleteDialog({ open: false, type: null, index: -1, itemName: '' });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, type: null, index: -1, itemName: '' });
  };

  const confirmClearAll = (type: 'cabinet' | 'flooring' | 'countertop' | 'hardware' | 'door') => {
    setClearAllDialog({ open: true, type });
  };

  const handleClearAllConfirm = () => {
    if (clearAllDialog.type === 'cabinet') {
      setUndoState({ action: 'clear', type: 'cabinet', data: [...cabinets] });
      setCabinets([]);
      toast({
        title: "Cabinets Cleared",
        description: `Removed ${cabinets.length} cabinet item(s)`,
        action: <Button variant="outline" size="sm" onClick={handleUndo}>Undo</Button>
      });
    } else if (clearAllDialog.type === 'door') {
      setUndoState({ action: 'clear', type: 'door', data: [...replacementDoors] });
      setReplacementDoors([]);
      toast({
        title: "Replacement Doors Cleared",
        description: `Removed ${replacementDoors.length} door item(s)`,
        action: <Button variant="outline" size="sm" onClick={handleUndo}>Undo</Button>
      });
    } else if (clearAllDialog.type === 'flooring') {
      setUndoState({ action: 'clear', type: 'flooring', data: [...flooring] });
      setFlooring([]);
      toast({
        title: "Flooring Cleared",
        description: `Removed ${flooring.length} flooring item(s)`,
        action: <Button variant="outline" size="sm" onClick={handleUndo}>Undo</Button>
      });
    } else if (clearAllDialog.type === 'countertop') {
      setUndoState({ action: 'clear', type: 'countertop', data: [...countertops] });
      setCountertops([]);
      toast({
        title: "Countertops Cleared",
        description: `Removed ${countertops.length} countertop item(s)`,
        action: <Button variant="outline" size="sm" onClick={handleUndo}>Undo</Button>
      });
    } else if (clearAllDialog.type === 'hardware') {
      setUndoState({ action: 'clear', type: 'hardware', data: [...hardware] });
      setHardware([]);
      toast({
        title: "Hardware Cleared",
        description: `Removed ${hardware.length} hardware item(s)`,
        action: <Button variant="outline" size="sm" onClick={handleUndo}>Undo</Button>
      });
    }
    setClearAllDialog({ open: false, type: null });
  };

  const handleClearAllCancel = () => {
    setClearAllDialog({ open: false, type: null });
  };

  const handleUndo = () => {
    if (!undoState.action || !undoState.type || !undoState.data) return;

    if (undoState.type === 'cabinet') {
      if (undoState.action === 'remove') {
        setCabinets([...cabinets, ...(undoState.data as CabinetItem[])]);
      } else if (undoState.action === 'clear') {
        setCabinets(undoState.data as CabinetItem[]);
      }
      toast({
        title: "Undo Successful",
        description: "Cabinet items restored"
      });
    } else if (undoState.type === 'door') {
      if (undoState.action === 'remove') {
        setReplacementDoors([...replacementDoors, ...(undoState.data as CabinetItem[])]);
      } else if (undoState.action === 'clear') {
        setReplacementDoors(undoState.data as CabinetItem[]);
      }
      toast({
        title: "Undo Successful",
        description: "Replacement door items restored"
      });
    } else if (undoState.type === 'flooring') {
      if (undoState.action === 'remove') {
        setFlooring([...flooring, ...(undoState.data as FlooringItem[])]);
      } else if (undoState.action === 'clear') {
        setFlooring(undoState.data as FlooringItem[]);
      }
      toast({
        title: "Undo Successful",
        description: "Flooring items restored"
      });
    } else if (undoState.type === 'countertop') {
      if (undoState.action === 'remove') {
        setCountertops([...countertops, ...(undoState.data as CountertopItem[])]);
      } else if (undoState.action === 'clear') {
        setCountertops(undoState.data as CountertopItem[]);
      }
      toast({
        title: "Undo Successful",
        description: "Countertop items restored"
      });
    } else if (undoState.type === 'hardware') {
      if (undoState.action === 'remove') {
        setHardware([...hardware, ...(undoState.data as HardwareItem[])]);
      } else if (undoState.action === 'clear') {
        setHardware(undoState.data as HardwareItem[]);
      }
      toast({
        title: "Undo Successful",
        description: "Hardware items restored"
      });
    }

    setUndoState({ action: null, type: null, data: null });
  };

  const startEditing = (type: 'cabinet' | 'flooring' | 'countertop' | 'hardware' | 'door', index: number) => {
    if (type === 'cabinet') {
      setEditingItem({ type, index, value: cabinets[index].quantity.toString() });
    } else if (type === 'flooring') {
      setEditingItem({ type, index, value: flooring[index].squareFeet.toString() });
    } else if (type === 'countertop') {
      setEditingItem({ type, index, value: countertops[index].linearFeet.toString() });
    } else if (type === 'hardware') {
      setEditingItem({ type, index, value: hardware[index].quantity.toString() });
    } else if (type === 'door') {
      setEditingItem({ type, index, value: replacementDoors[index].quantity.toString() });
    }
  };

  const cancelEditing = () => {
    setEditingItem({ type: null, index: -1, value: '' });
  };

  const handleKeyNavigation = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = currentIndex - 1;
      if (newIndex >= 0) {
        saveEdit();
        setTimeout(() => startEditing(editingItem.type!, newIndex), 50);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      let maxIndex = 0;
      if (editingItem.type === 'cabinet') {
        maxIndex = cabinets.length - 1;
      } else if (editingItem.type === 'flooring') {
        maxIndex = flooring.length - 1;
      } else if (editingItem.type === 'countertop') {
        maxIndex = countertops.length - 1;
      }
      
      const newIndex = currentIndex + 1;
      if (newIndex <= maxIndex) {
        saveEdit();
        setTimeout(() => startEditing(editingItem.type!, newIndex), 50);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      saveEdit();
      
      if (e.shiftKey) {
        // Navigate backwards
        if (editingItem.type === 'cabinet') {
          const newIndex = currentIndex - 1;
          if (newIndex >= 0) {
            setTimeout(() => startEditing('cabinet', newIndex), 50);
          } else if (countertops.length > 0) {
            setTimeout(() => startEditing('countertop', countertops.length - 1), 50);
          } else if (flooring.length > 0) {
            setTimeout(() => startEditing('flooring', flooring.length - 1), 50);
          }
        } else if (editingItem.type === 'flooring') {
          const newIndex = currentIndex - 1;
          if (newIndex >= 0) {
            setTimeout(() => startEditing('flooring', newIndex), 50);
          } else if (cabinets.length > 0) {
            setTimeout(() => startEditing('cabinet', cabinets.length - 1), 50);
          } else if (countertops.length > 0) {
            setTimeout(() => startEditing('countertop', countertops.length - 1), 50);
          }
        } else if (editingItem.type === 'countertop') {
          const newIndex = currentIndex - 1;
          if (newIndex >= 0) {
            setTimeout(() => startEditing('countertop', newIndex), 50);
          } else if (flooring.length > 0) {
            setTimeout(() => startEditing('flooring', flooring.length - 1), 50);
          } else if (cabinets.length > 0) {
            setTimeout(() => startEditing('cabinet', cabinets.length - 1), 50);
          }
        }
      } else {
        // Navigate forwards
        if (editingItem.type === 'cabinet') {
          const newIndex = currentIndex + 1;
          if (newIndex < cabinets.length) {
            setTimeout(() => startEditing('cabinet', newIndex), 50);
          } else if (flooring.length > 0) {
            setTimeout(() => startEditing('flooring', 0), 50);
          } else if (countertops.length > 0) {
            setTimeout(() => startEditing('countertop', 0), 50);
          }
        } else if (editingItem.type === 'flooring') {
          const newIndex = currentIndex + 1;
          if (newIndex < flooring.length) {
            setTimeout(() => startEditing('flooring', newIndex), 50);
          } else if (countertops.length > 0) {
            setTimeout(() => startEditing('countertop', 0), 50);
          } else if (cabinets.length > 0) {
            setTimeout(() => startEditing('cabinet', 0), 50);
          }
        } else if (editingItem.type === 'countertop') {
          const newIndex = currentIndex + 1;
          if (newIndex < countertops.length) {
            setTimeout(() => startEditing('countertop', newIndex), 50);
          } else if (cabinets.length > 0) {
            setTimeout(() => startEditing('cabinet', 0), 50);
          } else if (flooring.length > 0) {
            setTimeout(() => startEditing('flooring', 0), 50);
          }
        }
      }
    }
  };

  const saveEdit = () => {
    if (!editingItem.type || editingItem.index === -1) return;
    
    try {
      if (editingItem.type === 'cabinet') {
        const quantity = parseInt(editingItem.value);
        cabinetSchema.parse({ quantity });
        
        const updatedCabinets = [...cabinets];
        updatedCabinets[editingItem.index] = {
          ...updatedCabinets[editingItem.index],
          quantity
        };
        setCabinets(updatedCabinets);
        toast({
          title: "Updated",
          description: "Cabinet quantity updated successfully"
        });
      } else if (editingItem.type === 'door') {
        const quantity = parseInt(editingItem.value);
        cabinetSchema.parse({ quantity });
        
        const updatedDoors = [...replacementDoors];
        updatedDoors[editingItem.index] = {
          ...updatedDoors[editingItem.index],
          quantity
        };
        setReplacementDoors(updatedDoors);
        toast({
          title: "Updated",
          description: "Replacement door quantity updated successfully"
        });
      } else if (editingItem.type === 'flooring') {
        const squareFeet = parseFloat(editingItem.value);
        flooringSchema.parse({ squareFeet });
        
        const updatedFlooring = [...flooring];
        updatedFlooring[editingItem.index] = {
          ...updatedFlooring[editingItem.index],
          squareFeet
        };
        setFlooring(updatedFlooring);
        toast({
          title: "Updated",
          description: "Flooring measurement updated successfully"
        });
      } else if (editingItem.type === 'countertop') {
        const linearFeet = parseFloat(editingItem.value);
        countertopSchema.parse({ linearFeet });
        
        const updatedCountertops = [...countertops];
        updatedCountertops[editingItem.index] = {
          ...updatedCountertops[editingItem.index],
          linearFeet
        };
        setCountertops(updatedCountertops);
        toast({
          title: "Updated",
          description: "Countertop measurement updated successfully"
        });
      } else if (editingItem.type === 'hardware') {
        const quantity = parseInt(editingItem.value);
        cabinetSchema.parse({ quantity });
        
        const updatedHardware = [...hardware];
        updatedHardware[editingItem.index] = {
          ...updatedHardware[editingItem.index],
          quantity
        };
        setHardware(updatedHardware);
        toast({
          title: "Updated",
          description: "Hardware quantity updated successfully"
        });
      }
      
      cancelEditing();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid Input",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
  };

  const cabinetTotal = cabinets.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);
  const replacementDoorsTotal = replacementDoors.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);
  const flooringTotal = flooring.reduce((sum, item) => sum + (item.squareFeet * item.pricePerSqFt), 0);
  const countertopTotal = countertops.reduce((sum, item) => sum + (item.linearFeet * item.pricePerLinearFt), 0);
  const hardwareTotal = hardware.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);
  const totalCabinetQuantity = cabinets.reduce((sum, item) => sum + item.quantity, 0) + replacementDoors.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cabinetTotal + replacementDoorsTotal + flooringTotal + countertopTotal + hardwareTotal;
  
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
  
  // Calculate installation cost (15% of materials subtotal)
  const installationCost = includeInstallation ? subtotal * 0.15 : 0;
  
  const grandTotal = subtotal + markupAmount + installationCost;

  const formatName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const generatePDF = (): jsPDF => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add logo
    try {
      doc.addImage(logo, 'PNG', 15, 10, 40, 20);
    } catch (error) {
      console.error('Error adding logo:', error);
    }
    
    // Add title and date
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Price Estimate', pageWidth - 15, 20, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 15, 27, { align: 'right' });
    
    let yPosition = 45;
    
    // Cabinets section
    if (cabinets.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Cabinets', 15, yPosition);
      yPosition += 7;
      
      const cabinetRows = cabinets.map(item => [
        formatName(item.type),
        item.quantity.toString(),
        `$${item.pricePerUnit.toFixed(2)}`,
        `$${(item.quantity * item.pricePerUnit).toFixed(2)}`
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Type', 'Quantity', 'Unit Price', 'Total']],
        body: cabinetRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 15, right: 15 }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 5;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Cabinets Subtotal: $${cabinetTotal.toFixed(2)}`, pageWidth - 15, yPosition, { align: 'right' });
      yPosition += 10;
    }
    
    // Flooring section
    if (flooring.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Flooring', 15, yPosition);
      yPosition += 7;
      
      const flooringRows = flooring.map(item => [
        formatName(item.type),
        `${item.squareFeet} sq ft`,
        `$${item.pricePerSqFt.toFixed(2)}/sq ft`,
        `$${(item.squareFeet * item.pricePerSqFt).toFixed(2)}`
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Type', 'Area', 'Unit Price', 'Total']],
        body: flooringRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 15, right: 15 }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 5;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Flooring Subtotal: $${flooringTotal.toFixed(2)}`, pageWidth - 15, yPosition, { align: 'right' });
      yPosition += 10;
    }
    
    // Countertops section
    if (countertops.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Countertops', 15, yPosition);
      yPosition += 7;
      
      const countertopRows = countertops.map(item => [
        formatName(item.type),
        `${item.linearFeet} linear ft`,
        `$${item.pricePerLinearFt.toFixed(2)}/linear ft`,
        `$${(item.linearFeet * item.pricePerLinearFt).toFixed(2)}`
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Type', 'Length', 'Unit Price', 'Total']],
        body: countertopRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 15, right: 15 }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 5;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Countertops Subtotal: $${countertopTotal.toFixed(2)}`, pageWidth - 15, yPosition, { align: 'right' });
      yPosition += 10;
    }
    
    // Total summary
    yPosition += 5;
    doc.setDrawColor(79, 70, 229);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 15, yPosition);
    doc.text(`$${subtotal.toFixed(2)}`, pageWidth - 15, yPosition, { align: 'right' });
    yPosition += 7;
    
    if (markupPercentage > 0) {
      doc.setTextColor(217, 119, 6);
      doc.text(`${markupLabel}:`, 15, yPosition);
      doc.text(`$${markupAmount.toFixed(2)}`, pageWidth - 15, yPosition, { align: 'right' });
      yPosition += 7;
      doc.setTextColor(0, 0, 0);
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', 15, yPosition);
    doc.setTextColor(79, 70, 229);
    doc.text(`$${grandTotal.toFixed(2)}`, pageWidth - 15, yPosition, { align: 'right' });
    
    // Disclaimer
    yPosition += 15;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    const disclaimer = '* This is an estimate. Final pricing may vary based on specific requirements and installation.';
    doc.text(disclaimer, pageWidth / 2, yPosition, { align: 'center', maxWidth: pageWidth - 30 });
    
    return doc;
  };

  const exportToPDF = () => {
    const doc = generatePDF();
    doc.save(`estimate-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF Exported",
      description: "Your estimate has been downloaded successfully"
    });
  };

  const handleEmailEstimate = async () => {
    if (!recipientEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a recipient email address",
        variant: "destructive"
      });
      return;
    }

    setIsSendingEmail(true);

    try {
      // Generate PDF and convert to base64
      const doc = generatePDF();
      const pdfBase64 = doc.output('datauristring').split(',')[1];

      const { data, error } = await supabase.functions.invoke('send-estimate-email', {
        body: {
          recipientEmail,
          recipientName: recipientName || undefined,
          pdfBase64,
          estimateDate: new Date().toLocaleDateString(),
          grandTotal
        }
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: `Estimate has been sent to ${recipientEmail}`
      });

      setEmailDialog(false);
      setRecipientEmail('');
      setRecipientName('');
    } catch (error: any) {
      console.error('Error sending estimate:', error);
      toast({
        title: "Failed to Send",
        description: error.message || "Could not send estimate email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
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
          countertop_items: countertops as any,
          cabinet_total: cabinetTotal,
          flooring_total: flooringTotal,
          countertop_total: countertopTotal,
          hardware_total: hardwareTotal,
          grand_total: grandTotal,
          installation_requested: includeInstallation,
          installation_cost: installationCost,
        } as any)
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
        countertop_items: countertops as any,
        hardware_items: hardware as any,
        cabinet_total: cabinetTotal,
        flooring_total: flooringTotal,
        countertop_total: countertopTotal,
        hardware_total: hardwareTotal,
        grand_total: grandTotal,
        installation_requested: includeInstallation,
        installation_cost: installationCost,
      } as any);

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

          <CalacattaHero 
            onFilterCalacatta={() => setCalacattaFilter(true)}
            onSelectCountertop={(name) => setCountertopType(name)}
            onCompare={(images) => {
              setComparisonImages(images);
              setComparisonOpen(true);
            }}
          />

          <CalacattaComparisonModal
            open={comparisonOpen}
            onOpenChange={setComparisonOpen}
            selectedImages={comparisonImages}
            onSelectCountertop={(name) => {
              setCalacattaFilter(true);
              setCountertopType(name);
              setTimeout(() => {
                const countertopSection = document.querySelector('[data-section="countertops"]');
                countertopSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 100);
            }}
            onClearComparison={() => setComparisonImages([])}
            pricing={countertopTypes.reduce((acc, ct) => {
              acc[ct.name.toLowerCase()] = ct.price_per_linear_ft;
              return acc;
            }, {} as Record<string, number>)}
          />

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Cabinet Calculator */}
            <Card className={editingItem.type === 'cabinet' ? 'ring-2 ring-primary shadow-lg transition-all duration-200' : 'transition-all duration-200'}>
              <CardHeader>
                <CardTitle>Cabinets</CardTitle>
                <CardDescription>Add complete cabinets to your estimate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cabinet Size Selection */}
                <div className="space-y-2">
                  <Label>Cabinet Size</Label>
                  <Select value={cabinetType} onValueChange={setCabinetType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cabinet size" />
                    </SelectTrigger>
                    <SelectContent>
                      {cabinetTypes
                        .filter((cabinet) => !cabinet.name.startsWith("Doormark"))
                        .map((cabinet) => (
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
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">Added Cabinets:</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmClearAll('cabinet')}
                        className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        Clear All
                      </Button>
                    </div>
                    {cabinets.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm gap-2">
                        {editingItem.type === 'cabinet' && editingItem.index === index ? (
                          <div className="flex-1 flex items-center gap-2">
                            <span>{formatName(item.type)} x</span>
                            <Input
                              type="number"
                              min="1"
                              max="1000"
                              value={editingItem.value}
                              onChange={(e) => setEditingItem({...editingItem, value: e.target.value})}
                              onBlur={() => saveEdit()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                else if (e.key === 'Escape') cancelEditing();
                                else handleKeyNavigation(e, index);
                              }}
                              autoFocus
                              className="w-20 h-8"
                            />
                          </div>
                        ) : (
                          <span
                            className="flex-1 cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors"
                            onClick={() => startEditing('cabinet', index)}
                            title="Click to edit quantity"
                          >
                            {formatName(item.type)} x{item.quantity}
                          </span>
                        )}
                        <span className="font-semibold">${(item.quantity * item.pricePerUnit).toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmRemoveCabinet(index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

            {/* Replacement Cabinet Doors */}
            <Card className={editingItem.type === 'door' ? 'ring-2 ring-primary shadow-lg transition-all duration-200' : 'transition-all duration-200'}>
              <CardHeader>
                <CardTitle>Replacement Cabinet Doors</CardTitle>
                <CardDescription>Add replacement doors to your estimate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Door Style Selection */}
                <div className="space-y-2">
                  <Label>Door Style</Label>
                  <ImageSelect value={replacementDoorType} onValueChange={setReplacementDoorType}>
                    <ImageSelectTrigger className="w-full">
                      <SelectValue placeholder="Select door style" />
                    </ImageSelectTrigger>
                    <ImageSelectContent>
                      {cabinetTypes
                        .filter((cabinet) => cabinet.name.startsWith("Doormark"))
                        .map((cabinet) => (
                          <DoorStylePreview
                            key={cabinet.id}
                            doorStyle={{
                              name: formatName(cabinet.name),
                              price: cabinet.price_per_unit,
                              image: doorStyleImageMap[cabinet.name],
                              ...doorStyleSpecs[cabinet.name]
                            }}
                          >
                            <ImageSelectItem
                              value={cabinet.name}
                              image={doorStyleImageMap[cabinet.name]}
                            >
                              {formatName(cabinet.name)} - ${cabinet.price_per_unit}
                            </ImageSelectItem>
                          </DoorStylePreview>
                        ))}
                    </ImageSelectContent>
                  </ImageSelect>
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="Enter quantity (1-1000)"
                    value={replacementDoorQuantity}
                    onChange={(e) => setReplacementDoorQuantity(e.target.value)}
                  />
                </div>

                <Button onClick={addReplacementDoor} className="w-full" variant="kiosk">
                  Add Replacement Door
                </Button>

                {replacementDoors.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">Added Doors:</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmClearAll('door')}
                        className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        Clear All
                      </Button>
                    </div>
                    {replacementDoors.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm gap-2">
                        {editingItem.type === 'door' && editingItem.index === index ? (
                          <div className="flex-1 flex items-center gap-2">
                            <span>{formatName(item.type)} x</span>
                            <Input
                              type="number"
                              min="1"
                              max="1000"
                              value={editingItem.value}
                              onChange={(e) => setEditingItem({...editingItem, value: e.target.value})}
                              onBlur={() => saveEdit()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                else if (e.key === 'Escape') cancelEditing();
                                else handleKeyNavigation(e, index);
                              }}
                              autoFocus
                              className="w-20 h-8"
                            />
                          </div>
                        ) : (
                          <span
                            className="flex-1 cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors"
                            onClick={() => startEditing('door', index)}
                            title="Click to edit quantity"
                          >
                            {formatName(item.type)} x{item.quantity}
                          </span>
                        )}
                        <span className="font-semibold">${(item.quantity * item.pricePerUnit).toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmRemoveReplacementDoor(index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Factory Price:</span>
                      <span>${replacementDoorsTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Flooring Calculator */}
            <Card ref={flooringSectionRef} className={editingItem.type === 'flooring' ? 'ring-2 ring-primary shadow-lg transition-all duration-200' : 'transition-all duration-200'}>
              <CardHeader>
                <CardTitle>Flooring</CardTitle>
                <CardDescription>Add flooring to your estimate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Visual Flooring Selection Grid */}
                <div className="space-y-4">
                  <Label>Select Flooring Type</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {flooringTypes.map((flooring) => {
                      const imageSrc = flooringImageMap[flooring.name] || null;
                      const isSelected = flooringType === flooring.name;
                      return (
                        <div
                          key={flooring.id}
                          onClick={() => setFlooringType(flooring.name)}
                          className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                            isSelected 
                              ? 'border-accent ring-2 ring-accent scale-105' 
                              : 'border-border hover:border-accent/50 hover:scale-102'
                          }`}
                        >
                          {imageSrc ? (
                            <div className="aspect-square relative">
                              <img
                                src={imageSrc}
                                alt={flooring.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                                <p className="text-xs font-semibold text-white">
                                  {formatName(flooring.name)}
                                </p>
                                <p className="text-xs text-accent font-bold">
                                  ${flooring.price_per_sqft}/sq ft
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-square flex flex-col items-center justify-center bg-muted p-2">
                              <p className="text-xs font-semibold text-center">
                                {formatName(flooring.name)}
                              </p>
                              <p className="text-xs text-accent font-bold">
                                ${flooring.price_per_sqft}/sq ft
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dropdown Alternative */}
                <div className="space-y-2">
                  <Label>Or Select from Dropdown</Label>
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
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">Added Flooring:</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmClearAll('flooring')}
                        className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        Clear All
                      </Button>
                    </div>
                    {flooring.map((item, index) => {
                      const imageSrc = flooringImageMap[item.type] || null;
                      return (
                        <div key={index} className="flex justify-between items-center text-sm gap-2">
                          {editingItem.type === 'flooring' && editingItem.index === index ? (
                            <div className="flex-1 flex items-center gap-2">
                              {imageSrc && (
                                <img src={imageSrc} alt={item.type} className="w-8 h-8 object-cover rounded" />
                              )}
                              <span>{formatName(item.type)} -</span>
                              <Input
                                type="number"
                                min="0.1"
                                max="100000"
                                step="0.1"
                                value={editingItem.value}
                                onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit();
                                  if (e.key === 'Escape') cancelEditing();
                                  handleKeyNavigation(e, index);
                                }}
                                className="h-7 w-24"
                                autoFocus
                              />
                              <span className="text-xs">sq ft</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={saveEdit}
                                className="h-7 px-2 text-xs"
                              >
                                Save
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelEditing}
                                className="h-7 px-2 text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 flex-1">
                                {imageSrc && (
                                  <img src={imageSrc} alt={item.type} className="w-8 h-8 object-cover rounded" />
                                )}
                                <span 
                                  className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors"
                                  onClick={() => startEditing('flooring', index)}
                                  title="Click to edit square feet"
                                >
                                  {formatName(item.type)} - {item.squareFeet} sq ft
                                </span>
                              </div>
                              <span className="font-semibold">${(item.squareFeet * item.pricePerSqFt).toFixed(2)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => confirmRemoveFlooring(index)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      );
                    })}
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Flooring Subtotal:</span>
                      <span>${flooringTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Countertop Calculator */}
            <Card data-section="countertops" className={editingItem.type === 'countertop' ? 'ring-2 ring-primary shadow-lg transition-all duration-200' : 'transition-all duration-200'}>
              <CardHeader>
                <CardTitle>Countertops</CardTitle>
                <CardDescription>Add countertops to your estimate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Countertop Type</Label>
                    {calacattaFilter && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCalacattaFilter(false)}
                        className="h-6 text-xs text-accent hover:text-accent/80"
                      >
                        Show All
                      </Button>
                    )}
                  </div>
                  <Select value={countertopType} onValueChange={setCountertopType}>
                    <SelectTrigger className={calacattaFilter ? 'ring-2 ring-accent' : ''}>
                      <SelectValue placeholder={calacattaFilter ? "Select Calacatta countertop" : "Select countertop type"} />
                    </SelectTrigger>
                    <SelectContent>
                      {countertopTypes
                        .filter(countertop => !calacattaFilter || countertop.name.toLowerCase().includes('calacatta'))
                        .map((countertop) => (
                          <SelectItem key={countertop.id} value={countertop.name}>
                            {formatName(countertop.name)} - ${countertop.price_per_linear_ft}/linear ft
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {calacattaFilter && (
                    <p className="text-xs text-accent flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Showing Calacatta collection only
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Linear Feet</Label>
                  <Input
                    type="number"
                    min="0.1"
                    max="10000"
                    step="0.1"
                    placeholder="Enter linear feet (0.1-10,000)"
                    value={countertopLinearFeet}
                    onChange={(e) => setCountertopLinearFeet(e.target.value)}
                  />
                </div>

                <Button onClick={addCountertop} className="w-full" variant="kiosk">
                  Add Countertop
                </Button>

                {countertops.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">Added Countertops:</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmClearAll('countertop')}
                        className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        Clear All
                      </Button>
                    </div>
                    {countertops.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm gap-2">
                        {editingItem.type === 'countertop' && editingItem.index === index ? (
                          <div className="flex-1 flex items-center gap-2">
                            <span>{formatName(item.type)} -</span>
                            <Input
                              type="number"
                              min="0.1"
                              max="10000"
                              step="0.1"
                              value={editingItem.value}
                              onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') cancelEditing();
                                handleKeyNavigation(e, index);
                              }}
                              className="h-7 w-24"
                              autoFocus
                            />
                            <span className="text-xs">linear ft</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={saveEdit}
                              className="h-7 px-2 text-xs"
                            >
                              Save
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEditing}
                              className="h-7 px-2 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <span 
                            className="flex-1 cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors"
                            onClick={() => startEditing('countertop', index)}
                            title="Click to edit linear feet"
                          >
                            {formatName(item.type)} - {item.linearFeet} linear ft
                          </span>
                        )}
                        <span className="font-semibold">${(item.linearFeet * item.pricePerLinearFt).toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmRemoveCountertop(index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Factory Price:</span>
                      <span>${countertopTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Hardware Section */}
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Cabinet Hardware</CardTitle>
                <CardDescription>Add handles, knobs, and hardware</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="hardware-type">Hardware Type</Label>
                    <ImageSelect value={hardwareType} onValueChange={setHardwareType}>
                      <ImageSelectTrigger>
                        {hardwareType ? (
                          <div className="flex items-center gap-2">
                            {hardwareTypes.find(h => h.name === hardwareType)?.image_url && (
                              <img 
                                src={hardwareTypes.find(h => h.name === hardwareType)?.image_url} 
                                alt="" 
                                className="h-8 w-8 rounded object-cover"
                              />
                            )}
                            <span>{hardwareType}</span>
                          </div>
                        ) : "Select hardware"}
                      </ImageSelectTrigger>
                      <ImageSelectContent>
                        {hardwareTypes.map((type) => (
                          <ImageSelectItem key={type.id} value={type.name} image={type.image_url}>
                            <div className="flex flex-col">
                              <span className="font-medium">{type.name}</span>
                              <span className="text-xs text-muted-foreground">${type.price_per_unit.toFixed(2)} each</span>
                            </div>
                          </ImageSelectItem>
                        ))}
                      </ImageSelectContent>
                    </ImageSelect>
                  </div>
                  <div>
                    <Label htmlFor="hardware-quantity">Quantity</Label>
                    <Input
                      id="hardware-quantity"
                      type="number"
                      min="1"
                      value={hardwareQuantity}
                      onChange={(e) => setHardwareQuantity(e.target.value)}
                      placeholder="Enter quantity"
                    />
                  </div>
                  <Button onClick={addHardware}>Add Hardware</Button>
                </div>

                {hardware.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">Added Hardware:</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmClearAll('hardware')}
                        className="text-destructive hover:text-destructive"
                      >
                        Clear All
                      </Button>
                    </div>
                    {hardware.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded gap-2">
                        {editingItem.type === 'hardware' && editingItem.index === index ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="number"
                              min="1"
                              value={editingItem.value}
                              onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') cancelEditing();
                                handleKeyNavigation(e, index);
                              }}
                              className="h-7 w-24"
                              autoFocus
                            />
                            <Button variant="ghost" size="sm" onClick={saveEdit} className="h-7 px-2 text-xs">Save</Button>
                            <Button variant="ghost" size="sm" onClick={cancelEditing} className="h-7 px-2 text-xs">Cancel</Button>
                          </div>
                        ) : (
                          <span 
                            className="flex-1 cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors"
                            onClick={() => startEditing('hardware', index)}
                            title="Click to edit quantity"
                          >
                            {formatName(item.type)} x{item.quantity}
                          </span>
                        )}
                        <span className="font-semibold">${(item.quantity * item.pricePerUnit).toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmRemoveHardware(index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Factory Price:</span>
                      <span>${hardwareTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Total Summary */}
          {(cabinets.length > 0 || flooring.length > 0 || countertops.length > 0 || hardware.length > 0) && (
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
                  <div className="flex justify-between">
                    <span>Countertops:</span>
                    <span className="font-semibold">${countertopTotal.toFixed(2)}</span>
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
                  
                  {/* Installation Option */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="include-installation"
                        checked={includeInstallation}
                        onChange={(e) => setIncludeInstallation(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="include-installation" className="cursor-pointer">
                        Include Installation Service
                      </label>
                    </div>
                    {includeInstallation && (
                      <span className="font-semibold text-green-600">+${installationCost.toFixed(2)}</span>
                    )}
                  </div>
                  {includeInstallation && (
                    <div className="text-sm text-muted-foreground pl-6">
                      Professional installation (15% of materials cost)
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
                  disabled={cabinets.length === 0 && flooring.length === 0 && countertops.length === 0}
                >
                  {editId ? "Update Estimate" : "Save Estimate"}
                </Button>
                <div className="flex gap-2 mt-3">
                  <Button 
                    onClick={exportToPDF} 
                    className="flex-1"
                    variant="outline"
                    disabled={cabinets.length === 0 && flooring.length === 0 && countertops.length === 0}
                  >
                    Export to PDF
                  </Button>
                  <Button 
                    onClick={() => setEmailDialog(true)} 
                    className="flex-1"
                    variant="outline"
                    disabled={cabinets.length === 0 && flooring.length === 0 && countertops.length === 0}
                  >
                    Email Estimate
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  * This is an estimate. Final pricing may vary based on specific requirements and installation.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deleteDialog.itemName}</strong> from your estimate? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={clearAllDialog.open} onOpenChange={(open) => !open && handleClearAllCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All {clearAllDialog.type === 'cabinet' ? 'Cabinets' : clearAllDialog.type === 'flooring' ? 'Flooring' : 'Countertops'}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove all {clearAllDialog.type === 'cabinet' ? 'cabinet' : clearAllDialog.type === 'flooring' ? 'flooring' : 'countertop'} items from your estimate? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleClearAllCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAllConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Dialog */}
      <Dialog open={emailDialog} onOpenChange={setEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Estimate</DialogTitle>
            <DialogDescription>
              Send this estimate as a PDF attachment to your client
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Client Name (Optional)</Label>
              <Input
                id="recipientName"
                placeholder="John Doe"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Client Email *</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="client@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialog(false)} disabled={isSendingEmail}>
              Cancel
            </Button>
            <Button onClick={handleEmailEstimate} disabled={isSendingEmail}>
              {isSendingEmail ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
