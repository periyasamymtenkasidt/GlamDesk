import { useState, useMemo } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  IndianRupee,
  Crown,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  ExternalLink,
  Check,
  Copy,
  Pencil,
  MessageSquare,
  CreditCard,
  Banknote,
  Receipt,
  ArrowUpRight,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { useClients } from "../../context/ClientContext";
import { useAppointments } from "../../context/AppointmentContext";
import Modal from "../../components/modals/Modal";
import { Input, ThemeSelect, Checkbox } from "../../components/common/form";

// ─── Category Badge Config ────────────────────────────────────────────────────
const categoryConfig = {
  Bridal: {
    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Crown,
    dot: "bg-amber-500",
  },
  VIP: {
    bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: Sparkles,
    dot: "bg-purple-500",
  },
  Celebrity: {
    bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: Crown,
    dot: "bg-rose-500",
  },
  Regular: {
    bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    icon: User,
    dot: "bg-sky-500",
  },
};

// ─── Date Formatting Helper ───────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const monthName = months[parseInt(m, 10) - 1] || m;
    return `${parseInt(d, 10)} ${monthName} ${y}`;
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

// ─── Edit Client Modal ────────────────────────────────────────────────────────
const EditClientModal = ({ isOpen, onClose, client, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "Chennai",
    category: "Bridal",
    status: "Active",
    notes: "",
  });

  useMemo(() => {
    if (client) {
      setFormData({
        name: client.name || "",
        phone: client.phone || "",
        email: client.email || "",
        city: client.city || "Chennai",
        category: client.category || "Bridal",
        status: client.status || "Active",
        notes: client.notes || "",
      });
    }
  }, [client, isOpen]);

  if (!isOpen || !client) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    onSave({
      ...formData,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      city: formData.city.trim(),
      notes: formData.notes.trim(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <Modal.Header
        title="Edit Client Profile"
        icon={User}
        onClose={onClose}
      />
      <Modal.Body>
        <form id="edit-client-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Client Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Phone Number"
            required
            type="tel"
            icon={Phone}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              icon={MapPin}
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted mb-1 block">
                Category
              </label>
              <ThemeSelect
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                options={[
                  { value: "Bridal", label: "👑 Bridal" },
                  { value: "Regular", label: "👤 Regular" },
                  { value: "VIP", label: "✨ VIP" },
                  { value: "Celebrity", label: "🌟 Celebrity" },
                ]}
                triggerClassName="h-10 rounded-xl border-glam-border/60 bg-glam-surface-alt text-xs"
              />
            </div>
          </div>

          <Input
            label="Skin & Styling Notes"
            placeholder="e.g. Dry skin, hypoallergenic products only, soft glam lover"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <Checkbox
            label="Active Client Status"
            description="Client is in good standing and ready for bookings"
            checked={formData.status === "Active"}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.checked ? "Active" : "Inactive" })
            }
          />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-10 rounded-xl border border-glam-border/60 bg-glam-surface-alt/30 text-xs font-semibold text-glam-text hover:bg-glam-surface-alt/60 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="edit-client-form"
          className="flex-1 h-10 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-xs font-bold text-white hover:opacity-95 shadow-md transition-all cursor-pointer"
        >
          Save Changes
        </button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
const DeleteModal = ({ isOpen, onClose, onConfirm, clientName }) => (
  <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xs" zIndex="z-70">
    <Modal.Body className="text-center pt-2">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
        <AlertTriangle size={22} />
      </div>
      <h3 className="text-lg font-bold font-outfit text-glam-text">
        Remove Client?
      </h3>
      <p className="text-xs text-glam-text-muted mt-1.5 leading-relaxed">
        Are you sure you want to remove{" "}
        <span className="font-semibold text-glam-text">&ldquo;{clientName}&rdquo;</span> from Client Master?
        Their past appointments will remain preserved.
      </p>
    </Modal.Body>
    <Modal.Footer>
      <button
        onClick={onClose}
        className="flex-1 h-10 rounded-xl border border-glam-border/50 bg-glam-surface-alt/30 text-xs font-semibold text-glam-text hover:bg-glam-surface-alt/60 cursor-pointer"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className="flex-1 h-10 rounded-xl bg-rose-500 text-xs font-semibold text-white hover:bg-rose-600 shadow-md transition-colors cursor-pointer"
      >
        Remove
      </button>
    </Modal.Footer>
  </Modal>
);

