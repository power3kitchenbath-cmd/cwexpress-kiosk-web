import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileText, Image as ImageIcon, MoreVertical, Eye, Download, Trash2, Calculator } from "lucide-react";
import { format } from "date-fns";
import type { DesignProject } from "@/hooks/useDesignProjects";
import { cn } from "@/lib/utils";

interface DesignProjectCardProps {
  project: DesignProject;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  selectionMode?: boolean;
}

export function DesignProjectCard({
  project,
  onDelete,
  isSelected = false,
  onToggleSelect,
  selectionMode = false,
}: DesignProjectCardProps) {
  const navigate = useNavigate();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadThumbnail();
  }, [project.design_drawing_file]);

  const loadThumbnail = async () => {
    if (!project.design_drawing_file) return;

    try {
      const { data, error } = await supabase.storage
        .from("design-files")
        .createSignedUrl(project.design_drawing_file, 3600);

      if (!error && data) {
        setThumbnailUrl(data.signedUrl);
      }
    } catch (error) {
      console.error("Error loading thumbnail:", error);
    }
  };

  const cabinetCount = project.cabinet_data?.length || 0;

  const handleView = () => {
    navigate(`/design/${project.id}`);
  };

  const handleLoadToEstimator = () => {
    if (cabinetCount > 0) {
      navigate("/estimator", { state: { importedCabinets: project.cabinet_data } });
    }
  };

  const handleDownload = async () => {
    if (project.design_drawing_file) {
      const { data } = await supabase.storage
        .from("design-files")
        .createSignedUrl(project.design_drawing_file, 60);
      
      if (data) {
        window.open(data.signedUrl, "_blank");
      }
    }
  };

  const handleDeleteConfirm = () => {
    onDelete(project.id);
    setShowDeleteDialog(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (selectionMode && onToggleSelect) {
      e.preventDefault();
      onToggleSelect(project.id);
    }
  };

  return (
    <>
      <Card
        className={cn(
          "group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
          selectionMode && "cursor-pointer",
          isSelected && "ring-2 ring-primary"
        )}
        onClick={handleCardClick}
      >
        {/* Selection Checkbox */}
        {selectionMode && (
          <div className="absolute top-4 left-4 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect?.(project.id)}
              className="h-5 w-5 bg-background border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Thumbnail */}
        <div className="relative h-48 bg-muted overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={project.project_name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          
          {/* File indicators overlay */}
          <div className="absolute top-2 right-2 flex gap-2">
            {project.cabinet_list_file && (
              <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                <FileText className="h-3 w-3 mr-1" />
                CSV
              </Badge>
            )}
            {project.design_drawing_file && (
              <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                <ImageIcon className="h-3 w-3 mr-1" />
                Drawing
              </Badge>
            )}
          </div>

          {/* Actions overlay - appears on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleView}
              className="shadow-lg"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {cabinetCount > 0 && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleLoadToEstimator}
                className="shadow-lg"
              >
                <Calculator className="h-4 w-4 mr-1" />
                Load
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-1 flex-1">
              {project.project_name}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {cabinetCount > 0 && (
                  <DropdownMenuItem onClick={handleLoadToEstimator}>
                    <Calculator className="h-4 w-4 mr-2" />
                    Load to Estimator
                  </DropdownMenuItem>
                )}
                {project.design_drawing_file && (
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Drawing
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{format(new Date(project.created_at), "MMM d, yyyy")}</span>
            {cabinetCount > 0 && (
              <Badge variant="outline" className="ml-auto">
                {cabinetCount} {cabinetCount === 1 ? "Cabinet" : "Cabinets"}
              </Badge>
            )}
          </div>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Design Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.project_name}"? This action cannot be
              undone and will permanently delete all associated files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
