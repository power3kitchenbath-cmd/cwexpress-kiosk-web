import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthRecord {
  type: "SPF" | "DKIM" | "DMARC";
  found: boolean;
  value?: string;
  status: "pass" | "warning" | "fail";
  issues: string[];
  recommendations: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { domain, dkimSelector } = await req.json();
    console.log(`Checking email authentication for domain: ${domain}`);

    const results: AuthRecord[] = [];
    let criticalIssues = 0;

    // Check SPF Record
    try {
      console.log(`Checking SPF record for ${domain}`);
      const spfRecords = await Deno.resolveDns(domain, "TXT");
      const spfRecord = spfRecords
        ?.map((record) => record.join(""))
        .find((record) => record.startsWith("v=spf1"));

      if (spfRecord) {
        const issues: string[] = [];
        const recommendations: string[] = [];

        // Check for common SPF issues
        if (!spfRecord.includes("-all") && !spfRecord.includes("~all")) {
          issues.push("SPF record doesn't end with -all or ~all");
          recommendations.push("Add -all or ~all at the end of your SPF record for better security");
        }

        if (spfRecord.includes("+all")) {
          issues.push("SPF record uses +all (allows all senders)");
          recommendations.push("Replace +all with -all to prevent unauthorized sending");
          criticalIssues++;
        }

        const includeCount = (spfRecord.match(/include:/g) || []).length;
        if (includeCount > 10) {
          issues.push(`Too many DNS lookups (${includeCount} includes)`);
          recommendations.push("Reduce the number of include: statements to avoid DNS lookup limit");
        }

        results.push({
          type: "SPF",
          found: true,
          value: spfRecord,
          status: issues.length === 0 ? "pass" : criticalIssues > 0 ? "fail" : "warning",
          issues,
          recommendations,
        });
      } else {
        results.push({
          type: "SPF",
          found: false,
          status: "fail",
          issues: ["No SPF record found"],
          recommendations: [
            "Add an SPF record to your DNS: v=spf1 include:_spf.resend.com -all",
            "This helps prevent email spoofing and improves deliverability"
          ],
        });
        criticalIssues++;
      }
    } catch (error) {
      console.error("Error checking SPF:", error);
      results.push({
        type: "SPF",
        found: false,
        status: "fail",
        issues: ["Failed to check SPF record"],
        recommendations: ["Verify your DNS is properly configured"],
      });
    }

    // Check DKIM Record
    try {
      const selector = dkimSelector || "resend";
      const dkimDomain = `${selector}._domainkey.${domain}`;
      console.log(`Checking DKIM record for ${dkimDomain}`);

      const dkimRecords = await Deno.resolveDns(dkimDomain, "TXT");
      const dkimRecord = dkimRecords
        ?.map((record) => record.join(""))
        .find((record) => record.includes("v=DKIM1"));

      if (dkimRecord) {
        const issues: string[] = [];
        const recommendations: string[] = [];

        if (!dkimRecord.includes("p=")) {
          issues.push("DKIM record missing public key");
          recommendations.push("Ensure your DKIM record includes a valid public key (p=)");
          criticalIssues++;
        }

        if (dkimRecord.length > 255) {
          issues.push("DKIM record may be too long for a single TXT record");
          recommendations.push("Consider splitting the DKIM record or using a shorter key");
        }

        results.push({
          type: "DKIM",
          found: true,
          value: dkimRecord.substring(0, 100) + "...",
          status: issues.length === 0 ? "pass" : "warning",
          issues,
          recommendations,
        });
      } else {
        results.push({
          type: "DKIM",
          found: false,
          status: "fail",
          issues: [`No DKIM record found for selector: ${selector}`],
          recommendations: [
            "Add a DKIM record to your DNS",
            "Contact your email service provider for the correct DKIM record",
            "Typical selector is 'resend' for Resend or 'default' for other providers"
          ],
        });
        criticalIssues++;
      }
    } catch (error) {
      console.error("Error checking DKIM:", error);
      results.push({
        type: "DKIM",
        found: false,
        status: "fail",
        issues: ["Failed to check DKIM record"],
        recommendations: ["Verify DKIM selector and DNS configuration"],
      });
    }

    // Check DMARC Record
    try {
      const dmarcDomain = `_dmarc.${domain}`;
      console.log(`Checking DMARC record for ${dmarcDomain}`);

      const dmarcRecords = await Deno.resolveDns(dmarcDomain, "TXT");
      const dmarcRecord = dmarcRecords
        ?.map((record) => record.join(""))
        .find((record) => record.startsWith("v=DMARC1"));

      if (dmarcRecord) {
        const issues: string[] = [];
        const recommendations: string[] = [];

        // Check DMARC policy
        const policyMatch = dmarcRecord.match(/p=(\w+)/);
        const policy = policyMatch ? policyMatch[1] : null;

        if (policy === "none") {
          issues.push("DMARC policy is set to 'none' (monitoring only)");
          recommendations.push("Consider upgrading to p=quarantine or p=reject for better protection");
        }

        if (!dmarcRecord.includes("rua=")) {
          issues.push("No aggregate reporting address configured");
          recommendations.push("Add rua= to receive DMARC aggregate reports");
        }

        if (!dmarcRecord.includes("ruf=")) {
          issues.push("No forensic reporting address configured");
          recommendations.push("Consider adding ruf= to receive DMARC forensic reports");
        }

        results.push({
          type: "DMARC",
          found: true,
          value: dmarcRecord,
          status: issues.length === 0 ? "pass" : "warning",
          issues,
          recommendations,
        });
      } else {
        results.push({
          type: "DMARC",
          found: false,
          status: "fail",
          issues: ["No DMARC record found"],
          recommendations: [
            "Add a DMARC record to your DNS: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com",
            "Start with p=none to monitor, then upgrade to p=quarantine or p=reject",
            "DMARC protects your domain from spoofing and phishing"
          ],
        });
        criticalIssues++;
      }
    } catch (error) {
      console.error("Error checking DMARC:", error);
      results.push({
        type: "DMARC",
        found: false,
        status: "fail",
        issues: ["Failed to check DMARC record"],
        recommendations: ["Verify your DNS is properly configured"],
      });
    }

    // Create alert if critical issues found
    if (criticalIssues > 0) {
      const missingRecords = results
        .filter((r) => !r.found)
        .map((r) => r.type)
        .join(", ");

      console.log("Creating email authentication alert notification");

      await supabase.from("admin_notifications").insert({
        type: "email_authentication",
        severity: "critical",
        title: "Email Authentication Issues Detected",
        message: `Critical email authentication issues found: ${missingRecords || "Configuration problems"}. This will impact email deliverability and security.`,
        data: {
          domain,
          criticalIssues,
          results: results.filter((r) => r.status === "fail"),
          checkedAt: new Date().toISOString(),
        },
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    const overallStatus =
      criticalIssues > 0 ? "fail" : results.some((r) => r.status === "warning") ? "warning" : "pass";

    console.log(
      `Authentication check complete: ${criticalIssues} critical issues, status: ${overallStatus}`
    );

    return new Response(
      JSON.stringify({
        status: overallStatus,
        criticalIssues,
        results,
        domain,
        checkedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in check-email-authentication function:", error);
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
