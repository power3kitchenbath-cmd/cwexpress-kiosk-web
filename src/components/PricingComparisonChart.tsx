import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, TrendingDown, DollarSign, Download, Mail } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { PricingGuideEmailForm } from "./PricingGuideEmailForm";
import { RoomSizeCalculator } from "./RoomSizeCalculator";
import { KitchenSizeCalculator } from "./KitchenSizeCalculator";
import { VanitySizeCalculator } from "./VanitySizeCalculator";
import { MultiProjectEstimator } from "./MultiProjectEstimator";
import { supabase } from "@/integrations/supabase/client";

// Import LVP flooring images
import blondieImg from "@/assets/flooring/lvp/blondie.png";
import butternutImg from "@/assets/flooring/lvp/butternut.png";
import cocoaImg from "@/assets/flooring/lvp/cocoa.png";
import fogImg from "@/assets/flooring/lvp/fog.png";

// Import shower door images
import ds01Img from "@/assets/shower-doors/ds01.jpg";
import ds0166Img from "@/assets/shower-doors/ds01-66.jpg";
import ds08Img from "@/assets/shower-doors/ds08.jpg";
import h07Img from "@/assets/shower-doors/h07.jpg";
import ss03Img from "@/assets/shower-doors/ss03.jpg";

interface CompetitorPrice {
  homeDepot: string;
  lowes: string;
  cabinetsToGo: string;
  ourPrice: string;
  profitMargin: string;
}

interface PricingData {
  category: string;
  items: {
    name: string;
    unit: string;
    prices: CompetitorPrice;
    savings: string;
    imageUrl?: string;
  }[];
}

