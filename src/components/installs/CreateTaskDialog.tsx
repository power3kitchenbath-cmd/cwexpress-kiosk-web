import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";

const taskSchema = z.object({
  task_name: z.string()
    .trim()
    .min(1, { message: "Task name is required" })
    .max(200, { message: "Task name must be less than 200 characters" }),
  task_type: z.enum(["milestone", "inspection", "installation", "quality_check"], {
    errorMap: () => ({ message: "Please select a task type" }),
  }),
  description: z.string()
    .trim()
    .max(1000, { message: "Description must be less than 1000 characters" })
    .optional()
    .or(z.literal("")),
  priority: z.enum(["low", "medium", "high"], {
    errorMap: () => ({ message: "Please select a priority" }),
  }),
  due_date: z.string().min(1, { message: "Due date is required" }),
  estimated_hours: z.string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), { message: "Invalid estimated hours" }),
});

interface CreateTaskDialogProps {
  projectId: string;
  task?: any;
  existingTasks: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateTaskDialog({
  projectId,
  task,
  existingTasks,
  open,
  onOpenChange,
  onSuccess,
}: CreateTaskDialogProps) {
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    task_name: "",
    task_type: "installation",
    description: "",
    priority: "medium",
    due_date: "",
    estimated_hours: "",
    assigned_to_team: "",
    dependencies: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (task) {
      setFormData({
        task_name: task.task_name || "",
        task_type: task.task_type || "installation",
        description: task.description || "",
        priority: task.priority || "medium",
        due_date: task.due_date || "",
        estimated_hours: task.estimated_hours ? String(task.estimated_hours) : "",
        assigned_to_team: task.assigned_to_team || "",
        dependencies: task.dependencies || [],
      });
    } else {
      resetForm();
    }
  }, [task, open]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("install_teams")
        .select("id, team_name")
        .eq("is_active", true)
        .order("team_name");

      if (error) throw error;
      setTeams(data || []);
    } catch (error: any) {
      console.error("Error fetching teams:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate input
      const validatedData = taskSchema.parse(formData);

      const taskData = {
        project_id: projectId,
        task_name: validatedData.task_name,
        task_type: validatedData.task_type,
        description: validatedData.description || null,
        priority: validatedData.priority,
        due_date: validatedData.due_date,
        estimated_hours: validatedData.estimated_hours
          ? parseFloat(validatedData.estimated_hours)
          : null,
        assigned_to_team: formData.assigned_to_team || null,
        dependencies: formData.dependencies,
        status: task?.status || "pending",
      };

      if (task) {
        // Update existing task
        const { error } = await supabase
          .from("project_tasks")
          .update(taskData)
          .eq("id", task.id);

        if (error) throw error;
        toast.success("Task updated successfully");
      } else {
        // Create new task
        const { error } = await supabase.from("project_tasks").insert(taskData);

        if (error) throw error;
        toast.success("Task created successfully");
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
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
        console.error("Error saving task:", error);
        toast.error(`Failed to ${task ? "update" : "create"} task`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      task_name: "",
      task_type: "installation",
      description: "",
      priority: "medium",
      due_date: "",
      estimated_hours: "",
      assigned_to_team: "",
      dependencies: [],
    });
    setErrors({});
  };

  const toggleDependency = (taskId: string) => {
    setFormData((prev) => ({
      ...prev,
      dependencies: prev.dependencies.includes(taskId)
        ? prev.dependencies.filter((id) => id !== taskId)
        : [...prev.dependencies, taskId],
    }));
  };

  // Filter out current task from dependency list if editing
  const availableDependencies = existingTasks.filter((t) => t.id !== task?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit" : "Create"} Task</DialogTitle>
          <DialogDescription>
            {task ? "Update" : "Add a new"} task to the project timeline
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="task_name">Task Name *</Label>
              <Input
                id="task_name"
                value={formData.task_name}
                onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                placeholder="e.g., Install Kitchen Cabinets"
                maxLength={200}
                className={errors.task_name ? "border-destructive" : ""}
              />
              {errors.task_name && (
                <p className="text-sm text-destructive mt-1">{errors.task_name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="task_type">Task Type *</Label>
              <Select
                value={formData.task_type}
                onValueChange={(value) => setFormData({ ...formData, task_type: value })}
              >
                <SelectTrigger className={errors.task_type ? "border-destructive" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="quality_check">Quality Check</SelectItem>
                </SelectContent>
              </Select>
              {errors.task_type && (
                <p className="text-sm text-destructive mt-1">{errors.task_type}</p>
              )}
            </div>

            <div>
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className={errors.priority ? "border-destructive" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-destructive mt-1">{errors.priority}</p>
              )}
            </div>

            <div>
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className={errors.due_date ? "border-destructive" : ""}
              />
              {errors.due_date && (
                <p className="text-sm text-destructive mt-1">{errors.due_date}</p>
              )}
            </div>

            <div>
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                min="0"
                step="0.5"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                placeholder="8"
                className={errors.estimated_hours ? "border-destructive" : ""}
              />
              {errors.estimated_hours && (
                <p className="text-sm text-destructive mt-1">{errors.estimated_hours}</p>
              )}
            </div>

            <div className="col-span-2">
              <Label htmlFor="assigned_to_team">Assign to Team</Label>
              <Select
                value={formData.assigned_to_team}
                onValueChange={(value) => setFormData({ ...formData, assigned_to_team: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a team (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No team assigned</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.team_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the task..."
                rows={3}
                maxLength={1000}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>

            {availableDependencies.length > 0 && (
              <div className="col-span-2">
                <Label>Task Dependencies</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Select tasks that must be completed before this task can start
                </p>
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                  {availableDependencies.map((depTask) => (
                    <label
                      key={depTask.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.dependencies.includes(depTask.id)}
                        onChange={() => toggleDependency(depTask.id)}
                        className="rounded border-border"
                      />
                      <span className="text-sm">{depTask.task_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : task ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
