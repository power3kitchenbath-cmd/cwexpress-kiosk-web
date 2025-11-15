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
import cocoaImg from "@/assets/flooring/lvp/cocoa.png";
import butternutImg from "@/assets/flooring/lvp/butternut.png";
import fogImg from "@/assets/flooring/lvp/fog.png";
import blondieImg from "@/assets/flooring/lvp/blondie.png";
import kitchenSample from "@/assets/sample-rooms/kitchen-modern.jpg";
import livingRoomSample from "@/assets/sample-rooms/living-room-spacious.jpg";
import bathroomSample from "@/assets/sample-rooms/bathroom-modern.jpg";
import bedroomSample from "@/assets/sample-rooms/bedroom-cozy.jpg";
import officeSample from "@/assets/sample-rooms/office-home.jpg";
import diningRoomSample from "@/assets/sample-rooms/dining-room-formal.jpg";

interface FlooringOption {
  name: string;
  image: string;
  label: string;
}

interface SampleRoom {
  name: string;
  image: string;
  category: string;
}

const flooringOptions: FlooringOption[] = [
  { name: "LVP - Cocoa", image: cocoaImg, label: "COCOA" },
  { name: "LVP - Butternut", image: fogImg, label: "BUTTERNUT" },
  { name: "LVP - Fog", image: butternutImg, label: "FOG" },
  { name: "LVP - Blondie", image: blondieImg, label: "BLONDIE" },
];

const sampleRooms: SampleRoom[] = [
  { name: "Modern Kitchen", image: kitchenSample, category: "Kitchen" },
  { name: "Spacious Living Room", image: livingRoomSample, category: "Living Room" },
  { name: "Modern Bathroom", image: bathroomSample, category: "Bathroom" },
  { name: "Cozy Bedroom", image: bedroomSample, category: "Bedroom" },
  { name: "Home Office", image: officeSample, category: "Office" },
  { name: "Formal Dining Room", image: diningRoomSample, category: "Dining Room" },
];

const roomCategories = ["All", "Kitchen", "Living Room", "Bathroom", "Bedroom", "Office", "Dining Room"];

