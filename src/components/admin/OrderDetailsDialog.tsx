import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Printer, Package, User, MapPin, CreditCard, Calendar, Mail, Eye } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { EmailPreviewDialog } from "./EmailPreviewDialog";

interface OrderDetailsDialogProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OrderDetails {
  id: string;
  user_id: string;
  status: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shipping_address: any;
  created_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    product_image_url: string | null;
    quantity: number;
    price_at_purchase: number;
  }>;
  profiles: {
    company_name: string | null;
    phone: string | null;
    business_type: string | null;
  } | null;
}

export const OrderDetailsDialog = ({
  orderId,
  open,
  onOpenChange,
}: OrderDetailsDialogProps) => {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetails();
    }
  }, [open, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      // Fetch order with items
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            product_name,
            product_image_url,
            quantity,
            price_at_purchase
          )
        `)
        .eq("id", orderId)
        .maybeSingle();

      if (orderError) throw orderError;
      if (!orderData) {
        toast({
          title: "Order not found",
          description: "Could not find order details",
          variant: "destructive",
        });
        return;
      }

      // Fetch profile separately
      const { data: profileData } = await supabase
        .from("profiles")
        .select("company_name, phone, business_type")
        .eq("id", orderData.user_id)
        .maybeSingle();

      const orderWithProfile = {
        ...orderData,
        profiles: profileData,
      };

      setOrder(orderWithProfile as OrderDetails);

      // Fetch customer email from auth
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(
        orderData.user_id
      );

      if (!userError && user?.email) {
        setCustomerEmail(user.email);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReceipt = async () => {
    if (!order) return;

    setSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-order-receipt", {
        body: {
          orderId: order.id,
          emailType: "manual",
        },
      });

      if (error) {
        console.error("Email function error:", error);
        toast({
          title: "Email service error",
          description: error.message || "The email service is currently unavailable. Please check your API key configuration in the backend.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Receipt sent",
        description: `Receipt sent to ${customerEmail}`,
      });
    } catch (error: any) {
      console.error("Error sending receipt:", error);
      toast({
        title: "Failed to send receipt",
        description: error.message || "An unexpected error occurred while sending the email.",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !printRef.current) return;

    const printContent = printRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Receipt - ${orderId.slice(0, 8)}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              padding: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 10px;
              color: #666;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .table th {
              background: #f5f5f5;
              padding: 12px;
              text-align: left;
              border-bottom: 2px solid #ddd;
            }
            .table td {
              padding: 12px;
              border-bottom: 1px solid #eee;
            }
            .totals {
              margin-top: 30px;
              border-top: 2px solid #333;
              padding-top: 20px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
            }
            .total-row.grand {
              font-size: 18px;
              font-weight: 600;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px solid #333;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      processing: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </DialogTitle>
              <DialogDescription>
                Order ID: {orderId.slice(0, 8)} • {customerEmail}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
                disabled={!order}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendReceipt}
                disabled={sendingEmail || !customerEmail}
              >
                {sendingEmail ? (
                  <>
                    <Printer className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Receipt
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading order details...
          </div>
        ) : !order ? (
          <div className="py-8 text-center text-muted-foreground">
            Order not found
          </div>
        ) : (
          <div ref={printRef}>
            {/* Header for Print */}
            <div className="header" style={{ display: "none" }}>
              <h1>Cabinet Store</h1>
              <p>Order Receipt</p>
            </div>

            <div className="space-y-6">
              {/* Order Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-mono text-sm">{order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(order.created_at), "MMMM dd, yyyy 'at' h:mm a")}
                </div>
              </div>

              <Separator />

              {/* Customer Information */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Company</p>
                    <p className="font-medium">
                      {order.profiles?.company_name || "Individual Customer"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{customerEmail || "N/A"}</p>
                  </div>
                  {order.profiles?.phone && (
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{order.profiles.phone}</p>
                    </div>
                  )}
                  {order.profiles?.business_type && (
                    <div>
                      <p className="text-muted-foreground">Business Type</p>
                      <p className="font-medium capitalize">{order.profiles.business_type}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Shipping Address */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </h3>
                <div className="text-sm bg-muted p-4 rounded-lg">
                  {order.shipping_address ? (
                    <>
                      <p className="font-medium">{order.shipping_address.fullName}</p>
                      <p>{order.shipping_address.address}</p>
                      {order.shipping_address.address2 && (
                        <p>{order.shipping_address.address2}</p>
                      )}
                      <p>
                        {order.shipping_address.city}, {order.shipping_address.state}{" "}
                        {order.shipping_address.zipCode}
                      </p>
                      <p>{order.shipping_address.country || "United States"}</p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">No shipping address provided</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Order Items
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Product</th>
                        <th className="text-center p-3 text-sm font-medium">Quantity</th>
                        <th className="text-right p-3 text-sm font-medium">Price</th>
                        <th className="text-right p-3 text-sm font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.order_items.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {item.product_image_url && (
                                <img
                                  src={item.product_image_url}
                                  alt={item.product_name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <span className="font-medium">{item.product_name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right">
                            ${Number(item.price_at_purchase).toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-medium">
                            ${(Number(item.price_at_purchase) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              {/* Payment Breakdown */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Summary
                </h3>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${Number(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">${Number(order.tax).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">${Number(order.shipping).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold pt-2">
                    <span>Total</span>
                    <span>${Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Email Preview Dialog */}
      {order && (
        <EmailPreviewDialog
          open={showPreview}
          onOpenChange={setShowPreview}
          order={order}
          customerEmail={customerEmail}
          customerProfile={order.profiles}
          emailType="manual"
        />
      )}
    </Dialog>
  );
};
