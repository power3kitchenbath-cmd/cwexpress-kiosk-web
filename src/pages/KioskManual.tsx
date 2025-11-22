import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Home, 
  Calculator, 
  ShoppingCart, 
  Users, 
  Package, 
  Mail, 
  Settings,
  FileText,
  Image as ImageIcon,
  Truck,
  ArrowLeft,
  Search,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "@/assets/logo.png";

export default function KioskManual() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Function to highlight search matches
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() 
        ? `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">${part}</mark>`
        : part
    ).join('');
  };

  // Search through content
  const searchResults = searchQuery.trim() ? [
    { tab: "overview", matches: ["platform overview", "core modules", "key features", "what is the kiosk"] },
    { tab: "estimator", matches: ["kitchen estimator", "vanity estimator", "bathroom estimator", "multi-project", "10x10 kitchen", "quality tier", "generate quote", "line items"] },
    { tab: "shop", matches: ["online shop", "product selection", "shopping cart", "checkout process", "inventory status"] },
    { tab: "design", matches: ["design import", "kcdw", "cabinet list", "design drawing", "csv upload", "pdf upload"] },
    { tab: "admin", matches: ["admin dashboard", "orders management", "customer management", "email tracking", "multi-project estimates", "installation projects"] },
    { tab: "installs", matches: ["installation management", "project tracking", "team assignment", "time tracking", "photo upload"] },
    { tab: "customer", matches: ["customer service", "order status", "quote follow-up", "email communication", "refund policy"] },
    { tab: "troubleshooting", matches: ["troubleshooting", "email not sending", "pdf not generating", "login issues", "payment failed"] }
  ].filter(result => 
    result.matches.some(match => match.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <img src={logo} alt="3 Power Cabinet Store" className="h-16" />
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">Kiosk Platform Instructional Manual</h1>
            <p className="text-muted-foreground text-lg">
              Comprehensive training guide for staff members
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search procedures, troubleshooting steps, or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Search Results */}
            {searchQuery.trim() && searchResults.length > 0 && (
              <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Found in {searchResults.length} section{searchResults.length > 1 ? 's' : ''}:
                </h3>
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <Button
                      key={result.tab}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setActiveTab(result.tab);
                        setSearchQuery("");
                      }}
                    >
                      <Badge variant="secondary" className="mr-2 capitalize">
                        {result.tab}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {result.matches.filter(m => m.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3).join(", ")}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {searchQuery.trim() && searchResults.length === 0 && (
              <div className="mt-4 p-4 bg-secondary/50 rounded-lg text-center text-muted-foreground">
                No results found for "{searchQuery}"
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="estimator">Estimator</TabsTrigger>
            <TabsTrigger value="shop">Online Shop</TabsTrigger>
            <TabsTrigger value="design">Design Import</TabsTrigger>
            <TabsTrigger value="admin">Admin Panel</TabsTrigger>
            <TabsTrigger value="installs">Installations</TabsTrigger>
            <TabsTrigger value="customer">Customer Service</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  Platform Overview
                </CardTitle>
                <CardDescription>
                  Understanding the 3 Power Cabinet Store Kiosk System
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">What is the Kiosk Platform?</h3>
                  <p className="text-muted-foreground mb-4">
                    The 3 Power Cabinet Store Kiosk Platform is a comprehensive digital system designed to streamline 
                    the entire customer journey from initial consultation to final installation. It integrates estimation, 
                    ordering, design management, and project tracking into one unified platform.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xl font-semibold mb-4">Core Modules</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Calculator className="w-8 h-8 text-primary" />
                          <div>
                            <h4 className="font-semibold mb-2">Estimator System</h4>
                            <p className="text-sm text-muted-foreground">
                              Calculate project costs for kitchens, bathrooms, flooring, and multi-project combinations
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <ShoppingCart className="w-8 h-8 text-primary" />
                          <div>
                            <h4 className="font-semibold mb-2">Online Shop</h4>
                            <p className="text-sm text-muted-foreground">
                              Browse and purchase countertops, cabinet doors, hardware, and more
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <FileText className="w-8 h-8 text-primary" />
                          <div>
                            <h4 className="font-semibold mb-2">Design Import (KCDW)</h4>
                            <p className="text-sm text-muted-foreground">
                              Import cabinet lists and design drawings for professional projects
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Settings className="w-8 h-8 text-primary" />
                          <div>
                            <h4 className="font-semibold mb-2">Admin Dashboard</h4>
                            <p className="text-sm text-muted-foreground">
                              Manage orders, customers, products, and business analytics
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Truck className="w-8 h-8 text-primary" />
                          <div>
                            <h4 className="font-semibold mb-2">Installation Management</h4>
                            <p className="text-sm text-muted-foreground">
                              Track projects, assign teams, and manage installation workflows
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Users className="w-8 h-8 text-primary" />
                          <div>
                            <h4 className="font-semibold mb-2">Customer Portal</h4>
                            <p className="text-sm text-muted-foreground">
                              Allow customers to track orders and view installation progress
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Real-time Pricing:</strong> Instant cost calculations with competitive market analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>PDF Generation:</strong> Professional quotes and estimates with company branding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Email Automation:</strong> Automated quote delivery and customer communications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Inventory Management:</strong> Real-time product availability and stock tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Analytics & Reporting:</strong> Business insights and performance metrics</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ESTIMATOR */}
          <TabsContent value="estimator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Using the Estimator System</CardTitle>
                <CardDescription>Step-by-step guide for creating accurate project estimates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Section 1</Badge>
                    Kitchen Estimator (10x10 Base)
                  </h3>
                  <ol className="space-y-3 text-muted-foreground pl-6 list-decimal">
                    <li>
                      <strong>Navigate to Estimator:</strong> Click "Estimator" from the main menu or homepage
                    </li>
                    <li>
                      <strong>Scroll to Kitchen Section:</strong> Locate the "10x10 Kitchen Install" calculator
                    </li>
                    <li>
                      <strong>Enter Size Multiplier:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>1.0 = 10x10 kitchen (100 sq ft)</li>
                        <li>1.5 = 15x10 kitchen (150 sq ft)</li>
                        <li>2.0 = 20x10 kitchen (200 sq ft)</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Select Quality Tier:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li><strong>Good:</strong> $8,500-$10,500 - Standard quality materials</li>
                        <li><strong>Better:</strong> $11,000-$14,500 - Mid-range quality</li>
                        <li><strong>Best:</strong> $15,000-$22,000+ - Premium materials</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Add Optional Upgrades:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Cabinet Upgrade: +$1,200-$2,500</li>
                        <li>Countertop Upgrade: +$1,800-$3,500</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Review Line Items:</strong> Click "View Breakdown" to see itemized costs
                    </li>
                    <li>
                      <strong>Generate Quote:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Click "Email Quote" to send directly to customer</li>
                        <li>Click "Download PDF" for a printable quote</li>
                        <li>Click "Save Draft" to save for later</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Section 2</Badge>
                    Vanity/Bathroom Estimator
                  </h3>
                  <ol className="space-y-3 text-muted-foreground pl-6 list-decimal">
                    <li>
                      <strong>Locate Bathroom Section:</strong> Find "Bathroom Vanity Installation" calculator
                    </li>
                    <li>
                      <strong>Enter Quantity:</strong> Number of vanities to install
                    </li>
                    <li>
                      <strong>Select Vanity Type:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li><strong>Single Sink:</strong> Standard bathroom vanity</li>
                        <li><strong>Double Sink:</strong> Master bathroom vanity</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Choose Quality Tier:</strong> Good, Better, or Best pricing
                    </li>
                    <li>
                      <strong>Add Conversions:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Single to Double Conversion: +$650</li>
                        <li>Plumbing Wall Change: +$450</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Generate Documentation:</strong> Same quote options as kitchen estimator
                    </li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Section 3</Badge>
                    Multi-Project Estimator
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    For customers renovating multiple areas of their home:
                  </p>
                  <ol className="space-y-3 text-muted-foreground pl-6 list-decimal">
                    <li>
                      <strong>Access Multi-Project Tool:</strong> Scroll to bottom of estimator page
                    </li>
                    <li>
                      <strong>Add Room (LVP Flooring):</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Enter room name (e.g., "Master Bedroom")</li>
                        <li>Input square footage</li>
                        <li>Select grade: Standard ($3.49/sqft) or Premium ($5.74/sqft)</li>
                        <li>Click "Add Room to Estimate"</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Add Kitchen:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Follow kitchen estimator process</li>
                        <li>Projects are added to combined estimate</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Add Vanity:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Follow vanity estimator process</li>
                        <li>Multiple bathrooms can be added</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Review Summary:</strong> All projects display with individual and total costs
                    </li>
                    <li>
                      <strong>Send Quote Request:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Click "Preview & Download"</li>
                        <li>Enter customer information (name, email, phone, company)</li>
                        <li>Add estimate name and notes</li>
                        <li>Choose "Download PDF" or "Send Quote Request"</li>
                        <li>Quote is automatically saved to admin dashboard</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <Separator />

                <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span>⚠️</span> Important Notes
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Always verify measurements with customer before finalizing quotes</li>
                    <li>• Estimates are valid for 30 days from generation date</li>
                    <li>• Additional costs may apply for structural modifications</li>
                    <li>• Schedule site visit for accurate measurements when possible</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ONLINE SHOP */}
          <TabsContent value="shop" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Online Shop Operations</CardTitle>
                <CardDescription>Managing the e-commerce shopping experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Process 1</Badge>
                    Assisting Customers with Product Selection
                  </h3>
                  <ol className="space-y-3 text-muted-foreground pl-6 list-decimal">
                    <li>
                      <strong>Access Online Shop:</strong> Click "Shop" from main navigation
                    </li>
                    <li>
                      <strong>Product Categories:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li><strong>Countertops:</strong> Calacatta quartz collection (7 styles)</li>
                        <li><strong>Cabinet Doors:</strong> Doormark collection (6 styles, $79.99-$99.99)</li>
                        <li><strong>Hardware:</strong> Bar pulls and mushroom knobs (3 finishes each)</li>
                        <li><strong>Flooring:</strong> LVP options (4 colors)</li>
                        <li><strong>Shower Doors:</strong> 5 frameless styles</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Using Filters:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Select category from dropdown</li>
                        <li>Use search bar for specific products</li>
                        <li>Check real-time inventory status</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Product Details:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Click product card to view full details</li>
                        <li>Review specifications and pricing</li>
                        <li>Check availability status</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Add to Cart:</strong> Click "Add to Cart" button on product card
                    </li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Process 2</Badge>
                    Checkout Process
                  </h3>
                  <ol className="space-y-3 text-muted-foreground pl-6 list-decimal">
                    <li>
                      <strong>Review Cart:</strong> Click shopping cart icon (top right)
                    </li>
                    <li>
                      <strong>Adjust Quantities:</strong> Use +/- buttons to modify item quantities
                    </li>
                    <li>
                      <strong>Remove Items:</strong> Click trash icon to remove unwanted items
                    </li>
                    <li>
                      <strong>Authentication Required:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Customer must be logged in to checkout</li>
                        <li>New customers: Click "Login/Signup" to create account</li>
                        <li>Existing customers: Login with credentials</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Shipping Information:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Enter complete shipping address</li>
                        <li>Verify address accuracy</li>
                        <li>Select shipping options if available</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Review Order:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Verify all items and quantities</li>
                        <li>Check subtotal, tax, and shipping</li>
                        <li>Review total amount</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Complete Purchase:</strong> Customer receives order confirmation email
                    </li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Process 3</Badge>
                    For Repeat/Pro Customers
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Professional contractors and repeat customers receive special handling:
                  </p>
                  <ul className="space-y-2 text-muted-foreground pl-6 list-disc">
                    <li>
                      <strong>First Order:</strong> Customer completes checkout normally
                    </li>
                    <li>
                      <strong>Profile Setup:</strong> After first order, system prompts for business details
                    </li>
                    <li>
                      <strong>Pro Profile Includes:</strong>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Company name and business license</li>
                        <li>Tax ID for tax-exempt purchases</li>
                        <li>Billing address</li>
                        <li>Preferred payment method</li>
                        <li>Business type and specialty</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Benefits:</strong> Tracked in admin system for potential volume discounts
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DESIGN IMPORT */}
          <TabsContent value="design" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Design Import System (KCDW Integration)</CardTitle>
                <CardDescription>Working with professional design files and cabinet lists</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Step 1</Badge>
                    Uploading Design Files
                  </h3>
                  <ol className="space-y-3 text-muted-foreground pl-6 list-decimal">
                    <li>
                      <strong>Navigate to Import Page:</strong> Access from "Design Gallery" or "Import" link
                    </li>
                    <li>
                      <strong>Upload Cabinet List:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Supported formats: CSV, Excel (.xlsx, .xls)</li>
                        <li>Maximum file size: 10MB</li>
                        <li>File must contain cabinet specifications</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Upload Design Drawing:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Supported formats: PDF, PNG, JPG</li>
                        <li>Maximum file size: 10MB</li>
                        <li>Kitchen/bathroom layout drawings</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Enter Project Name:</strong> Descriptive name for easy identification
                    </li>
                    <li>
                      <strong>Submit:</strong> Files are processed and stored securely
                    </li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Step 2</Badge>
                    Managing Design Gallery
                  </h3>
                  <ol className="space-y-3 text-muted-foreground pl-6 list-decimal">
                    <li>
                      <strong>Access Gallery:</strong> Navigate to Design Gallery page
                    </li>
                    <li>
                      <strong>View Projects:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Thumbnail previews of design drawings</li>
                        <li>Project name and date uploaded</li>
                        <li>Cabinet count and file types</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Filter and Search:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Search by project name</li>
                        <li>Filter by date range</li>
                        <li>Filter by cabinet count (1-10, 11-20, 21-50, 50+)</li>
                        <li>Filter by file type</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Project Actions:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li><strong>View:</strong> Open full design viewer</li>
                        <li><strong>Load to Estimator:</strong> Auto-populate estimate with cabinet data</li>
                        <li><strong>Download:</strong> Save files locally</li>
                        <li><strong>Delete:</strong> Remove project from gallery</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Bulk Operations:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Select multiple projects with checkboxes</li>
                        <li>Delete multiple projects at once</li>
                        <li>Export selected projects to CSV/PDF</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Step 3</Badge>
                    Design Viewer Features
                  </h3>
                  <ul className="space-y-2 text-muted-foreground pl-6 list-disc">
                    <li><strong>Full-Screen Drawing:</strong> View design at maximum size</li>
                    <li><strong>Zoom Controls:</strong> Zoom in/out on specific areas</li>
                    <li><strong>Cabinet Data Table:</strong> Review parsed cabinet specifications</li>
                    <li><strong>Auto-Matching:</strong> System matches cabinets to pricing database</li>
                    <li><strong>Manual Override:</strong> Adjust cabinet types if auto-match is incorrect</li>
                    <li><strong>Quick Estimate:</strong> Generate instant pricing from cabinet list</li>
                  </ul>
                </div>

                <Separator />

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span>💡</span> Pro Tips
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Always verify cabinet counts with design drawing before quoting</li>
                    <li>• Use drag-and-drop for faster file uploads</li>
                    <li>• Keep project names consistent for easy searching</li>
                    <li>• Download original files before making changes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ADMIN PANEL */}
          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Dashboard Guide</CardTitle>
                <CardDescription>Managing the backend and business operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span>🔒</span> Access Requirements
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Admin dashboard is restricted to authorized staff only. You must be logged in 
                    with admin privileges to access these features.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Section 1</Badge>
                    Orders Management
                  </h3>
                  <ol className="space-y-3 text-muted-foreground pl-6 list-decimal">
                    <li>
                      <strong>Access Orders Tab:</strong> Click "Orders" in admin navigation
                    </li>
                    <li>
                      <strong>Order List View:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>View all customer orders with status</li>
                        <li>Filter by status, date range, customer</li>
                        <li>Search by order number or customer name</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Order Statuses:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li><strong>Pending:</strong> New order received, awaiting processing</li>
                        <li><strong>Processing:</strong> Order being prepared</li>
                        <li><strong>Shipped:</strong> Order dispatched to customer</li>
                        <li><strong>Delivered:</strong> Order received by customer</li>
                        <li><strong>Cancelled:</strong> Order cancelled</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Update Order Status:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Click status dropdown on order row</li>
                        <li>Select new status</li>
                        <li>Customer receives automated email notification</li>
                        <li>Status history is tracked automatically</li>
                      </ul>
                    </li>
                    <li>
                      <strong>View Order Details:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Click "View Details" on order</li>
                        <li>See complete line items</li>
                        <li>View customer information</li>
                        <li>Check shipping address</li>
                        <li>Review payment breakdown</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Send Receipt:</strong> Click "Send Receipt to Customer" to resend confirmation email
                    </li>
                    <li>
                      <strong>Export Data:</strong> Download orders as CSV for reporting
                    </li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Section 2</Badge>
                    Quote Requests Management
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Track and respond to all estimate requests from the estimator system:
                  </p>
                  <ul className="space-y-2 text-muted-foreground pl-6 list-disc">
                    <li><strong>Kitchen Quotes:</strong> View all kitchen installation quote requests</li>
                    <li><strong>Vanity Quotes:</strong> Track bathroom vanity estimates</li>
                    <li><strong>Multi-Project Estimates:</strong> Manage combined project requests</li>
                    <li><strong>Status Tracking:</strong> Mark as pending, contacted, quoted, converted, or declined</li>
                    <li><strong>Customer Information:</strong> Access full contact details and project notes</li>
                    <li><strong>Follow-up Reminders:</strong> System alerts for quotes needing attention</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Section 3</Badge>
                    Pro Customers Management
                  </h3>
                  <ol className="space-y-3 text-muted-foreground pl-6 list-decimal">
                    <li>
                      <strong>View Pro Customers:</strong> Access "Pro Customers" tab
                    </li>
                    <li>
                      <strong>Customer Profiles:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Company name and business details</li>
                        <li>Contact information</li>
                        <li>Order history and total spend</li>
                        <li>Business type and specialty</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Export Pro Customer Data:</strong> Download for CRM or marketing purposes
                    </li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Section 4</Badge>
                    Products Management
                  </h3>
                  <ol className="space-y-3 text-muted-foreground pl-6 list-decimal">
                    <li>
                      <strong>Access Products Tab:</strong> Manage online shop inventory
                    </li>
                    <li>
                      <strong>Product Operations:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>View all products by category</li>
                        <li>Update product information</li>
                        <li>Manage pricing</li>
                        <li>Toggle availability status</li>
                        <li>Assign product images</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Auto-Assign Images:</strong> Use image organizer to batch-assign product photos
                    </li>
                    <li>
                      <strong>Pricing Updates:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Navigate to "Cabinet Types" or "Flooring Types" tabs</li>
                        <li>Click edit icon on price entry</li>
                        <li>Update pricing</li>
                        <li>Changes reflect immediately in estimator</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Section 5</Badge>
                    Email System Management
                  </h3>
                  <ul className="space-y-2 text-muted-foreground pl-6 list-disc">
                    <li><strong>Email Activity Feed:</strong> Monitor all automated emails sent</li>
                    <li><strong>Email Analytics:</strong> Track open rates and delivery success</li>
                    <li><strong>Failed Emails:</strong> Review and retry failed deliveries</li>
                    <li><strong>Email Reputation:</strong> Monitor domain health and blacklist status</li>
                    <li><strong>Authentication Validator:</strong> Check SPF, DKIM, DMARC setup</li>
                    <li><strong>Warmup Tracker:</strong> Monitor email sending volume for new domains</li>
                    <li><strong>Scheduled Reports:</strong> Configure weekly/monthly analytics emails</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Section 6</Badge>
                    Analytics & Reporting
                  </h3>
                  <ul className="space-y-2 text-muted-foreground pl-6 list-disc">
                    <li><strong>Order Statistics:</strong> View revenue, order counts, and trends</li>
                    <li><strong>Banner Analytics:</strong> Track engagement with promotional banners</li>
                    <li><strong>Pricing Guide Analytics:</strong> Monitor pricing guide downloads and engagement</li>
                    <li><strong>Cron Jobs:</strong> View scheduled task execution status</li>
                    <li><strong>Installation Photos:</strong> Gallery of completed project photos</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INSTALLATIONS */}
          <TabsContent value="installs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Installation Management System</CardTitle>
                <CardDescription>Coordinating installation teams and project tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Process 1</Badge>
                    Creating Installation Projects
                  </h3>
                  <ol className="space-y-3 text-muted-foreground pl-6 list-decimal">
                    <li>
                      <strong>Access Install Dashboard:</strong> Navigate to installation management portal
                    </li>
                    <li>
                      <strong>Create New Project:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Click "Create Project" button</li>
                        <li>Enter project name and customer information</li>
                        <li>Set project address and location</li>
                        <li>Define scope of work</li>
                        <li>Set estimated start and completion dates</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Project Status Options:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Planning - Initial project setup</li>
                        <li>Scheduled - Installation date confirmed</li>
                        <li>In Progress - Work actively being performed</li>
                        <li>Completed - Installation finished</li>
                        <li>On Hold - Temporarily paused</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Process 2</Badge>
                    Team Assignment & Management
                  </h3>
                  <ol className="space-y-3 text-muted-foreground pl-6 list-decimal">
                    <li>
                      <strong>Create Teams:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Navigate to team management</li>
                        <li>Create new installation team</li>
                        <li>Add team members (installers)</li>
                        <li>Assign team leader</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Assign Team to Project:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Open project details</li>
                        <li>Click "Assign Team"</li>
                        <li>Select appropriate team from dropdown</li>
                        <li>Team receives automatic notification</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Installer Portal Access:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Installers log into mobile-friendly portal</li>
                        <li>View assigned projects</li>
                        <li>Update project status in real-time</li>
                        <li>Upload progress photos</li>
                        <li>Clock in/out for time tracking</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Process 3</Badge>
                    Time Tracking & Labor Costs
                  </h3>
                  <ol className="space-y-3 text-muted-foreground pl-6 list-decimal">
                    <li>
                      <strong>Clock In/Out:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Installers use mobile portal to clock in when starting work</li>
                        <li>Clock out when task is complete</li>
                        <li>System automatically calculates hours worked</li>
                      </ul>
                    </li>
                    <li>
                      <strong>View Time Logs:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Admin can view all time entries by project</li>
                        <li>See detailed breakdown by installer</li>
                        <li>Review hours worked and labor costs</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Labor Cost Calculation:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>System multiplies hours by installer hourly rate</li>
                        <li>Provides project labor summary</li>
                        <li>Tracks total project costs including materials and labor</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Process 4</Badge>
                    Customer Tracking Portal
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Customers can monitor their installation progress in real-time:
                  </p>
                  <ol className="space-y-3 text-muted-foreground pl-6 list-decimal">
                    <li>
                      <strong>Generate Share Link:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Open project in admin dashboard</li>
                        <li>Click "Share with Customer"</li>
                        <li>Generate secure shareable link</li>
                        <li>Send link to customer via email</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Customer View:</strong>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Customer accesses project via unique link</li>
                        <li>View current project status</li>
                        <li>See scheduled dates</li>
                        <li>View progress photos uploaded by installers</li>
                        <li>No login required - secure token-based access</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <Separator />

                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span>✅</span> Best Practices
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Update project status as soon as milestones are reached</li>
                    <li>• Encourage installers to upload progress photos daily</li>
                    <li>• Review time logs weekly to ensure accuracy</li>
                    <li>• Send customer tracking links before installation starts</li>
                    <li>• Follow up with customers after project completion</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CUSTOMER SERVICE */}
          <TabsContent value="customer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Service Procedures</CardTitle>
                <CardDescription>Handling inquiries, issues, and support requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Scenario 1</Badge>
                    Customer Wants a Quote
                  </h3>
                  <ol className="space-y-2 text-muted-foreground pl-6 list-decimal">
                    <li>Greet customer and ask about their project needs</li>
                    <li>Determine project type (kitchen, bathroom, flooring, combination)</li>
                    <li>Navigate to appropriate estimator section</li>
                    <li>Gather required information:
                      <ul className="list-disc pl-6 mt-1">
                        <li>Room dimensions or multipliers</li>
                        <li>Desired quality level</li>
                        <li>Any special requirements or upgrades</li>
                      </ul>
                    </li>
                    <li>Generate estimate in system</li>
                    <li>Review pricing with customer, explaining what is included</li>
                    <li>Offer to email PDF quote or print immediately</li>
                    <li>Collect customer contact information for follow-up</li>
                    <li>Schedule consultation or site visit if needed</li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Scenario 2</Badge>
                    Order Status Inquiry
                  </h3>
                  <ol className="space-y-2 text-muted-foreground pl-6 list-decimal">
                    <li>Ask customer for order number or email address</li>
                    <li>Access admin dashboard and locate order</li>
                    <li>Check current order status</li>
                    <li>Provide customer with specific status information:
                      <ul className="list-disc pl-6 mt-1">
                        <li><strong>Pending:</strong> "Your order has been received and is being processed"</li>
                        <li><strong>Processing:</strong> "Your order is being prepared for shipment"</li>
                        <li><strong>Shipped:</strong> "Your order has been shipped and is in transit"</li>
                        <li><strong>Delivered:</strong> "Your order has been delivered"</li>
                      </ul>
                    </li>
                    <li>Offer to resend confirmation email if needed</li>
                    <li>Provide estimated delivery date if available</li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Scenario 3</Badge>
                    Product Questions
                  </h3>
                  <ol className="space-y-2 text-muted-foreground pl-6 list-decimal">
                    <li>Navigate to Online Shop in the system</li>
                    <li>Search for specific product customer is asking about</li>
                    <li>Access product details page</li>
                    <li>Review specifications with customer</li>
                    <li>Check real-time availability status</li>
                    <li>Explain pricing and any current promotions</li>
                    <li>Demonstrate product images and features on kiosk</li>
                    <li>If product is out of stock:
                      <ul className="list-disc pl-6 mt-1">
                        <li>Check expected restock date in admin system</li>
                        <li>Offer similar alternative products</li>
                        <li>Collect customer email for restock notification</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Scenario 4</Badge>
                    Installation Questions
                  </h3>
                  <ol className="space-y-2 text-muted-foreground pl-6 list-decimal">
                    <li>Determine if customer has existing project or needs new installation</li>
                    <li>For existing projects:
                      <ul className="list-disc pl-6 mt-1">
                        <li>Ask for project name or customer email</li>
                        <li>Locate project in installation dashboard</li>
                        <li>Provide current status update</li>
                        <li>Share customer tracking link if not already provided</li>
                      </ul>
                    </li>
                    <li>For new installation inquiries:
                      <ul className="list-disc pl-6 mt-1">
                        <li>Use estimator to provide installation pricing</li>
                        <li>Explain installation timeline</li>
                        <li>Schedule site visit for accurate measurements</li>
                        <li>Collect customer information to create project</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge>Scenario 5</Badge>
                    Technical Issues
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    If customer reports issues with their online account or orders:
                  </p>
                  <ol className="space-y-2 text-muted-foreground pl-6 list-decimal">
                    <li>Login Issues:
                      <ul className="list-disc pl-6 mt-1">
                        <li>Verify email address is correct</li>
                        <li>Guide customer through password reset process</li>
                        <li>Confirm account exists in system</li>
                      </ul>
                    </li>
                    <li>Checkout Problems:
                      <ul className="list-disc pl-6 mt-1">
                        <li>Verify customer is logged in</li>
                        <li>Check that shipping address is complete</li>
                        <li>Ensure cart items are still in stock</li>
                      </ul>
                    </li>
                    <li>If issue persists:
                      <ul className="list-disc pl-6 mt-1">
                        <li>Offer to complete order manually in admin system</li>
                        <li>Document issue for technical team</li>
                        <li>Provide direct assistance to complete transaction</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <Separator />

                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span>📞</span> Communication Tips
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Always greet customers warmly and professionally</li>
                    <li>• Listen carefully to understand their needs before offering solutions</li>
                    <li>• Use the kiosk to show visuals when explaining products or services</li>
                    <li>• Set realistic expectations about pricing and timelines</li>
                    <li>• Always collect contact information for follow-up</li>
                    <li>• Thank customers and invite them to reach out with any questions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TROUBLESHOOTING */}
          <TabsContent value="troubleshooting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Common Issues & Solutions</CardTitle>
                <CardDescription>Quick reference for resolving technical problems</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">
                    System Access Issues
                  </h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-1">Cannot access admin dashboard</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Solution:</strong> Verify that you are logged in with an admin account. 
                        Only authorized admin users can access the dashboard. Contact your supervisor 
                        if you believe you should have admin access.
                      </p>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-1">Kiosk is not responding</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Solutions:</strong>
                      </p>
                      <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
                        <li>Refresh the browser (press F5 or Ctrl+R)</li>
                        <li>Check internet connection</li>
                        <li>Clear browser cache and cookies</li>
                        <li>Restart the kiosk device if problem persists</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">
                    Estimator Issues
                  </h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-1">Estimate prices seem incorrect</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Solution:</strong> Check if pricing has been updated in admin panel. 
                        Verify that the correct tier and multipliers are selected. Review line-item 
                        breakdown to identify discrepancies.
                      </p>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-1">Cannot generate PDF quote</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Solutions:</strong>
                      </p>
                      <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
                        <li>Ensure all required fields are filled out</li>
                        <li>Check that estimate name doesn not contain special characters</li>
                        <li>Try refreshing the page and re-entering data</li>
                        <li>Use "Save Draft" feature and retry later if issue persists</li>
                      </ol>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-1">Email quote not sending</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Solution:</strong> Verify customer email address is valid. Check email 
                        diagnostics in admin dashboard to see if there are delivery issues. Quote is 
                        still saved in system even if email fails - can be manually sent later.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">
                    Online Shop Issues
                  </h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-1">Customer cannot add items to cart</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Solutions:</strong>
                      </p>
                      <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
                        <li>Check if product is marked as available in admin system</li>
                        <li>Verify product has not been discontinued</li>
                        <li>Try refreshing the page</li>
                        <li>Manually add items for customer using admin tools if needed</li>
                      </ol>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-1">Checkout not working</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Common causes:</strong>
                      </p>
                      <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                        <li>Customer is not logged in (login required for checkout)</li>
                        <li>Shipping address is incomplete or invalid</li>
                        <li>Items in cart are out of stock</li>
                        <li>Browser issues - try different browser or clear cache</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">
                    Design Import Issues
                  </h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-1">File upload fails</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Solutions:</strong>
                      </p>
                      <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
                        <li>Verify file size is under 10MB limit</li>
                        <li>Confirm file type is supported (CSV, XLSX, PDF, PNG, JPG)</li>
                        <li>Check that file is not corrupted or password-protected</li>
                        <li>Try compressing large files before uploading</li>
                      </ol>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-1">Cabinet list not parsing correctly</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Solution:</strong> Review CSV file format. Ensure columns are properly 
                        labeled. May need to manually adjust cabinet matches after import. Keep original 
                        file for reference.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">
                    Installation Management Issues
                  </h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-1">Installer cannot access portal</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Solutions:</strong>
                      </p>
                      <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
                        <li>Verify installer account has been created</li>
                        <li>Confirm installer has been added to a team</li>
                        <li>Check that team has been assigned to projects</li>
                        <li>Reset installer password if needed</li>
                      </ol>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-1">Time tracking not recording</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Solution:</strong> Ensure installer properly clocked in. Verify task is 
                        assigned to installer. Check internet connection on mobile device. Time entries 
                        can be manually added by admin if needed.
                      </p>
                    </div>

                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-1">Customer tracking link not working</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Solution:</strong> Generate new share link from admin dashboard. Verify 
                        link was not expired. Check that project is set to active status. Provide customer 
                        with new link if needed.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span>⚠️</span> When to Escalate
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Contact your supervisor or technical support if:
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                    <li>System is completely unresponsive for more than 5 minutes</li>
                    <li>Data appears to be lost or corrupted</li>
                    <li>Security concerns or unauthorized access attempts</li>
                    <li>Multiple customers reporting the same issue</li>
                    <li>Payment processing errors</li>
                    <li>Issues that cannot be resolved using this troubleshooting guide</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                For additional training or questions not covered in this manual, please contact your 
                supervisor or the training department.
              </p>
              <p className="text-xs text-muted-foreground">
                Last Updated: {new Date().toLocaleDateString()} | Version 1.0
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
