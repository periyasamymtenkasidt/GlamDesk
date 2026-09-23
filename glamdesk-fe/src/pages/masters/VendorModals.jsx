import { useState, useEffect, useRef } from "react";
import {
  Users,
  Calendar,
  CalendarX,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Edit2,
  Check,
  X,
  Settings,
  FolderKanban,
  Tag,
  Sparkles,
} from "lucide-react";
import { vendorRolesList, defaultRoleSuggestions } from "../../data/vendorData";
import { useVendors } from "../../context/VendorContext";
import Modal from "../../components/modals/Modal";
import { Input, Select, Checkbox } from "../../components/common/form";

// ─── Availability & Blackout Schedule Modal ───────────────────────────────────
export const AvailabilityModal = ({
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
            Add blackout dates & time windows when they are busy or booked
            elsewhere.
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
                  No upcoming busy blocks scheduled for this Vendor.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-none pr-1">
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

// ─── Manage Vendor Roles Modal (Pattern A & C) ──────────────────────────────────
export const ManageVendorRolesModal = ({
  isOpen,
  onClose,
  roles = [],
  vendors = [],
  onAddRole,
  onRenameRole,
  onDeleteRole,
  zIndex = "z-60",
}) => {
  const [newRoleName, setNewRoleName] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [deletingRole, setDeletingRole] = useState(null);
  const [reassignTarget, setReassignTarget] = useState("");

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    if (onAddRole) {
      onAddRole(newRoleName.trim());
    }
    setNewRoleName("");
  };

  const handleStartRename = (role, idx) => {
    setEditingIndex(idx);
    setEditingName(role);
  };

  const handleSaveRename = (oldName) => {
    if (editingName.trim() && editingName.trim() !== oldName && onRenameRole) {
      onRenameRole(oldName, editingName.trim());
    }
    setEditingIndex(null);
    setEditingName("");
  };

  const handleRequestDelete = (roleName) => {
    const count = (vendors || []).filter((v) => v.role === roleName).length;
    if (count === 0) {
      if (onDeleteRole) onDeleteRole(roleName);
    } else {
      const otherRoles = roles.filter((r) => r !== roleName);
      setReassignTarget(otherRoles[0] || "");
      setDeletingRole(roleName);
    }
  };

  const handleConfirmReassignDelete = () => {
    if (deletingRole && onDeleteRole) {
      onDeleteRole(deletingRole, reassignTarget);
      setDeletingRole(null);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg" zIndex={zIndex}>
      <Modal.Header
        title="Manage Vendor Roles"
        icon={FolderKanban}
        onClose={onClose}
      />
      <Modal.Body className="space-y-4">
        {/* Quick Add Form on Top */}
        <form
          onSubmit={handleCreate}
          className="p-3.5 rounded-2xl bg-glam-surface-alt/40 border border-glam-border/40 space-y-2"
        >
          <label className="text-[10px] font-bold uppercase tracking-wider text-glam-text-muted block">
            Add New Professional Role
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g. Nail & Lash Artist, Turban / Peta Stylist..."
              className="flex-1 h-9 px-3 rounded-xl border border-glam-border/60 bg-glam-surface text-xs font-medium text-glam-text focus:outline-none focus:border-glam-accent"
            />
            <button
              type="submit"
              className="px-3.5 h-9 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer shrink-0"
            >
              Add Role
            </button>
          </div>
        </form>

        {/* Delete Reassignment Warning overlay */}
        {deletingRole && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
              <AlertTriangle size={15} />
              <span>
                &ldquo;{deletingRole}&rdquo; is currently assigned to{" "}
                {(vendors || []).filter((v) => v.role === deletingRole).length} vendors
              </span>
            </div>
            <p className="text-[11px] text-glam-text-muted">
              Select which role these vendors should be reassigned to before deletion:
            </p>
            <div className="flex items-center gap-2">
              <select
                value={reassignTarget}
                onChange={(e) => setReassignTarget(e.target.value)}
                className="flex-1 h-9 px-3 rounded-xl border border-glam-border bg-glam-surface text-xs font-semibold text-glam-text"
              >
                {roles
                  .filter((r) => r !== deletingRole)
                  .map((r) => (
                    <option key={r} value={r}>
                      {r}
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
                onClick={() => setDeletingRole(null)}
                className="px-3 h-9 rounded-xl bg-glam-surface border border-glam-border text-xs text-glam-text hover:bg-glam-surface-alt cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Roles List */}
        <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-glam-text-muted px-1 block">
            Existing Professional Roles ({roles.length})
          </span>

          {roles.map((role, idx) => {
            const isEditing = editingIndex === idx;
            const count = (vendors || []).filter((v) => v.role === role).length;

            return (
              <div
                key={role}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-glam-border/40 bg-glam-surface hover:bg-glam-surface-alt/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-glam-accent/10 text-glam-accent flex items-center justify-center shrink-0">
                    <Users size={15} />
                  </div>

                  {isEditing ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRename(role);
                        if (e.key === "Escape") setEditingIndex(null);
                      }}
                      autoFocus
                      className="flex-1 h-8 px-2.5 rounded-lg border border-glam-accent bg-glam-surface text-xs font-bold text-glam-text focus:outline-none"
                    />
                  ) : (
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold font-outfit text-glam-text block truncate">
                        {role}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-glam-surface-alt border border-glam-border/40 text-glam-text-muted">
                    {count} {count === 1 ? "vendor" : "vendors"}
                  </span>

                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSaveRename(role)}
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
                        onClick={() => handleStartRename(role, idx)}
                        className="p-1.5 rounded-lg text-glam-text-muted hover:text-glam-accent hover:bg-glam-accent/15 transition-colors cursor-pointer"
                        title="Rename Role"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRequestDelete(role)}
                        className="p-1.5 rounded-lg text-glam-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Role"
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

// ─── Vendor Profile Add / Edit Modal ──────────────────────────────────────────
export const VendorModal = ({
  isOpen,
  onClose,
  onSave,
  editingVendor,
  customRoles,
  onAddRoleProp,
}) => {
  const contextData = useVendors();
  const roles =
    customRoles ||
    contextData?.roles ||
    vendorRolesList.filter((r) => r !== "All");
  const addRole = onAddRoleProp || contextData?.addRole;
  const renameRole = contextData?.renameRole;
  const deleteRole = contextData?.deleteRole;
  const vendors = contextData?.vendors || [];

  const [formData, setFormData] = useState({
    name: "",
    role: roles?.[0] || "Hair Stylist",
    phone: "",
    whatsapp: "",
    email: "",
    city: "Local",
    baseEventRate: 2000,
    perExtraHeadRate: 500,
    travelSurcharge: 0,
    upiId: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    bio: "",
    specializations: [],
    isActive: true,
  });

  const [isAddingNewRole, setIsAddingNewRole] = useState(false);
  const [newRoleInput, setNewRoleInput] = useState("");
  const [isManageRolesOpen, setIsManageRolesOpen] = useState(false);
  const [customSpecInput, setCustomSpecInput] = useState("");
  const prevRolesRef = useRef(roles);

  useEffect(() => {
    if (!isOpen) return;
    if (editingVendor) {
      setFormData({
        name: editingVendor.name || "",
        role: editingVendor.role || roles?.[0] || "Hair Stylist",
        phone: editingVendor.phone || "",
        whatsapp: editingVendor.whatsapp || "",
        email: editingVendor.email || "",
        city: editingVendor.city || "Local",
        baseEventRate: editingVendor.baseEventRate ?? 2000,
        perExtraHeadRate: editingVendor.perExtraHeadRate ?? 500,
        travelSurcharge: editingVendor.travelSurcharge ?? 0,
        upiId: editingVendor.upiId || "",
        bankName: editingVendor.bankName || "",
        accountNumber: editingVendor.accountNumber || "",
        ifsc: editingVendor.ifsc || "",
        bio: editingVendor.bio || "",
        specializations: Array.isArray(editingVendor.specializations)
          ? [...editingVendor.specializations]
          : [],
        isActive: editingVendor.isActive ?? true,
      });
    } else {
      setFormData({
        name: "",
        role: roles?.[0] || "Hair Stylist",
        phone: "",
        whatsapp: "",
        email: "",
        city: "Local",
        baseEventRate: 2000,
        perExtraHeadRate: 500,
        travelSurcharge: 0,
        upiId: "",
        bankName: "",
        accountNumber: "",
        ifsc: "",
        bio: "",
        specializations: [],
        isActive: true,
      });
    }
    setIsAddingNewRole(false);
    setNewRoleInput("");
    setCustomSpecInput("");
  }, [editingVendor, isOpen]);

  // Synchronize role if roles change without wiping form data
  useEffect(() => {
    if (!isOpen || !roles || roles.length === 0) return;
    const prevRoles = prevRolesRef.current;
    prevRolesRef.current = roles;

    // If new role was added, auto-select it immediately
    if (prevRoles && roles.length > prevRoles.length) {
      const added = roles.find((r) => !prevRoles.includes(r));
      if (added) {
        setFormData((prev) => ({ ...prev, role: added }));
        return;
      }
    }

    // If current role was renamed or removed, adapt gracefully
    if (prevRoles && !roles.includes(formData.role)) {
      const renamed = roles.find((r) => !prevRoles.includes(r));
      if (renamed) {
        setFormData((prev) => ({ ...prev, role: renamed }));
      } else {
        setFormData((prev) => ({ ...prev, role: roles[0] }));
      }
    }
  }, [roles, isOpen, formData.role]);

  if (!isOpen) return null;

  const handleQuickAddRole = () => {
    if (!newRoleInput.trim()) return;
    const created = addRole ? addRole(newRoleInput.trim()) : newRoleInput.trim();
    if (created) {
      setFormData((prev) => ({ ...prev, role: created }));
      setNewRoleInput("");
      setIsAddingNewRole(false);
    }
  };

  const handleAddSpecialization = (spec) => {
    const trimmed = (spec || customSpecInput).trim();
    if (!trimmed) return;
    if (!formData.specializations.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        specializations: [...prev.specializations, trimmed],
      }));
    }
    setCustomSpecInput("");
  };

  const handleRemoveSpecialization = (specToRemove) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((s) => s !== specToRemove),
    }));
  };

  // Quick suggestions for current role
  const suggestions = (defaultRoleSuggestions[formData.role] || []).filter(
    (s) => !formData.specializations.includes(s)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    onSave({
      ...formData,
      specializations: formData.specializations,
      baseEventRate: Number(formData.baseEventRate) || 0,
      perExtraHeadRate: Number(formData.perExtraHeadRate) || 0,
      travelSurcharge: Number(formData.travelSurcharge) || 0,
    });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
        <Modal.Header
          title={editingVendor ? `Edit ${editingVendor.name}` : "Add New Vendor"}
          icon={Users}
          onClose={onClose}
        />
        <Modal.Body className="max-h-[72vh] overflow-y-auto scrollbar-none pr-1">
          <form id="vendor-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Section: Basic Identity & Role */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-glam-accent">
                Personal & Role Details
              </h4>

              <Input
                label="Vendor Name"
                required
                placeholder="e.g. Priya Sundaram"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              {/* Role with Inline New Role & Manage buttons */}
              {isAddingNewRole ? (
                <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/50 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-glam-accent">
                      Create New Vendor Role
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewRole(false)}
                      className="text-[11px] font-semibold text-glam-text-muted hover:text-glam-text cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newRoleInput}
                      onChange={(e) => setNewRoleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleQuickAddRole();
                        }
                        if (e.key === "Escape") setIsAddingNewRole(false);
                      }}
                      autoFocus
                      placeholder="e.g. Nail & Lash Artist, Draping Assistant..."
                      className="flex-1 h-9 px-3 rounded-xl border border-glam-border bg-glam-surface text-xs font-medium text-glam-text focus:outline-none focus:border-glam-accent"
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddRole}
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
                      Specialization / Role *
                    </label>
                    <div className="flex items-center gap-2 text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setIsAddingNewRole(true)}
                        className="text-glam-accent hover:underline cursor-pointer"
                      >
                        + New Role
                      </button>
                      <span className="text-glam-text-muted/40">·</span>
                      <button
                        type="button"
                        onClick={() => setIsManageRolesOpen(true)}
                        className="text-glam-text-muted hover:text-glam-accent cursor-pointer flex items-center gap-1"
                      >
                        <Settings size={11} />
                        <span>Manage</span>
                      </button>
                    </div>
                  </div>
                  <Select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    options={roles}
                  />
                </div>
              )}

              {/* Specializations & Skills Tag Input */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-glam-text flex items-center gap-1.5">
                    <Tag size={13} className="text-glam-accent" />
                    <span>Specializations & Skills</span>
                  </label>
                  <span className="text-[10px] text-glam-text-muted">
                    {formData.specializations.length} skills added
                  </span>
                </div>

                {/* Tag Badges Container */}
                <div className="p-2.5 rounded-xl border border-glam-border/60 bg-glam-surface-alt/30 min-h-[46px] flex flex-wrap items-center gap-1.5">
                  {formData.specializations.length === 0 ? (
                    <span className="text-xs text-glam-text-muted/60 italic">
                      No specific skills added yet. Pick from suggestions below or type your own.
                    </span>
                  ) : (
                    formData.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-glam-surface border border-glam-border/60 text-glam-text shadow-2xs group hover:border-glam-accent/60"
                      >
                        <span>{spec}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialization(spec)}
                          className="text-glam-text-muted hover:text-rose-500 cursor-pointer transition-colors"
                          title={`Remove ${spec}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add Custom Skill Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customSpecInput}
                    onChange={(e) => setCustomSpecInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        handleAddSpecialization();
                      }
                    }}
                    placeholder="Type a skill (e.g. Russian Updo, 3D Pleats) & press Enter..."
                    className="flex-1 h-8 px-3 rounded-xl border border-glam-border/60 bg-glam-surface text-xs font-medium text-glam-text placeholder:text-glam-text-muted focus:outline-none focus:border-glam-accent"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSpecialization()}
                    disabled={!customSpecInput.trim()}
                    className="px-3 h-8 rounded-xl bg-glam-surface-alt border border-glam-border/60 text-xs font-semibold text-glam-text hover:text-glam-accent hover:border-glam-accent/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Add Skill
                  </button>
                </div>

                {/* Role-based Quick Suggestions */}
                {suggestions.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-glam-text-muted block">
                      Suggested for {formData.role}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.slice(0, 6).map((sugg) => (
                        <button
                          key={sugg}
                          type="button"
                          onClick={() => handleAddSpecialization(sugg)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-glam-accent/10 text-glam-accent border border-glam-accent/20 hover:bg-glam-accent/20 transition-colors cursor-pointer"
                        >
                          <Plus size={10} />
                          <span>{sugg}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Contact & Location */}
            <div className="space-y-3 pt-2 border-t border-glam-border/30">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-glam-accent">
                Contact & Coverage
              </h4>

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
                  label="WhatsApp Number"
                  placeholder="+91 98451 22345"
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Vendor@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />

                <Input
                  label="Location Coverage"
                  placeholder="e.g. Chennai & Outstation"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-glam-text mb-1.5">
                  Bio / Additional Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Specializes in contemporary bridal hairstyles, muhurtham pleating..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-glam-border/50 bg-glam-surface-alt/30 text-xs font-medium text-glam-text placeholder:text-glam-text-muted focus:outline-none focus:border-glam-accent transition-colors"
                />
              </div>
            </div>

            {/* Section: Event Remuneration & Rates */}
            <div className="space-y-3 pt-2 border-t border-glam-border/30">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-glam-accent">
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

              <div>
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

            {/* Section: Banking & UPI Details */}
            <div className="space-y-3 pt-2 border-t border-glam-border/30">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-glam-accent">
                Banking & Payout Account
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="UPI ID"
                  placeholder="e.g. name@okhdfcbank"
                  value={formData.upiId}
                  onChange={(e) =>
                    setFormData({ ...formData, upiId: e.target.value })
                  }
                />

                <Input
                  label="Bank Name"
                  placeholder="e.g. HDFC Bank"
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Account Number"
                  placeholder="•••• •••• •••• 4821"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                />

                <Input
                  label="IFSC Code"
                  placeholder="HDFC0001234"
                  value={formData.ifsc}
                  onChange={(e) =>
                    setFormData({ ...formData, ifsc: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Active Checkbox */}
            <div className="pt-2 border-t border-glam-border/30">
              <Checkbox
                label="Active & Available for On-Call Event Bookings"
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
            {editingVendor ? "Save Changes" : "Create Vendor"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Nested Manage Roles Modal - zIndex="z-60" keeps VendorModal mounted */}
      <ManageVendorRolesModal
        isOpen={isManageRolesOpen}
        onClose={() => setIsManageRolesOpen(false)}
        roles={roles}
        vendors={vendors}
        onAddRole={addRole}
        onRenameRole={renameRole}
        onDeleteRole={deleteRole}
        zIndex="z-60"
      />
    </>
  );
};

// ─── Delete Confirmation Modal ─────────────────────────────────────────────────
export const DeleteVendorModal = ({
  isOpen,
  onClose,
  onConfirm,
  vendorName,
  zIndex = "z-70",
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    maxWidth="max-w-sm"
    showAccentBar={false}
    zIndex={zIndex}
  >
    <Modal.Body className="text-center pt-2">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
        <AlertTriangle size={22} />
      </div>
      <h3 className="text-lg font-bold font-outfit text-glam-text">
        Delete Vendor?
      </h3>
      <p className="text-xs text-glam-text-muted mt-1.5 leading-relaxed">
        Are you sure you want to permanently delete{" "}
        <span className="font-semibold text-glam-text">"{vendorName}"</span>?
        Past appointment archives will remain intact.
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
