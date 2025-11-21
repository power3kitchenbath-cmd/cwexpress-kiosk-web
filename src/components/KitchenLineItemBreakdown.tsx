import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit2, Check, X, FileDown, Mail, Save } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "@/assets/logo.png";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface KitchenItem {
  tier: 'good' | 'better' | 'best';
  quantity: number;
  basePrice: number;
  cabinetUpgrade: boolean;
  countertopUpgrade: boolean;
  cabinetCost: number;
  countertopCost: number;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes: string;
}

interface KitchenLineItemBreakdownProps {
  kitchen: KitchenItem;
  index: number;
  onUpdate?: (index: number, updatedKitchen: KitchenItem) => void;
}

export function KitchenLineItemBreakdown({ kitchen, index, onUpdate }: KitchenLineItemBreakdownProps) {
  const { toast } = useToast();
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [editedQuantity, setEditedQuantity] = useState<number>(0);
  const [editedNotes, setEditedNotes] = useState<string>("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSavingQuote, setIsSavingQuote] = useState(false);

  const tierLabels = {
    good: "Value Package ($8,500-$10,500)",
    better: "Mid-Range Package ($11,000-$14,500)",
    best: "Premium Package ($15,000-$22,000+)"
  };

  // Build line items
  const lineItems: LineItem[] = [
    {
      id: "base",
      description: `10×10 Kitchen Package - ${tierLabels[kitchen.tier]}`,
      quantity: kitchen.quantity,
      unitPrice: kitchen.basePrice,
      total: kitchen.basePrice * kitchen.quantity,
      notes: "Includes cabinets, countertops, installation labor, demo & removal"
    }
  ];

  if (kitchen.cabinetUpgrade) {
    lineItems.push({
      id: "cabinet",
      description: "Premium Cabinet Door Upgrade",
      quantity: kitchen.quantity,
      unitPrice: kitchen.cabinetCost,
      total: kitchen.cabinetCost * kitchen.quantity,
      notes: "Upgrade to premium cabinet door style and finish"
    });
  }

  if (kitchen.countertopUpgrade) {
    lineItems.push({
      id: "countertop",
      description: "Quartz/Granite Countertop Upgrade",
      quantity: kitchen.quantity,
      unitPrice: kitchen.countertopCost,
      total: kitchen.countertopCost * kitchen.quantity,
      notes: "Upgrade to premium quartz or granite countertop material"
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

    const updatedKitchen = { ...kitchen };
    updatedKitchen.quantity = editedQuantity;
    
    onUpdate(index, updatedKitchen);
    setEditingLineId(null);
  };

  const handleEditCancel = () => {
    setEditingLineId(null);
    setEditedQuantity(0);
    setEditedNotes("");
  };

  const generateKitchenPDF = () => {
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
    doc.text("10×10 Kitchen Installation Quote", pageWidth - 15, 20, { align: "right" });
    
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
    doc.text(`Tier: ${tierLabels[kitchen.tier]}`, 15, yPosition);
    yPosition += 6;
    doc.text(`Quantity: ${kitchen.quantity}`, 15, yPosition);
    yPosition += 6;
    
    if (kitchen.cabinetUpgrade) {
      doc.text("✓ Includes Premium Cabinet Door Upgrade", 15, yPosition);
      yPosition += 6;
    }
    
    if (kitchen.countertopUpgrade) {
      doc.text("✓ Includes Quartz/Granite Countertop Upgrade", 15, yPosition);
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
    doc.text("Installation includes demo, removal, cabinet setup, and basic hookup.", 15, yPosition);
    yPosition += 5;
    doc.text("Contact us for any questions or to schedule your installation.", 15, yPosition);
    
    // Save the PDF
    doc.save(`kitchen-quote-${new Date().toISOString().split("T")[0]}.pdf`);
    
    toast({
      title: "PDF Generated",
      description: "Kitchen quote has been downloaded successfully"
    });
  };

  const handleSendEmail = async () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both customer name and email",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);

    try {
      // First, save the quote to database
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data: savedQuote, error: saveError } = await supabase
        .from("kitchen_quotes")
        .insert({
          user_id: user.id,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          tier: kitchen.tier,
          quantity: kitchen.quantity,
          base_price: kitchen.basePrice,
          cabinet_upgrade: kitchen.cabinetUpgrade,
          countertop_upgrade: kitchen.countertopUpgrade,
          cabinet_cost: kitchen.cabinetCost,
          countertop_cost: kitchen.countertopCost,
          line_items: lineItems,
          grand_total: grandTotal,
          status: "sent",
          email_sent_at: new Date().toISOString(),
        } as any)
        .select()
        .single();

      if (saveError) throw saveError;

      // Then send the email
      const { data, error } = await supabase.functions.invoke("send-kitchen-quote", {
        body: {
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          kitchen,
          lineItems,
          grandTotal,
        },
      });

      if (error) throw error;

      toast({
        title: "Quote Sent & Saved",
        description: `Kitchen quote sent to ${customerEmail} and saved to database`,
      });

      setEmailDialogOpen(false);
      setCustomerName("");
      setCustomerEmail("");
    } catch (error: any) {
      console.error("Error sending kitchen quote email:", error);
      toast({
        title: "Email Failed",
        description: error.message || "Failed to send kitchen quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSaveQuote = async () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both customer name and email",
        variant: "destructive",
      });
      return;
    }

    setIsSavingQuote(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("kitchen_quotes")
        .insert({
          user_id: user.id,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          tier: kitchen.tier,
          quantity: kitchen.quantity,
          base_price: kitchen.basePrice,
          cabinet_upgrade: kitchen.cabinetUpgrade,
          countertop_upgrade: kitchen.countertopUpgrade,
          cabinet_cost: kitchen.cabinetCost,
          countertop_cost: kitchen.countertopCost,
          line_items: lineItems,
          grand_total: grandTotal,
          status: "draft",
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Quote Saved",
        description: "Kitchen quote saved successfully as draft",
      });

      setEmailDialogOpen(false);
      setCustomerName("");
      setCustomerEmail("");
    } catch (error: any) {
      console.error("Error saving kitchen quote:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save kitchen quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingQuote(false);
    }
  };

  return (
    <>
      <Card className="border-accent/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Line-Item Breakdown</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={generateKitchenPDF}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <FileDown className="h-4 w-4" />
                Export PDF
              </Button>
              <Button
                onClick={() => setEmailDialogOpen(true)}
                variant="default"
                size="sm"
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Email Quote
              </Button>
            </div>
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

    <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Kitchen Quote</DialogTitle>
          <DialogDescription>
            Enter customer details to email this quote or save it as a draft.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Customer Name</Label>
            <Input
              id="customer-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-email">Customer Email</Label>
            <Input
              id="customer-email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleSaveQuote}
            disabled={isSavingQuote || isSendingEmail}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSavingQuote ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={isSendingEmail || isSavingQuote}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            {isSendingEmail ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
