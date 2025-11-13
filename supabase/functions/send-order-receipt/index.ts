import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderReceiptRequest {
  orderId: string;
  emailType: "confirmation" | "manual" | "delivery";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, emailType }: OrderReceiptRequest = await req.json();

    console.log(`Processing ${emailType} receipt for order ${orderId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order details with items
    const { data: order, error: orderError } = await supabase
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
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message}`);
    }

    // Fetch customer email
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(
      order.user_id
    );

    if (userError || !user?.email) {
      throw new Error(`Customer email not found: ${userError?.message}`);
    }

    // Fetch profile info
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, phone, business_type")
      .eq("id", order.user_id)
      .maybeSingle();

    // Generate email subject based on type
    const subjects = {
      confirmation: `Order Confirmation #${orderId.slice(0, 8)}`,
      manual: `Your Receipt for Order #${orderId.slice(0, 8)}`,
      delivery: `Order Delivered - Receipt #${orderId.slice(0, 8)}`,
    };

    const subject = subjects[emailType];

    // Generate order items HTML
    const itemsHtml = order.order_items
      .map(
        (item: any) => `
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

    // Build HTML email
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="margin: 0 0 8px; color: #18181b; font-size: 24px;">${subject}</h1>
                <p style="margin: 0; color: #71717a; font-size: 14px;">
                  Order Date: ${new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <!-- Order Status -->
              <div style="background-color: #f4f4f5; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-size: 14px; color: #71717a; margin-bottom: 4px;">Order ID</div>
                    <div style="font-weight: 600; color: #18181b;">#${orderId.slice(0, 8)}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 14px; color: #71717a; margin-bottom: 4px;">Status</div>
                    <div style="font-weight: 600; color: #18181b; text-transform: capitalize;">${order.status}</div>
                  </div>
                </div>
              </div>

              <!-- Customer Info -->
              ${profile?.company_name ? `
                <div style="margin-bottom: 24px;">
                  <h3 style="margin: 0 0 12px; color: #18181b; font-size: 16px;">Customer Information</h3>
                  <div style="color: #71717a; font-size: 14px; line-height: 1.6;">
                    ${profile.company_name ? `<div><strong>Company:</strong> ${profile.company_name}</div>` : ''}
                    ${profile.phone ? `<div><strong>Phone:</strong> ${profile.phone}</div>` : ''}
                    ${profile.business_type ? `<div><strong>Type:</strong> ${profile.business_type}</div>` : ''}
                    <div><strong>Email:</strong> ${user.email}</div>
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
                ${emailType === 'confirmation' ? '<p>Thank you for your order! We\'ll send you shipping updates as your order is processed.</p>' : ''}
                ${emailType === 'delivery' ? '<p>Your order has been delivered! Thank you for your business.</p>' : ''}
                ${emailType === 'manual' ? '<p>Thank you for your business!</p>' : ''}
                <p style="margin-top: 16px;">If you have any questions, please contact our customer service.</p>
              </div>

            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: "Cabinet Store <onboarding@resend.dev>",
      to: [user.email],
      subject: subject,
      html: html,
    });

    if (emailError) {
      throw emailError;
    }

    console.log(`Successfully sent ${emailType} receipt to ${user.email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Receipt sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-order-receipt function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
