import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, X, AlertTriangle, Info, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    setupRealtimeSubscription();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.read).length || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_notifications",
        },
        (payload) => {
          console.log("New notification:", payload);
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          
          // Show browser notification if supported
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification((payload.new as Notification).title, {
              body: (payload.new as Notification).message,
              icon: "/favicon.ico",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("admin_notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from("admin_notifications")
        .update({ read: true })
        .in("id", unreadIds);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("admin_notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      const wasUnread = notifications.find((n) => n.id === id)?.read === false;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-l-destructive bg-destructive/5";
      case "warning":
        return "border-l-yellow-600 bg-yellow-50 dark:bg-yellow-950/20";
      default:
        return "border-l-blue-600 bg-blue-50 dark:bg-blue-950/20";
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 border-l-4 transition-colors",
                    getSeverityClass(notification.severity),
                    !notification.read && "bg-muted/50"
                  )}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm">
                          {notification.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      {/* Special rendering for draft quote reminders */}
                      {notification.type === "draft_quote_reminder" && (notification.data?.vanity_quotes || notification.data?.kitchen_quotes) && (
                        <div className="mt-3 space-y-2">
                          {notification.data.vanity_quotes && notification.data.vanity_quotes.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-2">
                                Vanity Quotes:
                              </div>
                              {notification.data.vanity_quotes.map((quote: any) => (
                                <div
                                  key={quote.id}
                                  className="flex items-center justify-between p-2 bg-background/50 rounded border text-xs mb-1"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-3 w-3" />
                                    <div>
                                      <div className="font-medium">{quote.customer_name}</div>
                                      <div className="text-muted-foreground">{quote.customer_email}</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-accent">
                                      ${Number(quote.grand_total).toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                      })}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {quote.tier.charAt(0).toUpperCase() + quote.tier.slice(1)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {notification.data.kitchen_quotes && notification.data.kitchen_quotes.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-2 mt-3">
                                Kitchen Quotes:
                              </div>
                              {notification.data.kitchen_quotes.map((quote: any) => (
                                <div
                                  key={quote.id}
                                  className="flex items-center justify-between p-2 bg-background/50 rounded border text-xs mb-1"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-3 w-3" />
                                    <div>
                                      <div className="font-medium">{quote.customer_name}</div>
                                      <div className="text-muted-foreground">{quote.customer_email}</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-accent">
                                      ${Number(quote.grand_total).toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                      })}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {quote.tier.charAt(0).toUpperCase() + quote.tier.slice(1)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {format(
                            new Date(notification.created_at),
                            "MMM d, h:mm a"
                          )}
                        </span>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
