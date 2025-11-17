import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Users } from "lucide-react";

interface ProjectLaborSummaryProps {
  projectId: string;
}

interface LaborSummary {
  total_hours: number;
  total_cost: number;
  team_member_count: number;
}

export default function ProjectLaborSummary({ projectId }: ProjectLaborSummaryProps) {
  const [summary, setSummary] = useState<LaborSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [projectId]);

  const loadSummary = async () => {
    try {
      const { data, error } = await supabase
        .rpc("get_project_labor_summary", { project_id_param: projectId });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setSummary(data[0]);
      }
    } catch (error: any) {
      console.error("Error loading labor summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Labor Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Total Hours</span>
            </div>
            <p className="text-2xl font-bold">
              {summary.total_hours?.toFixed(2) || "0.00"}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Labor Cost</span>
            </div>
            <p className="text-2xl font-bold">
              ${summary.total_cost?.toFixed(2) || "0.00"}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm">Workers</span>
            </div>
            <p className="text-2xl font-bold">
              {summary.team_member_count || 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
