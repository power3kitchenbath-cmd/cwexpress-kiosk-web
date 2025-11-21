import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DraftQuote {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  tier: string;
  grand_total: number;
  created_at: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Checking for draft vanity quotes that need follow-up reminders");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get draft quotes older than 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: draftQuotes, error: quotesError } = await supabase
      .from("vanity_quotes")
      .select("*")
      .eq("status", "draft")
      .lt("created_at", threeDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    if (quotesError) {
      console.error("Error fetching draft quotes:", quotesError);
      throw quotesError;
    }

    console.log(`Found ${draftQuotes?.length || 0} draft quotes needing follow-up`);

    if (!draftQuotes || draftQuotes.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No draft quotes need follow-up at this time",
          count: 0,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Group quotes by user
    const quotesByUser = draftQuotes.reduce((acc: Record<string, DraftQuote[]>, quote) => {
      if (!acc[quote.user_id]) {
        acc[quote.user_id] = [];
      }
      acc[quote.user_id].push(quote as DraftQuote);
      return acc;
    }, {});

    // Create notifications for each user with draft quotes
    const notifications = [];
    for (const [userId, quotes] of Object.entries(quotesByUser)) {
      // Check if there's already a recent notification for this user
      const { data: existingNotifications } = await supabase
        .from("admin_notifications")
        .select("*")
        .eq("type", "draft_quote_reminder")
        .eq("data->>user_id", userId)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (existingNotifications && existingNotifications.length > 0) {
        console.log(`Skipping notification for user ${userId} - already notified in last 24 hours`);
        continue;
      }

      const totalValue = quotes.reduce((sum, q) => sum + Number(q.grand_total), 0);
      const oldestQuote = quotes[0];
      const daysOld = Math.floor(
        (Date.now() - new Date(oldestQuote.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      const notification = {
        type: "draft_quote_reminder",
        severity: daysOld > 7 ? "warning" : "info",
        title: `${quotes.length} Draft Vanity Quote${quotes.length > 1 ? "s" : ""} Need Follow-up`,
        message: `You have ${quotes.length} draft vanity quote${
          quotes.length > 1 ? "s" : ""
        } (total value: $${totalValue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}) that ${quotes.length > 1 ? "haven't" : "hasn't"} been sent yet. The oldest is ${daysOld} days old.`,
        data: {
          user_id: userId,
          quote_count: quotes.length,
          total_value: totalValue,
          oldest_quote_days: daysOld,
          quote_ids: quotes.map((q) => q.id),
          quotes: quotes.map((q) => ({
            id: q.id,
            customer_name: q.customer_name,
            customer_email: q.customer_email,
            tier: q.tier,
            grand_total: q.grand_total,
            created_at: q.created_at,
          })),
        },
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 7 days
      };

      notifications.push(notification);
    }

    if (notifications.length > 0) {
      const { error: notificationError } = await supabase
        .from("admin_notifications")
        .insert(notifications);

      if (notificationError) {
        console.error("Error creating notifications:", notificationError);
        throw notificationError;
      }

      console.log(`Created ${notifications.length} follow-up reminder notification(s)`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Checked ${draftQuotes.length} draft quotes and created ${notifications.length} notification(s)`,
        draft_quotes_found: draftQuotes.length,
        notifications_created: notifications.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in check-draft-quote-reminders function:", error);
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
