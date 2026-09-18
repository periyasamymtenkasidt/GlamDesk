import { useState, useMemo, useEffect } from "react";
import {
  MapPin,
  Home,
  Building2,
  Hotel,
  Trees,
  Crown,
  Landmark,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Car,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  XCircle,
  Layers,
  Sparkles,
} from "lucide-react";
import { initialVenues, venueTypesList } from "../../data/venueData";
import Modal from "../../components/common/Modal";
import { Input, Select, Checkbox, SegmentedControl } from "../../components/common/form";

// ─── Venue Type to Icon Mapping ───────────────────────────────────────────────
const venueIcons = {
  "Convention Hall": Building2,
  "Hotel & Resort": Hotel,
  "Marriage Hall": Landmark,
  "Outdoor & Farmhouse": Trees,
  "Community Hall": Building2,
  "Home / Residence": Home,
  "Temple & Religious": Crown,
};

// ─── Delta Config ─────────────────────────────────────────────────────────────
const deltaConfig = {
  premium: {
    icon: TrendingUp,
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-500/10",
    label: "Surcharge",
    prefix: "+",
  },
  none: {
    icon: Minus,
    textColor: "text-glam-text-muted",
    bgLight: "bg-glam-surface-alt",
    label: "Standard",
    prefix: "",
  },
  standard: {
    icon: Minus,
    textColor: "text-glam-text-muted",
    bgLight: "bg-glam-surface-alt",
    label: "Standard",
    prefix: "",
  },
  discount: {
    icon: TrendingDown,
    textColor: "text-rose-500 dark:text-rose-400",
    bgLight: "bg-rose-500/10",
    label: "Discount",
    prefix: "−",
  },
};

