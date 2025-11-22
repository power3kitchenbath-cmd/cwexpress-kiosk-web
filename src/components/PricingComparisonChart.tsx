import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, TrendingDown, DollarSign } from "lucide-react";

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
  }
];

export function PricingComparisonChart() {
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
      </div>

      {pricingData.map((section) => (
        <Card key={section.category} className="overflow-hidden">
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
                  {section.items.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.unit}</div>
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
    </div>
  );
}
