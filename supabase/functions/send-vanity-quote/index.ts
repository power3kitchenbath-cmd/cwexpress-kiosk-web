import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VanityQuoteRequest {
  customerName: string;
  customerEmail: string;
  vanity: {
    tier: "good" | "better" | "best";
    quantity: number;
    basePrice: number;
    singleToDouble: boolean;
    plumbingWallChange: boolean;
    conversionCost: number;
    plumbingCost: number;
  };
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    notes: string;
  }>;
  grandTotal: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing vanity quote email request");
    
    const {
      customerName,
      customerEmail,
      vanity,
      lineItems,
      grandTotal,
    }: VanityQuoteRequest = await req.json();

    console.log("Sending vanity quote to:", customerEmail);

    // Build tier label
    const tierLabels = {
      good: "Value Package ($1,400-$1,800)",
      better: "Mid-Range Package ($1,900-$2,600)",
      best: "Premium Package ($2,700-$4,000+)",
    };

    // Generate HTML email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Vanity Installation Quote</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
              color: white;
              padding: 30px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 28px;
            }
            .header p {
              margin: 0;
              opacity: 0.9;
            }
            .section {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .section h2 {
              margin-top: 0;
              color: #1e40af;
              font-size: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              background: white;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background: #1e40af;
              color: white;
              font-weight: bold;
            }
            tr:hover {
              background-color: #f5f5f5;
            }
            .total-row {
              background: #e8eaf6 !important;
              font-weight: bold;
              font-size: 18px;
            }
            .total-row td {
              padding: 15px 12px;
              border-top: 2px solid #1e40af;
            }
            .highlight {
              background: #fff3cd;
              padding: 2px 6px;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 14px;
              border-top: 2px solid #ddd;
              margin-top: 30px;
            }
            .badge {
              display: inline-block;
              background: #d4af37;
              color: white;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 14px;
              font-weight: bold;
              margin-left: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Your Vanity Installation Quote</h1>
            <p>Thank you for your interest! Here's your detailed quote.</p>
          </div>

          <div class="section">
            <h2>Package Details</h2>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Package Tier:</strong> ${tierLabels[vanity.tier]}</p>
            <p><strong>Quantity:</strong> ${vanity.quantity} unit(s)</p>
            ${vanity.singleToDouble ? '<p class="highlight">✓ Includes Single-to-Double Conversion</p>' : ""}
            ${vanity.plumbingWallChange ? '<p class="highlight">✓ Includes Plumbing Wall Changes</p>' : ""}
          </div>

          <div class="section">
            <h2>Cost Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${lineItems
                  .map(
                    (item) => `
                  <tr>
                    <td>
                      <strong>${item.description}</strong><br>
                      <small style="color: #666;">${item.notes}</small>
                    </td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">$${item.unitPrice.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}</td>
                    <td style="text-align: right;">$${item.total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}</td>
                  </tr>
                `
                  )
                  .join("")}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;">Grand Total:</td>
                  <td style="text-align: right; color: #1e40af;">
                    $${grandTotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>What's Included</h2>
            <ul>
              <li>72" Double Vanity Cabinet & Top</li>
              <li>Professional Installation & Setup</li>
              <li>Removal of Existing Vanity</li>
              <li>Basic Plumbing Hookup</li>
              ${vanity.singleToDouble ? "<li>Single to Double Sink Conversion</li>" : ""}
              ${vanity.plumbingWallChange ? "<li>Plumbing Re-routing to New Wall Location</li>" : ""}
            </ul>
          </div>

          <div class="section">
            <h2>Next Steps</h2>
            <p><strong>This quote is valid for 30 days</strong> from today's date.</p>
            <p>To proceed with your vanity installation:</p>
            <ol>
              <li>Review the quote details above</li>
              <li>Reply to this email with any questions</li>
              <li>Schedule your installation date</li>
            </ol>
            <p>We look forward to transforming your bathroom!</p>
          </div>

          <div class="footer">
            <p><strong>Power3 Cabinet Store & Installation</strong></p>
            <p>Premium Kitchen & Bath Solutions</p>
            <p style="margin-top: 10px; font-size: 12px;">
              This quote was generated automatically. Please contact us if you have any questions.
            </p>
          </div>
        </body>
      </html>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Power3 Cabinet Store <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `Your Vanity Installation Quote - ${tierLabels[vanity.tier]}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Vanity quote sent successfully",
        emailId: emailResponse.data?.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-vanity-quote function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
