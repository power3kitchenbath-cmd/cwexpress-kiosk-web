import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, Plus, Trash2, Home, ChefHat, Bath, TrendingDown, FileText, Download, Eye, Mail } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RoomEstimate {
  id: string;
  type: "room";
  name: string;
  squareFeet: number;
  grade: "standard" | "premium";
  cost: number;
}

interface KitchenEstimate {
  id: string;
  type: "kitchen";
  name: string;
  multiplier: number;
  tier: "good" | "better" | "best";
  cabinetUpgrade: boolean;
  countertopUpgrade: boolean;
  cost: number;
}

interface VanityEstimate {
  id: string;
  type: "vanity";
  name: string;
  quantity: number;
  vanityType: "single" | "double";
  tier: "good" | "better" | "best";
  singleToDouble: boolean;
  plumbingWallChange: boolean;
  cost: number;
}

type ProjectEstimate = RoomEstimate | KitchenEstimate | VanityEstimate;

export function MultiProjectEstimator() {
  const [projects, setProjects] = useState<ProjectEstimate[]>([]);
  const [activeTab, setActiveTab] = useState<string>("room");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [estimateName, setEstimateName] = useState("");
  const [estimateNotes, setEstimateNotes] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");

  // Room form state
  const [roomName, setRoomName] = useState("");
  const [roomSqft, setRoomSqft] = useState("");
  const [roomGrade, setRoomGrade] = useState<"standard" | "premium">("standard");

  // Kitchen form state
  const [kitchenName, setKitchenName] = useState("");
  const [kitchenMultiplier, setKitchenMultiplier] = useState("");
  const [kitchenTier, setKitchenTier] = useState<"good" | "better" | "best">("good");
  const [kitchenCabinetUpgrade, setKitchenCabinetUpgrade] = useState(false);
  const [kitchenCountertopUpgrade, setKitchenCountertopUpgrade] = useState(false);

  // Vanity form state
  const [vanityName, setVanityName] = useState("");
  const [vanityQuantity, setVanityQuantity] = useState("");
  const [vanityType, setVanityType] = useState<"single" | "double">("single");
  const [vanityTier, setVanityTier] = useState<"good" | "better" | "best">("good");
  const [vanitySingleToDouble, setVanitySingleToDouble] = useState(false);
  const [vanityPlumbingWall, setVanityPlumbingWall] = useState(false);

  // Pricing data
  const roomPricing = {
    standard: { material: 3.49, labor: 2.75 },
    premium: { material: 5.74, labor: 2.75 }
  };

  const kitchenPricing = {
    good: 9500,
    better: 12750,
    best: 18500
  };

  const vanityPricing = {
    single: { good: 2150, better: 3100, best: 4650 },
    double: { good: 2800, better: 3900, best: 5150 }
  };

  const calculateRoomCost = (sqft: number, grade: "standard" | "premium"): number => {
    const pricing = roomPricing[grade];
    return sqft * (pricing.material + pricing.labor);
  };

  const calculateKitchenCost = (
    multiplier: number,
    tier: "good" | "better" | "best",
    cabinetUpgrade: boolean,
    countertopUpgrade: boolean
  ): number => {
    let cost = kitchenPricing[tier] * multiplier;
    if (cabinetUpgrade) cost += 1850 * multiplier;
    if (countertopUpgrade) cost += 2650 * multiplier;
    return cost;
  };

  const calculateVanityCost = (
    quantity: number,
    type: "single" | "double",
    tier: "good" | "better" | "best",
    singleToDouble: boolean,
    plumbingWallChange: boolean
  ): number => {
    let cost = vanityPricing[type][tier] * quantity;
    if (type === "single" && singleToDouble) cost += 650 * quantity;
    if (plumbingWallChange) cost += 450 * quantity;
    return cost;
  };

  const addRoom = () => {
    const sqft = parseFloat(roomSqft);
    if (!roomName || isNaN(sqft) || sqft <= 0) return;

    const cost = calculateRoomCost(sqft, roomGrade);
    const newRoom: RoomEstimate = {
      id: `room-${Date.now()}`,
      type: "room",
      name: roomName,
      squareFeet: sqft,
      grade: roomGrade,
      cost
    };

    setProjects([...projects, newRoom]);
    setRoomName("");
    setRoomSqft("");
  };

  const addKitchen = () => {
    const multiplier = parseFloat(kitchenMultiplier);
    if (!kitchenName || isNaN(multiplier) || multiplier <= 0) return;

    const cost = calculateKitchenCost(
      multiplier,
      kitchenTier,
      kitchenCabinetUpgrade,
      kitchenCountertopUpgrade
    );

    const newKitchen: KitchenEstimate = {
      id: `kitchen-${Date.now()}`,
      type: "kitchen",
      name: kitchenName,
      multiplier,
      tier: kitchenTier,
      cabinetUpgrade: kitchenCabinetUpgrade,
      countertopUpgrade: kitchenCountertopUpgrade,
      cost
    };

    setProjects([...projects, newKitchen]);
    setKitchenName("");
    setKitchenMultiplier("");
    setKitchenCabinetUpgrade(false);
    setKitchenCountertopUpgrade(false);
  };

  const addVanity = () => {
    const quantity = parseInt(vanityQuantity);
    if (!vanityName || isNaN(quantity) || quantity <= 0) return;

    const cost = calculateVanityCost(
      quantity,
      vanityType,
      vanityTier,
      vanitySingleToDouble,
      vanityPlumbingWall
    );

    const newVanity: VanityEstimate = {
      id: `vanity-${Date.now()}`,
      type: "vanity",
      name: vanityName,
      quantity,
      vanityType,
      tier: vanityTier,
      singleToDouble: vanitySingleToDouble,
      plumbingWallChange: vanityPlumbingWall,
      cost
    };

    setProjects([...projects, newVanity]);
    setVanityName("");
    setVanityQuantity("");
    setVanitySingleToDouble(false);
    setVanityPlumbingWall(false);
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const getTotalCost = () => {
    return projects.reduce((sum, project) => sum + project.cost, 0);
  };

  const getEstimatedSavings = () => {
    // Conservative estimate: 15% savings vs competitors on average
    return getTotalCost() * 0.15;
  };

  const getProjectsByType = (type: string) => {
    return projects.filter(p => p.type === type);
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header with company branding
      doc.setFillColor(25, 58, 130); // Primary blue
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('3 Power Cabinet Store', pageWidth / 2, 22, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      const displayName = estimateName || 'Multi-Project Estimate';
      doc.text(displayName, pageWidth / 2, 35, { align: 'center' });

      doc.setFontSize(10);
      doc.text('CABINETS • COUNTERTOPS • FLOORS', pageWidth / 2, 43, { align: 'center' });

      yPosition = 60;

      // Estimate date and summary
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      doc.text(`Estimate Date: ${today}`, 20, yPosition);
      yPosition += 8;

      // Custom notes if provided
      if (estimateNotes) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Customer Notes:', 20, yPosition);
        yPosition += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const splitNotes = doc.splitTextToSize(estimateNotes, pageWidth - 40);
        doc.text(splitNotes, 20, yPosition);
        yPosition += splitNotes.length * 5 + 8;
      }

      // Project summary stats
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Project Summary:', 20, yPosition);
      yPosition += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const roomCount = getProjectsByType("room").length;
      const kitchenCount = getProjectsByType("kitchen").length;
      const vanityCount = getProjectsByType("vanity").length;
      
      doc.text(`• ${roomCount} Room${roomCount !== 1 ? 's' : ''} (LVP Flooring)`, 25, yPosition);
      yPosition += 6;
      doc.text(`• ${kitchenCount} Kitchen${kitchenCount !== 1 ? 's' : ''}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• ${vanityCount} Bathroom${vanityCount !== 1 ? 's' : ''} (Vanity Installation)`, 25, yPosition);
      yPosition += 12;

      // Detailed breakdown by category
      const categories = [
        { type: 'room', title: 'LVP Flooring Projects', icon: '🏠' },
        { type: 'kitchen', title: 'Kitchen Installations', icon: '👨‍🍳' },
        { type: 'vanity', title: 'Bathroom Vanity Installations', icon: '🛁' }
      ];

      categories.forEach((category) => {
        const categoryProjects = getProjectsByType(category.type);
        if (categoryProjects.length === 0) return;

        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = 20;
        }

        // Category header
        doc.setFillColor(240, 245, 249);
        doc.rect(15, yPosition - 5, pageWidth - 30, 10, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(25, 58, 130);
        doc.text(`${category.icon} ${category.title}`, 20, yPosition + 2);
        yPosition += 15;

        // Create table data for this category
        const tableData = categoryProjects.map(project => {
          let details = '';
          if (project.type === 'room') {
            const room = project as RoomEstimate;
            details = `${room.squareFeet} sqft • ${room.grade} grade`;
          } else if (project.type === 'kitchen') {
            const kitchen = project as KitchenEstimate;
            details = `${kitchen.multiplier}x size • ${kitchen.tier} tier`;
            if (kitchen.cabinetUpgrade) details += ' • Cabinet upgrade';
            if (kitchen.countertopUpgrade) details += ' • Countertop upgrade';
          } else if (project.type === 'vanity') {
            const vanity = project as VanityEstimate;
            details = `${vanity.quantity}x ${vanity.vanityType} • ${vanity.tier} tier`;
            if (vanity.singleToDouble) details += ' • Single→Double';
            if (vanity.plumbingWallChange) details += ' • Plumbing change';
          }
          return [project.name, details, `$${project.cost.toFixed(2)}`];
        });

        autoTable(doc, {
          startY: yPosition,
          head: [['Project Name', 'Specifications', 'Cost']],
          body: tableData,
          theme: 'striped',
          headStyles: {
            fillColor: [25, 58, 130],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [0, 0, 0]
          },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 80 },
            2: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
          },
          margin: { left: 15, right: 15 },
          didDrawPage: function(data) {
            yPosition = data.cursor?.y || yPosition;
          }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      });

      // Cost summary box
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFillColor(240, 253, 244);
      doc.rect(15, yPosition, pageWidth - 30, 45, 'F');
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(1);
      doc.rect(15, yPosition, pageWidth - 30, 45);

      yPosition += 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal:', 20, yPosition);
      doc.text(`$${getTotalCost().toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 8;

      doc.setTextColor(34, 197, 94);
      doc.text('Estimated Savings vs Competitors:', 20, yPosition);
      doc.text(`-$${getEstimatedSavings().toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 12;

      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 58, 130);
      doc.text('Total Project Cost:', 20, yPosition);
      doc.text(`$${getTotalCost().toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });

      // Footer notes
      yPosition = pageHeight - 40;
      doc.setFillColor(249, 250, 251);
      doc.rect(0, yPosition - 5, pageWidth, 45, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Important Notes:', 20, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const notes = [
        '• This is a preliminary estimate. Final pricing will be confirmed after site visit and consultation.',
        '• All prices include materials, labor, and professional installation.',
        '• Estimates are valid for 30 days from the date of this document.',
        '• Additional costs may apply for structural modifications or unforeseen site conditions.'
      ];

      notes.forEach(note => {
        doc.text(note, 20, yPosition);
        yPosition += 4;
      });

      // Footer
      yPosition = pageHeight - 10;
      doc.setFillColor(25, 58, 130);
      doc.rect(0, yPosition - 5, pageWidth, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Factory Direct Pricing - Professional Quality', pageWidth / 2, yPosition + 2, { align: 'center' });

      // Generate filename with date and custom name
      const safeName = (estimateName || 'Multi-Project-Estimate').replace(/[^a-z0-9]/gi, '-');
      const dateStr = today.replace(/,/g, '').replace(/ /g, '-');
      const filename = `3Power-${safeName}-${dateStr}.pdf`;
      
      doc.save(filename);
      toast.success("Estimate downloaded successfully!");
      setPreviewOpen(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate estimate. Please try again.");
    }
  };

  const sendQuoteEmail = async () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      toast.error("Please enter customer name and email");
      return;
    }

    if (projects.length === 0) {
      toast.error("Please add at least one project to the estimate");
      return;
    }

    setSendingEmail(true);

    try {
      // Generate PDF as base64
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header with company branding
      doc.setFillColor(25, 58, 130);
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('3 Power Cabinet Store', pageWidth / 2, 22, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      const displayName = estimateName || 'Multi-Project Estimate';
      doc.text(displayName, pageWidth / 2, 35, { align: 'center' });

      doc.setFontSize(10);
      doc.text('CABINETS • COUNTERTOPS • FLOORS', pageWidth / 2, 43, { align: 'center' });

      yPosition = 60;

      const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Estimate Date: ${today}`, 20, yPosition);
      yPosition += 8;

      if (estimateNotes) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Customer Notes:', 20, yPosition);
        yPosition += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const splitNotes = doc.splitTextToSize(estimateNotes, pageWidth - 40);
        doc.text(splitNotes, 20, yPosition);
        yPosition += splitNotes.length * 5 + 8;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Project Summary:', 20, yPosition);
      yPosition += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const roomCount = getProjectsByType("room").length;
      const kitchenCount = getProjectsByType("kitchen").length;
      const vanityCount = getProjectsByType("vanity").length;
      
      doc.text(`• ${roomCount} Room${roomCount !== 1 ? 's' : ''} (LVP Flooring)`, 25, yPosition);
      yPosition += 6;
      doc.text(`• ${kitchenCount} Kitchen${kitchenCount !== 1 ? 's' : ''}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• ${vanityCount} Bathroom${vanityCount !== 1 ? 's' : ''} (Vanity Installation)`, 25, yPosition);
      yPosition += 12;

      const categories = [
        { type: 'room', title: 'LVP Flooring Projects', icon: '🏠' },
        { type: 'kitchen', title: 'Kitchen Installations', icon: '👨‍🍳' },
        { type: 'vanity', title: 'Bathroom Vanity Installations', icon: '🛁' }
      ];

      categories.forEach((category) => {
        const categoryProjects = getProjectsByType(category.type);
        if (categoryProjects.length === 0) return;

        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFillColor(240, 245, 249);
        doc.rect(15, yPosition - 5, pageWidth - 30, 10, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(25, 58, 130);
        doc.text(`${category.icon} ${category.title}`, 20, yPosition + 2);
        yPosition += 15;

        const tableData = categoryProjects.map(project => {
          let details = '';
          if (project.type === 'room') {
            const room = project as RoomEstimate;
            details = `${room.squareFeet} sqft • ${room.grade} grade`;
          } else if (project.type === 'kitchen') {
            const kitchen = project as KitchenEstimate;
            details = `${kitchen.multiplier}x size • ${kitchen.tier} tier`;
            if (kitchen.cabinetUpgrade) details += ' • Cabinet upgrade';
            if (kitchen.countertopUpgrade) details += ' • Countertop upgrade';
          } else if (project.type === 'vanity') {
            const vanity = project as VanityEstimate;
            details = `${vanity.quantity}x ${vanity.vanityType} • ${vanity.tier} tier`;
            if (vanity.singleToDouble) details += ' • Single→Double';
            if (vanity.plumbingWallChange) details += ' • Plumbing change';
          }
          return [project.name, details, `$${project.cost.toFixed(2)}`];
        });

        autoTable(doc, {
          startY: yPosition,
          head: [['Project Name', 'Specifications', 'Cost']],
          body: tableData,
          theme: 'striped',
          headStyles: {
            fillColor: [25, 58, 130],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [0, 0, 0]
          },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 80 },
            2: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
          },
          margin: { left: 15, right: 15 },
          didDrawPage: function(data) {
            yPosition = data.cursor?.y || yPosition;
          }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      });

      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFillColor(240, 253, 244);
      doc.rect(15, yPosition, pageWidth - 30, 45, 'F');
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(1);
      doc.rect(15, yPosition, pageWidth - 30, 45);

      yPosition += 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal:', 20, yPosition);
      doc.text(`$${getTotalCost().toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 8;

      doc.setTextColor(34, 197, 94);
      doc.text('Estimated Savings vs Competitors:', 20, yPosition);
      doc.text(`-$${getEstimatedSavings().toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });
      yPosition += 12;

      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 58, 130);
      doc.text('Total Project Cost:', 20, yPosition);
      doc.text(`$${getTotalCost().toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });

      yPosition = pageHeight - 40;
      doc.setFillColor(249, 250, 251);
      doc.rect(0, yPosition - 5, pageWidth, 45, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Important Notes:', 20, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const notes = [
        '• This is a preliminary estimate. Final pricing will be confirmed after site visit and consultation.',
        '• All prices include materials, labor, and professional installation.',
        '• Estimates are valid for 30 days from the date of this document.',
        '• Additional costs may apply for structural modifications or unforeseen site conditions.'
      ];

      notes.forEach(note => {
        doc.text(note, 20, yPosition);
        yPosition += 4;
      });

      yPosition = pageHeight - 10;
      doc.setFillColor(25, 58, 130);
      doc.rect(0, yPosition - 5, pageWidth, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Factory Direct Pricing - Professional Quality', pageWidth / 2, yPosition + 2, { align: 'center' });

      const pdfBase64 = doc.output('datauristring').split(',')[1];

      const { data, error } = await supabase.functions.invoke('send-multi-project-quote', {
        body: {
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim() || undefined,
          customerCompany: customerCompany.trim() || undefined,
          pdfBase64,
          estimateName: displayName,
          estimateNotes: estimateNotes.trim() || undefined,
          totalCost: getTotalCost(),
          projectCount: projects.length,
        },
      });

      if (error) throw error;

      toast.success("Quote request sent successfully!");
      setPreviewOpen(false);
      
      // Reset customer form
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setCustomerCompany("");
    } catch (error) {
      console.error("Error sending quote email:", error);
      toast.error("Failed to send quote request");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/20">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Multi-Project Estimate Builder</CardTitle>
            <CardDescription>
              Combine multiple rooms, kitchens, and bathrooms for a complete project estimate
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="room" className="gap-2">
              <Home className="w-4 h-4" />
              Add Room
            </TabsTrigger>
            <TabsTrigger value="kitchen" className="gap-2">
              <ChefHat className="w-4 h-4" />
              Add Kitchen
            </TabsTrigger>
            <TabsTrigger value="vanity" className="gap-2">
              <Bath className="w-4 h-4" />
              Add Vanity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="room" className="space-y-4 mt-4">
            <div className="p-4 border rounded-lg bg-background">
              <h3 className="font-semibold mb-4">LVP Flooring</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="roomName">Room Name</Label>
                  <Input
                    id="roomName"
                    placeholder="e.g., Master Bedroom"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="roomSqft">Square Feet</Label>
                    <Input
                      id="roomSqft"
                      type="number"
                      placeholder="200"
                      value={roomSqft}
                      onChange={(e) => setRoomSqft(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="roomGrade">Grade</Label>
                    <Select value={roomGrade} onValueChange={(value: any) => setRoomGrade(value)}>
                      <SelectTrigger id="roomGrade" className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="standard">Standard ($3.49/sqft)</SelectItem>
                        <SelectItem value="premium">Premium ($5.74/sqft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addRoom} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Add Room to Estimate
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="kitchen" className="space-y-4 mt-4">
            <div className="p-4 border rounded-lg bg-background">
              <h3 className="font-semibold mb-4">Kitchen Installation</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="kitchenName">Kitchen Name</Label>
                  <Input
                    id="kitchenName"
                    placeholder="e.g., Main Kitchen"
                    value={kitchenName}
                    onChange={(e) => setKitchenName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="kitchenMultiplier">Size Multiplier</Label>
                    <Input
                      id="kitchenMultiplier"
                      type="number"
                      placeholder="1.0"
                      value={kitchenMultiplier}
                      onChange={(e) => setKitchenMultiplier(e.target.value)}
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kitchenTier">Tier</Label>
                    <Select value={kitchenTier} onValueChange={(value: any) => setKitchenTier(value)}>
                      <SelectTrigger id="kitchenTier" className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="good">Good ($9,500)</SelectItem>
                        <SelectItem value="better">Better ($12,750)</SelectItem>
                        <SelectItem value="best">Best ($18,500)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={kitchenCabinetUpgrade}
                      onChange={(e) => setKitchenCabinetUpgrade(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Cabinet Upgrade (+$1,850)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={kitchenCountertopUpgrade}
                      onChange={(e) => setKitchenCountertopUpgrade(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Countertop Upgrade (+$2,650)</span>
                  </label>
                </div>
                <Button onClick={addKitchen} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Add Kitchen to Estimate
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vanity" className="space-y-4 mt-4">
            <div className="p-4 border rounded-lg bg-background">
              <h3 className="font-semibold mb-4">Vanity Installation</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="vanityName">Bathroom Name</Label>
                  <Input
                    id="vanityName"
                    placeholder="e.g., Master Bath"
                    value={vanityName}
                    onChange={(e) => setVanityName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="vanityQuantity">Quantity</Label>
                    <Input
                      id="vanityQuantity"
                      type="number"
                      placeholder="1"
                      value={vanityQuantity}
                      onChange={(e) => setVanityQuantity(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vanityTypeSelect">Type</Label>
                    <Select value={vanityType} onValueChange={(value: any) => setVanityType(value)}>
                      <SelectTrigger id="vanityTypeSelect" className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="single">Single Sink</SelectItem>
                        <SelectItem value="double">Double Sink</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="vanityTierSelect">Tier</Label>
                    <Select value={vanityTier} onValueChange={(value: any) => setVanityTier(value)}>
                      <SelectTrigger id="vanityTierSelect" className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="better">Better</SelectItem>
                        <SelectItem value="best">Best</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-4">
                  {vanityType === "single" && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vanitySingleToDouble}
                        onChange={(e) => setVanitySingleToDouble(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Convert to Double (+$650)</span>
                    </label>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vanityPlumbingWall}
                      onChange={(e) => setVanityPlumbingWall(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Plumbing Change (+$450)</span>
                  </label>
                </div>
                <Button onClick={addVanity} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Add Vanity to Estimate
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {projects.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Project Summary</h3>
              
              <div className="space-y-2">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                    <div className="flex items-center gap-3">
                      {project.type === "room" && <Home className="w-5 h-5 text-primary" />}
                      {project.type === "kitchen" && <ChefHat className="w-5 h-5 text-secondary" />}
                      {project.type === "vanity" && <Bath className="w-5 h-5 text-accent" />}
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.type === "room" && `${(project as RoomEstimate).squareFeet} sqft • ${(project as RoomEstimate).grade}`}
                          {project.type === "kitchen" && `${(project as KitchenEstimate).multiplier}x • ${(project as KitchenEstimate).tier} tier`}
                          {project.type === "vanity" && `${(project as VanityEstimate).quantity}x ${(project as VanityEstimate).vanityType} • ${(project as VanityEstimate).tier} tier`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">${project.cost.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProject(project.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-end gap-2">
                  <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Preview & Download
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Estimate Preview & Quote Request</DialogTitle>
                        <DialogDescription>
                          Customize your estimate and send it to our sales team
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* Customer Information Section */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Customer Information</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <Label htmlFor="customer-name">Name *</Label>
                              <Input
                                id="customer-name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="John Smith"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <Label htmlFor="customer-email">Email *</Label>
                              <Input
                                id="customer-email"
                                type="email"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                placeholder="john@example.com"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="customer-phone">Phone (Optional)</Label>
                              <Input
                                id="customer-phone"
                                type="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="(555) 123-4567"
                              />
                            </div>
                            <div>
                              <Label htmlFor="customer-company">Company (Optional)</Label>
                              <Input
                                id="customer-company"
                                value={customerCompany}
                                onChange={(e) => setCustomerCompany(e.target.value)}
                                placeholder="ABC Construction"
                              />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Estimate Details Section */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Estimate Details</h3>
                          <div>
                            <Label htmlFor="estimateName">Estimate Name (Optional)</Label>
                            <Input
                              id="estimateName"
                              placeholder="e.g., Smith Residence Renovation"
                              value={estimateName}
                              onChange={(e) => setEstimateName(e.target.value)}
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label htmlFor="estimateNotes">Additional Notes (Optional)</Label>
                            <Textarea
                              id="estimateNotes"
                              placeholder="Add any special requirements, preferences, or details about this project..."
                              value={estimateNotes}
                              onChange={(e) => setEstimateNotes(e.target.value)}
                              className="mt-2 min-h-[100px]"
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Estimate Preview</h3>
                          
                          <div className="p-6 border rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5">
                            <div className="space-y-4">
                              <div className="text-center p-4 bg-primary rounded-lg">
                                <h2 className="text-2xl font-bold text-primary-foreground">3 Power Cabinet Store</h2>
                                <p className="text-primary-foreground/90">
                                  {estimateName || "Multi-Project Estimate"}
                                </p>
                              </div>

                              {estimateNotes && (
                                <div className="p-4 border rounded-lg bg-muted/50">
                                  <p className="font-semibold mb-2">Customer Notes:</p>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {estimateNotes}
                                  </p>
                                </div>
                              )}

                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-3 border rounded-lg">
                                  <div className="text-2xl font-bold text-primary">
                                    {getProjectsByType("room").length}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Rooms</div>
                                </div>
                                <div className="p-3 border rounded-lg">
                                  <div className="text-2xl font-bold text-secondary">
                                    {getProjectsByType("kitchen").length}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Kitchens</div>
                                </div>
                                <div className="p-3 border rounded-lg">
                                  <div className="text-2xl font-bold text-accent">
                                    {getProjectsByType("vanity").length}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Bathrooms</div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                {projects.map((project) => (
                                  <div key={project.id} className="flex justify-between p-3 border rounded-lg bg-background">
                                    <div className="flex items-center gap-2">
                                      {project.type === "room" && <Home className="w-4 h-4 text-primary" />}
                                      {project.type === "kitchen" && <ChefHat className="w-4 h-4 text-secondary" />}
                                      {project.type === "vanity" && <Bath className="w-4 h-4 text-accent" />}
                                      <span className="font-medium text-sm">{project.name}</span>
                                    </div>
                                    <span className="font-semibold text-sm">${project.cost.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>

                              <Separator />

                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Subtotal:</span>
                                  <span className="font-semibold">${getTotalCost().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                  <span>Estimated Savings:</span>
                                  <span className="font-semibold">-${getEstimatedSavings().toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg">
                                  <span className="font-bold">Total Project Cost:</span>
                                  <span className="font-bold text-primary">${getTotalCost().toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button 
                            onClick={generatePDF} 
                            variant="outline" 
                            className="flex-1"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </Button>
                          <Button 
                            onClick={sendQuoteEmail} 
                            className="flex-1"
                            disabled={sendingEmail || !customerName.trim() || !customerEmail.trim()}
                          >
                            {sendingEmail ? (
                              <>Sending...</>
                            ) : (
                              <>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Quote Request
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="p-6 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/40">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{getProjectsByType("room").length}</div>
                        <div className="text-sm text-muted-foreground">Rooms</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-secondary">{getProjectsByType("kitchen").length}</div>
                        <div className="text-sm text-muted-foreground">Kitchens</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-accent">{getProjectsByType("vanity").length}</div>
                        <div className="text-sm text-muted-foreground">Bathrooms</div>
                      </div>
                    </div>

                  <Separator className="bg-primary/20" />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-semibold">${getTotalCost().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Estimated Savings:</span>
                      <Badge variant="secondary" className="gap-1">
                        <TrendingDown className="w-4 h-4" />
                        ${getEstimatedSavings().toFixed(2)}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="bg-primary/20" />

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xl font-bold">Total Project Cost:</span>
                      <span className="text-3xl font-bold text-primary">${getTotalCost().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> This is a comprehensive estimate for your entire project. 
                  Final pricing will be confirmed after a site visit and consultation with our team. 
                  All prices include materials, labor, and professional installation.
                </p>
              </div>
            </div>
          </>
        )}

        {projects.length === 0 && (
          <div className="text-center p-12 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">No Projects Added Yet</p>
            <p className="text-sm text-muted-foreground">
              Add rooms, kitchens, or bathrooms using the tabs above to build your complete project estimate
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
