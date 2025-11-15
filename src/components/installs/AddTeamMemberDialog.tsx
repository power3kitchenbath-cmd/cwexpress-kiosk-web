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

const memberSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  phone: z.string()
    .trim()
    .max(20, { message: "Phone number must be less than 20 characters" })
    .regex(/^[0-9\s\-\+\(\)]*$/, { message: "Invalid phone number format" })
    .optional()
    .or(z.literal("")),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" })
    .optional()
    .or(z.literal("")),
  specialty: z.string()
    .trim()
    .min(1, { message: "Specialty is required" })
    .max(100, { message: "Specialty must be less than 100 characters" }),
  hourly_rate: z.string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), { message: "Invalid hourly rate" }),
  certification_level: z.enum(["apprentice", "journeyman", "master"], {
    errorMap: () => ({ message: "Please select a certification level" }),
  }),
  hire_date: z.string().min(1, { message: "Hire date is required" }),
  notes: z.string()
    .trim()
    .max(1000, { message: "Notes must be less than 1000 characters" })
    .optional()
    .or(z.literal("")),
});

interface AddTeamMemberDialogProps {
  teamId: string;
  member?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddTeamMemberDialog({
  teamId,
  member,
  open,
  onOpenChange,
  onSuccess,
}: AddTeamMemberDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    specialty: "",
    hourly_rate: "",
    certification_level: "journeyman",
    hire_date: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || "",
        phone: member.phone || "",
        email: member.email || "",
        specialty: member.specialty || "",
        hourly_rate: member.hourly_rate ? String(member.hourly_rate) : "",
        certification_level: member.certification_level || "journeyman",
        hire_date: member.hire_date || "",
        notes: member.notes || "",
      });
    } else {
      resetForm();
    }
  }, [member, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate input
      const validatedData = memberSchema.parse(formData);

      const memberData = {
        team_id: teamId,
        name: validatedData.name,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        specialty: validatedData.specialty,
        hourly_rate: validatedData.hourly_rate ? parseFloat(validatedData.hourly_rate) : null,
        certification_level: validatedData.certification_level,
        hire_date: validatedData.hire_date,
        notes: validatedData.notes || null,
        is_active: true,
      };

      if (member) {
        // Update existing member
        const { error } = await supabase
          .from("team_members")
          .update(memberData)
          .eq("id", member.id);

        if (error) throw error;
        toast.success("Team member updated successfully");
      } else {
        // Create new member
        const { error } = await supabase.from("team_members").insert(memberData);

        if (error) throw error;
        toast.success("Team member added successfully");
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
        console.error("Error saving member:", error);
        toast.error(`Failed to ${member ? "update" : "add"} team member`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      specialty: "",
      hourly_rate: "",
      certification_level: "journeyman",
      hire_date: "",
      notes: "",
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{member ? "Edit" : "Add"} Team Member</DialogTitle>
          <DialogDescription>
            {member ? "Update" : "Add"} team member information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                maxLength={100}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                maxLength={20}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                maxLength={255}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="specialty">Specialty *</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="e.g., Kitchen Cabinets, Tile Work"
                maxLength={100}
                className={errors.specialty ? "border-destructive" : ""}
              />
              {errors.specialty && (
                <p className="text-sm text-destructive mt-1">{errors.specialty}</p>
              )}
            </div>

            <div>
              <Label htmlFor="certification_level">Certification Level *</Label>
              <Select
                value={formData.certification_level}
                onValueChange={(value) =>
                  setFormData({ ...formData, certification_level: value })
                }
              >
                <SelectTrigger className={errors.certification_level ? "border-destructive" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apprentice">Apprentice</SelectItem>
                  <SelectItem value="journeyman">Journeyman</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                </SelectContent>
              </Select>
              {errors.certification_level && (
                <p className="text-sm text-destructive mt-1">{errors.certification_level}</p>
              )}
            </div>

            <div>
              <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
              <Input
                id="hourly_rate"
                type="number"
                min="0"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                placeholder="35.00"
                className={errors.hourly_rate ? "border-destructive" : ""}
              />
              {errors.hourly_rate && (
                <p className="text-sm text-destructive mt-1">{errors.hourly_rate}</p>
              )}
            </div>

            <div>
              <Label htmlFor="hire_date">Hire Date *</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                className={errors.hire_date ? "border-destructive" : ""}
              />
              {errors.hire_date && (
                <p className="text-sm text-destructive mt-1">{errors.hire_date}</p>
              )}
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional information about this team member..."
                rows={3}
                maxLength={1000}
                className={errors.notes ? "border-destructive" : ""}
              />
              {errors.notes && <p className="text-sm text-destructive mt-1">{errors.notes}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                {formData.notes.length}/1000 characters
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : member ? "Update Member" : "Add Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
