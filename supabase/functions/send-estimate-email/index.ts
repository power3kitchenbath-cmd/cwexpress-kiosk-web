import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EstimateEmailRequest {
  recipientEmail: string;
  recipientName?: string;
  pdfBase64: string;
  estimateDate: string;
  grandTotal: number;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-estimate-email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, recipientName, pdfBase64, estimateDate, grandTotal }: EstimateEmailRequest = await req.json();

    console.log("Sending estimate email to:", recipientEmail);

    if (!recipientEmail || !pdfBase64) {
      throw new Error("Missing required fields: recipientEmail or pdfBase64");
    }

    // Convert base64 to buffer for attachment
    const pdfBuffer = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));

    const emailResponse = await resend.emails.send({
      from: "The Cabinet Store <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Your Cabinet & Flooring Estimate - $${grandTotal.toFixed(2)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Your Custom Estimate</h1>
          ${recipientName ? `<p>Dear ${recipientName},</p>` : '<p>Hello,</p>'}
          
          <p>Thank you for your interest in our products! Please find your detailed estimate attached to this email.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #4F46E5; margin-top: 0;">Estimate Summary</h2>
            <p style="margin: 10px 0;"><strong>Date:</strong> ${estimateDate}</p>
            <p style="margin: 10px 0;"><strong>Total:</strong> <span style="font-size: 24px; color: #4F46E5; font-weight: bold;">$${grandTotal.toFixed(2)}</span></p>
          </div>
          
          <p>This estimate includes:</p>
          <ul style="color: #6b7280;">
            <li>Itemized breakdown of all cabinets, flooring, and countertops</li>
            <li>Individual pricing for each item</li>
            <li>Subtotals and applicable markups</li>
            <li>Final grand total</li>
          </ul>
          
          <p>If you have any questions about this estimate or would like to discuss your project further, please don't hesitate to contact us.</p>
          
          <p style="margin-top: 30px;">Best regards,<br><strong>The Cabinet Store Team</strong></p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          
          <p style="color: #9ca3af; font-size: 12px;">
            * This estimate is valid for 30 days from the date above. Final pricing may vary based on specific requirements and installation details.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `estimate-${estimateDate}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data?.id,
        message: "Estimate sent successfully" 
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
    console.error("Error in send-estimate-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Failed to send estimate email"
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
