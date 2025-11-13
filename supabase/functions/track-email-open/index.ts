import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 1x1 transparent GIF
const TRACKING_PIXEL = Uint8Array.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
  0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
  0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
  0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
]);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get tracking token from URL query parameter
    const url = new URL(req.url);
    const token = url.searchParams.get("t");

    if (!token) {
      console.log("No tracking token provided");
      return new Response(TRACKING_PIXEL, {
        headers: {
          ...corsHeaders,
          "Content-Type": "image/gif",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    console.log(`Tracking email open for token: ${token}`);

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find the email tracking record
    const { data: tracking, error: fetchError } = await supabase
      .from("email_tracking")
      .select("id, opened_at, opened_count")
      .eq("tracking_token", token)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching tracking record:", fetchError);
    } else if (tracking) {
      // Update the tracking record
      const { error: updateError } = await supabase
        .from("email_tracking")
        .update({
          opened_at: tracking.opened_at || new Date().toISOString(),
          opened_count: tracking.opened_count + 1,
        })
        .eq("tracking_token", token);

      if (updateError) {
        console.error("Error updating tracking record:", updateError);
      } else {
        console.log(`Email opened: ${tracking.opened_count + 1} time(s)`);
      }
    } else {
      console.log("Tracking token not found");
    }

    // Always return the tracking pixel
    return new Response(TRACKING_PIXEL, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error in track-email-open function:", error);
    // Still return the pixel even if tracking fails
    return new Response(TRACKING_PIXEL, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }
});
