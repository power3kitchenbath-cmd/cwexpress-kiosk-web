import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Printer } from "lucide-react";

const Power3InstallsPlan = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Print-only header */}
      <div className="hidden print:block text-center py-4 border-b">
        <h1 className="text-2xl font-bold">Power 3 Installs - Strategic Partnership Plan</h1>
        <p className="text-sm text-muted-foreground">2026 Launch Strategy</p>
      </div>

      {/* Screen header */}
      <div className="print:hidden sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Power 3" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold">Power 3 Installs</h1>
                <p className="text-sm text-muted-foreground">Strategic Partnership Plan</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print / Save PDF
              </Button>
              <Button onClick={() => navigate("/presentations")} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6 print:hidden">
          <span className="inline-block px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-sm font-medium">
            CONFIDENTIAL - INTERNAL USE ONLY
          </span>
        </div>

        <div className="space-y-6">
          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>Power 3 Installs - Installation Services Division</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Company Overview</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Power 3 Installs (formerly Power Three Kitchen and Bath Installs LLC) is a separate operating entity within the Power 3 ecosystem, dedicated to providing comprehensive installation services for kitchen and bath renovation projects. Launching in early 2026, this division will serve as the installation arm for all Power 3 companies while maintaining operational independence.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Mission Statement</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To deliver exceptional installation services through experienced project management, skilled trade teams, and systematic processes that ensure quality, efficiency, and customer satisfaction across all renovation projects.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">Q1 2026</div>
                  <div className="text-sm text-muted-foreground">Launch Date</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">30+ Years</div>
                  <div className="text-sm text-muted-foreground">PM Experience</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">All Trades</div>
                  <div className="text-sm text-muted-foreground">Service Coverage</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leadership Structure */}
          <Card>
            <CardHeader>
              <CardTitle>Leadership & Management Structure</CardTitle>
              <CardDescription>Project Manager Role & Responsibilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-lg mb-2">Patrick James - Project Manager</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  30+ years of experience in home remodeling and renovations across all trades
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Core Responsibilities:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Oversee all installation projects from initiation to completion</li>
                      <li>• Manage day-to-day operations of installation teams</li>
                      <li>• Ensure quality control and adherence to project timelines</li>
                      <li>• Client communication and project updates</li>
                      <li>• Problem resolution and issue management</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Team Building & Training:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Recruit skilled installers for all trade categories</li>
                      <li>• Build and manage specialized installation teams</li>
                      <li>• Develop training programs for new team members</li>
                      <li>• Implement quality standards and best practices</li>
                      <li>• Foster a culture of excellence and accountability</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Compensation Structure:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Competitive salary position with benefits</li>
                      <li>• Performance-based incentives tied to project completion</li>
                      <li>• Bonus structure based on customer satisfaction scores</li>
                      <li>• Profit-sharing opportunities as company grows</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Offerings */}
          <Card>
            <CardHeader>
              <CardTitle>Service Categories</CardTitle>
              <CardDescription>Comprehensive Installation Services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Countertop Installation</h4>
                  <p className="text-sm text-muted-foreground">
                    Quartz, granite, and solid surface installations with precision templating and fabrication coordination
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Cabinet Installation</h4>
                  <p className="text-sm text-muted-foreground">
                    Professional cabinet installation, hardware mounting, and alignment services
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Flooring Installation</h4>
                  <p className="text-sm text-muted-foreground">
                    LVP, tile, hardwood installation with proper subfloor preparation
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Plumbing Services</h4>
                  <p className="text-sm text-muted-foreground">
                    Fixture installation, water line connections, and drainage systems
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Electrical Work</h4>
                  <p className="text-sm text-muted-foreground">
                    Lighting installation, outlet placement, and appliance connections
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Painting & Finishing</h4>
                  <p className="text-sm text-muted-foreground">
                    Professional painting, trim work, and finishing touches
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2026 Launch Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>2026 Launch Timeline</CardTitle>
              <CardDescription>Strategic Roadmap for Power 3 Installs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="font-semibold">Q1 2026: Foundation & Setup</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• Finalize partnership agreement and legal entity formation</li>
                    <li>• Onboard Patrick James as Project Manager</li>
                    <li>• Establish operational processes and systems</li>
                    <li>• Begin initial team recruitment (2-3 lead installers per trade)</li>
                    <li>• Set up vendor relationships for materials and equipment</li>
                    <li>• Implement project management software and tracking systems</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="font-semibold">Q2 2026: Team Building & Training</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• Complete core team recruitment across all trade categories</li>
                    <li>• Develop and implement training programs</li>
                    <li>• Establish quality standards and safety protocols</li>
                    <li>• Begin accepting projects from Power 3 ecosystem</li>
                    <li>• Target: 10-15 installation projects in first quarter of operation</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="font-semibold">Q3 2026: Scale & Optimization</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• Expand team capacity based on project demand</li>
                    <li>• Refine processes based on initial project learnings</li>
                    <li>• Implement customer satisfaction tracking and feedback loops</li>
                    <li>• Target: 25-30 concurrent projects with multiple crews</li>
                    <li>• Develop specialized teams for complex installations</li>
                  </ul>
                </div>

                <div className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="font-semibold">Q4 2026: Maturity & Growth</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• Full operational capacity with established team</li>
                    <li>• Begin accepting external projects (non-Power 3 clients)</li>
                    <li>• Evaluate performance metrics and adjust compensation structures</li>
                    <li>• Plan for 2027 expansion and additional market opportunities</li>
                    <li>• Target: 40+ projects per quarter, 95%+ customer satisfaction</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partnership Structure */}
          <Card>
            <CardHeader>
              <CardTitle>Partnership Structure</CardTitle>
              <CardDescription>Separate Entity Within Power 3 Ecosystem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Legal Structure</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Separate legal entity: Power 3 Installs LLC</li>
                  <li>• Independent operations and financial management</li>
                  <li>• Maintained connection to Power 3 ecosystem for brand alignment</li>
                  <li>• Shared resources where beneficial (marketing, administrative support)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Operational Independence</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Autonomous decision-making for installation operations</li>
                  <li>• Independent P&L responsibility</li>
                  <li>• Ability to service Power 3 companies and external clients</li>
                  <li>• Project Manager has authority over team building and daily operations</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Power 3 Integration</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Preferred installer for all Power 3 company projects</li>
                  <li>• Shared quality standards and customer service expectations</li>
                  <li>• Coordinated marketing and brand presentation</li>
                  <li>• Access to Power 3 customer base and referral network</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Financial Projections */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Projections - First Year (2026)</CardTitle>
              <CardDescription>Conservative estimates for inaugural year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Projected Revenue</div>
                    <div className="text-2xl font-bold">$750K - $1.2M</div>
                    <div className="text-xs text-muted-foreground mt-1">Based on 100-150 projects</div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Target Gross Margin</div>
                    <div className="text-2xl font-bold">35-40%</div>
                    <div className="text-xs text-muted-foreground mt-1">Industry standard range</div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Team Size (EOY)</div>
                    <div className="text-2xl font-bold">12-15</div>
                    <div className="text-xs text-muted-foreground mt-1">Including PM and installers</div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Break-even Target</div>
                    <div className="text-2xl font-bold">Q3 2026</div>
                    <div className="text-xs text-muted-foreground mt-1">6 months post-launch</div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Key Assumptions</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Average project value: $7,500 - $10,000</li>
                    <li>• Project duration: 3-7 days per installation</li>
                    <li>• 80% of initial projects from Power 3 ecosystem</li>
                    <li>• Gradual ramp-up from 5 projects/month to 15+ by year-end</li>
                    <li>• Labor costs at 50-55% of project revenue</li>
                    <li>• Overhead and administrative costs at 10-15%</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>Measuring success and operational excellence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Operational Metrics</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• On-time project completion: 95%+</li>
                    <li>• Project quality score: 4.5/5.0+</li>
                    <li>• Customer satisfaction: 95%+</li>
                    <li>• Rework rate: &lt;3%</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Financial Metrics</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Gross margin target: 35-40%</li>
                    <li>• Revenue per installer: $75K-$100K</li>
                    <li>• Project profitability: 15-20%+</li>
                    <li>• Cash flow positive by Q3</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Growth Metrics</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Monthly project volume growth: 10-15%</li>
                    <li>• Repeat customer rate: 40%+</li>
                    <li>• Referral rate: 30%+</li>
                    <li>• Team retention: 90%+</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Team Performance</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Installer productivity: 95%+ billable time</li>
                    <li>• Safety incidents: Zero tolerance</li>
                    <li>• Training completion: 100%</li>
                    <li>• Team satisfaction: 4.0/5.0+</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competitive Advantages */}
          <Card>
            <CardHeader>
              <CardTitle>Competitive Advantages</CardTitle>
              <CardDescription>What sets Power 3 Installs apart</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">1</div>
                  <div>
                    <h4 className="font-semibold text-sm">Ecosystem Integration</h4>
                    <p className="text-sm text-muted-foreground">Seamless coordination with Power 3 Countertops and other ecosystem companies ensures streamlined project execution</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">2</div>
                  <div>
                    <h4 className="font-semibold text-sm">Experienced Leadership</h4>
                    <p className="text-sm text-muted-foreground">30+ years of project management expertise ensures quality and reliability from day one</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">3</div>
                  <div>
                    <h4 className="font-semibold text-sm">Comprehensive Service Offering</h4>
                    <p className="text-sm text-muted-foreground">One-stop-shop for all renovation trades eliminates coordination headaches for customers</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">4</div>
                  <div>
                    <h4 className="font-semibold text-sm">Quality-First Culture</h4>
                    <p className="text-sm text-muted-foreground">Built-in training programs and quality standards from inception set high bar for performance</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">5</div>
                  <div>
                    <h4 className="font-semibold text-sm">Aligned Incentives</h4>
                    <p className="text-sm text-muted-foreground">Performance-based compensation ensures team motivation aligns with company success</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Mitigation */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Mitigation Strategy</CardTitle>
              <CardDescription>Addressing potential challenges proactively</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-amber-500 pl-4 py-2">
                  <h4 className="font-semibold text-sm">Risk: Difficulty recruiting skilled installers</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Mitigation:</strong> Leverage Patrick's 30+ year network, offer competitive compensation, provide training opportunities, create positive work culture
                  </p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4 py-2">
                  <h4 className="font-semibold text-sm">Risk: Initial project volume uncertainty</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Mitigation:</strong> Guaranteed project flow from Power 3 ecosystem, phased team expansion, flexible staffing model with subcontractors
                  </p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4 py-2">
                  <h4 className="font-semibold text-sm">Risk: Quality control issues during rapid growth</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Mitigation:</strong> Mandatory training programs, documented quality standards, regular inspections, customer feedback loops
                  </p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4 py-2">
                  <h4 className="font-semibold text-sm">Risk: Cash flow constraints in early months</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Mitigation:</strong> Conservative financial projections, working capital reserves, milestone-based payment structures, line of credit establishment
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Immediate Next Steps</CardTitle>
              <CardDescription>Actions required to launch Power 3 Installs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">1</div>
                  <div className="text-sm">
                    <strong>Legal Formation</strong> - Establish Power 3 Installs LLC as separate legal entity
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">2</div>
                  <div className="text-sm">
                    <strong>Partnership Agreement</strong> - Finalize terms with Patrick James, including salary and incentive structure
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">3</div>
                  <div className="text-sm">
                    <strong>Operational Setup</strong> - Implement project management systems, establish vendor relationships
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">4</div>
                  <div className="text-sm">
                    <strong>Initial Recruitment</strong> - Begin hiring process for core team members across key trade categories
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">5</div>
                  <div className="text-sm">
                    <strong>Launch Marketing</strong> - Announce Power 3 Installs to existing customer base and begin accepting projects
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print-only footer */}
      <div className="hidden print:block border-t py-4 text-center text-xs text-muted-foreground mt-8">
        <p>© 2025 Power 3 Installs LLC - All Rights Reserved</p>
        <p className="mt-1">CONFIDENTIAL - This document contains proprietary business information</p>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            margin: 0.75in;
            size: letter;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          * {
            break-inside: avoid;
          }
          h1, h2, h3, h4 {
            break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default Power3InstallsPlan;
