import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Common DNS-based blacklists to check
const BLACKLISTS = [
  "zen.spamhaus.org",
  "bl.spamcop.net",
  "b.barracudacentral.org",
  "dnsbl.sorbs.net",
  "spam.dnsbl.sorbs.net",
  "psbl.surriel.com",
  "ubl.unsubscore.com",
  "dnsbl-1.uceprotect.net",
  "cbl.abuseat.org",
  "dnsbl.inps.de",
];

interface BlacklistResult {
  name: string;
  listed: boolean;
  details?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { domain, ipAddress } = await req.json();
    console.log(`Checking reputation for domain: ${domain}, IP: ${ipAddress}`);

    const results: BlacklistResult[] = [];
    let listedCount = 0;

    // Check domain-based blacklists
    if (domain) {
      for (const blacklist of BLACKLISTS) {
        try {
          const query = `${domain}.${blacklist}`;
          console.log(`Checking ${query}`);

          // Use Deno's built-in DNS resolver
          const resolver = Deno.resolveDns(query, "A");
          
          await resolver
            .then((addresses) => {
              if (addresses && addresses.length > 0) {
                console.log(`LISTED on ${blacklist}: ${domain}`);
                results.push({
                  name: blacklist,
                  listed: true,
                  details: `Domain ${domain} is listed`,
                });
                listedCount++;
              } else {
                results.push({
                  name: blacklist,
                  listed: false,
                });
              }
            })
            .catch(() => {
              // NXDOMAIN means not listed
              results.push({
                name: blacklist,
                listed: false,
              });
            });
        } catch (error) {
          console.error(`Error checking ${blacklist}:`, error);
          // If there's an error, assume not listed (better safe than false positive)
          results.push({
            name: blacklist,
            listed: false,
          });
        }
      }
    }

    // Check IP-based blacklists (if IP provided)
    if (ipAddress) {
      // Reverse the IP for DNSBL queries
      const reversedIp = ipAddress.split(".").reverse().join(".");

      for (const blacklist of BLACKLISTS) {
        try {
          const query = `${reversedIp}.${blacklist}`;
          console.log(`Checking IP ${query}`);

          const resolver = Deno.resolveDns(query, "A");
          
          await resolver
            .then((addresses) => {
              if (addresses && addresses.length > 0) {
                console.log(`LISTED on ${blacklist}: ${ipAddress}`);
                results.push({
                  name: `${blacklist} (IP)`,
                  listed: true,
                  details: `IP ${ipAddress} is listed`,
                });
                listedCount++;
              } else {
                results.push({
                  name: `${blacklist} (IP)`,
                  listed: false,
                });
              }
            })
            .catch(() => {
              results.push({
                name: `${blacklist} (IP)`,
                listed: false,
              });
            });
        } catch (error) {
          console.error(`Error checking ${blacklist} for IP:`, error);
          results.push({
            name: `${blacklist} (IP)`,
            listed: false,
          });
        }
      }
    }

    // Create alert if blacklisted
    if (listedCount > 0) {
      const listedBlacklists = results
        .filter((r) => r.listed)
        .map((r) => r.name)
        .join(", ");

      console.log("Creating blacklist alert notification");
      
      await supabase.from("admin_notifications").insert({
        type: "email_blacklist",
        severity: "critical",
        title: "Email Blacklist Detection",
        message: `Your domain/IP has been detected on ${listedCount} blacklist(s): ${listedBlacklists}. This will severely impact email deliverability.`,
        data: {
          domain,
          ipAddress,
          listedCount,
          blacklists: results.filter((r) => r.listed),
          checkedAt: new Date().toISOString(),
        },
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });
    }

    const status = listedCount === 0 ? "clean" : listedCount < 3 ? "warning" : "critical";

    console.log(
      `Reputation check complete: ${listedCount} blacklists found, status: ${status}`
    );

    return new Response(
      JSON.stringify({
        status,
        listedCount,
        totalChecked: results.length,
        results,
        domain,
        ipAddress,
        checkedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in check-email-reputation function:", error);
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
