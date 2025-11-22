import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    to: string[];
    from: string;
    subject: string;
    bounce?: {
      type: "hard" | "soft";
      reason?: string;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const event: ResendWebhookEvent = await req.json();
    
    console.log("Received webhook event:", event.type);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const recipientEmail = event.data.to[0];
    
    // Handle bounce events
    if (event.type === "email.bounced") {
      const bounceType = event.data.bounce?.type || "unknown";
      const bounceReason = event.data.bounce?.reason || "Unknown bounce reason";
      
      console.log(`Email bounced: ${recipientEmail} (${bounceType})`);

      // Find the most recent pricing guide email tracking record for this email
      const { data: trackingRecord } = await supabase
        .from("email_tracking")
        .select("*")
        .eq("recipient_email", recipientEmail)
        .eq("email_type", "pricing_guide")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (trackingRecord) {
        // Update the tracking record with bounce information
        await supabase
          .from("email_tracking")
          .update({
            status: "bounced",
            bounce_type: bounceType,
            failure_reason: bounceReason,
            failed_at: new Date().toISOString(),
          })
          .eq("id", trackingRecord.id);

        console.log(`Updated tracking record for ${recipientEmail}`);
      } else {
        // Create a new tracking record for the bounce
        await supabase
          .from("email_tracking")
          .insert({
            email_type: "pricing_guide",
            recipient_email: recipientEmail,
            status: "bounced",
            bounce_type: bounceType,
            failure_reason: bounceReason,
            sent_at: event.created_at,
            failed_at: new Date().toISOString(),
            tracking_token: crypto.randomUUID(),
            order_id: "00000000-0000-0000-0000-000000000000", // Placeholder for pricing guide emails
          });

        console.log(`Created new bounce tracking record for ${recipientEmail}`);
      }

      // If it's a hard bounce, immediately mark as unsubscribed in pricing_guide_requests
      if (bounceType === "hard") {
        const { error: unsubError } = await supabase
          .from("pricing_guide_requests")
          .update({
            unsubscribed: true,
            unsubscribed_at: new Date().toISOString(),
          })
          .eq("email", recipientEmail)
          .eq("unsubscribed", false);

        if (!unsubError) {
          console.log(`Auto-unsubscribed ${recipientEmail} due to hard bounce`);
        }
      }
    }

    // Handle delivery events
    if (event.type === "email.delivered") {
      console.log(`Email delivered: ${recipientEmail}`);
      
      const { data: trackingRecord } = await supabase
        .from("email_tracking")
        .select("*")
        .eq("recipient_email", recipientEmail)
        .eq("email_type", "pricing_guide")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (trackingRecord && trackingRecord.status === "sent") {
        await supabase
          .from("email_tracking")
          .update({
            status: "delivered",
          })
          .eq("id", trackingRecord.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: event.type }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process webhook" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
