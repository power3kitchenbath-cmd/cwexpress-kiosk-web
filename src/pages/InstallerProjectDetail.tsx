import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Camera, CheckCircle2, Clock, MapPin, Phone, Mail, Upload } from "lucide-react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";

interface Project {
  id: string;
  project_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  address: any;
  status: string;
  priority: string;
  services: string[];
  start_date: string;
  target_completion_date: string;
  notes: string | null;
}

interface Task {
  id: string;
  task_name: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string;
  estimated_hours: number | null;
}

interface Photo {
  id: string;
  photo_url: string;
  photo_type: string;
  description: string | null;
  created_at: string;
}

export default function InstallerProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      // Load project
      const { data: projectData, error: projectError } = await supabase
        .from("install_projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData as any);

      // Load tasks
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const { data: teamMember } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("email", user.email)
        .single();

      if (teamMember) {
        const { data: tasksData } = await supabase
          .from("project_tasks")
          .select("*")
          .eq("project_id", projectId)
          .eq("assigned_to_team", teamMember.team_id)
          .order("due_date");

        setTasks(tasksData || []);
      }

      // Load photos
      const { data: photosData } = await supabase
        .from("installation_photos")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      setPhotos(photosData || []);
    } catch (error: any) {
      console.error("Error loading project:", error);
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("project_tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;

      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      
      toast({
        title: "Success",
        description: "Task status updated",
      });
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, photoType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload to storage
      const fileName = `${projectId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("installation-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("installation-photos")
        .getPublicUrl(fileName);

      // Create photo record
      const { error: insertError } = await supabase
        .from("installation_photos")
        .insert({
          project_id: projectId,
          uploaded_by: user.id,
          photo_url: publicUrl,
          photo_type: photoType,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });

      loadProjectData();
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-500";
      case "in_progress":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "blocked":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Project not found</p>
            <Button onClick={() => navigate("/installer")} className="mt-4">
              Back to Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary to-primary-dark pb-20">
      {/* Header */}
      <div className="bg-primary border-b border-primary-foreground/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/installer")}
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-primary-foreground">{project.project_name}</h1>
          <p className="text-sm text-primary-foreground/70">{project.customer_name}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-medium">{project.address?.street}</p>
                <p className="text-sm text-muted-foreground">
                  {project.address?.city}, {project.address?.state} {project.address?.zip}
                </p>
              </div>
            </div>

            {project.customer_email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${project.customer_email}`} className="text-sm text-primary hover:underline">
                  {project.customer_email}
                </a>
              </div>
            )}

            {project.customer_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${project.customer_phone}`} className="text-sm text-primary hover:underline">
                  {project.customer_phone}
                </a>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {format(new Date(project.start_date), "MMM d, yyyy")} - {format(new Date(project.target_completion_date), "MMM d, yyyy")}
              </span>
            </div>

            {project.notes && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-1">Notes:</p>
                <p className="text-sm text-muted-foreground">{project.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Update task status as you progress</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No tasks assigned yet</p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium">{task.task_name}</h4>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`task-${task.id}`} className="text-sm">Status:</Label>
                      <Select
                        value={task.status}
                        onValueChange={(value) => updateTaskStatus(task.id, value)}
                      >
                        <SelectTrigger id={`task-${task.id}`} className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photo Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Photos</CardTitle>
            <CardDescription>Document your work with photos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {["before", "progress", "after", "issue"].map((type) => (
                <div key={type}>
                  <input
                    type="file"
                    accept="image/*"
                    id={`photo-${type}`}
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, type)}
                    disabled={uploading}
                  />
                  <Label
                    htmlFor={`photo-${type}`}
                    className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <Camera className="h-6 w-6 mb-1 text-muted-foreground" />
                    <span className="text-xs font-medium capitalize">{type}</span>
                  </Label>
                </div>
              ))}
            </div>

            {/* Photo Gallery */}
            {photos.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Uploaded Photos</h4>
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.photo_url}
                        alt={photo.photo_type}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 rounded-b-lg">
                        <p className="capitalize">{photo.photo_type}</p>
                        <p className="text-[10px] opacity-70">
                          {format(new Date(photo.created_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
