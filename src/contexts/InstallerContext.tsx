import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface InstallerContextType {
  user: User | null;
  isInstaller: boolean;
  teamId: string | null;
  loading: boolean;
}

const InstallerContext = createContext<InstallerContextType | undefined>(undefined);

export function InstallerProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInstaller, setIsInstaller] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkInstallerRole(session.user.id, session.user.email || "");
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkInstallerRole(session.user.id, session.user.email || "");
      } else {
        setIsInstaller(false);
        setTeamId(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkInstallerRole = async (userId: string, email: string) => {
    try {
      // Check if user has installer role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      const hasInstallerRole = roles?.some(r => r.role === "installer");
      setIsInstaller(hasInstallerRole || false);

      if (hasInstallerRole) {
        // Get team membership
        const { data: teamMember } = await supabase
          .from("team_members")
          .select("team_id")
          .eq("email", email)
          .single();

        setTeamId(teamMember?.team_id || null);
      }
    } catch (error) {
      console.error("Error checking installer role:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <InstallerContext.Provider value={{ user, isInstaller, teamId, loading }}>
      {children}
    </InstallerContext.Provider>
  );
}

export function useInstaller() {
  const context = useContext(InstallerContext);
  if (context === undefined) {
    throw new Error("useInstaller must be used within an InstallerProvider");
  }
  return context;
}
