import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ProCustomer {
  id: string;
  company_name: string | null;
  business_type: string | null;
  phone: string | null;
  order_count: number;
  is_pro: boolean;
  created_at: string;
}

export const ProCustomersSection = () => {
  const [customers, setCustomers] = useState<ProCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProCustomers();
  }, []);

  const fetchProCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_pro", true)
        .order("order_count", { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching pro customers:", error);
      toast({
        title: "Error",
        description: "Failed to load pro customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Customer ID", "Company Name", "Business Type", "Phone", "Orders", "Member Since"];
    const csvData = customers.map(customer => [
      customer.id.slice(0, 8),
      customer.company_name || "N/A",
      customer.business_type || "N/A",
      customer.phone || "N/A",
      customer.order_count.toString(),
      format(new Date(customer.created_at), "MM/dd/yyyy"),
    ]);

    const csv = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pro-customers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();

    toast({
      title: "Exported",
      description: "Pro customers exported to CSV",
    });
  };

  if (loading) {
    return <div>Loading pro customers...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Pro Customers
            </CardTitle>
            <CardDescription>View professional customer profiles</CardDescription>
          </div>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Business Type</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Total Orders</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No pro customers found
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.company_name || "N/A"}
                    </TableCell>
                    <TableCell className="capitalize">
                      {customer.business_type || "N/A"}
                    </TableCell>
                    <TableCell>{customer.phone || "N/A"}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {customer.order_count}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Pro Member</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
