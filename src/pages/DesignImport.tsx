import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Image, ArrowLeft, Loader2 } from "lucide-react";

export default function DesignImport() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projectName, setProjectName] = useState("");
  const [cabinetFile, setCabinetFile] = useState<File | null>(null);
  const [drawingFile, setDrawingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleCabinetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // File size validation (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Cabinet list file must be under 10MB.",
          variant: "destructive",
        });
        return;
      }

      // Content-type validation
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (!validTypes.includes(file.type) && !file.name.endsWith(".csv")) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV or Excel file for the cabinet list.",
          variant: "destructive",
        });
        return;
      }

      setCabinetFile(file);
    }
  };

  const handleDrawingFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // File size validation (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Drawing file must be under 10MB.",
          variant: "destructive",
        });
        return;
      }

      // Content-type validation
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, JPG, or PNG file for the design drawing.",
          variant: "destructive",
        });
        return;
      }

      setDrawingFile(file);
    }
  };

  const parseCabinetList = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split("\n").filter((line) => line.trim());
          
          if (lines.length < 2) {
            reject(new Error("File must contain headers and at least one row"));
            return;
          }

          const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
          const nameIndex = headers.findIndex((h) => 
            h.includes("name") || h.includes("type") || h.includes("cabinet")
          );
          const qtyIndex = headers.findIndex((h) => 
            h.includes("qty") || h.includes("quantity") || h.includes("count")
          );

          if (nameIndex === -1) {
            reject(new Error("Could not find cabinet name/type column"));
            return;
          }

          const cabinets = lines.slice(1).map((line) => {
            const values = line.split(",").map((v) => v.trim());
            // Sanitize values to prevent CSV injection
            const sanitizeName = (val: string) => {
              // Remove leading special characters that could trigger CSV injection
              return val.replace(/^[=+\-@]/g, '').substring(0, 100);
            };
            return {
              name: sanitizeName(values[nameIndex] || "Unknown"),
              quantity: qtyIndex !== -1 ? Math.min(Math.max(parseInt(values[qtyIndex]) || 1, 1), 9999) : 1,
            };
          }).filter((cab) => cab.name && cab.name !== "Unknown");

          resolve(cabinets);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim()) {
      toast({
        title: "Project Name Required",
        description: "Please enter a project name.",
        variant: "destructive",
      });
      return;
    }

    if (!cabinetFile && !drawingFile) {
      toast({
        title: "No Files Selected",
        description: "Please upload at least one file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to upload designs.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      let cabinetListPath = null;
      let drawingPath = null;
      let cabinetData: any[] = [];

      // Parse and upload cabinet list
      if (cabinetFile) {
        cabinetData = await parseCabinetList(cabinetFile);
        const fileName = `${user.id}/${Date.now()}_${cabinetFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("design-files")
          .upload(fileName, cabinetFile);

        if (uploadError) throw uploadError;
        cabinetListPath = fileName;
      }

      // Upload drawing file
      if (drawingFile) {
        const fileName = `${user.id}/${Date.now()}_${drawingFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("design-files")
          .upload(fileName, drawingFile);

        if (uploadError) throw uploadError;
        drawingPath = fileName;
      }

      // Save project to database
      const { error: dbError } = await supabase.from("design_projects").insert({
        user_id: user.id,
        project_name: projectName,
        cabinet_list_file: cabinetListPath,
        design_drawing_file: drawingPath,
        cabinet_data: cabinetData,
      });

      if (dbError) throw dbError;

      toast({
        title: "Success!",
        description: "Design project uploaded successfully.",
      });

      // Navigate to estimator if cabinet data was uploaded
      if (cabinetData.length > 0) {
        navigate("/estimator", { state: { importedCabinets: cabinetData } });
      } else {
        navigate("/design-gallery");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload design files.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="max-w-2xl mx-auto p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Import KCDW Design
            </h1>
            <p className="text-muted-foreground">
              Upload your cabinet list and design drawings for automatic pricing and presentation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="cabinetFile">Cabinet List (CSV/Excel)</Label>
              <div className="mt-2 flex items-center gap-4">
                <Input
                  id="cabinetFile"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleCabinetFileChange}
                  className="cursor-pointer"
                />
                {cabinetFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {cabinetFile.name}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                CSV or Excel file with cabinet names and quantities
              </p>
            </div>

            <div>
              <Label htmlFor="drawingFile">Design Drawing (PDF/Image)</Label>
              <div className="mt-2 flex items-center gap-4">
                <Input
                  id="drawingFile"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDrawingFileChange}
                  className="cursor-pointer"
                />
                {drawingFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Image className="h-4 w-4" />
                    {drawingFile.name}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                PDF or image file of your kitchen/cabinet design
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Design
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}