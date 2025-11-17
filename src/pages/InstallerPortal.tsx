import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, CheckCircle2, AlertCircle, LogOut, User } from "lucide-react";
import { format } from "date-fns";
import InstallerNotificationPanel from "@/components/installs/InstallerNotificationPanel";

interface Assignment {
  id: string;
  project_id: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  notes: string | null;
  project: {
    id: string;
    project_name: string;
    customer_name: string;
    address: any;
    status: string;
    priority: string;
    services: string[];
  };
}

export default function InstallerPortal() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    checkAuth();
    loadAssignments();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user has installer role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    const hasInstallerRole = roles?.some(r => r.role === "installer");
    if (!hasInstallerRole) {
      toast({
        title: "Access Denied",
        description: "You don't have installer permissions",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setUserEmail(session.user.email || "");
  };

  const loadAssignments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      // Get team member record
      const { data: teamMember } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("email", user.email)
        .single();

      if (!teamMember) {
        setLoading(false);
        return;
      }

      // Get assignments for this team
      const { data, error } = await supabase
        .from("project_assignments")
        .select(`
          *,
          project:install_projects(*)
        `)
        .eq("team_id", teamMember.team_id)
        .order("scheduled_start", { ascending: true });

      if (error) throw error;
      
      setAssignments(data as any || []);
    } catch (error: any) {
      console.error("Error loading assignments:", error);
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500";
      case "in_progress":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      case "on_hold":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary to-primary-dark pb-20">
      {/* Header */}
      <div className="bg-primary border-b border-primary-foreground/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary-foreground">Installer Portal</h1>
                <p className="text-xs text-primary-foreground/70">{userEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <InstallerNotificationPanel />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {assignments.filter(a => a.status === "in_progress").length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {assignments.filter(a => a.status === "completed").length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-primary-foreground">My Projects</h2>
          
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No assignments yet</p>
              </CardContent>
            </Card>
          ) : (
            assignments.map((assignment) => (
              <Card
                key={assignment.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/installer/project/${assignment.project_id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {assignment.project?.project_name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {assignment.project?.customer_name}
                      </CardDescription>
                    </div>
                    <Badge className={getPriorityColor(assignment.project?.priority)}>
                      {assignment.project?.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${getStatusColor(assignment.status)}`} />
                    <span className="text-sm font-medium capitalize">
                      {assignment.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {assignment.project?.address?.street}, {assignment.project?.address?.city}, {assignment.project?.address?.state}
                    </span>
                  </div>

                  {/* Schedule */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(assignment.scheduled_start), "MMM d")}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(assignment.scheduled_end), "MMM d")}</span>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="flex flex-wrap gap-1">
                    {assignment.project?.services?.map((service: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {service.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
