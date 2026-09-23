import { useState } from "react";
import {
  MessageSquare,
  CreditCard,
  Building2,
  Save,
  RotateCcw,
  Check,
  Copy,
  QrCode,
  Upload,
  Trash2,
  ExternalLink,
  Sparkles,
  Smartphone,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Info,
  HelpCircle,
  Eye,
} from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

const SettingsPage = () => {
  const {
    settings,
    updateSection,
    resetToDefaults,
    generateQuotationMessage,
    getUpiPaymentUrl,
  } = useSettings();

  const [activeTab, setActiveTab] = useState("quotation"); // "quotation" | "payment" | "salon"
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [testAmount, setTestAmount] = useState(10000);

  // Local working copy of settings to allow smooth typing and batch save
  const [localSalon, setLocalSalon] = useState(settings.salon);
  const [localPayment, setLocalPayment] = useState(settings.payment);
  const [localQuotation, setLocalQuotation] = useState(settings.quotation);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = () => {
    updateSection("salon", localSalon);
    updateSection("payment", localPayment);
    updateSection("quotation", localQuotation);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all settings to default values?")) {
      resetToDefaults();
      window.location.reload();
    }
  };

  // Handle custom QR code image upload
  const handleQrUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setLocalPayment((prev) => ({
        ...prev,
        qrMode: "custom",
        customQrImage: base64,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Demo appointment for live preview
  const demoAppointment = {
    code: "APT-4820",
    clientName: "Meenakshi Sundaram",
    clientPhone: "+91 98401 23456",
    serviceName: "Royal Muhurtham Bridal Styling",
    serviceCategory: "Bridal Couture",
    eventDate: "2026-10-18",
    eventTime: "06:30 AM",
    duration: 180,
    venueName: "The Leela Palace Ballroom",
    venueType: "Venue",
    baseAmount: 22000,
    venueDelta: 2000,
    travelFee: 1000,
    totalAmount: 25000,
    advanceRequired: Math.round(25000 * ((localSalon.defaultAdvancePercent || 40) / 100)),
    balanceDue: 25000 - Math.round(25000 * ((localSalon.defaultAdvancePercent || 40) / 100)),
  };

  // Live preview message using currently typed settings
  const previewMessage = generateQuotationMessage(demoAppointment);
  const upiPreview = getUpiPaymentUrl(testAmount, "APT-DEMO");

  const variableTags = [
    { tag: "{clientName}", label: "Client Name" },
    { tag: "{code}", label: "Booking ID" },
    { tag: "{serviceName}", label: "Service Name" },
    { tag: "{serviceCategory}", label: "Category" },
    { tag: "{eventDate}", label: "Event Date" },
    { tag: "{eventTime}", label: "Call Time" },
    { tag: "{venueName}", label: "Venue" },
    { tag: "{totalAmount}", label: "Total Quote" },
    { tag: "{advanceAmount}", label: "Advance Req." },
    { tag: "{balanceDue}", label: "Balance Due" },
    { tag: "{upiId}", label: "UPI ID" },
    { tag: "{bankName}", label: "Bank" },
    { tag: "{accountNumber}", label: "Account No." },
    { tag: "{ifscCode}", label: "IFSC" },
  ];

  return (
    <div className="p-3 sm:p-5 max-w-7xl mx-auto w-full space-y-4">
      {/* 1. Header Banner */}
      <div className="bg-glam-surface/90 border border-glam-border/40 rounded-2xl md:rounded-3xl p-4 sm:p-6 backdrop-blur-md shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-glam-accent bg-glam-accent/10 border border-glam-accent/20 px-2.5 py-0.5 rounded-full">
                Configuration Hub
              </span>
              <span className="text-xs text-glam-text-muted">· Settings</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-outfit text-glam-text tracking-tight mt-1">
              Settings & Workspace Preferences
            </h1>
            <p className="text-xs text-glam-text-muted mt-0.5 max-w-2xl">
              Manage your dynamic WhatsApp quotation messages, UPI payment gateways, QR code displays, and salon profile parameters.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-glam-surface-alt border border-glam-border/40 text-xs font-semibold text-glam-text hover:text-rose-600 transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
                saveSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-linear-to-r from-glam-accent to-glam-accent-2 text-white hover:shadow-lg hover:scale-102"
              }`}
            >
              {saveSuccess ? <Check size={14} /> : <Save size={14} />}
              <span>{saveSuccess ? "Saved Successfully!" : "Save Changes"}</span>
            </button>
          </div>
        </div>

        {/* 2. Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 border-t border-glam-border/30 pt-3 overflow-x-auto">
          {[
            { id: "quotation", label: "Quotation Template", icon: MessageSquare },
            { id: "payment", label: "Payment & QR Code", icon: QrCode },
            { id: "salon", label: "Salon Profile", icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-linear-to-r from-glam-accent to-glam-accent-2 text-white shadow-xs"
                    : "bg-glam-surface-alt/60 text-glam-text-muted hover:text-glam-text hover:bg-glam-surface-alt"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 1: QUOTATION TEMPLATE
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "quotation" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Template Configuration (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-glam-surface/90 border border-glam-border/40 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-outfit text-glam-text flex items-center gap-2">
                    <MessageSquare size={16} className="text-glam-accent" />
                    Quotation Message Customizer
                  </h3>
                  <p className="text-xs text-glam-text-muted mt-0.5">
                    This template powers the WhatsApp quote dispatched automatically to every client.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-glam-text-muted font-medium">Mode:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setLocalQuotation((prev) => ({
                        ...prev,
                        useCustomTemplate: !prev.useCustomTemplate,
                      }))
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      localQuotation.useCustomTemplate
                        ? "bg-purple-500/15 border-purple-500/40 text-purple-700 dark:text-purple-300"
                        : "bg-glam-accent/15 border-glam-accent/40 text-glam-accent"
                    }`}
                  >
                    {localQuotation.useCustomTemplate ? "Raw Custom Template" : "Smart Modular Builder"}
                  </button>
                </div>
              </div>

              {/* Dynamic Variables Chips */}
              <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-glam-text-muted flex items-center gap-1">
                  <Sparkles size={11} className="text-glam-accent" />
                  Available Dynamic Variables (Click to copy)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {variableTags.map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => handleCopy(v.tag, v.tag)}
                      className="px-2 py-0.5 rounded-md bg-glam-surface border border-glam-border/40 text-[10px] font-mono font-medium text-glam-text hover:border-glam-accent/60 transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>{v.tag}</span>
                      {copiedField === v.tag ? (
                        <Check size={10} className="text-emerald-500" />
                      ) : (
                        <Copy size={10} className="text-glam-text-muted" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* SMART MODULAR BUILDER */}
              {!localQuotation.useCustomTemplate ? (
                <div className="space-y-3.5 text-xs">
                  {/* Header Title */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                      Header / Banner Title
                    </label>
                    <input
                      type="text"
                      value={localQuotation.header}
                      onChange={(e) =>
                        setLocalQuotation((prev) => ({ ...prev, header: e.target.value }))
                      }
                      className="w-full h-10 px-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt text-xs font-medium text-glam-text focus:outline-none focus:border-glam-accent"
                      placeholder="✨ *GLAMDESK — OFFICIAL BOOKING QUOTATION* ✨"
                    />
                  </div>

                  {/* Client Greeting */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                      Opening Greeting Message
                    </label>
                    <textarea
                      rows={2}
                      value={localQuotation.greeting}
                      onChange={(e) =>
                        setLocalQuotation((prev) => ({ ...prev, greeting: e.target.value }))
                      }
                      className="w-full p-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt text-xs font-medium text-glam-text focus:outline-none focus:border-glam-accent"
                    />
                  </div>

                  {/* Section Display Toggles */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                      Include Information Blocks
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { key: "showBookingId", label: "Booking Reference ID (#APT-...)" },
                        { key: "showServiceDetails", label: "Service Name & Category" },
                        { key: "showDateTime", label: "Date, Time & Duration" },
                        { key: "showVenue", label: "Venue Location & Type" },
                        { key: "showInvestmentBreakdown", label: "Investment Breakdown & Totals" },
                        { key: "showPaymentDetails", label: "UPI Advance Payment (UPI ID / QR)" },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30 cursor-pointer hover:bg-glam-surface-alt/70 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(localQuotation[item.key])}
                            onChange={(e) =>
                              setLocalQuotation((prev) => ({
                                ...prev,
                                [item.key]: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 rounded text-glam-accent focus:ring-glam-accent/30 accent-[#a67c52]"
                          />
                          <span className="text-xs font-semibold text-glam-text">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Custom Advance Notes / Instructions */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                      Custom Terms / Deposit Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={localQuotation.customNotes}
                      onChange={(e) =>
                        setLocalQuotation((prev) => ({ ...prev, customNotes: e.target.value }))
                      }
                      className="w-full p-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt text-xs font-medium text-glam-text focus:outline-none focus:border-glam-accent"
                      placeholder="e.g. Please transfer advance to lock slot..."
                    />
                  </div>

                  {/* Footer & Signature */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                      Closing Signature & Contact
                    </label>
                    <textarea
                      rows={2}
                      value={localQuotation.footer}
                      onChange={(e) =>
                        setLocalQuotation((prev) => ({ ...prev, footer: e.target.value }))
                      }
                      className="w-full p-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt text-xs font-medium text-glam-text focus:outline-none focus:border-glam-accent"
                    />
                  </div>
                </div>
              ) : (
                /* RAW TEMPLATE EDITOR */
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                      Full WhatsApp Template (Supports WhatsApp bold *text*, italics _text_, emojis)
                    </label>
                  </div>
                  <textarea
                    rows={16}
                    value={localQuotation.rawTemplate}
                    onChange={(e) =>
                      setLocalQuotation((prev) => ({ ...prev, rawTemplate: e.target.value }))
                    }
                    className="w-full p-3.5 rounded-xl border border-glam-border/50 bg-glam-surface-alt font-mono text-xs font-medium text-glam-text focus:outline-none focus:border-glam-accent leading-relaxed"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live WhatsApp Message Simulator (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-glam-surface/90 border border-glam-border/40 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xs space-y-3 sticky top-4">
              <div className="flex items-center justify-between border-b border-glam-border/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <Smartphone size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-glam-text">
                    Live WhatsApp Preview
                  </h3>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Client View
                </span>
              </div>

              {/* WhatsApp Phone Mockup Bubble */}
              <div className="rounded-2xl bg-[#efeae2] dark:bg-[#0b141a] p-3 sm:p-4 border border-[#dad6cd] dark:border-[#222e35] shadow-inner space-y-2">
                {/* Chat Bubble Header */}
                <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pb-1 border-b border-gray-300/40 dark:border-gray-800">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold">{localSalon.businessName}</span>
                  </div>
                  <span>Today</span>
                </div>

                {/* Message Content Bubble */}
                <div className="bg-white dark:bg-[#1f2c34] text-gray-800 dark:text-gray-100 rounded-xl rounded-tl-none p-3.5 text-xs shadow-xs space-y-1 font-sans leading-relaxed whitespace-pre-wrap select-text break-words border border-gray-200/50 dark:border-gray-700/50">
                  {previewMessage}
                </div>

                <div className="flex justify-end text-[10px] text-gray-500 dark:text-gray-400 gap-1 pt-0.5">
                  <span>10:30 AM</span>
                  <span className="text-emerald-500 font-bold">✓✓</span>
                </div>
              </div>

              {/* Quick Actions for Preview */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopy(previewMessage, "preview")}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-glam-surface-alt border border-glam-border/40 text-xs font-semibold text-glam-text hover:text-glam-accent transition-colors cursor-pointer"
                >
                  {copiedField === "preview" ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copiedField === "preview" ? "Copied!" : "Copy Preview Text"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
                >
                  <Save size={13} />
                  <span>Apply to Quotes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 2: PAYMENT & QR CODE MANAGEMENT
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "payment" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: UPI & Bank Config (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-glam-surface/90 border border-glam-border/40 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold font-outfit text-glam-text flex items-center gap-2">
                  <QrCode size={16} className="text-glam-accent" />
                  Payment Gateway & UPI QR Management
                </h3>
                <p className="text-xs text-glam-text-muted mt-0.5">
                  Configure the UPI ID, bank account, and QR code displayed to clients for advance and balance collections.
                </p>
              </div>

              {/* QR Code Mode Selector */}
              <div className="p-3.5 rounded-2xl bg-glam-surface-alt/40 border border-glam-border/40 space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted block">
                  QR Code Generation Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setLocalPayment((prev) => ({ ...prev, qrMode: "dynamic" }))}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      localPayment.qrMode === "dynamic"
                        ? "bg-glam-accent/15 border-glam-accent text-glam-accent shadow-xs"
                        : "bg-glam-surface border-glam-border/40 text-glam-text hover:bg-glam-surface-alt"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Sparkles size={14} />
                      <span>Dynamic Live UPI QR (Recommended)</span>
                    </div>
                    <p className="text-[11px] text-glam-text-muted mt-1 leading-normal">
                      Automatically generates a QR code with the exact appointment amount for seamless 1-tap customer payments.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalPayment((prev) => ({ ...prev, qrMode: "custom" }))}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      localPayment.qrMode === "custom"
                        ? "bg-glam-accent/15 border-glam-accent text-glam-accent shadow-xs"
                        : "bg-glam-surface border-glam-border/40 text-glam-text hover:bg-glam-surface-alt"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Upload size={14} />
                      <span>Custom Physical QR Poster</span>
                    </div>
                    <p className="text-[11px] text-glam-text-muted mt-1 leading-normal">
                      Upload your salon&apos;s physical Google Pay / PhonePe QR standee or merchant poster image.
                    </p>
                  </button>
                </div>

                {/* Upload Section if Custom QR Mode */}
                {localPayment.qrMode === "custom" && (
                  <div className="pt-2 border-t border-glam-border/30 space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted block">
                      Upload Merchant QR Image
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer">
                        <Upload size={14} />
                        <span>Choose Image File...</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrUpload}
                          className="hidden"
                        />
                      </label>

                      {localPayment.customQrImage && (
                        <button
                          type="button"
                          onClick={() =>
                            setLocalPayment((prev) => ({
                              ...prev,
                              customQrImage: "",
                              qrMode: "dynamic",
                            }))
                          }
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    {localPayment.customQrImage && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Custom merchant QR image uploaded and active.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* UPI & Bank Credentials Form */}
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                      UPI ID (VPA) *
                    </label>
                    <input
                      type="text"
                      value={localPayment.upiId}
                      onChange={(e) =>
                        setLocalPayment((prev) => ({ ...prev, upiId: e.target.value }))
                      }
                      className="w-full h-10 px-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt font-mono text-xs font-semibold text-glam-text focus:outline-none focus:border-glam-accent"
                      placeholder="e.g. yourbusiness@okhdfcbank"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                      Payee Display Name *
                    </label>
                    <input
                      type="text"
                      value={localPayment.payeeName}
                      onChange={(e) =>
                        setLocalPayment((prev) => ({ ...prev, payeeName: e.target.value }))
                      }
                      className="w-full h-10 px-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt text-xs font-semibold text-glam-text focus:outline-none focus:border-glam-accent"
                      placeholder="e.g. GlamDesk"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={localPayment.bankName}
                      onChange={(e) =>
                        setLocalPayment((prev) => ({ ...prev, bankName: e.target.value }))
                      }
                      className="w-full h-10 px-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt text-xs font-semibold text-glam-text focus:outline-none focus:border-glam-accent"
                      placeholder="HDFC Bank"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={localPayment.accountName}
                      onChange={(e) =>
                        setLocalPayment((prev) => ({ ...prev, accountName: e.target.value }))
                      }
                      className="w-full h-10 px-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt text-xs font-semibold text-glam-text focus:outline-none focus:border-glam-accent"
                      placeholder="GlamDesk Atelier Pvt Ltd"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={localPayment.accountNumber}
                      onChange={(e) =>
                        setLocalPayment((prev) => ({ ...prev, accountNumber: e.target.value }))
                      }
                      className="w-full h-10 px-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt font-mono text-xs font-semibold text-glam-text focus:outline-none focus:border-glam-accent"
                      placeholder="50200084920193"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={localPayment.ifscCode}
                      onChange={(e) =>
                        setLocalPayment((prev) => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))
                      }
                      className="w-full h-10 px-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt font-mono text-xs font-semibold text-glam-text focus:outline-none focus:border-glam-accent uppercase"
                      placeholder="HDFC0001234"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                    Bank Branch Name / City
                  </label>
                  <input
                    type="text"
                    value={localPayment.branchName}
                    onChange={(e) =>
                      setLocalPayment((prev) => ({ ...prev, branchName: e.target.value }))
                    }
                    className="w-full h-10 px-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt text-xs font-semibold text-glam-text focus:outline-none focus:border-glam-accent"
                    placeholder="Egmore, Chennai"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                    Payment Instructions for Client
                  </label>
                  <textarea
                    rows={2}
                    value={localPayment.paymentInstructions}
                    onChange={(e) =>
                      setLocalPayment((prev) => ({ ...prev, paymentInstructions: e.target.value }))
                    }
                    className="w-full p-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt text-xs font-medium text-glam-text focus:outline-none focus:border-glam-accent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Payment QR Scanner Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-glam-surface/90 border border-glam-border/40 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xs space-y-4 sticky top-4">
              <div className="flex items-center justify-between border-b border-glam-border/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <QrCode size={16} className="text-glam-accent" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-glam-text">
                    Live Client Checkout QR Card
                  </h3>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-glam-accent/10 text-glam-accent">
                  {localPayment.qrMode === "custom" ? "Custom Image" : "Live UPI"}
                </span>
              </div>

              {/* Amount Tester */}
              <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-glam-text-muted block">
                  Simulate Appointment Payment (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-glam-text-muted">₹</span>
                  <input
                    type="number"
                    value={testAmount}
                    onChange={(e) => setTestAmount(Number(e.target.value) || 0)}
                    className="w-full h-8 pl-6 pr-3 rounded-lg border border-glam-border/40 bg-glam-surface text-xs font-bold font-outfit text-glam-text focus:outline-none focus:border-glam-accent"
                  />
                </div>
              </div>

              {/* The Actual Luxury Payment Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-glam-surface via-glam-surface-alt to-glam-surface border border-glam-border/60 shadow-lg text-center space-y-3">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-glam-text">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>Verified Atelier Payment</span>
                </div>

                {/* QR Code Frame */}
                <div className="inline-block p-3 rounded-2xl bg-white shadow-md border border-gray-200">
                  <img
                    src={
                      localPayment.qrMode === "custom" && localPayment.customQrImage
                        ? localPayment.customQrImage
                        : `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
                            `upi://pay?pa=${localPayment.upiId || "glamdesk@okhdfcbank"}&pn=${encodeURIComponent(
                              localPayment.payeeName || "GlamDesk Atelier"
                            )}&am=${testAmount}&cu=INR&tn=Booking_APT-DEMO`
                          )}`
                    }
                    alt="Payment QR Code"
                    className="w-44 h-44 sm:w-48 sm:h-48 object-contain mx-auto rounded-lg"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-glam-text-muted block">Amount to Pay</span>
                  <span className="text-2xl font-bold font-outfit text-glam-text block">
                    ₹{testAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* UPI ID Pill with Copy */}
                <div className="inline-flex items-center justify-between gap-2 p-1.5 pl-3 pr-2 rounded-xl bg-glam-surface border border-glam-border/40 text-xs font-mono max-w-full">
                  <span className="truncate text-glam-text font-bold">
                    {localPayment.upiId || "glamdesk@okhdfcbank"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(localPayment.upiId, "upiId")}
                    className="p-1 rounded-lg bg-glam-accent/10 text-glam-accent hover:bg-glam-accent/20 transition-colors cursor-pointer"
                    title="Copy UPI ID"
                  >
                    {copiedField === "upiId" ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>

                {/* Accepted Payment Apps */}
                <div className="pt-2 border-t border-glam-border/30 flex items-center justify-center gap-3 text-[11px] text-glam-text-muted font-medium">
                  <span>Google Pay</span> · <span>PhonePe</span> · <span>Paytm</span> · <span>BHIM</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Save size={14} />
                <span>Save Payment Gateway Details</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 3: SALON PROFILE
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "salon" && (
        <div className="max-w-3xl space-y-4">
          <div className="bg-glam-surface/90 border border-glam-border/40 rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold font-outfit text-glam-text flex items-center gap-2">
                <Building2 size={16} className="text-glam-accent" />
                Salon & Atelier Identity
              </h3>
              <p className="text-xs text-glam-text-muted mt-0.5">
                These branding details are incorporated across all official invoices, client receipts, and quotation headers.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                    Brand / Salon Name
                  </label>
                  <input
                    type="text"
                    value={localSalon.businessName}
                    onChange={(e) =>
                      setLocalSalon((prev) => ({ ...prev, businessName: e.target.value }))
                    }
                    className="w-full h-10 px-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt text-xs font-semibold text-glam-text focus:outline-none focus:border-glam-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={localSalon.tagline}
                    onChange={(e) =>
                      setLocalSalon((prev) => ({ ...prev, tagline: e.target.value }))
                    }
                    className="w-full h-10 px-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt text-xs font-semibold text-glam-text focus:outline-none focus:border-glam-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                    Official WhatsApp / Contact Phone
                  </label>
                  <input
                    type="text"
                    value={localSalon.phone}
                    onChange={(e) =>
                      setLocalSalon((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full h-10 px-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt text-xs font-semibold text-glam-text focus:outline-none focus:border-glam-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={localSalon.email}
                    onChange={(e) =>
                      setLocalSalon((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full h-10 px-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt text-xs font-semibold text-glam-text focus:outline-none focus:border-glam-accent"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                  Studio Address
                </label>
                <input
                  type="text"
                  value={localSalon.address}
                  onChange={(e) =>
                    setLocalSalon((prev) => ({ ...prev, address: e.target.value }))
                  }
                  className="w-full h-10 px-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt text-xs font-semibold text-glam-text focus:outline-none focus:border-glam-accent"
                />
              </div>

              {/* Default Advance Percentage */}
              <div className="p-3.5 rounded-2xl bg-glam-surface-alt/40 border border-glam-border/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-glam-text block">
                      Default Advance Deposit Required
                    </label>
                    <p className="text-[11px] text-glam-text-muted">
                      When a new booking is created, calculate advance as this percentage of total quote.
                    </p>
                  </div>
                  <span className="text-base font-bold font-outfit text-glam-accent px-3 py-1 rounded-xl bg-glam-accent/15 border border-glam-accent/30">
                    {localSalon.defaultAdvancePercent || 40}%
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={localSalon.defaultAdvancePercent || 40}
                  onChange={(e) =>
                    setLocalSalon((prev) => ({
                      ...prev,
                      defaultAdvancePercent: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-[#a67c52] cursor-pointer"
                />

                <div className="flex justify-between text-[10px] font-mono text-glam-text-muted">
                  <span>10% (Low token)</span>
                  <span>40% (Standard)</span>
                  <span>100% (Full payment upfront)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-glam-border/30 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Save size={14} />
                <span>Save Profile Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
