import { useState } from "react";
import {
  X,
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
  Share2,
} from "lucide-react";

const statusConfig = {
  Booked: {
    textColor: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-500/10",
    dot: "bg-amber-500",
    icon: Calendar,
  },
  "Quote Sent": {
    textColor: "text-sky-600 dark:text-sky-400",
    bgLight: "bg-sky-500/10",
    dot: "bg-sky-500",
    icon: MessageSquare,
  },
  Confirmed: {
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-500/10",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  "In-Progress": {
    textColor: "text-purple-600 dark:text-purple-400",
    bgLight: "bg-purple-500/15",
    dot: "bg-purple-500",
    icon: Clock,
  },
  Completed: {
    textColor: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-500/10",
    dot: "bg-blue-500",
    icon: CheckCircle2,
  },
  Cancelled: {
    textColor: "text-rose-600 dark:text-rose-400",
    bgLight: "bg-rose-500/10",
    dot: "bg-rose-500",
    icon: XCircle,
  },
};

const AppointmentDetailsModal = ({ appointment, onClose, onUpdateStatus }) => {
  if (!appointment) return null;

  const sc = statusConfig[appointment.status] || statusConfig.Confirmed;
  const StatusIcon = sc.icon;

  const cleanPhone = (appointment.clientPhone || "").replace(/[^0-9]/g, "");
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : "#";

  const percentPaid =
    appointment.totalAmount > 0
      ? Math.min(
          100,
          Math.round((appointment.advancePaid / appointment.totalAmount) * 100),
        )
      : 0;

  const netProfit = appointment.totalAmount - (appointment.vendorPayout || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl bg-glam-surface border border-glam-border/60 shadow-2xl p-4 sm:p-5 space-y-3.5"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-glam-border/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-glam-accent/10 text-glam-accent flex items-center justify-center font-bold font-outfit text-base shrink-0">
              {appointment.clientName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-outfit text-glam-text">
                  {appointment.clientName}
                </h2>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-glam-surface-alt border border-glam-border/40 text-glam-text-muted">
                  #{appointment.code}
                </span>
              </div>
              <p className="text-[11px] text-glam-text-muted mt-0.5">
                Created Booking · {appointment.serviceCategory}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.bgLight} ${sc.textColor}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {appointment.status}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-glam-surface-alt text-glam-text-muted hover:text-glam-text flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Quick Contact Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 p-2.5 rounded-xl bg-glam-surface-alt/40 border border-glam-border/40">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-glam-text">
              <Phone size={12} className="text-glam-accent" />
              <span className="font-semibold">{appointment.clientPhone}</span>
            </div>
            {appointment.clientEmail && (
              <div className="flex items-center gap-1.5 text-glam-text-muted">
                <Mail size={12} className="text-glam-accent" />
                <span className="text-[11px]">{appointment.clientEmail}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
            >
              <MessageSquare size={12} />
              <span>WhatsApp</span>
            </a>
            <a
              href={`tel:${appointment.clientPhone}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-glam-accent/10 text-glam-accent text-xs font-semibold hover:bg-glam-accent/20 transition-colors"
            >
              <Phone size={12} />
              <span>Call Client</span>
            </a>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Card 1: Service Package */}
          <div className="p-3 rounded-xl bg-glam-surface border border-glam-border/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-glam-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-glam-accent" />
                Service Package
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-glam-accent/10 text-glam-accent">
                {appointment.serviceCategory}
              </span>
            </div>
            <h4 className="text-xs font-bold text-glam-text">
              {appointment.serviceName}
            </h4>
            <div className="flex items-center justify-between text-xs text-glam-text-muted pt-0.5">
              <span>Base Rate</span>
              <span className="font-bold text-glam-text font-outfit">
                ₹{appointment.baseAmount?.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Card 2: Schedule & Timing */}
          <div className="p-3 rounded-xl bg-glam-surface border border-glam-border/40 space-y-1">
            <span className="text-[10px] font-bold text-glam-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={12} className="text-glam-accent" />
              Event Schedule
            </span>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-glam-text">
                {appointment.eventDate}
              </h4>
            </div>
            <div className="flex items-center justify-between text-xs text-glam-text-muted pt-0.5">
              <span className="flex items-center gap-1">
                <Clock size={11} className="text-glam-accent" />
                Call Time
              </span>
              <span className="font-bold text-glam-accent font-outfit">
                {appointment.eventTime} ({appointment.duration} mins)
              </span>
            </div>
          </div>

          {/* Card 3: Venue & Travel */}
          <div className="p-3 rounded-xl bg-glam-surface border border-glam-border/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-glam-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={12} className="text-glam-accent" />
                Venue & Logistics
              </span>
              <span className="text-[10px] font-semibold text-glam-text-muted">
                {appointment.venueType}
              </span>
            </div>
            <h4 className="text-xs font-bold text-glam-text truncate">
              {appointment.venueName}
            </h4>
            <div className="flex items-center justify-between text-[11px] text-glam-text-muted pt-0.5">
              <span>Venue Delta Surcharge</span>
              <span className="font-bold text-glam-text font-outfit">
                +₹{appointment.venueDelta?.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-glam-text-muted">
              <span>Travel Fee</span>
              <span className="font-bold text-glam-text font-outfit">
                +₹{appointment.travelFee?.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Card 4: Collaborator / Vendor */}
          <div className="p-3 rounded-xl bg-glam-surface border border-glam-border/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-glam-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Users size={12} className="text-glam-accent" />
                Assigned Vendor
              </span>
            </div>
            <h4 className="text-xs font-bold text-glam-text truncate">
              {appointment.assignedVendorName}
            </h4>
            <div className="flex items-center justify-between text-[11px] text-glam-text-muted pt-0.5">
              <span>Vendor Payout</span>
              <span className="font-bold text-rose-500 font-outfit">
                ₹{(appointment.vendorPayout || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-glam-text-muted">
              <span>GlamDesk Net Margin</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-outfit">
                ₹{netProfit.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Financial & Payment Tracker */}
        <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-glam-text uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee size={13} className="text-glam-accent" />
              Payment & Invoice Overview
            </span>
            <span className="text-[11px] font-bold text-glam-accent">
              {percentPaid}% Paid
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-glam-surface border border-glam-border/40 overflow-hidden">
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

          <div className="grid grid-cols-3 gap-2 text-xs pt-0.5">
            <div className="p-2 rounded-lg bg-glam-surface border border-glam-border/40 text-center">
              <p className="text-[10px] text-glam-text-muted">Total Quote</p>
              <p className="font-bold font-outfit text-glam-text text-xs mt-0.5">
                ₹{appointment.totalAmount?.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="p-2 rounded-lg bg-glam-surface border border-glam-border/40 text-center">
              <p className="text-[10px] text-glam-text-muted">Advance Paid</p>
              <p className="font-bold font-outfit text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">
                ₹{appointment.advancePaid?.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="p-2 rounded-lg bg-glam-surface border border-glam-border/40 text-center">
              <p className="text-[10px] text-glam-text-muted">Balance Due</p>
              <p className="font-bold font-outfit text-rose-500 text-xs mt-0.5">
                ₹{appointment.balanceDue?.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Special Instructions / Notes */}
        {appointment.notes && (
          <div className="p-3 rounded-xl bg-glam-surface border border-glam-border/40 space-y-1">
            <span className="text-[10px] font-bold text-glam-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={12} className="text-glam-accent" />
              Event Notes & Styling Details
            </span>
            <p className="text-xs text-glam-text leading-relaxed">
              {appointment.notes}
            </p>
          </div>
        )}

        {/* Status Update Quick Bar & Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-glam-border/40">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-glam-text-muted font-medium mr-1">
              Change Status:
            </span>
            {["Confirmed", "In-Progress", "Completed", "Cancelled"].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => onUpdateStatus(appointment.id, st)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    appointment.status === st
                      ? "bg-glam-accent text-white"
                      : "bg-glam-surface-alt border border-glam-border/40 text-glam-text-muted hover:text-glam-accent"
                  }`}
                >
                  {st}
                </button>
              ),
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-glam-surface-alt border border-glam-border/50 text-xs font-semibold text-glam-text hover:bg-glam-accent/10 transition-colors cursor-pointer text-center"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;
