import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertTriangle, CheckCircle2, RefreshCw, Info } from "lucide-react";
import { format } from "date-fns";

interface BlacklistResult {
  name: string;
  listed: boolean;
  details?: string;
}

interface ReputationCheck {
  status: "clean" | "warning" | "critical";
  listedCount: number;
  totalChecked: number;
  results: BlacklistResult[];
  domain?: string;
  ipAddress?: string;
  checkedAt: string;
}

export const EmailReputationMonitor = () => {
  const { toast } = useToast();
  const [domain, setDomain] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<ReputationCheck | null>(null);

  const handleCheck = async () => {
    if (!domain && !ipAddress) {
      toast({
        title: "Input Required",
        description: "Please enter a domain or IP address to check",
        variant: "destructive",
      });
      return;
    }

    try {
      setChecking(true);
      toast({
        title: "Checking Reputation",
        description: "This may take 30-60 seconds to check all blacklists...",
      });

      const { data, error } = await supabase.functions.invoke("check-email-reputation", {
        body: { domain, ipAddress },
      });

      if (error) throw error;

      setLastCheck(data);

      if (data.status === "clean") {
        toast({
          title: "✅ Clean Reputation",
          description: `Not found on any of ${data.totalChecked} blacklists checked`,
        });
      } else if (data.status === "warning") {
        toast({
          title: "⚠️ Warning",
          description: `Found on ${data.listedCount} blacklist(s)`,
          variant: "default",
        });
      } else {
        toast({
          title: "🚨 Critical Issue",
          description: `Found on ${data.listedCount} blacklist(s) - immediate action required`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking reputation:", error);
      toast({
        title: "Error",
        description: "Failed to check email reputation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  const getStatusIcon = () => {
    if (!lastCheck) return <Shield className="h-5 w-5" />;

    switch (lastCheck.status) {
      case "clean":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusBadge = () => {
    if (!lastCheck) return null;

    switch (lastCheck.status) {
      case "clean":
        return <Badge className="bg-green-500">Clean</Badge>;
      case "warning":
        return <Badge variant="default">Warning</Badge>;
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Email Reputation Monitor
        </CardTitle>
        <CardDescription>
          Check if your sending domain or IP address is listed on email blacklists
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>About Blacklist Checks</AlertTitle>
          <AlertDescription>
            This tool checks your domain and IP against major email blacklists (DNSBLs).
            Being listed can severely impact email deliverability. Regular monitoring is recommended.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="domain">Sending Domain</Label>
            <Input
              id="domain"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The domain you send emails from (e.g., resend.dev)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ip">Sending IP Address (Optional)</Label>
            <Input
              id="ip"
              placeholder="192.0.2.1"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your server's public IP address
            </p>
          </div>
        </div>

        <Button onClick={handleCheck} disabled={checking} className="w-full">
          {checking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking Blacklists...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Check Reputation
            </>
          )}
        </Button>

        {lastCheck && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Last Check Results</h4>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(lastCheck.checkedAt), "PPp")}
                </p>
              </div>
              {getStatusBadge()}
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{lastCheck.totalChecked}</div>
                <div className="text-sm text-muted-foreground">Blacklists Checked</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-500">
                  {lastCheck.totalChecked - lastCheck.listedCount}
                </div>
                <div className="text-sm text-muted-foreground">Clean</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div
                  className={`text-2xl font-bold ${
                    lastCheck.listedCount > 0 ? "text-destructive" : "text-green-500"
                  }`}
                >
                  {lastCheck.listedCount}
                </div>
                <div className="text-sm text-muted-foreground">Listed</div>
              </div>
            </div>

            {lastCheck.listedCount > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Blacklist Detections</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-2">
                    {lastCheck.results
                      .filter((r) => r.listed)
                      .map((result) => (
                        <div key={result.name} className="flex items-start gap-2">
                          <span className="font-mono text-sm font-medium">{result.name}</span>
                          {result.details && (
                            <span className="text-sm">- {result.details}</span>
                          )}
                        </div>
                      ))}
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="font-medium">Recommended Actions:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Stop sending emails immediately to prevent further damage</li>
                      <li>Identify and remove the source of spam complaints</li>
                      <li>Review your email list for invalid or spam-trap addresses</li>
                      <li>Submit delisting requests to each blacklist</li>
                      <li>Implement proper email authentication (SPF, DKIM, DMARC)</li>
                      <li>
                        Visit each blacklist's website for specific delisting procedures
                      </li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {lastCheck.listedCount === 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Excellent Reputation</AlertTitle>
                <AlertDescription>
                  Your domain and IP are not listed on any of the checked blacklists. Continue
                  following email best practices to maintain this status.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-sm">Blacklists Checked</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>• Spamhaus ZEN</div>
            <div>• SpamCop</div>
            <div>• Barracuda</div>
            <div>• SORBS</div>
            <div>• PSBL</div>
            <div>• UCEPROTECT</div>
            <div>• CBL Abuseat</div>
            <div>• DNSBL INPS</div>
            <div>• UBL UnsubScore</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