const pricingData: PricingData[] = [
  {
    category: "Kitchen Cabinet Installation",
    items: [
      {
        name: "10x10 Kitchen Install (Good Tier)",
        unit: "Complete Package",
        prices: {
          homeDepot: "$9,000-$11,000",
          lowes: "$8,800-$10,500",
          cabinetsToGo: "$8,500-$10,200",
          ourPrice: "$8,500-$10,500",
          profitMargin: "45%"
        },
        savings: "Up to $500"
      },
      {
        name: "10x10 Kitchen Install (Better Tier)",
        unit: "Complete Package",
        prices: {
          homeDepot: "$12,500-$15,000",
          lowes: "$12,000-$14,500",
          cabinetsToGo: "$11,500-$13,800",
          ourPrice: "$11,000-$14,500",
          profitMargin: "45%"
        },
        savings: "Up to $1,000"
      },
      {
        name: "10x10 Kitchen Install (Best Tier)",
        unit: "Complete Package",
        prices: {
          homeDepot: "$17,000-$24,000",
          lowes: "$16,500-$22,500",
          cabinetsToGo: "$15,500-$21,000",
          ourPrice: "$15,000-$22,000",
          profitMargin: "45%"
        },
        savings: "Up to $2,000"
      },
      {
        name: "Cabinet Installation Labor Only",
        unit: "Per Linear Foot",
        prices: {
          homeDepot: "$80-$150",
          lowes: "$75-$140",
          cabinetsToGo: "$70-$130",
          ourPrice: "$65-$120",
          profitMargin: "45%"
        },
        savings: "$15-$30/ft"
      }
    ]
  },
  {
    category: "Bathroom Vanity Installation",
    items: [
      {
        name: "Single Vanity Install (Good)",
        unit: "Complete Package",
        prices: {
          homeDepot: "$2,200-$2,800",
          lowes: "$2,100-$2,700",
          cabinetsToGo: "$1,950-$2,500",
          ourPrice: "$1,800-$2,500",
          profitMargin: "45%"
        },
        savings: "Up to $400"
      },
      {
        name: "Single Vanity Install (Better)",
        unit: "Complete Package",
        prices: {
          homeDepot: "$3,200-$4,000",
          lowes: "$3,000-$3,800",
          cabinetsToGo: "$2,850-$3,600",
          ourPrice: "$2,700-$3,500",
          profitMargin: "45%"
        },
        savings: "Up to $500"
      },
      {
        name: "Double Vanity Install (Best)",
        unit: "Complete Package",
        prices: {
          homeDepot: "$4,500-$6,500",
          lowes: "$4,200-$6,200",
          cabinetsToGo: "$4,000-$5,800",
          ourPrice: "$3,800-$5,500",
          profitMargin: "45%"
        },
        savings: "Up to $1,000"
      }
    ]
  },
  {
    category: "Replacement Cabinet Doors",
    items: [
      {
        name: "Shaker Style Door (Standard)",
        unit: "Per Door",
        prices: {
          homeDepot: "$45-$85",
          lowes: "$42-$80",
          cabinetsToGo: "$55-$90",
          ourPrice: "$79.99",
          profitMargin: "45%"
        },
        savings: "Competitive"
      },
      {
        name: "Shaker Style Door (Premium)",
        unit: "Per Door",
        prices: {
          homeDepot: "$85-$120",
          lowes: "$80-$115",
          cabinetsToGo: "$90-$125",
          ourPrice: "$89.99-$99.99",
          profitMargin: "45%"
        },
        savings: "Up to $25/door"
      }
    ]
  },
  {
    category: "Cabinet Hardware",
    items: [
      {
        name: "Bar Pulls (3-5 inch)",
        unit: "Per Piece",
        prices: {
          homeDepot: "$3-$12",
          lowes: "$2.50-$11",
          cabinetsToGo: "$4-$15",
          ourPrice: "$4.99-$9.99",
          profitMargin: "50%"
        },
        savings: "Competitive"
      },
      {
        name: "Knobs (Standard)",
        unit: "Per Piece",
        prices: {
          homeDepot: "$2-$8",
          lowes: "$1.50-$7.50",
          cabinetsToGo: "$3-$10",
          ourPrice: "$3.99-$7.99",
          profitMargin: "50%"
        },
        savings: "Competitive"
      }
    ]
  },
  {
    category: "Countertops",
    items: [
      {
        name: "Quartz Countertops",
        unit: "Per Square Foot",
        prices: {
          homeDepot: "$60-$120",
          lowes: "$55-$115",
          cabinetsToGo: "$65-$125",
          ourPrice: "$55-$110",
          profitMargin: "45%"
        },
        savings: "Up to $15/sqft"
      },
      {
        name: "Calacatta Quartz Premium",
        unit: "Per Linear Foot",
        prices: {
          homeDepot: "$75-$140",
          lowes: "$70-$135",
          cabinetsToGo: "$80-$145",
          ourPrice: "$60-$120",
          profitMargin: "45%"
        },
        savings: "Up to $25/ft"
      }
    ]
  },
  {
    category: "LVP Luxury Vinyl Plank Flooring",
    items: [
      {
        name: "LVP Flooring - Standard Grade (Cocoa, Butternut, Fog, Blondie)",
        unit: "Per Square Foot (Floor Decor: $2.99-$3.99, Empire: $4.99-$5.99)",
        prices: {
          homeDepot: "$3.49-$4.49",
          lowes: "$3.29-$4.29",
          cabinetsToGo: "N/A",
          ourPrice: "$3.49",
          profitMargin: "45%"
        },
        savings: "Up to $2.50/sqft vs Empire",
        imageUrl: cocoaImg
      },
      {
        name: "LVP Flooring - Premium Grade",
        unit: "Per Square Foot (Floor Decor: $4.99-$6.99)",
        prices: {
          homeDepot: "$5.49-$7.49",
          lowes: "$5.29-$7.29",
          cabinetsToGo: "N/A",
          ourPrice: "$4.99-$6.49",
          profitMargin: "45%"
        },
        savings: "Up to $1.00/sqft",
        imageUrl: butternutImg
      },
      {
        name: "LVP Installation - Labor Only",
        unit: "Per Square Foot (We handle all installations in-house)",
        prices: {
          homeDepot: "N/A",
          lowes: "N/A",
          cabinetsToGo: "N/A",
          ourPrice: "$2.00-$3.50",
          profitMargin: "45%"
        },
        savings: "Professional quality, competitive pricing"
      },
      {
        name: "Complete LVP Package (Material + Labor)",
        unit: "Average Room (200-300 sqft)",
        prices: {
          homeDepot: "$1,800-$3,600",
          lowes: "$1,700-$3,400",
          cabinetsToGo: "N/A",
          ourPrice: "$1,100-$3,000",
          profitMargin: "45%"
        },
        savings: "$500-$1,500 per room"
      }
    ]
  },
  {
    category: "Shower Doors & Enclosures",
    items: [
      {
        name: "DS01 Double Sliding (56-60\" x 76\")",
        unit: "Complete Unit",
        prices: {
          homeDepot: "$750-$850",
          lowes: "$725-$825",
          cabinetsToGo: "$700-$800",
          ourPrice: "$647.50-$722.50",
          profitMargin: "45%"
        },
        savings: "Up to $202",
        imageUrl: ds01Img
      },
      {
        name: "DS08 Double Sliding (50-55\" x 76\")",
        unit: "Complete Unit",
        prices: {
          homeDepot: "$550-$650",
          lowes: "$525-$625",
          cabinetsToGo: "$500-$600",
          ourPrice: "$441.25-$491.25",
          profitMargin: "45%"
        },
        savings: "Up to $208",
        imageUrl: ds08Img
      },
      {
        name: "H07 Single Swing (28\" x 76\")",
        unit: "Complete Unit",
        prices: {
          homeDepot: "$550-$650",
          lowes: "$525-$625",
          cabinetsToGo: "$500-$600",
          ourPrice: "$441.25",
          profitMargin: "45%"
        },
        savings: "Up to $208",
        imageUrl: h07Img
      },
      {
        name: "SS03 Single Sliding (56-60\" x 76\")",
        unit: "Complete Unit",
        prices: {
          homeDepot: "$650-$750",
          lowes: "$625-$725",
          cabinetsToGo: "$600-$700",
          ourPrice: "$541.25-$641.25",
          profitMargin: "45%"
        },
        savings: "Up to $208",
        imageUrl: ss03Img
      },
      {
        name: "DS01-66 Double Sliding (66-72\" x 76\")",
        unit: "Complete Unit",
        prices: {
          homeDepot: "$850-$950",
          lowes: "$825-$925",
          cabinetsToGo: "$800-$900",
          ourPrice: "$722.50-$797.50",
          profitMargin: "45%"
        },
        savings: "Up to $227",
        imageUrl: ds0166Img
      }
    ]
  }
];

