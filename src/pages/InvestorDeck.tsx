import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, TrendingUp, DollarSign, Users, Target, Award, Zap, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const InvestorDeck = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Print Header */}
      <div className="hidden print:block text-center py-8 border-b-2 border-primary">
        <img src={logo} alt="Cornerstone Countertops" className="h-16 mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">A Power3 Company</p>
      </div>

      {/* Watermark */}
      <div className="hidden print:block fixed inset-0 flex items-center justify-center pointer-events-none z-50 opacity-10">
        <div className="transform -rotate-45">
          <p className="text-6xl font-bold text-primary">CONFIDENTIAL</p>
          <p className="text-4xl font-semibold text-center text-muted-foreground">INTERNAL USE ONLY</p>
        </div>
      </div>

      {/* Screen Header */}
      <div className="print:hidden bg-gradient-to-r from-primary to-primary-dark text-primary-foreground py-6 shadow-lg">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Cornerstone Countertops" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold">Investor Pitch Deck</h1>
                <p className="text-sm opacity-90">A Power3 Company Investment Opportunity</p>
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
        {/* Confidential Badge */}
        <div className="print:hidden mb-6">
          <Badge variant="destructive" className="text-lg py-2 px-4">
            CONFIDENTIAL INVESTOR MATERIALS
          </Badge>
        </div>

        {/* Investment Opportunity */}
        <Card className="mb-8 border-2 border-primary/20 print:shadow-none print:border print:border-border">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardTitle className="text-3xl text-primary">Investment Opportunity</CardTitle>
            <CardDescription className="text-lg">Revolutionizing the countertop installation experience</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-3">The Opportunity</h3>
                <p className="text-lg leading-relaxed">
                  Cornerstone Countertops is seeking <strong className="text-primary">$2.5M in Series A funding</strong> to accelerate market expansion and establish leadership in the digital-first countertop installation sector. Backed by Power3's proven operational framework, we're positioned to capture significant market share in a $15B+ industry.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
                  <Target className="h-10 w-10 text-primary mb-3" />
                  <h4 className="font-bold text-xl mb-2">Target Raise</h4>
                  <p className="text-3xl font-bold text-primary mb-2">$2.5M</p>
                  <p className="text-sm text-muted-foreground">Series A Preferred Equity</p>
                </div>

                <div className="p-6 bg-secondary/5 rounded-lg border-2 border-secondary/20">
                  <TrendingUp className="h-10 w-10 text-secondary mb-3" />
                  <h4 className="font-bold text-xl mb-2">Projected IRR</h4>
                  <p className="text-3xl font-bold text-secondary mb-2">45-55%</p>
                  <p className="text-sm text-muted-foreground">5-Year Investment Horizon</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">$25M</p>
                  <p className="text-sm text-muted-foreground">Year 3 Revenue Target</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">2,500+</p>
                  <p className="text-sm text-muted-foreground">Annual Installations Y3</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">15</p>
                  <p className="text-sm text-muted-foreground">Kiosk Locations Y3</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Opportunity */}
        <Card className="mb-8 print:break-inside-avoid print:shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Market Opportunity
            </CardTitle>
            <CardDescription>Large, underserved market ripe for disruption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Total Addressable Market</p>
                  <p className="text-3xl font-bold text-primary">$15B+</p>
                  <p className="text-xs text-muted-foreground mt-1">U.S. Countertop Market</p>
                </div>
                <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                  <p className="text-sm text-muted-foreground mb-1">Market Growth Rate</p>
                  <p className="text-3xl font-bold text-secondary">8.2%</p>
                  <p className="text-xs text-muted-foreground mt-1">CAGR 2024-2030</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Target Market Share</p>
                  <p className="text-3xl font-bold">3-5%</p>
                  <p className="text-xs text-muted-foreground mt-1">By Year 5</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-3">Key Market Drivers</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Home Renovation Boom</p>
                      <p className="text-sm text-muted-foreground">Millennials entering prime home buying years; 65% plan kitchen renovations within 3 years</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">E-Commerce Adoption</p>
                      <p className="text-sm text-muted-foreground">Consumers increasingly comfortable with large purchases through digital channels</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Fragmented Competition</p>
                      <p className="text-sm text-muted-foreground">No dominant national player; 80% of market controlled by local/regional installers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitive Analysis */}
        <Card className="mb-8 print:break-inside-avoid print:shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Competitive Analysis
            </CardTitle>
            <CardDescription>Our differentiated approach vs. traditional competitors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left p-3 font-semibold">Factor</th>
                    <th className="text-left p-3 font-semibold bg-primary/10">Cornerstone</th>
                    <th className="text-left p-3 font-semibold">Traditional Installers</th>
                    <th className="text-left p-3 font-semibold">Big Box Stores</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium">Pricing Transparency</td>
                    <td className="p-3 bg-primary/5">
                      <Badge className="bg-secondary text-secondary-foreground">Instant Digital Quotes</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">Requires consultation</td>
                    <td className="p-3 text-muted-foreground">Multiple visits needed</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium">Customer Experience</td>
                    <td className="p-3 bg-primary/5">
                      <Badge className="bg-secondary text-secondary-foreground">Self-Service Kiosks</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">Sales-heavy</td>
                    <td className="p-3 text-muted-foreground">Generic process</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium">Lead Time</td>
                    <td className="p-3 bg-primary/5">
                      <Badge className="bg-secondary text-secondary-foreground">2-3 Weeks</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">4-6 weeks</td>
                    <td className="p-3 text-muted-foreground">6-8 weeks</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium">Technology</td>
                    <td className="p-3 bg-primary/5">
                      <Badge className="bg-secondary text-secondary-foreground">AI-Powered Platform</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">Manual processes</td>
                    <td className="p-3 text-muted-foreground">Basic tools</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 font-medium">Cost Structure</td>
                    <td className="p-3 bg-primary/5">
                      <Badge className="bg-secondary text-secondary-foreground">30-40% Lower</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">High overhead</td>
                    <td className="p-3 text-muted-foreground">High markup</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-secondary/10 border-l-4 border-secondary rounded-r-lg">
              <p className="font-semibold text-lg mb-2">Competitive Advantage</p>
              <p className="text-muted-foreground">
                Our technology-first approach combined with Power3's operational excellence delivers 40% faster turnaround at 25% lower cost while maintaining superior quality standards. No competitor offers this value proposition at scale.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Projections */}
        <Card className="mb-8 print:break-inside-avoid print:shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              Financial Projections & ROI
            </CardTitle>
            <CardDescription>Conservative 5-year growth trajectory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border bg-muted/50">
                      <th className="text-left p-3 font-semibold">Metric</th>
                      <th className="text-right p-3 font-semibold">Year 1</th>
                      <th className="text-right p-3 font-semibold">Year 2</th>
                      <th className="text-right p-3 font-semibold">Year 3</th>
                      <th className="text-right p-3 font-semibold">Year 4</th>
                      <th className="text-right p-3 font-semibold">Year 5</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="p-3 font-medium">Revenue</td>
                      <td className="text-right p-3">$5.0M</td>
                      <td className="text-right p-3">$12.5M</td>
                      <td className="text-right p-3 font-bold text-primary">$25.0M</td>
                      <td className="text-right p-3">$42.5M</td>
                      <td className="text-right p-3 font-bold text-secondary">$65.0M</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 font-medium">Gross Margin</td>
                      <td className="text-right p-3">35%</td>
                      <td className="text-right p-3">36%</td>
                      <td className="text-right p-3">38%</td>
                      <td className="text-right p-3">40%</td>
                      <td className="text-right p-3">42%</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 font-medium">EBITDA</td>
                      <td className="text-right p-3 text-destructive">($0.5M)</td>
                      <td className="text-right p-3">$1.0M</td>
                      <td className="text-right p-3">$4.5M</td>
                      <td className="text-right p-3">$10.2M</td>
                      <td className="text-right p-3 font-bold text-secondary">$18.2M</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 font-medium">Installations</td>
                      <td className="text-right p-3">500</td>
                      <td className="text-right p-3">1,250</td>
                      <td className="text-right p-3">2,500</td>
                      <td className="text-right p-3">4,250</td>
                      <td className="text-right p-3">6,500</td>
                    </tr>
                    <tr className="border-b border-border bg-muted/30">
                      <td className="p-3 font-medium">Kiosk Locations</td>
                      <td className="text-right p-3">3</td>
                      <td className="text-right p-3">6</td>
                      <td className="text-right p-3">15</td>
                      <td className="text-right p-3">25</td>
                      <td className="text-right p-3 font-bold">40</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-lg mb-4">Return on Investment Analysis</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Investment</span>
                        <span className="text-sm font-bold">$2.5M</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Year 3 Enterprise Value</span>
                        <span className="text-sm font-bold text-primary">$45M</span>
                      </div>
                      <Progress value={90} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Year 5 Enterprise Value</span>
                        <span className="text-sm font-bold text-secondary">$125M</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-1">Projected IRR (5-Year)</p>
                      <p className="text-3xl font-bold text-primary">45-55%</p>
                    </div>
                    <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                      <p className="text-sm text-muted-foreground mb-1">Expected MOIC</p>
                      <p className="text-3xl font-bold text-secondary">18-25x</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Payback Period</p>
                      <p className="text-3xl font-bold">2.5 Years</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-sm font-semibold mb-2">Key Assumptions:</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Average project value: $10,000 (conservative)</li>
                  <li>• Customer acquisition cost: $350 per installation</li>
                  <li>• 35-42% gross margin through supplier optimization</li>
                  <li>• Kiosk capacity: 150-200 installations per location annually</li>
                  <li>• Exit multiple: 7-10x EBITDA (industry standard)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Use of Funds */}
        <Card className="mb-8 print:break-inside-avoid print:shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Use of Funds
            </CardTitle>
            <CardDescription>Strategic allocation of $2.5M Series A investment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Kiosk Expansion (10 locations)</span>
                  <span className="font-bold text-primary">$1,000,000 (40%)</span>
                </div>
                <Progress value={40} className="h-3 mb-1" />
                <p className="text-sm text-muted-foreground">Physical locations, equipment, design/build, initial inventory</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Technology & Platform</span>
                  <span className="font-bold text-primary">$500,000 (20%)</span>
                </div>
                <Progress value={20} className="h-3 mb-1" />
                <p className="text-sm text-muted-foreground">Enhanced estimator AI, mobile app, CRM integration, customer portal</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Marketing & Customer Acquisition</span>
                  <span className="font-bold text-primary">$500,000 (20%)</span>
                </div>
                <Progress value={20} className="h-3 mb-1" />
                <p className="text-sm text-muted-foreground">Digital advertising, brand development, content marketing, partnerships</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Operations & Team</span>
                  <span className="font-bold text-primary">$350,000 (14%)</span>
                </div>
                <Progress value={14} className="h-3 mb-1" />
                <p className="text-sm text-muted-foreground">Hiring key roles: COO, sales team, installation coordinators</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Working Capital</span>
                  <span className="font-bold text-primary">$150,000 (6%)</span>
                </div>
                <Progress value={6} className="h-3 mb-1" />
                <p className="text-sm text-muted-foreground">Operational runway, supplier deposits, contingency reserves</p>
              </div>

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold pt-2">
                <span>Total Investment</span>
                <span className="text-primary">$2,500,000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management & Team */}
        <Card className="mb-8 print:break-inside-avoid print:shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Power3 Ecosystem Advantage
            </CardTitle>
            <CardDescription>Proven operational excellence and infrastructure support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                As a Power3 Company, Cornerstone benefits from established operational frameworks, shared services, and proven execution capabilities across the portfolio. This reduces typical startup risk and accelerates time to profitability.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <Award className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-semibold mb-2">Operational Infrastructure</h4>
                  <p className="text-sm text-muted-foreground">Shared finance, legal, HR, and compliance teams reduce overhead by 40%</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-semibold mb-2">Risk Mitigation</h4>
                  <p className="text-sm text-muted-foreground">Proven playbooks from Power3's successful ventures across multiple industries</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <DollarSign className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-semibold mb-2">Financial Backing</h4>
                  <p className="text-sm text-muted-foreground">Access to Power3's credit facilities and financial resources for growth capital</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <TrendingUp className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-semibold mb-2">Scaling Expertise</h4>
                  <p className="text-sm text-muted-foreground">Cross-portfolio insights and best practices accelerate expansion timeline</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exit Strategy */}
        <Card className="print:break-inside-avoid print:shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl">Exit Strategy</CardTitle>
            <CardDescription>Multiple paths to liquidity for investors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Strategic Acquisition (Primary)
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Target window: Years 3-5 | Expected multiple: 8-12x EBITDA
                </p>
                <p className="text-sm text-muted-foreground">
                  Likely acquirers include national home improvement retailers (Home Depot, Lowe's), countertop manufacturers (Caesarstone, Cambria), or PE-backed consolidators in the home services sector.
                </p>
              </div>

              <div className="p-4 bg-secondary/5 rounded-lg border-l-4 border-secondary">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  Recapitalization (Alternative)
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Target window: Years 3-4 | Expected IRR: 35-45%
                </p>
                <p className="text-sm text-muted-foreground">
                  Debt-financed recap to return capital to early investors while maintaining operational control for continued growth toward strategic sale.
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border-l-4 border-border">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Power3 Portfolio Rollup (Opportunistic)
                </h4>
                <p className="text-sm text-muted-foreground">
                  Integration with other Power3 companies to create diversified home services platform, potentially leading to larger strategic sale or IPO of combined entity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Print Footer */}
        <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>© 2026 Cornerstone Countertops - A Power3 Company | CONFIDENTIAL INVESTOR MATERIALS</p>
          <p className="text-xs mt-1">This document contains forward-looking statements and projections. Actual results may vary.</p>
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

export default InvestorDeck;