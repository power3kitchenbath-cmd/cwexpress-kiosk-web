import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, RefreshCw, Mail } from "lucide-react";
import { format } from "date-fns";

interface QuoteRequest {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  door_style: string;
  design_image_url: string;
  design_settings: {
    opacity: number;
    brightness: number;
    scale: number;
  };
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const QuoteRequestsSection = () => {
  const { toast } = useToast();
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchQuoteRequests();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('quote-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quote_requests'
        },
        () => {
          console.log('Quote request updated');
          fetchQuoteRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchQuoteRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_requests' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuoteRequests((data as any) || []);
    } catch (error) {
      console.error('Error fetching quote requests:', error);
      toast({
        title: "Error",
        description: "Failed to load quote requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (quoteId: string, newStatus: string) => {
    setUpdatingStatus(quoteId);
    try {
      const { error } = await supabase
        .from('quote_requests' as any)
        .update({ status: newStatus })
        .eq('id', quoteId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Quote request status changed to ${newStatus}`,
      });

      fetchQuoteRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewDetails = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
    setDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      reviewing: { variant: "default", label: "Reviewing" },
      quoted: { variant: "outline", label: "Quoted" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
      completed: { variant: "outline", label: "Completed" },
    };

    const config = statusConfig[status] || { variant: "secondary" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quote Requests</CardTitle>
          <CardDescription>Loading quote requests...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quote Requests</CardTitle>
              <CardDescription>
                Manage customer cabinet door quote requests
              </CardDescription>
            </div>
            <Button onClick={fetchQuoteRequests} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quoteRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No quote requests yet
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Door Style</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quoteRequests.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{quote.customer_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {quote.customer_email}
                          </div>
                          {quote.customer_phone && (
                            <div className="text-xs text-muted-foreground">
                              {quote.customer_phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{quote.door_style}</div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={quote.status}
                          onValueChange={(value) => handleStatusUpdate(quote.id, value)}
                          disabled={updatingStatus === quote.id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue>
                              {getStatusBadge(quote.status)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewing">Reviewing</SelectItem>
                            <SelectItem value="quoted">Quoted</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(quote.created_at), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(quote.created_at), 'h:mm a')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(quote)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendEmail(quote.customer_email)}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Request Details</DialogTitle>
            <DialogDescription>
              Review the complete quote request from {selectedQuote?.customer_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedQuote && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedQuote.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">
                      <a
                        href={`mailto:${selectedQuote.customer_email}`}
                        className="text-primary hover:underline"
                      >
                        {selectedQuote.customer_email}
                      </a>
                    </p>
                  </div>
                  {selectedQuote.customer_phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">
                        <a
                          href={`tel:${selectedQuote.customer_phone}`}
                          className="text-primary hover:underline"
                        >
                          {selectedQuote.customer_phone}
                        </a>
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedQuote.status)}</div>
                  </div>
                </div>
              </div>

              {/* Design Details */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Design Details</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Door Style</p>
                    <p className="text-xl font-bold">{selectedQuote.door_style}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">
                        {selectedQuote.design_settings.opacity}%
                      </p>
                      <p className="text-xs text-muted-foreground">Opacity</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">
                        {selectedQuote.design_settings.brightness}%
                      </p>
                      <p className="text-xs text-muted-foreground">Brightness</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">
                        {selectedQuote.design_settings.scale}%
                      </p>
                      <p className="text-xs text-muted-foreground">Scale</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Message */}
              {selectedQuote.message && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Customer Message</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedQuote.message}</p>
                  </div>
                </div>
              )}

              {/* Design Preview */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Design Preview</h3>
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={selectedQuote.design_image_url}
                    alt="Design Preview"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Timestamp Info */}
              <div className="text-sm text-muted-foreground border-t pt-4">
                <p>
                  Submitted: {format(new Date(selectedQuote.created_at), 'MMMM d, yyyy h:mm a')}
                </p>
                <p>
                  Last Updated: {format(new Date(selectedQuote.updated_at), 'MMMM d, yyyy h:mm a')}
                </p>
                <p className="mt-2 text-xs">Request ID: {selectedQuote.id}</p>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleSendEmail(selectedQuote.customer_email)}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Customer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDetailsOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
