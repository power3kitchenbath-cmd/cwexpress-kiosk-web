import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PricingComparisonChart } from "@/components/PricingComparisonChart";

interface KitchenQuote {
  id: string;
  tier: string;
  quantity: number;
  base_price: number;
  cabinet_upgrade: boolean;
  countertop_upgrade: boolean;
  cabinet_cost: number;
  countertop_cost: number;
  grand_total: number;
  line_items: any;
  created_at: string;
  status: string;
}

interface VanityQuote {
  id: string;
  tier: string;
  quantity: number;
  base_price: number;
  single_to_double: boolean;
  plumbing_wall_change: boolean;
  conversion_cost: number;
  plumbing_cost: number;
  grand_total: number;
  line_items: any;
  created_at: string;
  status: string;
}

type Quote = (KitchenQuote | VanityQuote) & { type: 'kitchen' | 'vanity' };

export default function QuoteComparison() {
  const navigate = useNavigate();
  const [kitchenQuotes, setKitchenQuotes] = useState<KitchenQuote[]>([]);
  const [vanityQuotes, setVanityQuotes] = useState<VanityQuote[]>([]);
  const [selectedQuotes, setSelectedQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in", description: "You need to be logged in to view quotes", variant: "destructive" });
        navigate("/auth");
        return;
      }

      const [kitchenData, vanityData] = await Promise.all([
        supabase.from("kitchen_quotes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("vanity_quotes").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      ]);

      if (kitchenData.data) setKitchenQuotes(kitchenData.data);
      if (vanityData.data) setVanityQuotes(vanityData.data);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      toast({ title: "Error", description: "Failed to load quotes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleQuoteSelection = (quote: Quote) => {
    setSelectedQuotes(prev => {
      const exists = prev.find(q => q.id === quote.id && q.type === quote.type);
      if (exists) {
        return prev.filter(q => !(q.id === quote.id && q.type === quote.type));
      } else if (prev.length < 3) {
        return [...prev, quote];
      } else {
        toast({ title: "Maximum reached", description: "You can compare up to 3 quotes at once" });
        return prev;
      }
    });
  };

  const isSelected = (id: string, type: 'kitchen' | 'vanity') => {
    return selectedQuotes.some(q => q.id === id && q.type === type);
  };

  const getMinMaxPrices = () => {
    if (selectedQuotes.length === 0) return { min: 0, max: 0 };
    const prices = selectedQuotes.map(q => q.grand_total);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  };

  const { min: minPrice, max: maxPrice } = getMinMaxPrices();

  const isKitchenQuote = (quote: Quote): quote is Quote & KitchenQuote => quote.type === 'kitchen';
  const isVanityQuote = (quote: Quote): quote is Quote & VanityQuote => quote.type === 'vanity';

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-muted-foreground">Loading quotes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold">Quote & Pricing Comparison</h1>
          <p className="text-muted-foreground mt-2">Compare your quotes and see how we stack up against the competition</p>
        </div>

        {/* Market Pricing Comparison */}
        <div className="mb-12">
          <PricingComparisonChart />
        </div>

        <Separator className="my-8" />

        {/* User's Personal Quotes Comparison */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Compare Your Personal Quotes</h2>
          <p className="text-muted-foreground mb-6">Select up to 3 of your saved quotes to compare</p>
        </div>

        {selectedQuotes.length === 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {kitchenQuotes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Kitchen Quotes</CardTitle>
                  <CardDescription>Select kitchen quotes to compare</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {kitchenQuotes.map(quote => (
                    <div key={quote.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer" onClick={() => toggleQuoteSelection({ ...quote, type: 'kitchen' })}>
                      <Checkbox checked={isSelected(quote.id, 'kitchen')} onCheckedChange={() => toggleQuoteSelection({ ...quote, type: 'kitchen' })} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{quote.tier} Tier</span>
                          <Badge variant={quote.status === 'sent' ? 'default' : 'secondary'}>{quote.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(quote.created_at).toLocaleDateString()} • ${quote.grand_total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {vanityQuotes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Vanity Quotes</CardTitle>
                  <CardDescription>Select vanity quotes to compare</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {vanityQuotes.map(quote => (
                    <div key={quote.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer" onClick={() => toggleQuoteSelection({ ...quote, type: 'vanity' })}>
                      <Checkbox checked={isSelected(quote.id, 'vanity')} onCheckedChange={() => toggleQuoteSelection({ ...quote, type: 'vanity' })} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{quote.tier} Tier</span>
                          <Badge variant={quote.status === 'sent' ? 'default' : 'secondary'}>{quote.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(quote.created_at).toLocaleDateString()} • ${quote.grand_total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {selectedQuotes.length > 0 && (
          <>
            <div className="mb-4 flex gap-2">
              <Button variant="outline" onClick={() => setSelectedQuotes([])}>Clear Selection</Button>
              <p className="text-sm text-muted-foreground self-center">{selectedQuotes.length} quote(s) selected</p>
            </div>

            <div className={`grid gap-6 ${selectedQuotes.length === 2 ? 'md:grid-cols-2' : selectedQuotes.length === 3 ? 'md:grid-cols-3' : ''}`}>
              {selectedQuotes.map(quote => (
                <Card key={`${quote.type}-${quote.id}`} className={quote.grand_total === minPrice && minPrice !== maxPrice ? "border-primary shadow-lg" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="capitalize">{quote.tier} {quote.type}</CardTitle>
                        <CardDescription>{new Date(quote.created_at).toLocaleDateString()}</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => toggleQuoteSelection(quote)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {quote.grand_total === minPrice && minPrice !== maxPrice && (
                      <Badge className="w-fit">Best Value</Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Package Details</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Quantity:</span>
                          <span className="font-medium">{quote.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Base Price:</span>
                          <span className="font-medium">${quote.base_price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2">Upgrades & Options</h4>
                      <div className="space-y-2">
                        {isKitchenQuote(quote) && (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span>Cabinet Upgrade</span>
                              {quote.cabinet_upgrade ? (
                                <div className="flex items-center gap-2">
                                  <Check className="h-4 w-4 text-primary" />
                                  <span className="font-medium">${quote.cabinet_cost.toFixed(2)}</span>
                                </div>
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Countertop Upgrade</span>
                              {quote.countertop_upgrade ? (
                                <div className="flex items-center gap-2">
                                  <Check className="h-4 w-4 text-primary" />
                                  <span className="font-medium">${quote.countertop_cost.toFixed(2)}</span>
                                </div>
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </>
                        )}
                        {isVanityQuote(quote) && (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span>Single to Double</span>
                              {quote.single_to_double ? (
                                <div className="flex items-center gap-2">
                                  <Check className="h-4 w-4 text-primary" />
                                  <span className="font-medium">${quote.conversion_cost.toFixed(2)}</span>
                                </div>
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Plumbing Wall Change</span>
                              {quote.plumbing_wall_change ? (
                                <div className="flex items-center gap-2">
                                  <Check className="h-4 w-4 text-primary" />
                                  <span className="font-medium">${quote.plumbing_cost.toFixed(2)}</span>
                                </div>
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2">Line Items</h4>
                      <div className="space-y-1 text-sm">
                        {Array.isArray(quote.line_items) && quote.line_items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-muted-foreground">{item.description}</span>
                            <span className="font-medium">${item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Grand Total:</span>
                        <div className="text-right">
                          <span className={`text-2xl font-bold ${quote.grand_total === minPrice && minPrice !== maxPrice ? 'text-primary' : ''}`}>
                            ${quote.grand_total.toFixed(2)}
                          </span>
                          {selectedQuotes.length > 1 && quote.grand_total !== minPrice && (
                            <p className="text-xs text-muted-foreground mt-1">
                              +${(quote.grand_total - minPrice).toFixed(2)} more
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedQuotes.length > 1 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Price Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Lowest Price:</span>
                      <span className="font-bold text-primary">${minPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Highest Price:</span>
                      <span className="font-bold">${maxPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price Difference:</span>
                      <span className="font-bold">${(maxPrice - minPrice).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
