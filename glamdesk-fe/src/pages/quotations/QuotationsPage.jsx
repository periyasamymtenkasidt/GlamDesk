import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Send,
  Plus,
  IndianRupee,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Trash2,
  Pencil,
  Tag,
  ShieldCheck,
  Building2,
  MapPin,
  User,
  Phone,
  Mail,
  Download,
  Printer,
  Loader2,
  FileCheck,
} from "lucide-react";
import { useQuotations } from "../../context/QuotationContext";
import { useAppointments } from "../../context/AppointmentContext";
import { useSettings } from "../../context/SettingsContext";
import { quotationStatuses, lossReasons, getConsolidatedClientItems } from "../../data/quotationData";
import { Table } from "../../components/common/table";
import Modal from "../../components/modals/Modal";
import { Input, ThemeSelect, Textarea } from "../../components/common/form";
import QuotationPDFTemplate from "./QuotationPDFTemplate";
import { downloadPdfFromElement, printElement } from "../../utils/pdfExport";

// ─── Status Badge Config ──────────────────────────────────────────────────────
const statusConfig = {
  Draft: {
    bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    dot: "bg-slate-400",
    icon: FileText,
  },
  Sent: {
    bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    dot: "bg-sky-500",
    icon: Send,
  },
  "Under Revision": {
    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dot: "bg-amber-500",
    icon: Pencil,
  },
  Won: {
    bg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  Lost: {
    bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    dot: "bg-rose-500",
    icon: XCircle,
  },
  Expired: {
    bg: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/25",
    dot: "bg-zinc-400",
    icon: Clock,
  },
};

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

// ─── Stat Card Component ──────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, title, value, subtitle }) => (
  <div className="rounded-2xl border border-glam-border/40 bg-glam-surface p-4 shadow-xs hover:border-glam-accent/40 transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[11px] font-medium text-glam-text-muted uppercase tracking-wider">
          {title}
        </p>
        <p className="text-xl font-bold font-outfit text-glam-text mt-1">{value}</p>
        <p className="text-[11px] text-glam-text-muted mt-0.5">{subtitle}</p>
      </div>
      <div className="w-10 h-10 rounded-xl bg-glam-accent/10 text-glam-accent flex items-center justify-center">
        <Icon size={18} />
      </div>
    </div>
  </div>
);

