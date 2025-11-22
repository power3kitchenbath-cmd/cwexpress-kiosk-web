import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FollowUpEmail {
  day: number;
  subject: string;
  message: string;
}

const followUpSequence: FollowUpEmail[] = [
  {
    day: 2,
    subject: "Still interested in your cabinet project? 🏗️",
    message: `
      <p>Hi there!</p>
      <p>We noticed you downloaded our pricing guide a couple days ago. Have you had a chance to review it?</p>
      <p>We'd love to help you with your cabinet project! Here's what makes us different:</p>
      <ul>
        <li>✅ <strong>45% Target Profit Margin</strong> - Transparent pricing you can trust</li>
        <li>✅ <strong>Price Match Guarantee</strong> - We'll match or beat comparable quotes</li>
        <li>✅ <strong>Factory Direct Pricing</strong> - Cut out the middleman</li>
      </ul>
      <p>Ready to get started? Simply reply to this email or use our <a href="${Deno.env.get('VITE_SUPABASE_URL')?.replace('https://ofgncyruijfnkiutnkxa.supabase.co', 'https://your-app-url.com')}/cabinet-visualizer">online quote request tool</a> to share your project details.</p>
      <p>We typically respond within 24 hours with a detailed estimate.</p>
    `
  },
  {
    day: 5,
    subject: "Schedule your FREE cabinet consultation 📅",
    message: `
      <p>Hi again!</p>
      <p>We wanted to reach out one more time about your cabinet project.</p>
      <p><strong>Would you like to schedule a FREE consultation?</strong></p>
      <p>During your consultation, we'll:</p>
      <ul>
        <li>📐 Review your space and measurements</li>
        <li>🎨 Show you door style and finish options</li>
        <li>💰 Provide a detailed, transparent quote</li>
        <li>🤝 Answer all your questions</li>
      </ul>
      <p>No pressure, no obligation - just expert guidance for your project.</p>
      <p><strong>Reply to this email to schedule your consultation, or call us during business hours.</strong></p>
    `
  },
  {
    day: 7,
    subject: "Don't miss out - Special pricing ending soon! ⏰",
    message: `
      <p>This is our final reminder about your cabinet project.</p>
      <p>We understand you're busy, but we didn't want you to miss this opportunity:</p>
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 18px; color: #193a82;"><strong>💎 Current Promotions Available</strong></p>
        <p style="margin: 10px 0 0 0;">Our competitive pricing and special offers are available for a limited time.</p>
      </div>
      <p><strong>Why choose 3 Power Cabinet Store?</strong></p>
      <ul>
        <li>✅ Average $500+ savings vs competitors</li>
        <li>✅ 100% transparent pricing - no hidden fees</li>
        <li>✅ Professional installation available</li>
        <li>✅ Price match guarantee</li>
      </ul>
      <p>This is your last reminder from us. If you'd like to move forward, reply to this email or request a quote on our website.</p>
      <p>We'd love to help bring your vision to life!</p>
    `
  }
];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting drip campaign check...");

    // Find all customers who opened the pricing guide
    const { data: openedRequests, error: fetchError } = await supabase
      .from("pricing_guide_requests")
      .select("*")
      .not("opened_at", "is", null)
      .order("opened_at", { ascending: true });

    if (fetchError) {
      console.error("Error fetching pricing guide requests:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${openedRequests?.length || 0} opened pricing guide requests`);

    let emailsSent = 0;
    const now = new Date();

    for (const request of openedRequests || []) {
      // Skip if unsubscribed
      if (request.unsubscribed) {
        console.log(`Skipping ${request.email} - unsubscribed`);
        continue;
      }

      // Check if customer has requested a quote
      const { data: quoteRequests } = await supabase
        .from("quote_requests")
        .select("id")
        .eq("customer_email", request.email)
        .limit(1);

      // Skip if they already requested a quote
      if (quoteRequests && quoteRequests.length > 0) {
        console.log(`Skipping ${request.email} - already requested a quote`);
        continue;
      }

      // Calculate days since opened
      const openedAt = new Date(request.opened_at!);
      const daysSinceOpened = Math.floor((now.getTime() - openedAt.getTime()) / (1000 * 60 * 60 * 24));

      // Check which follow-ups have been sent
      const followUpsSent = request.follow_ups_sent || [];
      const sentDays = followUpsSent.map((f: any) => f.day);

      // Find which follow-up to send
      for (const followUp of followUpSequence) {
        if (daysSinceOpened >= followUp.day && !sentDays.includes(followUp.day)) {
          console.log(`Sending day ${followUp.day} follow-up to ${request.email}`);

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
                    font-size: 24px;
                  }
                  .content {
                    background: white;
                    padding: 30px;
                    border: 1px solid #e5e7eb;
                    border-top: none;
                  }
                  .content ul {
                    padding-left: 20px;
                  }
                  .content li {
                    margin: 10px 0;
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
                  .footer {
                    text-align: center;
                    padding: 20px;
                    color: #6b7280;
                    font-size: 14px;
                    border-top: 1px solid #e5e7eb;
                    margin-top: 20px;
                  }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>🏗️ 3 Power Cabinet Store</h1>
                </div>
                
                <div class="content">
                  ${followUp.message}
                  
                  <p style="text-align: center; margin-top: 30px;">
                    <a href="${supabaseUrl.replace('ofgncyruijfnkiutnkxa.supabase.co', 'your-app-url.com')}/cabinet-visualizer" class="cta-button">
                      Request Your Quote Now
                    </a>
                  </p>
                  
                  <p>Best regards,<br>
                  <strong>The 3 Power Cabinet Store Team</strong></p>
                </div>
                
                <div class="footer">
                  <p><strong>CABINETS • COUNTERTOPS • FLOORS</strong></p>
                  <p>Factory Direct Pricing - Professional Quality</p>
                  <p style="font-size: 12px; color: #9ca3af; margin-top: 15px;">
                    You received this follow-up because you requested our pricing guide.<br>
                    <a href="${supabaseUrl}/functions/v1/unsubscribe-pricing-guide?email=${encodeURIComponent(request.email)}&token=${request.tracking_token}" style="color: #193a82; text-decoration: underline;">Unsubscribe from follow-ups</a>
                  </p>
                </div>
              </body>
            </html>
          `;

          // Send email
          try {
            await resend.emails.send({
              from: "3 Power Cabinet Store <onboarding@resend.dev>",
              to: [request.email],
              subject: followUp.subject,
              html: emailHtml,
            });

            // Update follow_ups_sent
            const updatedFollowUps = [
              ...followUpsSent,
              { day: followUp.day, sent_at: now.toISOString() }
            ];

            await supabase
              .from("pricing_guide_requests")
              .update({ follow_ups_sent: updatedFollowUps })
              .eq("id", request.id);

            emailsSent++;
            console.log(`Successfully sent day ${followUp.day} follow-up to ${request.email}`);
          } catch (emailError) {
            console.error(`Failed to send email to ${request.email}:`, emailError);
          }

          // Only send one follow-up per customer per run
          break;
        }
      }
    }

    console.log(`Drip campaign complete. Sent ${emailsSent} follow-up emails.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${emailsSent} follow-up emails`,
        emails_sent: emailsSent
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in drip campaign:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to run drip campaign" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
