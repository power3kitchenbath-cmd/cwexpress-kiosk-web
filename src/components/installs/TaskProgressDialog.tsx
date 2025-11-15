import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";

const progressSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed", "blocked"]),
  actual_hours: z.string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), { message: "Invalid hours" }),
});

interface TaskProgressDialogProps {
  task: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TaskProgressDialog({ task, open, onOpenChange, onSuccess }: TaskProgressDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: task.status || "pending",
    actual_hours: task.actual_hours ? String(task.actual_hours) : "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      status: task.status || "pending",
      actual_hours: task.actual_hours ? String(task.actual_hours) : "",
    });
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate input
      const validatedData = progressSchema.parse(formData);

      const updateData: any = {
        status: validatedData.status,
        actual_hours: validatedData.actual_hours
          ? parseFloat(validatedData.actual_hours)
          : null,
      };

      // Set completed_date if status changed to completed
      if (validatedData.status === "completed" && task.status !== "completed") {
        updateData.completed_date = new Date().toISOString().split("T")[0];
      } else if (validatedData.status !== "completed") {
        updateData.completed_date = null;
      }

      const { error } = await supabase
        .from("project_tasks")
        .update(updateData)
        .eq("id", task.id);

      if (error) throw error;

      toast.success("Task progress updated");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error("Error updating progress:", error);
        toast.error("Failed to update task progress");
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (formData.status === "completed") return 100;
    if (formData.actual_hours && task.estimated_hours) {
      return Math.min(100, (parseFloat(formData.actual_hours) / task.estimated_hours) * 100);
    }
    return 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Task Progress</DialogTitle>
          <DialogDescription>{task.task_name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{task.task_type.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Priority:</span>
                <span className="font-medium capitalize">{task.priority}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Due Date:</span>
                <span className="font-medium">{format(new Date(task.due_date), "MMM dd, yyyy")}</span>
              </div>
              {task.estimated_hours && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Hours:</span>
                  <span className="font-medium">{task.estimated_hours}h</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className={errors.status ? "border-destructive" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-destructive mt-1">{errors.status}</p>}
          </div>

          <div>
            <Label htmlFor="actual_hours">Actual Hours Worked</Label>
            <Input
              id="actual_hours"
              type="number"
              min="0"
              step="0.5"
              value={formData.actual_hours}
              onChange={(e) => setFormData({ ...formData, actual_hours: e.target.value })}
              placeholder="0"
              className={errors.actual_hours ? "border-destructive" : ""}
            />
            {errors.actual_hours && (
              <p className="text-sm text-destructive mt-1">{errors.actual_hours}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Progress</Label>
            <Progress value={calculateProgress()} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              {Math.round(calculateProgress())}% Complete
            </p>
          </div>

          {formData.status === "completed" && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">
                Task will be marked as completed on {format(new Date(), "MMM dd, yyyy")}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Progress"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