// ─── Create Quote Modal ───────────────────────────────────────────────────────
const CreateQuoteModal = ({ isOpen, onClose, onSave }) => {
  const { appointments } = useAppointments();

  // Find unconfirmed leads or appointments without quotes
  const unconfirmedLeads = useMemo(() => {
    return appointments.filter((a) =>
      ["Booked", "Quote Sent", "Lead"].includes(a.status)
    );
  }, [appointments]);

  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    serviceName: "Royal HD Bridal Makeup",
    serviceCategory: "Bridal & Luxury",
    eventDate: "",
    venueName: "ITC Grand Chola, Chennai",
    discountAmount: 0,
    discountNotes: "",
    notes: "Quotation prepared per inquiry requirements.",
    status: "Sent",
  });

  const [items, setItems] = useState([
    { id: "1", description: "Royal HD Bridal Makeup Artistry", amount: 18000, qty: 1 },
  ]);

  const handleSelectLead = (aptId) => {
    setSelectedAppointmentId(aptId);
    const apt = appointments.find((a) => a.id === aptId);
    if (apt) {
      setFormData((prev) => ({
        ...prev,
        clientName: apt.clientName || "",
        clientPhone: apt.clientPhone || "",
        clientEmail: apt.clientEmail || "",
        serviceName: apt.serviceName || "Bridal Service",
        serviceCategory: apt.serviceCategory || "Bridal & Luxury",
        eventDate: apt.eventDate || "",
        venueName: apt.venueName || "Chennai Venue",
      }));
      // Consolidate base service + venue surcharge + travel fee into one final makeup price
      const totalMakeupAmount =
        (Number(apt.baseAmount) || 15000) +
        (Number(apt.travelFee) || 0) +
        (Number(apt.venueDelta) || 0);

      setItems([
        {
          id: "item-base",
          description: apt.serviceName || "Bridal Makeup Artistry",
          amount: totalMakeupAmount,
          qty: 1,
        },
      ]);
    }
  };

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

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + (Number(item.amount) || 0) * (Number(item.qty) || 1),
      0
    );
  }, [items]);

  const totalAmount = Math.max(0, subtotal - (Number(formData.discountAmount) || 0));
  const advanceRequired = Math.round(totalAmount * 0.4);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.clientPhone.trim()) return;

    const apt = appointments.find((a) => a.id === selectedAppointmentId);

    onSave({
      ...formData,
      appointmentId: selectedAppointmentId || null,
      appointmentCode: apt?.code || null,
      items: items.filter((it) => it.description.trim()),
      discountAmount: Number(formData.discountAmount) || 0,
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <Modal.Header title="Generate Commercial Quotation" icon={FileText} onClose={onClose} />
      <Modal.Body className="max-h-[75vh] overflow-y-auto space-y-4 pr-1">
        <form id="create-quote-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Pick Lead / Appointment */}
          {unconfirmedLeads.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-glam-accent/5 border border-glam-accent/20">
              <label className="text-[11px] font-bold uppercase tracking-wider text-glam-accent block mb-1.5">
                ⚡ Autofill from Unconfirmed Lead (Optional)
              </label>
              <ThemeSelect
                value={selectedAppointmentId}
                onChange={handleSelectLead}
                options={[
                  { value: "", label: "Manual New Client / Direct Inquiry" },
                  ...unconfirmedLeads.map((a) => ({
                    value: a.id,
                    label: `#${a.code} · ${a.clientName} (${a.serviceName} - ${formatDate(a.eventDate)})`,
                  })),
                ]}
                triggerClassName="h-10 rounded-xl border-glam-border/50 bg-glam-surface text-xs"
              />
            </div>
          )}

          {/* Lead Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Lead / Client Name"
              required
              placeholder="e.g. Meenakshi"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            />
            <Input
              label="Phone (WhatsApp)"
              required
              type="tel"
              icon={Phone}
              placeholder="+91 98410 55667"
              value={formData.clientPhone}
              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Event Date"
              type="date"
              icon={Calendar}
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            />
            <Input
              label="Venue Name / City"
              icon={Building2}
              value={formData.venueName}
              onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
            />
            <Input
              label="Service Name"
              value={formData.serviceName}
              onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
            />
          </div>

          {/* Itemized Line Items */}
          <div className="space-y-2 pt-2 border-t border-glam-border/30">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-glam-text">
                Itemized Services & Surcharges
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-glam-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Line Item</span>
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
                  <div className="flex items-center gap-1 w-20 shrink-0">
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
          </div>

          {/* Discounts & Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Input
              label="Discount (₹)"
              type="number"
              min="0"
              icon={Percent}
              value={formData.discountAmount}
              onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
            />
            <Input
              label="Discount Reason / Note"
              placeholder="e.g. Wedding season offer, festive discount"
              value={formData.discountNotes}
              onChange={(e) => setFormData({ ...formData, discountNotes: e.target.value })}
            />
          </div>

          {/* Calculation Banner */}
          <div className="p-4 rounded-2xl bg-glam-surface-alt/60 border border-glam-border/40 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="text-glam-text-muted text-[10px] uppercase font-bold">Subtotal</p>
              <p className="font-bold text-glam-text mt-0.5">₹{subtotal.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-glam-text-muted text-[10px] uppercase font-bold">Total Quoted</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                ₹{totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-glam-accent text-[10px] uppercase font-bold">Advance (40%)</p>
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
          form="create-quote-form"
          className="flex-1 h-10 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white font-bold text-xs shadow-md hover:opacity-95 cursor-pointer"
        >
          Create & Send Quote
        </button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Revise Quote Modal ───────────────────────────────────────────────────────
const ReviseQuoteModal = ({ isOpen, onClose, quote, onSave }) => {
  const [items, setItems] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountNotes, setDiscountNotes] = useState("");
  const [notes, setNotes] = useState("");

  useMemo(() => {
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
        <form id="revise-form" onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-glam-text uppercase text-[11px]">
              Service Line Items
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-glam-accent font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Item</span>
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
                  placeholder="Service or addon name"
                  className="flex-1 bg-transparent text-xs text-glam-text focus:outline-hidden"
                  value={it.description}
                  onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                />
                <div className="flex items-center gap-1 w-20 shrink-0">
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
          form="revise-form"
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

  useMemo(() => {
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
        {/* Banner notification */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
          <p className="font-bold flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>Lead Conversion Automation</span>
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-glam-text-muted">
            Recording this advance deposit marks quotation <strong>#{quote.code}</strong> as <strong>Won</strong>, sets the linked booking to <strong>Confirmed</strong>, and officially registers <strong>{quote.clientName}</strong> in Client Master.
          </p>
        </div>

        <form id="record-advance-form" onSubmit={handleSubmit} className="space-y-3">
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
          form="record-advance-form"
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

// ─── Quote Details / Preview Modal ────────────────────────────────────────────
// ─── Quote Details & PDF Preview Modal ─────────────────────────────────────────
const QuoteDetailsModal = ({
  isOpen,
  onClose,
  quote,
  onOpenRevise,
  onOpenWon,
  onOpenLost,
  onSend,
}) => {
  const { settings } = useSettings();
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // "details" | "preview"
  const [customMessage, setCustomMessage] = useState("");

  const cleanPhone = (quote?.clientPhone || "").replace(/[^0-9]/g, "");

  // Build dynamic proposal text whenever quote changes or modal opens
  useEffect(() => {
    if (quote) {
      const salonName = settings?.salon?.businessName || "GlamDesk Atelier";
      const upiId = settings?.payment?.upiId || "glamdesk@okhdfcbank";
      const itemsList = (quote.items || [])
        .map(
          (it) =>
            `• *${it.description}*: ₹${(Number(it.amount) || 0).toLocaleString("en-IN")}`
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

📋 *Itemized Package Breakdown:*
${itemsList}
${discountLine}💎 *Total Package Investment:* ₹${(
        quote.totalAmount || 0
      ).toLocaleString("en-IN")}
💳 *Booking Advance to Lock Date (40%):* ₹${(
        quote.advanceRequired || 0
      ).toLocaleString("en-IN")}
🏦 *UPI for Advance:* ${upiId}

📄 *Please find your official quotation PDF attached* with full service scope, payment schedule, and terms.

⏰ *Validity:* This quote & artist availability are held until *${formatDate(
        quote.validUntil
      )}*.
Kindly transfer the 40% advance deposit to secure your slot!

Warm regards,
*Concierge Team | ${salonName}*`;

      setCustomMessage(msg);
      setActiveTab("details");
    }
  }, [quote, isOpen, settings]);

  if (!isOpen || !quote) return null;

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
    await downloadPdfFromElement("quotation-printable-artboard", filename);
    setIsGeneratingPdf(false);
    setPdfSuccess(true);
    setTimeout(() => setPdfSuccess(false), 2500);
  };

  const handlePrintPdf = () => {
    printElement(
      "quotation-printable-artboard",
      `GlamDesk_Quotation_${quote.code}`
    );
  };

  const handleSendViaWhatsApp = async () => {
    // 1. Download PDF file so user has it ready to attach
    await handleDownloadPdf();

    // 2. Open WhatsApp with formatted proposal message
    if (cleanPhone) {
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        customMessage
      )}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }

    // 3. Mark quotation as Sent in context
    onSend(quote.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-6xl">
      <Modal.Header
        title={`Quotation #${quote.code}`}
        icon={FileText}
        onClose={onClose}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-glam-surface-alt border border-glam-border/40 text-glam-accent font-bold">
            v{quote.revision || 1}
          </span>
          {/* Mobile Tab Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-glam-surface-alt border border-glam-border/40 lg:hidden">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                activeTab === "details"
                  ? "bg-glam-surface text-glam-accent shadow-xs"
                  : "text-glam-text-muted hover:text-glam-text"
              }`}
            >
              Details & Message
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                activeTab === "preview"
                  ? "bg-glam-surface text-glam-accent shadow-xs"
                  : "text-glam-text-muted hover:text-glam-text"
              }`}
            >
              A4 PDF Preview
            </button>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-4 sm:p-5 max-h-[82vh] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ════ LEFT COLUMN: Details & WhatsApp Dispatch (5 cols) ════ */}
          <div
            className={`lg:col-span-5 space-y-3.5 ${
              activeTab === "details" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Header Summary Card */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-glam-surface-alt/70 border border-glam-border/40">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-bold font-outfit text-glam-text">
                    {quote.clientName}
                  </h4>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sc.bg}`}
                  >
                    <StatusIcon size={10} />
                    <span>{quote.status}</span>
                  </span>
                </div>
                <p className="text-xs text-glam-text-muted mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Phone size={11} className="text-glam-accent" />
                    {quote.clientPhone}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-glam-accent" />
                    {quote.venueName || "Studio"}
                  </span>
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[10px] text-glam-text-muted uppercase font-semibold">
                  Total Quoted
                </p>
                <p className="text-base sm:text-lg font-bold font-outfit text-emerald-600 dark:text-emerald-400">
                  ₹{(quote.totalAmount || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Linked Lead Notice */}
            {quote.appointmentCode && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-glam-accent/5 border border-glam-accent/20 text-xs">
                <span className="text-glam-text-muted">Linked Lead Request:</span>
                <Link
                  to={`/appointments/${quote.appointmentId || ""}`}
                  className="font-bold text-glam-accent hover:underline flex items-center gap-1"
                >
                  <span>#{quote.appointmentCode}</span>
                  <ArrowUpRight size={12} />
                </Link>
              </div>
            )}

            {/* Itemized Table */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                  Itemized Services
                </p>
                <span className="text-[10px] text-glam-text-muted">
                  {quote.items?.length || 0} items
                </span>
              </div>
              <div className="rounded-xl border border-glam-border/30 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-glam-surface-alt/70 text-glam-text-muted text-[10px] uppercase font-bold border-b border-glam-border/30">
                    <tr>
                      <th className="p-2">Description</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glam-border/20">
                    {(quote.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 text-glam-text">{it.description}</td>
                        <td className="p-2 text-right font-medium text-glam-text whitespace-nowrap">
                          ₹{(Number(it.amount) || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-glam-text-muted">Subtotal:</span>
                <span className="font-medium text-glam-text">
                  ₹{(quote.subtotal || quote.totalAmount).toLocaleString("en-IN")}
                </span>
              </div>
              {quote.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Courtesy Discount ({quote.discountNotes || "Festive"}):</span>
                  <span>-₹{quote.discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-glam-border/30 pt-1 text-glam-text">
                <span>Net Total Investment:</span>
                <span>₹{(quote.totalAmount || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-glam-accent font-semibold pt-0.5">
                <span>Deposit Required (40%):</span>
                <span>₹{(quote.advanceRequired || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Validity Notice */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <span className="text-amber-800 dark:text-amber-300 font-medium">Valid Until:</span>
              <span className="font-bold text-amber-900 dark:text-amber-200">
                {formatDate(quote.validUntil)}
              </span>
            </div>

            {/* WhatsApp Proposal Composer */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-emerald-500" />
                  <span>WhatsApp Message (with PDF attached)</span>
                </label>
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
                className="w-full p-2.5 rounded-xl border border-glam-border/60 bg-glam-surface text-[11px] text-glam-text font-mono leading-relaxed focus:outline-hidden focus:border-glam-accent resize-none"
                placeholder="Personalized proposal note..."
              />

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendViaWhatsApp}
                  disabled={isGeneratingPdf}
                  className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send PDF & WhatsApp</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="px-3.5 h-10 rounded-xl border border-glam-border/60 bg-glam-surface text-xs font-semibold text-glam-text hover:bg-glam-surface-alt flex items-center gap-1.5 cursor-pointer"
                  title="Download PDF without opening WhatsApp"
                >
                  {pdfSuccess ? (
                    <>
                      <FileCheck size={14} className="text-emerald-500" />
                      <span className="text-emerald-600 font-bold">Saved</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Pipeline Stage Buttons */}
            {quote.status !== "Won" && quote.status !== "Lost" && (
              <div className="pt-2 border-t border-glam-border/30 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenLost(quote)}
                  className="px-3 h-9 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Mark Lost
                </button>
                <button
                  type="button"
                  onClick={() => onOpenRevise(quote)}
                  className="px-3 h-9 rounded-xl bg-glam-accent/10 text-glam-accent hover:bg-glam-accent/20 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Revise
                </button>
                <button
                  type="button"
                  onClick={() => onOpenWon(quote)}
                  className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Record Advance & Win
                </button>
              </div>
            )}
          </div>

          {/* ════ RIGHT COLUMN: Live Luxury Quotation PDF Preview (7 cols) ════ */}
          <div
            className={`lg:col-span-7 flex flex-col bg-[#ede9e2] dark:bg-zinc-950/70 rounded-2xl border border-glam-border/40 overflow-hidden ${
              activeTab === "preview" ? "flex" : "hidden lg:flex"
            }`}
          >
            {/* Live Artboard Sub-header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-glam-border/30 bg-glam-surface/80 backdrop-blur-xs text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold font-outfit uppercase tracking-wider text-[11px] text-glam-text">
                  Live Quotation Preview
                </span>
                <span className="text-[10px] text-glam-text-muted hidden sm:inline">
                  (Standard A4 Luxury Format)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-glam-border/60 bg-glam-surface text-[11px] font-semibold text-glam-text hover:bg-glam-surface-alt transition-colors cursor-pointer"
                  title="Print or Save as PDF via Browser"
                >
                  <Printer size={12} />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-glam-accent text-white text-[11px] font-semibold shadow-xs hover:opacity-95 transition-all cursor-pointer"
                  title="Download vector PDF file"
                >
                  {isGeneratingPdf ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Download size={12} />
                  )}
                  <span>{pdfSuccess ? "Downloaded" : "Download PDF"}</span>
                </button>
              </div>
            </div>

            {/* Scrollable Document Artboard */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex justify-center scrollbar-thin max-h-[70vh]">
              <div className="w-full max-w-[560px] bg-white shadow-2xl rounded-lg overflow-hidden border border-black/10 self-start text-[#1a1a1a]">
                <QuotationPDFTemplate
                  quote={quote}
                  settings={settings}
                  documentId="quotation-printable-artboard"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

// ─── Main Quotations Page Component ───────────────────────────────────────────
const QuotationsPage = () => {
  const navigate = useNavigate();
  const {
    quotations,
    createQuotation,
    reviseQuotation,
    sendQuotation,
    markQuotationWon,
    markQuotationLost,
  } = useQuotations();

  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [revisingQuote, setRevisingQuote] = useState(null);
  const [winningQuote, setWinningQuote] = useState(null);
  const [losingQuote, setLosingQuote] = useState(null);

  // Keep selected quote synchronized with quotation state updates
  const activeSelectedQuote = useMemo(() => {
    if (!selectedQuote) return null;
    return quotations.find((q) => q.id === selectedQuote.id) || selectedQuote;
  }, [quotations, selectedQuote]);

  // Key KPI Metrics
  const stats = useMemo(() => {
    const total = quotations.length;
    const active = quotations.filter((q) =>
      ["Draft", "Sent", "Under Revision"].includes(q.status)
    );
    const activePipelineValue = active.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

    const wonList = quotations.filter((q) => q.status === "Won");
    const wonRevenue = wonList.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

    const closed = quotations.filter((q) => ["Won", "Lost"].includes(q.status)).length;
    const winRate = closed > 0 ? Math.round((wonList.length / closed) * 100) : 100;

    const today = new Date().toISOString().split("T")[0];
    const expiringSoon = quotations.filter(
      (q) => q.status === "Sent" && q.validUntil && q.validUntil >= today
    ).length;

    return {
      total,
      activeCount: active.length,
      activePipelineValue,
      wonRevenue,
      winRate,
      expiringSoon,
    };
  }, [quotations]);

  const handleSaveCreate = (data) => {
    createQuotation(data);
    setIsCreateModalOpen(false);
  };

  const handleSaveRevise = (data) => {
    if (revisingQuote) {
      reviseQuotation(revisingQuote.id, data);
      setRevisingQuote(null);
      setSelectedQuote(null);
    }
  };

  const handleConfirmWon = (data) => {
    if (winningQuote) {
      markQuotationWon(winningQuote.id, data);
      setWinningQuote(null);
      setSelectedQuote(null);
    }
  };

  const handleConfirmLost = (reason) => {
    if (losingQuote) {
      markQuotationLost(losingQuote.id, reason);
      setLosingQuote(null);
      setSelectedQuote(null);
    }
  };

  // Table Columns
  const columns = useMemo(
    () => [
      {
        key: "code",
        header: "QUOTE ID",
        cell: (q) => (
          <Link
            to={`/quotations/${q.id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-block px-2.5 py-1 rounded-lg bg-[#f6eae0] dark:bg-white/5 border border-glam-border/30 text-[11px] font-mono text-glam-text font-bold hover:text-glam-accent hover:border-glam-accent/50 transition-colors cursor-pointer"
          >
            #{q.code}
          </Link>
        ),
      },
      {
        key: "clientName",
        header: "CLIENT",
        cell: (q) => (
          <Link
            to={`/quotations/${q.id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-xs sm:text-sm text-glam-text hover:text-glam-accent transition-colors truncate block"
          >
            {q.clientName}
          </Link>
        ),
      },
      {
        key: "clientPhone",
        header: "CONTACT",
        cell: (q) => (
          <div className="flex items-center gap-1.5 text-xs text-glam-text font-normal whitespace-nowrap">
            <Phone size={12} className="text-glam-accent shrink-0" />
            <span className="whitespace-nowrap">{q.clientPhone}</span>
          </div>
        ),
      },
      {
        key: "serviceName",
        header: "EVENT & DATE",
        cell: (q) => (
          <div title={q.serviceName}>
            <span
              className="font-medium text-xs text-glam-text block truncate max-w-[200px]"
              title={q.serviceName}
            >
              {q.serviceName}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-glam-text-muted mt-0.5 whitespace-nowrap">
              <Calendar size={11} className="text-glam-accent shrink-0" />
              <span>{formatDate(q.eventDate) || "Date TBD"}</span>
            </div>
          </div>
        ),
      },
      {
        key: "venueName",
        header: "VENUE",
        cell: (q) => (
          <div
            className="flex items-center gap-1.5 text-xs text-glam-text max-w-[180px]"
            title={q.venueName || "Studio"}
          >
            <MapPin size={12} className="text-glam-accent shrink-0" />
            <span className="truncate block" title={q.venueName || "Studio"}>
              {q.venueName || "Studio"}
            </span>
          </div>
        ),
      },
      {
        key: "totalAmount",
        header: "QUOTED AMOUNT",
        cell: (q) => (
          <div>
            <span className="font-bold font-outfit text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 block">
              ₹{(q.totalAmount || 0).toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-glam-text-muted block">
              ₹{(q.advanceRequired || 0).toLocaleString("en-IN")} (40% dep)
            </span>
          </div>
        ),
      },
      {
        key: "status",
        header: "STATUS",
        cell: (q) => {
          const sc = statusConfig[q.status] || statusConfig.Draft;
          const Icon = sc.icon;
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sc.bg}`}
            >
              <Icon size={11} />
              <span>{q.status}</span>
            </span>
          );
        },
      },
      {
        key: "validUntil",
        header: "VALIDITY",
        cell: (q) => {
          if (q.status === "Won") {
            return (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Confirmed</span>
              </span>
            );
          }
          if (q.status === "Lost" || q.status === "Expired") {
            return (
              <span className="text-xs text-rose-500 font-medium">
                {q.lossReason || "Closed / Expired"}
              </span>
            );
          }
          return (
            <div className="flex items-center gap-1 text-xs text-glam-text">
              <Clock size={11} className="text-glam-accent" />
              <span>{formatDate(q.validUntil)}</span>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="p-3 sm:p-4 max-w-7xl mx-auto w-full space-y-3 sm:space-y-4">
      {/* 1. Header Banner */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-glam-accent/10 text-glam-accent">
              <FileText size={18} />
            </span>
            <h1 className="text-xl sm:text-2xl font-medium font-outfit text-glam-text tracking-tight">
              Quotations
            </h1>
          </div>
          <p className="text-xs text-glam-text-muted mt-0.5">
            Commercial sales hub. Manage pricing breakdowns, revisions, and automated conversions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white font-medium text-xs shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span>Create Quote</span>
        </button>
      </div>

      {/* 2. Key KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Send}
          title="Active Quotes"
          value={stats.activeCount}
          subtitle="Currently in negotiation"
        />
        <StatCard
          icon={IndianRupee}
          title="Pipeline Quoted"
          value={`₹${stats.activePipelineValue.toLocaleString("en-IN")}`}
          subtitle="Pending client approval"
        />
        <StatCard
          icon={CheckCircle2}
          title="Won Revenue"
          value={`₹${stats.wonRevenue.toLocaleString("en-IN")}`}
          subtitle={`${stats.winRate}% win conversion rate`}
        />
        <StatCard
          icon={Clock}
          title="Expiring Soon"
          value={stats.expiringSoon}
          subtitle="Active quotes within validity"
        />
      </div>

      {/* 3. Reusable Table */}
      <Table
        columns={columns}
        data={quotations}
        searchPlaceholder="Search quotes by client, code, phone, service, venue..."
        searchFields={["code", "clientName", "clientPhone", "serviceName", "venueName"]}
        dateField="eventDate"
        filterKey="status"
        filterOptions={quotationStatuses}
        pageSize={6}
        itemLabel="quotations"
        onRowClick={(quote) => navigate(`/quotations/${quote.id}`)}
        emptyIcon={FileText}
        emptyTitle="No quotations found"
        emptyMessage="Try adjusting your search query, status filter, or date range."
      />

      {/* 4. Modals */}
      <CreateQuoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveCreate}
      />

      <QuoteDetailsModal
        isOpen={!!activeSelectedQuote}
        onClose={() => setSelectedQuote(null)}
        quote={activeSelectedQuote}
        onOpenRevise={(q) => setRevisingQuote(q)}
        onOpenWon={(q) => setWinningQuote(q)}
        onOpenLost={(q) => setLosingQuote(q)}
        onSend={(id) => sendQuotation(id)}
      />

      <ReviseQuoteModal
        isOpen={!!revisingQuote}
        onClose={() => setRevisingQuote(null)}
        quote={revisingQuote}
        onSave={handleSaveRevise}
      />

      <RecordAdvanceModal
        isOpen={!!winningQuote}
        onClose={() => setWinningQuote(null)}
        quote={winningQuote}
        onConfirm={handleConfirmWon}
      />

      <MarkLostModal
        isOpen={!!losingQuote}
        onClose={() => setLosingQuote(null)}
        quote={losingQuote}
        onConfirm={handleConfirmLost}
      />
    </div>
  );
};

export default QuotationsPage;
