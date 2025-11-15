import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamManagementDialog({ open, onOpenChange }: TeamManagementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Team Management</DialogTitle>
          <DialogDescription>Manage installation teams and members</DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>View and manage your installation teams</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              Team management features coming soon
            </p>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
