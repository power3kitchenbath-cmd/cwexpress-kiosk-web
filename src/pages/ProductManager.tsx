import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Package, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  inventory_count: number;
  inventory_status: string;
  sku: string | null;
}

const ProductManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, price, inventory_count, inventory_status, sku')
        .order('category', { ascending: true });

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

  const updateInventory = async (productId: string, newCount: number) => {
    setSaving(productId);
    try {
      let newStatus = 'in_stock';
      if (newCount === 0) {
        newStatus = 'out_of_stock';
      } else if (newCount < 10) {
        newStatus = 'low_stock';
      }

      const { error } = await supabase
        .from('products')
        .update({ 
          inventory_count: newCount,
          inventory_status: newStatus 
        })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Inventory updated successfully",
      });

      fetchProducts();
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleInventoryChange = (productId: string, value: string) => {
    const count = parseInt(value) || 0;
    setProducts(products.map(p => 
      p.id === productId ? { ...p, inventory_count: count } : p
    ));
  };

  const getInventoryBadge = (status: string, count: number) => {
    if (status === 'out_of_stock' || count === 0) {
      return (
        <Badge variant="destructive" className="gap-1.5">
          <AlertCircle className="w-3 h-3" />
          Out of Stock
        </Badge>
      );
    }
    if (status === 'low_stock' || count < 10) {
      return (
        <Badge variant="secondary" className="gap-1.5 bg-orange-500 text-white">
          <AlertCircle className="w-3 h-3" />
          Low Stock
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="gap-1.5 bg-green-600">
        <Package className="w-3 h-3" />
        In Stock
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Product Inventory Manager</h1>
            <p className="text-muted-foreground mt-1">Update product inventory in real-time</p>
          </div>
          <Button variant="ghost" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground animate-pulse mb-4" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <Card key={product.id} className="p-6">
                <div className="grid md:grid-cols-[1fr_auto_auto] gap-4 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
                      {getInventoryBadge(product.inventory_status, product.inventory_count)}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Category: <span className="font-medium">{product.category}</span></span>
                      {product.sku && <span>SKU: <span className="font-medium">{product.sku}</span></span>}
                      <span>Price: <span className="font-medium">${product.price.toFixed(2)}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor={`inventory-${product.id}`} className="whitespace-nowrap">
                      Stock Count:
                    </Label>
                    <Input
                      id={`inventory-${product.id}`}
                      type="number"
                      min="0"
                      value={product.inventory_count}
                      onChange={(e) => handleInventoryChange(product.id, e.target.value)}
                      className="w-24"
                    />
                  </div>

                  <Button
                    onClick={() => updateInventory(product.id, product.inventory_count)}
                    disabled={saving === product.id}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving === product.id ? "Saving..." : "Update"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-8 p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-foreground mb-2">Real-Time Updates</h3>
          <p className="text-sm text-muted-foreground">
            Changes made here will be reflected immediately on the Online Shop page. Open both pages 
            side-by-side to see inventory updates in real-time!
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ProductManager;
