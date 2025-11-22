import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  name?: string;
  phone?: string;
  companyName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, phone, companyName }: EmailRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate tracking token
    const trackingToken = crypto.randomUUID();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID if authenticated
    const authHeader = req.headers.get("authorization");
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Create tracking record
    const { error: dbError } = await supabase
      .from("pricing_guide_requests")
      .insert({
        email,
        name,
        phone,
        company_name: companyName,
        request_type: "email",
        user_id: userId,
        tracking_token: trackingToken,
        sent_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("Database error:", dbError);
    }

    // Create email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #193a82 0%, #1e4ba8 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              background: white;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .cta-button {
              display: inline-block;
              background: #193a82;
              color: white;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
            }
            .features {
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .features ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .features li {
              margin: 8px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
              margin-top: 20px;
            }
            .tracking-pixel {
              width: 1px;
              height: 1px;
              display: block;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏗️ 3 Power Cabinet Store</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your Transparent Pricing Guide</p>
          </div>
          
          <div class="content">
            <p>Hi${name ? ` ${name}` : ''},</p>
            
            <p>Thank you for your interest in our transparent pricing! We believe in honest pricing and want you to see exactly how we compare to the competition.</p>
            
            <div class="features">
              <strong>📊 What's Inside This Guide:</strong>
              <ul>
                <li>Complete pricing comparison vs Home Depot, Lowe's, and Cabinets to Go</li>
                <li>Kitchen cabinet installation packages (Good, Better, Best tiers)</li>
                <li>Bathroom vanity installation pricing</li>
                <li>Replacement cabinet doors pricing</li>
                <li>Cabinet hardware and countertops pricing</li>
                <li>Our pricing philosophy and 45% profit margin transparency</li>
                <li>Price match guarantee details</li>
              </ul>
            </div>
            
            <p style="text-align: center;">
              <a href="${supabaseUrl}/functions/v1/download-pricing-guide?token=${trackingToken}" class="cta-button">
                📥 Download Your Pricing Guide
              </a>
            </p>
            
            <p><strong>Why Choose 3 Power Cabinet Store?</strong></p>
            <ul>
              <li>✅ <strong>45% Target Profit Margin</strong> - Ensures quality materials and service</li>
              <li>✅ <strong>100% Price Transparency</strong> - No hidden fees or surprise charges</li>
              <li>✅ <strong>Average $500+ Savings</strong> - Competitive pricing you can trust</li>
              <li>✅ <strong>Price Match Promise</strong> - We'll match or beat comparable quotes</li>
            </ul>
            
            <p>Have questions? Feel free to reply to this email or visit our showroom. We're here to help!</p>
            
            <p>Best regards,<br>
            <strong>The 3 Power Cabinet Store Team</strong></p>
          </div>
          
          <div class="footer">
            <p><strong>CABINETS • COUNTERTOPS • FLOORS</strong></p>
            <p>Factory Direct Pricing - Professional Quality</p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 15px;">
              You received this email because you requested our pricing guide.<br>
              <a href="${supabaseUrl}/functions/v1/unsubscribe-pricing-guide?email=${encodeURIComponent(email)}&token=${trackingToken}" style="color: #193a82; text-decoration: underline;">Unsubscribe from follow-ups</a>
            </p>
          </div>
          
          <img src="${supabaseUrl}/functions/v1/track-pricing-guide-open?token=${trackingToken}" class="tracking-pixel" alt="" />
        </body>
      </html>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "3 Power Cabinet Store <onboarding@resend.dev>",
      to: [email],
      subject: "Your Transparent Pricing Guide - 3 Power Cabinet Store",
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Pricing guide sent successfully!"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending pricing guide:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send pricing guide" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
