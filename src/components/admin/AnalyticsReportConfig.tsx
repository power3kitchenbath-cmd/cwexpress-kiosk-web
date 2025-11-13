import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Send } from "lucide-react";
import { format } from "date-fns";

interface ReportConfig {
  id: string;
  admin_email: string;
  frequency: "weekly" | "monthly" | "disabled";
  last_sent_at: string | null;
  created_at: string;
}

export const AnalyticsReportConfig = () => {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<ReportConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newFrequency, setNewFrequency] = useState<"weekly" | "monthly">("weekly");
  const [adding, setAdding] = useState(false);
  const [testingSend, setTestingSend] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("analytics_report_config" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConfigs((data as unknown as ReportConfig[]) || []);
    } catch (error) {
      console.error("Error fetching report configs:", error);
      toast({
        title: "Error",
        description: "Failed to load report configurations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddConfig = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setAdding(true);
      const { error } = await supabase
        .from("analytics_report_config" as any)
        .insert({
          admin_email: newEmail,
          frequency: newFrequency,
        } as any);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report configuration added successfully",
      });

      setNewEmail("");
      setNewFrequency("weekly");
      fetchConfigs();
    } catch (error) {
      console.error("Error adding config:", error);
      toast({
        title: "Error",
        description: "Failed to add report configuration",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateFrequency = async (id: string, frequency: string) => {
    try {
      const { error } = await supabase
        .from("analytics_report_config" as any)
        .update({ frequency } as any)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report frequency updated",
      });

      fetchConfigs();
    } catch (error) {
      console.error("Error updating config:", error);
      toast({
        title: "Error",
        description: "Failed to update report configuration",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report configuration?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("analytics_report_config" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report configuration deleted",
      });

      fetchConfigs();
    } catch (error) {
      console.error("Error deleting config:", error);
      toast({
        title: "Error",
        description: "Failed to delete report configuration",
        variant: "destructive",
      });
    }
  };

  const handleTestSend = async () => {
    try {
      setTestingSend(true);
      const { error } = await supabase.functions.invoke("send-analytics-report", {
        body: { frequency: null }, // Send to all active configs
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test reports have been sent to all active recipients",
      });

      fetchConfigs();
    } catch (error) {
      console.error("Error sending test reports:", error);
      toast({
        title: "Error",
        description: "Failed to send test reports",
        variant: "destructive",
      });
    } finally {
      setTestingSend(false);
    }
  };

  const getFrequencyBadge = (frequency: string) => {
    switch (frequency) {
      case "weekly":
        return <Badge variant="default">Weekly</Badge>;
      case "monthly":
        return <Badge variant="secondary">Monthly</Badge>;
      case "disabled":
        return <Badge variant="outline">Disabled</Badge>;
      default:
        return <Badge>{frequency}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Analytics Reports</CardTitle>
          <CardDescription>Loading configurations...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Analytics Reports</CardTitle>
        <CardDescription>
          Configure automatic email reports for admin users. Reports are sent via cron jobs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="email">Admin Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frequency">Report Frequency</Label>
            <Select value={newFrequency} onValueChange={(v) => setNewFrequency(v as any)}>
              <SelectTrigger id="frequency" className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddConfig} disabled={adding}>
              <Plus className="mr-2 h-4 w-4" />
              Add Recipient
            </Button>
          </div>
        </div>

        {configs.length > 0 && (
          <>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {configs.filter((c) => c.frequency !== "disabled").length} active recipient(s)
              </p>
              <Button variant="outline" size="sm" onClick={handleTestSend} disabled={testingSend}>
                <Send className="mr-2 h-4 w-4" />
                Send Test Report Now
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Last Sent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="font-medium">{config.admin_email}</TableCell>
                    <TableCell>
                      <Select
                        value={config.frequency}
                        onValueChange={(v) => handleUpdateFrequency(config.id, v)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {config.last_sent_at
                        ? format(new Date(config.last_sent_at), "PPp")
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteConfig(config.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {configs.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No report configurations yet. Add an admin email above to get started.
          </p>
        )}

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h4 className="font-medium">Schedule Information</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Weekly reports are sent every Monday at 9:00 AM UTC</li>
            <li>• Monthly reports are sent on the 1st of each month at 9:00 AM UTC</li>
            <li>• Reports include metrics from the past 7 or 30 days respectively</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
