import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Building2, Save } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";

const profileSchema = z.object({
  company_name: z.string().trim().min(1, "Company name is required").max(100, "Company name too long"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  tax_id: z.string().trim().max(50, "Tax ID too long").optional().or(z.literal("")),
  business_license: z.string().trim().max(50, "Business license too long").optional().or(z.literal("")),
  years_in_business: z.number().int().min(0, "Years must be positive").max(100, "Years must be less than 100"),
  billing_address: z.object({
    street: z.string().trim().min(1, "Street is required").max(200, "Street too long"),
    city: z.string().trim().min(1, "City is required").max(100, "City too long"),
    state: z.string().length(2, "State must be 2 characters"),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  }),
  preferred_payment_method: z.string().trim().optional().or(z.literal("")),
  business_type: z.string().trim().optional().or(z.literal("")),
  specialty: z.string().trim().optional().or(z.literal("")),
});

interface ProfileData {
  company_name: string;
  business_license: string;
  tax_id: string;
  phone: string;
  billing_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  preferred_payment_method: string;
  business_type: string;
  years_in_business: number;
  specialty: string;
  order_count: number;
}

const ProProfile = () => {
  const navigate = useNavigate();
  const { user } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    company_name: "",
    business_license: "",
    tax_id: "",
    phone: "",
    billing_address: {
      street: "",
      city: "",
      state: "",
      zip: "",
    },
    preferred_payment_method: "",
    business_type: "",
    years_in_business: 0,
    specialty: "",
    order_count: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        // Check if user has made at least one order
        if (data.order_count < 1) {
          toast({
            title: "Complete an order first",
            description: "Pro profiles are available after your first order",
            variant: "destructive",
          });
          navigate("/online-shop");
          return;
        }

        const billingAddress = data.billing_address as any;
        setProfile({
          company_name: data.company_name || "",
          business_license: data.business_license || "",
          tax_id: data.tax_id || "",
          phone: data.phone || "",
          billing_address: (billingAddress && typeof billingAddress === 'object') ? {
            street: billingAddress.street || "",
            city: billingAddress.city || "",
            state: billingAddress.state || "",
            zip: billingAddress.zip || "",
          } : {
            street: "",
            city: "",
            state: "",
            zip: "",
          },
          preferred_payment_method: data.preferred_payment_method || "",
          business_type: data.business_type || "",
          years_in_business: data.years_in_business || 0,
          specialty: data.specialty || "",
          order_count: data.order_count || 0,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error loading profile",
        description: "Could not load your profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Validate input data
      const validationResult = profileSchema.safeParse(profile);
      
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message).join(", ");
        toast({
          title: "Validation Error",
          description: errors,
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          company_name: profile.company_name,
          business_license: profile.business_license,
          tax_id: profile.tax_id,
          phone: profile.phone,
          billing_address: profile.billing_address,
          preferred_payment_method: profile.preferred_payment_method,
          business_type: profile.business_type,
          years_in_business: profile.years_in_business,
          specialty: profile.specialty,
          is_pro: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile saved",
        description: "Your pro profile has been updated successfully",
      });

      navigate("/orders");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Save failed",
        description: "Could not save your profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/orders")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Pro Customer Profile</h1>
              <p className="text-sm text-muted-foreground">
                Complete your business profile to unlock exclusive benefits
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <Building2 className="h-8 w-8 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Pro Benefits</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Save billing and shipping addresses for faster checkout</li>
                <li>• Access to exclusive bulk discounts on large orders</li>
                <li>• Priority customer support and dedicated account manager</li>
                <li>• Early access to new products and promotions</li>
                <li>• Custom invoicing and payment terms (Net 30 available)</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={profile.company_name}
                onChange={(e) =>
                  setProfile({ ...profile, company_name: e.target.value })
                }
                placeholder="Your Company LLC"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_type">Business Type</Label>
                <Select
                  value={profile.business_type}
                  onValueChange={(value) =>
                    setProfile({ ...profile, business_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="builder">Builder</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="architect">Architect</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="years_in_business">Years in Business</Label>
                <Input
                  id="years_in_business"
                  type="number"
                  value={profile.years_in_business || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      years_in_business: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                value={profile.specialty}
                onChange={(e) =>
                  setProfile({ ...profile, specialty: e.target.value })
                }
                placeholder="Kitchen, Bathroom, Commercial, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_license">Business License</Label>
                <Input
                  id="business_license"
                  value={profile.business_license}
                  onChange={(e) =>
                    setProfile({ ...profile, business_license: e.target.value })
                  }
                  placeholder="License #"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_id">Tax ID / EIN</Label>
              <Input
                id="tax_id"
                value={profile.tax_id}
                onChange={(e) =>
                  setProfile({ ...profile, tax_id: e.target.value })
                }
                placeholder="XX-XXXXXXX"
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={profile.billing_address.street}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        billing_address: {
                          ...profile.billing_address,
                          street: e.target.value,
                        },
                      })
                    }
                    placeholder="123 Main St"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profile.billing_address.city}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          billing_address: {
                            ...profile.billing_address,
                            city: e.target.value,
                          },
                        })
                      }
                      placeholder="City"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={profile.billing_address.state}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          billing_address: {
                            ...profile.billing_address,
                            state: e.target.value,
                          },
                        })
                      }
                      placeholder="ST"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={profile.billing_address.zip}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          billing_address: {
                            ...profile.billing_address,
                            zip: e.target.value,
                          },
                        })
                      }
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Preferred Payment Method</Label>
              <Select
                value={profile.preferred_payment_method}
                onValueChange={(value) =>
                  setProfile({ ...profile, preferred_payment_method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="net_30">Net 30</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="wire">Wire Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full"
              size="lg"
            >
              <Save className="mr-2 h-5 w-5" />
              {saving ? "Saving..." : "Save Pro Profile"}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ProProfile;
