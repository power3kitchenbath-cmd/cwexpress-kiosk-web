import { useState, useCallback } from "react";
import { Upload, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DesignGalleryDragDropProps {
  onFilesDropped: (files: File[]) => void;
  isDragging: boolean;
}

export function DesignGalleryDragDrop({ onFilesDropped, isDragging }: DesignGalleryDragDropProps) {
  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="border-4 border-dashed border-primary rounded-2xl p-12 bg-background/50 backdrop-blur max-w-2xl w-full">
          <div className="text-center space-y-6">
            <div className="flex justify-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-bounce">
                <Upload className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-2">Drop Files Here</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Upload your design files to create a new project
              </p>
            </div>

            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="h-12 w-12 rounded-lg bg-accent/50 flex items-center justify-center mx-auto mb-2">
                  <FileText className="h-6 w-6 text-accent-foreground" />
                </div>
                <p className="text-sm font-medium">Cabinet List</p>
                <p className="text-xs text-muted-foreground">CSV or Excel</p>
              </div>

              <div className="text-center">
                <div className="h-12 w-12 rounded-lg bg-accent/50 flex items-center justify-center mx-auto mb-2">
                  <ImageIcon className="h-6 w-6 text-accent-foreground" />
                </div>
                <p className="text-sm font-medium">Design Drawing</p>
                <p className="text-xs text-muted-foreground">PDF, JPG, or PNG</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Maximum file size: 10MB per file
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
