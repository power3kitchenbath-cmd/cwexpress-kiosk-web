import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, RotateCcw, Download, ImageIcon, Save, FolderOpen, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import doormarkShakerImg from "@/assets/cabinet-doors/doormark-shaker-abacoa.png";
import doormarkBalHarborImg from "@/assets/cabinet-doors/doormark-bal-harbor.png";
import doormarkCaprisImg from "@/assets/cabinet-doors/doormark-capris.png";
import doormarkBiscayneImg from "@/assets/cabinet-doors/doormark-biscayne.png";
import doormarkEuroImg from "@/assets/cabinet-doors/doormark-euro-shaker.png";
import doormarkHollyHillImg from "@/assets/cabinet-doors/doormark-holly-hill.png";
import kitchenSample from "@/assets/sample-rooms/kitchen-modern.jpg";

interface DoorOption {
  name: string;
  image: string;
  label: string;
  style: string;
}

const doorOptions: DoorOption[] = [
  { name: "Shaker Abacoa", image: doormarkShakerImg, label: "SHAKER ABACOA", style: "Shaker" },
  { name: "Bal Harbor", image: doormarkBalHarborImg, label: "BAL HARBOR", style: "Flat Panel" },
  { name: "Capris", image: doormarkCaprisImg, label: "CAPRIS", style: "Shaker" },
  { name: "Biscayne", image: doormarkBiscayneImg, label: "BISCAYNE", style: "Raised Panel" },
  { name: "Euro Shaker", image: doormarkEuroImg, label: "EURO SHAKER", style: "Shaker" },
  { name: "Holly Hill", image: doormarkHollyHillImg, label: "HOLLY HILL", style: "Flat Panel" },
];

