import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting warm-up stats update");

    // Get all active warm-up schedules
    const { data: schedules, error: schedulesError } = await supabase
      .from("email_warmup_schedule")
      .select("*")
      .eq("status", "active");

    if (schedulesError) {
      console.error("Error fetching schedules:", schedulesError);
      throw schedulesError;
    }

    if (!schedules || schedules.length === 0) {
      console.log("No active warm-up schedules found");
      return new Response(
        JSON.stringify({ message: "No active warm-up schedules" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const today = new Date().toISOString().split("T")[0];
    const results = [];

    for (const schedule of schedules) {
      console.log(`Processing schedule for domain: ${schedule.domain}`);

      // Calculate days elapsed
      const startDate = new Date(schedule.start_date);
      const currentDate = new Date();
      const daysElapsed = Math.floor(
        (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

      // Calculate current day's recommended limit
      const { data: limitData, error: limitError } = await supabase.rpc(
        "calculate_warmup_daily_limit",
        { day_number: daysElapsed }
      );

      if (limitError) {
        console.error("Error calculating limit:", limitError);
        continue;
      }

      const dailyLimit = limitData as number;

      // Count emails sent today for this domain
      const { count: emailsSentToday, error: countError } = await supabase
        .from("email_tracking")
        .select("*", { count: "exact", head: true })
        .gte("sent_at", `${today}T00:00:00Z`)
        .lt("sent_at", `${today}T23:59:59Z`);

      if (countError) {
        console.error("Error counting emails:", countError);
        continue;
      }

      const sentCount = emailsSentToday || 0;
      const percentageUsed = dailyLimit > 0 ? (sentCount / dailyLimit) * 100 : 0;
      const exceededLimit = sentCount > dailyLimit;

      console.log(
        `Domain ${schedule.domain}: Day ${daysElapsed}, Limit: ${dailyLimit}, Sent: ${sentCount}, Exceeded: ${exceededLimit}`
      );

      // Update or insert daily stats
      const { error: upsertError } = await supabase
        .from("email_warmup_daily_stats")
        .upsert(
          {
            warmup_schedule_id: schedule.id,
            date: today,
            emails_sent: sentCount,
            target_volume: dailyLimit,
            percentage_used: percentageUsed,
            exceeded_limit: exceededLimit,
          },
          {
            onConflict: "warmup_schedule_id,date",
          }
        );

      if (upsertError) {
        console.error("Error upserting daily stats:", upsertError);
        continue;
      }

      // Update schedule with current day and limit
      const { error: updateError } = await supabase
        .from("email_warmup_schedule")
        .update({
          current_day: daysElapsed,
          daily_limit: dailyLimit,
        })
        .eq("id", schedule.id);

      if (updateError) {
        console.error("Error updating schedule:", updateError);
        continue;
      }

      // Create alert if limit exceeded
      if (exceededLimit) {
        console.log(`ALERT: Limit exceeded for ${schedule.domain}`);
        
        await supabase.from("admin_notifications").insert({
          type: "warmup_limit_exceeded",
          severity: "warning",
          title: "Email Warm-up Limit Exceeded",
          message: `Domain ${schedule.domain} has exceeded its daily warm-up limit. Sent ${sentCount} emails (limit: ${dailyLimit}). This may negatively impact sender reputation.`,
          data: {
            domain: schedule.domain,
            day: daysElapsed,
            limit: dailyLimit,
            sent: sentCount,
            date: today,
          },
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      // Mark as completed if past 35 days and maintaining good volume
      if (daysElapsed >= 35 && !exceededLimit) {
        await supabase
          .from("email_warmup_schedule")
          .update({ status: "completed" })
          .eq("id", schedule.id);

        await supabase.from("admin_notifications").insert({
          type: "warmup_completed",
          severity: "info",
          title: "Email Warm-up Completed",
          message: `Congratulations! The warm-up period for ${schedule.domain} has been successfully completed. You can now send at full volume.`,
          data: {
            domain: schedule.domain,
            completedDay: daysElapsed,
          },
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      results.push({
        domain: schedule.domain,
        day: daysElapsed,
        limit: dailyLimit,
        sent: sentCount,
        exceeded: exceededLimit,
      });
    }

    console.log("Warm-up stats update complete");

    return new Response(
      JSON.stringify({
        message: "Warm-up stats updated successfully",
        processed: results.length,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in update-warmup-stats function:", error);
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
