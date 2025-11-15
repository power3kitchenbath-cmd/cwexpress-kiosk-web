import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Image as ImageIcon, Package, MoveRight, CheckSquare, Square } from "lucide-react";
import { ProgressiveImage } from "@/components/ui/progressive-image";

interface Product {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  thumbnail_url: string | null;
}

interface CategoryGroup {
  [category: string]: Product[];
}

export default function ImageOrganizer() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedProduct, setDraggedProduct] = useState<Product | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [bulkMoveCategory, setBulkMoveCategory] = useState<string>("");
  const [isBulkMoving, setIsBulkMoving] = useState(false);
  const { toast } = useToast();

  const categories = [
    "Shower Doors",
    "Cabinets",
    "Countertops",
    "Flooring",
    "Other"
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category, image_url, thumbnail_url")
        .order("category")
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const groupByCategory = (): CategoryGroup => {
    const grouped: CategoryGroup = {};
    categories.forEach(cat => {
      grouped[cat] = [];
    });

    products.forEach(product => {
      const category = product.category || "Other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(product);
    });

    return grouped;
  };

  const handleDragStart = (e: React.DragEvent, product: Product) => {
    setDraggedProduct(product);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.innerHTML);
  };

  const handleDragEnd = () => {
    setDraggedProduct(null);
    setDragOverCategory(null);
  };

  const handleDragOver = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCategory(category);
  };

  const handleDragLeave = () => {
    setDragOverCategory(null);
  };

  const handleDrop = async (e: React.DragEvent, targetCategory: string) => {
    e.preventDefault();
    setDragOverCategory(null);

    if (!draggedProduct || draggedProduct.category === targetCategory) {
      return;
    }

    try {
      const { error } = await supabase
        .from("products")
        .update({ category: targetCategory })
        .eq("id", draggedProduct.id);

      if (error) throw error;

      // Update local state
      setProducts(prev =>
        prev.map(p =>
          p.id === draggedProduct.id ? { ...p, category: targetCategory } : p
        )
      );

      toast({
        title: "Success",
        description: `Moved "${draggedProduct.name}" to ${targetCategory}`,
      });
    } catch (error) {
      console.error("Error updating product category:", error);
      toast({
        title: "Error",
        description: "Failed to move product",
        variant: "destructive",
      });
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(productId);
      } else {
        newSet.delete(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (category: string, checked: boolean) => {
    const categoryProducts = groupedProducts[category] || [];
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      categoryProducts.forEach(product => {
        if (checked) {
          newSet.add(product.id);
        } else {
          newSet.delete(product.id);
        }
      });
      return newSet;
    });
  };

  const handleBulkMove = async () => {
    if (selectedProducts.size === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select products to move",
        variant: "destructive",
      });
      return;
    }

    if (!bulkMoveCategory) {
      toast({
        title: "No Category Selected",
        description: "Please select a target category",
        variant: "destructive",
      });
      return;
    }

    setIsBulkMoving(true);

    try {
      const selectedIds = Array.from(selectedProducts);
      const { error } = await supabase
        .from("products")
        .update({ category: bulkMoveCategory })
        .in("id", selectedIds);

      if (error) throw error;

      // Update local state
      setProducts(prev =>
        prev.map(p =>
          selectedProducts.has(p.id) ? { ...p, category: bulkMoveCategory } : p
        )
      );

      toast({
        title: "Success",
        description: `Moved ${selectedProducts.size} product(s) to ${bulkMoveCategory}`,
      });

      // Clear selection
      setSelectedProducts(new Set());
      setBulkMoveCategory("");
    } catch (error) {
      console.error("Error bulk moving products:", error);
      toast({
        title: "Error",
        description: "Failed to move products",
        variant: "destructive",
      });
    } finally {
      setIsBulkMoving(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedProducts(new Set());
  };

  const groupedProducts = groupByCategory();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Image Organizer</h1>
          <p className="text-muted-foreground">
            Drag and drop product images between categories to organize your inventory
          </p>
        </div>

        {/* Bulk Selection Controls */}
        {selectedProducts.size > 0 && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">{selectedProducts.size} selected</span>
              </div>
              <Select value={bulkMoveCategory} onValueChange={setBulkMoveCategory}>
                <SelectTrigger className="w-[200px] bg-background">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleBulkMove} 
                disabled={isBulkMoving || !bulkMoveCategory}
                size="sm"
              >
                {isBulkMoving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MoveRight className="h-4 w-4 mr-2" />
                )}
                Move Selected
              </Button>
              <Button 
                onClick={handleClearSelection} 
                variant="outline"
                size="sm"
              >
                Clear Selection
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map(category => (
          <Card key={category}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">
                    {groupedProducts[category]?.length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">{category}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Sections */}
      <div className="space-y-6">
        {categories.map(category => (
          <Card
            key={category}
            className={`transition-all ${
              dragOverCategory === category
                ? "ring-2 ring-primary bg-primary/5"
                : ""
            }`}
            onDragOver={(e) => handleDragOver(e, category)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, category)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {category}
                    <Badge variant="secondary">
                      {groupedProducts[category]?.length || 0} items
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {dragOverCategory === category
                      ? "Drop here to move product to this category"
                      : "Drag products here to change their category"}
                  </CardDescription>
                </div>
                {groupedProducts[category]?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        groupedProducts[category]?.every(p => selectedProducts.has(p.id)) || false
                      }
                      onCheckedChange={(checked) => handleSelectAll(category, checked as boolean)}
                    />
                    <span className="text-sm text-muted-foreground">Select All</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {groupedProducts[category]?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                  <p>No products in this category</p>
                  <p className="text-sm">Drag products here to add them</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {groupedProducts[category]?.map(product => (
                    <div
                      key={product.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, product)}
                      onDragEnd={handleDragEnd}
                      className={`group relative cursor-move transition-all hover:scale-105 ${
                        draggedProduct?.id === product.id
                          ? "opacity-50 scale-95"
                          : ""
                      } ${
                        selectedProducts.has(product.id)
                          ? "ring-2 ring-primary ring-offset-2"
                          : ""
                      }`}
                    >
                      <Card className="overflow-hidden border-2 hover:border-primary transition-colors">
                        {/* Selection Checkbox */}
                        <div className="absolute top-2 left-2 z-10">
                          <Checkbox
                            checked={selectedProducts.has(product.id)}
                            onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                            className="bg-background border-2 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="aspect-square bg-muted relative">
                          {product.image_url || product.thumbnail_url ? (
                            <ProgressiveImage
                              src={product.image_url || product.thumbnail_url || ""}
                              thumbnailSrc={product.thumbnail_url || undefined}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              aspectRatio="aspect-square"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                              <p className="text-white text-xs font-medium truncate">
                                {product.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
