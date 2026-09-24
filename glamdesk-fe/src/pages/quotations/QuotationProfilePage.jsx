import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Send,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  ArrowUpRight,
  IndianRupee,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  ShieldCheck,
  CreditCard,
  Building2,
  MapPin,
  User,
  Phone,
  Mail,
  Loader2,
  FileCheck,
  Percent,
  Eye,
  Tag,
  Share2,
} from "lucide-react";
import { useQuotations } from "../../context/QuotationContext";
import { useAppointments } from "../../context/AppointmentContext";
import { useClients } from "../../context/ClientContext";
import { useSettings } from "../../context/SettingsContext";
import { lossReasons, getConsolidatedClientItems } from "../../data/quotationData";
import Modal from "../../components/modals/Modal";
import { Input, ThemeSelect } from "../../components/common/form";
import QuotationPDFTemplate from "./QuotationPDFTemplate";
import { downloadPdfFromElement, printElement } from "../../utils/pdfExport";

// ─── Status Config ────────────────────────────────────────────────────────────
const statusConfig = {
  Draft: {
    textColor: "text-slate-700 dark:text-slate-300",
    bgLight: "bg-slate-500/10",
    border: "border-slate-500/20",
    dot: "bg-slate-400",
    icon: FileText,
  },
  Sent: {
    textColor: "text-sky-700 dark:text-sky-300",
    bgLight: "bg-sky-500/10",
    border: "border-sky-500/20",
    dot: "bg-sky-500",
    icon: Send,
  },
  "Under Revision": {
    textColor: "text-amber-700 dark:text-amber-300",
    bgLight: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
    icon: Pencil,
  },
  Won: {
    textColor: "text-emerald-700 dark:text-emerald-300",
    bgLight: "bg-emerald-500/15",
    border: "border-emerald-500/25",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  Lost: {
    textColor: "text-rose-700 dark:text-rose-300",
    bgLight: "bg-rose-500/10",
    border: "border-rose-500/20",
    dot: "bg-rose-500",
    icon: XCircle,
  },
  Expired: {
    textColor: "text-zinc-700 dark:text-zinc-300",
    bgLight: "bg-zinc-500/15",
    border: "border-zinc-500/25",
    dot: "bg-zinc-400",
    icon: Clock,
  },
};

// ─── Stepper Steps Definition ────────────────────────────────────────────────
const WORKFLOW_STEPS = [
  { id: "Draft", label: "Draft" },
  { id: "Sent", label: "Quote Sent" },
  { id: "Negotiation", label: "Negotiation" },
  { id: "Won", label: "Won" },
];

// ─── Date Formatter Helper ────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1] || m} ${y}`;
  } catch {
    return dateStr;
  }
};

// ─── PDF Document Preview Modal ───────────────────────────────────────────────
const PDFPreviewModal = ({
  isOpen,
  onClose,
  quote,
  settings,
  onDownload,
  onPrint,
  isGeneratingPdf,
  pdfSuccess,
}) => {
  if (!isOpen || !quote) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <Modal.Header
        title={`Quotation PDF Document · #${quote.code}`}
        icon={FileText}
        onClose={onClose}
      >
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#a67c52]/10 text-[#a67c52] border border-[#a67c52]/25">
            Official Client Proposal
          </span>
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-glam-border/60 bg-glam-surface text-[11px] font-semibold text-glam-text hover:bg-glam-surface-alt transition-colors cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer size={13} />
            <span>Print</span>
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-glam-accent text-white text-[11px] font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
            title="Download PDF"
          >
            {isGeneratingPdf ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Download size={13} />
            )}
            <span>{pdfSuccess ? "Downloaded" : "Download PDF"}</span>
          </button>
        </div>
      </Modal.Header>
      <Modal.Body className="p-4 sm:p-6 bg-[#ede9e2] dark:bg-zinc-950/70 max-h-[80vh] overflow-y-auto flex justify-center">
        <div className="w-full max-w-[580px] bg-white shadow-2xl rounded-lg overflow-hidden border border-black/10 self-start text-[#1a1a1a]">
          <QuotationPDFTemplate
            quote={quote}
            settings={settings}
            documentId="modal-printable-quote-template"
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

