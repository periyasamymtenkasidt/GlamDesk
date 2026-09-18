import { useState, useMemo, useEffect } from "react";
import {
  Users,
  Scissors,
  Sparkles,
  Smile,
  Gem,
  Camera,
  Crown,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Clock,
  Calendar,
  Phone,
  MessageSquare,
  CheckCircle2,
  XCircle,
  IndianRupee,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Star,
  MapPin,
  CalendarX,
  Sun,
  Moon,
} from "lucide-react";
import {
  initialVendors,
  vendorRolesList,
  experienceTiers,
} from "../../data/vendorData";
import Modal from "../../components/common/Modal";
import { Input, Select, Checkbox } from "../../components/common/form";

// ─── Role Icon Mapping ────────────────────────────────────────────────────────
const roleIcons = {
  "Hair Stylist": Scissors,
  "Saree Draper": Sparkles,
  "Assistant Makeup Artist": Smile,
  "Mehendi Artist": Gem,
  "Photographer / BTS": Camera,
  "Flower / Jewelry Stylist": Crown,
};

// ─── KPI Metric Card ──────────────────────────────────────────────────────────
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

// ─── Vendor Card Component (Grid View) ────────────────────────────────────────
const VendorCard = ({
  vendor,
  onEdit,
  onDelete,
  onManageSchedule,
  onToggleActive,
}) => {
  const RoleIcon = roleIcons[vendor.role] || Users;
  const hasBlackouts = vendor.blackouts && vendor.blackouts.length > 0;

  return (
    <div
      className={`group flex flex-col justify-between rounded-2xl border border-glam-border/50 bg-glam-surface p-5 shadow-xs hover:border-glam-accent/60 hover:shadow-md transition-all duration-200 ${
        !vendor.isActive ? "opacity-75" : ""
      }`}
    >
      <div>
        {/* Top Header: Role badge, Code & Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-glam-accent/10 text-glam-accent flex items-center justify-center shrink-0">
              <RoleIcon size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-glam-accent">
                {vendor.role}
              </span>
              <span className="text-[10px] text-glam-text-muted ml-1.5">
                #{vendor.code}
              </span>
              <h3 className="text-base font-bold font-outfit text-glam-text leading-tight group-hover:text-glam-accent transition-colors">
                {vendor.name}
              </h3>
            </div>
          </div>

          {/* Real-time Status Pill */}
          <button
            onClick={() => onToggleActive(vendor.id)}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors cursor-pointer shrink-0 ${
              !vendor.isActive
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : hasBlackouts
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
            title="Click to toggle active status"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                !vendor.isActive
                  ? "bg-rose-500"
                  : hasBlackouts
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
            />
            {!vendor.isActive
              ? "Inactive"
              : hasBlackouts
              ? "Busy Slots"
              : "Available 24/7"}
          </button>
        </div>

        {/* Contact & Experience Row */}
        <div className="flex items-center justify-between text-xs text-glam-text-muted mb-3.5 pb-3 border-b border-glam-border/30">
          <div className="flex items-center gap-1.5">
            <Phone size={12} className="text-glam-accent" />
            <span className="font-medium text-glam-text">{vendor.phone}</span>
          </div>
          <span className="text-[11px] font-semibold text-glam-accent bg-glam-accent/10 px-2 py-0.5 rounded-md">
            {vendor.experienceTier}
          </span>
        </div>

        {/* Remuneration Grid */}
        <div className="rounded-xl p-3 bg-glam-surface-alt/30 border border-glam-border/30 mb-3.5 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-glam-text-muted">
                Event Payout
              </span>
              <span className="text-sm font-bold font-outfit text-glam-text">
                ₹{vendor.baseEventRate.toLocaleString("en-IN")}
                <span className="text-[10px] font-normal text-glam-text-muted">
                  {" "}/ event
                </span>
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-glam-text-muted">
                Per Extra Head
              </span>
              <span className="text-sm font-bold font-outfit text-glam-text">
                {vendor.perExtraHeadRate > 0
                  ? `+₹${vendor.perExtraHeadRate.toLocaleString("en-IN")}`
                  : "Included"}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-glam-border/20 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-glam-text-muted">
              <Moon size={12} className="text-glam-accent" />
              <span>Early Call (12 AM - 5 AM):</span>
            </span>
            <span className="font-bold text-glam-accent font-outfit">
              +₹{vendor.earlyMorningSurcharge.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* 24-Hr Availability / Blackout Snapshot */}
        <div className="text-[11px] px-2.5 py-1.5 rounded-lg bg-glam-surface-alt/50 text-glam-text-muted flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 truncate">
            <Clock size={12} className="text-glam-accent shrink-0" />
            <span className="truncate">
              {hasBlackouts
                ? `${vendor.blackouts.length} blackout slot(s) scheduled`
                : "No schedule conflicts (24/7 on call)"}
            </span>
          </div>
          <button
            onClick={() => onManageSchedule(vendor)}
            className="text-[10px] font-bold text-glam-accent hover:underline shrink-0 cursor-pointer ml-2"
          >
            Manage
          </button>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-glam-border/30 flex items-center justify-between">
        <button
          onClick={() => onManageSchedule(vendor)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
        >
          <Calendar size={12} />
          <span>Schedule</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(vendor)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-glam-text hover:text-glam-accent hover:bg-glam-accent/10 border border-glam-border/40 transition-colors cursor-pointer"
          >
            <Edit2 size={12} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(vendor.id)}
            className="p-1.5 rounded-lg text-glam-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Delete Vendor"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Vendor Table View ────────────────────────────────────────────────────────
const VendorTableView = ({
  vendors,
  onEdit,
  onDelete,
  onManageSchedule,
  onToggleActive,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-glam-border/50 bg-glam-surface shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-glam-border/40 bg-glam-surface-alt/40 text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
              <th className="py-3 px-4">Vendor Details</th>
              <th className="py-3 px-4">Role & Specialization</th>
              <th className="py-3 px-4">Event Payout</th>
              <th className="py-3 px-4">Early Call Surcharge</th>
              <th className="py-3 px-4">Availability</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glam-border/30 text-xs">
            {vendors.map((vendor) => {
              const RoleIcon = roleIcons[vendor.role] || Users;
              const hasBlackouts =
                vendor.blackouts && vendor.blackouts.length > 0;

              return (
                <tr
                  key={vendor.id}
                  className="hover:bg-glam-surface-alt/30 transition-colors"
                >
                  {/* Vendor Name & Phone */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-glam-accent/10 text-glam-accent flex items-center justify-center shrink-0">
                        <RoleIcon size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-outfit text-glam-text text-sm">
                            {vendor.name}
                          </span>
                          <span className="text-[10px] text-glam-text-muted">
                            #{vendor.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-glam-text-muted mt-0.5">
                          {vendor.phone} · {vendor.city}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role & Tier */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-glam-surface-alt text-glam-text border border-glam-border/30">
                      {vendor.role}
                    </span>
                    <span className="block text-[10px] text-glam-text-muted mt-1">
                      {vendor.experienceTier}
                    </span>
                  </td>

                  {/* Payout */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold font-outfit text-sm text-glam-text">
                      ₹{vendor.baseEventRate.toLocaleString("en-IN")}
                    </span>
                    {vendor.perExtraHeadRate > 0 && (
                      <span className="block text-[10px] text-glam-text-muted">
                        +₹{vendor.perExtraHeadRate}/extra head
                      </span>
                    )}
                  </td>

                  {/* Early Call */}
                  <td className="py-3.5 px-4 font-outfit font-semibold text-glam-accent">
                    +₹{vendor.earlyMorningSurcharge.toLocaleString("en-IN")}
                  </td>

                  {/* Availability */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => onToggleActive(vendor.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer ${
                        !vendor.isActive
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : hasBlackouts
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          !vendor.isActive
                            ? "bg-rose-500"
                            : hasBlackouts
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />
                      {!vendor.isActive
                        ? "Inactive"
                        : hasBlackouts
                        ? `${vendor.blackouts.length} Blocked`
                        : "Available"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onManageSchedule(vendor)}
                        className="p-1.5 rounded-lg text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
                        title="Manage Blackout Schedule"
                      >
                        <Calendar size={13} />
                      </button>
                      <button
                        onClick={() => onEdit(vendor)}
                        className="p-1.5 rounded-lg text-glam-text-muted hover:text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
                        title="Edit Profile"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => onDelete(vendor.id)}
                        className="p-1.5 rounded-lg text-glam-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Vendor"
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

// ─── Availability & Blackout Schedule Modal ───────────────────────────────────
const AvailabilityModal = ({
  isOpen,
  onClose,
  vendor,
  onAddBlackout,
  onRemoveBlackout,
}) => {
  const [slotData, setSlotData] = useState({
    date: "",
    startTime: "03:00",
    endTime: "09:00",
    reason: "",
  });

  if (!isOpen || !vendor) return null;

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!slotData.date || !slotData.startTime || !slotData.endTime) return;

    onAddBlackout(vendor.id, {
      id: `bo-${Date.now()}`,
      date: slotData.date,
      startTime: slotData.startTime,
      endTime: slotData.endTime,
      reason: slotData.reason || "Event booking / Busy",
    });

    setSlotData({
      date: "",
      startTime: "03:00",
      endTime: "09:00",
      reason: "",
    });
  };

  const fieldClass =
    "w-full h-9 px-3 rounded-xl border border-glam-border/50 bg-glam-surface-alt/30 text-xs font-medium text-glam-text focus:outline-none focus:border-glam-accent";

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <Modal.Header
        title={`24-Hr Schedule · ${vendor.name}`}
        icon={Calendar}
        onClose={onClose}
      />
      <Modal.Body>
        <div className="space-y-4">
          <p className="text-xs text-glam-text-muted">
            Vendors operate on on-call availability for 24-hour wedding events.
            Add blackout dates & time windows when they are busy or booked elsewhere.
          </p>

          {/* Add Blackout Slot Form */}
          <form
            onSubmit={handleAddSlot}
            className="p-3.5 rounded-2xl bg-glam-surface-alt/40 border border-glam-border/40 space-y-3"
          >
            <h4 className="text-xs font-bold font-outfit text-glam-text flex items-center gap-1.5">
              <CalendarX size={14} className="text-glam-accent" />
              <span>Block Out Busy Time Window</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input
                label="Date"
                type="date"
                required
                value={slotData.date}
                onChange={(e) =>
                  setSlotData({ ...slotData, date: e.target.value })
                }
              />
              <Input
                label="From"
                type="time"
                required
                value={slotData.startTime}
                onChange={(e) =>
                  setSlotData({ ...slotData, startTime: e.target.value })
                }
              />
              <Input
                label="To"
                type="time"
                required
                value={slotData.endTime}
                onChange={(e) =>
                  setSlotData({ ...slotData, endTime: e.target.value })
                }
              />
            </div>

            <Input
              label="Reason / Note"
              placeholder="e.g. Bridal Muhurtham gig at Leela Palace"
              value={slotData.reason}
              onChange={(e) =>
                setSlotData({ ...slotData, reason: e.target.value })
              }
            />

            <button
              type="submit"
              className="w-full h-8 rounded-xl bg-glam-accent text-white text-xs font-semibold hover:opacity-95 transition-opacity cursor-pointer"
            >
              + Add Busy Window
            </button>
          </form>

          {/* Active Blackouts List */}
          <div>
            <h4 className="text-xs font-bold font-outfit text-glam-text mb-2 flex items-center justify-between">
              <span>Scheduled Blackout Windows</span>
              <span className="text-[10px] font-semibold text-glam-text-muted">
                {vendor.blackouts?.length || 0} Blocked
              </span>
            </h4>

            {!vendor.blackouts || vendor.blackouts.length === 0 ? (
              <div className="p-4 rounded-xl bg-glam-surface-alt/30 border border-glam-border/30 text-center">
                <CheckCircle2
                  size={20}
                  className="text-emerald-500 mx-auto mb-1"
                />
                <p className="text-xs font-medium text-glam-text">
                  Available 24/7 on call
                </p>
                <p className="text-[10px] text-glam-text-muted mt-0.5">
                  No upcoming busy blocks scheduled for this collaborator.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {vendor.blackouts.map((bo) => (
                  <div
                    key={bo.id}
                    className="p-2.5 rounded-xl bg-glam-surface-alt/50 border border-glam-border/40 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-glam-text font-outfit">
                          {bo.date}
                        </span>
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded">
                          {bo.startTime} – {bo.endTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-glam-text-muted mt-0.5">
                        {bo.reason}
                      </p>
                    </div>

                    <button
                      onClick={() => onRemoveBlackout(vendor.id, bo.id)}
                      className="p-1 text-glam-text-muted hover:text-rose-500 transition-colors cursor-pointer"
                      title="Remove blocked window"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          onClick={onClose}
          className="w-full h-10 rounded-xl bg-glam-surface-alt border border-glam-border/50 text-xs font-semibold text-glam-text hover:bg-glam-surface-alt/70 transition-colors cursor-pointer"
        >
          Done
        </button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Vendor Profile Add / Edit Modal ──────────────────────────────────────────
const VendorModal = ({ isOpen, onClose, onSave, editingVendor }) => {
  const [formData, setFormData] = useState({
    name: "",
    role: "Hair Stylist",
    phone: "",
    whatsapp: "",
    experienceTier: "Senior Freelancer",
    city: "Local",
    baseEventRate: 2000,
    perExtraHeadRate: 500,
    earlyMorningSurcharge: 400,
    travelSurcharge: 0,
    isActive: true,
  });

  useEffect(() => {
    if (editingVendor) {
      setFormData({
        name: editingVendor.name || "",
        role: editingVendor.role || "Hair Stylist",
        phone: editingVendor.phone || "",
        whatsapp: editingVendor.whatsapp || "",
        experienceTier: editingVendor.experienceTier || "Senior Freelancer",
        city: editingVendor.city || "Local",
        baseEventRate: editingVendor.baseEventRate ?? 2000,
        perExtraHeadRate: editingVendor.perExtraHeadRate ?? 500,
        earlyMorningSurcharge: editingVendor.earlyMorningSurcharge ?? 400,
        travelSurcharge: editingVendor.travelSurcharge ?? 0,
        isActive: editingVendor.isActive ?? true,
      });
    } else {
      setFormData({
        name: "",
        role: "Hair Stylist",
        phone: "",
        whatsapp: "",
        experienceTier: "Senior Freelancer",
        city: "Local",
        baseEventRate: 2000,
        perExtraHeadRate: 500,
        earlyMorningSurcharge: 400,
        travelSurcharge: 0,
        isActive: true,
      });
    }
  }, [editingVendor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    onSave({
      ...formData,
      baseEventRate: Number(formData.baseEventRate),
      perExtraHeadRate: Number(formData.perExtraHeadRate),
      earlyMorningSurcharge: Number(formData.earlyMorningSurcharge),
      travelSurcharge: Number(formData.travelSurcharge),
    });
  };

  const fieldClass =
    "w-full h-10 px-3.5 rounded-xl border border-glam-border/50 bg-glam-surface-alt/30 text-xs font-medium text-glam-text focus:outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent/40 transition-all";

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <Modal.Header
        title={editingVendor ? "Edit Collaborator" : "Add Collaborator"}
        icon={Users}
        onClose={onClose}
      />
      <Modal.Body>
        <form id="vendor-form" onSubmit={handleSubmit} className="space-y-3.5">
          {/* Name */}
          <Input
            label="Collaborator Name"
            required
            placeholder="e.g. Priya Sundaram"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          {/* Role & Experience Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Specialization / Role"
              required
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              options={vendorRolesList.filter((r) => r !== "All")}
            />

            <Select
              label="Experience Tier"
              value={formData.experienceTier}
              onChange={(e) =>
                setFormData({ ...formData, experienceTier: e.target.value })
              }
              options={experienceTiers}
            />
          </div>

          {/* Phone & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              required
              placeholder="+91 98451 22345"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />

            <Input
              label="Location Coverage"
              placeholder="e.g. Chennai / Local"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
          </div>

          {/* Remuneration Settings */}
          <div className="pt-1">
            <h4 className="text-xs font-bold font-outfit text-glam-text mb-2">
              Event Remuneration & Charges
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Base Event Payout"
                required
                type="number"
                prefix="₹"
                min="0"
                step="100"
                value={formData.baseEventRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    baseEventRate: e.target.value,
                  })
                }
              />

              <Input
                label="Per Extra Head Rate"
                type="number"
                prefix="₹"
                min="0"
                step="50"
                value={formData.perExtraHeadRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    perExtraHeadRate: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <Input
                label="Early Call (12 AM - 5 AM)"
                type="number"
                prefix="₹"
                min="0"
                step="50"
                value={formData.earlyMorningSurcharge}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    earlyMorningSurcharge: e.target.value,
                  })
                }
              />

              <Input
                label="Travel Allowance"
                type="number"
                prefix="₹"
                min="0"
                step="50"
                value={formData.travelSurcharge}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    travelSurcharge: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Active Checkbox */}
          <div className="pt-2">
            <Checkbox
              label="Available for On-Call Event Bookings"
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
          form="vendor-form"
          className="flex-1 h-10 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-xs font-semibold text-white shadow-md hover:opacity-95 transition-opacity cursor-pointer"
        >
          {editingVendor ? "Save Changes" : "Create Collaborator"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Delete Confirmation Modal ─────────────────────────────────────────────────
const DeleteModal = ({ isOpen, onClose, onConfirm, vendorName }) => (
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
        Delete Collaborator?
      </h3>
      <p className="text-xs text-glam-text-muted mt-1.5 leading-relaxed">
        Are you sure you want to remove{" "}
        <span className="font-semibold text-glam-text">"{vendorName}"</span>?
        Their past event records will remain preserved.
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

// ─── Main Vendor Master Component ─────────────────────────────────────────────
const VendorMaster = () => {
  const [vendors, setVendors] = useState(initialVendors);
  const [selectedRole, setSelectedRole] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rate-low");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"

  // Modal states
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [schedulingVendor, setSchedulingVendor] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Key Metrics
  const stats = useMemo(() => {
    const total = vendors.length;
    const active = vendors.filter((v) => v.isActive).length;
    const sumRates = vendors.reduce((acc, v) => acc + v.baseEventRate, 0);
    const avgRate = total > 0 ? Math.round(sumRates / total) : 0;
    const earlyCallCount = vendors.filter(
      (v) => v.earlyMorningSurcharge > 0
    ).length;

    return { total, active, avgRate, earlyCallCount };
  }, [vendors]);

  // Filter & Sort
  const filteredVendors = useMemo(() => {
    return vendors
      .filter((vendor) => {
        const matchesRole =
          selectedRole === "All" || vendor.role === selectedRole;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          vendor.name.toLowerCase().includes(q) ||
          vendor.role.toLowerCase().includes(q) ||
          vendor.phone.includes(q) ||
          vendor.code.toLowerCase().includes(q);
        return matchesRole && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "rate-high") return b.baseEventRate - a.baseEventRate;
        if (sortBy === "rate-low") return a.baseEventRate - b.baseEventRate;
        if (sortBy === "completed") return b.completedEvents - a.completedEvents;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
      });
  }, [vendors, selectedRole, searchQuery, sortBy]);

  // Status toggle
  const handleToggleActive = (id) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v))
    );
  };

  // Add / Edit
  const handleOpenAddModal = () => {
    setEditingVendor(null);
    setIsVendorModalOpen(true);
  };

  const handleOpenEditModal = (vendor) => {
    setEditingVendor(vendor);
    setIsVendorModalOpen(true);
  };

  const handleSaveVendor = (savedData) => {
    if (editingVendor) {
      setVendors((prev) =>
        prev.map((v) =>
          v.id === editingVendor.id ? { ...v, ...savedData } : v
        )
      );
    } else {
      const code = `${savedData.role.charAt(0).toUpperCase()}-${Math.floor(
        Math.random() * 900 + 100
      )}`;
      const newVendor = {
        ...savedData,
        id: `vnd-${Date.now()}`,
        code,
        rating: 5.0,
        completedEvents: 0,
        blackouts: [],
      };
      setVendors((prev) => [newVendor, ...prev]);
    }
    setIsVendorModalOpen(false);
  };

  // Blackout Management
  const handleOpenScheduleModal = (vendor) => {
    setSchedulingVendor(vendor);
  };

  const handleAddBlackout = (vendorId, slot) => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === vendorId
          ? { ...v, blackouts: [...(v.blackouts || []), slot] }
          : v
      )
    );
    // Keep schedulingVendor state in sync
    setSchedulingVendor((prev) =>
      prev && prev.id === vendorId
        ? { ...prev, blackouts: [...(prev.blackouts || []), slot] }
        : prev
    );
  };

  const handleRemoveBlackout = (vendorId, slotId) => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === vendorId
          ? {
              ...v,
              blackouts: (v.blackouts || []).filter((b) => b.id !== slotId),
            }
          : v
      )
    );
    setSchedulingVendor((prev) =>
      prev && prev.id === vendorId
        ? {
            ...prev,
            blackouts: (prev.blackouts || []).filter((b) => b.id !== slotId),
          }
        : prev
    );
  };

  // Delete
  const handleDeleteConfirm = () => {
    if (deletingId) {
      setVendors((prev) => prev.filter((v) => v.id !== deletingId));
      setDeletingId(null);
    }
  };

  const deletingVendorObj = vendors.find((v) => v.id === deletingId);

  return (
    <div className="space-y-5">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-glam-surface border border-glam-border/40 p-4 sm:p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-glam-accent/10 text-glam-accent">
              <Users size={18} />
            </span>
            <h1 className="text-xl font-bold font-outfit text-glam-text tracking-tight">
              Vendor Master
            </h1>
          </div>
          <p className="text-xs text-glam-text-muted mt-1">
            Manage freelance hairstylists, saree drapers, assistants, per-event remuneration, and 24-hour availability.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white font-semibold text-xs shadow-sm hover:shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus size={15} />
          <span>Add Collaborator</span>
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Layers}
          title="Total Collaborators"
          value={stats.total}
          subtitle={`${stats.active} Active on call`}
        />
        <StatCard
          icon={Clock}
          title="24/7 Available"
          value={vendors.filter((v) => v.isActive && (!v.blackouts || v.blackouts.length === 0)).length}
          subtitle="Zero schedule conflicts"
        />
        <StatCard
          icon={IndianRupee}
          title="Average Payout"
          value={`₹${stats.avgRate.toLocaleString("en-IN")}`}
          subtitle="Per event assignment"
        />
        <StatCard
          icon={Moon}
          title="Early Call Enabled"
          value={`${stats.earlyCallCount} Vendors`}
          subtitle="12 AM - 5 AM Muhurtham tier"
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
              placeholder="Search collaborator by name, role, phone, or code (#H-101)..."
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
                <option value="rate-low">Payout: Low to High</option>
                <option value="rate-high">Payout: High to Low</option>
                <option value="completed">Most Gigs Completed</option>
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

        {/* Role Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-glam-border/30 pt-2.5">
          {vendorRolesList.map((role) => {
            const isSelected = selectedRole === role;
            const RoleIcon = roleIcons[role] || Users;
            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-linear-to-r from-glam-accent to-glam-accent-2 text-white shadow-xs"
                    : "bg-glam-surface-alt text-glam-text-muted border border-glam-border/40 hover:text-glam-accent"
                }`}
              >
                {role !== "All" && <RoleIcon size={12} />}
                <span>{role}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Vendor Content Display */}
      {filteredVendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-glam-surface border border-glam-border/40 rounded-2xl text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-glam-accent/10 text-glam-accent flex items-center justify-center mb-3">
            <Users size={24} />
          </div>
          <h3 className="text-base font-bold font-outfit text-glam-text">
            No collaborators found
          </h3>
          <p className="text-xs text-glam-text-muted mt-1">
            Try adjusting your search keywords or role selection filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedRole("All");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-glam-surface-alt border border-glam-border/50 text-xs font-semibold text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onEdit={handleOpenEditModal}
              onDelete={(id) => setDeletingId(id)}
              onManageSchedule={handleOpenScheduleModal}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      ) : (
        <VendorTableView
          vendors={filteredVendors}
          onEdit={handleOpenEditModal}
          onDelete={(id) => setDeletingId(id)}
          onManageSchedule={handleOpenScheduleModal}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* Modals */}
      <VendorModal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        onSave={handleSaveVendor}
        editingVendor={editingVendor}
      />

      <AvailabilityModal
        isOpen={!!schedulingVendor}
        onClose={() => setSchedulingVendor(null)}
        vendor={schedulingVendor}
        onAddBlackout={handleAddBlackout}
        onRemoveBlackout={handleRemoveBlackout}
      />

      <DeleteModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        vendorName={deletingVendorObj?.name}
      />
    </div>
  );
};

export default VendorMaster;
