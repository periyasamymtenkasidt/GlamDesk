import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  IndianRupee,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MessageSquare,
  FileText,
  Trash2,
  AlertTriangle,
  ExternalLink,
  Check,
  Copy,
  Pencil,
  Send,
  Share2,
  Receipt,
  CreditCard,
  Banknote,
} from "lucide-react";
import { useAppointments } from "../../context/AppointmentContext";
import BookAppointmentModal from "./BookAppointmentModal";
import SendQuoteModal from "./SendQuoteModal";
import RecordPaymentModal from "./RecordPaymentModal";

// ─── Status Config ────────────────────────────────────────────────────────────
const statusConfig = {
  Booked: {
    textColor: "text-amber-700 dark:text-amber-300",
    bgLight: "bg-amber-500/15",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
    icon: Calendar,
  },
  "Quote Sent": {
    textColor: "text-sky-700 dark:text-sky-300",
    bgLight: "bg-sky-500/15",
    border: "border-sky-500/20",
    dot: "bg-sky-500",
    icon: Send,
  },
  Confirmed: {
    textColor: "text-emerald-700 dark:text-emerald-300",
    bgLight: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  "In-Progress": {
    textColor: "text-purple-700 dark:text-purple-300",
    bgLight: "bg-purple-500/15",
    border: "border-purple-500/20",
    dot: "bg-purple-500",
    icon: Clock,
  },
  Completed: {
    textColor: "text-blue-700 dark:text-blue-300",
    bgLight: "bg-blue-500/10",
    border: "border-blue-500/20",
    dot: "bg-blue-500",
    icon: CheckCircle2,
  },
  Cancelled: {
    textColor: "text-rose-700 dark:text-rose-300",
    bgLight: "bg-rose-500/10",
    border: "border-rose-500/20",
    dot: "bg-rose-500",
    icon: XCircle,
  },
};

// ─── Workflow Steps Definition ──────────────────────────────────────────────
const WORKFLOW_STEPS = [
  { id: "Booked", label: "1. Booked", icon: Calendar },
  { id: "Quote Sent", label: "2. Quote Sent", icon: Send },
  { id: "Confirmed", label: "3. Confirmed", icon: CheckCircle2 },
  { id: "In-Progress", label: "4. In-Progress", icon: Clock },
  { id: "Completed", label: "5. Completed", icon: CheckCircle2 },
];

const statusOrder = [
  "Booked",
  "Quote Sent",
  "Confirmed",
  "In-Progress",
  "Completed",
];

// ─── Helper Functions ─────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthName = months[parseInt(m, 10) - 1] || m;
    return `${parseInt(d, 10)} ${monthName} ${y}`;
  } catch {
    return dateStr;
  }
};

const formatDuration = (mins) => {
  if (!mins) return "";
  const hours = mins / 60;
  return hours % 1 === 0 ? `${hours} hrs` : `${hours.toFixed(1)} hrs`;
};

const AppointmentProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getAppointmentById,
    updateStatus,
    deleteAppointment,
    updateAppointment,
  } = useAppointments();

  const appointment = getAppointmentById(id);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSendQuoteModalOpen, setIsSendQuoteModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState("advance"); // "advance" | "balance"
  const [copiedField, setCopiedField] = useState(null);

  const handleStepAction = (step) => {
    if (!appointment) return;
    if (step.id === "Booked") {
      updateStatus(appointment.id, "Booked");
    } else if (step.id === "Quote Sent") {
      setIsSendQuoteModalOpen(true);
    } else if (step.id === "Confirmed") {
      if (!appointment.advancePaid) {
        setPaymentType("advance");
        setIsPaymentModalOpen(true);
      } else {
        updateStatus(appointment.id, "Confirmed");
      }
    } else if (step.id === "In-Progress") {
      updateStatus(appointment.id, "In-Progress");
    } else if (step.id === "Completed") {
      if (appointment.balanceDue > 0) {
        setPaymentType("balance");
        setIsPaymentModalOpen(true);
      } else {
        updateStatus(appointment.id, "Completed");
      }
    }
  };

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDeleteConfirm = () => {
    if (!appointment) return;
    deleteAppointment(appointment.id);
    setIsDeleteModalOpen(false);
    navigate("/appointments");
  };

  if (!appointment) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center p-12 bg-glam-surface border border-glam-border/40 rounded-3xl text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-medium font-outfit text-glam-text">
            Appointment Not Found
          </h2>
          <p className="text-xs text-glam-text-muted mt-1.5 max-w-sm">
            The booking record you are looking for does not exist or has been
            removed.
          </p>
          <button
            type="button"
            onClick={() => navigate("/appointments")}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white text-xs font-medium shadow-xs hover:opacity-95 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Appointments</span>
          </button>
        </div>
      </div>
    );
  }

  const sc = statusConfig[appointment.status] || statusConfig.Confirmed;
  const cleanPhone = (appointment.clientPhone || "").replace(/[^0-9]/g, "");
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : "#";
  const currentStepIndex = statusOrder.indexOf(appointment.status);

  const percentPaid =
    appointment.totalAmount > 0
      ? Math.min(
          100,
          Math.round((appointment.advancePaid / appointment.totalAmount) * 100),
        )
      : 0;

  const netProfit = appointment.totalAmount - (appointment.vendorPayout || 0);
  const isStudio = appointment.venueType?.toLowerCase().includes("studio");

  return (
    <div className="p-3 sm:p-5 max-w-7xl mx-auto w-full space-y-4">
      {/* 1. Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/appointments"
          className="inline-flex items-center gap-2 text-xs font-semibold text-glam-text-muted hover:text-glam-accent transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Appointments</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold font-mono text-glam-text px-2.5 py-1 rounded-lg bg-glam-surface border border-glam-border/40">
            {appointment.code}
          </span>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-glam-accent/10 text-glam-accent hover:bg-glam-accent/20 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Pencil size={13} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* 2. Main Profile Header Banner */}
      <div className="bg-glam-surface/90 border border-glam-border/40 rounded-2xl md:rounded-3xl p-4 sm:p-6 backdrop-blur-md shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Client Info & Avatar */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-glam-accent/15 to-glam-accent/5 border border-glam-accent/20 text-glam-accent flex items-center justify-center font-outfit text-2xl font-bold shrink-0">
              {appointment.clientName?.charAt(0) || "C"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-outfit text-glam-text tracking-tight">
                  {appointment.clientName}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sc.bgLight} ${sc.textColor} ${sc.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  <span>{appointment.status}</span>
                </span>
              </div>
              <p className="text-xs font-medium text-glam-text-muted mt-0.5">
                <span className="text-glam-text font-semibold">
                  {appointment.serviceName}
                </span>{" "}
                ·{" "}
                <span className="text-[#a67c52] dark:text-glam-accent font-semibold">
                  {appointment.serviceCategory}
                </span>
              </p>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* 1. Dynamic Primary Workflow Next-Step Button */}
            {appointment.status === "Booked" && (
              <button
                type="button"
                onClick={() => setIsSendQuoteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
                title="Send quotation & advance details to client via WhatsApp"
              >
                <Send size={13} />
                <span>Send Quote</span>
              </button>
            )}

            {appointment.status === "Quote Sent" && (
              <button
                type="button"
                onClick={() => {
                  setPaymentType("advance");
                  setIsPaymentModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                title="Record advance payment from client"
              >
                <CreditCard size={13} />
                <span>
                  Collect Advance (₹
                  {(
                    appointment.advanceRequired ||
                    Math.round((appointment.totalAmount || 0) * 0.4)
                  ).toLocaleString("en-IN")}
                  )
                </span>
              </button>
            )}

            {appointment.status === "Confirmed" && (
              <button
                type="button"
                onClick={() => updateStatus(appointment.id, "In-Progress")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                title="Mark service as started"
              >
                <Clock size={13} />
                <span>Start Service</span>
              </button>
            )}

            {appointment.status === "In-Progress" && (
              <button
                type="button"
                onClick={() => {
                  if (appointment.balanceDue > 0) {
                    setPaymentType("balance");
                    setIsPaymentModalOpen(true);
                  } else {
                    updateStatus(appointment.id, "Completed");
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
                title={
                  appointment.balanceDue > 0
                    ? "Collect balance payment and finish"
                    : "Mark service completed"
                }
              >
                <Banknote size={13} />
                <span>
                  {appointment.balanceDue > 0
                    ? `Collect Balance (₹${(appointment.balanceDue || 0).toLocaleString(
                        "en-IN"
                      )})`
                    : "Complete Service"}
                </span>
              </button>
            )}

            {appointment.status === "Completed" && (
              <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold">
                <CheckCircle2 size={13} />
                <span>Service Completed</span>
              </div>
            )}

            {/* 2. Secondary Actions */}
            <button
              type="button"
              onClick={() => setIsSendQuoteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-glam-surface-alt border border-glam-border/40 text-glam-text hover:text-glam-accent text-xs font-semibold transition-colors cursor-pointer"
              title="Preview, download A4 PDF, or send quote to client"
            >
              <FileText size={13} />
              <span>Quote PDF</span>
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
            >
              <MessageSquare size={13} />
              <span>WhatsApp</span>
            </a>
            <a
              href={`tel:${appointment.clientPhone}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-glam-surface-alt border border-glam-border/40 text-glam-text hover:text-glam-accent text-xs font-semibold transition-colors"
            >
              <Phone size={13} />
              <span>Call Client</span>
            </a>
          </div>
        </div>

        {/* Integrated Clean Workflow Progress Stepper (Zero clutter, ultra-sleek) */}
        {appointment.status !== "Cancelled" && (
          <div className="mt-5 pt-4 border-t border-glam-border/30">
            <div className="flex items-center justify-between relative px-2 sm:px-6">
              {/* Connector line background */}
              <div className="absolute left-6 right-6 top-3.5 sm:top-4 h-0.5 bg-glam-border/40 z-0" />
              {/* Connector line progress */}
              <div
                className="absolute left-6 top-3.5 sm:top-4 h-0.5 bg-linear-to-r from-glam-accent to-emerald-500 z-0 transition-all duration-300"
                style={{
                  width:
                    currentStepIndex >= 0
                      ? `${(currentStepIndex / (WORKFLOW_STEPS.length - 1)) * 100}%`
                      : "0%",
                }}
              />

              {WORKFLOW_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex > idx;
                const isCurrent = currentStepIndex === idx;
                const Icon = step.icon;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleStepAction(step)}
                    className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                    title={`Click to navigate to ${step.label}`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                        isPassed
                          ? "bg-emerald-500 text-white shadow-xs"
                          : isCurrent
                          ? "bg-linear-to-r from-glam-accent to-glam-accent-2 text-white ring-4 ring-glam-accent/20 shadow-md scale-110"
                          : "bg-glam-surface border border-glam-border/60 text-glam-text-muted hover:border-glam-accent/50"
                      }`}
                    >
                      {isPassed ? <Check size={14} /> : <Icon size={13} />}
                    </div>
                    <span
                      className={`text-[10px] sm:text-[11px] mt-1.5 transition-colors text-center ${
                        isCurrent
                          ? "font-bold text-glam-text"
                          : isPassed
                          ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                          : "text-glam-text-muted group-hover:text-glam-text"
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>



      {/* 3. Grid Details (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2 spans) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Card 1: Client & Contact Info */}
          <div className="bg-glam-surface/90 border border-glam-border/40 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-glam-text-muted flex items-center gap-1.5">
              <User size={13} className="text-[#a67c52]" />
              Client Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30">
                <span className="text-[11px] font-medium text-glam-text-muted block">
                  Full Name
                </span>
                <span className="text-sm sm:text-base font-bold text-glam-text mt-0.5 block">
                  {appointment.clientName}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30">
                <span className="text-[11px] font-medium text-glam-text-muted block">
                  Mobile Phone
                </span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-sm sm:text-base font-bold text-glam-text">
                    {appointment.clientPhone}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(appointment.clientPhone, "phone")}
                    className="text-glam-text-muted hover:text-glam-accent cursor-pointer"
                    title="Copy phone"
                  >
                    {copiedField === "phone" ? (
                      <Check size={13} className="text-emerald-500" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
              </div>

              {appointment.clientEmail && (
                <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30 sm:col-span-2">
                  <span className="text-[11px] font-medium text-glam-text-muted block">
                    Email Address
                  </span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-sm font-semibold text-glam-text">
                      {appointment.clientEmail}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(appointment.clientEmail, "email")
                      }
                      className="text-glam-text-muted hover:text-glam-accent cursor-pointer"
                      title="Copy email"
                    >
                      {copiedField === "email" ? (
                        <Check size={13} className="text-emerald-500" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Service & Booking Information */}
          <div className="bg-glam-surface/90 border border-glam-border/40 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-glam-text-muted flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#a67c52]" />
              Service & Schedule Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30">
                <span className="text-[11px] font-medium text-glam-text-muted block">
                  Service Package
                </span>
                <span className="text-sm sm:text-base font-bold text-glam-text mt-0.5 block">
                  {appointment.serviceName}
                </span>
                <span className="text-[11px] font-semibold text-[#a67c52] dark:text-glam-accent mt-0.5 block">
                  Category: {appointment.serviceCategory}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30">
                <span className="text-[11px] font-medium text-glam-text-muted block">
                  Base Service Fee
                </span>
                <span className="text-sm sm:text-base font-bold text-glam-text mt-0.5 block font-outfit">
                  ₹{appointment.baseAmount?.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30">
                <span className="text-[11px] font-medium text-glam-text-muted block">
                  Event Date
                </span>
                <div className="flex items-center gap-1.5 mt-0.5 text-sm sm:text-base font-bold text-glam-text">
                  <Calendar size={14} className="text-[#a67c52]" />
                  <span>{formatDate(appointment.eventDate)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30">
                <span className="text-[11px] font-medium text-glam-text-muted block">
                  Call Time & Duration
                </span>
                <div className="flex items-center gap-1.5 mt-0.5 text-sm sm:text-base font-bold text-glam-accent font-outfit">
                  <Clock size={14} className="text-[#a67c52]" />
                  <span>{appointment.eventTime}</span>
                  {appointment.duration && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-glam-surface border border-glam-border/30 text-glam-text">
                      {formatDuration(appointment.duration)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Venue & Logistics */}
          <div className="bg-glam-surface/90 border border-glam-border/40 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-glam-text-muted flex items-center gap-1.5">
              <Building2 size={13} className="text-[#a67c52]" />
              Venue & Logistics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-glam-text-muted block">
                    Venue Name
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${
                      isStudio
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                        : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
                    }`}
                  >
                    <MapPin size={11} />
                    <span>{appointment.venueType}</span>
                  </span>
                </div>
                <span className="text-sm sm:text-base font-bold text-glam-text mt-1 block">
                  {appointment.venueName}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30">
                <span className="text-[11px] font-medium text-glam-text-muted block">
                  Venue Delta Surcharge
                </span>
                <span className="text-sm sm:text-base font-bold text-glam-text mt-0.5 block font-outfit">
                  +₹{(appointment.venueDelta || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30">
                <span className="text-[11px] font-medium text-glam-text-muted block">
                  Travel Fee
                </span>
                <span className="text-sm sm:text-base font-bold text-glam-text mt-0.5 block font-outfit">
                  +₹{(appointment.travelFee || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Vendor / Vendor Assignment */}
          <div className="bg-glam-surface/90 border border-glam-border/40 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-glam-text-muted flex items-center gap-1.5">
              <Users size={13} className="text-[#a67c52]" />
              Vendor Assignment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30 sm:col-span-2">
                <span className="text-[11px] font-medium text-glam-text-muted block">
                  Assigned Vendor / Vendor
                </span>
                <span className="text-sm sm:text-base font-bold text-glam-text mt-0.5 block">
                  {appointment.assignedVendorName || "None (Solo Artist)"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30">
                <span className="text-[11px] font-medium text-glam-text-muted block">
                  Vendor Payout
                </span>
                <span className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5 block font-outfit">
                  ₹{(appointment.vendorPayout || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30">
                <span className="text-[11px] font-medium text-glam-text-muted block">
                  GlamDesk Net Margin
                </span>
                <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-outfit">
                  ₹{netProfit.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Card 5: Notes & Styling Details */}
          {appointment.notes && (
            <div className="bg-glam-surface/90 border border-glam-border/40 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-glam-text-muted flex items-center gap-1.5">
                <FileText size={13} className="text-[#a67c52]" />
                Event Notes & Client Requests
              </h3>
              <p className="text-xs sm:text-sm font-medium text-glam-text leading-relaxed">
                {appointment.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column (1 span) */}
        <div className="space-y-4">
          {/* Card 1: Financial & Payment Status */}
          <div className="bg-glam-surface/90 border border-glam-border/40 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-glam-text flex items-center gap-1.5">
                <IndianRupee size={13} className="text-[#a67c52]" />
                Financial Overview
              </h3>
              <span className="text-xs font-bold text-[#a67c52] dark:text-glam-accent">
                {percentPaid}% Paid
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-glam-surface-alt border border-glam-border/30 overflow-hidden">
              <div
                className={`h-full bg-linear-to-r from-glam-accent to-emerald-500 rounded-full transition-all duration-500 ${
                  percentPaid >= 100
                    ? "w-full"
                    : percentPaid >= 75
                      ? "w-3/4"
                      : percentPaid >= 50
                        ? "w-1/2"
                        : percentPaid >= 25
                          ? "w-1/4"
                          : percentPaid > 0
                            ? "w-1/12"
                            : "w-0"
                }`}
              />
            </div>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30">
                <span className="text-glam-text-muted font-medium">
                  Total Quote
                </span>
                <span className="text-base sm:text-lg font-bold text-glam-text font-outfit">
                  ₹{appointment.totalAmount?.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30">
                <span className="text-glam-text-muted font-medium">
                  Advance Paid
                </span>
                <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-outfit">
                  ₹{appointment.advancePaid?.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30">
                <span className="text-glam-text-muted font-medium">
                  Balance Due
                </span>
                <span className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400 font-outfit">
                  ₹{appointment.balanceDue?.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Financial Quick Action Trigger */}
              {(appointment.status === "Quote Sent" ||
                (!appointment.advancePaid &&
                  appointment.status === "Booked")) && (
                <button
                  type="button"
                  onClick={() => {
                    setPaymentType("advance");
                    setIsPaymentModalOpen(true);
                  }}
                  className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <CreditCard size={13} />
                  <span>
                    Collect Advance (₹
                    {(
                      appointment.advanceRequired ||
                      Math.round((appointment.totalAmount || 0) * 0.4)
                    ).toLocaleString("en-IN")}
                    )
                  </span>
                </button>
              )}

              {appointment.balanceDue > 0 &&
                appointment.status !== "Completed" &&
                appointment.advancePaid > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentType("balance");
                      setIsPaymentModalOpen(true);
                    }}
                    className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 hover:opacity-95 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Banknote size={13} />
                    <span>
                      Collect Balance (₹
                      {(appointment.balanceDue || 0).toLocaleString("en-IN")})
                    </span>
                  </button>
                )}

              {(appointment.status === "Completed" ||
                appointment.paymentStatus === "Fully Paid") && (
                <div className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>Fully Settled & Paid</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsSendQuoteModalOpen(true)}
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-glam-surface-alt/70 hover:bg-glam-surface border border-glam-border/40 text-glam-text hover:text-glam-accent text-xs font-semibold transition-colors cursor-pointer"
              >
                <FileText size={13} className="text-glam-accent" />
                <span>Quotation PDF & Details</span>
              </button>
            </div>
          </div>

          {/* Card 2: Update Status Controls */}
          <div className="bg-glam-surface/90 border border-glam-border/40 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-glam-text-muted">
              Update Booking Status
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {[
                "Booked",
                "Quote Sent",
                "Confirmed",
                "In-Progress",
                "Completed",
                "Cancelled",
              ].map((st) => {
                const isActive = appointment.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => updateStatus(appointment.id, st)}
                    className={`px-2.5 py-2 rounded-xl text-[11px] transition-all cursor-pointer border ${
                      isActive
                        ? "bg-linear-to-r from-glam-accent to-glam-accent-2 text-white font-bold border-transparent shadow-xs"
                        : "bg-glam-surface-alt/60 border-glam-border/40 text-glam-text hover:border-glam-accent/50 font-semibold"
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Booking Reference Metadata */}
          <div className="bg-glam-surface/90 border border-glam-border/40 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xs space-y-2 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-glam-text-muted">
              Booking Metadata
            </h3>
            <div className="space-y-1.5 text-glam-text-muted text-[11px]">
              <div className="flex justify-between">
                <span>Booking ID:</span>
                <span className="font-bold font-mono text-glam-text">
                  {appointment.code}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Internal ID:</span>
                <span className="font-semibold font-mono text-glam-text">
                  {appointment.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-bold text-glam-text">
                  {appointment.paymentStatus || "Advance Paid"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md p-5 rounded-2xl bg-glam-surface border border-glam-border/60 shadow-xl space-y-4"
          >
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="text-base font-medium font-outfit text-glam-text">
                  Delete Appointment?
                </h4>
                <p className="text-xs text-glam-text-muted mt-0.5">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-glam-text-muted leading-relaxed">
              Are you sure you want to delete the booking for{" "}
              <span className="font-medium text-glam-text">
                {appointment.clientName}
              </span>{" "}
              ({appointment.code})?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-glam-border/30">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-glam-border/40 text-xs font-normal text-glam-text hover:bg-glam-surface-alt transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-normal hover:bg-rose-700 transition-colors cursor-pointer shadow-xs"
              >
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      <BookAppointmentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editingAppointment={appointment}
        onUpdateAppointment={(id, data) => {
          updateAppointment(id, data);
          setIsEditModalOpen(false);
        }}
        onAddAppointment={() => {}}
      />

      {/* Send Quote Modal */}
      <SendQuoteModal
        isOpen={isSendQuoteModalOpen}
        onClose={() => setIsSendQuoteModalOpen(false)}
        appointment={appointment}
        onQuoteSent={(quoteData) => {
          updateAppointment(appointment.id, quoteData);
        }}
      />

      {/* Record Payment Modal (UPI / Cash) */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        appointment={appointment}
        type={paymentType}
        onRecordPayment={(paymentData) => {
          updateAppointment(appointment.id, paymentData);
        }}
      />
    </div>
  );
};

export default AppointmentProfilePage;
