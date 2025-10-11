import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useUserRole } from "@/hooks/use-user-role";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import logo from "@/assets/logo.png";

type Estimate = Tables<"estimates">;

const Estimates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useUserRole();
  
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You must be an admin to access this page.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, roleLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchEstimates();
    }
  }, [isAdmin]);

  const fetchEstimates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("estimates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEstimates(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load estimates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("estimates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Estimate deleted successfully",
      });
      
      fetchEstimates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete estimate",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Customer ID", "Cabinet Total", "Flooring Total", "Grand Total", "Cabinet Items", "Flooring Items"];
    const csvData = estimates.map(est => {
      const cabinetItems = Array.isArray(est.cabinet_items) ? est.cabinet_items : [];
      const flooringItems = Array.isArray(est.flooring_items) ? est.flooring_items : [];
      return [
        new Date(est.created_at || "").toLocaleDateString(),
        est.user_id,
        `$${Number(est.cabinet_total).toFixed(2)}`,
        `$${Number(est.flooring_total).toFixed(2)}`,
        `$${Number(est.grand_total).toFixed(2)}`,
        cabinetItems.length,
        flooringItems.length
      ];
    });

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `estimates-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <img src={logo} alt="Logo" className="h-12" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Customer Estimates</h1>
            <p className="text-muted-foreground">View all customer leads and orders from the kiosk</p>
          </div>
          <Button variant="outline" onClick={exportToCSV} disabled={estimates.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Estimates</CardTitle>
            <CardDescription>
              {estimates.length} total estimate{estimates.length !== 1 ? "s" : ""} from customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {estimates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No estimates found yet. Customers will appear here after using the kiosk.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Cabinet Items</TableHead>
                      <TableHead>Cabinet Total</TableHead>
                      <TableHead>Flooring Items</TableHead>
                      <TableHead>Flooring Total</TableHead>
                      <TableHead className="text-right">Grand Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estimates.map((estimate) => {
                      const cabinetItems = Array.isArray(estimate.cabinet_items) ? estimate.cabinet_items : [];
                      const flooringItems = Array.isArray(estimate.flooring_items) ? estimate.flooring_items : [];
                      
                      return (
                        <TableRow key={estimate.id}>
                          <TableCell className="font-medium">
                            {new Date(estimate.created_at || "").toLocaleDateString()}
                            <div className="text-xs text-muted-foreground">
                              {new Date(estimate.created_at || "").toLocaleTimeString()}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {estimate.user_id.substring(0, 8)}...
                          </TableCell>
                          <TableCell>
                            {cabinetItems.length > 0 ? (
                              <div className="space-y-1">
                                {cabinetItems.map((item: any, idx: number) => (
                                  <div key={idx} className="text-sm">
                                    {item.quantity}x {item.type}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>${Number(estimate.cabinet_total).toFixed(2)}</TableCell>
                          <TableCell>
                            {flooringItems.length > 0 ? (
                              <div className="space-y-1">
                                {flooringItems.map((item: any, idx: number) => (
                                  <div key={idx} className="text-sm">
                                    {item.sqft} sqft {item.type}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>${Number(estimate.flooring_total).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-bold">
                            ${Number(estimate.grand_total).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Estimate</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this estimate? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(estimate.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Estimates;