export default function CabinetVisualizer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [roomImage, setRoomImage] = useState<HTMLImageElement | null>(null);
  const [selectedDoor, setSelectedDoor] = useState<DoorOption>(doorOptions[0]);
  const [doorTexture, setDoorTexture] = useState<HTMLImageElement | null>(null);
  const [opacity, setOpacity] = useState([70]);
  const [brightness, setBrightness] = useState([100]);
  const [scale, setScale] = useState([100]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [savedDesigns, setSavedDesigns] = useState<any[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [designName, setDesignName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDesigns, setIsLoadingDesigns] = useState(false);
  const [showSavedDesigns, setShowSavedDesigns] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Check authentication status
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        loadSavedDesigns();
      }
    });
  }, []);

  // Load sample kitchen image on mount
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setRoomImage(img);
    img.src = kitchenSample;
  }, []);

  // Load door texture when selection changes
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setDoorTexture(img);
      if (roomImage) {
        drawCanvas();
      }
    };
    img.src = selectedDoor.image;
  }, [selectedDoor]);

  // Redraw canvas when parameters change
  useEffect(() => {
    if (roomImage && doorTexture) {
      drawCanvas();
    }
  }, [roomImage, doorTexture, opacity, brightness, scale]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !roomImage || !doorTexture) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size to match room image
    canvas.width = roomImage.width;
    canvas.height = roomImage.height;

    // Draw room image
    ctx.drawImage(roomImage, 0, 0);

    // Apply brightness filter
    ctx.filter = `brightness(${brightness[0]}%)`;
    ctx.drawImage(roomImage, 0, 0);
    ctx.filter = 'none';

    // Calculate door texture dimensions and position
    const scalePercent = scale[0] / 100;
    const textureWidth = doorTexture.width * scalePercent;
    const textureHeight = doorTexture.height * scalePercent;
    
    // Position for cabinet door overlay (centered in lower portion of image)
    const x = (canvas.width - textureWidth) / 2;
    const y = canvas.height * 0.4; // Position in the middle-lower area where cabinets typically are

    // Create pattern from door texture
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = textureWidth;
    patternCanvas.height = textureHeight;
    const patternCtx = patternCanvas.getContext('2d');
    
    if (patternCtx) {
      patternCtx.drawImage(doorTexture, 0, 0, textureWidth, textureHeight);
      
      // Apply pattern to canvas with opacity
      ctx.globalAlpha = opacity[0] / 100;
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(patternCanvas, x, y);
      
      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setRoomImage(img);
        setIsProcessing(false);
        toast({
          title: "Image uploaded",
          description: "Your kitchen image has been loaded successfully",
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setRoomImage(img);
    img.src = kitchenSample;
    
    setOpacity([70]);
    setBrightness([100]);
    setScale([100]);
    
    toast({
      title: "Reset complete",
      description: "Visualizer has been reset to default settings",
    });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `doormark-${selectedDoor.name.toLowerCase().replace(/\s+/g, '-')}-preview.png`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "Download complete",
          description: "Your visualization has been saved",
        });
      }
    });
  };

  const loadSavedDesigns = async () => {
    if (!user) return;
    
    setIsLoadingDesigns(true);
    try {
      const { data, error } = await supabase
        .from('saved_cabinet_designs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedDesigns(data || []);
    } catch (error) {
      console.error('Error loading designs:', error);
      toast({
        title: "Error",
        description: "Failed to load saved designs",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDesigns(false);
    }
  };

  const handleSaveDesign = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to save your designs",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!designName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your design",
        variant: "destructive",
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSaving(true);
    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      // Upload to storage
      const fileName = `${user.id}/${Date.now()}-${designName.replace(/\s+/g, '-')}.png`;
      const { error: uploadError } = await supabase.storage
        .from('visualizer-rooms')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('visualizer-rooms')
        .getPublicUrl(fileName);

      // Save design metadata
      const { error: insertError } = await supabase
        .from('saved_cabinet_designs')
        .insert({
          user_id: user.id,
          design_name: designName,
          room_image_url: publicUrl,
          door_style: selectedDoor.name,
          opacity: opacity[0],
          brightness: brightness[0],
          scale: scale[0],
        });

      if (insertError) throw insertError;

      toast({
        title: "Design saved",
        description: "Your cabinet visualization has been saved successfully",
      });

      setIsSaveDialogOpen(false);
      setDesignName("");
      loadSavedDesigns();
    } catch (error) {
      console.error('Error saving design:', error);
      toast({
        title: "Error",
        description: "Failed to save design. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDesign = async (design: any) => {
    try {
      // Load the saved room image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setRoomImage(img);
        setOpacity([design.opacity]);
        setBrightness([design.brightness]);
        setScale([design.scale || 100]);
        
        // Find and set the door style
        const doorOption = doorOptions.find(d => d.name === design.door_style);
        if (doorOption) {
          setSelectedDoor(doorOption);
        }
        
        setShowSavedDesigns(false);
        toast({
          title: "Design loaded",
          description: `"${design.design_name}" has been loaded`,
        });
      };
      img.src = design.room_image_url;
    } catch (error) {
      console.error('Error loading design:', error);
      toast({
        title: "Error",
        description: "Failed to load design",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDesign = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_cabinet_designs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Design deleted",
        description: "The design has been removed",
      });

      loadSavedDesigns();
    } catch (error) {
      console.error('Error deleting design:', error);
      toast({
        title: "Error",
        description: "Failed to delete design",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/collections/doormark')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Collection
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Cabinet Door Visualizer</h1>
                <p className="text-sm text-muted-foreground">See how Doormark doors transform your kitchen</p>
              </div>
            </div>
            <div className="flex gap-2">
              {user && (
                <Button
                  variant="outline"
                  onClick={() => setShowSavedDesigns(true)}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Saved Designs
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Door Style Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Door Style</CardTitle>
                <CardDescription>Choose a Doormark cabinet door style</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="shaker">Shaker</TabsTrigger>
                    <TabsTrigger value="flat">Flat</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-2 mt-4">
                    {doorOptions.map((door) => (
                      <div
                        key={door.name}
                        className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md ${
                          selectedDoor.name === door.name
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                        }`}
                        onClick={() => setSelectedDoor(door)}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={door.image}
                            alt={door.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <p className="font-semibold">{door.name}</p>
                            <p className="text-xs text-muted-foreground">{door.style}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="shaker" className="space-y-2 mt-4">
                    {doorOptions.filter(d => d.style === "Shaker").map((door) => (
                      <div
                        key={door.name}
                        className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md ${
                          selectedDoor.name === door.name
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                        }`}
                        onClick={() => setSelectedDoor(door)}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={door.image}
                            alt={door.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <p className="font-semibold">{door.name}</p>
                            <p className="text-xs text-muted-foreground">{door.style}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="flat" className="space-y-2 mt-4">
                    {doorOptions.filter(d => d.style.includes("Flat")).map((door) => (
                      <div
                        key={door.name}
                        className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-md ${
                          selectedDoor.name === door.name
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                        }`}
                        onClick={() => setSelectedDoor(door)}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={door.image}
                            alt={door.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <p className="font-semibold">{door.name}</p>
                            <p className="text-xs text-muted-foreground">{door.style}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Adjustment Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Adjustments</CardTitle>
                <CardDescription>Fine-tune the visualization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Opacity</Label>
                    <span className="text-sm text-muted-foreground">{opacity[0]}%</span>
                  </div>
                  <Slider
                    value={opacity}
                    onValueChange={setOpacity}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Brightness</Label>
                    <span className="text-sm text-muted-foreground">{brightness[0]}%</span>
                  </div>
                  <Slider
                    value={brightness}
                    onValueChange={setBrightness}
                    min={50}
                    max={150}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Scale</Label>
                    <span className="text-sm text-muted-foreground">{scale[0]}%</span>
                  </div>
                  <Slider
                    value={scale}
                    onValueChange={setScale}
                    min={50}
                    max={200}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Upload Custom Image */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Kitchen</CardTitle>
                <CardDescription>Upload your own kitchen photo</CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Upload Image'}
                </Button>
              </CardContent>
            </Card>

            {/* Save Design */}
            {user && (
              <Button
                className="w-full"
                onClick={() => setIsSaveDialogOpen(true)}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Design
              </Button>
            )}
          </div>

          {/* Preview Canvas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  See how <strong>{selectedDoor.name}</strong> looks in your kitchen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full bg-muted rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 animate-pulse mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Processing...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Save Design Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Design</DialogTitle>
            <DialogDescription>
              Give your cabinet visualization a name to save it
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="design-name">Design Name</Label>
              <Input
                id="design-name"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                placeholder="e.g., Modern White Kitchen"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDesign}
              disabled={isSaving || !designName.trim()}
            >
              {isSaving ? 'Saving...' : 'Save Design'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Saved Designs Dialog */}
      <Dialog open={showSavedDesigns} onOpenChange={setShowSavedDesigns}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Saved Designs</DialogTitle>
            <DialogDescription>
              Load or delete your saved cabinet visualizations
            </DialogDescription>
          </DialogHeader>
          {isLoadingDesigns ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading designs...</p>
            </div>
          ) : savedDesigns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No saved designs yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {savedDesigns.map((design) => (
                <Card key={design.id} className="overflow-hidden">
                  <img
                    src={design.room_image_url}
                    alt={design.design_name}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{design.design_name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {design.door_style}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleLoadDesign(design)}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteConfirmId(design.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Design</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this design? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteDesign(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
