import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface QuoteRequest {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  door_style: string;
  design_image_url: string;
  design_settings: {
    opacity: number;
    brightness: number;
    scale: number;
  };
  message?: string;
  quote_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const quoteRequest: QuoteRequest = await req.json();
    console.log("Processing quote request:", quoteRequest);

    // Initialize Supabase client to get admin emails
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get admin users
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError) {
      console.error("Error fetching admin roles:", rolesError);
      throw new Error("Failed to fetch admin users");
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admin users found, sending to default email");
      // Fallback to a default email if no admins found
      const fallbackEmail = "admin@example.com"; // You should update this
      
      const emailResponse = await resend.emails.send({
        from: "3 Power Quote Requests <onboarding@resend.dev>",
        to: [fallbackEmail],
        subject: `New Cabinet Door Quote Request - ${quoteRequest.door_style}`,
        html: generateEmailHtml(quoteRequest),
      });

      console.log("Email sent to fallback address:", emailResponse);
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Get admin email addresses
    const adminIds = adminRoles.map((role) => role.user_id);
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw new Error("Failed to fetch admin email addresses");
    }

    const adminEmails = users
      .filter((user) => adminIds.includes(user.id))
      .map((user) => user.email)
      .filter((email): email is string => !!email);

    if (adminEmails.length === 0) {
      console.log("No admin emails found, sending to default");
      // Fallback if no valid admin emails
      adminEmails.push("admin@example.com");
    }

    console.log(`Sending quote request to ${adminEmails.length} admin(s)`);

    // Send email to all admins
    const emailResponse = await resend.emails.send({
      from: "3 Power Quote Requests <onboarding@resend.dev>",
      to: adminEmails,
      subject: `New Cabinet Door Quote Request - ${quoteRequest.door_style}`,
      html: generateEmailHtml(quoteRequest),
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-quote-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateEmailHtml(quoteRequest: QuoteRequest): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          padding: 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content {
          background: #f9fafb;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .detail-row {
          margin: 15px 0;
          padding: 10px;
          background: white;
          border-left: 4px solid #3b82f6;
          border-radius: 4px;
        }
        .detail-label {
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 5px;
        }
        .design-preview {
          margin: 20px 0;
          text-align: center;
        }
        .design-preview img {
          max-width: 100%;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin: 15px 0;
        }
        .setting-box {
          background: white;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
          border: 1px solid #e5e7eb;
        }
        .setting-value {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af;
        }
        .setting-label {
          font-size: 12px;
          color: #6b7280;
          margin-top: 5px;
        }
        .footer {
          background: #374151;
          color: white;
          padding: 20px;
          border-radius: 0 0 10px 10px;
          text-align: center;
          font-size: 12px;
        }
        .cta-button {
          display: inline-block;
          background: #1e40af;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0;">🏠 New Quote Request</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Doormark Cabinet Door Visualizer</p>
      </div>
      
      <div class="content">
        <h2 style="color: #1e40af; margin-top: 0;">Customer Information</h2>
        
        <div class="detail-row">
          <div class="detail-label">Customer Name</div>
          <div>${quoteRequest.customer_name}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Email</div>
          <div><a href="mailto:${quoteRequest.customer_email}" style="color: #3b82f6;">${quoteRequest.customer_email}</a></div>
        </div>
        
        ${quoteRequest.customer_phone ? `
        <div class="detail-row">
          <div class="detail-label">Phone</div>
          <div><a href="tel:${quoteRequest.customer_phone}" style="color: #3b82f6;">${quoteRequest.customer_phone}</a></div>
        </div>
        ` : ''}
        
        <h2 style="color: #1e40af; margin-top: 30px;">Design Details</h2>
        
        <div class="detail-row">
          <div class="detail-label">Door Style</div>
          <div style="font-size: 18px; font-weight: bold;">${quoteRequest.door_style}</div>
        </div>
        
        <div class="settings-grid">
          <div class="setting-box">
            <div class="setting-value">${quoteRequest.design_settings.opacity}%</div>
            <div class="setting-label">Opacity</div>
          </div>
          <div class="setting-box">
            <div class="setting-value">${quoteRequest.design_settings.brightness}%</div>
            <div class="setting-label">Brightness</div>
          </div>
          <div class="setting-box">
            <div class="setting-value">${quoteRequest.design_settings.scale}%</div>
            <div class="setting-label">Scale</div>
          </div>
        </div>
        
        ${quoteRequest.message ? `
        <div class="detail-row">
          <div class="detail-label">Customer Message</div>
          <div style="white-space: pre-wrap;">${quoteRequest.message}</div>
        </div>
        ` : ''}
        
        <div class="design-preview">
          <h3 style="color: #1e40af;">Design Preview</h3>
          <img src="${quoteRequest.design_image_url}" alt="Cabinet Door Design Preview" />
        </div>
        
        <div style="text-align: center;">
          <a href="${Deno.env.get("SUPABASE_URL")}/auth/v1/authorize?provider=email" class="cta-button">
            View Quote Request Details
          </a>
        </div>
      </div>
      
      <div class="footer">
        <p style="margin: 0;">Quote Request ID: ${quoteRequest.quote_id}</p>
        <p style="margin: 10px 0 0 0;">3 Power - Premium Cabinet Solutions</p>
      </div>
    </body>
    </html>
  `;
}

serve(handler);
