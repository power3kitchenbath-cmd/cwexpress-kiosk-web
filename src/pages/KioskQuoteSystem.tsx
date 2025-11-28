import React, { useMemo, useState, useEffect } from "react";
import { CalendarDays, ChevronRight, CreditCard, Phone, Mail, Ruler, Store, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Kiosk Product Quote System – Single-File Prototype
 * --------------------------------------------------
 * • Drop-in demo component for a self-service kiosk that:
 *   1) collects basic customer + project info
 *   2) estimates a ballpark price for Cabinets / Countertops / Flooring
 *   3) books a confirmation appointment
 *   4) takes a refundable deposit ($28.75) – simulated in this prototype
 *
 * • Tech notes
 *   - TailwindCSS recommended
 *   - shadcn/ui available in this environment; using only native + Tailwind here for portability
 *   - No backend required for demo; replace the `mockPay()` and `mockSave()` with your APIs (Stripe, Calendly/Acuity, Zapier, Supabase, etc.)
 *
 * • Pricebook model (starter)
 *   - Keep this inline for the demo. In production, load from /data/pricebook.json or a headless CMS/DB
 *
 * • CSV idea (for your ops team)
 *   Category,SKU,Name,Unit,GoodPrice,BetterPrice,BestPrice
 *   cabinets,BASE,Base Cabinets,lf,140,175,220
 *   countertops,QUARTZ_STD,Quartz Standard,sf,65,85,110
 *   flooring,LVP_STD,LVP Standard,sf,2.25,3.10,3.95
 *   labor,INSTALL_CABS,Cabinet Install,lf,40,55,70
 *   labor,TEMPLATE_FAB,Template+Fabrication,lf,35,45,55
 *   addons,PLUMBING_MOVE,Move Plumbing,ea,350,500,750
 */

const DEPOSIT = 28.75; // refundable credit if customer proceeds

const PRICEBOOK = {
  cabinets: {
    unit: "lf", // linear feet
    good: 140,
    better: 175,
    best: 220,
    install_lf: 55,
  },
  countertops: {
    unit: "sf",
    quartz: { good: 65, better: 85, best: 110 },
    granite: { good: 55, better: 75, best: 95 },
    template_fab_lf: 45,
  },
  flooring: {
    unit: "sf",
    lvp: { good: 2.25, better: 3.1, best: 3.95 },
    tile: { good: 4.0, better: 5.5, best: 7.0 },
  },
  addons: {
    plumbing_move_each: { good: 350, better: 500, best: 750 },
    demo_allowance: 400,
  },
};

const presets = [
  { id: "SMALL", label: "Small Kitchen", lengthFt: 10, widthFt: 10, cabLF: 18, ctLF: 12 },
  { id: "MEDIUM", label: "Medium Kitchen", lengthFt: 12, widthFt: 12, cabLF: 25, ctLF: 16 },
  { id: "LARGE", label: "Large Kitchen", lengthFt: 14, widthFt: 14, cabLF: 32, ctLF: 22 },
];

