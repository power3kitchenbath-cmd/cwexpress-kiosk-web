import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, User } from "lucide-react";
import { format } from "date-fns";

interface StatusHistoryEntry {
  id: string;
  old_status: string | null;
  new_status: string;
  notes: string | null;
  created_at: string;
  changed_by: string;
}

interface OrderStatusHistoryProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderStatusHistory = ({
  orderId,
  open,
  onOpenChange,
}: OrderStatusHistoryProps) => {
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && orderId) {
      fetchHistory();
    }
  }, [open, orderId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("order_status_history")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      processing: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Status History</DialogTitle>
          <DialogDescription>
            View all status changes for this order
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No status changes recorded</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div
                  key={entry.id}
                  className="border rounded-lg p-4 space-y-2 relative"
                >
                  {index === 0 && (
                    <Badge className="absolute top-2 right-2" variant="outline">
                      Current
                    </Badge>
                  )}

                  <div className="flex items-center gap-2">
                    {entry.old_status && (
                      <>
                        {getStatusBadge(entry.old_status)}
                        <span className="text-muted-foreground">→</span>
                      </>
                    )}
                    {getStatusBadge(entry.new_status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(entry.created_at), "MMM dd, yyyy 'at' h:mm a")}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Admin
                    </div>
                  </div>

                  {entry.notes && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm text-muted-foreground italic">
                        "{entry.notes}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
