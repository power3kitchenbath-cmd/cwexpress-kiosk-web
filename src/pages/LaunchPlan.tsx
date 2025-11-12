import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, CheckCircle2, TrendingUp, Users, DollarSign, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const LaunchPlan = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block text-center py-8 border-b-2 border-primary">
        <img src={logo} alt="Cornerstone Countertops" className="h-16 mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">A Power3 Company</p>
      </div>

      {/* Watermark - Only visible when printing */}
      <div className="hidden print:block fixed inset-0 flex items-center justify-center pointer-events-none z-50 opacity-10">
        <div className="transform -rotate-45">
          <p className="text-6xl font-bold text-primary">CONFIDENTIAL</p>
          <p className="text-4xl font-semibold text-center text-muted-foreground">INTERNAL USE ONLY</p>
        </div>
      </div>

      {/* Screen Header - Hidden when printing */}
      <div className="print:hidden bg-gradient-to-r from-primary to-primary-dark text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Cornerstone Countertops" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold">2026 Launch Plan</h1>
                <p className="text-sm opacity-90">A Power3 Company</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handlePrint}>
                <Download className="mr-2 h-4 w-4" />
                Print / Save PDF
              </Button>
              <Button variant="outline" onClick={() => navigate(-1)} className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Confidential Badge - Screen only */}
        <div className="print:hidden mb-6">
          <Badge variant="destructive" className="text-lg py-2 px-4">
            CONFIDENTIAL / INTERNAL USE ONLY
          </Badge>
        </div>

        {/* Executive Summary */}
        <Card className="mb-8 border-2 border-primary/20 print:shadow-none print:border print:border-border">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-3xl text-primary">Executive Summary</CardTitle>
            <CardDescription className="text-lg">Strategic roadmap for Cornerstone Countertops 2026 market expansion</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-lg leading-relaxed mb-4">
              Cornerstone Countertops, a Power3 Company initiative, is positioned to revolutionize the countertop installation and customer experience market in 2026. Through strategic supplier partnerships, innovative kiosk technology, and streamlined operations, we aim to capture significant market share while delivering exceptional value to customers.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">$5M</p>
                <p className="text-sm text-muted-foreground">Year 1 Target Revenue</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Customer Installations</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">3</p>
                <p className="text-sm text-muted-foreground">Kiosk Locations</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">35%</p>
                <p className="text-sm text-muted-foreground">Market Growth Target</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Comparison */}
        <Card className="mb-8 print:break-inside-avoid print:shadow-none print:border print:border-border">
          <CardHeader className="bg-secondary/10">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Package className="h-6 w-6 text-secondary" />
              Supplier Analysis & Comparison
            </CardTitle>
            <CardDescription>Strategic evaluation of key cabinet suppliers for 2026</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Caesarstone */}
              <div className="border-2 border-muted rounded-lg p-6 hover:border-primary/50 transition-colors">
                <h3 className="text-xl font-bold mb-3 text-primary">Caesarstone</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground mb-1">Market Position</p>
                    <p>Premium brand, established market leader</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground mb-1">Pricing</p>
                    <p className="text-destructive font-semibold">Higher cost structure ($$$)</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground mb-1">Advantages</p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <span>Strong brand recognition</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <span>Extensive product line</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <span>Proven quality standards</span>
                      </li>
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground mb-1">Challenges</p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-destructive mt-1">•</span>
                        <span>Premium pricing reduces margin</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive mt-1">•</span>
                        <span>Longer lead times</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive mt-1">•</span>
                        <span>Minimum order requirements</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Best Cheer Stone USA */}
              <div className="border-2 border-secondary rounded-lg p-6 bg-secondary/5 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-secondary">Best Cheer Stone USA</h3>
                  <Badge className="bg-secondary text-secondary-foreground">Recommended</Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground mb-1">Market Position</p>
                    <p>Emerging supplier, competitive pricing</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground mb-1">Pricing</p>
                    <p className="text-secondary font-semibold">Cost-effective structure ($$)</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground mb-1">Advantages</p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-secondary mt-1 flex-shrink-0" />
                        <span className="font-semibold">30-40% cost savings vs. Caesarstone</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-secondary mt-1 flex-shrink-0" />
                        <span>Flexible order quantities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-secondary mt-1 flex-shrink-0" />
                        <span>Faster turnaround times</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-secondary mt-1 flex-shrink-0" />
                        <span>Comparable quality standards</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-secondary mt-1 flex-shrink-0" />
                        <span>Direct manufacturer relationship</span>
                      </li>
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground mb-1">Strategic Value</p>
                    <p className="text-sm">Higher margins enable competitive customer pricing while maintaining profitability targets. Partnership flexibility supports rapid scaling.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-secondary/10 border-l-4 border-secondary rounded-r-lg">
              <p className="font-semibold text-lg mb-2">Recommendation: Best Cheer Stone USA</p>
              <p className="text-muted-foreground">
                For initial 2026 launch, Best Cheer Stone USA offers optimal balance of cost efficiency, flexibility, and quality. Cost savings translate to competitive market positioning while maintaining 35%+ gross margins.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Power3 Ecosystem */}
        <Card className="mb-8 print:break-inside-avoid print:shadow-none print:border print:border-border">
          <CardHeader className="bg-primary/10">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Power3 Ecosystem Integration
            </CardTitle>
            <CardDescription>Leveraging synergies across Power3 portfolio companies</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-lg mb-6">
              As a Power3 Company, Cornerstone Countertops benefits from shared resources, operational excellence, and strategic partnerships across the portfolio.
            </p>

            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Shared Financial Infrastructure</h4>
                  <p className="text-muted-foreground">Access to Power3's financial systems, accounting support, and credit facilities for growth capital.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Operational Support</h4>
                  <p className="text-muted-foreground">HR, legal, compliance, and operational expertise from Power3 shared services team.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Technology & Innovation</h4>
                  <p className="text-muted-foreground">Custom kiosk estimator platform, CRM systems, and digital marketing tools developed within Power3 ecosystem.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Supply Chain Synergies</h4>
                  <p className="text-muted-foreground">Leverage Power3 relationships for preferential supplier terms, logistics optimization, and bulk purchasing power.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Launch Timeline */}
        <Card className="mb-8 print:break-inside-avoid print:shadow-none print:border print:border-border">
          <CardHeader>
            <CardTitle className="text-2xl">2026 Launch Timeline</CardTitle>
            <CardDescription>Phased rollout strategy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="relative pl-8 pb-6 border-l-2 border-primary">
                <div className="absolute left-0 top-0 -translate-x-1/2 h-4 w-4 rounded-full bg-primary" />
                <p className="font-semibold text-lg mb-1">Q1 2026 - Foundation</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Finalize Best Cheer Stone USA partnership</li>
                  <li>• Complete first kiosk installation</li>
                  <li>• Hire core operations team</li>
                  <li>• Launch digital marketing campaign</li>
                </ul>
              </div>

              <div className="relative pl-8 pb-6 border-l-2 border-primary">
                <div className="absolute left-0 top-0 -translate-x-1/2 h-4 w-4 rounded-full bg-primary" />
                <p className="font-semibold text-lg mb-1">Q2 2026 - Market Entry</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Begin customer installations</li>
                  <li>• Second kiosk location launch</li>
                  <li>• Establish installation partner network</li>
                  <li>• Refine pricing and operations</li>
                </ul>
              </div>

              <div className="relative pl-8 pb-6 border-l-2 border-primary">
                <div className="absolute left-0 top-0 -translate-x-1/2 h-4 w-4 rounded-full bg-primary" />
                <p className="font-semibold text-lg mb-1">Q3 2026 - Scale</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Third kiosk deployment</li>
                  <li>• Expand product offerings</li>
                  <li>• Launch customer referral program</li>
                  <li>• Optimize supply chain operations</li>
                </ul>
              </div>

              <div className="relative pl-8 border-l-2 border-dashed border-primary">
                <div className="absolute left-0 top-0 -translate-x-1/2 h-4 w-4 rounded-full bg-secondary" />
                <p className="font-semibold text-lg mb-1">Q4 2026 - Growth</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Evaluate additional markets</li>
                  <li>• Year-end revenue target: $5M</li>
                  <li>• Plan 2027 expansion strategy</li>
                  <li>• Assess additional supplier partnerships</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Projections */}
        <Card className="print:break-inside-avoid print:shadow-none print:border print:border-border">
          <CardHeader>
            <CardTitle className="text-2xl">Financial Projections</CardTitle>
            <CardDescription>Conservative estimates for Year 1 (2026)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Projected Revenue</p>
                  <p className="text-3xl font-bold text-primary">$5.0M</p>
                </div>
                <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                  <p className="text-sm text-muted-foreground mb-1">Gross Margin</p>
                  <p className="text-3xl font-bold text-secondary">35%</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Customer Acquisitions</p>
                  <p className="text-3xl font-bold">500+</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Key Assumptions</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Average project value: $10,000</li>
                  <li>• 30-40% cost savings through Best Cheer Stone USA partnership</li>
                  <li>• 3 kiosk locations by Q3 2026</li>
                  <li>• 35% gross margin maintained through efficient operations</li>
                  <li>• Power3 infrastructure support reduces overhead by 15%</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Print Footer */}
        <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>© 2026 Cornerstone Countertops - A Power3 Company | CONFIDENTIAL & PROPRIETARY</p>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          @page {
            margin: 1in;
            size: letter;
          }
          
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          
          button, .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LaunchPlan;