import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";

interface EmailPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string;
    status: string;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    shipping_address: any;
    created_at: string;
    order_items: Array<{
      product_name: string;
      quantity: number;
      price_at_purchase: number;
    }>;
  };
  customerEmail: string;
  customerProfile?: {
    company_name: string | null;
    phone: string | null;
    business_type: string | null;
  } | null;
  emailType: "confirmation" | "manual" | "delivery";
}

export const EmailPreviewDialog = ({
  open,
  onOpenChange,
  order,
  customerEmail,
  customerProfile,
  emailType,
}: EmailPreviewDialogProps) => {
  const [sendingTest, setSendingTest] = useState(false);
  const { toast } = useToast();

  const handleSendTestEmail = async () => {
    setSendingTest(true);
    try {
      // Get current admin user email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error("Admin email not found");
      }

      const { error } = await supabase.functions.invoke("send-order-receipt", {
        body: {
          orderId: order.id,
          emailType: emailType,
          testEmail: user.email,
        },
      });

      if (error) throw error;

      toast({
        title: "Test email sent",
        description: `Preview sent to ${user.email}`,
      });
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setSendingTest(false);
    }
  };

  const subjects = {
    confirmation: `Order Confirmation #${order.id.slice(0, 8)}`,
    manual: `Your Receipt for Order #${order.id.slice(0, 8)}`,
    delivery: `Order Delivered - Receipt #${order.id.slice(0, 8)}`,
  };

  const footerMessages = {
    confirmation: "Thank you for your order! We'll send you shipping updates as your order is processed.",
    delivery: "Your order has been delivered! Thank you for your business.",
    manual: "Thank you for your business!",
  };

  const itemsHtml = order.order_items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <div style="font-weight: 500;">${item.product_name}</div>
            <div style="color: #666; font-size: 14px;">Qty: ${item.quantity}</div>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
            $${(item.price_at_purchase * item.quantity).toFixed(2)}
          </td>
        </tr>
      `
    )
    .join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subjects[emailType]}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="margin: 0 0 8px; color: #18181b; font-size: 24px;">${subjects[emailType]}</h1>
              <p style="margin: 0; color: #71717a; font-size: 14px;">
                Order Date: ${format(new Date(order.created_at), "MMMM d, yyyy")}
              </p>
            </div>

            <!-- Order Status -->
            <div style="background-color: #f4f4f5; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 14px; color: #71717a; margin-bottom: 4px;">Order ID</div>
                  <div style="font-weight: 600; color: #18181b;">#${order.id.slice(0, 8)}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 14px; color: #71717a; margin-bottom: 4px;">Status</div>
                  <div style="font-weight: 600; color: #18181b; text-transform: capitalize;">${order.status}</div>
                </div>
              </div>
            </div>

            <!-- Customer Info -->
            ${customerProfile?.company_name ? `
              <div style="margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px; color: #18181b; font-size: 16px;">Customer Information</h3>
                <div style="color: #71717a; font-size: 14px; line-height: 1.6;">
                  ${customerProfile.company_name ? `<div><strong>Company:</strong> ${customerProfile.company_name}</div>` : ''}
                  ${customerProfile.phone ? `<div><strong>Phone:</strong> ${customerProfile.phone}</div>` : ''}
                  ${customerProfile.business_type ? `<div><strong>Type:</strong> ${customerProfile.business_type}</div>` : ''}
                  <div><strong>Email:</strong> ${customerEmail}</div>
                </div>
              </div>
            ` : ''}

            <!-- Shipping Address -->
            <div style="margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px; color: #18181b; font-size: 16px;">Shipping Address</h3>
              <div style="color: #71717a; font-size: 14px; line-height: 1.6;">
                ${order.shipping_address.name}<br>
                ${order.shipping_address.street}<br>
                ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zip}
              </div>
            </div>

            <!-- Order Items -->
            <div style="margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px; color: #18181b; font-size: 16px;">Order Items</h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
              </table>
            </div>

            <!-- Payment Summary -->
            <div style="background-color: #f4f4f5; border-radius: 6px; padding: 20px;">
              <h3 style="margin: 0 0 16px; color: #18181b; font-size: 16px;">Payment Summary</h3>
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #71717a;">Subtotal</td>
                  <td style="padding: 8px 0; text-align: right; color: #18181b;">$${Number(order.subtotal).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a;">Tax (8.25%)</td>
                  <td style="padding: 8px 0; text-align: right; color: #18181b;">$${Number(order.tax).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #71717a;">
                    Shipping
                    ${Number(order.shipping) === 0 ? '<span style="color: #22c55e; font-weight: 600;">(Free)</span>' : ''}
                  </td>
                  <td style="padding: 8px 0; text-align: right; color: #18181b;">$${Number(order.shipping).toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #d4d4d8;">
                  <td style="padding: 12px 0; font-weight: 600; color: #18181b; font-size: 16px;">Total</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #18181b; font-size: 16px;">$${Number(order.total).toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <!-- Footer Message -->
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e4e4e7; text-align: center; color: #71717a; font-size: 14px;">
              <p>${footerMessages[emailType]}</p>
              <p style="margin-top: 16px;">If you have any questions, please contact our customer service.</p>
            </div>

          </div>
        </div>
      </body>
    </html>
  `;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Email Preview</DialogTitle>
          <DialogDescription>
            Preview of the email that will be sent to {customerEmail}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Visual Preview</TabsTrigger>
            <TabsTrigger value="html">HTML Source</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="h-[600px] overflow-y-auto border rounded-md">
            <iframe
              srcDoc={emailHtml}
              title="Email Preview"
              className="w-full h-full border-0"
              sandbox="allow-same-origin"
            />
          </TabsContent>

          <TabsContent value="html" className="h-[600px] overflow-y-auto">
            <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
              <code>{emailHtml}</code>
            </pre>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <div>
              <strong>Subject:</strong> {subjects[emailType]}
            </div>
            <div>
              <strong>To:</strong> {customerEmail}
            </div>
          </div>
          <Button
            onClick={handleSendTestEmail}
            disabled={sendingTest}
            variant="secondary"
          >
            {sendingTest ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Test...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Test to Me
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
