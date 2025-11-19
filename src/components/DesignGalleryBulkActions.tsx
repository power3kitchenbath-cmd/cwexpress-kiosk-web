import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, X } from "lucide-react";
import { useState } from "react";

interface DesignGalleryBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
}

export function DesignGalleryBulkActions({
  selectedCount,
  onClearSelection,
  onBulkDelete,
}: DesignGalleryBulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    onBulkDelete();
    setShowDeleteDialog(false);
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
        <Card className="shadow-2xl border-2">
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                {selectedCount}
              </div>
              <span className="font-medium">
                {selectedCount} {selectedCount === 1 ? "project" : "projects"} selected
              </span>
            </div>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear Selection
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} Projects</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount}{" "}
              {selectedCount === 1 ? "project" : "projects"}? This action cannot be undone and
              will permanently delete all associated files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedCount} {selectedCount === 1 ? "Project" : "Projects"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
