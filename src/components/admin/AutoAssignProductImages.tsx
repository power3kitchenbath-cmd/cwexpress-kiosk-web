import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image, Eye, Check, Search, Filter, ListChecks, ArrowRight, Minus, Download, Package, TrendingUp, TrendingDown, Save, FolderOpen, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Maximize2, Keyboard, Upload, Undo } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

interface UndoState {
  products: Array<{
    id: string;
    name: string;
    previousImageUrl: string | null;
    previousThumbnailUrl: string | null;
  }>;
  timestamp: string;
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
  const [isDryRun, setIsDryRun] = useState(false);
  const [sortColumn, setSortColumn] = useState<'name' | 'model' | 'status' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [comparisonItem, setComparisonItem] = useState<PreviewItem | null>(null);
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  const [csvImportDialogOpen, setCsvImportDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState<string>("");
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const [isUndoing, setIsUndoing] = useState(false);
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

  // Keyboard shortcuts
  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when preview is shown and not processing
      if (!showPreview || isProcessing) return;

      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Ctrl/Cmd + A: Select all filtered
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        handleSelectAll();
      }

      // Ctrl/Cmd + D: Deselect all filtered
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleDeselectAll();
      }

      // Ctrl/Cmd + Shift + C: Select all with changes
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        handleSelectWithChanges();
      }

      // Enter: Apply changes (if items are selected)
      if (e.key === 'Enter' && selectedCount > 0) {
        e.preventDefault();
        handleAutoAssign();
      }

      // Escape: Cancel/close preview
      if (e.key === 'Escape' && !comparisonDialogOpen && !presetDialogOpen && !savePresetDialogOpen) {
        e.preventDefault();
        setShowPreview(false);
        setPreviewData([]);
        setSelectedIds(new Set());
        setSearchQuery("");
        setModelFilter("all");
        setChangeFilter("all");
        setIsDryRun(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  // Filter and sort preview data
  const filteredPreviewData = useMemo(() => {
    let filtered = previewData.filter(item => {
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

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let compareResult = 0;
        
        switch (sortColumn) {
          case 'name':
            compareResult = a.name.localeCompare(b.name);
            break;
          case 'model':
            compareResult = a.modelPrefix.localeCompare(b.modelPrefix);
            break;
          case 'status':
            const aHasChange = a.currentImage !== a.proposedImage;
            const bHasChange = b.currentImage !== b.proposedImage;
            compareResult = (aHasChange === bHasChange) ? 0 : aHasChange ? -1 : 1;
            break;
        }
        
        return sortDirection === 'asc' ? compareResult : -compareResult;
      });
    }

    return filtered;
  }, [previewData, searchQuery, modelFilter, changeFilter, sortColumn, sortDirection]);

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

  const handleSort = (column: 'name' | 'model' | 'status') => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortableHeader = ({ column, children }: { column: 'name' | 'model' | 'status', children: React.ReactNode }) => {
    const isActive = sortColumn === column;
    const Icon = isActive ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
    
    return (
      <button
        onClick={() => handleSort(column)}
        className="flex items-center gap-2 hover:text-foreground transition-colors font-medium"
      >
        {children}
        <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
      </button>
    );
  };

  const handleOpenComparison = (item: PreviewItem) => {
    setComparisonItem(item);
    setComparisonDialogOpen(true);
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setCsvError("Please upload a CSV file");
        setCsvFile(null);
        return;
      }
      setCsvFile(file);
      setCsvError("");
    }
  };

  const handleCsvImport = async () => {
    if (!csvFile) {
      setCsvError("Please select a CSV file");
      return;
    }

    setIsProcessing(true);
    setCsvError("");

    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setCsvError("CSV file must contain a header row and at least one data row");
        setIsProcessing(false);
        return;
      }

      // Parse header
      const header = lines[0].toLowerCase().split(',').map(h => h.trim());
      const idIndex = header.findIndex(h => h === 'id' || h === 'product_id');
      const imageIndex = header.findIndex(h => h === 'image' || h === 'image_url' || h === 'image_path');

      if (idIndex === -1 || imageIndex === -1) {
        setCsvError("CSV must contain 'id' (or 'product_id') and 'image' (or 'image_url') columns");
        setIsProcessing(false);
        return;
      }

      // Fetch all products
      const { data: products, error: fetchError } = await supabase
        .from("products")
        .select("*");

      if (fetchError) throw fetchError;

      // Parse data rows and match with products
      const preview: PreviewItem[] = [];
      const unmatchedIds: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        const productId = values[idIndex];
        const imagePath = values[imageIndex];

        if (!productId || !imagePath) continue;

        const product = products?.find(p => p.id === productId || p.sku === productId);
        
        if (product) {
          // Determine model prefix from product name
          const modelPrefix = extractModelPrefix(product.name) || 'UNKNOWN';
          
          preview.push({
            id: product.id,
            name: product.name,
            currentImage: product.image_url,
            proposedImage: imagePath,
            modelPrefix,
          });
        } else {
          unmatchedIds.push(productId);
        }
      }

      if (preview.length === 0) {
        setCsvError(`No matching products found. Unmatched IDs: ${unmatchedIds.join(', ')}`);
        setIsProcessing(false);
        return;
      }

      setPreviewData(preview);
      setShowPreview(true);
      
      // Select all by default
      const allIds = new Set(preview.map(p => p.id));
      setSelectedIds(allIds);

      setCsvImportDialogOpen(false);
      setCsvFile(null);

      toast({
        title: "CSV Import Successful",
        description: `Loaded ${preview.length} products from CSV. ${unmatchedIds.length > 0 ? `${unmatchedIds.length} IDs not found.` : ''}`,
      });

    } catch (error) {
      console.error("Error importing CSV:", error);
      setCsvError("Failed to parse CSV file. Please check the format.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUndo = async () => {
    if (!undoState) return;

    setIsUndoing(true);

    try {
      let restoredCount = 0;
      let failedCount = 0;

      for (const product of undoState.products) {
        const { error: updateError } = await supabase
          .from("products")
          .update({
            image_url: product.previousImageUrl,
            thumbnail_url: product.previousThumbnailUrl,
          })
          .eq("id", product.id);

        if (updateError) {
          console.error(`Failed to restore product ${product.name}:`, updateError);
          failedCount++;
        } else {
          restoredCount++;
        }
      }

      toast({
        title: "Undo Complete",
        description: `Restored ${restoredCount} products to their previous state. ${failedCount > 0 ? `${failedCount} failed.` : ''}`,
      });

      // Clear undo state after successful undo
      setUndoState(null);

    } catch (error) {
      console.error("Error during undo:", error);
      toast({
        title: "Undo Failed",
        description: "Failed to restore previous state. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUndoing(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      // Fetch a few sample products to include in the template
      const { data: sampleProducts, error } = await supabase
        .from("products")
        .select("id, name, sku")
        .eq("category", "Shower Doors")
        .limit(3);

      // Create CSV content
      const headers = ['id', 'image'];
      const rows = [
        ['product-id-or-sku', '/src/assets/shower-doors/ds01.jpg'],
        ['another-product-id', '/src/assets/shower-doors/ss03.jpg'],
      ];

      // Add real product examples if available
      if (sampleProducts && sampleProducts.length > 0) {
        rows.push(
          ...sampleProducts.map(p => [
            p.sku || p.id,
            '/src/assets/shower-doors/example.jpg'
          ])
        );
      }

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', 'product-image-assignment-template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Template Downloaded",
        description: "CSV template file has been downloaded. Edit it with your product data and re-upload.",
      });

    } catch (error) {
      console.error("Error generating template:", error);
      toast({
        title: "Download Failed",
        description: "Failed to generate template. Please try again.",
        variant: "destructive",
      });
    }
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
      
      if (isDryRun) {
        // Dry-run mode: simulate without database updates
        for (let i = 0; i < selectedItems.length; i++) {
          const item = selectedItems[i];
          setCurrentProcessingItem(item.name);
          setProcessingProgress(Math.round(((i + 1) / totalItems) * 100));
          
          // Simulate processing delay
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Count as success in dry-run
          updatedCount++;
        }

        toast({
          title: "Dry-Run Complete",
          description: `Simulation complete. Would update ${updatedCount} products without any errors. No actual changes were made.`,
        });
      } else {
        // Store undo state before making changes
        const undoData: UndoState = {
          products: selectedItems.map(item => ({
            id: item.id,
            name: item.name,
            previousImageUrl: item.currentImage,
            previousThumbnailUrl: item.currentImage,
          })),
          timestamp: new Date().toISOString(),
        };

        // Normal mode: actually update database
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

        // Save undo state only if updates were successful
        if (updatedCount > 0) {
          setUndoState(undoData);
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
      }
      
      setProcessingProgress(0);
      setCurrentProcessingItem("");

    } catch (error) {
      console.error("Error auto-assigning images:", error);
      toast({
        title: "Error",
        description: `Failed to ${isDryRun ? 'simulate' : 'auto-assign'} images. Please try again.`,
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
        {/* Undo Button */}
        {undoState && !showPreview && (
          <div className="rounded-lg border border-primary/50 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">Last Update Available to Undo</p>
                <p className="text-xs text-muted-foreground">
                  {undoState.products.length} products updated at {new Date(undoState.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleUndo}
                disabled={isUndoing}
                className="gap-2"
              >
                {isUndoing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Undoing...
                  </>
                ) : (
                  <>
                    <Undo className="h-4 w-4" />
                    Undo Last Update
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {!showPreview ? (
          <div className="space-y-3">
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* CSV Import Dialog */}
            <Dialog open={csvImportDialogOpen} onOpenChange={setCsvImportDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="w-full"
                  disabled={isProcessing}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import from CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background">
                <DialogHeader>
                  <DialogTitle>Import Image Assignments from CSV</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file with product IDs and image paths to bulk update assignments.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="csv-file">CSV File</Label>
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleCsvFileChange}
                      disabled={isProcessing}
                    />
                    {csvError && (
                      <p className="text-sm text-destructive">{csvError}</p>
                    )}
                  </div>
                  
                  <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                    <p className="text-sm font-medium">CSV Format Requirements:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Must include header row</li>
                      <li>Required columns: <code className="bg-muted px-1 rounded">id</code> (or <code className="bg-muted px-1 rounded">product_id</code>) and <code className="bg-muted px-1 rounded">image</code> (or <code className="bg-muted px-1 rounded">image_url</code>)</li>
                      <li>Product ID can be the database UUID or SKU</li>
                      <li>Image path should be relative to assets folder</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-mono text-muted-foreground mb-2">Example CSV:</p>
                    <pre className="text-xs font-mono">
{`id,image
abc-123-uuid,/src/assets/shower-doors/ds01.jpg
def-456-uuid,/src/assets/shower-doors/ss03.jpg`}
                    </pre>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    className="w-full gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download CSV Template
                  </Button>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCsvImportDialogOpen(false);
                      setCsvFile(null);
                      setCsvError("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCsvImport}
                    disabled={!csvFile || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Import CSV
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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
                <div className="flex items-center gap-4">
                  <span className="font-medium text-foreground">
                    {selectedCount} selected
                  </span>
                  
                  {/* Keyboard Shortcuts Help */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2 h-8">
                        <Keyboard className="h-4 w-4" />
                        Shortcuts
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-background" align="end">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold mb-2">Keyboard Shortcuts</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Use these shortcuts for faster workflow
                          </p>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Select all</span>
                            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+A</kbd>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Deselect all</span>
                            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+D</kbd>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Select with changes</span>
                            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+Shift+C</kbd>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Apply changes</span>
                            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Enter</kbd>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Cancel/Close</span>
                            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Esc</kbd>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
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
                    <TableHead className="w-24">
                      <SortableHeader column="status">Status</SortableHeader>
                    </TableHead>
                    <TableHead>
                      <SortableHeader column="name">Product Name</SortableHeader>
                    </TableHead>
                    <TableHead>
                      <SortableHeader column="model">Model</SortableHeader>
                    </TableHead>
                    <TableHead>Current Image</TableHead>
                    <TableHead>Proposed Image</TableHead>
                    <TableHead className="w-12"></TableHead>
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
                          <TableCell>
                            {hasChange && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleOpenComparison(item)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Maximize2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Compare images</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                <input
                  type="checkbox"
                  id="dry-run-mode"
                  checked={isDryRun}
                  onChange={(e) => setIsDryRun(e.target.checked)}
                  className="h-4 w-4 cursor-pointer"
                />
                <Label htmlFor="dry-run-mode" className="cursor-pointer font-normal flex-1">
                  <span className="font-medium">Dry-Run Mode</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    Simulate changes without updating the database
                  </span>
                </Label>
                {isDryRun && (
                  <Badge variant="secondary" className="gap-1">
                    <Eye className="h-3 w-3" />
                    Preview Only
                  </Badge>
                )}
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
                    setIsDryRun(false);
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
                  variant={isDryRun ? "secondary" : "default"}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isDryRun ? 'Simulating...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      {isDryRun ? (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Simulate {selectedCount} {selectedCount === 1 ? 'Update' : 'Updates'}
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Apply to {selectedCount} Selected {selectedCount === 1 ? 'Product' : 'Products'}
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Image Comparison Dialog */}
            <Dialog open={comparisonDialogOpen} onOpenChange={setComparisonDialogOpen}>
              <DialogContent className="bg-background max-w-5xl">
                <DialogHeader>
                  <DialogTitle>Image Comparison</DialogTitle>
                  <DialogDescription>
                    {comparisonItem?.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Current Image
                      </h3>
                      {comparisonItem?.currentImage && (
                        <Badge variant="secondary" className="text-xs">
                          {comparisonItem.currentImage.split('/').pop()}
                        </Badge>
                      )}
                    </div>
                    <div className="rounded-lg border overflow-hidden bg-muted/30 aspect-square flex items-center justify-center">
                      {comparisonItem?.currentImage ? (
                        <img
                          src={comparisonItem.currentImage}
                          alt="Current product image"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<p class="text-sm text-muted-foreground">Image not found</p>';
                            }
                          }}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No current image</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
                        Proposed Image
                      </h3>
                      <Badge variant="default" className="text-xs">
                        {comparisonItem?.proposedImage.split('/').pop()}
                      </Badge>
                    </div>
                    <div className="rounded-lg border border-primary/50 overflow-hidden bg-primary/5 aspect-square flex items-center justify-center">
                      {comparisonItem?.proposedImage && (
                        <img
                          src={comparisonItem.proposedImage}
                          alt="Proposed product image"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<p class="text-sm text-muted-foreground">Image not found</p>';
                            }
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setComparisonDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
};
