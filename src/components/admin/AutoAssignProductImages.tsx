import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image, Eye, Check, Search, Filter, ListChecks, ArrowRight, Minus, Download, Package, TrendingUp, TrendingDown, Save, FolderOpen, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

// Map model prefixes to their image filenames
const MODEL_IMAGE_MAP: Record<string, string> = {
  "DS01-": "ds01-66.jpg",
  "DS01": "ds01.jpg",
  "SS03": "ss03.jpg",
  "DS08": "ds08.jpg",
  "H07": "h07.jpg",
};

interface PreviewItem {
  id: string;
  name: string;
  currentImage: string | null;
  proposedImage: string;
  modelPrefix: string;
}

interface SelectionPreset {
  name: string;
  selectedIds: string[];
  createdAt: string;
}

export const AutoAssignProductImages = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [changeFilter, setChangeFilter] = useState<string>("all");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentProcessingItem, setCurrentProcessingItem] = useState<string>("");
  const [savedPresets, setSavedPresets] = useState<SelectionPreset[]>([]);
  const [presetDialogOpen, setPresetDialogOpen] = useState(false);
  const [savePresetDialogOpen, setSavePresetDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const { toast } = useToast();

  // Load presets from localStorage on mount
  useState(() => {
    const stored = localStorage.getItem('productImagePresets');
    if (stored) {
      try {
        setSavedPresets(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load presets:', e);
      }
    }
  });

  const extractModelPrefix = (productName: string): string | null => {
    // Try to match model prefixes in order (DS01- before DS01 to avoid conflicts)
    const sortedPrefixes = Object.keys(MODEL_IMAGE_MAP).sort((a, b) => b.length - a.length);
    
    for (const prefix of sortedPrefixes) {
      if (productName.toUpperCase().includes(prefix)) {
        return prefix;
      }
    }
    return null;
  };

  const handlePreview = async () => {
    setIsProcessing(true);
    
    try {
      const { data: products, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("category", "Shower Doors");

      if (fetchError) throw fetchError;
      if (!products || products.length === 0) {
        toast({
          title: "No Products Found",
          description: "No shower door products found to preview.",
          variant: "destructive",
        });
        return;
      }

      const preview: PreviewItem[] = [];

      for (const product of products) {
        const modelPrefix = extractModelPrefix(product.name);
        
        if (modelPrefix) {
          const imageFilename = MODEL_IMAGE_MAP[modelPrefix];
          const imagePath = `/src/assets/shower-doors/${imageFilename}`;

          preview.push({
            id: product.id,
            name: product.name,
            currentImage: product.image_url,
            proposedImage: imagePath,
            modelPrefix,
          });
        }
      }

      setPreviewData(preview);
      setShowPreview(true);
      
      // Select all by default
      const allIds = new Set(preview.map(p => p.id));
      setSelectedIds(allIds);

      toast({
        title: "Preview Generated",
        description: `Found ${preview.length} products to update.`,
      });

    } catch (error) {
      console.error("Error generating preview:", error);
      toast({
        title: "Error",
        description: "Failed to generate preview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Get unique model prefixes for filter dropdown
  const uniqueModels = useMemo(() => {
    const models = new Set(previewData.map(item => item.modelPrefix));
    return Array.from(models).sort();
  }, [previewData]);

  // Filter preview data based on search and filters
  const filteredPreviewData = useMemo(() => {
    return previewData.filter(item => {
      // Search filter
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Model filter
      const matchesModel = modelFilter === "all" || item.modelPrefix === modelFilter;
      
      // Change filter
      const hasChange = item.currentImage !== item.proposedImage;
      const matchesChange = changeFilter === "all" || 
        (changeFilter === "changes" && hasChange) ||
        (changeFilter === "no-changes" && !hasChange);
      
      return matchesSearch && matchesModel && matchesChange;
    });
  }, [previewData, searchQuery, modelFilter, changeFilter]);

  // Check if all filtered items are selected
  const allFilteredSelected = useMemo(() => {
    return filteredPreviewData.length > 0 && 
      filteredPreviewData.every(item => selectedIds.has(item.id));
  }, [filteredPreviewData, selectedIds]);

  // Count of selected items from filtered list
  const selectedCount = useMemo(() => {
    return filteredPreviewData.filter(item => selectedIds.has(item.id)).length;
  }, [filteredPreviewData, selectedIds]);

  // Summary statistics
  const statistics = useMemo(() => {
    const totalProducts = filteredPreviewData.length;
    const productsWithChanges = filteredPreviewData.filter(
      item => item.currentImage !== item.proposedImage
    ).length;
    const productsWithoutChanges = totalProducts - productsWithChanges;
    
    return {
      totalProducts,
      productsWithChanges,
      productsWithoutChanges
    };
  }, [filteredPreviewData]);

  const handleToggleAll = () => {
    if (allFilteredSelected) {
      // Deselect all filtered items
      const newSelected = new Set(selectedIds);
      filteredPreviewData.forEach(item => newSelected.delete(item.id));
      setSelectedIds(newSelected);
    } else {
      // Select all filtered items
      const newSelected = new Set(selectedIds);
      filteredPreviewData.forEach(item => newSelected.add(item.id));
      setSelectedIds(newSelected);
    }
  };

  const handleToggleItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectWithChanges = () => {
    const newSelected = new Set(selectedIds);
    filteredPreviewData.forEach(item => {
      if (item.currentImage !== item.proposedImage) {
        newSelected.add(item.id);
      }
    });
    setSelectedIds(newSelected);
    
    const changesCount = filteredPreviewData.filter(
      item => item.currentImage !== item.proposedImage
    ).length;
    
    toast({
      title: "Selection Updated",
      description: `Selected ${changesCount} products with changes.`,
    });
  };

  const handleDeselectNoChanges = () => {
    const newSelected = new Set(selectedIds);
    filteredPreviewData.forEach(item => {
      if (item.currentImage === item.proposedImage) {
        newSelected.delete(item.id);
      }
    });
    setSelectedIds(newSelected);
    
    const noChangesCount = filteredPreviewData.filter(
      item => item.currentImage === item.proposedImage
    ).length;
    
    toast({
      title: "Selection Updated",
      description: `Deselected ${noChangesCount} products with no changes.`,
    });
  };

  const handleSelectAll = () => {
    const newSelected = new Set(selectedIds);
    filteredPreviewData.forEach(item => newSelected.add(item.id));
    setSelectedIds(newSelected);
  };

  const handleDeselectAll = () => {
    const newSelected = new Set(selectedIds);
    filteredPreviewData.forEach(item => newSelected.delete(item.id));
    setSelectedIds(newSelected);
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toast({
        title: "Preset Name Required",
        description: "Please enter a name for the preset.",
        variant: "destructive",
      });
      return;
    }

    const newPreset: SelectionPreset = {
      name: newPresetName.trim(),
      selectedIds: Array.from(selectedIds),
      createdAt: new Date().toISOString(),
    };

    const updatedPresets = [...savedPresets, newPreset];
    setSavedPresets(updatedPresets);
    localStorage.setItem('productImagePresets', JSON.stringify(updatedPresets));

    toast({
      title: "Preset Saved",
      description: `Saved "${newPresetName}" with ${selectedIds.size} selected products.`,
    });

    setNewPresetName("");
    setSavePresetDialogOpen(false);
  };

  const handleLoadPreset = (preset: SelectionPreset) => {
    const newSelected = new Set(preset.selectedIds);
    setSelectedIds(newSelected);
    
    const matchedCount = filteredPreviewData.filter(item => 
      newSelected.has(item.id)
    ).length;

    toast({
      title: "Preset Loaded",
      description: `Loaded "${preset.name}" - ${matchedCount} products selected from preset.`,
    });

    setPresetDialogOpen(false);
  };

  const handleDeletePreset = (presetName: string) => {
    const updatedPresets = savedPresets.filter(p => p.name !== presetName);
    setSavedPresets(updatedPresets);
    localStorage.setItem('productImagePresets', JSON.stringify(updatedPresets));

    toast({
      title: "Preset Deleted",
      description: `Deleted preset "${presetName}".`,
    });
  };

  const handleExportCSV = () => {
    // Prepare CSV content
    const headers = ['Product Name', 'Model Prefix', 'Current Image', 'Proposed Image', 'Status', 'Selected'];
    const rows = filteredPreviewData.map(item => {
      const hasChange = item.currentImage !== item.proposedImage;
      return [
        item.name,
        item.modelPrefix,
        item.currentImage || 'None',
        item.proposedImage,
        hasChange ? 'Will Change' : 'No Change',
        selectedIds.has(item.id) ? 'Yes' : 'No'
      ];
    });

    // Create CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];
    
    link.setAttribute('href', url);
    link.setAttribute('download', `product-image-assignments-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Exported",
      description: `Exported ${filteredPreviewData.length} products to CSV file.`,
    });
  };

  const handleAutoAssign = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setCurrentProcessingItem("");
    
    try {
      let updatedCount = 0;
      let skippedCount = 0;

      // Update only selected products
      const selectedItems = filteredPreviewData.filter(item => selectedIds.has(item.id));
      const totalItems = selectedItems.length;
      
      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];
        setCurrentProcessingItem(item.name);
        setProcessingProgress(Math.round(((i + 1) / totalItems) * 100));

        const { error: updateError } = await supabase
          .from("products")
          .update({
            image_url: item.proposedImage,
            thumbnail_url: item.proposedImage,
          })
          .eq("id", item.id);

        if (updateError) {
          console.error(`Failed to update product ${item.name}:`, updateError);
          skippedCount++;
        } else {
          updatedCount++;
        }
      }

      toast({
        title: "Auto-Assignment Complete",
        description: `Successfully assigned images to ${updatedCount} products. ${skippedCount} products skipped.`,
      });

      setShowPreview(false);
      setPreviewData([]);
      setSelectedIds(new Set());
      setSearchQuery("");
      setModelFilter("all");
      setChangeFilter("all");
      setProcessingProgress(0);
      setCurrentProcessingItem("");

    } catch (error) {
      console.error("Error auto-assigning images:", error);
      toast({
        title: "Error",
        description: "Failed to auto-assign images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Auto-Assign Product Images
        </CardTitle>
        <CardDescription>
          Automatically assign images to all product variants based on their model prefix.
          This will match DS01 products to ds01.jpg, SS03 to ss03.jpg, etc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showPreview ? (
          <Button 
            onClick={handlePreview} 
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Preview...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Preview Image Assignments
              </>
            )}
          </Button>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1 grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="search" className="text-sm font-medium flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Search Products
                    </Label>
                    <Input
                      id="search"
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="model-filter" className="text-sm font-medium flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filter by Model
                    </Label>
                    <Select value={modelFilter} onValueChange={setModelFilter}>
                      <SelectTrigger id="model-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Models</SelectItem>
                        {uniqueModels.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="change-filter" className="text-sm font-medium">
                      Filter by Status
                    </Label>
                    <Select value={changeFilter} onValueChange={setChangeFilter}>
                      <SelectTrigger id="change-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        <SelectItem value="changes">Will Change</SelectItem>
                        <SelectItem value="no-changes">No Changes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <ListChecks className="h-4 w-4" />
                        Bulk Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Selection Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSelectAll}>
                        Select All Filtered
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDeselectAll}>
                        Deselect All Filtered
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSelectWithChanges}>
                        Select All With Changes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDeselectNoChanges}>
                        Deselect All Without Changes
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={handleExportCSV}
                    disabled={filteredPreviewData.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>

                  {/* Save Preset Dialog */}
                  <Dialog open={savePresetDialogOpen} onOpenChange={setSavePresetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        disabled={selectedCount === 0}
                      >
                        <Save className="h-4 w-4" />
                        Save Preset
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-background">
                      <DialogHeader>
                        <DialogTitle>Save Selection Preset</DialogTitle>
                        <DialogDescription>
                          Save your current selection ({selectedCount} products) as a preset for quick access later.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="preset-name">Preset Name</Label>
                          <Input
                            id="preset-name"
                            placeholder="e.g., All DS01 Models"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSavePreset();
                              }
                            }}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSavePresetDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSavePreset}>
                          <Save className="mr-2 h-4 w-4" />
                          Save Preset
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Load Preset Dialog */}
                  <Dialog open={presetDialogOpen} onOpenChange={setPresetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        disabled={savedPresets.length === 0}
                      >
                        <FolderOpen className="h-4 w-4" />
                        Load Preset
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-background">
                      <DialogHeader>
                        <DialogTitle>Load Selection Preset</DialogTitle>
                        <DialogDescription>
                          Choose a saved preset to quickly select products.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2 py-4 max-h-[400px] overflow-y-auto">
                        {savedPresets.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No saved presets yet. Save your current selection to create one.
                          </p>
                        ) : (
                          savedPresets.map((preset) => (
                            <div
                              key={preset.name}
                              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{preset.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {preset.selectedIds.length} products • {new Date(preset.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleLoadPreset(preset)}
                                >
                                  Load
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeletePreset(preset.name)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {filteredPreviewData.length} of {previewData.length} products
                </span>
                <span className="font-medium text-foreground">
                  {selectedCount} selected
                </span>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                      <p className="text-2xl font-bold">{statistics.totalProducts}</p>
                    </div>
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Will Change</p>
                      <p className="text-2xl font-bold text-primary">{statistics.productsWithChanges}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">No Changes</p>
                      <p className="text-2xl font-bold text-muted-foreground">{statistics.productsWithoutChanges}</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Progress Indicator */}
            {isProcessing && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Processing updates...</span>
                      <span className="text-muted-foreground">{processingProgress}%</span>
                    </div>
                    <Progress value={processingProgress} className="h-2" />
                    {currentProcessingItem && (
                      <p className="text-sm text-muted-foreground truncate">
                        Currently updating: <span className="font-medium text-foreground">{currentProcessingItem}</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={handleToggleAll}
                        className="h-4 w-4 cursor-pointer"
                        disabled={filteredPreviewData.length === 0}
                      />
                    </TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Current Image</TableHead>
                    <TableHead>Proposed Image</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPreviewData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No products match your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPreviewData.map((item) => {
                      const hasChange = item.currentImage !== item.proposedImage;
                      return (
                        <TableRow key={item.id} className={hasChange ? "bg-primary/5" : ""}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item.id)}
                              onChange={() => handleToggleItem(item.id)}
                              className="h-4 w-4 cursor-pointer"
                            />
                          </TableCell>
                          <TableCell>
                            {hasChange ? (
                              <Badge variant="default" className="gap-1">
                                <ArrowRight className="h-3 w-3" />
                                Will Change
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <Minus className="h-3 w-3" />
                                No Change
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.modelPrefix}</Badge>
                          </TableCell>
                          <TableCell>
                            {item.currentImage ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-sm text-muted-foreground truncate max-w-[150px] block cursor-help hover:text-foreground transition-colors">
                                      {item.currentImage.split('/').pop()}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="p-0 border-0">
                                    <img 
                                      src={item.currentImage} 
                                      alt="Current product image"
                                      className="w-48 h-48 object-cover rounded-md shadow-lg"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement!.innerHTML = '<p class="p-4 text-sm text-muted-foreground">Image not found</p>';
                                      }}
                                    />
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="text-sm text-muted-foreground italic">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className={`text-sm font-medium cursor-help hover:underline transition-colors ${hasChange ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {item.proposedImage.split('/').pop()}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="p-0 border-0">
                                  <img 
                                    src={item.proposedImage} 
                                    alt="Proposed product image"
                                    className="w-48 h-48 object-cover rounded-md shadow-lg"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.parentElement!.innerHTML = '<p class="p-4 text-sm text-muted-foreground">Image not found</p>';
                                    }}
                                  />
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setShowPreview(false);
                  setPreviewData([]);
                  setSelectedIds(new Set());
                  setSearchQuery("");
                  setModelFilter("all");
                  setChangeFilter("all");
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAutoAssign} 
                disabled={isProcessing || selectedCount === 0}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Apply to {selectedCount} Selected {selectedCount === 1 ? 'Product' : 'Products'}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
