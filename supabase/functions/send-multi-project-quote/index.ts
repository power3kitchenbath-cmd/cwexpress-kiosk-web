import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const MultiProjectQuoteSchema = z.object({
  customerName: z.string().trim().min(1).max(100),
  customerEmail: z.string().trim().email().max(255),
  customerPhone: z.string().trim().max(20).optional(),
  customerCompany: z.string().trim().max(100).optional(),
  pdfBase64: z.string().min(1),
  estimateName: z.string().trim().max(200),
  estimateNotes: z.string().max(2000).optional(),
  totalCost: z.number().positive(),
  projectCount: z.number().int().positive(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

interface MultiProjectQuoteRequest {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCompany?: string;
  pdfBase64: string;
  estimateName: string;
  estimateNotes?: string;
  totalCost: number;
  projectCount: number;
  projects?: any[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Received multi-project quote request");

    const validatedData = MultiProjectQuoteSchema.parse(body);
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerCompany,
      pdfBase64,
      estimateName,
      estimateNotes,
      totalCost,
      projectCount,
      projects,
    }: MultiProjectQuoteRequest = validatedData;

    const pdfBuffer = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));

    const salesEmail = "sales@example.com"; // Replace with actual sales team email
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emailHtml = `
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
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #e0e0e0;
            }
            .customer-info {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #667eea;
            }
            .info-row {
              margin: 10px 0;
              display: flex;
              align-items: flex-start;
            }
            .info-label {
              font-weight: bold;
              color: #667eea;
              min-width: 120px;
            }
            .info-value {
              color: #333;
              flex: 1;
            }
            .estimate-summary {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .total-amount {
              font-size: 24px;
              font-weight: bold;
              color: #667eea;
              text-align: center;
              padding: 20px;
              background: #f0f4ff;
              border-radius: 8px;
              margin: 20px 0;
            }
            .notes-section {
              background: #fff9e6;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #ffc107;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>New Multi-Project Quote Request</h1>
            <p style="margin: 0; opacity: 0.9;">${escapeHtml(currentDate)}</p>
          </div>
          
          <div class="content">
            <div class="customer-info">
              <h2 style="margin-top: 0; color: #667eea;">Customer Information</h2>
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${escapeHtml(customerName)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${escapeHtml(customerEmail)}</span>
              </div>
              ${customerPhone ? `
              <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">${escapeHtml(customerPhone)}</span>
              </div>
              ` : ""}
              ${customerCompany ? `
              <div class="info-row">
                <span class="info-label">Company:</span>
                <span class="info-value">${escapeHtml(customerCompany)}</span>
              </div>
              ` : ""}
            </div>

            <div class="estimate-summary">
              <h2 style="margin-top: 0; color: #667eea;">Estimate Details</h2>
              <div class="info-row">
                <span class="info-label">Estimate Name:</span>
                <span class="info-value">${escapeHtml(estimateName)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Projects:</span>
                <span class="info-value">${projectCount} project${projectCount !== 1 ? "s" : ""}</span>
              </div>
              
              <div class="total-amount">
                Total: $${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            ${estimateNotes ? `
            <div class="notes-section">
              <h3 style="margin-top: 0; color: #f57c00;">Customer Notes</h3>
              <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(estimateNotes)}</p>
            </div>
            ` : ""}

            <p style="margin-top: 30px;">
              The complete multi-project estimate is attached as a PDF. Please review and follow up with the customer promptly.
            </p>
          </div>

          <div class="footer">
            <p>This is an automated message from your quote request system.</p>
          </div>
        </body>
      </html>
    `;

    console.log("Sending multi-project quote email to sales team");

    const emailResponse = await resend.emails.send({
      from: "Quote Requests <onboarding@resend.dev>",
      to: [salesEmail],
      replyTo: customerEmail,
      subject: `New Multi-Project Quote Request - ${escapeHtml(customerName)}`,
      html: emailHtml,
      attachments: [
        {
          filename: `${estimateName.replace(/[^a-z0-9]/gi, "_")}_estimate.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    console.log("Multi-project quote email sent successfully:", emailResponse);

    // Store the estimate request in the database
    try {
      const { data: estimateData, error: dbError } = await supabase
        .from("multi_project_estimates")
        .insert({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone || null,
          customer_company: customerCompany || null,
          estimate_name: estimateName,
          estimate_notes: estimateNotes || null,
          projects: projects || [],
          total_cost: totalCost,
          project_count: projectCount,
          status: "pending",
        })
        .select()
        .single();

      if (dbError) {
        console.error("Error storing estimate in database:", dbError);
        // Don't fail the request if database insert fails
      } else {
        console.log("Estimate stored in database:", estimateData);
      }
    } catch (dbError) {
      console.error("Exception storing estimate:", dbError);
      // Don't fail the request if database operation fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: emailResponse.data?.id,
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
    console.error("Error in send-multi-project-quote function:", error);

    if (error.name === "ZodError") {
      return new Response(
        JSON.stringify({
          error: "Invalid input data",
          details: error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

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
