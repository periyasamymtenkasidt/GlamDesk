import { useState, useMemo, useEffect, useRef } from "react";
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
  Settings,
  Check,
  FolderKanban,
  Castle,
  Waves,
  Store,
} from "lucide-react";
import { initialVenues } from "../../data/venueData";
import Modal from "../../components/modals/Modal";
import { Input, Select, Checkbox, SegmentedControl, ThemeSelect } from "../../components/common/form";

// ─── Venue Type to Icon Mapping ───────────────────────────────────────────────
const venueIcons = {
  "Convention Hall": Building2,
  "Hotel & Resort": Hotel,
  "Marriage Hall": Landmark,
  "Outdoor & Farmhouse": Trees,
  "Community Hall": Building2,
  "Home / Residence": Home,
  "Temple & Religious": Crown,
  "Beachfront Resort": Waves,
  "Heritage Palace": Castle,
  "Private Villa": Home,
  "Boutique Studio": Store,
};

const getVenueIcon = (type) => {
  if (!type) return MapPin;
  if (venueIcons[type]) return venueIcons[type];
  const lower = type.toLowerCase();
  if (lower.includes("hotel") || lower.includes("resort")) return Hotel;
  if (lower.includes("palace") || lower.includes("heritage") || lower.includes("castle") || lower.includes("fort")) return Castle;
  if (lower.includes("beach") || lower.includes("lake") || lower.includes("sea") || lower.includes("water") || lower.includes("pool")) return Waves;
  if (lower.includes("villa") || lower.includes("home") || lower.includes("house") || lower.includes("residence")) return Home;
  if (lower.includes("farm") || lower.includes("garden") || lower.includes("outdoor") || lower.includes("lawn") || lower.includes("tree")) return Trees;
  if (lower.includes("hall") || lower.includes("convention") || lower.includes("center") || lower.includes("auditorium")) return Building2;
  if (lower.includes("mandapam") || lower.includes("kalyana") || lower.includes("marriage")) return Landmark;
  if (lower.includes("temple") || lower.includes("church") || lower.includes("religious") || lower.includes("royal")) return Crown;
  if (lower.includes("studio") || lower.includes("salon") || lower.includes("shop") || lower.includes("boutique")) return Store;
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

const STORAGE_VENUE_TYPES_KEY = "glamdesk_venue_types_v2";
const STORAGE_VENUES_KEY = "glamdesk_venues_data_v2";

const initialDefaultVenueTypes = [
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
      <div className="w-10 h-10 rounded-xl bg-glam-accent/10 text-glam-accent flex items-center justify-center">
        <Icon size={18} />
      </div>
    </div>
  </div>
);

// ─── Individual Venue Card (Grid View) ────────────────────────────────────────
const VenueCard = ({ venue, onEdit, onDelete, onToggleActive }) => {
  const VenueIcon = getVenueIcon(venue.venueType);
  const dc = deltaConfig[venue.deltaType] || deltaConfig.none;
  const DeltaIcon = dc.icon;

  return (
    <div
      className={`group rounded-2xl border border-glam-border/60 bg-glam-surface p-5 shadow-xs hover:shadow-md hover:border-glam-accent/60 transition-all duration-300 flex flex-col justify-between ${
        !venue.isActive ? "opacity-65" : ""
      }`}
    >
      <div>
        {/* Card Header: Type Badge & Active Status Toggle */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-glam-surface-alt text-glam-text border border-glam-border/40">
            <VenueIcon size={12} className="text-glam-accent" />
            <span>{venue.venueType}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleActive(venue.id)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
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

        {/* Venue Title & Code */}
        <div className="flex items-start gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-glam-accent/10 text-glam-accent flex items-center justify-center shrink-0 mt-0.5">
            <VenueIcon size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold font-outfit text-glam-text text-base truncate group-hover:text-glam-accent transition-colors">
                {venue.venueName}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-glam-text-muted">
              #{venue.code}
            </span>
            <p className="text-xs text-glam-text-muted mt-1 line-clamp-2 leading-relaxed">
              {venue.description || "No specific details provided."}
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
              ? `+₹${venue.priceDelta.toLocaleString("en-IN")}`
              : venue.priceDelta < 0
              ? `−₹${Math.abs(venue.priceDelta).toLocaleString("en-IN")}`
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
              ? `₹${venue.travelSurcharge.toLocaleString("en-IN")}`
              : "Free / Local"}
          </span>
        </div>

        {/* Card Footer Actions */}
        <div className="flex items-center justify-end gap-1.5 pt-2">
          <button
            onClick={() => onEdit(venue)}
            className="p-1.5 rounded-lg text-glam-text-muted hover:text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
            title="Edit Venue"
          >
            <Edit2 size={13} />
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

// ─── Venue Table View ─────────────────────────────────────────────────────────
const VenueTableView = ({ venues, onEdit, onDelete, onToggleActive }) => {
  return (
    <div className="rounded-2xl border border-glam-border/50 bg-glam-surface overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-glam-border/40 bg-glam-surface-alt/40 text-glam-text-muted uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-5">Venue Details</th>
              <th className="py-3 px-4">Classification</th>
              <th className="py-3 px-4">Price Adjustment</th>
              <th className="py-3 px-4">Travel Surcharge</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glam-border/30">
            {venues.map((venue) => {
              const VenueIcon = getVenueIcon(venue.venueType);
              const dc = deltaConfig[venue.deltaType] || deltaConfig.none;
              const DeltaIcon = dc.icon;

              return (
                <tr
                  key={venue.id}
                  className="hover:bg-glam-surface-alt/30 transition-colors"
                >
                  <td className="py-3.5 px-5">
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

// ─── Manage Venue Types Modal (Pattern A & C) ──────────────────────────────────
const ManageVenueTypesModal = ({
  isOpen,
  onClose,
  venueTypes,
  venues,
  onAddType,
  onRenameType,
  onDeleteType,
  zIndex = "z-60",
}) => {
  const [newTypeName, setNewTypeName] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [deletingType, setDeletingType] = useState(null);
  const [reassignTarget, setReassignTarget] = useState("");

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    onAddType(newTypeName.trim());
    setNewTypeName("");
  };

  const handleStartRename = (type, idx) => {
    setEditingIndex(idx);
    setEditingName(type);
  };

  const handleSaveRename = (oldName) => {
    if (editingName.trim() && editingName.trim() !== oldName) {
      onRenameType(oldName, editingName.trim());
    }
    setEditingIndex(null);
    setEditingName("");
  };

  const handleRequestDelete = (typeName) => {
    const count = venues.filter((v) => v.venueType === typeName).length;
    if (count === 0) {
      onDeleteType(typeName);
    } else {
      const otherTypes = venueTypes.filter((t) => t !== typeName);
      setReassignTarget(otherTypes[0] || "");
      setDeletingType(typeName);
    }
  };

  const handleConfirmReassignDelete = () => {
    if (deletingType) {
      onDeleteType(deletingType, reassignTarget);
      setDeletingType(null);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg" zIndex={zIndex}>
      <Modal.Header
        title="Manage Venue Types"
        icon={FolderKanban}
        onClose={onClose}
      />
      <Modal.Body className="space-y-4">
        {/* Quick Add Form on Top */}
        <form onSubmit={handleCreate} className="p-3.5 rounded-2xl bg-glam-surface-alt/40 border border-glam-border/40 space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-glam-text-muted block">
            Add New Classification
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="e.g. Beachfront Resort, Private Villa, Heritage Palace..."
              className="flex-1 h-9 px-3 rounded-xl border border-glam-border/60 bg-glam-surface text-xs font-medium text-glam-text focus:outline-none focus:border-glam-accent"
            />
            <button
              type="submit"
              className="px-3.5 h-9 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer shrink-0"
            >
              Add Type
            </button>
          </div>
        </form>

        {/* Delete Reassignment Warning Modal overlay */}
        {deletingType && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
              <AlertTriangle size={15} />
              <span>
                &ldquo;{deletingType}&rdquo; is currently assigned to{" "}
                {venues.filter((v) => v.venueType === deletingType).length} venues
              </span>
            </div>
            <p className="text-[11px] text-glam-text-muted">
              Select which venue type these venues should be reassigned to before deletion:
            </p>
            <div className="flex items-center gap-2">
              <select
                value={reassignTarget}
                onChange={(e) => setReassignTarget(e.target.value)}
                className="flex-1 h-9 px-3 rounded-xl border border-glam-border bg-glam-surface text-xs font-semibold text-glam-text"
              >
                {venueTypes
                  .filter((t) => t !== deletingType)
                  .map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleConfirmReassignDelete}
                className="px-3 h-9 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
              >
                Reassign & Delete
              </button>
              <button
                type="button"
                onClick={() => setDeletingType(null)}
                className="px-3 h-9 rounded-xl bg-glam-surface border border-glam-border text-xs text-glam-text hover:bg-glam-surface-alt cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Types List */}
        <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-glam-text-muted px-1 block">
            Existing Venue Types ({venueTypes.length})
          </span>

          {venueTypes.map((type, idx) => {
            const VenueIcon = getVenueIcon(type);
            const isEditing = editingIndex === idx;
            const count = venues.filter((v) => v.venueType === type).length;

            return (
              <div
                key={type}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-glam-border/40 bg-glam-surface hover:bg-glam-surface-alt/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-glam-accent/10 text-glam-accent flex items-center justify-center shrink-0">
                    <VenueIcon size={15} />
                  </div>

                  {isEditing ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRename(type);
                        if (e.key === "Escape") setEditingIndex(null);
                      }}
                      autoFocus
                      className="flex-1 h-8 px-2.5 rounded-lg border border-glam-accent bg-glam-surface text-xs font-bold text-glam-text focus:outline-none"
                    />
                  ) : (
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold font-outfit text-glam-text block truncate">
                        {type}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-glam-surface-alt border border-glam-border/40 text-glam-text-muted">
                    {count} {count === 1 ? "venue" : "venues"}
                  </span>

                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSaveRename(type)}
                        className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
                        title="Save Rename"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingIndex(null)}
                        className="p-1 rounded-lg text-glam-text-muted hover:bg-glam-surface-alt cursor-pointer"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartRename(type, idx)}
                        className="p-1.5 rounded-lg text-glam-text-muted hover:text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
                        title="Rename Type"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRequestDelete(type)}
                        className="p-1.5 rounded-lg text-glam-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Type"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          onClick={onClose}
          className="w-full h-10 rounded-xl bg-glam-surface-alt border border-glam-border/60 text-xs font-semibold text-glam-text hover:bg-glam-surface-alt/70 transition-colors cursor-pointer"
        >
          Done
        </button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Add / Edit Venue Modal ───────────────────────────────────────────────────
const VenueModal = ({
  isOpen,
  onClose,
  onSave,
  editingVenue,
  venueTypeOptions,
  onAddVenueType,
  onOpenManageTypes,
}) => {
  const [formData, setFormData] = useState({
    venueName: "",
    venueType: venueTypeOptions?.[0] || "Marriage Hall",
    description: "",
    travelSurcharge: 0,
    priceDelta: 0,
    deltaType: "none",
    isActive: true,
  });

  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [newTypeInput, setNewTypeInput] = useState("");
  const prevVenueTypesRef = useRef(venueTypeOptions);

  // Initialize or reset form only when modal opens or editingVenue changes
  useEffect(() => {
    if (!isOpen) return;
    if (editingVenue) {
      setFormData({
        venueName: editingVenue.venueName || "",
        venueType: editingVenue.venueType || venueTypeOptions?.[0] || "Marriage Hall",
        description: editingVenue.description || "",
        travelSurcharge: editingVenue.travelSurcharge ?? 0,
        priceDelta: Math.abs(editingVenue.priceDelta ?? 0),
        deltaType: editingVenue.deltaType || "none",
        isActive: editingVenue.isActive ?? true,
      });
    } else {
      setFormData({
        venueName: "",
        venueType: venueTypeOptions?.[0] || "Marriage Hall",
        description: "",
        travelSurcharge: 0,
        priceDelta: 0,
        deltaType: "none",
        isActive: true,
      });
    }
    setIsAddingNewType(false);
    setNewTypeInput("");
  }, [editingVenue, isOpen]);

  // Synchronize venueType when venueTypeOptions list changes (without erasing user input)
  useEffect(() => {
    if (!isOpen || !venueTypeOptions || venueTypeOptions.length === 0) return;
    const prevTypes = prevVenueTypesRef.current;
    prevVenueTypesRef.current = venueTypeOptions;

    // If a new type was just added, auto-select it immediately
    if (prevTypes && venueTypeOptions.length > prevTypes.length) {
      const added = venueTypeOptions.find((t) => !prevTypes.includes(t));
      if (added) {
        setFormData((prev) => ({ ...prev, venueType: added }));
        return;
      }
    }

    // If the currently selected type was renamed or deleted, adapt gracefully
    if (prevTypes && !venueTypeOptions.includes(formData.venueType)) {
      const renamed = venueTypeOptions.find((t) => !prevTypes.includes(t));
      if (renamed) {
        setFormData((prev) => ({ ...prev, venueType: renamed }));
      } else {
        setFormData((prev) => ({ ...prev, venueType: venueTypeOptions[0] }));
      }
    }
  }, [venueTypeOptions, isOpen, formData.venueType]);

  if (!isOpen) return null;

  const handleQuickAddType = () => {
    if (!newTypeInput.trim()) return;
    const created = onAddVenueType(newTypeInput.trim());
    if (created) {
      setFormData((prev) => ({ ...prev, venueType: created }));
      setNewTypeInput("");
      setIsAddingNewType(false);
    }
  };

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

          {/* Classification with Inline New Type and Manage buttons */}
          {isAddingNewType ? (
            <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/50 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-glam-accent">
                  Create New Venue Type
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewType(false)}
                  className="text-[11px] font-semibold text-glam-text-muted hover:text-glam-text cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTypeInput}
                  onChange={(e) => setNewTypeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleQuickAddType();
                    }
                  }}
                  autoFocus
                  placeholder="e.g. Beachfront Resort, Private Villa..."
                  className="flex-1 h-9 px-3 rounded-xl border border-glam-border bg-glam-surface text-xs font-medium text-glam-text focus:outline-none focus:border-glam-accent"
                />
                <button
                  type="button"
                  onClick={handleQuickAddType}
                  className="px-3.5 h-9 rounded-xl bg-glam-accent text-white text-xs font-bold shadow-xs hover:opacity-95 cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-glam-text">
                  Venue Type *
                </label>
                <div className="flex items-center gap-2 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewType(true)}
                    className="text-glam-accent hover:underline cursor-pointer"
                  >
                    + New Type
                  </button>
                  <span className="text-glam-text-muted/40">·</span>
                  <button
                    type="button"
                    onClick={onOpenManageTypes}
                    className="text-glam-text-muted hover:text-glam-accent cursor-pointer flex items-center gap-1"
                  >
                    <Settings size={11} />
                    <span>Manage</span>
                  </button>
                </div>
              </div>
              <Select
                value={formData.venueType}
                onChange={(e) =>
                  setFormData({ ...formData, venueType: e.target.value })
                }
                options={venueTypeOptions}
              />
            </div>
          )}

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

          {/* Price Delta Section */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
              Base Service Fee Adjustment
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "none", label: "No Change", icon: Minus },
                { type: "premium", label: "Surcharge", icon: TrendingUp },
                { type: "discount", label: "Discount", icon: TrendingDown },
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

          <div className="pt-2">
            <Checkbox
              id="venue-active-toggle"
              label="Active Venue (Available in booking forms)"
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
    zIndex="z-70"
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
  // Venue Types State with LocalStorage persistence
  const [venueTypes, setVenueTypes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VENUE_TYPES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load venue types from storage:", e);
    }
    return initialDefaultVenueTypes;
  });

  // Venues State with LocalStorage persistence
  const [venues, setVenues] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VENUES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load venues from storage:", e);
    }
    return initialVenues;
  });

  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageTypesOpen, setIsManageTypesOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Persist venue types
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VENUE_TYPES_KEY, JSON.stringify(venueTypes));
    } catch (e) {
      console.warn("Failed to save venue types:", e);
    }
  }, [venueTypes]);

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
    const maxDelta = venues.reduce((max, v) => Math.max(max, v.priceDelta), 0);
    return { total, active, premiumCount, maxDelta, typeCount: venueTypes.length };
  }, [venues, venueTypes]);

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
        if (sortBy === "recent") return (b.createdAt || 0) - (a.createdAt || 0);
        if (sortBy === "delta-high") return b.priceDelta - a.priceDelta;
        if (sortBy === "delta-low") return a.priceDelta - b.priceDelta;
        if (sortBy === "travel-high") return b.travelSurcharge - a.travelSurcharge;
        if (sortBy === "name") return a.venueName.localeCompare(b.venueName);
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [venues, selectedType, searchQuery, sortBy]);

  // Venue Type Handlers
  const handleAddVenueType = (newTypeName) => {
    const trimmed = (newTypeName || "").trim();
    if (!trimmed) return null;
    if (venueTypes.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      alert("A venue type with this name already exists.");
      return trimmed;
    }
    setVenueTypes((prev) => [trimmed, ...prev]);
    return trimmed;
  };

  const handleRenameVenueType = (oldName, newName) => {
    if (!newName.trim() || oldName === newName) return;
    const trimmed = newName.trim();
    if (venueTypes.some((t) => t.toLowerCase() === trimmed.toLowerCase() && t !== oldName)) {
      alert("A venue type with this name already exists.");
      return;
    }

    setVenueTypes((prev) => prev.map((t) => (t === oldName ? trimmed : t)));
    setVenues((prev) =>
      prev.map((v) => (v.venueType === oldName ? { ...v, venueType: trimmed } : v))
    );
    if (selectedType === oldName) {
      setSelectedType(trimmed);
    }
  };

  const handleDeleteVenueType = (typeName, reassignTarget = null) => {
    if (reassignTarget) {
      setVenues((prev) =>
        prev.map((v) => (v.venueType === typeName ? { ...v, venueType: reassignTarget } : v))
      );
    }
    setVenueTypes((prev) => prev.filter((t) => t !== typeName));
    if (selectedType === typeName) {
      setSelectedType("All");
    }
  };

  // Venue Handlers
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
      const newVenue = {
        ...savedData,
        id: `ven-${code}`,
        code,
        createdAt: savedData.createdAt || Date.now(),
      };
      setVenues((prev) => [newVenue, ...prev]);
      setSortBy("recent");
      setSelectedType("All");
      setSearchQuery("");
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
            Manage venue classifications, location types, event price deltas, and travel surcharges.
          </p>
        </div>

        {/* Action Buttons: Manage Types & Add Venue */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => setIsManageTypesOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-glam-surface-alt border border-glam-border/50 text-glam-text hover:text-glam-accent hover:border-glam-accent/50 font-semibold text-xs transition-all cursor-pointer"
          >
            <Settings size={14} />
            <span>Manage Types</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white font-semibold text-xs shadow-sm hover:shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Venue</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
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
          icon={FolderKanban}
          title="Venue Types"
          value={`${stats.typeCount} Classifications`}
          subtitle="Manageable categories"
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

        {/* Dynamic Venue Type Filter Pills + Manage Shortcut */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-glam-border/30 pt-2.5">
          {["All", ...venueTypes].map((type) => {
            const isSelected = selectedType === type;
            const IconComponent = type === "All" ? MapPin : getVenueIcon(type);
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

          <button
            type="button"
            onClick={() => setIsManageTypesOpen(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap bg-glam-surface-alt/60 text-glam-accent border border-glam-accent/30 hover:bg-glam-accent/10 transition-colors cursor-pointer ml-1"
          >
            <Plus size={12} />
            <span>Manage Types</span>
          </button>
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
          <p className="text-xs text-glam-text-muted mt-1 max-w-sm">
            {searchQuery
              ? `No venues matched "${searchQuery}". Try a different keyword.`
              : selectedType !== "All"
              ? `No venues configured under "${selectedType}". Click Add Venue to create one.`
              : "No venues exist in the system yet."}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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

      {/* Add / Edit Venue Modal */}
      <VenueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVenue}
        editingVenue={editingVenue}
        venueTypeOptions={venueTypes}
        onAddVenueType={handleAddVenueType}
        onOpenManageTypes={() => {
          setIsManageTypesOpen(true);
        }}
      />

      {/* Manage Venue Types Modal */}
      <ManageVenueTypesModal
        isOpen={isManageTypesOpen}
        onClose={() => setIsManageTypesOpen(false)}
        venueTypes={venueTypes}
        venues={venues}
        onAddType={handleAddVenueType}
        onRenameType={handleRenameVenueType}
        onDeleteType={handleDeleteVenueType}
      />

      {/* Delete Venue Modal */}
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
