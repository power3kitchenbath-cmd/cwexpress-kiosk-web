import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UploadedFiles {
  cabinetFile: File | null;
  drawingFile: File | null;
}

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File, type: "cabinet" | "drawing"): boolean => {
    // File size validation (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: `${type === "cabinet" ? "Cabinet list" : "Drawing"} file must be under 10MB.`,
        variant: "destructive",
      });
      return false;
    }

    // Content-type validation
    if (type === "cabinet") {
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
        return false;
      }
    } else {
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, JPG, or PNG file for the design drawing.",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
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
            const sanitizeName = (val: string) => {
              if (val.startsWith("=") || val.startsWith("+") || val.startsWith("-") || val.startsWith("@")) {
                return val.substring(1);
              }
              return val;
            };

            return {
              name: sanitizeName(values[nameIndex] || ""),
              quantity: qtyIndex !== -1 ? parseInt(values[qtyIndex]) || 1 : 1,
            };
          });

          resolve(cabinets);
        } catch (error: any) {
          reject(new Error("Failed to parse cabinet list"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const uploadFiles = async (files: UploadedFiles, projectName: string) => {
    try {
      setIsUploading(true);

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("You must be logged in to upload designs");
      }

      let cabinetListPath = null;
      let drawingPath = null;
      let cabinetData: any[] = [];

      // Upload cabinet list if provided
      if (files.cabinetFile) {
        const fileExt = files.cabinetFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-cabinet-list.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("design-files")
          .upload(fileName, files.cabinetFile);

        if (uploadError) throw uploadError;
        cabinetListPath = fileName;

        // Parse cabinet data
        cabinetData = await parseCabinetList(files.cabinetFile);
      }

      // Upload drawing if provided
      if (files.drawingFile) {
        const fileExt = files.drawingFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-drawing.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("design-files")
          .upload(fileName, files.drawingFile);

        if (uploadError) throw uploadError;
        drawingPath = fileName;
      }

      // Save project to database
      const { data, error: dbError } = await supabase
        .from("design_projects")
        .insert({
          user_id: user.id,
          project_name: projectName,
          cabinet_list_file: cabinetListPath,
          design_drawing_file: drawingPath,
          cabinet_data: cabinetData,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "Upload Successful",
        description: "Design project has been created successfully.",
      });

      return data;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload design files.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    validateFile,
    parseCabinetList,
    uploadFiles,
  };
};
