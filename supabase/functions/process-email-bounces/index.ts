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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting bounce processing...");

    // Get all pricing guide requests with email tracking
    const { data: requests, error: fetchError } = await supabase
      .from("pricing_guide_requests")
      .select("*")
      .eq("unsubscribed", false)
      .not("sent_at", "is", null);

    if (fetchError) {
      console.error("Error fetching pricing guide requests:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${requests?.length || 0} active email recipients`);

    let unsubscribedCount = 0;
    const BOUNCE_THRESHOLD = 2; // Auto-unsubscribe after 2 bounces

    for (const request of requests || []) {
      // Check email tracking for bounces related to pricing guide
      const { data: trackingRecords, error: trackingError } = await supabase
        .from("email_tracking")
        .select("*")
        .eq("recipient_email", request.email)
        .eq("email_type", "pricing_guide")
        .eq("status", "bounced")
        .order("created_at", { ascending: false });

      if (trackingError) {
        console.error(`Error fetching tracking for ${request.email}:`, trackingError);
        continue;
      }

      const bounceCount = trackingRecords?.length || 0;

      // Auto-unsubscribe if bounce threshold is reached
      if (bounceCount >= BOUNCE_THRESHOLD) {
        console.log(`Auto-unsubscribing ${request.email} - ${bounceCount} bounces detected`);

        const { error: updateError } = await supabase
          .from("pricing_guide_requests")
          .update({
            unsubscribed: true,
            unsubscribed_at: new Date().toISOString(),
          })
          .eq("id", request.id);

        if (updateError) {
          console.error(`Error unsubscribing ${request.email}:`, updateError);
          continue;
        }

        // Create admin notification
        const { error: notificationError } = await supabase
          .from("admin_notifications")
          .insert({
            type: "email_bounce_auto_unsubscribe",
            severity: "info",
            title: "Email Auto-Unsubscribed Due to Bounces",
            message: `${request.email} was automatically unsubscribed after ${bounceCount} bounce(s). Hard bounces indicate invalid or non-existent email addresses.`,
            data: {
              email: request.email,
              bounce_count: bounceCount,
              last_bounce_type: trackingRecords?.[0]?.bounce_type,
              unsubscribed_at: new Date().toISOString(),
            },
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          });

        if (notificationError) {
          console.error("Error creating notification:", notificationError);
        }

        unsubscribedCount++;
      }
    }

    // Also check for hard bounces and unsubscribe immediately
    const { data: hardBounces, error: hardBounceError } = await supabase
      .from("email_tracking")
      .select("recipient_email")
      .eq("email_type", "pricing_guide")
      .eq("bounce_type", "hard")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

    if (!hardBounceError && hardBounces && hardBounces.length > 0) {
      const hardBounceEmails = [...new Set(hardBounces.map(b => b.recipient_email))];

      for (const email of hardBounceEmails) {
        const { data: existingRequest } = await supabase
          .from("pricing_guide_requests")
          .select("*")
          .eq("email", email)
          .eq("unsubscribed", false)
          .maybeSingle();

        if (existingRequest) {
          console.log(`Auto-unsubscribing ${email} - hard bounce detected`);

          await supabase
            .from("pricing_guide_requests")
            .update({
              unsubscribed: true,
              unsubscribed_at: new Date().toISOString(),
            })
            .eq("email", email);

          unsubscribedCount++;
        }
      }
    }

    console.log(`Bounce processing complete. Auto-unsubscribed ${unsubscribedCount} emails.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed bounces, auto-unsubscribed ${unsubscribedCount} emails`,
        unsubscribed_count: unsubscribedCount,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error processing bounces:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process bounces" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
