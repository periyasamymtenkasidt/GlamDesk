import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  Plus,
  Crown,
  IndianRupee,
  Eye,
  Edit2,
  Trash2,
  MessageSquare,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";
import { useClients } from "../../context/ClientContext";
import { clientCategories } from "../../data/clientData";
import { Table } from "../../components/common/table";
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

// ─── Add / Edit Client Modal ──────────────────────────────────────────────────
const ClientModal = ({ isOpen, onClose, onSave, editingClient }) => {
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
    if (editingClient) {
      setFormData({
        name: editingClient.name || "",
        phone: editingClient.phone || "",
        email: editingClient.email || "",
        city: editingClient.city || "Chennai",
        category: editingClient.category || "Bridal",
        status: editingClient.status || "Active",
        notes: editingClient.notes || "",
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        email: "",
        city: "Chennai",
        category: "Bridal",
        status: "Active",
        notes: "",
      });
    }
  }, [editingClient, isOpen]);

  if (!isOpen) return null;

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
        title={editingClient ? "Edit Client Profile" : "Register New Client"}
        icon={User}
        onClose={onClose}
      />
      <Modal.Body>
        <form id="client-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Client Full Name"
            required
            placeholder="e.g. Meenakshi Sundaram"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Phone Number (WhatsApp)"
            required
            type="tel"
            icon={Phone}
            placeholder="+91 98410 55667"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="client@gmail.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              icon={MapPin}
              placeholder="Chennai"
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
          form="client-form"
          className="flex-1 h-10 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-xs font-bold text-white hover:opacity-95 shadow-md transition-all cursor-pointer"
        >
          {editingClient ? "Save Changes" : "Create Client"}
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

