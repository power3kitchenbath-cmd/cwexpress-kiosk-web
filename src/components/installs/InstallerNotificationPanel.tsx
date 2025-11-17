import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useInstaller } from "@/contexts/InstallerContext";
import { useToast } from "@/hooks/use-toast";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { format } from "date-fns";

interface Notification {
  id: string;
  type: "new_assignment" | "project_update";
  title: string;
  message: string;
  projectId: string;
  timestamp: string;
  read: boolean;
}

export default function InstallerNotificationPanel() {
  const { teamId } = useInstaller();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!teamId) return;

    // Listen for new project assignments
    const assignmentsChannel = supabase
      .channel('installer-assignments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_assignments',
          filter: `team_id=eq.${teamId}`
        },
        async (payload) => {
          console.log('New assignment:', payload);
          
          // Fetch project details
          const { data: project } = await supabase
            .from('install_projects')
            .select('project_name')
            .eq('id', payload.new.project_id)
            .single();

          const notification: Notification = {
            id: payload.new.id,
            type: "new_assignment",
            title: "New Project Assigned",
            message: `You've been assigned to ${project?.project_name || 'a new project'}`,
            projectId: payload.new.project_id,
            timestamp: new Date().toISOString(),
            read: false
          };

          setNotifications(prev => [notification, ...prev]);
          
          toast({
            title: "New Project Assigned",
            description: notification.message,
          });
        }
      )
      .subscribe();

    // Listen for project updates
    const projectsChannel = supabase
      .channel('installer-projects')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'install_projects'
        },
        async (payload) => {
          console.log('Project updated:', payload);
          
          // Check if this project is assigned to the installer's team
          const { data: assignment } = await supabase
            .from('project_assignments')
            .select('id')
            .eq('project_id', payload.new.id)
            .eq('team_id', teamId)
            .single();

          if (assignment) {
            const notification: Notification = {
              id: `update-${payload.new.id}-${Date.now()}`,
              type: "project_update",
              title: "Project Updated",
              message: `${payload.new.project_name} has been updated`,
              projectId: payload.new.id,
              timestamp: new Date().toISOString(),
              read: false
            };

            setNotifications(prev => [notification, ...prev]);
            
            toast({
              title: "Project Updated",
              description: notification.message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(assignmentsChannel);
      supabase.removeChannel(projectsChannel);
    };
  }, [teamId, toast]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-primary-foreground">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className={`cursor-pointer transition-colors ${
                    notification.read ? 'bg-background' : 'bg-accent/5'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(notification.timestamp), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(notification.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