export function PricingComparisonChart() {
  const [emailFormOpen, setEmailFormOpen] = useState(false);

  const handleDownload = async () => {
    generatePricingPDF();
    
    // Track download event
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("pricing_guide_requests").insert({
        email: user?.email || "anonymous",
        request_type: "download",
        user_id: user?.id,
      });
    } catch (error) {
      console.error("Error tracking download:", error);
    }
  };

  const generatePricingPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header with logo placeholder and title
      doc.setFillColor(25, 58, 130); // Primary blue
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('3 Power Cabinet Store', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Transparent Pricing Guide', pageWidth / 2, 30, { align: 'center' });

      yPosition = 50;

      // Introduction
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const introText = "We believe in honest, transparent pricing. This guide compares our prices to major retailers while maintaining our 45% profit margin to ensure quality service and long-term sustainability.";
      const splitIntro = doc.splitTextToSize(introText, pageWidth - 40);
      doc.text(splitIntro, 20, yPosition);
      yPosition += splitIntro.length * 5 + 10;

      // Process each category
      pricingData.forEach((section, sectionIndex) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }

        // Section header
        doc.setFillColor(25, 58, 130);
        doc.rect(15, yPosition - 5, pageWidth - 30, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(section.category, 20, yPosition + 2);
        yPosition += 15;

        // Create table data
        const tableData = section.items.map(item => [
          item.name,
          item.prices.homeDepot,
          item.prices.lowes,
          item.prices.cabinetsToGo,
          item.prices.ourPrice,
          item.savings
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Service/Product', 'Home Depot', "Lowe's", 'Cabinets to Go', 'Our Price', 'Your Savings']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [241, 245, 249],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 9
          },
          bodyStyles: {
            fontSize: 8,
            textColor: [0, 0, 0]
          },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 30, halign: 'center' },
            4: { cellWidth: 25, halign: 'center', fillColor: [240, 253, 244], fontStyle: 'bold' },
            5: { cellWidth: 25, halign: 'center', fillColor: [254, 249, 195] }
          },
          margin: { left: 15, right: 15 },
          didDrawPage: function(data) {
            yPosition = data.cursor?.y || yPosition;
          }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      });

      // Add new page for pricing philosophy
      doc.addPage();
      yPosition = 20;

      // Pricing Philosophy Header
      doc.setFillColor(25, 58, 130);
      doc.rect(0, yPosition - 10, pageWidth, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Our Pricing Philosophy', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Key Statistics
      doc.setTextColor(0, 0, 0);
      doc.setFillColor(240, 253, 244);
      doc.rect(20, yPosition, pageWidth - 40, 35, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('45% Target Profit Margin', pageWidth / 2, yPosition + 10, { align: 'center' });
      doc.text('100% Price Transparency', pageWidth / 2, yPosition + 20, { align: 'center' });
      doc.text('$500+ Average Customer Savings', pageWidth / 2, yPosition + 30, { align: 'center' });
      yPosition += 45;

      // Philosophy Points
      const philosophyPoints = [
        {
          title: 'Fair Market Value',
          text: 'We continuously monitor competitor pricing to ensure we are competitive while maintaining quality.'
        },
        {
          title: 'Sustainable Margins',
          text: 'Our 45% profit margin allows us to invest in quality materials, skilled labor, and excellent customer service.'
        },
        {
          title: 'No Hidden Fees',
          text: 'What you see is what you pay. No surprise charges or hidden installation costs.'
        },
        {
          title: 'Price Match Promise',
          text: "If you find a comparable service for less, we'll match or beat it while maintaining our quality standards."
        }
      ];

      doc.setFontSize(10);
      philosophyPoints.forEach(point => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFillColor(25, 58, 130);
        doc.circle(22, yPosition + 2, 2, 'F');
        doc.setTextColor(0, 0, 0);
        doc.text(point.title, 27, yPosition + 3);
        
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(point.text, pageWidth - 50);
        doc.text(splitText, 27, yPosition + 9);
        
        yPosition += splitText.length * 5 + 12;
      });

      // Footer on last page
      yPosition = pageHeight - 30;
      doc.setFillColor(25, 58, 130);
      doc.rect(0, yPosition, pageWidth, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('CABINETS • COUNTERTOPS • FLOORS', pageWidth / 2, yPosition + 12, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Factory Direct Pricing - Professional Quality', pageWidth / 2, yPosition + 20, { align: 'center' });

      // Generate filename with date
      const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).replace(/,/g, '');
      const filename = `3Power-Pricing-Guide-${date}.pdf`;
      
      doc.save(filename);
      toast.success("Pricing guide downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate pricing guide. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 mb-8">
        <Badge variant="secondary" className="text-lg px-6 py-2">
          <DollarSign className="w-5 h-5 mr-2" />
          Transparent Pricing Guarantee
        </Badge>
        <h2 className="text-3xl font-bold">How We Compare to the Competition</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          We believe in honest, transparent pricing. See how our prices compare to major retailers 
          while maintaining our 45% profit margin to ensure quality service and long-term sustainability.
        </p>
        <div className="flex gap-3 justify-center">
          <Button 
            onClick={handleDownload}
            size="lg"
            className="gap-2"
          >
            <Download className="w-5 h-5" />
            Download Pricing Guide
          </Button>
          <Button 
            onClick={() => setEmailFormOpen(true)}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            <Mail className="w-5 h-5" />
            Email Me the Guide
          </Button>
        </div>
        
        <PricingGuideEmailForm 
          open={emailFormOpen} 
          onOpenChange={setEmailFormOpen} 
        />
      </div>

      {pricingData.map((section, index) => (
        <div key={section.category} className="space-y-8">
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-2xl">{section.category}</CardTitle>
              <CardDescription>
                Fair market pricing with guaranteed quality and service
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold">Service/Product</th>
                      <th className="text-center p-4 font-semibold">Home Depot</th>
                      <th className="text-center p-4 font-semibold">Lowe's</th>
                      <th className="text-center p-4 font-semibold">Cabinets to Go</th>
                      <th className="text-center p-4 font-semibold bg-primary/10">
                        <div className="flex items-center justify-center gap-2">
                          <Check className="w-5 h-5 text-primary" />
                          Our Price
                        </div>
                      </th>
                      <th className="text-center p-4 font-semibold">Your Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.map((item, itemIndex) => (
                      <tr key={itemIndex} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {item.imageUrl && (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-md border border-border"
                              />
                            )}
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">{item.unit}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center p-4 text-muted-foreground">{item.prices.homeDepot}</td>
                        <td className="text-center p-4 text-muted-foreground">{item.prices.lowes}</td>
                        <td className="text-center p-4 text-muted-foreground">{item.prices.cabinetsToGo}</td>
                        <td className="text-center p-4 bg-primary/5">
                          <div className="font-bold text-primary">{item.prices.ourPrice}</div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {item.prices.profitMargin} margin
                          </Badge>
                        </td>
                        <td className="text-center p-4">
                          <Badge variant="secondary" className="gap-1">
                            <TrendingDown className="w-4 h-4" />
                            {item.savings}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {section.category === "Kitchen Cabinet Installation" && (
            <KitchenSizeCalculator />
          )}
          
          {section.category === "Bathroom Vanity Installation" && (
            <VanitySizeCalculator />
          )}
          
          {section.category === "LVP Luxury Vinyl Plank Flooring" && (
            <RoomSizeCalculator />
          )}
        </div>
      ))}

      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">45%</div>
              <div className="text-sm text-muted-foreground">Target Profit Margin</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Price Transparency</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">$500+</div>
              <div className="text-sm text-muted-foreground">Average Customer Savings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-lg">Our Pricing Philosophy</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <strong>Fair Market Value:</strong> We continuously monitor competitor pricing to ensure we're competitive while maintaining quality.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <strong>Sustainable Margins:</strong> Our 45% profit margin allows us to invest in quality materials, skilled labor, and excellent customer service.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <strong>No Hidden Fees:</strong> What you see is what you pay. No surprise charges or hidden installation costs.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <strong>Price Match Promise:</strong> If you find a comparable service for less, we'll match or beat it while maintaining our quality standards.
            </div>
          </li>
        </ul>
      </div>

      <MultiProjectEstimator />
    </div>
  );
}