// ─── Revise Quote Modal ───────────────────────────────────────────────────────
const ReviseQuoteModal = ({ isOpen, onClose, quote, onSave }) => {
  const [items, setItems] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountNotes, setDiscountNotes] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (quote) {
      setItems(getConsolidatedClientItems(quote));
      setDiscountAmount(quote.discountAmount || 0);
      setDiscountNotes(quote.discountNotes || "");
      setNotes(`Revision ${(quote.revision || 1) + 1}: Client requested package update.`);
    }
  }, [quote, isOpen]);

  if (!isOpen || !quote) return null;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: `item-${Date.now()}`, description: "", amount: 0, qty: 1 },
    ]);
  };

  const handleItemChange = (idx, field, val) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleRemoveItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.amount) || 0) * (Number(item.qty) || 1),
    0
  );
  const totalAmount = Math.max(0, subtotal - (Number(discountAmount) || 0));
  const advanceRequired = Math.round(totalAmount * 0.4);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      items: items.filter((it) => it.description.trim()),
      discountAmount: Number(discountAmount) || 0,
      discountNotes,
      notes,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      <Modal.Header
        title={`Revise Quotation #${quote.code} (v${(quote.revision || 1) + 1})`}
        icon={Pencil}
        onClose={onClose}
      />
      <Modal.Body className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <form id="profile-revise-form" onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-glam-text-muted">
              Service Items & Quantities
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-glam-accent hover:underline font-bold text-xs cursor-pointer"
            >
              + Add Line Item
            </button>
          </div>

          <div className="space-y-2">
            {items.map((it, idx) => (
              <div
                key={it.id || idx}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30"
              >
                <input
                  type="text"
                  required
                  placeholder="Service description"
                  className="flex-1 bg-transparent text-xs text-glam-text focus:outline-hidden"
                  value={it.description}
                  onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                />
                <div className="flex items-center gap-1 w-24 shrink-0">
                  <span className="text-[11px] text-glam-text-muted">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full bg-transparent text-xs font-bold text-glam-text focus:outline-hidden"
                    value={it.amount}
                    onChange={(e) => handleItemChange(idx, "amount", e.target.value)}
                  />
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-glam-text-muted hover:text-rose-500 p-1 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Input
              label="Negotiated Discount (₹)"
              type="number"
              min="0"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
            />
            <Input
              label="Discount Reason"
              value={discountNotes}
              onChange={(e) => setDiscountNotes(e.target.value)}
            />
          </div>

          <Input
            label="Revision Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="p-3.5 rounded-xl bg-glam-surface-alt/60 border border-glam-border/40 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-glam-text-muted text-[10px] uppercase font-bold">Subtotal</p>
              <p className="font-bold text-glam-text mt-0.5">₹{subtotal.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-glam-text-muted text-[10px] uppercase font-bold">New Total</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                ₹{totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-glam-accent text-[10px] uppercase font-bold">New 40% Deposit</p>
              <p className="font-bold text-glam-accent mt-0.5">
                ₹{advanceRequired.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-10 rounded-xl border border-glam-border/50 text-xs font-semibold text-glam-text hover:bg-glam-surface-alt/60 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="profile-revise-form"
          className="flex-1 h-10 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white font-bold text-xs shadow-md hover:opacity-95 cursor-pointer"
        >
          Save & Issue Revision v{(quote.revision || 1) + 1}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Record Advance (Won) Modal ───────────────────────────────────────────────
const RecordAdvanceModal = ({ isOpen, onClose, quote, onConfirm }) => {
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentRef, setPaymentRef] = useState("");

  useEffect(() => {
    if (quote) {
      setAdvanceAmount(quote.advanceRequired || Math.round(quote.totalAmount * 0.4));
      setPaymentRef(`UPI-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [quote, isOpen]);

  if (!isOpen || !quote) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      advancePaid: Number(advanceAmount) || 0,
      paymentMethod,
      paymentRef,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <Modal.Header title="Approve Quote & Record Advance" icon={CheckCircle2} onClose={onClose} />
      <Modal.Body className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
          <p className="font-bold flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>Lead Conversion Automation</span>
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-glam-text-muted">
            Recording this advance deposit marks quotation <strong>#{quote.code}</strong> as <strong>Won</strong>, sets the linked booking to <strong>Confirmed</strong>, and officially registers <strong>{quote.clientName}</strong> in Client Master.
          </p>
        </div>

        <form id="profile-record-advance-form" onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Advance Deposit Received (₹)"
            type="number"
            required
            min="1"
            icon={IndianRupee}
            value={advanceAmount}
            onChange={(e) => setAdvanceAmount(e.target.value)}
          />

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted mb-1 block">
              Payment Method
            </label>
            <ThemeSelect
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={[
                { value: "UPI", label: "📱 UPI (Google Pay / PhonePe / Paytm)" },
                { value: "Bank Transfer", label: "🏦 NEFT / IMPS Bank Transfer" },
                { value: "Card", label: "💳 Debit / Credit Card" },
                { value: "Cash", label: "💵 Direct Cash Deposit" },
              ]}
              triggerClassName="h-10 rounded-xl border-glam-border/60 bg-glam-surface-alt text-xs"
            />
          </div>

          <Input
            label="Transaction Reference / UPI Ref ID"
            required
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
          />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-10 rounded-xl border border-glam-border/50 text-xs font-semibold text-glam-text hover:bg-glam-surface-alt/60 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="profile-record-advance-form"
          className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
        >
          Confirm & Win Lead
        </button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Mark Quote Lost Modal ────────────────────────────────────────────────────
const MarkLostModal = ({ isOpen, onClose, quote, onConfirm }) => {
  const [reason, setReason] = useState(lossReasons[0]);

  if (!isOpen || !quote) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm">
      <Modal.Header title="Mark Quotation as Lost" icon={XCircle} onClose={onClose} />
      <Modal.Body className="space-y-3">
        <p className="text-xs text-glam-text-muted leading-relaxed">
          Marking quotation <strong className="text-glam-text">#{quote.code}</strong> as Lost will close the inquiry and update the linked booking to <strong className="text-rose-600">Rejected</strong>, freeing the artist calendar slot.
        </p>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted mb-1 block">
            Reason for Loss
          </label>
          <ThemeSelect
            value={reason}
            onChange={setReason}
            options={lossReasons.map((r) => ({ value: r, label: r }))}
            triggerClassName="h-10 rounded-xl border-glam-border/60 bg-glam-surface-alt text-xs"
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-10 rounded-xl border border-glam-border/50 text-xs font-semibold text-glam-text hover:bg-glam-surface-alt/60 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onConfirm(reason)}
          className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
        >
          Mark as Lost
        </button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
const DeleteQuoteModal = ({ isOpen, onClose, quote, onConfirm }) => {
  if (!isOpen || !quote) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm">
      <Modal.Header title="Delete Quotation" icon={Trash2} onClose={onClose} />
      <Modal.Body className="space-y-3">
        <p className="text-xs text-glam-text-muted leading-relaxed">
          Are you sure you want to permanently delete quotation{" "}
          <strong className="text-glam-text">#{quote.code}</strong> for{" "}
          <strong className="text-glam-text">{quote.clientName}</strong>? This action cannot be undone.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-10 rounded-xl border border-glam-border/50 text-xs font-semibold text-glam-text hover:bg-glam-surface-alt/60 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
        >
          Delete Permanently
        </button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Main Quotation Profile Page Component ────────────────────────────────────
const QuotationProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    getQuotationById,
    reviseQuotation,
    sendQuotation,
    markQuotationWon,
    markQuotationLost,
    deleteQuotation,
  } = useQuotations();

  const { getAppointmentById } = useAppointments();
  const { getClientByPhone } = useClients();
  const { settings } = useSettings();

  const quote = getQuotationById(id);
  const linkedAppointment = quote?.appointmentId
    ? getAppointmentById(quote.appointmentId) || getAppointmentById(quote.appointmentCode)
    : null;
  const registeredClient = quote ? getClientByPhone(quote.clientPhone) : null;

  // Local Modal States
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
  const [isWonModalOpen, setIsWonModalOpen] = useState(false);
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // PDF & Message States
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  const cleanPhone = (quote?.clientPhone || "").replace(/[^0-9]/g, "");

  // Build dynamic proposal text with services, pricing, and total amount
  useEffect(() => {
    if (quote) {
      const salonName = settings?.salon?.businessName || "GlamDesk Atelier";
      const upiId = settings?.payment?.upiId || "glamdesk@okhdfcbank";
      const clientItems = getConsolidatedClientItems(quote);
      const itemsList = clientItems
        .map(
          (it) =>
            `• *${it.description}*${Number(it.qty) > 1 ? ` (×${it.qty})` : ""}: ₹${(Number(it.amount) || 0).toLocaleString("en-IN")}`
        )
        .join("\n");
      const discountLine =
        quote.discountAmount > 0
          ? `🏷️ *Discount (${quote.discountNotes || "Applied"}):* -₹${Number(
              quote.discountAmount
            ).toLocaleString("en-IN")}\n`
          : "";

      const msg = `🌟 *${salonName} — Official Quotation #${quote.code}* (v${
        quote.revision || 1
      })
Dear *${quote.clientName}*,

Thank you for choosing ${salonName} for your upcoming *${
        quote.serviceName
      }* on *${formatDate(quote.eventDate)}*!

📋 *Services & Pricing Breakdown:*
${itemsList}
${discountLine}💎 *Total Amount:* ₹${(
        quote.totalAmount || 0
      ).toLocaleString("en-IN")}
💳 *Booking Advance (40% to lock date):* ₹${(
        quote.advanceRequired || 0
      ).toLocaleString("en-IN")}
🏦 *UPI ID:* ${upiId}

📄 *Official Quotation PDF with Payment QR Code is attached.*
Kindly scan the dynamic QR code on the proposal or transfer to ${upiId} to confirm your date!

⏰ *Validity:* This quote is valid until *${formatDate(
        quote.validUntil
      )}*.

Warm regards,
*Concierge Team | ${salonName}*`;

      setCustomMessage(msg);
    }
  }, [quote, settings]);

  if (!quote) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center p-12 bg-glam-surface border border-glam-border/40 rounded-3xl text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-medium font-outfit text-glam-text">
            Quotation Not Found
          </h2>
          <p className="text-xs text-glam-text-muted mt-1.5 max-w-sm">
            The quotation proposal you are looking for does not exist or has been removed.
          </p>
          <button
            type="button"
            onClick={() => navigate("/quotations")}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white text-xs font-medium shadow-xs hover:opacity-95 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Quotations</span>
          </button>
        </div>
      </div>
    );
  }

  const sc = statusConfig[quote.status] || statusConfig.Draft;
  const StatusIcon = sc.icon;

  const handleCopyText = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    const filename = `GlamDesk_Quotation_${quote.code || "Proposal"}.pdf`;
    await downloadPdfFromElement("profile-printable-quote-template", filename);
    setIsGeneratingPdf(false);
    setPdfSuccess(true);
    setTimeout(() => setPdfSuccess(false), 2500);
  };

  const handlePrintPdf = () => {
    printElement(
      "profile-printable-quote-template",
      `GlamDesk_Quotation_${quote.code}`
    );
  };

  // Primary Hero Action: Send Quote (PDF Download + WhatsApp Dispatch + Status Update)
  const handleSendQuote = async () => {
    await handleDownloadPdf();

    if (cleanPhone) {
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        customMessage
      )}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }

    sendQuotation(quote.id);
  };

  const handleSaveRevise = (data) => {
    reviseQuotation(quote.id, data);
    setIsReviseModalOpen(false);
  };

  const handleConfirmWon = (data) => {
    markQuotationWon(quote.id, data);
    setIsWonModalOpen(false);
  };

  const handleConfirmLost = (reason) => {
    markQuotationLost(quote.id, reason);
    setIsLostModalOpen(false);
  };

  const handleDelete = () => {
    deleteQuotation(quote.id);
    setIsDeleteModalOpen(false);
    navigate("/quotations");
  };

  const salon = settings?.salon || {};
  const payment = settings?.payment || {};

  // Compute active step index for horizontal pipeline stepper
  // Workflow: 0: Draft, 1: Sent, 2: Negotiation, 3: Won
  const currentStep = useMemo(() => {
    if (quote.status === "Won") return 3;
    if (quote.status === "Under Revision" || (quote.revision && quote.revision > 1)) return 2;
    if (quote.status === "Sent") return 1;
    return 0; // Draft
  }, [quote.status, quote.revision]);

  const clientFacingItems = useMemo(
    () => getConsolidatedClientItems(quote),
    [quote]
  );

  return (
    <div className="p-3 sm:p-5 max-w-7xl mx-auto w-full space-y-4">
      {/* ════ 1. TOP HEADER & ACTION PILLS (Reference Pattern) ════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/quotations"
            className="w-10 h-10 rounded-xl border border-glam-border/60 bg-glam-surface hover:bg-glam-surface-alt flex items-center justify-center text-glam-text hover:text-glam-accent transition-colors shadow-2xs shrink-0"
            title="Back to Quotations"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-outfit text-glam-text tracking-tight leading-tight">
              Quotation Proposal
            </h1>
            <p className="text-xs text-glam-text-muted">
              Quotations — #{quote.code} {quote.revision > 1 ? `(v${quote.revision})` : ""}
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Primary Action Pill */}
          <button
            type="button"
            onClick={handleSendQuote}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
            title="Download official PDF, open WhatsApp companion note, and mark as Sent"
          >
            {isGeneratingPdf ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
            <span>Send Quote</span>
          </button>

          {/* Secondary Action Pills */}
          {quote.status !== "Won" && quote.status !== "Lost" && (
            <>
              <button
                type="button"
                onClick={() => setIsWonModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors cursor-pointer"
                title="Approve quote & record advance"
              >
                <CheckCircle2 size={13} />
                <span>Win Lead</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReviseModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-glam-border/60 bg-glam-surface text-glam-text hover:text-glam-accent hover:bg-glam-surface-alt text-xs font-semibold transition-colors cursor-pointer"
              >
                <Pencil size={13} />
                <span>Revise</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLostModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                <XCircle size={13} />
                <span>Mark Lost</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-glam-border/40 text-glam-text-muted hover:text-rose-600 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer"
            title="Delete quotation"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* ════ 2. MAIN LEAD HERO CARD WITH HORIZONTAL PIPELINE STEPPER ════ */}
      <div className="bg-glam-surface border border-glam-border/50 rounded-2xl md:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${sc.bgLight} ${sc.textColor} ${sc.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                <span>{quote.status}</span>
              </span>
              <span className="text-xs text-glam-text-muted font-medium">
                Proposal ID: <strong className="font-mono text-glam-text">#{quote.code}</strong>
              </span>
              {quote.revision > 1 && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  Revision v{quote.revision}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-outfit text-glam-text mt-2 tracking-tight">
              {quote.clientName}
            </h2>

            <div className="flex items-center gap-3 text-xs text-glam-text-muted mt-1 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-glam-text uppercase tracking-wider">
                <MapPin size={12} className="text-glam-accent" />
                <span>{quote.venueName || "Studio Session"}</span>
              </span>
              <span>·</span>
              <span className="font-medium text-glam-accent">
                {quote.serviceName}
              </span>
            </div>
          </div>

          {/* Top Right Action & Linked Lead (Reference Pattern) */}
          <div className="flex items-center gap-2 self-start shrink-0">
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-glam-border/60 bg-glam-surface hover:bg-glam-surface-alt text-xs font-semibold text-glam-text hover:text-glam-accent transition-colors shadow-2xs cursor-pointer"
              title="Preview official PDF proposal"
            >
              <FileText size={13} className="text-glam-accent" />
              <span>Quote</span>
            </button>

            {quote.appointmentCode && (
              <Link
                to={`/appointments/${quote.appointmentId || ""}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-glam-border/60 bg-glam-surface-alt hover:bg-glam-surface text-xs font-semibold text-glam-text hover:text-glam-accent transition-colors"
                title="View linked lead appointment"
              >
                <span>Lead #{quote.appointmentCode}</span>
                <ArrowUpRight size={13} />
              </Link>
            )}
          </div>
        </div>

        {/* ─── Horizontal Stepper (Inspired by Reference) ─── */}
        <div className="pt-3 border-t border-glam-border/30">
          <div className="flex items-start justify-between w-full">
            {WORKFLOW_STEPS.map((step, idx) => {
              const isPassed = currentStep >= idx;
              const isCurrent = currentStep === idx;

              return (
                <div key={step.id} className="flex-1 flex items-start last:flex-initial">
                  {/* Step Node */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-xs ${
                        isPassed
                          ? "bg-glam-accent text-white"
                          : "bg-glam-surface border border-glam-border/60 text-glam-text-muted"
                      } ${isCurrent ? "ring-4 ring-glam-accent/25" : ""}`}
                    >
                      {isPassed ? <Check size={12} strokeWidth={3} /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] mt-1.5 font-medium whitespace-nowrap ${
                        isCurrent
                          ? "font-bold text-glam-text"
                          : isPassed
                          ? "text-glam-accent font-semibold"
                          : "text-glam-text-muted"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Connecting Line Segment between nodes */}
                  {idx < WORKFLOW_STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 sm:mx-3 mt-3 bg-glam-border/40 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          currentStep > idx ? "bg-glam-accent w-full" : "w-0"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ════ 3. MAIN WORKSPACE: 8-COLUMN MAIN & 4-COLUMN SIDEBAR ════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ─── LEFT/CENTER COLUMN (8 Cols) ─── */}
        <div className="lg:col-span-8 space-y-4">
          {/* A. Hero Investment & Info Grid (Reference Pattern) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Big Investment KPI Card */}
            <div className="md:col-span-4 rounded-2xl border border-glam-border/50 bg-glam-surface p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-glam-text-muted uppercase tracking-wider block">
                  Total Investment
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold font-outfit text-glam-text mt-1.5 tracking-tight">
                  ₹{(quote.totalAmount || 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-glam-border/20 text-[11px] text-glam-text-muted flex items-center justify-between">
                <span>Advance to Lock (40%)</span>
                <span className="font-bold text-glam-accent font-mono">
                  ₹{(quote.advanceRequired || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Modular Info Micro-Cards Grid (6 Cards · Reference Pattern) */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card 1: Service Package */}
              <div className="rounded-2xl border border-glam-border/40 bg-glam-surface p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-glam-surface-alt border border-glam-border/40 text-glam-accent flex items-center justify-center shrink-0">
                  <Sparkles size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[9.5px] font-bold text-glam-text-muted uppercase tracking-wider block">
                    Service Scope
                  </span>
                  <p className="text-xs font-bold text-glam-text truncate mt-0.5">
                    {quote.serviceName}
                  </p>
                </div>
              </div>

              {/* Card 2: Event Date */}
              <div className="rounded-2xl border border-glam-border/40 bg-glam-surface p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-glam-surface-alt border border-glam-border/40 text-glam-accent flex items-center justify-center shrink-0">
                  <Calendar size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[9.5px] font-bold text-glam-text-muted uppercase tracking-wider block">
                    Target Event Date
                  </span>
                  <p className="text-xs font-bold text-glam-text truncate mt-0.5">
                    {formatDate(quote.eventDate) || "Date TBD"}
                  </p>
                </div>
              </div>

              {/* Card 3: Venue Location */}
              <div className="rounded-2xl border border-glam-border/40 bg-glam-surface p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-glam-surface-alt border border-glam-border/40 text-glam-accent flex items-center justify-center shrink-0">
                  <Building2 size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[9.5px] font-bold text-glam-text-muted uppercase tracking-wider block">
                    Venue Location
                  </span>
                  <p className="text-xs font-bold text-glam-text truncate mt-0.5">
                    {quote.venueName || "Studio Atelier"}
                  </p>
                </div>
              </div>

              {/* Card 4: Inquiry Source */}
              <div className="rounded-2xl border border-glam-border/40 bg-glam-surface p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-glam-surface-alt border border-glam-border/40 text-glam-accent flex items-center justify-center shrink-0">
                  <Tag size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[9.5px] font-bold text-glam-text-muted uppercase tracking-wider block">
                    Inquiry Source
                  </span>
                  <p className="text-xs font-bold text-glam-text truncate mt-0.5">
                    {quote.appointmentCode ? `Direct Lead #${quote.appointmentCode}` : "Direct Client Inquiry"}
                  </p>
                </div>
              </div>

              {/* Card 5: Payment Terms */}
              <div className="rounded-2xl border border-glam-border/40 bg-glam-surface p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-glam-surface-alt border border-glam-border/40 text-glam-accent flex items-center justify-center shrink-0">
                  <CreditCard size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[9.5px] font-bold text-glam-text-muted uppercase tracking-wider block">
                    Payment Terms
                  </span>
                  <p className="text-xs font-bold text-glam-text truncate mt-0.5">
                    40% Advance (₹{(quote.advanceRequired || 0).toLocaleString("en-IN")})
                  </p>
                </div>
              </div>

              {/* Card 6: Validity Timeout */}
              <div className="rounded-2xl border border-glam-border/40 bg-glam-surface p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-glam-surface-alt border border-glam-border/40 text-amber-500 flex items-center justify-center shrink-0">
                  <Clock size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[9.5px] font-bold text-glam-text-muted uppercase tracking-wider block">
                    Valid Until
                  </span>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300 truncate mt-0.5">
                    {formatDate(quote.validUntil)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* B. Services & Pricing Breakdown Table */}
          <div className="bg-glam-surface border border-glam-border/50 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-glam-text-muted">
                  Services & Pricing Breakdown
                </h3>
                <p className="text-[10px] text-glam-text-muted mt-0.5">
                  Itemized service rates, inclusions, and commercial total calculation
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsReviseModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-glam-border/60 bg-glam-surface text-xs font-semibold text-glam-text hover:text-glam-accent hover:bg-glam-surface-alt transition-colors cursor-pointer"
                title="Edit service items, pricing, or quantities"
              >
                <Pencil size={11} />
                <span>Edit Items</span>
              </button>
            </div>

            <div className="rounded-xl border border-glam-border/30 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-glam-surface-alt/70 text-glam-text-muted text-[10px] uppercase font-bold border-b border-glam-border/30">
                  <tr>
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">Service Description</th>
                    <th className="p-3 text-center w-20">Qty</th>
                    <th className="p-3 text-right w-36">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glam-border/20">
                  {clientFacingItems.map((it, idx) => (
                    <tr key={idx} className="hover:bg-glam-surface-alt/30 transition-colors">
                      <td className="p-3 text-center text-glam-text-muted font-mono text-[11px]">
                        0{idx + 1}
                      </td>
                      <td className="p-3">
                        <span className="text-glam-text font-semibold block">{it.description}</span>
                      </td>
                      <td className="p-3 text-center text-glam-text-muted font-medium">
                        {it.qty || 1}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-glam-text">
                        ₹{(Number(it.amount) || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30 space-y-2 text-xs">
              <div className="flex justify-between text-glam-text-muted">
                <span>Subtotal:</span>
                <span className="font-mono text-glam-text font-semibold">
                  ₹{(quote.subtotal || quote.totalAmount).toLocaleString("en-IN")}
                </span>
              </div>
              {quote.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400 text-xs">
                  <span>Discount ({quote.discountNotes || "Applied"}):</span>
                  <span className="font-mono font-semibold">-₹{Number(quote.discountAmount).toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-glam-border/20 pt-2 text-glam-text text-base">
                <span>Total Amount:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-lg">
                  ₹{(quote.totalAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-glam-border/20 text-[11.5px]">
                <div className="flex justify-between sm:justify-start sm:gap-2 text-glam-accent font-semibold">
                  <span>💳 Advance to Lock Date (40%):</span>
                  <span className="font-mono font-bold">₹{(quote.advanceRequired || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between sm:justify-end sm:gap-2 text-glam-text-muted">
                  <span>Balance Due on Event Day (60%):</span>
                  <span className="font-mono font-semibold text-glam-text">
                    ₹{(Math.max(0, (quote.totalAmount || 0) - (quote.advanceRequired || 0))).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* C. WhatsApp Companion Note Card */}
          <div className="bg-glam-surface border border-glam-border/50 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-glam-text-muted flex items-center gap-1.5">
                <MessageSquare size={13} className="text-emerald-500" />
                <span>WhatsApp Message (with PDF attached)</span>
              </h3>
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-glam-accent hover:underline cursor-pointer"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-glam-border/60 bg-glam-surface-alt/50 text-[11px] text-glam-text font-mono leading-relaxed focus:outline-hidden focus:border-glam-accent resize-none"
              placeholder="Proposal companion message..."
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSendQuote}
                disabled={isGeneratingPdf}
                className="flex-1 h-10 rounded-xl bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Preparing PDF & Message...</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Send Quote via WhatsApp</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(true)}
                className="px-3.5 h-10 rounded-xl border border-glam-border/60 bg-glam-surface text-xs font-semibold text-glam-text hover:bg-glam-surface-alt flex items-center gap-1.5 cursor-pointer"
                title="Preview PDF document"
              >
                <Eye size={13} className="text-glam-accent" />
                <span>Preview PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── RIGHT SIDEBAR (4 Cols - Inspired by Reference) ─── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Client Card (Avatar + Contact Buttons) */}
          <div className="bg-glam-surface border border-glam-border/50 rounded-2xl p-5 shadow-xs text-center space-y-3">
            {/* Avatar with Online/Active indicator */}
            <div className="relative inline-block mx-auto">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-glam-accent/25 to-glam-accent/5 border-2 border-glam-accent/30 text-glam-accent flex items-center justify-center font-outfit text-2xl font-bold shadow-inner">
                {quote.clientName?.charAt(0) || "C"}
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-glam-surface" />
            </div>

            <div>
              <h3 className="text-base font-bold font-outfit text-glam-text">
                {quote.clientName}
              </h3>
              <p className="text-xs text-glam-text-muted mt-0.5">
                {registeredClient ? "Official Client" : "Inquiry / Lead"}
              </p>
            </div>

            {/* Quick Contact Buttons */}
            <div className="space-y-2 pt-1">
              <a
                href={`tel:${quote.clientPhone}`}
                className="w-full h-10 rounded-xl border border-glam-border/60 bg-glam-surface hover:bg-glam-surface-alt text-xs font-semibold text-glam-text flex items-center justify-center gap-2 transition-colors"
              >
                <Phone size={13} className="text-glam-accent" />
                <span>Call ({quote.clientPhone})</span>
              </a>

              {cleanPhone && (
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full h-10 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare size={13} />
                  <span>WhatsApp Message</span>
                </a>
              )}

              {quote.clientEmail && (
                <a
                  href={`mailto:${quote.clientEmail}`}
                  className="w-full h-10 rounded-xl border border-glam-border/60 bg-glam-surface hover:bg-glam-surface-alt text-xs font-semibold text-glam-text flex items-center justify-center gap-2 transition-colors"
                >
                  <Mail size={13} className="text-glam-accent" />
                  <span>Email Client</span>
                </a>
              )}
            </div>
          </div>

          {/* Card 2: Documents Card (Directly from Reference Pattern) */}
          <div className="bg-glam-surface border border-glam-border/50 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-glam-text-muted">
                Documents
              </h3>
              <span className="text-[10px] text-glam-accent font-semibold">1 File</span>
            </div>

            {/* Proposal PDF Document File Card */}
            <div className="p-3.5 rounded-xl border border-glam-border/40 bg-glam-surface-alt/40 space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-glam-text truncate" title={`GlamDesk_Quotation_${quote.code}.pdf`}>
                    GlamDesk_Quotation_{quote.code}.pdf
                  </p>
                  <p className="text-[10px] text-glam-text-muted mt-0.5">
                    A4 Official Proposal · v{quote.revision || 1}
                  </p>
                </div>
              </div>

              {/* Action Buttons for Document */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-glam-border/20">
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="py-1.5 px-2 rounded-lg bg-glam-surface hover:bg-glam-surface-alt border border-glam-border/40 text-[11px] font-semibold text-glam-text flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  title="Preview document"
                >
                  <Eye size={11} className="text-glam-accent" />
                  <span>View</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="py-1.5 px-2 rounded-lg bg-glam-surface hover:bg-glam-surface-alt border border-glam-border/40 text-[11px] font-semibold text-glam-text flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  title="Download PDF"
                >
                  {isGeneratingPdf ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="py-1.5 px-2 rounded-lg bg-glam-surface hover:bg-glam-surface-alt border border-glam-border/40 text-[11px] font-semibold text-glam-text flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  title="Print document"
                >
                  <Printer size={11} />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {quote.sentAt && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 pt-1">
                <CheckCircle2 size={11} />
                <span>Last sent via WhatsApp on {formatDate(quote.sentAt)}</span>
              </p>
            )}
          </div>

          {/* Card 3: Banking & Instant UPI QR Code */}
          <div className="bg-glam-surface border border-glam-border/50 rounded-2xl p-4 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-glam-text-muted uppercase tracking-wider block">
                Instant UPI Deposit
              </span>
              <span className="text-[10px] font-bold text-glam-accent font-mono">
                Advance: ₹{(quote.advanceRequired || 0).toLocaleString("en-IN")}
              </span>
            </div>

            {/* QR Code Container */}
            <div className="p-3 rounded-xl bg-white text-zinc-900 border border-glam-border/40 flex flex-col items-center justify-center text-center shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                  `upi://pay?pa=${payment.upiId || "glamdesk@okhdfcbank"}&pn=${encodeURIComponent(
                    salon.businessName || "GlamDesk Atelier"
                  )}&am=${quote.advanceRequired || 0}&cu=INR&tn=${encodeURIComponent(
                    "GlamDesk Advance " + quote.code
                  )}`
                )}&margin=1`}
                alt="UPI Deposit QR Code"
                className="w-28 h-28 rounded-lg border border-zinc-200"
                crossOrigin="anonymous"
              />
              <p className="text-[10px] font-bold text-zinc-800 mt-1.5">
                Scan to Pay ₹{(quote.advanceRequired || 0).toLocaleString("en-IN")}
              </p>
              <p className="text-[9px] text-zinc-500">
                GPay · PhonePe · Paytm · BHIM
              </p>
            </div>

            <div className="space-y-1 pt-1 border-t border-glam-border/20">
              <div className="flex justify-between">
                <span className="text-glam-text-muted">UPI ID:</span>
                <span className="font-mono font-bold text-glam-accent">{payment.upiId || "glamdesk@okhdfcbank"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-glam-text-muted">Bank:</span>
                <span className="font-medium text-glam-text">{payment.bankName || "HDFC Bank"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-glam-text-muted">Account:</span>
                <span className="font-mono text-glam-text-muted">{payment.accountNumber || "50200084920193"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden PDF container for background vector generation & native print */}
      <div className="hidden">
        <QuotationPDFTemplate
          quote={quote}
          settings={settings}
          documentId="profile-printable-quote-template"
        />
      </div>

      {/* Modals */}
      <PDFPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        quote={quote}
        settings={settings}
        onDownload={handleDownloadPdf}
        onPrint={handlePrintPdf}
        isGeneratingPdf={isGeneratingPdf}
        pdfSuccess={pdfSuccess}
      />

      <ReviseQuoteModal
        isOpen={isReviseModalOpen}
        onClose={() => setIsReviseModalOpen(false)}
        quote={quote}
        onSave={handleSaveRevise}
      />

      <RecordAdvanceModal
        isOpen={isWonModalOpen}
        onClose={() => setIsWonModalOpen(false)}
        quote={quote}
        onConfirm={handleConfirmWon}
      />

      <MarkLostModal
        isOpen={isLostModalOpen}
        onClose={() => setIsLostModalOpen(false)}
        quote={quote}
        onConfirm={handleConfirmLost}
      />

      <DeleteQuoteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        quote={quote}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default QuotationProfilePage;
