import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { FileText, Calendar, Mail, Phone, Building, DollarSign, Eye, Filter, Download } from "lucide-react";

type EstimateStatus = "pending" | "contacted" | "quoted" | "converted" | "declined";

interface MultiProjectEstimate {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_company: string | null;
  estimate_name: string;
  estimate_notes: string | null;
  projects: any[];
  total_cost: number;
  project_count: number;
  status: EstimateStatus;
  created_at: string;
  updated_at: string;
}

export function MultiProjectEstimatesSection() {
  const [estimates, setEstimates] = useState<MultiProjectEstimate[]>([]);
  const [filteredEstimates, setFilteredEstimates] = useState<MultiProjectEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstimate, setSelectedEstimate] = useState<MultiProjectEstimate | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchEstimates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [estimates, statusFilter, dateFrom, dateTo, searchQuery]);

  const fetchEstimates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("multi_project_estimates" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEstimates((data as any) || []);
    } catch (error: any) {
      console.error("Error fetching estimates:", error);
      toast.error("Failed to load estimates");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...estimates];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(e => e.status === statusFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(e => new Date(e.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(e => new Date(e.created_at) <= endDate);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.customer_name.toLowerCase().includes(query) ||
        e.customer_email.toLowerCase().includes(query) ||
        e.estimate_name.toLowerCase().includes(query) ||
        (e.customer_company?.toLowerCase().includes(query) || false)
      );
    }

    setFilteredEstimates(filtered);
  };

  const updateEstimateStatus = async (id: string, newStatus: EstimateStatus) => {
    try {
      const { error } = await supabase
        .from("multi_project_estimates" as any)
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast.success("Status updated successfully");
      fetchEstimates();
      
      if (selectedEstimate?.id === id) {
        setSelectedEstimate({ ...selectedEstimate, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Customer", "Email", "Phone", "Company", "Projects", "Total", "Status"];
    const rows = filteredEstimates.map(e => [
      new Date(e.created_at).toLocaleDateString(),
      e.customer_name,
      e.customer_email,
      e.customer_phone || "",
      e.customer_company || "",
      e.project_count.toString(),
      `$${e.total_cost.toFixed(2)}`,
      e.status
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `multi-project-estimates-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Estimates exported successfully");
  };

  const getStatusColor = (status: EstimateStatus) => {
    const colors = {
      pending: "bg-yellow-500",
      contacted: "bg-blue-500",
      quoted: "bg-purple-500",
      converted: "bg-green-500",
      declined: "bg-red-500"
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusLabel = (status: EstimateStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getTotalValue = () => {
    return filteredEstimates.reduce((sum, e) => sum + Number(e.total_cost), 0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Multi-Project Estimate Requests</CardTitle>
              <CardDescription>
                Manage and track all multi-project estimate requests from customers
              </CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{filteredEstimates.length}</div>
                <p className="text-xs text-muted-foreground">Total Requests</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredEstimates.filter(e => e.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {filteredEstimates.filter(e => e.status === "converted").length}
                </div>
                <p className="text-xs text-muted-foreground">Converted</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">
                  ${getTotalValue().toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="quoted">Quoted</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-from">From Date</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="date-to">To Date</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Name, email, company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estimates List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading estimates...
              </div>
            ) : filteredEstimates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No estimates found matching your filters
              </div>
            ) : (
              filteredEstimates.map((estimate) => (
                <Card key={estimate.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{estimate.estimate_name}</h3>
                              <Badge className={getStatusColor(estimate.status)}>
                                {getStatusLabel(estimate.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {estimate.customer_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-primary">
                              ${estimate.total_cost.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {estimate.project_count} project{estimate.project_count !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate">{estimate.customer_email}</span>
                          </div>
                          {estimate.customer_phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span>{estimate.customer_phone}</span>
                            </div>
                          )}
                          {estimate.customer_company && (
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-muted-foreground" />
                              <span className="truncate">{estimate.customer_company}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{new Date(estimate.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedEstimate(estimate);
                              setDetailsOpen(true);
                            }}
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                          
                          <Select
                            value={estimate.status}
                            onValueChange={(value: EstimateStatus) => 
                              updateEstimateStatus(estimate.id, value)
                            }
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="quoted">Quoted</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="declined">Declined</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Estimate Details</DialogTitle>
            <DialogDescription>
              Complete information about this multi-project estimate request
            </DialogDescription>
          </DialogHeader>

          {selectedEstimate && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">{selectedEstimate.customer_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedEstimate.customer_email}</p>
                  </div>
                  {selectedEstimate.customer_phone && (
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="font-medium">{selectedEstimate.customer_phone}</p>
                    </div>
                  )}
                  {selectedEstimate.customer_company && (
                    <div>
                      <Label className="text-muted-foreground">Company</Label>
                      <p className="font-medium">{selectedEstimate.customer_company}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Estimate Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Estimate Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground">Estimate Name</Label>
                    <p className="font-medium">{selectedEstimate.estimate_name}</p>
                  </div>
                  {selectedEstimate.estimate_notes && (
                    <div>
                      <Label className="text-muted-foreground">Notes</Label>
                      <p className="font-medium whitespace-pre-wrap">{selectedEstimate.estimate_notes}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Total Cost</Label>
                      <p className="text-xl font-bold text-primary">
                        ${selectedEstimate.total_cost.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Projects</Label>
                      <p className="text-xl font-bold">{selectedEstimate.project_count}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <Badge className={getStatusColor(selectedEstimate.status)}>
                        {getStatusLabel(selectedEstimate.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Created</Label>
                      <p className="font-medium">
                        {new Date(selectedEstimate.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Last Updated</Label>
                      <p className="font-medium">
                        {new Date(selectedEstimate.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Projects Breakdown */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Projects Breakdown</h3>
                <div className="space-y-2">
                  {selectedEstimate.projects && selectedEstimate.projects.length > 0 ? (
                    selectedEstimate.projects.map((project: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{project.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {project.type === "room" && `${project.details.squareFeet} sqft • ${project.details.grade} grade`}
                                {project.type === "kitchen" && `${project.details.multiplier}x • ${project.details.tier} tier`}
                                {project.type === "vanity" && `${project.details.quantity}x ${project.details.vanityType} • ${project.details.tier} tier`}
                              </p>
                            </div>
                            <p className="font-bold">${project.cost.toLocaleString()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No project details available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
