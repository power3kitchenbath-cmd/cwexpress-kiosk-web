import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, Mail, Phone, CheckCircle2, Clock, AlertCircle, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import logo from "@/assets/logo.png";

interface ProjectDetails {
  project_id: string;
  project_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  address: any;
  status: string;
  priority: string;
  services: any[];
  start_date: string;
  target_completion_date: string;
  actual_completion_date: string | null;
  notes: string | null;
}

interface Task {
  id: string;
  task_name: string;
  status: string;
  due_date: string;
  completed_date: string | null;
}

interface Photo {
  id: string;
  photo_url: string;
  photo_type: string;
  description: string | null;
  created_at: string;
}

export default function CustomerProjectTracking() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    if (token) {
      loadProjectData();
    }
  }, [token]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get project details using the secure token
      const { data: projectData, error: projectError } = await supabase
        .rpc("get_project_by_share_token", { token_param: token });

      if (projectError) throw projectError;
      
      if (!projectData || projectData.length === 0) {
        throw new Error("Project not found");
      }

      const projectInfo = projectData[0];
      setProject(projectInfo as ProjectDetails);

      // Load tasks for this project
      const { data: tasksData } = await supabase
        .from("project_tasks")
        .select("id, task_name, status, due_date, completed_date")
        .eq("project_id", projectInfo.project_id)
        .order("due_date");

      setTasks(tasksData || []);

      // Load photos for this project
      const { data: photosData } = await supabase
        .from("installation_photos")
        .select("id, photo_url, photo_type, description, created_at")
        .eq("project_id", projectInfo.project_id)
        .order("created_at", { ascending: false });

      if (photosData) {
        // Get signed URLs for photos
        const photosWithUrls = await Promise.all(
          photosData.map(async (photo) => {
            const { data } = await supabase.storage
              .from("installation-photos")
              .createSignedUrl(photo.photo_url, 3600);
            
            return {
              ...photo,
              photo_url: data?.signedUrl || photo.photo_url,
            };
          })
        );
        setPhotos(photosWithUrls);
      }
    } catch (err: any) {
      console.error("Error loading project:", err);
      setError(err.message || "Failed to load project. Please check your tracking link.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      scheduled: "bg-blue-500",
      in_progress: "bg-green-500",
      on_hold: "bg-orange-500",
      completed: "bg-gray-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    return Math.round((completedTasks / tasks.length) * 100);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Unable to Load Project</h2>
              <p className="text-muted-foreground mb-4">
                {error || "This tracking link may be invalid or expired."}
              </p>
              <p className="text-sm text-muted-foreground">
                Please contact us if you need assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Power3" className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-bold">Installation Tracking</h1>
              <p className="text-sm opacity-90">Monitor your project progress</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Project Overview */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl mb-2">{project.project_name}</CardTitle>
                <p className="text-muted-foreground">for {project.customer_name}</p>
              </div>
              <Badge className={`${getStatusColor(project.status)} text-white`}>
                {project.status.replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Contact & Schedule Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Contact Information</h3>
                {project.customer_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{project.customer_email}</span>
                  </div>
                )}
                {project.customer_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{project.customer_phone}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>
                    {project.address?.street}<br />
                    {project.address?.city}, {project.address?.state} {project.address?.zip}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Schedule</h3>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Start: </span>
                    <span className="font-medium">
                      {format(new Date(project.start_date), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Target: </span>
                    <span className="font-medium">
                      {format(new Date(project.target_completion_date), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
                {project.actual_completion_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <div>
                      <span className="text-muted-foreground">Completed: </span>
                      <span className="font-medium">
                        {format(new Date(project.actual_completion_date), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Services</h3>
              <div className="flex flex-wrap gap-2">
                {project.services?.map((service: string, idx: number) => (
                  <Badge key={idx} variant="secondary">
                    {service.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Progress */}
        {tasks.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Project Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(task.status)}
                      <div>
                        <p className="font-medium">{task.task_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {format(new Date(task.due_date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Installation Photos */}
        {photos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Installation Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group overflow-hidden rounded-lg border">
                    <img
                      src={photo.photo_url}
                      alt={photo.description || "Installation photo"}
                      className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={`${getPhotoTypeColor(photo.photo_type)} text-white`}>
                        {photo.photo_type}
                      </Badge>
                    </div>
                    {photo.description && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs">
                        {photo.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Note */}
        {project.notes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Project Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{project.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Questions about your installation? Contact us at {project.customer_email}</p>
          <p className="mt-2">© {new Date().getFullYear()} Power3. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
