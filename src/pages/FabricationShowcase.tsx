import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Clock, Award, CheckCircle2, Sparkles, Ruler, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import cornerstoneBadge from "@/assets/badges/cornerstone-fabricator-badge.png";

const FabricationShowcase = () => {
  const navigate = useNavigate();

  const processSteps = [
    {
      title: "Material Selection",
      duration: "5 minutes",
      description: "Choose from our premium granite and quartz collection. Our experts help you select the perfect material for your space.",
      videoPlaceholder: "https://via.placeholder.com/800x450/1a1a1a/ffffff?text=Material+Selection+Process"
    },
    {
      title: "Precision Measurement",
      duration: "10 minutes",
      description: "Advanced laser measuring ensures perfect fit. We capture every detail of your countertop space with millimeter accuracy.",
      videoPlaceholder: "https://via.placeholder.com/800x450/1a1a1a/ffffff?text=Laser+Measurement+Process"
    },
    {
      title: "CNC Fabrication",
      duration: "30 minutes",
      description: "State-of-the-art CNC machines cut and shape your countertop with precision. Our automated process ensures consistency and quality.",
      videoPlaceholder: "https://via.placeholder.com/800x450/1a1a1a/ffffff?text=CNC+Fabrication+Process"
    },
    {
      title: "Edge Finishing",
      duration: "10 minutes",
      description: "Multiple edge profiles available. Our craftsmen polish and finish edges to perfection for a smooth, beautiful result.",
      videoPlaceholder: "https://via.placeholder.com/800x450/1a1a1a/ffffff?text=Edge+Finishing+Process"
    },
    {
      title: "Quality Inspection",
      duration: "5 minutes",
      description: "Every countertop undergoes rigorous quality checks. We inspect for color consistency, structural integrity, and finish quality.",
      videoPlaceholder: "https://via.placeholder.com/800x450/1a1a1a/ffffff?text=Quality+Inspection+Process"
    }
  ];

  const specifications = [
    {
      category: "Granite Countertops",
      items: [
        { label: "Thickness Options", value: "2cm (3/4\") or 3cm (1 1/4\")" },
        { label: "Standard Slab Size", value: "110\" x 65\" average" },
        { label: "Finish Options", value: "Polished, Honed, Leathered" },
        { label: "Edge Profiles", value: "10+ options available" },
        { label: "Heat Resistance", value: "Up to 1,200°F" },
        { label: "Hardness Rating", value: "6-7 on Mohs scale" },
        { label: "Warranty", value: "Lifetime limited warranty" }
      ]
    },
    {
      category: "Quartz Countertops",
      items: [
        { label: "Thickness Options", value: "2cm (3/4\") or 3cm (1 1/4\")" },
        { label: "Standard Slab Size", value: "120\" x 56\" average" },
        { label: "Finish Options", value: "Polished, Matte" },
        { label: "Edge Profiles", value: "10+ options available" },
        { label: "Heat Resistance", value: "Up to 300°F (use trivets)" },
        { label: "Hardness Rating", value: "7 on Mohs scale" },
        { label: "Warranty", value: "25-year manufacturer warranty" }
      ]
    }
  ];

  const features = [
    {
      icon: Clock,
      title: "1-Hour Fabrication",
      description: "Industry-leading speed without compromising quality. Your custom countertop ready in 60 minutes."
    },
    {
      icon: Award,
      title: "Master Craftsmen",
      description: "20+ years of experience with certified fabricators. Every countertop is a work of art."
    },
    {
      icon: Sparkles,
      title: "Premium Materials",
      description: "Hand-selected granite and quartz from top quarries worldwide. Only the finest materials make the cut."
    },
    {
      icon: Shield,
      title: "Quality Guaranteed",
      description: "Comprehensive warranty coverage and 100% satisfaction guarantee on all fabrication work."
    }
  ];

  const edgeProfiles = [
    "Full Bullnose",
    "Half Bullnose",
    "Bevel",
    "Ogee",
    "Waterfall",
    "Dupont",
    "Cove",
    "Pencil",
    "Eased",
    "Mitered"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/power3-team")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Power 3 Team
          </Button>
          <Button onClick={() => navigate("/estimator")}>
            Get a Quote
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex justify-center mb-6">
              <img 
                src={cornerstoneBadge} 
                alt="Cornerstone Granite & Quartz"
                className="h-32 w-32 object-contain"
              />
            </div>
            <Badge variant="secondary" className="text-base px-4 py-1">
              Cornerstone Granite & Quartz
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
              1-Hour Countertop Fabrication
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Experience the fastest premium granite and quartz fabrication in the industry. 
              Custom countertops crafted to perfection in just 60 minutes.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate("/collections/calacatta")}>
                View Materials
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/estimator")}>
                Get Instant Quote
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps with Videos */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The Fabrication Process
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Watch how we transform raw stone into beautiful countertops in just 60 minutes
            </p>
          </div>

          <div className="space-y-16">
            {processSteps.map((step, index) => (
              <Card key={index} className="overflow-hidden">
                <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                  {/* Video Placeholder */}
                  <div className={`relative aspect-video bg-muted ${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                    <img 
                      src={step.videoPlaceholder} 
                      alt={step.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors cursor-pointer group">
                      <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-10 w-10 text-primary ml-1" fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 text-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {step.duration}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="flex flex-col justify-center p-8 md:p-12">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl font-bold text-primary">{index + 1}</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold">{step.title}</h3>
                      </div>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Technical Specifications
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Detailed specifications for our granite and quartz countertops
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {specifications.map((spec, index) => (
              <Card key={index}>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Ruler className="h-6 w-6 text-primary" />
                    {spec.category}
                  </h3>
                  <div className="space-y-4">
                    {spec.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between items-start gap-4 py-3 border-b last:border-0">
                        <span className="font-medium text-muted-foreground">{item.label}</span>
                        <span className="text-right font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Edge Profiles */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Custom Edge Profiles
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from 10+ professional edge profiles to complete your countertop design
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {edgeProfiles.map((profile, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                  <p className="font-medium">{profile}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Experience the fastest, highest-quality countertop fabrication. 
                Get your free quote today and see why contractors trust Cornerstone.
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <Button size="lg" onClick={() => navigate("/estimator")}>
                  Get Your Free Quote
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/collections/calacatta")}>
                  Browse Materials
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/power3-team")}>
                  Learn More About Power 3
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default FabricationShowcase;
