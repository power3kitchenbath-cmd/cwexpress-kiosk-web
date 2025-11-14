import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Upload, Pencil, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

export const ProductsManager = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Product Management</h2>
          <p className="text-muted-foreground">Manage product images and details</p>
        </div>
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
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setImagePreview(null);
                          setSelectedFile(null);
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
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="cursor-pointer"
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
    </div>
  );
};