function currency(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function roundTo(n: number, step = 10) {
  return Math.round(n / step) * step;
}

export default function KioskProductQuoteSystem() {
  const { toast } = useToast();
  const [step, setStep] = useState<
    "welcome" | "customer" | "kitchen" | "materials" | "estimate" | "appointment" | "payment" | "confirm"
  >("welcome");

  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [sizeMode, setSizeMode] = useState<"PRESET" | "MANUAL">("PRESET");
  const [presetId, setPresetId] = useState("MEDIUM");
  const [dims, setDims] = useState({ lengthFt: 12, widthFt: 12 });
  const [lf, setLf] = useState({ cabLF: 25, ctLF: 16 });

  const [tier, setTier] = useState<"GOOD" | "BETTER" | "BEST">("BETTER");
  const [ctMat, setCtMat] = useState<"quartz" | "granite">("quartz");
  const [floorMat, setFloorMat] = useState<"lvp" | "tile">("lvp");
  const [addOns, setAddOns] = useState({ plumbingMoves: 0, demo: false });

  const areaSF = useMemo(() => dims.lengthFt * dims.widthFt, [dims]);

  // sync preset -> dims + LF
  const preset = useMemo(() => presets.find(p => p.id === presetId)!, [presetId]);
  
  const effective = useMemo(() => {
    if (sizeMode === "PRESET" && preset) {
      return { lengthFt: preset.lengthFt, widthFt: preset.widthFt, cabLF: preset.cabLF, ctLF: preset.ctLF };
    }
    return { lengthFt: dims.lengthFt, widthFt: dims.widthFt, cabLF: lf.cabLF, ctLF: lf.ctLF };
  }, [sizeMode, preset, dims, lf]);

  const estimate = useMemo(() => {
    // Cabinets
    const cabMat = PRICEBOOK.cabinets;
    const cabs = (cabMat.good + (tier === "BETTER" ? cabMat.better - cabMat.good : tier === "BEST" ? cabMat.best - cabMat.good : 0)) * effective.cabLF;
    const cabInstall = cabMat.install_lf * effective.cabLF;

    // Countertops
    const ctTable = PRICEBOOK.countertops[ctMat];
    const ctLF = effective.ctLF;
    const ctDepthIn = 25; // std depth ~25" -> 2.083ft; we'll approximate LF->SF using 2.1 ft depth
    const ctSF = ctLF * (ctDepthIn / 12);
    const ctPricePerSF = tier === "GOOD" ? ctTable.good : tier === "BETTER" ? ctTable.better : ctTable.best;
    const ctCost = ctPricePerSF * ctSF;
    const ctTemplateFab = PRICEBOOK.countertops.template_fab_lf * ctLF;

    // Flooring (use whole room area)
    const flTable = PRICEBOOK.flooring[floorMat];
    const flPricePerSF = tier === "GOOD" ? flTable.good : tier === "BETTER" ? flTable.better : flTable.best;
    const flooring = flPricePerSF * areaSF;

    // Add-ons
    const addPlumbUnit = PRICEBOOK.addons.plumbing_move_each[tier.toLowerCase() as "good" | "better" | "best"];
    const plumbing = addOns.plumbingMoves * addPlumbUnit;
    const demo = addOns.demo ? PRICEBOOK.addons.demo_allowance : 0;

    let subtotal = cabs + cabInstall + ctCost + ctTemplateFab + flooring + plumbing + demo;

    // Fudge factor for design/details variance (range +/-8%)
    const low = roundTo(subtotal * 0.92, 10);
    const high = roundTo(subtotal * 1.08, 10);

    // Credit the deposit on final order
    return { low, high, subtotal: roundTo(subtotal, 10), depositCredit: DEPOSIT };
  }, [tier, ctMat, floorMat, areaSF, addOns, effective]);

  const [slot, setSlot] = useState("");
  const [refCode, setRefCode] = useState("");

  // Save or update quote in database
  async function saveQuote(status: string = "draft") {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const quoteData = {
        user_id: user?.id || null,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email,
        size_mode: sizeMode,
        preset_id: sizeMode === "PRESET" ? presetId : null,
        length_ft: effective.lengthFt,
        width_ft: effective.widthFt,
        cabinet_lf: effective.cabLF,
        countertop_lf: effective.ctLF,
        area_sf: areaSF,
        tier: tier,
        countertop_material: ctMat,
        flooring_material: floorMat,
        plumbing_moves: addOns.plumbingMoves,
        include_demo: addOns.demo,
        estimate_low: estimate.low,
        estimate_high: estimate.high,
        estimate_subtotal: estimate.subtotal,
        deposit_amount: DEPOSIT,
        appointment_slot: slot,
        status: status,
      };

      if (quoteId) {
        // Update existing quote
        const { error } = await supabase
          .from("kiosk_quotes")
          .update(quoteData)
          .eq("id", quoteId);
        
        if (error) throw error;
        return { ok: true, id: quoteId };
      } else {
        // Create new quote
        const { data, error } = await supabase
          .from("kiosk_quotes")
          .insert(quoteData)
          .select()
          .single();
        
        if (error) throw error;
        setQuoteId(data.id);
        return { ok: true, id: data.id };
      }
    } catch (error) {
      console.error("Error saving quote:", error);
      toast({
        title: "Error",
        description: "Failed to save quote. Please try again.",
        variant: "destructive",
      });
      return { ok: false };
    }
  }

  async function completePayment() {
    try {
      // Generate reference code
      const refCode = `KQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      
      // Update quote with payment info
      const { error } = await supabase
        .from("kiosk_quotes")
        .update({
          status: "appointment_booked",
          deposit_paid: true,
          deposit_paid_at: new Date().toISOString(),
          reference_code: refCode,
          payment_receipt: `RECEIPT-${refCode}`,
        })
        .eq("id", quoteId);
      
      if (error) throw error;
      
      setRefCode(refCode);
      return { ok: true, receipt: refCode };
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
      return { ok: false };
    }
  }

  function Next({ onClick, label = "Continue" }: { onClick: () => void; label?: string }) {
    return (
      <button onClick={onClick} className="mt-4 w-full rounded-2xl px-6 py-4 text-lg font-semibold shadow-sm bg-blue-600 text-white hover:bg-blue-700">
        {label} <ChevronRight className="ml-1 inline-block" size={20} />
      </button>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {step === "welcome" && (
          <div className="animate-in fade-in duration-300 text-center">
            <div className="mb-8 flex items-center justify-center gap-2 text-blue-700">
              <Store /> <span className="font-semibold tracking-wide">Kiosk – Quick Estimate & Appointment</span>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight">Plan Your Dream Kitchen—Fast Estimate in Minutes</h1>
            <p className="mt-3 text-slate-600">Get a ballpark total for cabinets, countertops, and flooring, then lock a design consultation. A refundable <strong>${DEPOSIT.toFixed(2)}</strong> deposit reserves your spot.</p>
            <Next onClick={() => setStep("customer")} label="Start" />
            <p className="mt-4 text-xs text-slate-500">Your estimate is for planning only. Final quote after on-site measure & design.</p>
          </div>
        )}

        {step === "customer" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold">Your Info</h2>
            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="mb-1 block text-sm">Full Name</span>
                <input value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} className="w-full rounded-xl border p-3" placeholder="Jane Customer" />
              </label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm">Phone</span>
                  <div className="flex items-center gap-2 rounded-xl border p-3"><Phone size={18} /><input value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} className="w-full outline-none" placeholder="(555) 123-4567" /></div>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm">Email</span>
                  <div className="flex items-center gap-2 rounded-xl border p-3"><Mail size={18} /><input value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} className="w-full outline-none" placeholder="you@example.com" /></div>
                </label>
              </div>
            </div>
            <Next onClick={async () => {
              if (!customer.name || !customer.email || !customer.phone) {
                toast({
                  title: "Missing Information",
                  description: "Please fill in all customer information.",
                  variant: "destructive",
                });
                return;
              }
              await saveQuote("draft");
              setStep("kitchen");
            }} />
          </div>
        )}

        {step === "kitchen" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold">Kitchen Basics</h2>
            <div className="mt-3 rounded-2xl border p-4">
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => setSizeMode("PRESET")} className={`rounded-xl px-4 py-2 text-sm font-medium ${sizeMode === "PRESET" ? "bg-blue-600 text-white" : "bg-slate-100"}`}>Use Preset</button>
                <button onClick={() => setSizeMode("MANUAL")} className={`rounded-xl px-4 py-2 text-sm font-medium ${sizeMode === "MANUAL" ? "bg-blue-600 text-white" : "bg-slate-100"}`}>Manual</button>
              </div>
              {sizeMode === "PRESET" ? (
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {presets.map(p => (
                    <button key={p.id} onClick={() => { setPresetId(p.id); setDims({ lengthFt: p.lengthFt, widthFt: p.widthFt }); setLf({ cabLF: p.cabLF, ctLF: p.ctLF }); }} className={`rounded-2xl border p-4 text-left ${presetId === p.id ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}>
                      <div className="font-semibold">{p.label}</div>
                      <div className="mt-1 text-sm text-slate-600">{p.lengthFt}×{p.widthFt} ft • Cabinets {p.cabLF} lf • CT {p.ctLF} lf</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm">Room Length (ft)</span>
                    <div className="flex items-center gap-2 rounded-xl border p-3"><Ruler size={18} /><input type="number" value={dims.lengthFt} onChange={e => setDims({ ...dims, lengthFt: Number(e.target.value) })} className="w-full outline-none" /></div>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm">Room Width (ft)</span>
                    <div className="flex items-center gap-2 rounded-xl border p-3"><Ruler size={18} /><input type="number" value={dims.widthFt} onChange={e => setDims({ ...dims, widthFt: Number(e.target.value) })} className="w-full outline-none" /></div>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm">Cabinets (linear ft)</span>
                    <input type="number" value={lf.cabLF} onChange={e => setLf({ ...lf, cabLF: Number(e.target.value) })} className="w-full rounded-xl border p-3" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm">Countertops (linear ft)</span>
                    <input type="number" value={lf.ctLF} onChange={e => setLf({ ...lf, ctLF: Number(e.target.value) })} className="w-full rounded-xl border p-3" />
                  </label>
                </div>
              )}
            </div>
            <Next onClick={async () => {
              await saveQuote("draft");
              setStep("materials");
            }} />
          </div>
        )}

        {step === "materials" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold">Materials & Tier</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border p-4">
                <div className="text-sm font-semibold">Quality Tier</div>
                <div className="mt-2 flex gap-2">
                  {(["GOOD", "BETTER", "BEST"] as const).map(t => (
                    <button key={t} onClick={() => setTier(t)} className={`rounded-xl px-4 py-2 text-sm ${tier === t ? "bg-blue-600 text-white" : "bg-slate-100"}`}>{t}</button>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-sm">Countertops</span>
                    <select value={ctMat} onChange={e => setCtMat(e.target.value as any)} className="w-full rounded-xl border p-3">
                      <option value="quartz">Quartz</option>
                      <option value="granite">Granite</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm">Flooring</span>
                    <select value={floorMat} onChange={e => setFloorMat(e.target.value as any)} className="w-full rounded-xl border p-3">
                      <option value="lvp">LVP</option>
                      <option value="tile">Tile</option>
                    </select>
                  </label>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-sm">Plumbing Moves (qty)</span>
                    <input type="number" min={0} value={addOns.plumbingMoves} onChange={e => setAddOns({ ...addOns, plumbingMoves: Number(e.target.value) })} className="w-full rounded-xl border p-3" />
                  </label>
                  <label className="mt-7 inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={addOns.demo} onChange={e => setAddOns({ ...addOns, demo: e.target.checked })} />
                    Include demo allowance
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border p-4">
                <div className="text-sm font-semibold">Live Totals (Range)</div>
                <div className="mt-2 rounded-xl bg-slate-50 p-4">
                  <div className="text-2xl font-extrabold">{currency(estimate.low)} – {currency(estimate.high)}</div>
                  <div className="mt-1 text-xs text-slate-600">Subtotal approx. {currency(estimate.subtotal)} • Deposit credited at order: ${DEPOSIT.toFixed(2)}</div>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Ranges include standard layout assumptions. Final quote after measure, design, and selections.
                </div>
              </div>
            </div>
            <Next onClick={async () => {
              await saveQuote("draft");
              setStep("estimate");
            }} label="Review Estimate" />
          </div>
        )}

        {step === "estimate" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold">Your Estimate</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border p-4">
                <div className="text-sm">Range</div>
                <div className="mt-1 text-3xl font-extrabold">{currency(estimate.low)} – {currency(estimate.high)}</div>
                <div className="mt-2 text-xs text-slate-600">Deposit of ${DEPOSIT.toFixed(2)} is refundable as credit if you proceed.</div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="text-sm font-semibold">What's next?</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  <li>Pick a design consultation time</li>
                  <li>Reserve with refundable deposit</li>
                  <li>Receive confirmation by text and email</li>
                </ul>
              </div>
            </div>
            <Next onClick={async () => {
              await saveQuote("draft");
              setStep("appointment");
            }} label="Choose Appointment" />
          </div>
        )}

        {step === "appointment" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold">Book Your Consultation</h2>
            <div className="mt-3 rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-blue-700"><CalendarDays /> <span className="text-sm font-semibold">Select a time</span></div>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                {["Tue 10:00 AM", "Tue 1:00 PM", "Wed 9:30 AM", "Wed 2:30 PM", "Thu 11:00 AM", "Fri 3:00 PM"].map(t => (
                  <button key={t} onClick={() => setSlot(t)} className={`rounded-xl border p-3 text-sm ${slot === t ? "border-blue-600 bg-blue-50" : "border-slate-200"}`}>{t}</button>
                ))}
              </div>
              <div className="mt-3 text-xs text-slate-600">For live scheduling, embed Calendly/Acuity here.</div>
            </div>
            <Next onClick={async () => {
              if (!slot) {
                toast({
                  title: "Select Time Slot",
                  description: "Please select an appointment time.",
                  variant: "destructive",
                });
                return;
              }
              await saveQuote("draft");
              setStep("payment");
            }} label={slot ? `Reserve ${slot}` : "Reserve (select a slot)"} />
          </div>
        )}

        {step === "payment" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold">Reserve with Deposit</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border p-4">
                <div className="flex items-center gap-2 text-blue-700"><CreditCard /> <span className="text-sm font-semibold">Payment</span></div>
                <div className="mt-2 rounded-xl bg-slate-50 p-4 text-sm">
                  <div className="font-semibold">Amount: ${DEPOSIT.toFixed(2)}</div>
                  <div className="mt-1 text-slate-600">Refundable as credit toward your order. Taxes/fees may apply. By continuing, you agree to our refund policy and privacy notice.</div>
                </div>
                <button
                  onClick={async () => {
                    if (!quoteId) {
                      const save = await saveQuote("draft");
                      if (!save.ok) return;
                    }
                    const pay = await completePayment();
                    if (!pay.ok) return;
                    
                    toast({
                      title: "Success!",
                      description: "Your appointment has been confirmed.",
                    });
                    setStep("confirm");
                  }}
                  className="mt-4 w-full rounded-2xl bg-blue-600 px-6 py-4 font-semibold text-white hover:bg-blue-700"
                  disabled={!slot}
                >
                  Pay ${DEPOSIT.toFixed(2)} & Confirm
                </button>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="text-sm font-semibold">Estimate Recap</div>
                <div className="mt-2 rounded-xl bg-slate-50 p-4">
                  <div className="text-2xl font-extrabold">{currency(estimate.low)} – {currency(estimate.high)}</div>
                  <div className="mt-1 text-xs text-slate-600">Subtotal approx. {currency(estimate.subtotal)} • Credit at order: ${DEPOSIT.toFixed(2)}</div>
                  <div className="mt-2 text-xs text-slate-500">Customer: {customer.name || "(name)"} • {customer.phone || "(phone)"}</div>
                  <div className="text-xs text-slate-500">Email: {customer.email || "(email)"}</div>
                  <div className="mt-2 text-xs text-slate-500">Slot: {slot || "(select a time)"}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="animate-in fade-in duration-300 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 p-3 text-green-700"><CheckCircle2 className="h-full w-full" /></div>
            <h2 className="text-2xl font-bold">You're Booked!</h2>
            <p className="mt-2 text-slate-700">Thanks, {customer.name || "Customer"}. Your consultation is reserved for <strong>{slot}</strong>.</p>
            <p className="text-slate-600">Reference: <span className="font-mono">{refCode}</span></p>
            <div className="mx-auto mt-4 max-w-md rounded-2xl border p-4 text-left text-xs text-slate-600">
              <div className="font-semibold">What happens next</div>
              <ol className="mt-1 list-decimal pl-5">
                <li>You'll receive a text/email confirmation and a check-in QR code.</li>
                <li>Our designer will verify measurements and finalize selections.</li>
                <li>Your $ {DEPOSIT.toFixed(2)} deposit is credited toward your order.</li>
              </ol>
            </div>
            <button onClick={() => {
              // Reset form
              setQuoteId(null);
              setCustomer({ name: "", phone: "", email: "" });
              setSlot("");
              setRefCode("");
              setStep("welcome");
            }} className="mt-6 rounded-2xl bg-slate-900 px-6 py-3 text-white">Finish</button>
          </div>
        )}
      </div>
    </div>
  );
}
