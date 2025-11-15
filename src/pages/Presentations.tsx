import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Presentation, ExternalLink, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/use-user-role";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const Presentations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You must be an admin to access this page.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, roleLoading, navigate, toast]);

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const presentations = [
    {
      id: 1,
      title: "2026 Launch Plan",
      description: "Comprehensive strategic roadmap for Cornerstone Countertops 2026 market expansion",
      type: "Strategic Plan",
      icon: FileText,
      path: "/launch-plan",
      badge: "Internal",
    },
    {
      id: 2,
      title: "Investor Pitch Deck",
      description: "Funding requirements, ROI projections, competitive analysis, and exit strategy",
      type: "Investment Materials",
      icon: Presentation,
      path: "/investor-deck",
      badge: "Confidential",
    },
    {
      id: 3,
      title: "Supplier Comparison Analysis",
      description: "Detailed comparison between Caesarstone and Best Cheer Stone USA",
      type: "Analysis",
      icon: Presentation,
      path: "/launch-plan",
      badge: "Confidential",
    },
    {
      id: 4,
      title: "Power3 Ecosystem Overview",
      description: "Strategic value and synergies within the Power3 company portfolio",
      type: "Overview",
      icon: Presentation,
      path: "/launch-plan",
      badge: "Internal",
    },
    {
      id: 5,
      title: "Power 3 Installs - Partnership Plan",
      description: "Strategic roadmap for Power 3 Installs LLC, including leadership structure, service offerings, 2026 launch timeline, and financial projections",
      type: "Partnership Agreement",
      icon: Building2,
      path: "/power3-installs-plan",
      badge: "Confidential",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <img src={logo} alt="Logo" className="h-12" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Business Presentations</h1>
            <p className="text-muted-foreground">Strategic documents and investor materials</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
        </div>

        {/* Instructions Card */}
        <Card className="mb-8 border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Presentation className="h-5 w-5 text-primary" />
              About This Section
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-muted-foreground">
              <p>
                This section contains professional business documents, strategic plans, and presentation materials for Cornerstone Countertops.
              </p>
              <p>
                All documents are optimized for printing and can be saved as PDFs directly from your browser using the print function.
              </p>
              <div className="mt-4 p-4 bg-background rounded-lg border border-border">
                <p className="font-semibold text-foreground mb-2">💡 How to create a PDF:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Click on a presentation below to open it</li>
                  <li>Click the "Print / Save PDF" button (or press Ctrl/Cmd + P)</li>
                  <li>Select "Save as PDF" as your printer destination</li>
                  <li>Adjust settings if needed and save the file</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Presentations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presentations.map((presentation) => {
            const Icon = presentation.icon;
            return (
              <Card 
                key={presentation.id} 
                className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary/50"
                onClick={() => navigate(presentation.path)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs px-2 py-1 bg-secondary/20 text-secondary-foreground rounded-full font-medium">
                      {presentation.badge}
                    </span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {presentation.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {presentation.type}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {presentation.description}
                  </p>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    View Document
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Document Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Confidentiality:</strong> All documents contain sensitive business information and are marked as confidential. Handle accordingly.
              </p>
              <p>
                <strong className="text-foreground">Branding:</strong> Documents include Cornerstone Countertops logo, Power3 Company branding, and appropriate watermarks.
              </p>
              <p>
                <strong className="text-foreground">Updates:</strong> Documents are updated as business strategy evolves. Check back regularly for the latest versions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Presentations;