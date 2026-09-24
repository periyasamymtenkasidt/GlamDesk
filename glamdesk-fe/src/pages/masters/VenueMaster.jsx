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
  CheckCircle2,
  Layers,
  Castle,
  Waves,
  Store,
  RotateCcw,
} from "lucide-react";
import { initialVenues } from "../../data/venueData";
import { venuesApi } from "../../services/mastersApi";
import Modal from "../../components/modals/Modal";
import { Input, Checkbox, ThemeSelect } from "../../components/common/form";

// ─── Venue Type Icon Mapping ──────────────────────────────────────────────────
const venueIcons = {
  "Grand Convention Center": Building2,
  "Convention Hall": Building2,
  "5-Star Hotel Ballroom": Hotel,
  "Hotel & Resort": Hotel,
  "Luxury Resort Property": Castle,
  "Outdoor Garden & Farmhouse": Trees,
  "Premium Marriage Hall": Landmark,
  "Temple Wedding Venue": Crown,
  "Standard Community Hall": Building2,
  "Home Function / House Wedding": Home,
  "Home / Residence": Home,
  "Beachfront Resort": Waves,
  "Heritage Palace": Castle,
  "Private Villa": Home,
  "Boutique Studio": Store,
};

const getVenueIcon = (type) => {
  if (!type) return MapPin;
  if (venueIcons[type]) return venueIcons[type];
  const lower = type.toLowerCase();
  if (lower.includes("hotel") || lower.includes("resort") || lower.includes("star")) return Hotel;
  if (lower.includes("palace") || lower.includes("heritage") || lower.includes("castle")) return Castle;
  if (lower.includes("beach") || lower.includes("sea") || lower.includes("water") || lower.includes("pool")) return Waves;
  if (lower.includes("villa") || lower.includes("home") || lower.includes("house") || lower.includes("residence")) return Home;
  if (lower.includes("farm") || lower.includes("garden") || lower.includes("outdoor") || lower.includes("lawn")) return Trees;
  if (lower.includes("hall") || lower.includes("convention") || lower.includes("auditorium")) return Building2;
  if (lower.includes("mandapam") || lower.includes("kalyana") || lower.includes("marriage")) return Landmark;
  if (lower.includes("temple") || lower.includes("church") || lower.includes("religious") || lower.includes("royal")) return Crown;
  if (lower.includes("studio") || lower.includes("salon") || lower.includes("boutique")) return Store;
  return MapPin;
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

const STORAGE_VENUES_KEY = "glamdesk_venue_pricing_tiers_v4";
const LEGACY_STORAGE_KEYS = [
  "glamdesk_venues_data",
  "glamdesk_venues_data_v2",
  "glamdesk_venues_pricing_tiers_v3",
  "glamdesk_venues",
];

// Helper to detect if a venues array contains legacy specific hotel names
const hasLegacyHotels = (list) => {
  if (!Array.isArray(list) || list.length === 0) return true;
  const legacyNames = [
    "itc grand chola",
    "taj coromandel",
    "mayor ramanathan",
    "mrc",
    "intercontinental",
  ];
  return list.some((item) => {
    const name = (item?.venueName || item?.name || "").toLowerCase();
    return legacyNames.some((legacy) => name.includes(legacy));
  });
};

// Immediately purge old legacy keys from browser storage on load
try {
  LEGACY_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
} catch (e) {}

// ─── Stat Card ────────────────────────────────────────────────────────────────
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

// ─── Venue Type Card (Grid View) ──────────────────────────────────────────────
const VenueCard = ({ venue, onEdit, onDelete, onToggleActive }) => {
  const VenueIcon = getVenueIcon(venue.venueName || venue.name);
  const dc = deltaConfig[venue.deltaType] || deltaConfig.none;
  const DeltaIcon = dc.icon;

  return (
    <div
      className={`group rounded-2xl border border-glam-border/60 bg-glam-surface p-5 shadow-xs hover:shadow-md hover:border-glam-accent/60 transition-all duration-300 flex flex-col justify-between ${
        !venue.isActive ? "opacity-65" : ""
      }`}
    >
      <div>
        {/* Card Header: Code Badge & Active Status Toggle */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-glam-surface-alt text-glam-text-muted border border-glam-border/40">
            <span>#{venue.code}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleActive(venue.id || venue._id)}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                venue.isActive
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  venue.isActive ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              <span>{venue.isActive ? "Active" : "Inactive"}</span>
            </button>
          </div>
        </div>

        {/* Venue Type Title & Description */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-glam-accent/10 text-glam-accent flex items-center justify-center shrink-0 mt-0.5">
            <VenueIcon size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold font-outfit text-glam-text text-base truncate group-hover:text-glam-accent transition-colors">
              {venue.venueName || venue.name}
            </h3>
            <p className="text-xs text-glam-text-muted mt-1 line-clamp-2 leading-relaxed">
              {venue.description || "Standard venue logistics setup tier."}
            </p>
          </div>
        </div>
      </div>

      {/* Pricing / Surcharge Matrix */}
      <div className="mt-4 pt-3 border-t border-glam-border/40 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-glam-text-muted flex items-center gap-1">
            <DeltaIcon size={13} className={dc.textColor} />
            <span>Price Delta:</span>
          </span>
          <span className={`font-bold font-outfit ${dc.textColor}`}>
            {venue.priceDelta > 0
              ? `+₹${Number(venue.priceDelta).toLocaleString("en-IN")}`
              : venue.priceDelta < 0
              ? `−₹${Math.abs(Number(venue.priceDelta)).toLocaleString("en-IN")}`
              : "₹0 (Standard Base)"}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-glam-text-muted flex items-center gap-1">
            <Car size={13} className="text-glam-accent" />
            <span>Travel Surcharge:</span>
          </span>
          <span className="font-semibold font-outfit text-glam-text">
            {venue.travelSurcharge > 0
              ? `₹${Number(venue.travelSurcharge).toLocaleString("en-IN")}`
              : "Free / Local"}
          </span>
        </div>

        {/* Card Footer Actions */}
        <div className="flex items-center justify-end gap-1.5 pt-2">
          <button
            onClick={() => onEdit(venue)}
            className="p-1.5 rounded-lg text-glam-text-muted hover:text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
            title="Edit Venue Type"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(venue.id || venue._id)}
            className="p-1.5 rounded-lg text-glam-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Delete Venue Type"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Add / Edit Venue Type Modal ───────────────────────────────────────────────
const VenueTypeModal = ({ isOpen, onClose, onSave, editingVenue }) => {
  const [formData, setFormData] = useState({
    venueName: "",
    description: "",
    travelSurcharge: 0,
    priceDelta: 0,
    deltaType: "none",
    isActive: true,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (editingVenue) {
      setFormData({
        venueName: editingVenue.venueName || editingVenue.name || "",
        description: editingVenue.description || "",
        travelSurcharge: editingVenue.travelSurcharge ?? 0,
        priceDelta: Math.abs(editingVenue.priceDelta ?? 0),
        deltaType: editingVenue.deltaType || "none",
        isActive: editingVenue.isActive ?? true,
      });
    } else {
      setFormData({
        venueName: "",
        description: "",
        travelSurcharge: 500,
        priceDelta: 0,
        deltaType: "none",
        isActive: true,
      });
    }
  }, [editingVenue, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.venueName.trim()) return;

    const rawDelta = Number(formData.priceDelta) || 0;
    const finalDelta = formData.deltaType === "discount" ? -rawDelta : rawDelta;

    onSave({
      ...formData,
      venueName: formData.venueName.trim(),
      venueType: formData.venueName.trim(), // keep in sync
      travelSurcharge: Number(formData.travelSurcharge) || 0,
      priceDelta: formData.deltaType === "none" ? 0 : finalDelta,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <Modal.Header
        title={editingVenue ? "Edit Venue Type" : "Add Venue Type"}
        icon={MapPin}
        onClose={onClose}
      />
      <Modal.Body>
        <form id="venue-type-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Venue Type Name */}
          <Input
            label="Venue Type Name"
            required
            placeholder="e.g. 5-Star Hotel Ballroom, Heritage Palace..."
            value={formData.venueName}
            onChange={(e) =>
              setFormData({ ...formData, venueName: e.target.value })
            }
          />

          {/* Description & Setup Notes */}
          <Input
            label="Description & Setup Notes"
            placeholder="e.g. Suite setup, airbrush equipment, security pass required"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          {/* Travel Surcharge */}
          <Input
            label="Standard Travel Surcharge (₹)"
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

          {/* Price Delta Section */}
          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
              Base Service Fee Adjustment (Price Delta)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "none", label: "No Change", icon: Minus },
                { type: "premium", label: "Surcharge (+)", icon: TrendingUp },
                { type: "discount", label: "Discount (−)", icon: TrendingDown },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = formData.deltaType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, deltaType: opt.type })
                    }
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-glam-accent text-white border-transparent shadow-xs"
                        : "bg-glam-surface-alt/40 border-glam-border/50 text-glam-text hover:bg-glam-surface-alt/80"
                    }`}
                  >
                    <Icon size={13} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {formData.deltaType !== "none" && (
            <Input
              label={
                formData.deltaType === "premium"
                  ? "Surcharge Amount (₹)"
                  : "Discount Amount (₹)"
              }
              type="number"
              min="0"
              step="100"
              placeholder="1500"
              value={formData.priceDelta}
              onChange={(e) =>
                setFormData({ ...formData, priceDelta: e.target.value })
              }
            />
          )}

          {/* Active Status */}
          <Checkbox
            label="Active Venue Type"
            description="Available for clients & booking staff to select in appointment forms"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
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
          form="venue-type-form"
          className="flex-1 h-10 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-xs font-bold text-white hover:opacity-95 shadow-md transition-all cursor-pointer"
        >
          {editingVenue ? "Save Changes" : "Create Venue Type"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
const DeleteModal = ({ isOpen, onClose, onConfirm, venueName }) => (
  <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xs" zIndex="z-70">
    <Modal.Body className="text-center pt-2">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
        <AlertTriangle size={22} />
      </div>
      <h3 className="text-lg font-bold font-outfit text-glam-text">
        Delete Venue Type?
      </h3>
      <p className="text-xs text-glam-text-muted mt-1.5 leading-relaxed">
        Are you sure you want to remove{" "}
        <span className="font-semibold text-glam-text">&ldquo;{venueName}&rdquo;</span>?
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
  // Venues State with LocalStorage persistence
  const [venues, setVenues] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VENUES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load venues from storage:", e);
    }
    return initialVenues;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Sync live venue types from backend on mount
  useEffect(() => {
    let isMounted = true;
    const fetchVenuesData = async () => {
      try {
        const backendVenues = await venuesApi.getAll();
        if (!isMounted) return;
        if (Array.isArray(backendVenues) && backendVenues.length > 0) {
          setVenues(
            backendVenues.map((v) => ({
              ...v,
              id: v._id || v.id,
              _id: v._id || v.id,
              venueName: v.venueName || v.name,
              venueType: v.venueName || v.name,
            }))
          );
        }
      } catch (err) {
        console.warn("Backend venues sync failed, using cached state:", err.message);
      }
    };

    fetchVenuesData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist venues
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VENUES_KEY, JSON.stringify(venues));
    } catch (e) {
      console.warn("Failed to save venues:", e);
    }
  }, [venues]);

  // Key Metrics
  const stats = useMemo(() => {
    const total = venues.length;
    const active = venues.filter((v) => v.isActive).length;
    const premiumCount = venues.filter((v) => v.deltaType === "premium").length;
    const maxDelta = venues.reduce((max, v) => Math.max(max, v.priceDelta || 0), 0);
    return { total, active, premiumCount, maxDelta };
  }, [venues]);

  // Filter & Sort
  const filteredVenues = useMemo(() => {
    return venues
      .filter((venue) => {
        const q = searchQuery.toLowerCase().trim();
        const name = (venue.venueName || venue.name || "").toLowerCase();
        const desc = (venue.description || "").toLowerCase();
        const code = String(venue.code || "").toLowerCase();
        const matchesSearch = !q || name.includes(q) || desc.includes(q) || code.includes(q);
        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "recent") return (b.createdAt || 0) - (a.createdAt || 0);
        if (sortBy === "delta-high") return (b.priceDelta || 0) - (a.priceDelta || 0);
        if (sortBy === "delta-low") return (a.priceDelta || 0) - (b.priceDelta || 0);
        if (sortBy === "travel-high") return (b.travelSurcharge || 0) - (a.travelSurcharge || 0);
        if (sortBy === "name") return (a.venueName || a.name || "").localeCompare(b.venueName || b.name || "");
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [venues, searchQuery, sortBy]);

  const handleToggleActive = async (id) => {
    setVenues((prev) =>
      prev.map((v) => (v.id === id || v._id === id ? { ...v, isActive: !v.isActive } : v))
    );
    try {
      await venuesApi.toggleStatus(id);
    } catch (e) {
      console.warn("Backend toggle venue status failed:", e.message);
    }
  };

  const handleOpenAddModal = () => {
    setEditingVenue(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (venue) => {
    setEditingVenue(venue);
    setIsModalOpen(true);
  };

  const handleSaveVenue = async (savedData) => {
    if (editingVenue) {
      const targetId = editingVenue.id || editingVenue._id;
      setVenues((prev) =>
        prev.map((v) =>
          v.id === targetId || v._id === targetId ? { ...v, ...savedData } : v
        )
      );
      setIsModalOpen(false);

      try {
        await venuesApi.update(targetId, savedData);
      } catch (e) {
        console.warn("Backend update venue failed, saved locally:", e.message);
      }
    } else {
      setIsModalOpen(false);
      try {
        const created = await venuesApi.create(savedData);
        const normalized = {
          ...created,
          id: created._id || created.id,
          _id: created._id || created.id,
          venueName: created.venueName || created.name,
          venueType: created.venueName || created.name,
        };
        setVenues((prev) => [normalized, ...prev.filter((v) => v.id !== normalized.id)]);
      } catch (e) {
        console.warn("Backend create venue failed, saved locally:", e.message);
        const code = String(Math.floor(Math.random() * 9000) + 1000);
        const newVenue = {
          ...savedData,
          id: `ven-${code}`,
          code,
          createdAt: savedData.createdAt || Date.now(),
        };
        setVenues((prev) => [newVenue, ...prev]);
      }
      setSortBy("recent");
      setSearchQuery("");
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      const idToDelete = deletingId;
      setVenues((prev) => prev.filter((v) => v.id !== idToDelete && v._id !== idToDelete));
      setDeletingId(null);

      try {
        await venuesApi.delete(idToDelete);
      } catch (e) {
        console.warn("Backend delete venue failed:", e.message);
      }
    }
  };

  const deletingVenueObj = venues.find((v) => v.id === deletingId || v._id === deletingId);

  return (
    <div className="w-full space-y-5">
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
            Manage venue types, location pricing tiers, event price adjustments, and travel surcharges.
          </p>
        </div>

        {/* Action Button: Add Venue Type */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white font-semibold text-xs shadow-sm hover:shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Venue Type</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          icon={Layers}
          title="Total Venue Types"
          value={stats.total}
          subtitle={`${stats.active} Active Tiers`}
        />
        <StatCard
          icon={TrendingUp}
          title="Max Surcharge"
          value={`+₹${stats.maxDelta.toLocaleString("en-IN")}`}
          subtitle="Top tier delta"
        />
        <StatCard
          icon={Crown}
          title="Premium Tiers"
          value={stats.premiumCount}
          subtitle="Tiers with surcharge"
        />
        <StatCard
          icon={CheckCircle2}
          title="Active Status"
          value={`${stats.active} of ${stats.total}`}
          subtitle="Ready for bookings"
        />
      </div>

      {/* Search & Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-glam-surface border border-glam-border/40 p-3.5 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-3 text-glam-accent"
          />
          <input
            type="text"
            placeholder="Search by venue type name, code (#4412), or logistics details..."
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
          <div className="flex items-center gap-1.5 text-xs text-glam-text font-medium min-w-[170px]">
            <SlidersHorizontal size={13} className="text-glam-accent shrink-0" />
            <ThemeSelect
              value={sortBy}
              onChange={(val) => setSortBy(val)}
              options={[
                { value: "recent", label: "Recently Added" },
                { value: "delta-high", label: "Highest Surcharge" },
                { value: "delta-low", label: "Lowest Surcharge" },
                { value: "travel-high", label: "Travel Fee" },
                { value: "name", label: "Name (A-Z)" },
              ]}
              triggerClassName="h-10 rounded-xl border-glam-border/60 bg-glam-surface-alt text-xs"
            />
          </div>
        </div>
      </div>

      {/* Venues Display - Card View Only */}
      {filteredVenues.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-glam-surface border border-glam-border/40 rounded-2xl text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-glam-accent/10 text-glam-accent flex items-center justify-center mb-3">
            <MapPin size={24} />
          </div>
          <h3 className="text-base font-bold font-outfit text-glam-text">
            No venue types found
          </h3>
          <p className="text-xs text-glam-text-muted mt-1 max-w-sm">
            {searchQuery
              ? `No venue types matched "${searchQuery}". Try a different keyword.`
              : "No venue types configured in the system yet. Click Add Venue Type to create one."}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-glam-surface-alt border border-glam-border/50 text-xs font-semibold text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
          >
            Reset Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVenues.map((venue) => (
            <VenueCard
              key={venue.id || venue._id}
              venue={venue}
              onEdit={handleOpenEditModal}
              onDelete={(id) => setDeletingId(id)}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Venue Type Modal */}
      <VenueTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVenue}
        editingVenue={editingVenue}
      />

      {/* Delete Venue Type Modal */}
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
