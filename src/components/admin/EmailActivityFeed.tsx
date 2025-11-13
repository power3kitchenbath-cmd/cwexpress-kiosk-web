import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Mail, MailOpen, XCircle, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface EmailEvent {
  id: string;
  order_id: string;
  email_type: string;
  recipient_email: string;
  status: string;
  sent_at: string;
  opened_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
  bounce_type: string | null;
}

export const EmailActivityFeed = () => {
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    setupRealtimeSubscription();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("email_tracking")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching email events:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("email_activity_feed")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "email_tracking",
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getEventIcon = (event: EmailEvent) => {
    if (event.status === "failed" || event.status === "bounced") {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    if (event.opened_at) {
      return <MailOpen className="h-4 w-4 text-green-500" />;
    }
    return <Mail className="h-4 w-4 text-primary" />;
  };

  const getStatusBadge = (event: EmailEvent) => {
    if (event.status === "failed") {
      return <Badge variant="destructive">Failed</Badge>;
    }
    if (event.status === "bounced") {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Bounced
        </Badge>
      );
    }
    if (event.opened_at) {
      return <Badge className="bg-green-500">Opened</Badge>;
    }
    return <Badge variant="secondary">Sent</Badge>;
  };

  const getEmailTypeLabel = (type: string) => {
    switch (type) {
      case "confirmation":
        return "Order Confirmation";
      case "delivery":
        return "Delivery Notification";
      case "manual":
        return "Manual Receipt";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Activity Feed</CardTitle>
          <CardDescription>Loading recent email events...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Activity Feed</CardTitle>
        <CardDescription>
          Real-time feed of recent email events across all orders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No email events yet
              </p>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-1">{getEventIcon(event)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(event)}
                      <span className="text-sm font-medium">
                        {getEmailTypeLabel(event.email_type)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      To: <span className="font-mono">{event.recipient_email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Order: {event.order_id.slice(0, 8)}...</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(event.sent_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {event.failure_reason && (
                      <div className="text-xs text-destructive mt-1">
                        {event.failure_reason}
                      </div>
                    )}
                    {event.bounce_type && (
                      <div className="text-xs text-destructive mt-1">
                        Bounce type: {event.bounce_type}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
