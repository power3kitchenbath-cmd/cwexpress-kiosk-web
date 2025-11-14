import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Upload, Pencil, Trash2, Plus, Images } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { compressImage, formatFileSize, shouldCompressImage, getOptimalFormat, getFormatName } from "@/utils/imageCompression";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image_url: string | null;
  inventory_count: number;
  inventory_status: string;
  sku: string | null;
}

interface BulkUploadItem {
  file: File;
  preview: string;
  matchedProductId: string | null;
  uploading: boolean;
  uploaded: boolean;
  error: string | null;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
}

export const ProductsManager = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Bulk upload states
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [bulkItems, setBulkItems] = useState<BulkUploadItem[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{ original: number; compressed: number } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setCompressing(true);
      
      // Compress image if needed
      let finalFile = file;
      let stats = null;
      
      if (shouldCompressImage(file)) {
        const optimalFormat = getOptimalFormat(file);
        const result = await compressImage(file, { outputFormat: optimalFormat });
        finalFile = result.file;
        stats = {
          original: result.originalSize,
          compressed: result.compressedSize
        };
        
        toast({
          title: "Image optimized",
          description: `Converted to ${getFormatName(optimalFormat)} • Reduced from ${formatFileSize(result.originalSize)} to ${formatFileSize(result.compressedSize)} (${result.compressionRatio.toFixed(1)}% savings)`,
        });
      }
      
      setSelectedFile(finalFile);
      setCompressionStats(stats);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(finalFile);
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
    } finally {
      setCompressing(false);
    }
  };

  const uploadImage = async (productId: string): Promise<string | null> => {
    if (!selectedFile) return null;

    try {
      setUploading(true);
      
      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${productId}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteOldImage = async (imageUrl: string | null) => {
    if (!imageUrl || !imageUrl.includes('product-images')) return;

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/product-images/');
      if (urlParts.length < 2) return;
      
      const filePath = urlParts[1];
      
      await supabase.storage
        .from('product-images')
        .remove([filePath]);
    } catch (error) {
      console.error('Error deleting old image:', error);
    }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;

    try {
      let newImageUrl = editingProduct.image_url;

      // Upload new image if selected
      if (selectedFile) {
        const uploadedUrl = await uploadImage(editingProduct.id);
        if (uploadedUrl) {
          // Delete old image if it exists
          await deleteOldImage(editingProduct.image_url);
          newImageUrl = uploadedUrl;
        }
      }

      // Update product
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          category: editingProduct.category,
          price: editingProduct.price,
          description: editingProduct.description,
          sku: editingProduct.sku,
          image_url: newImageUrl,
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      setIsDialogOpen(false);
      setEditingProduct(null);
      setSelectedFile(null);
      setImagePreview(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct({ ...product });
    setImagePreview(product.image_url);
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  // Auto-match image to product by filename
  const autoMatchProduct = (filename: string): string | null => {
    const nameLower = filename.toLowerCase();
    
    // Try to match by SKU first
    for (const product of products) {
      if (product.sku && nameLower.includes(product.sku.toLowerCase())) {
        return product.id;
      }
    }
    
    // Try to match by product name
    for (const product of products) {
      const productNameParts = product.name.toLowerCase().split(' ');
      if (productNameParts.some(part => part.length > 3 && nameLower.includes(part))) {
        return product.id;
      }
    }
    
    return null;
  };

  const handleBulkImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file",
          description: `${file.name} is not an image`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setCompressing(true);
    toast({
      title: "Compressing images...",
      description: `Processing ${validFiles.length} image(s)`,
    });

    try {
      const processedItems: BulkUploadItem[] = [];
      
      for (const file of validFiles) {
        let finalFile = file;
        let originalSize = file.size;
        let compressedSize = file.size;
        let compressionRatio = 0;
        
        // Compress if needed
        if (shouldCompressImage(file)) {
          try {
            const optimalFormat = getOptimalFormat(file);
            const result = await compressImage(file, { outputFormat: optimalFormat });
            finalFile = result.file;
            originalSize = result.originalSize;
            compressedSize = result.compressedSize;
            compressionRatio = result.compressionRatio;
          } catch (error) {
            console.error(`Error compressing ${file.name}:`, error);
            // Continue with original file if compression fails
          }
        }
        
        const preview = URL.createObjectURL(finalFile);
        const matchedProductId = autoMatchProduct(file.name);
        
        processedItems.push({
          file: finalFile,
          preview,
          matchedProductId,
          uploading: false,
          uploaded: false,
          error: null,
          originalSize,
          compressedSize,
          compressionRatio,
        });
      }

      setBulkItems(prev => [...prev, ...processedItems]);
      
      const totalOriginal = processedItems.reduce((sum, item) => sum + (item.originalSize || 0), 0);
      const totalCompressed = processedItems.reduce((sum, item) => sum + (item.compressedSize || 0), 0);
      const totalSavings = ((totalOriginal - totalCompressed) / totalOriginal) * 100;
      
      if (totalSavings > 0) {
        toast({
          title: "Compression complete",
          description: `Reduced total size from ${formatFileSize(totalOriginal)} to ${formatFileSize(totalCompressed)} (${totalSavings.toFixed(1)}% savings)`,
        });
      }
    } catch (error) {
      console.error('Error processing images:', error);
      toast({
        title: "Error",
        description: "Failed to process some images",
        variant: "destructive",
      });
    } finally {
      setCompressing(false);
    }
  };

  const updateBulkItemProduct = (index: number, productId: string) => {
    setBulkItems(prev => prev.map((item, i) => 
      i === index ? { ...item, matchedProductId: productId } : item
    ));
  };

  const removeBulkItem = (index: number) => {
    setBulkItems(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleBulkUpload = async () => {
    const itemsToUpload = bulkItems.filter(item => item.matchedProductId && !item.uploaded);
    
    if (itemsToUpload.length === 0) {
      toast({
        title: "No items to upload",
        description: "Please assign products to all images",
        variant: "destructive",
      });
      return;
    }

    setBulkUploading(true);

    for (let i = 0; i < bulkItems.length; i++) {
      const item = bulkItems[i];
      if (!item.matchedProductId || item.uploaded) continue;

      // Update item status to uploading
      setBulkItems(prev => prev.map((itm, idx) => 
        idx === i ? { ...itm, uploading: true } : itm
      ));

      try {
        // Get product
        const product = products.find(p => p.id === item.matchedProductId);
        if (!product) throw new Error("Product not found");

        // Upload image
        const fileExt = item.file.name.split('.').pop();
        const fileName = `${product.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, item.file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        // Delete old image if exists
        if (product.image_url && product.image_url.includes('product-images')) {
          const urlParts = product.image_url.split('/product-images/');
          if (urlParts.length >= 2) {
            await supabase.storage
              .from('product-images')
              .remove([urlParts[1]]);
          }
        }

        // Update product
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: publicUrl })
          .eq('id', product.id);

        if (updateError) throw updateError;

        // Mark as uploaded
        setBulkItems(prev => prev.map((itm, idx) => 
          idx === i ? { ...itm, uploading: false, uploaded: true } : itm
        ));

      } catch (error) {
        console.error('Error uploading image:', error);
        setBulkItems(prev => prev.map((itm, idx) => 
          idx === i ? { 
            ...itm, 
            uploading: false, 
            error: error instanceof Error ? error.message : 'Upload failed' 
          } : itm
        ));
      }
    }

    setBulkUploading(false);
    
    const successCount = bulkItems.filter(item => item.uploaded).length;
    toast({
      title: "Bulk upload complete",
      description: `Successfully uploaded ${successCount} image(s)`,
    });

    fetchProducts();
  };

  const closeBulkUpload = () => {
    bulkItems.forEach(item => URL.revokeObjectURL(item.preview));
    setBulkItems([]);
    setBulkUploadOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Product Management</h2>
          <p className="text-muted-foreground">Manage product images and details</p>
        </div>
        <Button onClick={() => setBulkUploadOpen(true)} className="gap-2">
          <Images className="w-4 h-4" />
          Bulk Upload Images
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-muted-foreground animate-pulse mb-4" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square bg-muted relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Stock: {product.inventory_count}
                  </span>
                </div>

                <Button
                  onClick={() => openEditDialog(product)}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Product
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>

          {editingProduct && (
            <div className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Product Image</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center space-y-3">
                  {compressing ? (
                    <div className="py-8">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2 animate-pulse" />
                      <p className="text-sm text-muted-foreground">Compressing image...</p>
                    </div>
                  ) : imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      {compressionStats && (
                        <Badge variant="secondary" className="mt-2">
                          Compressed: {formatFileSize(compressionStats.compressed)} 
                          {' '}(was {formatFileSize(compressionStats.original)})
                        </Badge>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setImagePreview(null);
                          setSelectedFile(null);
                          setCompressionStats(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, WEBP up to 10MB (optimized to WebP)
                      </p>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="cursor-pointer"
                    disabled={compressing}
                  />
                </div>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingProduct(null);
                    setSelectedFile(null);
                    setImagePreview(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveProduct} disabled={uploading}>
                  {uploading ? "Uploading..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkUploadOpen} onOpenChange={(open) => !bulkUploading && (open ? setBulkUploadOpen(true) : closeBulkUpload())}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Upload Product Images</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Upload Zone */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-3">
              <Upload className={`w-12 h-12 mx-auto text-muted-foreground ${compressing ? 'animate-pulse' : ''}`} />
              <div>
                <p className="text-sm font-medium">
                  {compressing ? 'Compressing images...' : 'Upload multiple product images'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {compressing 
                    ? 'Please wait while we optimize your images to WebP format'
                    : 'Images will be auto-converted to WebP and matched by SKU or product name'
                  }
                </p>
              </div>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleBulkImageSelect}
                disabled={bulkUploading || compressing}
                className="cursor-pointer"
              />
            </div>

            {/* Items List */}
            {bulkItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Images to Upload ({bulkItems.length})</h3>
                  {bulkUploading && (
                    <div className="text-sm text-muted-foreground">
                      {bulkItems.filter(i => i.uploaded).length} / {bulkItems.length} uploaded
                    </div>
                  )}
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {bulkItems.map((item, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex gap-3 items-start">
                        {/* Preview */}
                        <img
                          src={item.preview}
                          alt={item.file.name}
                          className="w-20 h-20 object-cover rounded"
                        />

                        {/* Details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.file.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(item.file.size)}
                                </p>
                                {item.compressionRatio && item.compressionRatio > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    -{item.compressionRatio.toFixed(0)}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {!item.uploading && !item.uploaded && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeBulkItem(index)}
                                disabled={bulkUploading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          {/* Product Selection */}
                          <Select
                            value={item.matchedProductId || ""}
                            onValueChange={(value) => updateBulkItemProduct(index, value)}
                            disabled={item.uploading || item.uploaded || bulkUploading}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select product..." />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} {product.sku && `(${product.sku})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Status */}
                          {item.uploading && (
                            <div className="space-y-1">
                              <Progress value={50} className="h-1" />
                              <p className="text-xs text-muted-foreground">Uploading...</p>
                            </div>
                          )}
                          {item.uploaded && (
                            <p className="text-xs text-green-600 font-medium">✓ Uploaded successfully</p>
                          )}
                          {item.error && (
                            <p className="text-xs text-destructive">{item.error}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={closeBulkUpload}
                disabled={bulkUploading}
              >
                {bulkItems.some(i => i.uploaded) ? 'Close' : 'Cancel'}
              </Button>
              <Button
                onClick={handleBulkUpload}
                disabled={bulkUploading || bulkItems.length === 0 || bulkItems.every(i => i.uploaded)}
              >
                {bulkUploading ? 'Uploading...' : `Upload ${bulkItems.filter(i => !i.uploaded && i.matchedProductId).length} Image(s)`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