// ─── Main Clients Page (Table View) ───────────────────────────────────────────
const ClientsPage = () => {
  const navigate = useNavigate();
  const { clients, addClient, updateClient, deleteClient } = useClients();

  const [selectedStatus, setSelectedStatus] = useState("All");

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Key KPI Metrics
  const stats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter((c) => c.status === "Active").length;
    const bridalCount = clients.filter((c) => c.category === "Bridal").length;
    const totalRevenue = clients.reduce((sum, c) => sum + (Number(c.totalSpent) || 0), 0);
    const avgSpend = total > 0 ? Math.round(totalRevenue / total) : 0;
    return { total, active, bridalCount, totalRevenue, avgSpend };
  }, [clients]);

  const handleToggleStatus = (id, newStatus) => {
    updateClient(id, { status: newStatus });
  };

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (client) => {
    setEditingClient(client);
    setIsAddEditModalOpen(true);
  };

  const handleSaveClient = async (savedData) => {
    if (editingClient) {
      await updateClient(editingClient.id, savedData);
    } else {
      await addClient(savedData);
    }
    setIsAddEditModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await deleteClient(deletingId);
      setDeletingId(null);
    }
  };

  const deletingClientObj = clients.find((c) => c.id === deletingId);

  // Secondary Filter Dropdown (Active Status)
  const statusFilterDropdown = useMemo(
    () => ({
      label: "STATUS",
      options: [
        { label: "All Statuses", value: "All" },
        { label: "Active Clients", value: "Active" },
        { label: "Inactive Clients", value: "Inactive" },
      ],
      value: selectedStatus,
      onChange: (val) => setSelectedStatus(val),
      filterFn: (item, val) => {
        if (!val || val === "All" || val === "All Statuses") return true;
        return item.status === val;
      },
    }),
    [selectedStatus]
  );

  // Sorting Options matching TableSort
  const sortOptions = useMemo(
    () => [
      {
        label: "Recently Active",
        value: "recent",
        compare: (a, b) => (b.lastVisit || "").localeCompare(a.lastVisit || ""),
      },
      {
        label: "Highest Spend",
        value: "spend-high",
        compare: (a, b) => (Number(b.totalSpent) || 0) - (Number(a.totalSpent) || 0),
      },
      {
        label: "Lowest Spend",
        value: "spend-low",
        compare: (a, b) => (Number(a.totalSpent) || 0) - (Number(b.totalSpent) || 0),
      },
      {
        label: "Most Bookings",
        value: "bookings-high",
        compare: (a, b) => (Number(b.totalBookings) || 0) - (Number(a.totalBookings) || 0),
      },
      {
        label: "Name (A–Z)",
        value: "name-asc",
        compare: (a, b) => (a.name || "").localeCompare(b.name || ""),
      },
      {
        label: "Name (Z–A)",
        value: "name-desc",
        compare: (a, b) => (b.name || "").localeCompare(a.name || ""),
      },
    ],
    []
  );

  // Table Column Definitions
  const columns = useMemo(
    () => [
      {
        key: "code",
        header: "CLIENT ID",
        cell: (client) => (
          <span className="inline-block px-2.5 py-1 rounded-lg bg-[#f6eae0] dark:bg-white/5 border border-glam-border/30 text-[11px] font-mono text-glam-text font-bold">
            #{client.code || "CLI"}
          </span>
        ),
      },
      {
        key: "name",
        header: "CLIENT",
        cell: (client) => (
          <span className="font-semibold text-xs sm:text-sm text-glam-text group-hover:text-glam-accent transition-colors truncate block">
            {client.name}
          </span>
        ),
      },
      {
        key: "phone",
        header: "CONTACT",
        cell: (client) => (
          <div className="flex items-center gap-1.5 text-xs text-glam-text font-normal whitespace-nowrap">
            <Phone size={12} className="text-glam-accent shrink-0" />
            <span className="whitespace-nowrap">{client.phone}</span>
          </div>
        ),
      },
      {
        key: "category",
        header: "CATEGORY",
        cell: (client) => {
          const cat = categoryConfig[client.category] || categoryConfig.Regular;
          const CatIcon = cat.icon;
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cat.bg}`}
            >
              <CatIcon size={11} />
              <span>{client.category || "Regular"}</span>
            </span>
          );
        },
      },
      {
        key: "status",
        header: "STATUS",
        cell: (client) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(client.id, client.status === "Active" ? "Inactive" : "Active");
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
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
        ),
      },
      {
        key: "totalBookings",
        header: "BOOKINGS",
        cell: (client) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/clients/${client.id || client.code}?tab=appointments`);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-glam-surface-alt border border-glam-border/40 text-xs font-bold text-glam-text hover:text-glam-accent hover:border-glam-accent/50 transition-colors cursor-pointer"
            title="View appointment history in Client Profile"
          >
            <Clock size={11} className="text-glam-accent" />
            <span>
              {client.totalBookings || (client.linkedAppointments?.length ?? 1)}
            </span>
            <span className="text-[10px] font-normal text-glam-text-muted">
              {client.totalBookings === 1 ? "booking" : "bookings"}
            </span>
          </button>
        ),
      },
      {
        key: "totalSpent",
        header: "TOTAL SPENT",
        cell: (client) => (
          <span className="font-bold font-outfit text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
            ₹{(Number(client.totalSpent) || 0).toLocaleString("en-IN")}
          </span>
        ),
      },
      {
        key: "lastVisit",
        header: "LAST VISIT",
        cell: (client) => (
          <div className="flex items-center gap-1 text-xs text-glam-text font-normal">
            <Calendar size={11} className="text-glam-accent" />
            <span>{formatDate(client.lastVisit) || "Recent"}</span>
          </div>
        ),
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
              <Users size={18} />
            </span>
            <h1 className="text-xl sm:text-2xl font-medium font-outfit text-glam-text tracking-tight">
              Clients
            </h1>
          </div>
          <p className="text-xs text-glam-text-muted mt-0.5">
            Confirmed bookings automatically convert into clients. Filter by date range, category, status, and spend.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white font-medium text-xs shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* 2. Key KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          title="Total Clients"
          value={stats.total}
          subtitle={`${stats.active} Active in CRM`}
        />
        <StatCard
          icon={Crown}
          title="Bridal Clients"
          value={stats.bridalCount}
          subtitle="Top tier wedding clients"
        />
        <StatCard
          icon={IndianRupee}
          title="Lifetime Revenue"
          value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
          subtitle="From confirmed clients"
        />
        <StatCard
          icon={Sparkles}
          title="Average Spend"
          value={`₹${stats.avgSpend.toLocaleString("en-IN")}`}
          subtitle="Per client lifetime value"
        />
      </div>

      {/* 3. Reusable Table Component with DateRangePicker, Filters, Sort, Search & Pagination */}
      <Table
        columns={columns}
        data={clients}
        searchPlaceholder="Search clients by name, phone, code, email, city..."
        searchFields={["name", "phone", "email", "city", "code"]}
        dateField="lastVisit"
        filterKey="category"
        filterOptions={clientCategories}
        filterDropdown={statusFilterDropdown}
        sortOptions={sortOptions}
        defaultSortBy="recent"
        pageSize={6}
        itemLabel="clients"
        onRowClick={(client) => navigate(`/clients/${client.id || client.code}`)}
        emptyIcon={Users}
        emptyTitle="No clients found"
        emptyMessage="Try adjusting your search query, category filter, or date range."
      />

      {/* 4. Add / Edit Client Modal */}
      <ClientModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveClient}
        editingClient={editingClient}
      />



      {/* 6. Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        clientName={deletingClientObj?.name}
      />
    </div>
  );
};

export default ClientsPage;
