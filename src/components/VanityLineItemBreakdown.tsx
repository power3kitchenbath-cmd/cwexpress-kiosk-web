import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "@/assets/logo.png";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
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

  const generateVanityPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add logo
    try {
      doc.addImage(logo, "PNG", 15, 10, 40, 20);
    } catch (error) {
      console.error("Error adding logo:", error);
    }
    
    // Add title and date
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Vanity Installation Quote", pageWidth - 15, 20, { align: "right" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 15, 27, { align: "right" });
    
    let yPosition = 45;
    
    // Package Information
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Package Details", 15, yPosition);
    yPosition += 7;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Tier: ${tierLabels[vanity.tier]}`, 15, yPosition);
    yPosition += 6;
    doc.text(`Quantity: ${vanity.quantity}`, 15, yPosition);
    yPosition += 6;
    
    if (vanity.singleToDouble) {
      doc.text("✓ Includes Single-to-Double Conversion", 15, yPosition);
      yPosition += 6;
    }
    
    if (vanity.plumbingWallChange) {
      doc.text("✓ Includes Plumbing Wall Changes", 15, yPosition);
      yPosition += 6;
    }
    
    yPosition += 5;
    
    // Line Items Table
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Cost Breakdown", 15, yPosition);
    yPosition += 7;
    
    const tableData = lineItems.map(item => [
      item.description,
      item.quantity.toString(),
      `$${item.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `$${item.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      item.notes
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [["Description", "Qty", "Unit Price", "Total", "Notes"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 15, halign: "center" },
        2: { cellWidth: 25, halign: "right" },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 50 }
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
    
    // Grand Total
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Grand Total:", pageWidth - 70, yPosition);
    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229);
    doc.text(
      `$${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      pageWidth - 15,
      yPosition,
      { align: "right" }
    );
    doc.setTextColor(0, 0, 0);
    
    yPosition += 15;
    
    // Footer notes
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("This quote is valid for 30 days from the date of issue.", 15, yPosition);
    yPosition += 5;
    doc.text("Installation includes demo, removal, setup, and basic hookup.", 15, yPosition);
    yPosition += 5;
    doc.text("Contact us for any questions or to schedule your installation.", 15, yPosition);
    
    // Save the PDF
    doc.save(`vanity-quote-${new Date().toISOString().split("T")[0]}.pdf`);
    
    toast({
      title: "PDF Generated",
      description: "Vanity quote has been downloaded successfully"
    });
  };

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Line-Item Breakdown</CardTitle>
          <Button
            onClick={generateVanityPDF}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
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
