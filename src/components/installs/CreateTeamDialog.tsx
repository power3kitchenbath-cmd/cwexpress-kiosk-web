import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";

const teamSchema = z.object({
  team_name: z.string()
    .trim()
    .min(1, { message: "Team name is required" })
    .max(100, { message: "Team name must be less than 100 characters" }),
  specialty: z.enum(["general", "plumbing", "electrical", "flooring", "countertops", "painting"], {
    errorMap: () => ({ message: "Please select a specialty" }),
  }),
});

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateTeamDialog({ open, onOpenChange, onSuccess }: CreateTeamDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    team_name: "",
    specialty: "general",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate input
      const validatedData = teamSchema.parse(formData);

      const { error } = await supabase.from("install_teams").insert({
        team_name: validatedData.team_name,
        specialty: validatedData.specialty,
        is_active: true,
      });

      if (error) throw error;

      toast.success("Team created successfully");
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
        console.error("Error creating team:", error);
        toast.error("Failed to create team");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      team_name: "",
      specialty: "general",
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>Add a new installation team with a specialty</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="team_name">Team Name *</Label>
            <Input
              id="team_name"
              value={formData.team_name}
              onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
              placeholder="e.g., Alpha Plumbing Team"
              maxLength={100}
              className={errors.team_name ? "border-destructive" : ""}
            />
            {errors.team_name && (
              <p className="text-sm text-destructive mt-1">{errors.team_name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="specialty">Specialty *</Label>
            <Select
              value={formData.specialty}
              onValueChange={(value) => setFormData({ ...formData, specialty: value })}
            >
              <SelectTrigger className={errors.specialty ? "border-destructive" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="flooring">Flooring</SelectItem>
                <SelectItem value="countertops">Countertops</SelectItem>
                <SelectItem value="painting">Painting</SelectItem>
              </SelectContent>
            </Select>
            {errors.specialty && (
              <p className="text-sm text-destructive mt-1">{errors.specialty}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Team"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