const VENUE_TYPE_OPTIONS = [
  "Convention Hall",
  "Hotel & Resort",
  "Marriage Hall",
  "Outdoor & Farmhouse",
  "Community Hall",
  "Home / Residence",
  "Temple & Religious",
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, title, value, subtitle }) => (
  <div className="rounded-2xl border border-glam-border/40 bg-glam-surface p-4 shadow-xs hover:border-glam-accent/40 transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[11px] font-medium text-glam-text-muted uppercase tracking-wider">
          {title}
        </p>
        <h3 className="text-xl font-bold font-outfit text-glam-text mt-0.5">
          {value}
        </h3>
        {subtitle && (
          <p className="text-[11px] text-glam-accent font-medium mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <div className="w-10 h-10 rounded-xl bg-glam-accent/10 text-glam-accent flex items-center justify-center shrink-0">
        <Icon size={18} />
      </div>
    </div>
  </div>
);

// ─── Professional Venue Card (Grid View) ──────────────────────────────────────
const VenueCard = ({ venue, onEdit, onDelete, onToggleActive }) => {
  const dc = deltaConfig[venue.deltaType] || deltaConfig.none;
  const DeltaIcon = dc.icon;
  const VenueIcon = venueIcons[venue.venueType] || MapPin;

  return (
    <div
      className={`group flex flex-col justify-between rounded-2xl border border-glam-border/50 bg-glam-surface p-5 shadow-xs hover:border-glam-accent/60 hover:shadow-md transition-all duration-200 ${
        !venue.isActive ? "opacity-75" : ""
      }`}
    >
      <div>
        {/* Top Meta Row: Type Badge + Code & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-glam-surface-alt text-glam-text border border-glam-border/30">
            <VenueIcon size={12} className="text-glam-accent" />
            {venue.venueType}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-glam-text-muted">
              #{venue.code}
            </span>
            <button
              onClick={() => onToggleActive(venue.id)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                venue.isActive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
              title="Click to toggle status"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  venue.isActive ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              {venue.isActive ? "Active" : "Inactive"}
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mb-4">
          <h3 className="text-base font-bold font-outfit text-glam-text leading-snug group-hover:text-glam-accent transition-colors">
            {venue.venueName}
          </h3>
          <p className="text-xs text-glam-text-muted mt-1 leading-relaxed line-clamp-2">
            {venue.description || "Standard venue requirements apply."}
          </p>
        </div>

        {/* Crisp Data Block: Price Delta & Travel Fee */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-glam-surface-alt/30 border border-glam-border/30 mb-4">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-glam-text-muted">
              Price Delta
            </span>
            <div className="flex items-center gap-1 mt-1">
              <DeltaIcon size={13} className={dc.textColor} />
              <span className={`text-sm font-bold font-outfit ${dc.textColor}`}>
                {venue.priceDelta > 0
                  ? `+₹${venue.priceDelta.toLocaleString("en-IN")}`
                  : venue.priceDelta < 0
                  ? `−₹${Math.abs(venue.priceDelta).toLocaleString("en-IN")}`
                  : "₹0 (Base)"}
              </span>
            </div>
          </div>

          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-glam-text-muted">
              Travel Fee
            </span>
            <div className="flex items-center gap-1 mt-1">
              <Car size={13} className="text-glam-accent" />
              <span className="text-sm font-bold font-outfit text-glam-text">
                {venue.travelSurcharge > 0
                  ? `₹${venue.travelSurcharge.toLocaleString("en-IN")}`
                  : "No Fee"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Edit & Delete */}
      <div className="pt-3 border-t border-glam-border/30 flex items-center justify-between">
        <span className="text-[11px] text-glam-text-muted font-medium">
          {venue.deltaType === "premium"
            ? "Tier Surcharge"
            : venue.deltaType === "discount"
            ? "Direct Saving"
            : "Standard Rate"}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(venue)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-glam-text hover:text-glam-accent hover:bg-glam-accent/10 border border-glam-border/40 transition-colors cursor-pointer"
          >
            <Edit2 size={12} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(venue.id)}
            className="p-1.5 rounded-lg text-glam-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Delete Venue"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Professional Table View ──────────────────────────────────────────────────
const VenueTableView = ({ venues, onEdit, onDelete, onToggleActive }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-glam-border/50 bg-glam-surface shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-glam-border/40 bg-glam-surface-alt/40 text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
              <th className="py-3 px-4">Venue Details</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Price Delta</th>
              <th className="py-3 px-4">Travel Allowance</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glam-border/30 text-xs">
            {venues.map((venue) => {
              const dc = deltaConfig[venue.deltaType] || deltaConfig.none;
              const DeltaIcon = dc.icon;
              const VenueIcon = venueIcons[venue.venueType] || MapPin;

              return (
                <tr
                  key={venue.id}
                  className="hover:bg-glam-surface-alt/30 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-glam-accent/10 text-glam-accent flex items-center justify-center shrink-0">
                        <VenueIcon size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-outfit text-glam-text text-sm">
                            {venue.venueName}
                          </span>
                          <span className="text-[10px] text-glam-text-muted">
                            #{venue.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-glam-text-muted line-clamp-1 max-w-sm mt-0.5">
                          {venue.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-glam-surface-alt text-glam-text border border-glam-border/30 whitespace-nowrap">
                      {venue.venueType}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <DeltaIcon size={13} className={dc.textColor} />
                      <span className={`font-bold font-outfit ${dc.textColor}`}>
                        {venue.priceDelta > 0
                          ? `+₹${venue.priceDelta.toLocaleString("en-IN")}`
                          : venue.priceDelta < 0
                          ? `−₹${Math.abs(venue.priceDelta).toLocaleString("en-IN")}`
                          : "₹0 (Base)"}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-outfit font-semibold text-glam-text">
                    {venue.travelSurcharge > 0
                      ? `₹${venue.travelSurcharge.toLocaleString("en-IN")}`
                      : "No Fee (Local)"}
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => onToggleActive(venue.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer ${
                        venue.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          venue.isActive ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                      {venue.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(venue)}
                        className="p-1.5 rounded-lg text-glam-text-muted hover:text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => onDelete(venue.id)}
                        className="p-1.5 rounded-lg text-glam-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
const VenueModal = ({ isOpen, onClose, onSave, editingVenue }) => {
  const [formData, setFormData] = useState({
    venueName: "",
    venueType: "Marriage Hall",
    description: "",
    travelSurcharge: 0,
    priceDelta: 0,
    deltaType: "none",
    isActive: true,
  });

  useEffect(() => {
    if (editingVenue) {
      setFormData({
        venueName: editingVenue.venueName || "",
        venueType: editingVenue.venueType || "Marriage Hall",
        description: editingVenue.description || "",
        travelSurcharge: editingVenue.travelSurcharge ?? 0,
        priceDelta: Math.abs(editingVenue.priceDelta ?? 0),
        deltaType: editingVenue.deltaType || "none",
        isActive: editingVenue.isActive ?? true,
      });
    } else {
      setFormData({
        venueName: "",
        venueType: "Marriage Hall",
        description: "",
        travelSurcharge: 0,
        priceDelta: 0,
        deltaType: "none",
        isActive: true,
      });
    }
  }, [editingVenue, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.venueName) return;

    const rawDelta = Number(formData.priceDelta);
    const finalDelta = formData.deltaType === "discount" ? -rawDelta : rawDelta;

    onSave({
      ...formData,
      travelSurcharge: Number(formData.travelSurcharge),
      priceDelta: formData.deltaType === "none" ? 0 : finalDelta,
    });
  };

  const fieldClass =
    "w-full h-10 px-3.5 rounded-xl border border-glam-border/50 bg-glam-surface-alt/30 text-xs font-medium text-glam-text focus:outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent/40 transition-all";

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <Modal.Header
        title={editingVenue ? "Edit Venue" : "Add Venue"}
        icon={MapPin}
        onClose={onClose}
      />
      <Modal.Body>
        <form id="venue-form" onSubmit={handleSubmit} className="space-y-3.5">
          {/* Venue Name */}
          <Input
            label="Venue Name"
            required
            placeholder="e.g. Royal Palace Banquet"
            value={formData.venueName}
            onChange={(e) =>
              setFormData({ ...formData, venueName: e.target.value })
            }
          />

          {/* Classification */}
          <Select
            label="Venue Type"
            required
            value={formData.venueType}
            onChange={(e) =>
              setFormData({ ...formData, venueType: e.target.value })
            }
            options={VENUE_TYPE_OPTIONS}
          />

          {/* Description */}
          <Input
            label="Description / Notes"
            placeholder="e.g. Centralized AC, bridal suite available"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          {/* Travel Surcharge */}
          <Input
            label="Travel Surcharge"
            type="number"
            icon={Car}
            min="0"
            step="50"
            placeholder="500"
            value={formData.travelSurcharge}
            onChange={(e) =>
              setFormData({ ...formData, travelSurcharge: e.target.value })
            }
          />

          {/* Price Adjustment Segmented Buttons */}
          <SegmentedControl
            label="Price Adjustment"
            value={formData.deltaType}
            onChange={(val) => setFormData({ ...formData, deltaType: val })}
            options={[
              { value: "premium", label: "+ Surcharge", dotColor: "bg-emerald-500" },
              { value: "none", label: "Standard (₹0)", dotColor: "bg-glam-text-muted" },
              { value: "discount", label: "− Discount", dotColor: "bg-rose-500" },
            ]}
          />

          {/* Price Delta Amount */}
          {formData.deltaType !== "none" && (
            <Input
              label={
                formData.deltaType === "premium"
                  ? "Surcharge Amount"
                  : "Discount Amount"
              }
              required
              type="number"
              prefix="₹"
              min="0"
              step="100"
              placeholder="2000"
              value={formData.priceDelta}
              onChange={(e) =>
                setFormData({ ...formData, priceDelta: e.target.value })
              }
            />
          )}

          {/* Active Status */}
          <div className="pt-1">
            <Checkbox
              label="Venue Active for Bookings"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-10 rounded-xl border border-glam-border/50 bg-glam-surface-alt/30 text-xs font-semibold text-glam-text hover:bg-glam-surface-alt/60 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="venue-form"
          className="flex-1 h-10 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-xs font-semibold text-white shadow-md hover:opacity-95 transition-opacity cursor-pointer"
        >
          {editingVenue ? "Save Changes" : "Create Venue"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Delete Confirmation Modal ─────────────────────────────────────────────────
const DeleteModal = ({ isOpen, onClose, onConfirm, venueName }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    maxWidth="max-w-sm"
    showAccentBar={false}
  >
    <Modal.Body className="text-center pt-2">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
        <AlertTriangle size={22} />
      </div>
      <h3 className="text-lg font-bold font-outfit text-glam-text">
        Delete Venue?
      </h3>
      <p className="text-xs text-glam-text-muted mt-1.5 leading-relaxed">
        Are you sure you want to remove{" "}
        <span className="font-semibold text-glam-text">"{venueName}"</span>?
        This action cannot be undone.
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
        Delete
      </button>
    </Modal.Footer>
  </Modal>
);

// ─── Main Venue Master Component ──────────────────────────────────────────────
const VenueMaster = () => {
  const [venues, setVenues] = useState(initialVenues);
  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("delta-high");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Key Metrics
  const stats = useMemo(() => {
    const total = venues.length;
    const active = venues.filter((v) => v.isActive).length;
    const premiumCount = venues.filter((v) => v.deltaType === "premium").length;
    const maxDelta = venues.reduce((max, v) => Math.max(max, v.priceDelta), 0);
    return { total, active, premiumCount, maxDelta };
  }, [venues]);

  // Filter & Sort
  const filteredVenues = useMemo(() => {
    return venues
      .filter((venue) => {
        const matchesType =
          selectedType === "All" || venue.venueType === selectedType;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          venue.venueName.toLowerCase().includes(q) ||
          venue.venueType.toLowerCase().includes(q) ||
          venue.description.toLowerCase().includes(q) ||
          venue.code.includes(q);
        return matchesType && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "delta-high") return b.priceDelta - a.priceDelta;
        if (sortBy === "delta-low") return a.priceDelta - b.priceDelta;
        if (sortBy === "travel-high") return b.travelSurcharge - a.travelSurcharge;
        if (sortBy === "name") return a.venueName.localeCompare(b.venueName);
        return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
      });
  }, [venues, selectedType, searchQuery, sortBy]);

  const handleToggleActive = (id) => {
    setVenues((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v))
    );
  };

  const handleOpenAddModal = () => {
    setEditingVenue(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (venue) => {
    setEditingVenue(venue);
    setIsModalOpen(true);
  };

  const handleSaveVenue = (savedData) => {
    if (editingVenue) {
      setVenues((prev) =>
        prev.map((v) =>
          v.id === editingVenue.id ? { ...v, ...savedData } : v
        )
      );
    } else {
      const code = String(Math.floor(Math.random() * 9000) + 1000);
      setVenues((prev) => [
        { ...savedData, id: `ven-${code}`, code },
        ...prev,
      ]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
      setVenues((prev) => prev.filter((v) => v.id !== deletingId));
      setDeletingId(null);
    }
  };

  const deletingVenueObj = venues.find((v) => v.id === deletingId);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-glam-surface border border-glam-border/40 p-4 sm:p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-glam-accent/10 text-glam-accent">
              <MapPin size={18} />
            </span>
            <h1 className="text-xl font-bold font-outfit text-glam-text tracking-tight">
              Venue Pricing Master
            </h1>
          </div>
          <p className="text-xs text-glam-text-muted mt-1">
            Manage venue categories, event price deltas, and travel allowances.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white font-semibold text-xs shadow-sm hover:shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus size={15} />
          <span>Add Venue</span>
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Layers}
          title="Total Venues"
          value={stats.total}
          subtitle={`${stats.active} Active`}
        />
        <StatCard
          icon={TrendingUp}
          title="Max Surcharge"
          value={`+₹${stats.maxDelta.toLocaleString("en-IN")}`}
          subtitle="Convention halls"
        />
        <StatCard
          icon={Crown}
          title="Premium Venues"
          value={stats.premiumCount}
          subtitle="Venues with surcharge"
        />
        <StatCard
          icon={Car}
          title="Travel Enabled"
          value={venues.filter((v) => v.travelSurcharge > 0).length}
          subtitle="With transit fee"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 bg-glam-surface border border-glam-border/40 p-3.5 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-3 text-glam-accent"
            />
            <input
              type="text"
              placeholder="Search by venue name, code (#4412), or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-9 rounded-xl border border-glam-border/60 bg-glam-surface-alt text-xs font-medium text-glam-text placeholder:text-glam-text-muted focus:outline-none focus:border-glam-accent transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-glam-text-muted hover:text-glam-text cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-glam-text font-medium">
              <SlidersHorizontal size={13} className="text-glam-accent" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 px-3 rounded-xl border border-glam-border/60 bg-glam-surface-alt text-xs text-glam-text focus:outline-none focus:border-glam-accent cursor-pointer"
              >
                <option value="delta-high">Highest Surcharge</option>
                <option value="delta-low">Lowest Surcharge</option>
                <option value="travel-high">Travel Fee</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            {/* View Mode Toggle: Grid or Table */}
            <div className="flex items-center p-1 rounded-xl bg-glam-surface-alt border border-glam-border/60">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-glam-surface text-glam-accent shadow-xs"
                    : "text-glam-text-muted hover:text-glam-text"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-glam-surface text-glam-accent shadow-xs"
                    : "text-glam-text-muted hover:text-glam-text"
                }`}
                title="Table View"
              >
                <TableIcon size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Venue Type Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-glam-border/30 pt-2.5">
          {venueTypesList.map((type) => {
            const isSelected = selectedType === type;
            const IconComponent = venueIcons[type] || MapPin;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-linear-to-r from-glam-accent to-glam-accent-2 text-white shadow-xs"
                    : "bg-glam-surface-alt text-glam-text-muted border border-glam-border/40 hover:text-glam-accent"
                }`}
              >
                {type !== "All" && <IconComponent size={12} />}
                <span>{type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Venues Display */}
      {filteredVenues.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-glam-surface border border-glam-border/40 rounded-2xl text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-glam-accent/10 text-glam-accent flex items-center justify-center mb-3">
            <MapPin size={24} />
          </div>
          <h3 className="text-base font-bold font-outfit text-glam-text">
            No venues found
          </h3>
          <p className="text-xs text-glam-text-muted mt-1">
            Try adjusting your search query or venue type filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedType("All");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-glam-surface-alt border border-glam-border/50 text-xs font-semibold text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVenues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              onEdit={handleOpenEditModal}
              onDelete={(id) => setDeletingId(id)}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      ) : (
        <VenueTableView
          venues={filteredVenues}
          onEdit={handleOpenEditModal}
          onDelete={(id) => setDeletingId(id)}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* Modals */}
      <VenueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVenue}
        editingVenue={editingVenue}
      />
      <DeleteModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        venueName={deletingVenueObj?.venueName}
      />
    </div>
  );
};

export default VenueMaster;