export default function FlooringVisualizer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [roomImage, setRoomImage] = useState<HTMLImageElement | null>(null);
  const [selectedFlooring, setSelectedFlooring] = useState<FlooringOption>(flooringOptions[0]);
  const [flooringTexture, setFlooringTexture] = useState<HTMLImageElement | null>(null);
  const [opacity, setOpacity] = useState([70]);
  const [brightness, setBrightness] = useState([100]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load saved designs when user is authenticated
  useEffect(() => {
    if (user) {
      loadSavedDesigns();
    }
  }, [user]);

  // Load flooring texture when selection changes
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setFlooringTexture(img);
      if (roomImage) {
        renderVisualization();
      }
    };
    img.src = selectedFlooring.image;
  }, [selectedFlooring]);

  // Re-render when opacity or brightness changes
  useEffect(() => {
    if (roomImage && flooringTexture) {
      renderVisualization();
    }
  }, [opacity, brightness, roomImage, flooringTexture]);

  const loadImageFromUrl = (imageUrl: string, source: string = "upload") => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setRoomImage(img);
      setIsProcessing(false);
      toast({
        title: "Image loaded!",
        description: source === "sample" 
          ? "Sample room loaded. Adjust flooring settings below." 
          : "Adjust the flooring settings to see how it looks in your room",
      });
    };
    img.onerror = () => {
      setIsProcessing(false);
      toast({
        title: "Error loading image",
        description: "Please try another image",
        variant: "destructive",
      });
    };
    img.src = imageUrl;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      loadImageFromUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSampleRoomSelect = (sampleRoom: SampleRoom) => {
    loadImageFromUrl(sampleRoom.image, "sample");
  };

  const loadSavedDesigns = async () => {
    if (!user) return;
    
    setIsLoadingDesigns(true);
    try {
      const { data, error } = await supabase
        .from("saved_flooring_designs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedDesigns(data || []);
    } catch (error) {
      console.error("Error loading saved designs:", error);
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
        title: "Authentication Required",
        description: "Please sign in to save your designs",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!roomImage || !selectedFlooring) {
      toast({
        title: "Missing Information",
        description: "Please select a room and flooring option",
        variant: "destructive",
      });
      return;
    }

    setIsSaveDialogOpen(true);
  };

  const confirmSaveDesign = async () => {
    if (!designName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your design",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = roomImage.src;
      let isSampleRoom = false;

      // Check if it's a sample room
      const sampleRoom = sampleRooms.find(room => room.image === roomImage.src);
      if (sampleRoom) {
        isSampleRoom = true;
      } else if (fileInputRef.current?.files?.[0]) {
        // Upload user's image to storage
        const file = fileInputRef.current.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('visualizer-rooms')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('visualizer-rooms')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      // Save design to database
      const { error } = await supabase
        .from("saved_flooring_designs")
        .insert({
          user_id: user.id,
          design_name: designName.trim(),
          room_image_url: imageUrl,
          flooring_type: selectedFlooring.name,
          opacity: opacity[0],
          brightness: brightness[0],
          is_sample_room: isSampleRoom,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Design saved successfully!",
      });

      setIsSaveDialogOpen(false);
      setDesignName("");
      loadSavedDesigns();
    } catch (error) {
      console.error("Error saving design:", error);
      toast({
        title: "Error",
        description: "Failed to save design",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDesign = async (design: any) => {
    try {
      // Find the flooring option
      const flooringOption = flooringOptions.find(opt => opt.name === design.flooring_type);
      if (flooringOption) {
        setSelectedFlooring(flooringOption);
      }
      
      setOpacity([design.opacity]);
      setBrightness([design.brightness]);

      // Load the room image
      await loadImageFromUrl(design.room_image_url, "saved");

      setShowSavedDesigns(false);
      toast({
        title: "Design Loaded",
        description: `Loaded "${design.design_name}"`,
      });
    } catch (error) {
      console.error("Error loading design:", error);
      toast({
        title: "Error",
        description: "Failed to load design",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDesign = async (designId: string) => {
    try {
      const { error } = await supabase
        .from("saved_flooring_designs")
        .delete()
        .eq("id", designId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Design deleted successfully",
      });

      loadSavedDesigns();
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting design:", error);
      toast({
        title: "Error",
        description: "Failed to delete design",
        variant: "destructive",
      });
    }
  };

  const filteredSampleRooms = selectedCategory === "All" 
    ? sampleRooms 
    : sampleRooms.filter(room => room.category === selectedCategory);

  const renderVisualization = () => {
    if (!canvasRef.current || !roomImage || !flooringTexture) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match room image
    const maxWidth = 1200;
    const maxHeight = 800;
    let width = roomImage.width;
    let height = roomImage.height;

    // Scale down if too large
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = width * ratio;
      height = height * ratio;
    }

    canvas.width = width;
    canvas.height = height;

    // Draw room image
    ctx.drawImage(roomImage, 0, 0, width, height);

    // Create flooring texture pattern
    const patternCanvas = document.createElement('canvas');
    const patternCtx = patternCanvas.getContext('2d');
    if (!patternCtx) return;

    // Scale flooring texture to reasonable size
    const textureSize = 200;
    patternCanvas.width = textureSize;
    patternCanvas.height = textureSize;
    patternCtx.drawImage(flooringTexture, 0, 0, textureSize, textureSize);

    const pattern = ctx.createPattern(patternCanvas, 'repeat');
    if (!pattern) return;

    // Apply flooring overlay to bottom 40% of image (typical floor area)
    const floorStartY = height * 0.6;
    
    // Save context
    ctx.save();
    
    // Set composite operation for blending
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = opacity[0] / 100;
    
    // Apply brightness filter
    ctx.filter = `brightness(${brightness[0]}%)`;
    
    // Draw flooring pattern on floor area
    ctx.fillStyle = pattern;
    ctx.fillRect(0, floorStartY, width, height - floorStartY);
    
    // Restore context
    ctx.restore();
    
    // Add subtle gradient at floor edge for more realistic blend
    ctx.save();
    const gradient = ctx.createLinearGradient(0, floorStartY - 50, 0, floorStartY + 50);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, floorStartY - 50, width, 100);
    ctx.restore();
  };

  const handleReset = () => {
    setRoomImage(null);
    setOpacity([70]);
    setBrightness([100]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `flooring-preview-${selectedFlooring.label.toLowerCase()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    
    toast({
      title: "Downloaded!",
      description: "Your flooring preview has been saved",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Flooring Visualizer</h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Room Photo</CardTitle>
                <CardDescription>
                  Upload your own photo or select from our sample rooms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="samples">Sample Rooms</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="space-y-4 mt-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="room-upload"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      variant="outline"
                      disabled={isProcessing}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isProcessing ? "Processing..." : "Choose Your Photo"}
                    </Button>
                    
                    {roomImage && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={handleReset}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Reset
                        </Button>
                        <Button
                          onClick={handleDownload}
                          variant="default"
                          size="sm"
                          className="flex-1"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="samples" className="space-y-4 mt-4">
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                      {roomCategories.map((category) => (
                        <Button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          className="text-xs"
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                    
                    {/* Sample Room Grid */}
                    <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                      {filteredSampleRooms.map((room) => (
                        <div
                          key={room.name}
                          onClick={() => handleSampleRoomSelect(room)}
                          className="cursor-pointer rounded-lg overflow-hidden border-2 border-border hover:border-accent transition-all group"
                        >
                          <div className="aspect-video relative">
                            <img
                              src={room.image}
                              alt={room.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-0 left-0 right-0 p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-xs font-semibold text-white">
                                {room.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {filteredSampleRooms.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No rooms in this category</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Flooring Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Flooring</CardTitle>
                <CardDescription>
                  Choose an LVP option to preview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {flooringOptions.map((option) => (
                    <div
                      key={option.name}
                      onClick={() => setSelectedFlooring(option)}
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedFlooring.name === option.name
                          ? 'border-accent ring-2 ring-accent'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <div className="aspect-square relative">
                        <img
                          src={option.image}
                          alt={option.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-center">
                          <p className="text-xs font-semibold text-white">
                            {option.label}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Adjustment Controls */}
            {roomImage && (
              <Card>
                <CardHeader>
                  <CardTitle>Adjust Appearance</CardTitle>
                  <CardDescription>
                    Fine-tune how the flooring looks in your room
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Opacity: {opacity[0]}%</Label>
                    <Slider
                      value={opacity}
                      onValueChange={setOpacity}
                      min={30}
                      max={100}
                      step={5}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Brightness: {brightness[0]}%</Label>
                    <Slider
                      value={brightness}
                      onValueChange={setBrightness}
                      min={50}
                      max={150}
                      step={5}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>
                      See how {selectedFlooring.label} looks in your room
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveDesign}
                      disabled={!roomImage || !flooringTexture}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                    {user && savedDesigns.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSavedDesigns(!showSavedDesigns)}
                        className="gap-2"
                      >
                        <FolderOpen className="h-4 w-4" />
                        My Designs
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      disabled={!roomImage || !flooringTexture}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-center min-h-[500px]">
                {!roomImage ? (
                  <div className="text-center space-y-4 text-muted-foreground">
                    <Upload className="h-16 w-16 mx-auto opacity-50" />
                    <p className="text-lg font-medium">No room photo selected</p>
                    <p className="text-sm">
                      Upload your own photo or try our sample rooms
                    </p>
                  </div>
                ) : (
                  <div className="w-full">
                    <canvas
                      ref={canvasRef}
                      className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                    />
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      Flooring preview is applied to the bottom portion of your image
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tips Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tips for Best Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span>Start with our sample rooms if you don't have a photo ready</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span>Use photos taken from eye level for more realistic results</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span>Ensure good lighting in your room photo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span>Try different opacity settings to match your room's lighting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span>Adjust brightness to compensate for room shadows</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span>Download your preview to share with family or contractors</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Saved Designs Section */}
        {showSavedDesigns && user && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>My Saved Designs</CardTitle>
              <CardDescription>
                View and manage your saved flooring visualizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDesigns ? (
                <p className="text-muted-foreground">Loading designs...</p>
              ) : savedDesigns.length === 0 ? (
                <p className="text-muted-foreground">No saved designs yet. Create and save your first design!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedDesigns.map((design) => (
                    <Card key={design.id} className="overflow-hidden">
                      <div className="aspect-video relative bg-muted">
                        <img
                          src={design.room_image_url}
                          alt={design.design_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{design.design_name}</h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          Flooring: {design.flooring_type}
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          {new Date(design.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLoadDesign(design)}
                            className="flex-1"
                          >
                            Load
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteConfirmId(design.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Save Design Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Design</DialogTitle>
            <DialogDescription>
              Give your design a name to save it to your account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="design-name">Design Name</Label>
              <Input
                id="design-name"
                placeholder="e.g., Kitchen Remodel - Cocoa"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSaveDesign} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Design"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Design</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this design? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirmId && handleDeleteDesign(deleteConfirmId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
