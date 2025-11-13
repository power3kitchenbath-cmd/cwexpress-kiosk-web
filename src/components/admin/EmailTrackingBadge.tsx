import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Mail, MailOpen, Eye, AlertTriangle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface EmailTrackingData {
  id: string;
  email_type: string;
  sent_at: string;
  opened_at: string | null;
  opened_count: number;
  status: string;
  failure_reason: string | null;
  bounce_type: string | null;
  failed_at: string | null;
  retry_count: number;
}

interface EmailTrackingBadgeProps {
  orderId: string;
}

export const EmailTrackingBadge = ({ orderId }: EmailTrackingBadgeProps) => {
  const [tracking, setTracking] = useState<EmailTrackingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracking();
    setupRealtimeSubscription();
  }, [orderId]);

  const fetchTracking = async () => {
    try {
      const { data, error } = await supabase
        .from("email_tracking")
        .select("*")
        .eq("order_id", orderId)
        .order("sent_at", { ascending: false });

      if (error) throw error;
      setTracking(data || []);
    } catch (error) {
      console.error("Error fetching email tracking:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`email-tracking-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "email_tracking",
          filter: `order_id=eq.${orderId}`,
        },
        () => {
          fetchTracking();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (loading) {
    return (
      <Badge variant="outline" className="gap-1">
        <Mail className="h-3 w-3" />
        Loading...
      </Badge>
    );
  }

  if (tracking.length === 0) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Mail className="h-3 w-3" />
        No emails sent
      </Badge>
    );
  }

  const latestTracking = tracking[0];
  const hasOpened = !!latestTracking.opened_at;
  const hasFailed = latestTracking.status === 'failed' || latestTracking.status === 'bounced';

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1">
        {tracking.map((item) => {
          const isOpened = !!item.opened_at;
          const isFailed = item.status === 'failed';
          const isBounced = item.status === 'bounced';
          const isDelivered = item.status === 'delivered';
          
          let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
          if (isOpened || isDelivered) variant = "default";
          if (isFailed || isBounced) variant = "destructive";

          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Badge
                  variant={variant}
                  className="gap-1 cursor-help"
                >
                  {isFailed && <XCircle className="h-3 w-3" />}
                  {isBounced && <AlertTriangle className="h-3 w-3" />}
                  {!isFailed && !isBounced && (isOpened ? (
                    <MailOpen className="h-3 w-3" />
                  ) : (
                    <Mail className="h-3 w-3" />
                  ))}
                  {item.email_type === "confirmation" && "Confirmation"}
                  {item.email_type === "manual" && "Manual"}
                  {item.email_type === "delivery" && "Delivery"}
                  {isOpened && item.opened_count > 1 && (
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-3 w-3" />
                      {item.opened_count}
                    </span>
                  )}
                  {item.retry_count > 0 && (
                    <span className="text-xs">({item.retry_count} retries)</span>
                  )}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs space-y-1 max-w-xs">
                  <div>
                    <strong>Status:</strong>{" "}
                    <span className={isFailed || isBounced ? "text-destructive" : ""}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <strong>Sent:</strong>{" "}
                    {format(new Date(item.sent_at), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                  {isOpened ? (
                    <>
                      <div>
                        <strong>Opened:</strong>{" "}
                        {format(new Date(item.opened_at!), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                      <div>
                        <strong>Opens:</strong> {item.opened_count}
                      </div>
                    </>
                  ) : !isFailed && !isBounced ? (
                    <div className="text-muted-foreground">Not opened yet</div>
                  ) : null}
                  {(isFailed || isBounced) && (
                    <>
                      {item.failed_at && (
                        <div>
                          <strong>Failed:</strong>{" "}
                          {format(new Date(item.failed_at), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      )}
                      {item.bounce_type && (
                        <div>
                          <strong>Bounce Type:</strong>{" "}
                          <span className="capitalize">{item.bounce_type}</span>
                        </div>
                      )}
                      {item.failure_reason && (
                        <div>
                          <strong>Reason:</strong>{" "}
                          <span className="text-xs break-words">{item.failure_reason}</span>
                        </div>
                      )}
                      {item.retry_count > 0 && (
                        <div>
                          <strong>Retries:</strong> {item.retry_count}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
