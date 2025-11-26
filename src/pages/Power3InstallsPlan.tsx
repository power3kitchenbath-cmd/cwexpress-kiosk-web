import { ArrowRight, CheckCircle, Clock, DollarSign, Star, Quote, Award, Shield, BadgeCheck, Zap, ThumbsUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import kitchenBefore1 from "@/assets/gallery/kitchen-before-1.jpg";
import kitchenAfter1 from "@/assets/gallery/kitchen-after-1.jpg";
import bathBefore1 from "@/assets/gallery/bath-before-1.jpg";
import bathAfter1 from "@/assets/gallery/bath-after-1.jpg";
import kitchenBefore2 from "@/assets/gallery/kitchen-before-2.jpg";
import kitchenAfter2 from "@/assets/gallery/kitchen-after-2.jpg";
import cornerstoneBadge from "@/assets/badges/cornerstone-fabricator-badge.png";
import expressBadge from "@/assets/badges/express-delivery-badge.png";
import power3Badge from "@/assets/badges/power3-main-badge.png";

export default function Power3InstallsPlan() {
  const navigate = useNavigate();

  const components = [
    {
      badge: cornerstoneBadge,
      title: "Our Fabricator",
      subtitle: "Cornerstone Quality Products",
      description: "Our state-of-the-art facilities allow us to produce products quickly and efficiently. We use the latest technology to ensure that our products are of the highest quality.",
      features: [
        "Top factory direct pricing",
        "1-hour fabrication time",
        "Highest quality materials",
        "Advanced cutting technology"
      ],
      tagline: "Precision Fabrication in 1 Hour"
    },
    {
      badge: expressBadge,
      title: "Our Shipping Co.",
      subtitle: "CW Express Logistics",
      description: "(RTA) Ready To Assemble Cabinets, LVP Flooring, Vanity Tops Shipped To Your Home Or Job site in 3 to 5 Days",
      features: [
        "26 ft. Box Truck fleet",
        "3-5 day delivery window",
        "Professional handling",
        "Real-time tracking"
      ],
      tagline: "Fast Delivery Nationwide"
    },
    {
      badge: power3Badge,
      title: "Our Distributor",
      subtitle: "Power 3 Kitchen & Bath",
      description: "Kitchen & Bath Cabinets, LVP Flooring, and Vanity Tops in stock Ready for Same Day Pick Up or Next Day Delivery",
      features: [
        "Full inventory warehouse",
        "Same-day pickup available",
        "Next-day delivery option",
        "Volume pricing for pros"
      ],
      tagline: "Your Complete Kitchen & Bath Partner"
    }
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: "Factory Direct Savings",
      description: "Cut out the middleman and save 30-50% compared to traditional retailers"
    },
    {
      icon: Clock,
      title: "Lightning Fast Turnaround",
      description: "From fabrication to delivery in as little as 3-5 days"
    },
    {
      icon: CheckCircle,
      title: "Quality Guaranteed",
      description: "State-of-the-art fabrication ensures premium quality products"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Thompson",
      project: "Kitchen Renovation",
      location: "Atlanta, GA",
      rating: 5,
      review: "I saved over $8,000 compared to other quotes I received! The quality is outstanding and they delivered exactly when promised. The fabrication was done in an hour and installed within 4 days.",
      highlight: "Saved $8,000"
    },
    {
      name: "Mike Rodriguez",
      project: "Bathroom Remodel",
      location: "Marietta, GA",
      rating: 5,
      review: "As a contractor, I've worked with many suppliers. Power 3's speed is unmatched - from order to installation in under a week. My clients love the quality and I love the pricing that lets me stay competitive.",
      highlight: "Delivered in 5 Days"
    },
    {
      name: "Jennifer Lee",
      project: "Master Bath & Guest Bath",
      location: "Decatur, GA",
      rating: 5,
      review: "The three-component system really works! Factory direct pricing, fast shipping, and same-day pickup option made our dual bathroom renovation so much easier. The quartz countertops are absolutely beautiful.",
      highlight: "Factory Direct Pricing"
    },
    {
      name: "David Patterson",
      project: "Kitchen & Flooring",
      location: "Roswell, GA",
      rating: 5,
      review: "We got premium cabinets and LVP flooring at prices I couldn't believe. The 1-hour fabrication turnaround meant we didn't have to wait weeks like with other suppliers. Professional service from start to finish.",
      highlight: "Premium Quality"
    },
    {
      name: "Lisa Martinez",
      project: "Full Kitchen Install",
      location: "Sandy Springs, GA",
      rating: 5,
      review: "Working with Power 3 was seamless. The warehouse had everything in stock, CW Express delivered right on schedule, and the installation team was professional. Saved thousands compared to big box stores!",
      highlight: "Thousands Saved"
    },
    {
      name: "Robert Chen",
      project: "Vacation Home Renovation",
      location: "Alpharetta, GA",
      rating: 5,
      review: "For our rental property, speed and budget were critical. Power 3 delivered on both - gorgeous granite countertops fabricated same day, delivered in 3 days, and installed flawlessly. Will definitely use again!",
      highlight: "3-Day Delivery"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">OUR POWER 3 TEAM</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Three powerful components working together to deliver unmatched quality, 
            speed, and value for your kitchen and bath projects
          </p>
        </div>
      </div>

      {/* Video Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 mb-16">
        <Card className="overflow-hidden shadow-2xl">
          <div className="aspect-video bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">Video: Power 3 Team Overview</p>
          </div>
        </Card>
      </div>

      {/* Power 3 Brand Components Section */}
      <div className="max-w-7xl mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Our Three Power Brands</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three established brands working as one unified system to deliver exceptional results
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {components.map((component, index) => (
            <div key={index} className="text-center group">
              <div className="mb-4 flex justify-center">
                <div className="w-48 h-48 rounded-full overflow-hidden bg-background shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-primary/20">
                  <img 
                    src={component.badge} 
                    alt={component.subtitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{component.subtitle}</h3>
              <p className="text-muted-foreground">{component.tagline}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Three Components Detail Cards */}
      <div className="max-w-7xl mx-auto px-4 mb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {components.map((component, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center p-6">
                <img 
                  src={component.badge} 
                  alt={component.subtitle}
                  className="w-32 h-32 object-contain transition-transform duration-300 hover:scale-110"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">{component.title}</CardTitle>
                <CardDescription className="text-lg font-semibold">
                  {component.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{component.description}</p>
                <ul className="space-y-2 mb-6">
                  {component.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {index === 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate("/fabrication-showcase")}
                  >
                    View Fabrication Process
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-muted/50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Power 3?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { step: "1", title: "Order", desc: "Place your order online or at our kiosk" },
            { step: "2", title: "Fabricate", desc: "Products manufactured in 1 hour" },
            { step: "3", title: "Ship", desc: "Delivered in 3-5 days via CW Express" },
            { step: "4", title: "Install", desc: "Professional installation available" }
          ].map((step, index) => (
            <div key={index} className="relative">
              <Card className="text-center h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-2">
                    {step.step}
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
              {index < 3 && (
                <ArrowRight className="hidden md:block absolute top-1/2 -right-6 -translate-y-1/2 w-8 h-8 text-primary" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-muted/30 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real feedback from real customers who experienced the Power 3 difference
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className="absolute top-4 right-4 opacity-10">
                  <Quote className="w-16 h-16" />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>
                    {testimonial.project} • {testimonial.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    "{testimonial.review}"
                  </p>
                  <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                    {testimonial.highlight}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-background rounded-lg border">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <span className="text-lg font-semibold">4.9/5</span>
              <span className="text-muted-foreground">from 200+ reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Transformation Gallery</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See the dramatic difference our Power 3 system makes. Real projects, real results, real savings.
          </p>
        </div>

        <div className="space-y-12">
          {/* Kitchen Project 1 */}
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-center">Kitchen Renovation - Atlanta, GA</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative group overflow-hidden rounded-lg">
                <img 
                  src={kitchenBefore1} 
                  alt="Kitchen before renovation"
                  className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-bold">
                  BEFORE
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-lg">
                <img 
                  src={kitchenAfter1} 
                  alt="Kitchen after renovation"
                  className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold">
                  AFTER
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Transformation Details:</span> Granite countertops fabricated in 1 hour • White shaker cabinets • Subway tile backsplash • LED lighting • Completed in 5 days
              </p>
            </div>
          </div>

          {/* Bathroom Project */}
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-center">Bathroom Remodel - Marietta, GA</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative group overflow-hidden rounded-lg">
                <img 
                  src={bathBefore1} 
                  alt="Bathroom before renovation"
                  className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-bold">
                  BEFORE
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-lg">
                <img 
                  src={bathAfter1} 
                  alt="Bathroom after renovation"
                  className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold">
                  AFTER
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Transformation Details:</span> Quartz vanity countertop • Contemporary fixtures • White cabinetry • Modern mirror • Delivered in 4 days
              </p>
            </div>
          </div>

          {/* Kitchen Project 2 */}
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-center">Modern Kitchen Update - Roswell, GA</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative group overflow-hidden rounded-lg">
                <img 
                  src={kitchenBefore2} 
                  alt="Kitchen before modern update"
                  className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-bold">
                  BEFORE
                </div>
              </div>
              <div className="relative group overflow-hidden rounded-lg">
                <img 
                  src={kitchenAfter2} 
                  alt="Kitchen after modern update"
                  className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold">
                  AFTER
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Transformation Details:</span> Sleek quartz countertops • Gray shaker cabinets • Glass tile backsplash • Stainless appliances • 3-day turnaround
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Card className="inline-block p-6 bg-muted/50">
            <p className="text-lg font-semibold mb-2">Ready to see your space transformed?</p>
            <p className="text-muted-foreground">Get a free estimate and join hundreds of satisfied customers</p>
          </Card>
        </div>
      </div>

      {/* Trust Badges & Certifications */}
      <div className="bg-gradient-to-b from-muted/30 to-background py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Trusted by Professionals</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our commitment to quality, safety, and customer satisfaction is backed by industry certifications and guarantees
            </p>
          </div>

          {/* Certification Badges */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            <div className="flex flex-col items-center text-center p-4 bg-background rounded-lg border hover:border-primary transition-colors">
              <Award className="w-12 h-12 text-primary mb-3" />
              <p className="text-sm font-semibold">BBB Accredited</p>
              <p className="text-xs text-muted-foreground mt-1">A+ Rating</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-background rounded-lg border hover:border-primary transition-colors">
              <Shield className="w-12 h-12 text-primary mb-3" />
              <p className="text-sm font-semibold">Licensed & Insured</p>
              <p className="text-xs text-muted-foreground mt-1">Full Coverage</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-background rounded-lg border hover:border-primary transition-colors">
              <BadgeCheck className="w-12 h-12 text-primary mb-3" />
              <p className="text-sm font-semibold">NKBA Member</p>
              <p className="text-xs text-muted-foreground mt-1">Kitchen & Bath</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-background rounded-lg border hover:border-primary transition-colors">
              <Zap className="w-12 h-12 text-primary mb-3" />
              <p className="text-sm font-semibold">EPA Certified</p>
              <p className="text-xs text-muted-foreground mt-1">Eco-Friendly</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-background rounded-lg border hover:border-primary transition-colors">
              <ThumbsUp className="w-12 h-12 text-primary mb-3" />
              <p className="text-sm font-semibold">HomeAdvisor</p>
              <p className="text-xs text-muted-foreground mt-1">Top Rated Pro</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-background rounded-lg border hover:border-primary transition-colors">
              <Sparkles className="w-12 h-12 text-primary mb-3" />
              <p className="text-sm font-semibold">Angi Certified</p>
              <p className="text-xs text-muted-foreground mt-1">Super Service</p>
            </div>
          </div>

          {/* Guarantees & Warranties */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl mb-3">Lifetime Warranty</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                All fabrication work is backed by our lifetime warranty. We stand behind the quality of our craftsmanship for as long as you own your home.
              </CardDescription>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl mb-3">Quality Guarantee</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                100% satisfaction guaranteed or we'll make it right. Our commitment to excellence means we don't rest until you're completely happy with the results.
              </CardDescription>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl mb-3">Price Match Promise</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Found a lower price for comparable quality? We'll match it. Our factory-direct pricing is already the best, but we guarantee it.
              </CardDescription>
            </Card>
          </div>

          {/* Trust Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">15+</p>
              <p className="text-sm text-muted-foreground">Years in Business</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">5,000+</p>
              <p className="text-sm text-muted-foreground">Projects Completed</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">98%</p>
              <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">24/7</p>
              <p className="text-sm text-muted-foreground">Customer Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Experience the Power 3 Difference?</h2>
          <p className="text-xl opacity-90 mb-8">
            Get started with a free estimate today and see how we can transform your space
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate("/estimator")}
              className="text-lg"
            >
              Get Free Estimate
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/online-shop")}
              className="text-lg border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              Shop Products
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-background py-8 px-4 text-center">
        <Button variant="ghost" onClick={() => navigate("/")}>
          ← Back to Home
        </Button>
      </div>
    </div>
  );
}
