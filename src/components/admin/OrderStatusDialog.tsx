import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface OrderStatusDialogProps {
  orderId: string;
  currentStatus: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdated: () => void;
}

const statusOptions = [
  { value: "pending", label: "Pending", description: "Order received, awaiting processing" },
  { value: "processing", label: "Processing", description: "Order is being prepared" },
  { value: "shipped", label: "Shipped", description: "Order has been shipped" },
  { value: "delivered", label: "Delivered", description: "Order has been delivered" },
  { value: "cancelled", label: "Cancelled", description: "Order has been cancelled" },
];

export const OrderStatusDialog = ({
  orderId,
  currentStatus,
  open,
  onOpenChange,
  onStatusUpdated,
}: OrderStatusDialogProps) => {
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdateStatus = async () => {
    if (newStatus === currentStatus) {
      toast({
        title: "No change",
        description: "Please select a different status",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (updateError) throw updateError;

      // Record status change in history
      const { error: historyError } = await supabase
        .from("order_status_history")
        .insert({
          order_id: orderId,
          old_status: currentStatus,
          new_status: newStatus,
          changed_by: user.id,
          notes: notes.trim() || null,
        });

      if (historyError) throw historyError;

      toast({
        title: "Status updated",
        description: `Order status changed to ${newStatus}`,
      });

      onStatusUpdated();
      onOpenChange(false);
      setNotes("");
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update failed",
        description: "Could not update order status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Change the status of this order and add optional notes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Status</Label>
            <p className="text-sm text-muted-foreground capitalize">{currentStatus}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-status">New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger id="new-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this status change..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpdateStatus} disabled={loading || newStatus === currentStatus}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
