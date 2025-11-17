import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, UserPlus, Shield, Smartphone } from "lucide-react";

export function InstallerAccountGuide() {
  return (
    <Card className="border-accent/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-accent" />
          <CardTitle>Installer Portal Setup</CardTitle>
        </div>
        <CardDescription>
          Give your subcontractors mobile access to their projects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            The Installer Portal provides a mobile-friendly interface for subcontractors to view assigned projects, update task status, and upload progress photos.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div className="flex-1">
              <p className="font-medium mb-1">Create User Account</p>
              <p className="text-sm text-muted-foreground">
                Go to <Badge variant="outline" className="mx-1">Backend → Authentication</Badge> and create a new user with the installer's email
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div className="flex-1">
              <p className="font-medium mb-1">Assign Installer Role</p>
              <p className="text-sm text-muted-foreground">
                Go to <Badge variant="outline" className="mx-1">Backend → Database → user_roles</Badge> table and add a row with:
              </p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                <li><code className="bg-muted px-1 rounded">user_id</code>: The user's ID from step 1</li>
                <li><code className="bg-muted px-1 rounded">role</code>: "installer"</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div className="flex-1">
              <p className="font-medium mb-1">Add to Team</p>
              <p className="text-sm text-muted-foreground">
                Use <Badge variant="outline" className="mx-1">Manage Teams</Badge> to add the installer to a team. Make sure their email matches the account email.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">
              4
            </div>
            <div className="flex-1">
              <p className="font-medium mb-1 text-accent">Share Portal Access</p>
              <p className="text-sm text-muted-foreground">
                Send installer the portal URL: <code className="bg-muted px-2 py-0.5 rounded text-xs">
                  {window.location.origin}/installer
                </code>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                They can log in with their email and assigned password
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            What Installers Can Do
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
            <li>View projects assigned to their team</li>
            <li>Update task statuses (pending, in progress, completed, blocked)</li>
            <li>Upload progress photos (before, progress, after, issue)</li>
            <li>Access customer contact information</li>
            <li>View project schedules and notes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
