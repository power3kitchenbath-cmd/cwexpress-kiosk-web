import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "project_manager" | "user" | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        if (error) {
          console.error("Error fetching user role:", error);
          setRole("user");
        } else {
          const roles = (data as { role: UserRole }[]) || [];
          const isAdmin = roles.some((r) => r.role === "admin");
          const isProjectManager = roles.some((r) => r.role === "project_manager");
          setRole(isAdmin ? "admin" : isProjectManager ? "project_manager" : "user");
        }
      } catch (error) {
        console.error("Error in useUserRole:", error);
        setRole("user");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { 
    role, 
    loading, 
    isAdmin: role === "admin",
    isProjectManager: role === "project_manager" || role === "admin"
  };
};
