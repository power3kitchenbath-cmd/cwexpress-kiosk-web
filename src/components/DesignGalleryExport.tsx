import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import type { DesignProject } from "@/hooks/useDesignProjects";

interface DesignGalleryExportProps {
  projects: DesignProject[];
}

export function DesignGalleryExport({ projects }: DesignGalleryExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToCSV = () => {
    try {
      setIsExporting(true);

      // Prepare CSV headers
      const headers = ["Project Name", "Created Date", "Cabinet Count", "Has Cabinet List", "Has Drawing"];
      
      // Prepare CSV rows
      const rows = projects.map((project) => [
        project.project_name,
        format(new Date(project.created_at), "yyyy-MM-dd HH:mm"),
        Array.isArray(project.cabinet_data) ? project.cabinet_data.length : 0,
        project.cabinet_list_file ? "Yes" : "No",
        project.design_drawing_file ? "Yes" : "No",
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `design-projects-${format(new Date(), "yyyy-MM-dd")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `Exported ${projects.length} projects to CSV.`,
      });
    } catch (error) {
      console.error("CSV export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export projects to CSV.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.text("Design Projects Report", 14, 20);
      
      // Add metadata
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, 28);
      doc.text(`Total Projects: ${projects.length}`, 14, 33);
      
      const totalCabinets = projects.reduce((sum, p) => 
        sum + (Array.isArray(p.cabinet_data) ? p.cabinet_data.length : 0), 0
      );
      doc.text(`Total Cabinets: ${totalCabinets}`, 14, 38);

      // Add summary table
      const tableData = projects.map((project) => [
        project.project_name,
        format(new Date(project.created_at), "MMM d, yyyy"),
        Array.isArray(project.cabinet_data) ? project.cabinet_data.length : 0,
        project.cabinet_list_file ? "✓" : "✗",
        project.design_drawing_file ? "✓" : "✗",
      ]);

      autoTable(doc, {
        startY: 45,
        head: [["Project Name", "Created", "Cabinets", "List", "Drawing"]],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25, halign: "center" },
          3: { cellWidth: 20, halign: "center" },
          4: { cellWidth: 25, halign: "center" },
        },
        margin: { top: 45 },
      });

      // Add detailed project pages with thumbnails
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        doc.addPage();
        
        // Project header
        doc.setFontSize(16);
        doc.setTextColor(40);
        doc.text(project.project_name, 14, 20);
        
        // Project details
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Created: ${format(new Date(project.created_at), "PPP")}`, 14, 30);
        doc.text(`Last Updated: ${format(new Date(project.updated_at), "PPP")}`, 14, 36);
        
        const cabinetCount = Array.isArray(project.cabinet_data) ? project.cabinet_data.length : 0;
        doc.text(`Cabinet Count: ${cabinetCount}`, 14, 42);
        
        // File status
        doc.text("Files:", 14, 52);
        doc.text(project.cabinet_list_file ? "✓ Cabinet List" : "✗ Cabinet List", 20, 58);
        doc.text(project.design_drawing_file ? "✓ Design Drawing" : "✗ Design Drawing", 20, 64);

        // Add thumbnail if available
        if (project.design_drawing_file) {
          try {
            const { data } = await supabase.storage
              .from("design-files")
              .createSignedUrl(project.design_drawing_file, 60);
            
            if (data?.signedUrl) {
              // Fetch image as base64
              const response = await fetch(data.signedUrl);
              const blob = await response.blob();
              const reader = new FileReader();
              
              await new Promise<void>((resolve) => {
                reader.onloadend = () => {
                  const base64data = reader.result as string;
                  try {
                    // Add thumbnail image
                    doc.text("Design Preview:", 14, 74);
                    doc.addImage(base64data, "JPEG", 14, 78, 90, 90);
                  } catch (imgError) {
                    console.error("Error adding image to PDF:", imgError);
                  }
                  resolve();
                };
                reader.readAsDataURL(blob);
              });
            }
          } catch (error) {
            console.error("Error loading thumbnail for PDF:", error);
          }
        }

        // Cabinet details table if available
        if (Array.isArray(project.cabinet_data) && project.cabinet_data.length > 0) {
          const startY = project.design_drawing_file ? 175 : 74;
          
          doc.setFontSize(12);
          doc.setTextColor(40);
          doc.text("Cabinet List:", 14, startY);
          
          const cabinetTableData = project.cabinet_data.map((cabinet: any, idx: number) => [
            (idx + 1).toString(),
            cabinet.name || "N/A",
            cabinet.quantity?.toString() || "1",
          ]);

          autoTable(doc, {
            startY: startY + 5,
            head: [["#", "Cabinet Name", "Quantity"]],
            body: cabinetTableData,
            theme: "grid",
            headStyles: {
              fillColor: [59, 130, 246],
              textColor: [255, 255, 255],
            },
            columnStyles: {
              0: { cellWidth: 15, halign: "center" },
              1: { cellWidth: 120 },
              2: { cellWidth: 30, halign: "center" },
            },
          });
        }
      }

      // Save PDF
      doc.save(`design-projects-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);

      toast({
        title: "Export Successful",
        description: `Generated PDF report with ${projects.length} projects.`,
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF report.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (projects.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export to CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Export to PDF (with thumbnails)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
