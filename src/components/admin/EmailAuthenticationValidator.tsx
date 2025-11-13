import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, ShieldCheck, ShieldAlert, ShieldX, Loader2 } from "lucide-react";

interface AuthRecord {
  type: "SPF" | "DKIM" | "DMARC";
  found: boolean;
  value?: string;
  status: "pass" | "warning" | "fail";
  issues: string[];
  recommendations: string[];
}

interface AuthCheck {
  status: "pass" | "warning" | "fail";
  criticalIssues: number;
  results: AuthRecord[];
  domain: string;
  checkedAt: string;
}

export const EmailAuthenticationValidator = () => {
  const [domain, setDomain] = useState("");
  const [dkimSelector, setDkimSelector] = useState("resend");
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<AuthCheck | null>(null);

  const handleCheck = async () => {
    if (!domain) {
      toast.error("Please enter a domain to check");
      return;
    }

    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "check-email-authentication",
        {
          body: { domain, dkimSelector },
        }
      );

      if (error) throw error;

      setLastCheck(data);
      toast.success("Email authentication check completed");
    } catch (error: any) {
      console.error("Error checking email authentication:", error);
      toast.error("Failed to check email authentication");
    } finally {
      setChecking(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <ShieldCheck className="h-5 w-5 text-green-500" />;
      case "warning":
        return <ShieldAlert className="h-5 w-5 text-yellow-500" />;
      case "fail":
        return <ShieldX className="h-5 w-5 text-red-500" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pass":
        return (
          <Badge className="bg-green-500/10 text-green-700 border-green-200">
            Configured
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-200">
            Needs Improvement
          </Badge>
        );
      case "fail":
        return (
          <Badge className="bg-red-500/10 text-red-700 border-red-200">
            Not Configured
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Email Authentication Validator</h3>
          <p className="text-sm text-muted-foreground">
            Check if your domain's SPF, DKIM, and DMARC records are properly configured
          </p>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Proper email authentication prevents spoofing, improves deliverability, and protects
            your domain reputation. All three records (SPF, DKIM, DMARC) should be configured.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="dkim-selector">DKIM Selector (optional)</Label>
            <Input
              id="dkim-selector"
              placeholder="resend"
              value={dkimSelector}
              onChange={(e) => setDkimSelector(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Common selectors: "resend", "default", "google", or "k1"
            </p>
          </div>

          <Button onClick={handleCheck} disabled={checking || !domain}>
            {checking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              "Check Authentication"
            )}
          </Button>
        </div>

        {lastCheck && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Results for {lastCheck.domain}</h4>
                <p className="text-xs text-muted-foreground">
                  Checked: {new Date(lastCheck.checkedAt).toLocaleString()}
                </p>
              </div>
              {getStatusBadge(lastCheck.status)}
            </div>

            {lastCheck.criticalIssues > 0 && (
              <Alert variant="destructive">
                <ShieldX className="h-4 w-4" />
                <AlertDescription>
                  {lastCheck.criticalIssues} critical authentication{" "}
                  {lastCheck.criticalIssues === 1 ? "issue" : "issues"} detected. This will
                  severely impact email deliverability.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {lastCheck.results.map((record) => (
                <Card key={record.type} className="p-4">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(record.status)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-semibold">{record.type}</h5>
                        {getStatusBadge(record.status)}
                      </div>

                      {record.found && record.value && (
                        <div className="text-xs bg-muted p-2 rounded font-mono break-all">
                          {record.value}
                        </div>
                      )}

                      {record.issues.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-destructive">Issues:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {record.issues.map((issue, idx) => (
                              <li key={idx}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {record.recommendations.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Recommendations:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {record.recommendations.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Steps:</strong> If any records are missing or misconfigured, contact
                your DNS provider or email service provider to add or update these records. Changes
                may take up to 48 hours to propagate.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </Card>
  );
};
