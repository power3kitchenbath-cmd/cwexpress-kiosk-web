import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportRequest {
  frequency?: "weekly" | "monthly";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { frequency } = await req.json() as ReportRequest;
    console.log(`Starting analytics report generation for frequency: ${frequency || "all"}`);

    // Get report configurations
    const { data: configs, error: configError } = await supabase
      .from("analytics_report_config")
      .select("*")
      .neq("frequency", "disabled");

    if (configError) {
      console.error("Error fetching report configs:", configError);
      throw configError;
    }

    if (!configs || configs.length === 0) {
      console.log("No active report configurations found");
      return new Response(
        JSON.stringify({ message: "No active report configurations" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter by frequency if provided
    const targetConfigs = frequency
      ? configs.filter((c) => c.frequency === frequency)
      : configs;

    if (targetConfigs.length === 0) {
      console.log(`No configurations for frequency: ${frequency}`);
      return new Response(
        JSON.stringify({ message: `No configurations for frequency: ${frequency}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate date range based on frequency
    const now = new Date();
    const startDate = new Date();
    
    if (frequency === "weekly") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (frequency === "monthly") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      // Default to last 30 days
      startDate.setDate(startDate.getDate() - 30);
    }

    console.log(`Fetching email data from ${startDate.toISOString()} to ${now.toISOString()}`);

    // Fetch email tracking data
    const { data: emailData, error: emailError } = await supabase
      .from("email_tracking")
      .select("*")
      .gte("sent_at", startDate.toISOString());

    if (emailError) {
      console.error("Error fetching email data:", emailError);
      throw emailError;
    }

    if (!emailData || emailData.length === 0) {
      console.log("No email data found for the period");
      return new Response(
        JSON.stringify({ message: "No email data found for the period" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate statistics
    const total = emailData.length;
    const sent = emailData.filter((e) => e.status === "sent" || e.status === "delivered").length;
    const opened = emailData.filter((e) => e.opened_at !== null).length;
    const failed = emailData.filter((e) => e.status === "failed").length;
    const bounced = emailData.filter((e) => e.status === "bounced").length;

    const deliveryRate = total > 0 ? ((sent / total) * 100).toFixed(2) : "0.00";
    const openRate = sent > 0 ? ((opened / sent) * 100).toFixed(2) : "0.00";
    const failureRate = total > 0 ? (((failed + bounced) / total) * 100).toFixed(2) : "0.00";

    const periodLabel = frequency === "weekly" ? "Last 7 Days" : frequency === "monthly" ? "Last 30 Days" : "Recent Period";

    // Generate HTML email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
            .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 5px; }
            .stat-value { font-size: 32px; font-weight: bold; color: #1f2937; }
            .stat-subtitle { font-size: 14px; color: #6b7280; margin-top: 5px; }
            .summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
            .success { color: #10b981; }
            .warning { color: #f59e0b; }
            .error { color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Email Analytics Report</h1>
              <p>${periodLabel}</p>
            </div>
            <div class="content">
              <div class="summary">
                <h2>Executive Summary</h2>
                <p>Your email delivery system sent <strong>${total}</strong> emails during this period with a delivery rate of <strong>${deliveryRate}%</strong> and an open rate of <strong>${openRate}%</strong>.</p>
              </div>

              <div class="stat-grid">
                <div class="stat-card">
                  <div class="stat-label">Total Emails</div>
                  <div class="stat-value">${total}</div>
                  <div class="stat-subtitle">Sent in period</div>
                </div>

                <div class="stat-card">
                  <div class="stat-label">Delivery Rate</div>
                  <div class="stat-value ${Number(deliveryRate) >= 95 ? "success" : Number(deliveryRate) >= 80 ? "warning" : "error"}">${deliveryRate}%</div>
                  <div class="stat-subtitle">${sent} delivered</div>
                </div>

                <div class="stat-card">
                  <div class="stat-label">Open Rate</div>
                  <div class="stat-value ${Number(openRate) >= 20 ? "success" : Number(openRate) >= 10 ? "warning" : ""}">${openRate}%</div>
                  <div class="stat-subtitle">${opened} opened</div>
                </div>

                <div class="stat-card">
                  <div class="stat-label">Failure Rate</div>
                  <div class="stat-value ${Number(failureRate) <= 5 ? "success" : Number(failureRate) <= 10 ? "warning" : "error"}">${failureRate}%</div>
                  <div class="stat-subtitle">${failed + bounced} failed</div>
                </div>
              </div>

              <div class="summary">
                <h3>Detailed Breakdown</h3>
                <ul>
                  <li><strong>Successfully Delivered:</strong> ${sent} emails (${deliveryRate}%)</li>
                  <li><strong>Opened:</strong> ${opened} emails (${openRate}% open rate)</li>
                  <li><strong>Failed:</strong> ${failed} emails</li>
                  <li><strong>Bounced:</strong> ${bounced} emails</li>
                </ul>
              </div>

              ${Number(failureRate) > 10 ? `
                <div class="summary" style="border-left: 4px solid #ef4444;">
                  <h3>⚠️ Action Required</h3>
                  <p>Your failure rate is above 10%. Consider reviewing your email list quality and investigating bounce reasons in the admin dashboard.</p>
                </div>
              ` : ""}

              <div class="footer">
                <p>This is an automated report generated by your email analytics system.</p>
                <p>To manage your report settings, visit your admin dashboard.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send emails to all configured admins
    const emailPromises = targetConfigs.map(async (config) => {
      try {
        console.log(`Sending report to ${config.admin_email}`);
        
        const { data, error } = await resend.emails.send({
          from: "Analytics Report <onboarding@resend.dev>",
          to: [config.admin_email],
          subject: `📊 ${frequency === "weekly" ? "Weekly" : frequency === "monthly" ? "Monthly" : ""} Email Analytics Report`,
          html: htmlContent,
        });

        if (error) {
          console.error(`Failed to send to ${config.admin_email}:`, error);
          return { email: config.admin_email, success: false, error };
        }

        // Update last_sent_at
        await supabase
          .from("analytics_report_config")
          .update({ last_sent_at: new Date().toISOString() })
          .eq("id", config.id);

        console.log(`Successfully sent report to ${config.admin_email}`);
        return { email: config.admin_email, success: true, data };
      } catch (error) {
        console.error(`Error sending to ${config.admin_email}:`, error);
        return { email: config.admin_email, success: false, error };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r) => r.success).length;

    console.log(`Report generation complete. Sent ${successCount}/${results.length} emails successfully`);

    return new Response(
      JSON.stringify({
        message: `Sent ${successCount}/${results.length} reports successfully`,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-analytics-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
