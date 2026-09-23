import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Users,
  Scissors,
  Sparkles,
  Smile,
  Gem,
  Camera,
  Crown,
  Edit2,
  Trash2,
  ArrowLeft,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Calendar,
  Clock,
  IndianRupee,
  Car,
  Star,
  CheckCircle2,
  CalendarX,
  Copy,
  Check,
  Building2,
  Briefcase,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { useVendors } from "../../context/VendorContext";
import {
  VendorModal,
  AvailabilityModal,
  DeleteVendorModal,
} from "./VendorModals";
import Pagination from "../../components/common/table/Pagination";

// ─── Role Icon Mapping ────────────────────────────────────────────────────────
const roleIcons = {
  "Hair Stylist": Scissors,
  "Saree Draper": Sparkles,
  "Assistant Makeup Artist": Smile,
  "Mehendi Artist": Gem,
  "Photographer / BTS": Camera,
  "Flower / Jewelry Stylist": Crown,
};

const getRoleIcon = (role) => {
  if (!role) return Users;
  if (roleIcons[role]) return roleIcons[role];
  const lower = role.toLowerCase();
  if (lower.includes("hair") || lower.includes("braid")) return Scissors;
  if (lower.includes("drap") || lower.includes("saree") || lower.includes("pleat")) return Sparkles;
  if (lower.includes("makeup") || lower.includes("artist") || lower.includes("skin")) return Smile;
  if (lower.includes("mehendi") || lower.includes("henna")) return Gem;
  if (lower.includes("photo") || lower.includes("video") || lower.includes("bts") || lower.includes("reel")) return Camera;
  if (lower.includes("flower") || lower.includes("jewel") || lower.includes("crown") || lower.includes("veni")) return Crown;
  return Users;
};

const VendorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getVendorById,
    updateVendor,
    deleteVendor,
    toggleActive,
    addBlackout,
    removeBlackout,
  } = useVendors();

  const vendor = getVendorById(id);

  // Active Tab State: "overview" | "schedule" | "gigs"
  const [activeTab, setActiveTab] = useState("overview");

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [gigPage, setGigPage] = useState(1);
  const gigPageSize = 5;

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveEdit = (savedData) => {
    if (!vendor) return;
    updateVendor(vendor.id, savedData);
    setIsEditModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!vendor) return;
    deleteVendor(vendor.id);
    setIsDeleteModalOpen(false);
    navigate("/masters/vendors");
  };

  if (!vendor) {
    return (
      <div className="p-4 sm:p-6 w-full max-w-[1600px] mx-auto">
        <div className="flex flex-col items-center justify-center p-12 bg-glam-surface border border-glam-border/40 rounded-3xl text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-bold font-outfit text-glam-text">
            Vendor Not Found
          </h2>
          <p className="text-xs text-glam-text-muted mt-1.5 max-w-sm">
            The Vendor profile you are looking for does not exist or has been
            removed.
          </p>
          <button
            type="button"
            onClick={() => navigate("/masters/vendors")}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white text-xs font-semibold shadow-sm hover:opacity-95 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Vendors</span>
          </button>
        </div>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(vendor.role);
  const hasBlackouts = vendor.blackouts && vendor.blackouts.length > 0;

  // Mock past/upcoming gigs for rich context
  const mockGigs = [
    {
      id: "gig-1",
      client: "Sindhu & Rahul Wedding",
      date: "Oct 24, 2026",
      slot: "03:00 AM - 09:00 AM",
      role: vendor.role,
      venue: "ITC Grand Chola, Chennai",
      payout: vendor.baseEventRate,
      status: "Upcoming",
    },
    {
      id: "gig-2",
      client: "Aishwarya Muhurtham",
      date: "Sep 14, 2026",
      slot: "04:30 AM - 10:00 AM",
      role: vendor.role,
      venue: "Mayor Ramanathan Hall, Chennai",
      payout: vendor.baseEventRate + vendor.perExtraHeadRate,
      status: "Completed",
    },
    {
      id: "gig-3",
      client: "Kavya Sangeet & Reception",
      date: "Aug 29, 2026",
      slot: "02:00 PM - 08:00 PM",
      role: vendor.role,
      venue: "Taj Coromandel, Chennai",
      payout: vendor.baseEventRate,
      status: "Completed",
    },
  ];

  return (
    <div className="p-4 sm:p-6 w-full max-w-[1600px] mx-auto space-y-5">
      {/* ── 1. Top Breadcrumb Bar ── */}
      <div className="flex items-center gap-2 text-xs font-medium text-glam-text-muted">
        <Link
          to="/masters/vendors"
          className="inline-flex items-center gap-1 hover:text-glam-accent transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Vendors</span>
        </Link>
        <span>/</span>
        <span className="text-glam-text font-semibold">{vendor.name}</span>
      </div>

      {/* ── 2. Unified Master Hero Banner ── */}
      <div className="relative overflow-hidden bg-glam-surface border border-glam-border/40 p-5 sm:p-6 rounded-2xl shadow-xs">
        <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-glam-accent to-glam-accent-2" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Identity & Core Badges */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-glam-accent/10 text-glam-accent flex items-center justify-center shrink-0 shadow-inner relative">
              <RoleIcon size={30} />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-glam-surface ${
                  !vendor.isActive
                    ? "bg-rose-500"
                    : hasBlackouts
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
                title={
                  !vendor.isActive
                    ? "Inactive"
                    : hasBlackouts
                      ? "Has Schedule Conflicts"
                      : "Active & Available"
                }
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold font-outfit text-glam-text">
                  {vendor.name}
                </h1>
                <span className="text-xs font-mono text-glam-text-muted bg-glam-surface-alt px-2 py-0.5 rounded-md border border-glam-border/40">
                  #{vendor.code}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Star size={11} className="fill-amber-500 text-amber-500" />
                  {vendor.rating || 5.0}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-glam-text-muted">
                <span className="inline-flex items-center gap-1.5 font-medium text-glam-text">
                  <RoleIcon size={13} className="text-glam-accent" />
                  {vendor.role}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} className="text-glam-accent" />
                  {vendor.city || "Local"}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Briefcase size={12} className="text-glam-accent" />
                  {vendor.completedEvents || 0} Events Completed
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions: Call, WhatsApp, Status, Edit, Delete */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-glam-border/30">
            {/* Quick Contact Buttons */}
            <a
              href={`tel:${vendor.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-glam-surface-alt border border-glam-border/50 text-xs font-semibold text-glam-text hover:text-glam-accent hover:border-glam-accent/40 transition-colors"
              title="Call Vendor"
            >
              <Phone size={13} className="text-glam-accent" />
              <span>Call</span>
            </a>

            <a
              href={`https://wa.me/${
                vendor.whatsapp?.replace(/[^0-9]/g, "") ||
                vendor.phone?.replace(/[^0-9]/g, "")
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
              title="Message on WhatsApp"
            >
              <MessageSquare size={13} />
              <span>WhatsApp</span>
            </a>

            {/* Status Toggle Button */}
            <button
              type="button"
              onClick={() => toggleActive(vendor.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                !vendor.isActive
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                  : hasBlackouts
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              }`}
              title="Toggle active status"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  !vendor.isActive
                    ? "bg-rose-500"
                    : hasBlackouts
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
              />
              <span>
                {!vendor.isActive
                  ? "Inactive"
                  : hasBlackouts
                    ? "Busy Slots"
                    : "Available 24/7"}
              </span>
            </button>

            {/* Edit Button */}
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-glam-surface-alt border border-glam-border/60 text-xs font-semibold text-glam-text hover:text-glam-accent hover:border-glam-accent/50 transition-all shadow-xs cursor-pointer"
            >
              <Edit2 size={13} className="text-glam-accent" />
              <span>Edit</span>
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-2 rounded-xl text-glam-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Delete Vendor"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Segmented Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-glam-border/40 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "overview"
              ? "bg-linear-to-r from-glam-accent to-glam-accent-2 text-white shadow-xs"
              : "bg-glam-surface text-glam-text-muted border border-glam-border/40 hover:text-glam-text hover:border-glam-accent/40"
          }`}
        >
          <IndianRupee size={14} />
          <span>Rates & Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("schedule")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "schedule"
              ? "bg-linear-to-r from-glam-accent to-glam-accent-2 text-white shadow-xs"
              : "bg-glam-surface text-glam-text-muted border border-glam-border/40 hover:text-glam-text hover:border-glam-accent/40"
          }`}
        >
          <Calendar size={14} />
          <span>Schedule & Availability</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === "schedule"
                ? "bg-white/20 text-white"
                : hasBlackouts
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {hasBlackouts ? `${vendor.blackouts.length} Blocked` : "Available"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gigs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "gigs"
              ? "bg-linear-to-r from-glam-accent to-glam-accent-2 text-white shadow-xs"
              : "bg-glam-surface text-glam-text-muted border border-glam-border/40 hover:text-glam-text hover:border-glam-accent/40"
          }`}
        >
          <Briefcase size={14} />
          <span>Gig History</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === "gigs"
                ? "bg-white/20 text-white"
                : "bg-glam-surface-alt text-glam-text-muted"
            }`}
          >
            {vendor.completedEvents || mockGigs.length}
          </span>
        </button>
      </div>

      {/* ── 4. Tab Contents ── */}

      {/* ── TAB 1: RATES & OVERVIEW ── */}
      {activeTab === "overview" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Rate Structure Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Base Event Payout */}
            <div className="p-5 rounded-2xl bg-glam-surface border border-glam-border/40 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-glam-text-muted uppercase tracking-wider">
                  Base Event Payout
                </span>
                <div className="w-8 h-8 rounded-lg bg-glam-accent/10 text-glam-accent flex items-center justify-center">
                  <IndianRupee size={15} />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold font-outfit text-glam-text">
                  ₹{vendor.baseEventRate.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-glam-text-muted font-normal ml-1">
                  / event
                </span>
              </div>
              <p className="text-xs text-glam-text-muted mt-1.5">
                Standard remuneration for single client bridal session.
              </p>
            </div>

            {/* Extra Head Rate */}
            <div className="p-5 rounded-2xl bg-glam-surface border border-glam-border/40 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-glam-text-muted uppercase tracking-wider">
                  Extra Head Rate
                </span>
                <div className="w-8 h-8 rounded-lg bg-glam-accent/10 text-glam-accent flex items-center justify-center">
                  <Users size={15} />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold font-outfit text-glam-text">
                  {vendor.perExtraHeadRate > 0
                    ? `+₹${vendor.perExtraHeadRate.toLocaleString("en-IN")}`
                    : "Included"}
                </span>
                {vendor.perExtraHeadRate > 0 && (
                  <span className="text-xs text-glam-text-muted font-normal ml-1">
                    / person
                  </span>
                )}
              </div>
              <p className="text-xs text-glam-text-muted mt-1.5">
                Additional guest or bridesmaid styling at same venue.
              </p>
            </div>

            {/* Travel Allowance */}
            <div className="p-5 rounded-2xl bg-glam-surface border border-glam-border/40 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-glam-text-muted uppercase tracking-wider">
                  Travel Surcharge
                </span>
                <div className="w-8 h-8 rounded-lg bg-glam-accent/10 text-glam-accent flex items-center justify-center">
                  <Car size={15} />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold font-outfit text-glam-text">
                  {vendor.travelSurcharge > 0
                    ? `+₹${vendor.travelSurcharge.toLocaleString("en-IN")}`
                    : "Local Included"}
                </span>
              </div>
              <p className="text-xs text-glam-text-muted mt-1.5">
                Outstation or distance transit reimbursement allowance.
              </p>
            </div>
          </div>

          {/* Two Balanced Columns: Expertise & Bio vs Banking Payout Account */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Bio & Specializations */}
            <div className="bg-glam-surface border border-glam-border/40 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold font-outfit text-glam-text">
                Expertise & Bio
              </h3>

              {vendor.bio ? (
                <p className="text-xs text-glam-text-muted leading-relaxed">
                  {vendor.bio}
                </p>
              ) : (
                <p className="text-xs text-glam-text-muted italic">
                  No bio entered for this Vendor yet.
                </p>
              )}

              {vendor.specializations && vendor.specializations.length > 0 && (
                <div>
                  <span className="text-[11px] font-medium text-glam-text-muted block mb-2">
                    Specializations:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {vendor.specializations.map((spec, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-normal px-3 py-1 rounded-lg bg-glam-surface-alt border border-glam-border/40 text-glam-text"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-glam-border/30 flex flex-wrap gap-4 text-xs text-glam-text-muted">
                {vendor.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail size={13} className="text-glam-accent" />
                    <span>{vendor.email}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Phone size={13} className="text-glam-accent" />
                  <span>{vendor.phone}</span>
                </span>
              </div>
            </div>

            {/* Right: Banking & Payout Account */}
            <div className="bg-glam-surface border border-glam-border/40 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-outfit text-glam-text">
                  Freelance Payout Account
                </h3>
                <Building2 size={16} className="text-glam-accent" />
              </div>

              {/* UPI Card */}
              <div className="p-3.5 rounded-xl bg-glam-surface-alt/60 border border-glam-border/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-glam-text-muted uppercase tracking-wider block">
                    UPI ID
                  </span>
                  <span className="text-sm font-mono font-medium text-glam-text mt-0.5 block">
                    {vendor.upiId ||
                      `${vendor.phone?.replace(/[^0-9]/g, "")}@upi`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      vendor.upiId ||
                        `${vendor.phone?.replace(/[^0-9]/g, "")}@upi`,
                      "upi",
                    )
                  }
                  className="p-2 rounded-lg bg-glam-surface border border-glam-border/40 hover:border-glam-accent/50 text-glam-text-muted hover:text-glam-accent transition-colors cursor-pointer"
                  title="Copy UPI ID"
                >
                  {copiedField === "upi" ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              {/* Bank Details Table */}
              <div className="space-y-2.5 text-xs pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-glam-text-muted">Bank Name</span>
                  <span className="font-medium text-glam-text">
                    {vendor.bankName || "HDFC Bank"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-glam-text-muted">Account Number</span>
                  <span className="font-mono font-medium text-glam-text">
                    {vendor.accountNumber || "•••• •••• 4821"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-glam-text-muted">IFSC Code</span>
                  <span className="font-mono font-medium text-glam-accent">
                    {vendor.ifsc || "HDFC0001234"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: SCHEDULE & AVAILABILITY ── */}
      {activeTab === "schedule" && (
        <div className="bg-glam-surface border border-glam-border/40 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold font-outfit text-glam-text">
                24-Hour Schedule & Conflict Management
              </h2>
              <p className="text-xs text-glam-text-muted mt-0.5">
                Vendors operate on 24-hour on-call availability. Block out time
                windows when booked or busy.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white text-xs font-semibold shadow-sm hover:opacity-95 transition-opacity cursor-pointer shrink-0"
            >
              <Plus size={14} />
              <span>Add Blackout Window</span>
            </button>
          </div>

          {/* Blackouts list or empty state */}
          {!vendor.blackouts || vendor.blackouts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-glam-surface-alt/30 border border-glam-border/30 text-center">
              <CheckCircle2
                size={28}
                className="text-emerald-500 mx-auto mb-2.5"
              />
              <h4 className="text-sm font-bold font-outfit text-glam-text">
                Available 24/7 On-Call
              </h4>
              <p className="text-xs text-glam-text-muted mt-1 max-w-md mx-auto">
                No upcoming schedule conflicts or blackouts registered. This
                Vendor is ready for assignment bookings.
              </p>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-glam-surface-alt border border-glam-border/50 text-xs font-semibold text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
              >
                <CalendarX size={14} />
                <span>Block Out a Time Window</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {vendor.blackouts.map((bo) => (
                <div
                  key={bo.id}
                  className="p-4 rounded-xl bg-glam-surface-alt/40 border border-glam-border/40 flex items-center justify-between gap-3 text-xs hover:border-glam-accent/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                      <Clock size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-glam-text font-outfit text-sm">
                          {bo.date}
                        </span>
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md">
                          {bo.startTime} – {bo.endTime}
                        </span>
                      </div>
                      <p className="text-xs text-glam-text-muted mt-0.5">
                        {bo.reason}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeBlackout(vendor.id, bo.id)}
                    className="p-2 rounded-lg text-glam-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                    title="Remove blocked window"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: GIG HISTORY (FULL WIDTH TABLE) ── */}
      {activeTab === "gigs" && (
        <div className="bg-glam-surface border border-glam-border/40 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-outfit text-glam-text">
                Recent Event Assignments
              </h2>
              <p className="text-xs text-glam-text-muted mt-0.5">
                Past appointments and assignment history for {vendor.name}.
              </p>
            </div>
            <span className="text-xs font-semibold text-glam-accent bg-glam-accent/10 px-3 py-1 rounded-xl">
              {vendor.completedEvents || mockGigs.length} Completed Events
            </span>
          </div>

          <div className="w-full overflow-hidden rounded-xl border border-glam-border/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-glam-border/40 bg-glam-surface-alt/40 text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
                    <th className="py-3 px-4">Event / Client</th>
                    <th className="py-3 px-4">Date & Slot</th>
                    <th className="py-3 px-4">Venue</th>
                    <th className="py-3 px-4">Payout</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glam-border/30">
                  {mockGigs
                    .slice((gigPage - 1) * gigPageSize, gigPage * gigPageSize)
                    .map((gig) => (
                      <tr
                        key={gig.id}
                        className="hover:bg-glam-surface-alt/30 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-glam-text font-outfit text-sm block">
                            {gig.client}
                          </span>
                          <span className="text-[11px] text-glam-text-muted mt-0.5 block">
                            {gig.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-normal text-glam-text">
                          <span>{gig.date}</span>
                          <span className="text-[11px] text-glam-text-muted block mt-0.5">
                            {gig.slot}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-normal text-glam-text-muted">
                          {gig.venue}
                        </td>
                        <td className="py-3.5 px-4 font-outfit font-normal text-glam-text">
                          ₹{gig.payout.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-normal ${
                              gig.status === "Upcoming"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {gig.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={gigPage}
              totalPages={Math.max(1, Math.ceil(mockGigs.length / gigPageSize))}
              totalItems={mockGigs.length}
              pageSize={gigPageSize}
              onPageChange={setGigPage}
              itemLabel="assignments"
            />
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <VendorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        editingVendor={vendor}
      />

      <AvailabilityModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        vendor={vendor}
        onAddBlackout={addBlackout}
        onRemoveBlackout={removeBlackout}
      />

      <DeleteVendorModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        vendorName={vendor.name}
      />
    </div>
  );
};

export default VendorProfilePage;
