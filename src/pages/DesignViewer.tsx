import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Loader2 } from "lucide-react";

interface DesignProject {
  id: string;
  project_name: string;
  cabinet_list_file: string | null;
  design_drawing_file: string | null;
  cabinet_data: any[];
  created_at: string;
}

export default function DesignViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<DesignProject | null>(null);
  const [drawingUrl, setDrawingUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDesign();
  }, [id]);

  const fetchDesign = async () => {
    try {
      const { data, error } = await supabase
        .from("design_projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setProject(data as DesignProject);

      // Get signed URL for drawing if it exists (expires in 1 hour)
      if (data.design_drawing_file) {
        const { data: urlData, error: urlError } = await supabase.storage
          .from("design-files")
          .createSignedUrl(data.design_drawing_file, 3600);
        
        if (!urlError && urlData) {
          setDrawingUrl(urlData.signedUrl);
        }
      }
    } catch (error: any) {
      console.error("Error fetching design:", error);
      toast({
        title: "Error",
        description: "Failed to load design project.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadToEstimator = () => {
    if (project?.cabinet_data && project.cabinet_data.length > 0) {
      navigate("/estimator", { state: { importedCabinets: project.cabinet_data } });
    } else {
      toast({
        title: "No Cabinet Data",
        description: "This project doesn't have cabinet data to load.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadDrawing = () => {
    if (drawingUrl) {
      window.open(drawingUrl, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Design Not Found</h2>
          <Button onClick={() => navigate("/estimates")}>
            Back to Estimates
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/estimates")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Estimates
        </Button>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {project.project_name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                {project.cabinet_data.length > 0 && (
                  <Button onClick={handleLoadToEstimator} variant="kiosk">
                    Load to Estimator
                  </Button>
                )}
                {drawingUrl && (
                  <Button onClick={handleDownloadDrawing} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Drawing
                  </Button>
                )}
              </div>
            </div>

            {project.cabinet_data.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Cabinet List</h2>
                <div className="grid gap-2">
                  {project.cabinet_data.map((cabinet: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-muted rounded-lg"
                    >
                      <span className="font-medium">{cabinet.name}</span>
                      <span className="text-muted-foreground">
                        Qty: {cabinet.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {drawingUrl && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Design Drawing</h2>
              <div className="bg-muted rounded-lg overflow-hidden">
                {project.design_drawing_file?.endsWith(".pdf") ? (
                  <iframe
                    src={drawingUrl}
                    className="w-full h-[800px]"
                    title="Design Drawing"
                  />
                ) : (
                  <img
                    src={drawingUrl}
                    alt="Design Drawing"
                    className="w-full h-auto"
                  />
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}