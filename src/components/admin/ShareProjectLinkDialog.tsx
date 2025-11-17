import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share2, ExternalLink, RefreshCw } from "lucide-react";

interface ShareProjectLinkDialogProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShareProjectLinkDialog({
  projectId,
  projectName,
  open,
  onOpenChange,
}: ShareProjectLinkDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");

  useEffect(() => {
    if (open) {
      checkExistingToken();
    }
  }, [open, projectId]);

  const checkExistingToken = async () => {
    try {
      const { data, error } = await supabase
        .from("project_share_tokens")
        .select("token")
        .eq("project_id", projectId)
        .is("expires_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setToken(data.token);
        setShareUrl(`${window.location.origin}/track/${data.token}`);
      }
    } catch (error: any) {
      console.error("Error checking token:", error);
    }
  };

  const generateNewToken = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .rpc("generate_project_share_token", {
          project_id_param: projectId,
          expires_days: null,
        });

      if (error) throw error;

      setToken(data);
      setShareUrl(`${window.location.origin}/track/${data}`);

      toast({
        title: "Link Generated",
        description: "Customer tracking link has been created",
      });
    } catch (error: any) {
      console.error("Error generating token:", error);
      toast({
        title: "Error",
        description: "Failed to generate tracking link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Copied!",
        description: "Tracking link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const openInNewTab = () => {
    window.open(shareUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Project Tracking
          </DialogTitle>
          <DialogDescription>
            Generate a secure link for {projectName} that customers can use to track their
            installation progress.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!token ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">
                No tracking link has been generated for this project yet.
              </p>
              <Button onClick={generateNewToken} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Share2 className="mr-2 h-4 w-4" />
                    Generate Tracking Link
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Customer Tracking Link</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="flex-1" />
                  <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={openInNewTab}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This link never expires and can be shared with the customer via email or text.
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={generateNewToken}
                  disabled={loading}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate New Link
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Generating a new link will invalidate the old one
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
