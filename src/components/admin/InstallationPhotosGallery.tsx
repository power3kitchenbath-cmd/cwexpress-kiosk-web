import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Image as ImageIcon, Filter, Download } from "lucide-react";
import { format } from "date-fns";

interface InstallationPhoto {
  id: string;
  project_id: string;
  photo_url: string;
  photo_type: string;
  description: string | null;
  created_at: string;
  uploaded_by: string;
  project: {
    project_name: string;
    customer_name: string;
  };
}

export default function InstallationPhotosGallery() {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<InstallationPhoto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<InstallationPhoto[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; project_name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<InstallationPhoto | null>(null);
  
  // Filters
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedPhotoType, setSelectedPhotoType] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [photos, selectedProject, selectedPhotoType, startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("install_projects")
        .select("id, project_name")
        .order("project_name");

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Load photos with project details
      const { data: photosData, error: photosError } = await supabase
        .from("installation_photos")
        .select(`
          *,
          project:install_projects(project_name, customer_name)
        `)
        .order("created_at", { ascending: false });

      if (photosError) throw photosError;

      // Get signed URLs for photos
      const photosWithUrls = await Promise.all(
        (photosData || []).map(async (photo) => {
          const { data } = await supabase.storage
            .from("installation-photos")
            .createSignedUrl(photo.photo_url, 3600);
          
          return {
            ...photo,
            photo_url: data?.signedUrl || photo.photo_url,
          };
        })
      );

      setPhotos(photosWithUrls as any);
    } catch (error: any) {
      console.error("Error loading photos:", error);
      toast({
        title: "Error",
        description: "Failed to load installation photos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...photos];

    // Filter by project
    if (selectedProject !== "all") {
      filtered = filtered.filter((p) => p.project_id === selectedProject);
    }

    // Filter by photo type
    if (selectedPhotoType !== "all") {
      filtered = filtered.filter((p) => p.photo_type === selectedPhotoType);
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(
        (p) => new Date(p.created_at) >= new Date(startDate)
      );
    }
    if (endDate) {
      filtered = filtered.filter(
        (p) => new Date(p.created_at) <= new Date(endDate)
      );
    }

    setFilteredPhotos(filtered);
  };

  const resetFilters = () => {
    setSelectedProject("all");
    setSelectedPhotoType("all");
    setStartDate("");
    setEndDate("");
  };

  const downloadPhoto = async (photo: InstallationPhoto) => {
    try {
      const response = await fetch(photo.photo_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${photo.project.project_name}-${photo.photo_type}-${format(new Date(photo.created_at), "yyyy-MM-dd")}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Photo downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download photo",
        variant: "destructive",
      });
    }
  };

  const getPhotoTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      before: "bg-blue-500",
      progress: "bg-yellow-500",
      after: "bg-green-500",
      issue: "bg-red-500",
    };
    return colors[type] || "bg-gray-500";
  };

  // Group photos by project
  const groupedPhotos = filteredPhotos.reduce((acc, photo) => {
    const projectName = photo.project.project_name;
    if (!acc[projectName]) {
      acc[projectName] = [];
    }
    acc[projectName].push(photo);
    return acc;
  }, {} as Record<string, InstallationPhoto[]>);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Installation Photo Gallery
            </CardTitle>
            <Badge variant="secondary">{filteredPhotos.length} photos</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 p-4 bg-muted rounded-lg space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4" />
              <span className="font-semibold">Filters</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.project_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Photo Type</Label>
                <Select value={selectedPhotoType} onValueChange={setSelectedPhotoType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="before">Before</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="after">After</SelectItem>
                    <SelectItem value="issue">Issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <Button variant="outline" onClick={resetFilters} className="w-full">
              Reset Filters
            </Button>
          </div>

          {/* Photo Gallery */}
          <ScrollArea className="h-[600px]">
            {Object.keys(groupedPhotos).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No photos found</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedPhotos).map(([projectName, projectPhotos]) => (
                  <div key={projectName}>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      {projectName}
                      <Badge variant="secondary">{projectPhotos.length}</Badge>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {projectPhotos.map((photo) => (
                        <Card
                          key={photo.id}
                          className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <div className="relative aspect-square">
                            <img
                              src={photo.photo_url}
                              alt={photo.description || "Installation photo"}
                              className="w-full h-full object-cover"
                            />
                            <Badge
                              className={`absolute top-2 right-2 ${getPhotoTypeColor(
                                photo.photo_type
                              )}`}
                            >
                              {photo.photo_type}
                            </Badge>
                          </div>
                          <CardContent className="p-3">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(photo.created_at), "MMM d, yyyy")}
                            </p>
                            {photo.description && (
                              <p className="text-sm mt-1 line-clamp-2">
                                {photo.description}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Photo Detail Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Photo Details</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <img
                src={selectedPhoto.photo_url}
                alt={selectedPhoto.description || "Installation photo"}
                className="w-full rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Project</Label>
                  <p className="font-medium">{selectedPhoto.project.project_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Customer</Label>
                  <p className="font-medium">{selectedPhoto.project.customer_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Photo Type</Label>
                  <Badge className={getPhotoTypeColor(selectedPhoto.photo_type)}>
                    {selectedPhoto.photo_type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">
                    {format(new Date(selectedPhoto.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
              {selectedPhoto.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="font-medium">{selectedPhoto.description}</p>
                </div>
              )}
              <Button onClick={() => downloadPhoto(selectedPhoto)} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Photo
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