// ─── Main Client Profile Page Component ───────────────────────────────────────
const ClientProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getClientById, updateClient, deleteClient } = useClients();
  const { appointments } = useAppointments();

  const client = getClientById(id);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    ["overview", "appointments", "financials"].includes(urlTab) ? urlTab : "overview"
  );

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tabId);
      return next;
    }, { replace: true });
  };

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveEdit = async (savedData) => {
    if (!client) return;
    await updateClient(client.id, savedData);
    setIsEditModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!client) return;
    await deleteClient(client.id);
    setIsDeleteModalOpen(false);
    navigate("/clients");
  };

  // Find all appointments matching this client
  const clientAppointments = useMemo(() => {
    if (!client) return [];

    const cleanClientPhone = (client.phone || "").replace(/[^0-9]/g, "").slice(-10);
    const cleanClientEmail = (client.email || "").toLowerCase().trim();

    return appointments.filter((apt) => {
      const aptPhone = (apt.clientPhone || "").replace(/[^0-9]/g, "").slice(-10);
      const aptEmail = (apt.clientEmail || "").toLowerCase().trim();
      const isPhoneMatch = cleanClientPhone && aptPhone && cleanClientPhone === aptPhone;
      const isEmailMatch = cleanClientEmail && aptEmail && cleanClientEmail === aptEmail;
      const isNameMatch = apt.clientName?.toLowerCase() === client.name?.toLowerCase();
      const isLinked = (client.linkedAppointments || []).some(
        (la) => la.appointmentId === apt.id || la.code === apt.code
      );
      return isPhoneMatch || isEmailMatch || isLinked || isNameMatch;
    });
  }, [client, appointments]);

  if (!client) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center p-12 bg-glam-surface border border-glam-border/40 rounded-3xl text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-medium font-outfit text-glam-text">
            Client Profile Not Found
          </h2>
          <p className="text-xs text-glam-text-muted mt-1.5 max-w-sm">
            The client record you are looking for does not exist or has been removed.
          </p>
          <button
            type="button"
            onClick={() => navigate("/clients")}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white text-xs font-medium shadow-xs hover:opacity-95 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Clients</span>
          </button>
        </div>
      </div>
    );
  }

  const cat = categoryConfig[client.category] || categoryConfig.Regular;
  const CatIcon = cat.icon;

  const cleanPhone = (client.phone || "").replace(/[^0-9]/g, "");
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Hello ${client.name}! Greetings from GlamDesk Atelier. How can we assist you with your upcoming session?`
      )}`
    : "#";

  // Financial Computations
  const totalBookingsCount = Math.max(
    Number(client.totalBookings) || 0,
    clientAppointments.length,
    client.linkedAppointments?.length || 0
  );

  const totalSpentAmt = clientAppointments.length > 0
    ? clientAppointments.reduce((sum, a) => sum + (Number(a.totalAmount) || 0), 0)
    : Number(client.totalSpent) || 0;

  const totalAdvancesPaid = clientAppointments.reduce(
    (sum, a) => sum + (Number(a.advancePaid) || 0),
    0
  );

  const totalOutstandingBalance = clientAppointments.reduce(
    (sum, a) => sum + (Number(a.balanceDue) || 0),
    0
  );

  const avgSessionSpend = totalBookingsCount > 0 ? Math.round(totalSpentAmt / totalBookingsCount) : 0;

  return (
    <div className="p-3 sm:p-5 max-w-7xl mx-auto w-full space-y-4">
      {/* 1. Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/clients"
          className="inline-flex items-center gap-2 text-xs font-semibold text-glam-text-muted hover:text-glam-accent transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Clients</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold font-mono text-glam-text px-2.5 py-1 rounded-lg bg-glam-surface border border-glam-border/40">
            #{client.code || "CLI"}
          </span>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-glam-accent/10 text-glam-accent hover:bg-glam-accent/20 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Pencil size={13} />
            <span>Edit Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
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
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-glam-accent/20 to-glam-accent/5 border border-glam-accent/30 text-glam-accent flex items-center justify-center font-outfit text-2xl font-bold shrink-0">
              {client.name?.charAt(0) || "C"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-outfit text-glam-text tracking-tight">
                  {client.name}
                </h1>

                {/* Category Pill */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cat.bg}`}
                >
                  <CatIcon size={12} />
                  <span>{client.category || "Regular"}</span>
                </span>

                {/* Active Status Button */}
                <button
                  onClick={() =>
                    updateClient(client.id, {
                      status: client.status === "Active" ? "Inactive" : "Active",
                    })
                  }
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    client.status === "Active"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                  }`}
                  title="Click to toggle status"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      client.status === "Active" ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                  <span>{client.status || "Active"}</span>
                </button>
              </div>

              {/* Source & Location Tag */}
              <div className="flex items-center gap-2 mt-1 text-xs text-glam-text-muted flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin size={11} className="text-glam-accent" />
                  <span>{client.city || "Chennai"}</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-glam-surface-alt px-2 py-0.5 rounded-md border border-glam-border/30">
                  {client.source === "Appointment Conversion"
                    ? "⚡ Converted from Booking"
                    : "👤 Direct CRM Entry"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {cleanPhone && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-bold hover:bg-emerald-500/25 transition-colors cursor-pointer"
              >
                <MessageSquare size={13} />
                <span>WhatsApp</span>
              </a>
            )}

            <a
              href={`tel:${client.phone}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-glam-surface-alt border border-glam-border/40 text-glam-text hover:text-glam-accent text-xs font-semibold transition-colors"
            >
              <Phone size={13} />
              <span>Call Client</span>
            </a>

            {client.email && (
              <a
                href={`mailto:${client.email}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-glam-surface-alt border border-glam-border/40 text-glam-text hover:text-glam-accent text-xs font-semibold transition-colors"
              >
                <Mail size={13} />
                <span>Send Email</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 3. KPI Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          icon={Calendar}
          title="Total Bookings"
          value={totalBookingsCount}
          subtitle="Confirmed & Completed Sessions"
        />
        <StatCard
          icon={IndianRupee}
          title="Lifetime Spend"
          value={`₹${totalSpentAmt.toLocaleString("en-IN")}`}
          subtitle="Total Cumulative Spend"
        />
        <StatCard
          icon={Sparkles}
          title="Average Ticket"
          value={`₹${avgSessionSpend.toLocaleString("en-IN")}`}
          subtitle="Average Spend Per Session"
        />
        <StatCard
          icon={Clock}
          title="Last Visit Date"
          value={formatDate(client.lastVisit) || client.lastVisit || "Recent"}
          subtitle="Latest Event Session"
        />
      </div>

      {/* 4. Tab Navigation Strip */}
      <div className="flex items-center gap-1 border-b border-glam-border/40 pb-px">
        {[
          { id: "overview", label: "Overview & Profile", icon: User },
          {
            id: "appointments",
            label: `Appointments (${clientAppointments.length || client.linkedAppointments?.length || 0})`,
            icon: Calendar,
          },
          { id: "financials", label: "Financials & Payments", icon: IndianRupee },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-glam-surface text-glam-accent border border-glam-border/50 shadow-2xs"
                  : "text-glam-text-muted hover:text-glam-text hover:bg-glam-surface/40"
              }`}
            >
              <TabIcon size={14} className={isActive ? "text-glam-accent" : "text-glam-text-muted"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 5. Tab 1: Overview & Profile */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact & Personal Details Card */}
          <div className="bg-glam-surface border border-glam-border/40 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-outfit text-glam-text flex items-center gap-2">
              <Phone size={16} className="text-glam-accent" />
              <span>Contact & Communication</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-glam-surface-alt/50 border border-glam-border/30">
                <span className="text-glam-text-muted">Primary Mobile:</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${client.phone}`}
                    className="font-medium text-glam-text hover:text-glam-accent"
                  >
                    {client.phone}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(client.phone, "phone")}
                    className="p-1 rounded-md text-glam-text-muted hover:text-glam-text cursor-pointer"
                    title="Copy phone"
                  >
                    {copiedField === "phone" ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-glam-surface-alt/50 border border-glam-border/30">
                <span className="text-glam-text-muted">Email Address:</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${client.email}`}
                    className="font-medium text-glam-text hover:text-glam-accent truncate max-w-[200px]"
                  >
                    {client.email || "No email on file"}
                  </a>
                  {client.email && (
                    <button
                      type="button"
                      onClick={() => handleCopy(client.email, "email")}
                      className="p-1 rounded-md text-glam-text-muted hover:text-glam-text cursor-pointer"
                      title="Copy email"
                    >
                      {copiedField === "email" ? (
                        <Check size={12} className="text-emerald-500" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-glam-surface-alt/50 border border-glam-border/30">
                <span className="text-glam-text-muted">City / Region:</span>
                <span className="font-semibold text-glam-text">
                  {client.city || "Chennai, Tamil Nadu"}
                </span>
              </div>
            </div>
          </div>

          {/* Skin & Styling Preferences Card */}
          <div className="bg-glam-surface border border-glam-border/40 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-outfit text-glam-text flex items-center gap-2">
              <Sparkles size={16} className="text-glam-accent" />
              <span>Skin Profile & Styling Notes</span>
            </h3>

            {client.notes ? (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
                <p className="font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  Bridal & Artist Notes
                </p>
                <p className="text-glam-text leading-relaxed text-xs">
                  {client.notes}
                </p>
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-glam-surface-alt/40 border border-glam-border/30">
                <p className="text-xs text-glam-text-muted">
                  No specific skin profile or styling notes recorded yet.
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="mt-2 text-xs font-semibold text-glam-accent hover:underline cursor-pointer"
                >
                  + Add Styling Notes
                </button>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-glam-surface-alt/50 border border-glam-border/30 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-glam-text-muted">Preferred Finish:</span>
                <span className="font-medium text-glam-text">
                  {client.category === "Bridal" ? "Royal HD Dewy / Temple Gold" : "Soft Glam Natural"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-glam-text-muted">Client Segment:</span>
                <span className="font-medium text-glam-text">
                  {client.category === "VIP" ? "High-Priority VIP" : "Standard Bridal"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab 2: Appointments History */}
      {activeTab === "appointments" && (
        <div className="bg-glam-surface border border-glam-border/40 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold font-outfit text-glam-text">
                Appointment Sessions Timeline
              </h3>
              <p className="text-xs text-glam-text-muted mt-0.5">
                All booking records and sessions linked to {client.name}.
              </p>
            </div>

            <Link
              to="/appointments"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-glam-surface-alt border border-glam-border/50 text-xs font-semibold text-glam-text hover:text-glam-accent transition-colors"
            >
              <span>View All Appointments</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          {clientAppointments.length === 0 && (client.linkedAppointments || []).length === 0 ? (
            <div className="p-8 text-center bg-glam-surface-alt/30 rounded-2xl border border-glam-border/30">
              <Calendar size={24} className="mx-auto text-glam-text-muted mb-2" />
              <p className="text-xs font-semibold text-glam-text">No appointments found</p>
              <p className="text-[11px] text-glam-text-muted mt-0.5">
                This client does not have any recorded bookings yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(clientAppointments.length > 0 ? clientAppointments : client.linkedAppointments).map(
                (apt, idx) => (
                  <div
                    key={apt.id || apt.appointmentId || apt.code || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-glam-surface-alt/40 border border-glam-border/40 hover:border-glam-accent/50 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-glam-surface border border-glam-border/40 text-glam-accent">
                          #{apt.code || "APT"}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-glam-text truncate">
                          {apt.serviceName || "Bridal Service"}
                        </h4>
                        {apt.status && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {apt.status}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-glam-text-muted flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-glam-accent" />
                          <span>{formatDate(apt.eventDate) || apt.eventDate || "Date TBD"}</span>
                        </span>
                        {apt.eventTime && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            <span>{apt.eventTime}</span>
                          </span>
                        )}
                        {apt.venueName && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            <span>{apt.venueName}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-glam-border/30">
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-bold font-outfit text-emerald-600 dark:text-emerald-400">
                          ₹{(apt.totalAmount || 0).toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] text-glam-text-muted">
                          {apt.paymentStatus || "Advance Paid"}
                        </p>
                      </div>

                      {(apt.id || apt.appointmentId) && (
                        <Link
                          to={`/appointments/${apt.id || apt.appointmentId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-glam-accent text-white text-xs font-semibold hover:opacity-95 shadow-2xs transition-all"
                        >
                          <span>Open</span>
                          <ArrowUpRight size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* 7. Tab 3: Financials & Payments */}
      {activeTab === "financials" && (
        <div className="bg-glam-surface border border-glam-border/40 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold font-outfit text-glam-text">
            Financial & Payment Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-glam-surface-alt/50 border border-glam-border/30 text-center">
              <p className="text-xs text-glam-text-muted uppercase font-semibold">Total Invoiced</p>
              <p className="text-lg font-bold font-outfit text-glam-text mt-1">
                ₹{totalSpentAmt.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Advances Received</p>
              <p className="text-lg font-bold font-outfit text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{totalAdvancesPaid.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-xs text-amber-600 dark:text-amber-400 uppercase font-semibold">Outstanding Balance</p>
              <p className="text-lg font-bold font-outfit text-amber-600 dark:text-amber-400 mt-1">
                ₹{totalOutstandingBalance.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-glam-surface-alt/40 border border-glam-border/30 text-xs text-glam-text-muted">
            <p className="font-semibold text-glam-text mb-1">Billing Policy Notes</p>
            <p>
              Official clients are charged the standard 40% booking deposit. All advance transactions and UPI receipts are recorded directly within their associated appointment profile.
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={client}
        onSave={handleSaveEdit}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        clientName={client.name}
      />
    </div>
  );
};

export default ClientProfilePage;
