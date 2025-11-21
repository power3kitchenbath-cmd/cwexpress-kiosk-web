import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X } from "lucide-react";

interface VanityItem {
  tier: 'good' | 'better' | 'best';
  quantity: number;
  basePrice: number;
  singleToDouble: boolean;
  plumbingWallChange: boolean;
  conversionCost: number;
  plumbingCost: number;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes: string;
}

interface VanityLineItemBreakdownProps {
  vanity: VanityItem;
  index: number;
  onUpdate?: (index: number, updatedVanity: VanityItem) => void;
}

export function VanityLineItemBreakdown({ vanity, index, onUpdate }: VanityLineItemBreakdownProps) {
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [editedQuantity, setEditedQuantity] = useState<number>(0);
  const [editedNotes, setEditedNotes] = useState<string>("");

  const tierLabels = {
    good: "Value Package ($1,400-$1,800)",
    better: "Mid-Range Package ($1,900-$2,600)",
    best: "Premium Package ($2,700-$4,000+)"
  };

  // Build line items
  const lineItems: LineItem[] = [
    {
      id: "base",
      description: `72" Double Vanity - ${tierLabels[vanity.tier]}`,
      quantity: vanity.quantity,
      unitPrice: vanity.basePrice,
      total: vanity.basePrice * vanity.quantity,
      notes: "Includes cabinet, top, bowls, installation labor"
    }
  ];

  if (vanity.singleToDouble) {
    lineItems.push({
      id: "conversion",
      description: "Single-to-Double Conversion",
      quantity: vanity.quantity,
      unitPrice: vanity.conversionCost,
      total: vanity.conversionCost * vanity.quantity,
      notes: "New drain, supply tees, traps, second sink hookup"
    });
  }

  if (vanity.plumbingWallChange) {
    lineItems.push({
      id: "plumbing",
      description: "Plumbing Wall Changes",
      quantity: vanity.quantity,
      unitPrice: vanity.plumbingCost,
      total: vanity.plumbingCost * vanity.quantity,
      notes: "Re-routing supply and drain lines to new wall location"
    });
  }

  const grandTotal = lineItems.reduce((sum, item) => sum + item.total, 0);

  const handleEditStart = (lineItem: LineItem) => {
    setEditingLineId(lineItem.id);
    setEditedQuantity(lineItem.quantity);
    setEditedNotes(lineItem.notes);
  };

  const handleEditSave = (lineId: string) => {
    if (!onUpdate) {
      setEditingLineId(null);
      return;
    }

    const updatedVanity = { ...vanity };
    updatedVanity.quantity = editedQuantity;
    
    onUpdate(index, updatedVanity);
    setEditingLineId(null);
  };

  const handleEditCancel = () => {
    setEditingLineId(null);
    setEditedQuantity(0);
    setEditedNotes("");
  };

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="text-lg">Line-Item Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 pb-2 border-b text-sm font-medium text-muted-foreground">
            <div className="col-span-4">Description</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Unit Price</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>

          {/* Line Items */}
          {lineItems.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-4">
                  <div className="font-medium">{item.description}</div>
                  {editingLineId === item.id ? (
                    <Textarea
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      className="mt-2 text-xs"
                      rows={2}
                      placeholder="Add notes..."
                    />
                  ) : (
                    <div className="text-xs text-muted-foreground mt-1">{item.notes}</div>
                  )}
                </div>

                <div className="col-span-2 flex items-center justify-center">
                  {editingLineId === item.id ? (
                    <Input
                      type="number"
                      value={editedQuantity}
                      onChange={(e) => setEditedQuantity(Number(e.target.value))}
                      className="w-20 text-center"
                      min={1}
                    />
                  ) : (
                    <span>{item.quantity}</span>
                  )}
                </div>

                <div className="col-span-2 text-right">
                  ${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                <div className="col-span-2 text-right font-medium">
                  ${item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                <div className="col-span-2 flex items-center justify-center gap-1">
                  {editingLineId === item.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditSave(item.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEditCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditStart(item)}
                      className="h-8 w-8 p-0"
                      disabled={!onUpdate}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="grid grid-cols-12 gap-2 pt-4 border-t">
            <div className="col-span-8 text-right font-semibold text-lg">
              Grand Total:
            </div>
            <div className="col-span-2 text-right font-bold text-lg text-accent">
              ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="col-span-2"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
