import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/use-user-role";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Pencil, Trash2, FileText, Presentation, Package } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import logo from "@/assets/logo.png";
import { OrdersSection } from "@/components/admin/OrdersSection";
import { ProCustomersSection } from "@/components/admin/ProCustomersSection";
import { OrderStatistics } from "@/components/admin/OrderStatistics";
import { FailedEmailsSection } from "@/components/admin/FailedEmailsSection";
import { CronJobsSection } from "@/components/admin/CronJobsSection";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { NotificationCenter } from "@/components/admin/NotificationCenter";
import { EmailActivityFeed } from "@/components/admin/EmailActivityFeed";
import { EmailAnalyticsDashboard } from "@/components/admin/EmailAnalyticsDashboard";
import { AnalyticsReportConfig } from "@/components/admin/AnalyticsReportConfig";

interface CabinetType {
  id: string;
  name: string;
  price_per_unit: number;
}

interface FlooringType {
  id: string;
  name: string;
  price_per_sqft: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useUserRole();
  
  const [cabinets, setCabinets] = useState<CabinetType[]>([]);
  const [flooring, setFlooring] = useState<FlooringType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Cabinet form states
  const [cabinetName, setCabinetName] = useState("");
  const [cabinetPrice, setCabinetPrice] = useState("");
  const [editingCabinet, setEditingCabinet] = useState<CabinetType | null>(null);
  const [cabinetDialogOpen, setCabinetDialogOpen] = useState(false);
  
