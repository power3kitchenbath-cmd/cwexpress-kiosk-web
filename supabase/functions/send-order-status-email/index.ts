import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderStatusEmailRequest {
  orderId: string;
  oldStatus: string | null;
  newStatus: string;
  notes?: string;
}

const getStatusEmoji = (status: string): string => {
  const emojiMap: Record<string, string> = {
    pending: "⏳",
    processing: "🔄",
    shipped: "📦",
    delivered: "✅",
    cancelled: "❌",
  };
  return emojiMap[status] || "📋";
};

const getStatusMessage = (status: string): string => {
  const messages: Record<string, string> = {
    pending: "Your order has been received and is pending processing.",
    processing: "Your order is being prepared for shipment.",
    shipped: "Your order has been shipped and is on its way!",
    delivered: "Your order has been delivered successfully.",
    cancelled: "Your order has been cancelled.",
  };
  return messages[status] || "Your order status has been updated.";
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { orderId, oldStatus, newStatus, notes }: OrderStatusEmailRequest =
      await req.json();

    console.log("Processing status email for order:", orderId);

    // Fetch order details
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select(`
        *,
        order_items (
          product_name,
          quantity,
          price_at_purchase
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order:", orderError);
      throw new Error("Order not found");
    }

    // Get user email from auth
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(
      order.user_id
    );

    if (userError || !user?.email) {
      console.error("Error fetching user:", userError);
      throw new Error("User email not found");
    }

    const statusEmoji = getStatusEmoji(newStatus);
    const statusMessage = getStatusMessage(newStatus);

    // Create order items list
    const itemsList = order.order_items
      .map(
        (item: any) =>
          `<li style="margin-bottom: 8px;">
            <strong>${item.product_name}</strong> - Qty: ${item.quantity} - $${Number(item.price_at_purchase).toFixed(2)}
          </li>`
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Order Status Update ${statusEmoji}</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #667eea; margin-top: 0;">Hello!</h2>
            
            <p style="font-size: 16px; margin: 20px 0;">
              ${statusMessage}
            </p>

            ${oldStatus ? `
              <p style="font-size: 14px; color: #666; margin: 10px 0;">
                Status changed from <strong style="text-transform: capitalize;">${oldStatus}</strong> to <strong style="text-transform: capitalize; color: #667eea;">${newStatus}</strong>
              </p>
            ` : ''}

            ${notes ? `
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                  <strong>Note:</strong> ${notes}
                </p>
              </div>
            ` : ''}

            <div style="margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #333;">Order Details</h3>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId.slice(0, 8)}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Total:</strong> $${Number(order.total).toFixed(2)}</p>
              
              <h4 style="margin-top: 20px; margin-bottom: 10px;">Items:</h4>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${itemsList}
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '')}/orders" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: 600;">
                View Order Details
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Cabinet Store <onboarding@resend.dev>",
      to: [user.email],
      subject: `Order Status Update: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} ${statusEmoji}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-status-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
