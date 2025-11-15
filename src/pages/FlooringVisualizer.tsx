import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Upload, RotateCcw, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import cocoaImg from "@/assets/flooring/lvp/cocoa.png";
import butternutImg from "@/assets/flooring/lvp/butternut.png";
import fogImg from "@/assets/flooring/lvp/fog.png";
import blondieImg from "@/assets/flooring/lvp/blondie.png";

interface FlooringOption {
  name: string;
  image: string;
  label: string;
}

const flooringOptions: FlooringOption[] = [
  { name: "LVP - Cocoa", image: cocoaImg, label: "COCOA" },
  { name: "LVP - Butternut", image: butternutImg, label: "BUTTERNUT" },
  { name: "LVP - Fog", image: fogImg, label: "FOG" },
  { name: "LVP - Blondie", image: blondieImg, label: "BLONDIE" },
];

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

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setRoomImage(img);
        setIsProcessing(false);
        toast({
          title: "Image loaded!",
          description: "Adjust the flooring settings to see how it looks in your room",
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
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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
                <CardTitle>Upload Room Photo</CardTitle>
                <CardDescription>
                  Upload a photo of your room to visualize different flooring options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  {isProcessing ? "Processing..." : "Choose Image"}
                </Button>
                
                {roomImage && (
                  <div className="flex gap-2">
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
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  See how {selectedFlooring.label} looks in your room
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center min-h-[500px]">
                {!roomImage ? (
                  <div className="text-center space-y-4 text-muted-foreground">
                    <Upload className="h-16 w-16 mx-auto opacity-50" />
                    <p className="text-lg font-medium">No room photo uploaded</p>
                    <p className="text-sm">
                      Upload a photo of your room to get started
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
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