  // Flooring form states
  const [flooringName, setFlooringName] = useState("");
  const [flooringPrice, setFlooringPrice] = useState("");
  const [editingFlooring, setEditingFlooring] = useState<FlooringType | null>(null);
  const [flooringDialogOpen, setFlooringDialogOpen] = useState(false);

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
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cabinetsRes, flooringRes] = await Promise.all([
        supabase.from("cabinet_types").select("*").order("name"),
        supabase.from("flooring_types").select("*").order("name"),
      ]);

      if (cabinetsRes.error) throw cabinetsRes.error;
      if (flooringRes.error) throw flooringRes.error;

      setCabinets(cabinetsRes.data || []);
      setFlooring(flooringRes.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pricing data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCabinet = async () => {
    if (!cabinetName || !cabinetPrice) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingCabinet) {
        const { error } = await supabase
          .from("cabinet_types")
          .update({ name: cabinetName, price_per_unit: parseFloat(cabinetPrice) })
          .eq("id", editingCabinet.id);

        if (error) throw error;
        toast({ title: "Success", description: "Cabinet type updated" });
      } else {
        const { error } = await supabase
          .from("cabinet_types")
          .insert({ name: cabinetName, price_per_unit: parseFloat(cabinetPrice) });

        if (error) throw error;
        toast({ title: "Success", description: "Cabinet type added" });
      }

      setCabinetName("");
      setCabinetPrice("");
      setEditingCabinet(null);
      setCabinetDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save cabinet type",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCabinet = async (id: string) => {
    try {
      const { error } = await supabase.from("cabinet_types").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Cabinet type deleted" });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete cabinet type",
        variant: "destructive",
      });
    }
  };

  const handleSaveFlooring = async () => {
    if (!flooringName || !flooringPrice) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingFlooring) {
        const { error } = await supabase
          .from("flooring_types")
          .update({ name: flooringName, price_per_sqft: parseFloat(flooringPrice) })
          .eq("id", editingFlooring.id);

        if (error) throw error;
        toast({ title: "Success", description: "Flooring type updated" });
      } else {
        const { error } = await supabase
          .from("flooring_types")
          .insert({ name: flooringName, price_per_sqft: parseFloat(flooringPrice) });

        if (error) throw error;
        toast({ title: "Success", description: "Flooring type added" });
      }

      setFlooringName("");
      setFlooringPrice("");
      setEditingFlooring(null);
      setFlooringDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save flooring type",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFlooring = async (id: string) => {
    try {
      const { error } = await supabase.from("flooring_types").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Flooring type deleted" });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete flooring type",
        variant: "destructive",
      });
    }
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
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <img src={logo} alt="Logo" className="h-12" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage store operations and view analytics</p>
          </div>
          <Button onClick={() => navigate("/presentations")}>
            <Presentation className="mr-2 h-4 w-4" />
            Presentations
          </Button>
          <Button onClick={() => navigate("/product-manager")}>
            <Package className="mr-2 h-4 w-4" />
            Product Manager
          </Button>
          <Button onClick={() => navigate("/estimates")}>
            <FileText className="mr-2 h-4 w-4" />
            View Estimates
          </Button>
          <Button variant="outline" onClick={() => navigate("/estimator")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Estimator
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="customers">Pro Customers</TabsTrigger>
            <TabsTrigger value="emails">Email Activity</TabsTrigger>
            <TabsTrigger value="analytics">Email Analytics</TabsTrigger>
            <TabsTrigger value="cabinets">Cabinet Types</TabsTrigger>
            <TabsTrigger value="flooring">Flooring Types</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OrderStatistics />
            <CronJobsSection />
            <FailedEmailsSection />
            <div className="grid gap-6 md:grid-cols-2">
              <OrdersSection />
              <ProCustomersSection />
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <OrdersSection />
          </TabsContent>

          <TabsContent value="customers">
            <ProCustomersSection />
          </TabsContent>

          <TabsContent value="cabinets">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cabinet Types</CardTitle>
                    <CardDescription>Manage cabinet pricing</CardDescription>
                  </div>
                  <Dialog open={cabinetDialogOpen} onOpenChange={setCabinetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingCabinet(null);
                        setCabinetName("");
                        setCabinetPrice("");
                      }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Cabinet Type
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingCabinet ? "Edit Cabinet Type" : "Add Cabinet Type"}
                        </DialogTitle>
                        <DialogDescription>
                          Enter the cabinet type name and price per unit
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="cabinet-name">Name</Label>
                          <Input
                            id="cabinet-name"
                            value={cabinetName}
                            onChange={(e) => setCabinetName(e.target.value)}
                            placeholder="e.g., Base, Wall, Tall"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cabinet-price">Price per Unit ($)</Label>
                          <Input
                            id="cabinet-price"
                            type="number"
                            step="0.01"
                            value={cabinetPrice}
                            onChange={(e) => setCabinetPrice(e.target.value)}
                            placeholder="e.g., 350.00"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleSaveCabinet}>Save</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price per Unit</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cabinets.map((cabinet) => (
                      <TableRow key={cabinet.id}>
                        <TableCell className="font-medium capitalize">{cabinet.name}</TableCell>
                        <TableCell>${cabinet.price_per_unit.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCabinet(cabinet);
                              setCabinetName(cabinet.name);
                              setCabinetPrice(cabinet.price_per_unit.toString());
                              setCabinetDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCabinet(cabinet.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flooring">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Flooring Types</CardTitle>
                    <CardDescription>Manage flooring pricing</CardDescription>
                  </div>
                  <Dialog open={flooringDialogOpen} onOpenChange={setFlooringDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingFlooring(null);
                        setFlooringName("");
                        setFlooringPrice("");
                      }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Flooring Type
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingFlooring ? "Edit Flooring Type" : "Add Flooring Type"}
                        </DialogTitle>
                        <DialogDescription>
                          Enter the flooring type name and price per square foot
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="flooring-name">Name</Label>
                          <Input
                            id="flooring-name"
                            value={flooringName}
                            onChange={(e) => setFlooringName(e.target.value)}
                            placeholder="e.g., Hardwood, Laminate, Tile"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="flooring-price">Price per Sq Ft ($)</Label>
                          <Input
                            id="flooring-price"
                            type="number"
                            step="0.01"
                            value={flooringPrice}
                            onChange={(e) => setFlooringPrice(e.target.value)}
                            placeholder="e.g., 8.50"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleSaveFlooring}>Save</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price per Sq Ft</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flooring.map((floor) => (
                      <TableRow key={floor.id}>
                        <TableCell className="font-medium capitalize">{floor.name}</TableCell>
                        <TableCell>${floor.price_per_sqft.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingFlooring(floor);
                              setFlooringName(floor.name);
                              setFlooringPrice(floor.price_per_sqft.toString());
                              setFlooringDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFlooring(floor.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails">
            <EmailActivityFeed />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <EmailAnalyticsDashboard />
              <AnalyticsReportConfig />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
