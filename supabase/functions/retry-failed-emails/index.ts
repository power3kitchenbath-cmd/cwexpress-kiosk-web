import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Exponential backoff schedule (in minutes)
const RETRY_SCHEDULE = [5, 30, 120, 360]; // 5 min, 30 min, 2 hours, 6 hours
const MAX_RETRIES = 4;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting failed email retry process");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find failed emails that are eligible for retry
    const { data: failedEmails, error: fetchError } = await supabase
      .from("email_tracking")
      .select("*")
      .eq("status", "failed")
      .lt("retry_count", MAX_RETRIES)
      .order("failed_at", { ascending: true });

    if (fetchError) throw fetchError;

    if (!failedEmails || failedEmails.length === 0) {
      console.log("No failed emails to retry");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No failed emails to retry",
          processed: 0
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Found ${failedEmails.length} failed emails to process`);

    const now = new Date();
    const results = {
      processed: 0,
      retried: 0,
      skipped: 0,
      succeeded: 0,
      failed: 0,
    };

    for (const email of failedEmails) {
      results.processed++;

      // Calculate when the next retry should happen based on retry count
      const retryDelayMinutes = RETRY_SCHEDULE[email.retry_count] || RETRY_SCHEDULE[RETRY_SCHEDULE.length - 1];
      const nextRetryTime = new Date(email.last_attempt_at || email.failed_at);
      nextRetryTime.setMinutes(nextRetryTime.getMinutes() + retryDelayMinutes);

      // Check if it's time to retry
      if (now < nextRetryTime) {
        console.log(`Skipping email ${email.id}: not yet time to retry (next retry: ${nextRetryTime.toISOString()})`);
        results.skipped++;
        continue;
      }

      console.log(`Retrying email ${email.id} (attempt ${email.retry_count + 1}/${MAX_RETRIES})`);

      try {
        // Call the send-order-receipt function to retry
        const { data: retryData, error: retryError } = await supabase.functions.invoke(
          "send-order-receipt",
          {
            body: {
              orderId: email.order_id,
              emailType: email.email_type,
              isRetry: true,
              trackingId: email.id,
            },
          }
        );

        if (retryError) {
          console.error(`Retry failed for email ${email.id}:`, retryError);
          
          // Update retry count and last attempt
          await supabase
            .from("email_tracking")
            .update({
              retry_count: email.retry_count + 1,
              last_attempt_at: now.toISOString(),
              failure_reason: retryError.message || "Retry failed",
            })
            .eq("id", email.id);

          results.failed++;
        } else {
          console.log(`Successfully retried email ${email.id}`);
          
          // Mark as sent/delivered if retry succeeded
          await supabase
            .from("email_tracking")
            .update({
              status: "sent",
              retry_count: email.retry_count + 1,
              last_attempt_at: now.toISOString(),
              failure_reason: null,
              failed_at: null,
            })
            .eq("id", email.id);

          results.succeeded++;
        }

        results.retried++;
      } catch (error: any) {
        console.error(`Error retrying email ${email.id}:`, error);
        
        // Update retry count even on error
        await supabase
          .from("email_tracking")
          .update({
            retry_count: email.retry_count + 1,
            last_attempt_at: now.toISOString(),
            failure_reason: error.message || "Unknown retry error",
          })
          .eq("id", email.id);

        results.failed++;
      }

      // Add a small delay between retries to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const { data: exhaustedEmails } = await supabase
      .from("email_tracking")
      .select("id, recipient_email")
      .eq("status", "failed")
      .gte("retry_count", MAX_RETRIES);

    if (exhaustedEmails && exhaustedEmails.length > 0) {
      console.log(`Marking ${exhaustedEmails.length} emails as permanently bounced`);
      
      for (const email of exhaustedEmails) {
        await supabase
          .from("email_tracking")
          .update({
            status: "bounced",
            bounce_type: "hard",
          })
          .eq("id", email.id);
      }
    }

    console.log("Retry process completed:", results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Retry process completed",
        results 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in retry-failed-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
