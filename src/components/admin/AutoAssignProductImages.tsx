import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Map model prefixes to their image filenames
const MODEL_IMAGE_MAP: Record<string, string> = {
  "DS01-": "ds01-66.jpg",
  "DS01": "ds01.jpg",
  "SS03": "ss03.jpg",
  "DS08": "ds08.jpg",
  "H07": "h07.jpg",
};

export const AutoAssignProductImages = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

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

  const handleAutoAssign = async () => {
    setIsProcessing(true);
    
    try {
      // Fetch all products
      const { data: products, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("category", "Shower Doors");

      if (fetchError) throw fetchError;
      if (!products || products.length === 0) {
        toast({
          title: "No Products Found",
          description: "No shower door products found to process.",
          variant: "destructive",
        });
        return;
      }

      let updatedCount = 0;
      let skippedCount = 0;

      // Process each product
      for (const product of products) {
        const modelPrefix = extractModelPrefix(product.name);
        
        if (!modelPrefix) {
          skippedCount++;
          continue;
        }

        const imageFilename = MODEL_IMAGE_MAP[modelPrefix];
        const imagePath = `/src/assets/shower-doors/${imageFilename}`;

        // Update product with image path
        const { error: updateError } = await supabase
          .from("products")
          .update({
            image_url: imagePath,
            thumbnail_url: imagePath,
          })
          .eq("id", product.id);

        if (updateError) {
          console.error(`Failed to update product ${product.name}:`, updateError);
          skippedCount++;
        } else {
          updatedCount++;
        }
      }

      toast({
        title: "Auto-Assignment Complete",
        description: `Successfully assigned images to ${updatedCount} products. ${skippedCount} products skipped.`,
      });

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
      <CardContent>
        <Button 
          onClick={handleAutoAssign} 
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Image className="mr-2 h-4 w-4" />
              Auto-Assign Images to Variants
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
