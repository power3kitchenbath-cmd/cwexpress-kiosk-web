import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DesignProject {
  id: string;
  user_id: string;
  project_name: string;
  cabinet_list_file: string | null;
  design_drawing_file: string | null;
  cabinet_data: any[] | null;
  created_at: string;
  updated_at: string;
}

interface UseDesignProjectsOptions {
  searchQuery?: string;
  sortBy?: "created_at" | "project_name" | "cabinet_count";
  sortDirection?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

export const useDesignProjects = (options: UseDesignProjectsOptions = {}) => {
  const [projects, setProjects] = useState<DesignProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProjects([]);
        return;
      }

      let query = supabase
        .from("design_projects")
        .select("*")
        .eq("user_id", user.id);

      // Apply search filter
      if (options.searchQuery) {
        query = query.ilike("project_name", `%${options.searchQuery}%`);
      }

      // Apply date filters
      if (options.dateFrom) {
        query = query.gte("created_at", options.dateFrom);
      }
      if (options.dateTo) {
        query = query.lte("created_at", options.dateTo);
      }

      // Apply sorting
      const sortColumn = options.sortBy || "created_at";
      const ascending = options.sortDirection === "asc";
      query = query.order(sortColumn, { ascending });

      const { data, error } = await query;

      if (error) throw error;

      // Sort by cabinet count if requested
      let sortedData = (data || []) as DesignProject[];
      if (options.sortBy === "cabinet_count") {
        sortedData = sortedData.sort((a, b) => {
          const aCount = Array.isArray(a.cabinet_data) ? a.cabinet_data.length : 0;
          const bCount = Array.isArray(b.cabinet_data) ? b.cabinet_data.length : 0;
          return options.sortDirection === "asc" ? aCount - bCount : bCount - aCount;
        });
      }

      setProjects(sortedData);
    } catch (error: any) {
      console.error("Error fetching design projects:", error);
      toast({
        title: "Error",
        description: "Failed to load design projects.",
        variant: "destructive",
      });
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      // Delete files from storage
      if (project.cabinet_list_file) {
        await supabase.storage
          .from("design-files")
          .remove([project.cabinet_list_file]);
      }
      if (project.design_drawing_file) {
        await supabase.storage
          .from("design-files")
          .remove([project.design_drawing_file]);
      }

      // Delete project record
      const { error } = await supabase
        .from("design_projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      
      toast({
        title: "Success",
        description: "Design project deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete design project.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [
    options.searchQuery,
    options.sortBy,
    options.sortDirection,
    options.dateFrom,
    options.dateTo,
  ]);

  return {
    projects,
    isLoading,
    refetch: fetchProjects,
    deleteProject,
  };
};
