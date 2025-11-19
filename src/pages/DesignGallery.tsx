import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Grid3x3, List, Search, Upload, FolderOpen, CheckSquare, Square } from "lucide-react";
import { useDesignProjects } from "@/hooks/useDesignProjects";
import { DesignProjectCard } from "@/components/DesignProjectCard";
import { DesignGalleryDateFilter } from "@/components/DesignGalleryDateFilter";
import { DesignGalleryCabinetFilter } from "@/components/DesignGalleryCabinetFilter";
import { DesignGalleryExport } from "@/components/DesignGalleryExport";
import { DesignGalleryBulkActions } from "@/components/DesignGalleryBulkActions";
import { DesignGalleryDragDrop } from "@/components/DesignGalleryDragDrop";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";

export default function DesignGallery() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isUploading, validateFile, uploadFiles } = useFileUpload();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "project_name" | "cabinet_count">("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();
  const [cabinetCountMin, setCabinetCountMin] = useState<number | undefined>();
  const [cabinetCountMax, setCabinetCountMax] = useState<number | undefined>();
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<{ cabinet: File | null; drawing: File | null }>({
    cabinet: null,
    drawing: null,
  });
  const [projectName, setProjectName] = useState("");

  const { projects, isLoading, deleteProject, refetch } = useDesignProjects({
    searchQuery,
    sortBy,
    sortDirection,
    dateFrom,
    dateTo,
    cabinetCountMin,
    cabinetCountMax,
  });

  const handleDateChange = (from: string | undefined, to: string | undefined) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const handleCabinetRangeChange = (min: number | undefined, max: number | undefined) => {
    setCabinetCountMin(min);
    setCabinetCountMax(max);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedProjects(new Set());
    }
  };

  const toggleSelectAll = () => {
    if (selectedProjects.size === projects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(projects.map((p) => p.id)));
    }
  };

  const toggleSelectProject = (projectId: string) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjects(newSelected);
  };

  const handleBulkDelete = async () => {
    const projectsToDelete = Array.from(selectedProjects);
    let successCount = 0;
    let errorCount = 0;

    for (const projectId of projectsToDelete) {
      try {
        await deleteProject(projectId);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Error deleting project ${projectId}:`, error);
      }
    }

    setSelectedProjects(new Set());
    setSelectionMode(false);

    if (errorCount === 0) {
      toast({
        title: "Projects Deleted",
        description: `Successfully deleted ${successCount} ${successCount === 1 ? "project" : "projects"}.`,
      });
    } else {
      toast({
        title: "Partial Success",
        description: `Deleted ${successCount} projects. ${errorCount} failed.`,
        variant: "destructive",
      });
    }
  };

  const clearSelection = () => {
    setSelectedProjects(new Set());
    setSelectionMode(false);
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (
      e.clientX <= rect.left ||
      e.clientX >= rect.right ||
      e.clientY <= rect.top ||
      e.clientY >= rect.bottom
    ) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Categorize files
    let cabinetFile: File | null = null;
    let drawingFile: File | null = null;

    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      
      if (ext === "csv" || ext === "xlsx" || ext === "xls") {
        if (!cabinetFile && validateFile(file, "cabinet")) {
          cabinetFile = file;
        }
      } else if (ext === "pdf" || ext === "jpg" || ext === "jpeg" || ext === "png") {
        if (!drawingFile && validateFile(file, "drawing")) {
          drawingFile = file;
        }
      }
    }

    if (!cabinetFile && !drawingFile) {
      toast({
        title: "Invalid Files",
        description: "Please drop valid cabinet list (CSV/Excel) or drawing files (PDF/JPG/PNG).",
        variant: "destructive",
      });
      return;
    }

    setDroppedFiles({ cabinet: cabinetFile, drawing: drawingFile });
    setProjectName(`Design ${new Date().toLocaleDateString()}`);
    setShowNameDialog(true);
  };

  const handleUploadConfirm = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Project Name Required",
        description: "Please enter a name for your project.",
        variant: "destructive",
      });
      return;
    }

    try {
      await uploadFiles(
        {
          cabinetFile: droppedFiles.cabinet,
          drawingFile: droppedFiles.drawing,
        },
        projectName
      );

      setShowNameDialog(false);
      setDroppedFiles({ cabinet: null, drawing: null });
      setProjectName("");
      refetch();
    } catch (error) {
      // Error handled in useFileUpload
    }
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newDirection] = value.split("-") as [typeof sortBy, typeof sortDirection];
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <DesignGalleryDragDrop isDragging={isDragging} onFilesDropped={() => {}} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/estimates")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Estimates
          </Button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Design Gallery</h1>
              <p className="text-muted-foreground mt-1">
                {isLoading ? "Loading..." : `${projects.length} ${projects.length === 1 ? "project" : "projects"}`}
              </p>
            </div>
            <div className="flex gap-2">
              {selectionMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={toggleSelectAll}
                    className="gap-2"
                  >
                    {selectedProjects.size === projects.length ? (
                      <>
                        <CheckSquare className="h-4 w-4" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <Square className="h-4 w-4" />
                        Select All
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={toggleSelectionMode}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  {projects.length > 0 && (
                    <Button variant="outline" onClick={toggleSelectionMode}>
                      Select Projects
                    </Button>
                  )}
                  <DesignGalleryExport projects={projects} />
                  <Button onClick={() => navigate("/design-import")}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Design
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <Card className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Sort */}
                <Select
                  value={`${sortBy}-${sortDirection}`}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at-desc">Newest First</SelectItem>
                    <SelectItem value="created_at-asc">Oldest First</SelectItem>
                    <SelectItem value="project_name-asc">Name A-Z</SelectItem>
                    <SelectItem value="project_name-desc">Name Z-A</SelectItem>
                    <SelectItem value="cabinet_count-desc">Most Cabinets</SelectItem>
                    <SelectItem value="cabinet_count-asc">Least Cabinets</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex gap-1 border rounded-md p-1">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Filter by date:</span>
                  <DesignGalleryDateFilter onDateChange={handleDateChange} />
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Filter by cabinets:</span>
                  <DesignGalleryCabinetFilter onRangeChange={handleCabinetRangeChange} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="h-80 animate-pulse bg-muted" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Design Projects Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery
                ? `No projects found matching "${searchQuery}"`
                : "Get started by importing your first KCDW design project with cabinet lists and drawings."}
            </p>
            <Button onClick={() => navigate("/design-import")}>
              <Upload className="mr-2 h-4 w-4" />
              Import Your First Design
            </Button>
          </Card>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {projects.map((project) => (
              <DesignProjectCard
                key={project.id}
                project={project}
                onDelete={deleteProject}
                isSelected={selectedProjects.has(project.id)}
                onToggleSelect={toggleSelectProject}
                selectionMode={selectionMode}
              />
            ))}
          </div>
        )}

        {/* Floating Bulk Actions Bar */}
        <DesignGalleryBulkActions
          selectedCount={selectedProjects.size}
          onClearSelection={clearSelection}
          onBulkDelete={handleBulkDelete}
        />
      </div>

      {/* Project Name Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Name Your Design Project</DialogTitle>
            <DialogDescription>
              Give your uploaded design a meaningful name
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Kitchen Remodel 2024"
                autoFocus
              />
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium">Files to upload:</p>
              {droppedFiles.cabinet && (
                <p>✓ Cabinet List: {droppedFiles.cabinet.name}</p>
              )}
              {droppedFiles.drawing && (
                <p>✓ Design Drawing: {droppedFiles.drawing.name}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNameDialog(false);
                setDroppedFiles({ cabinet: null, drawing: null });
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={handleUploadConfirm} disabled={isUploading || !projectName.trim()}>
              {isUploading ? "Uploading..." : "Upload Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
