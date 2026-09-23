import { useState, useMemo, useEffect } from "react";
import {
  X,
  MessageSquare,
  Copy,
  Check,
  Download,
  Loader2,
  Sparkles,
  Send,
  FileCheck,
} from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import QuotationPDFTemplate from "./QuotationPDFTemplate";
import { downloadPdfFromElement } from "../../utils/pdfExport";

/**
 * SendQuoteModal - 2-Column Split Modal:
 * - Left Side: Dynamic WhatsApp message, advance deposit adjuster & 1-click send actions.
 * - Right Side: Real-time live preview of the luxury official A4 quotation PDF.
 */
const SendQuoteModal = ({ isOpen, onClose, appointment, onQuoteSent }) => {
  const { settings, generateQuotationMessage, getUpiPaymentUrl } = useSettings();

  if (!isOpen || !appointment) return null;

  const totalAmount = Number(appointment.totalAmount) || 0;
  const defaultAdvancePercent = settings?.salon?.defaultAdvancePercent || 40;
  const defaultAdvance =
    appointment.advancePaid > 0
      ? appointment.advancePaid
      : Math.round(totalAmount * (defaultAdvancePercent / 100));

  const [advanceAmount, setAdvanceAmount] = useState(defaultAdvance);
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const cleanPhone = (appointment.clientPhone || "").replace(/[^0-9]/g, "");
  const balanceDue = Math.max(0, totalAmount - advanceAmount);

  // Generate dynamic quotation message from saved Settings template
  const dynamicMessage = useMemo(() => {
    return generateQuotationMessage({
      ...appointment,
      advanceRequired: advanceAmount,
      balanceDue,
    });
  }, [appointment, advanceAmount, balanceDue, generateQuotationMessage]);

  const [customMessage, setCustomMessage] = useState(dynamicMessage);

  // Keep message in sync whenever advance amount changes
  useEffect(() => {
    setCustomMessage(
      generateQuotationMessage({
        ...appointment,
        advanceRequired: advanceAmount,
        balanceDue,
      })
    );
  }, [advanceAmount, balanceDue, appointment, generateQuotationMessage]);

  const upiDetails = getUpiPaymentUrl(advanceAmount, appointment.code);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download PDF utility
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    const filename = `GlamDesk_Quotation_${appointment.code || "Booking"}.pdf`;
    await downloadPdfFromElement("printable-quote-template", filename);
    setIsGeneratingPdf(false);
    setPdfSuccess(true);
    setTimeout(() => setPdfSuccess(false), 2500);
  };

  // Primary Action: Download PDF & open WhatsApp with dynamic message
  const handleSendViaWhatsApp = async () => {
    // 1. Download the quotation PDF file
    await handleDownloadPdf();

    // 2. Open WhatsApp with the dynamic message
    if (cleanPhone) {
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        customMessage
      )}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }

    // 3. Mark quotation as sent in appointment record
    if (onQuoteSent) {
      onQuoteSent({
        status: "Quote Sent",
        quoteSent: true,
        quoteSentAt: new Date().toISOString(),
        advanceRequired: advanceAmount,
        balanceDue: balanceDue,
        lastQuoteText: customMessage,
        quoteFormat: "PDF + WhatsApp",
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-glam-surface border border-glam-border/60 shadow-2xl overflow-hidden"
      >
        {/* ── Top Header Bar ── */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-glam-border/40 bg-glam-surface shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-glam-accent/15 text-glam-accent flex items-center justify-center shrink-0">
              <Sparkles size={17} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold font-outfit text-glam-text truncate">
                  Send Booking Quotation
                </h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-glam-surface-alt border border-glam-border/50 text-glam-text">
                  #{appointment.code}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  PDF & WhatsApp
                </span>
              </div>
              <p className="text-xs text-glam-text-muted truncate mt-0.5">
                Client: <span className="font-semibold text-glam-text">{appointment.clientName}</span> ({appointment.clientPhone})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-glam-surface-alt text-glam-text-muted hover:text-glam-text flex items-center justify-center transition-colors cursor-pointer ml-2"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── 2-Column Split Body ── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* ════ LEFT COLUMN: Message, Advance Selector & Actions (5 cols) ════ */}
          <div className="lg:col-span-5 flex flex-col border-b lg:border-b-0 lg:border-r border-glam-border/40 bg-glam-surface min-h-0">
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
              {/* Advance & Financial Summary Card */}
              <div className="p-3.5 rounded-2xl bg-glam-surface-alt/40 border border-glam-border/40 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-glam-text-muted font-medium">
                    Total Quotation:
                  </span>
                  <span className="font-bold font-outfit text-glam-text text-sm">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="pt-2 border-t border-glam-border/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-glam-text-muted block">
                      Advance to Confirm
                    </span>
                    <span className="font-bold font-outfit text-glam-accent text-sm">
                      ₹{advanceAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Percentage Quick Adjust Pills */}
                  <div className="flex items-center gap-1">
                    {[25, 40, 50].map((pct) => {
                      const target = Math.round(totalAmount * (pct / 100));
                      const isSelected = advanceAmount === target;
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setAdvanceAmount(target)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-glam-accent text-white shadow-2xs"
                              : "bg-glam-surface hover:bg-glam-surface-alt text-glam-text-muted hover:text-glam-text border border-glam-border/40"
                          }`}
                        >
                          {pct}%
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-glam-text-muted pt-0.5">
                  <span>Balance at Event:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    ₹{balanceDue.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* WhatsApp Message Editor */}
              <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-glam-text uppercase tracking-wider">
                      WhatsApp Message
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-glam-accent hover:text-glam-accent-2 cursor-pointer transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-emerald-500" />
                        <span className="text-emerald-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-glam-text-muted">
                  Personalized greeting with appointment details (attached with PDF):
                </p>

                <textarea
                  rows={9}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt/50 font-mono text-[11px] text-glam-text leading-relaxed focus:outline-none focus:border-glam-accent transition-colors resize-none"
                  placeholder="Quotation message..."
                />
              </div>
            </div>

            {/* Left Column Bottom Actions */}
            <div className="p-4 sm:p-5 border-t border-glam-border/40 bg-glam-surface-alt/30 space-y-2 shrink-0">
              <button
                type="button"
                onClick={handleSendViaWhatsApp}
                disabled={isGeneratingPdf}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                <span>Send PDF & Message via WhatsApp</span>
              </button>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-glam-border/60 hover:bg-glam-surface-alt text-glam-text text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingPdf ? (
                    <Loader2 size={13} className="animate-spin text-glam-accent" />
                  ) : pdfSuccess ? (
                    <Check size={13} className="text-emerald-500" />
                  ) : (
                    <Download size={13} />
                  )}
                  <span>{pdfSuccess ? "Downloaded" : "Download PDF Only"}</span>
                </button>

                <span className="text-[10px] text-glam-text-muted flex items-center gap-1">
                  <FileCheck size={11} className="text-emerald-500" />
                  <span>Client-ready A4 PDF</span>
                </span>
              </div>
            </div>
          </div>

          {/* ════ RIGHT COLUMN: Live Luxury Quotation PDF Preview (7 cols) ════ */}
          <div className="lg:col-span-7 flex flex-col bg-[#ede9e2] dark:bg-zinc-950/70 min-h-0 border-t lg:border-t-0">
            {/* Live Artboard Sub-header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-glam-border/30 bg-glam-surface/60 backdrop-blur-xs text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold font-outfit uppercase tracking-wider text-[11px] text-glam-text">
                  Live Quotation Preview
                </span>
                <span className="text-[10px] text-glam-text-muted hidden sm:inline">
                  (Standard A4 Luxury Format)
                </span>
              </div>

              <span className="text-[10px] font-mono text-glam-text-muted font-medium">
                GlamDesk_Quotation_{appointment.code}.pdf
              </span>
            </div>

            {/* Scrollable Artboard containing the actual Quotation Document */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex justify-center scrollbar-thin">
              <div className="w-full max-w-[560px] bg-white shadow-2xl rounded-lg overflow-hidden border border-black/10 self-start">
                <QuotationPDFTemplate
                  appointment={appointment}
                  settings={settings}
                  advanceAmount={advanceAmount}
                  balanceDue={balanceDue}
                  upiDetails={upiDetails}
                  documentId="printable-quote-template"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendQuoteModal;
