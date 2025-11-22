import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const token = url.searchParams.get("token");

    if (!email || !token) {
      return new Response(
        JSON.stringify({ error: "Email and token are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify token matches and update unsubscribe status
    const { data: request, error: fetchError } = await supabase
      .from("pricing_guide_requests")
      .select("*")
      .eq("email", email)
      .eq("tracking_token", token)
      .maybeSingle();

    if (fetchError || !request) {
      console.error("Error finding request:", fetchError);
      return new Response(
        JSON.stringify({ error: "Invalid unsubscribe link" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update unsubscribe status
    const { error: updateError } = await supabase
      .from("pricing_guide_requests")
      .update({ 
        unsubscribed: true,
        unsubscribed_at: new Date().toISOString()
      })
      .eq("email", email);

    if (updateError) {
      console.error("Error updating unsubscribe status:", updateError);
      throw updateError;
    }

    console.log(`Successfully unsubscribed ${email}`);

    // Return HTML confirmation page
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Unsubscribed - 3 Power Cabinet Store</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 40px 20px;
              background: #f9fafb;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 {
              color: #193a82;
              margin-top: 0;
            }
            .success-icon {
              font-size: 48px;
              text-align: center;
              margin-bottom: 20px;
            }
            .message {
              margin: 20px 0;
              font-size: 16px;
            }
            .note {
              background: #f9fafb;
              padding: 15px;
              border-radius: 4px;
              margin: 20px 0;
              font-size: 14px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✓</div>
            <h1>You've Been Unsubscribed</h1>
            <p class="message">
              <strong>${email}</strong> has been successfully unsubscribed from our pricing guide follow-up emails.
            </p>
            <div class="note">
              <strong>What this means:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>You will no longer receive automated follow-up emails about the pricing guide</li>
                <li>You can still request quotes or contact us directly anytime</li>
                <li>You may still receive order confirmations if you place an order</li>
              </ul>
            </div>
            <p>
              We're sorry to see you go! If you change your mind or have any questions about our products and services, feel free to reach out to us directly.
            </p>
            <div class="footer">
              <p><strong>3 Power Cabinet Store</strong></p>
              <p>CABINETS • COUNTERTOPS • FLOORS</p>
              <p style="font-size: 12px; margin-top: 10px;">
                Factory Direct Pricing - Professional Quality
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    return new Response(confirmationHtml, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html",
      },
    });
  } catch (error: any) {
    console.error("Error processing unsubscribe:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process unsubscribe" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
