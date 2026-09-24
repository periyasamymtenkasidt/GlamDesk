import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Sparkles,
  Crown,
  Scissors,
  Smile,
  Gem,
  Tag,
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Clock,
  X,
  Grid,
  List,
  IndianRupee,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  FolderKanban,
  LayoutGrid,
  Camera,
  Heart,
  Palette,
  Wand2,
  Star,
  Flame,
  Feather,
  Settings,
  FolderPlus,
} from "lucide-react";
import { initialServices } from "../../data/serviceData";
import { servicesApi } from "../../services/mastersApi";
import Modal from "../../components/modals/Modal";
import ThemeSelect from "../../components/common/form/ThemeSelect";

// ─── Available Icons for Category Customization ──────────────────────────────
export const AVAILABLE_CATEGORY_ICONS = [
  { name: "Crown", icon: Crown, label: "Royal & Bridal" },
  { name: "Gem", icon: Gem, label: "Luxury & Glam" },
  { name: "Camera", icon: Camera, label: "Editorial & Fashion" },
  { name: "Scissors", icon: Scissors, label: "Hair & Styling" },
  { name: "Smile", icon: Smile, label: "Skincare & Facial" },
  { name: "Sparkles", icon: Sparkles, label: "Glow & Makeup" },
  { name: "Heart", icon: Heart, label: "Pre-Bridal & Love" },
  { name: "Palette", icon: Palette, label: "Makeup Artistry" },
  { name: "Wand2", icon: Wand2, label: "Transformation" },
  { name: "Star", icon: Star, label: "Celebrity / VIP" },
  { name: "Flame", icon: Flame, label: "Trending & Hot" },
  { name: "Feather", icon: Feather, label: "Lashes & Draping" },
];

export const getCategoryIconComponent = (iconName, categoryName) => {
  const found = AVAILABLE_CATEGORY_ICONS.find((i) => i.name === iconName);
  if (found) return found.icon;
  // Fallbacks for initial default categories
  if (categoryName === "Bridal & Luxury") return Crown;
  if (categoryName === "Party & Occasion") return Gem;
  if (categoryName === "Editorial & Fashion") return Camera;
  if (categoryName === "Hair & Styling") return Scissors;
  if (categoryName === "Skincare & Spa") return Smile;
  return Sparkles;
};

// ─── Initial Seed Categories ──────────────────────────────────────────────────
const initialCategoryObjects = [
  {
    id: "cat-bridal",
    name: "Bridal & Luxury",
    description:
      "Royal HD bridal packages, Sagan, engagement glam, airbrush reception looks, and couture draping.",
    icon: "Crown",
  },
  {
    id: "cat-party",
    name: "Party & Occasion",
    description:
      "Celebrity event glam, bridesmaid makeup, cocktail party looks, and customized gala styling.",
    icon: "Gem",
  },
  {
    id: "cat-editorial",
    name: "Editorial & Fashion",
    description:
      "Studio-ready HD shoot makeup, runway looks, high-fashion styling, and portfolio photography sessions.",
    icon: "Camera",
  },
  {
    id: "cat-hair",
    name: "Hair & Styling",
    description:
      "Keratin & cysteine treatments, couture hair updos, blowouts, extensions, and bridal hair prep.",
    icon: "Scissors",
  },
  {
    id: "cat-skincare",
    name: "Skincare & Spa",
    description:
      "Hydra-glow facials, deep pore extraction, pre-bridal cleanups, and luxury skin prep sessions.",
    icon: "Smile",
  },
];

const STORAGE_CATEGORIES_KEY = "glamdesk_service_categories_v2";
const STORAGE_SERVICES_KEY = "glamdesk_services_data_v2";

// ─── KPI Stat Card ────────────────────────────────────────────────────────────
const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  iconColor,
  bgGradient,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-glam-border/60 bg-glam-surface p-4 shadow-xs hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium text-glam-text-muted uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-xl font-bold font-outfit text-glam-text mt-0.5">
            {value}
          </h3>
          {subtitle && (
            <p className="text-[10px] font-medium text-glam-accent mt-0.5 flex items-center gap-1">
              <TrendingUp size={11} />
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${bgGradient} shadow-md`}
        >
          <Icon size={18} className={iconColor || "text-white"} />
        </div>
      </div>
    </div>
  );
};

// ─── Category Overview Card (Level 1) ─────────────────────────────────────────
const CategoryCard = ({
  categoryObj,
  services,
  onSelectCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const IconComponent = getCategoryIconComponent(
    categoryObj.icon,
    categoryObj.name
  );

  const catServices = services.filter((s) => s.category === categoryObj.name);
  const totalCount = catServices.length;
  const popularCount = catServices.filter((s) => s.isPopular).length;

  // Price range calculation
  const amounts = catServices.map((s) => s.amount).filter(Boolean);
  const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0;
  const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;

  return (
    <div
      onClick={() => onSelectCategory(categoryObj.name)}
      className="group relative flex flex-col justify-between rounded-2xl border border-glam-border/60 bg-glam-surface p-5 shadow-xs hover:border-glam-accent/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Subtle top hover accent line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-glam-accent to-glam-accent-2 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Top Icon, Count Badges & Quick Category Actions */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="w-11 h-11 rounded-2xl bg-glam-accent/10 border border-glam-accent/20 flex items-center justify-center text-glam-accent shadow-xs group-hover:scale-105 group-hover:bg-glam-accent group-hover:text-white transition-all duration-300 shrink-0">
            <IconComponent size={20} />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {popularCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Sparkles size={10} />
                Popular
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-glam-surface-alt text-glam-text-muted border border-glam-border/40">
              {totalCount} {totalCount === 1 ? "Service" : "Services"}
            </span>

            {/* Edit / Delete Category Buttons */}
            <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity ml-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCategory(categoryObj);
                }}
                className="p-1.5 rounded-lg text-glam-text-muted hover:text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
                title="Edit Category"
              >
                <Edit2 size={13} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCategory(categoryObj);
                }}
                className="p-1.5 rounded-lg text-glam-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Delete Category"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold font-outfit text-glam-text group-hover:text-glam-accent transition-colors leading-snug">
          {categoryObj.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-glam-text-muted mt-1 leading-relaxed line-clamp-2">
          {categoryObj.description || "Specialized salon and styling offerings."}
        </p>
      </div>

      {/* Bottom Pricing & Action */}
      <div className="mt-5 pt-3.5 border-t border-glam-border/40 flex items-center justify-between">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-glam-text-muted">
            Starting From
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-sm font-bold font-outfit text-transparent bg-clip-text bg-linear-to-r from-glam-accent to-glam-accent-2">
              {minAmount > 0
                ? `₹${minAmount.toLocaleString("en-IN")}`
                : "Configuring"}
            </span>
            {maxAmount > minAmount && (
              <span className="text-[10px] text-glam-text-muted font-medium">
                – ₹{maxAmount.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>

        <div className="inline-flex items-center gap-1 text-xs font-semibold text-glam-accent group-hover:translate-x-1 transition-transform">
          <span>View</span>
          <ArrowRight size={13} />
        </div>
      </div>
    </div>
  );
};

// ─── Individual Service Card (Level 2 Grid) ───────────────────────────────────
const ServiceCard = ({
  service,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const IconComponent = getCategoryIconComponent(null, service.category);

  const formatDuration = (mins) => {
    if (mins < 60) return `${mins} mins`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs} hrs`;
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border border-glam-border/60 transition-all duration-300 overflow-hidden bg-glam-surface shadow-xs p-5 ${
        service.isActive
          ? "hover:-translate-y-1 hover:border-glam-accent/80 hover:shadow-md"
          : "opacity-75 hover:opacity-100"
      }`}
    >
      <div>
        {/* Header row with Category badge & Active status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-glam-accent/10 text-glam-accent">
            <IconComponent size={12} />
            {service.category}
          </span>

          <div className="flex items-center gap-2">
            {service.isPopular && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Sparkles size={10} />
                Popular
              </span>
            )}
            <button
              onClick={() => onToggleStatus(service.id)}
              title={
                service.isActive ? "Deactivate service" : "Activate service"
              }
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                service.isActive
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  service.isActive ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              {service.isActive ? "Active" : "Inactive"}
            </button>
          </div>
        </div>

        {/* Title & Amount */}
        <div className="mt-1">
          <h3 className="text-base font-bold font-outfit text-glam-text leading-snug group-hover:text-glam-accent transition-colors">
            {service.name}
          </h3>

          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xs font-medium text-glam-text-muted">
              Rate:
            </span>
            <span className="text-lg font-bold font-outfit text-transparent bg-clip-text bg-linear-to-r from-glam-accent to-glam-accent-2">
              ₹{service.amount.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-medium text-glam-text-muted">
              / session
            </span>
          </div>
        </div>

        {/* Duration & Location details */}
        <div className="mt-2.5 flex items-center gap-4 text-xs text-glam-text-muted font-medium py-1">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-glam-accent" />
            <span>{formatDuration(service.duration)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-glam-accent-2" />
            <span>{service.locationType}</span>
          </div>
        </div>

        {/* Description */}
        <p className="mt-2 text-xs text-glam-text-muted leading-relaxed line-clamp-2">
          {service.description}
        </p>

        {/* Feature tags */}
        {service.features && service.features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {service.features.map((feat, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-glam-surface-alt text-glam-text-muted border border-glam-border/30"
              >
                ✓ {feat}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer Action Buttons */}
      <div className="mt-5 pt-3 border-t border-glam-border/40 flex items-center justify-end gap-2">
        <button
          onClick={() => onEdit(service)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
          title="Edit Service"
        >
          <Edit2 size={12} />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(service.id)}
          className="p-1.5 rounded-xl text-glam-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
          title="Delete Service"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

// ─── Individual Service List Item (Level 2 List) ──────────────────────────────
const ServiceListItem = ({
  service,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const IconComponent = getCategoryIconComponent(null, service.category);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-glam-border/60 bg-glam-surface shadow-xs hover:border-glam-accent hover:shadow-sm transition-all duration-200">
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-glam-accent/10 flex items-center justify-center shrink-0 text-glam-accent">
          <IconComponent size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold font-outfit text-glam-text truncate">
              {service.name}
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-glam-surface-alt text-glam-text-muted border border-glam-border/30">
              {service.category}
            </span>
            {service.isPopular && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                Popular
              </span>
            )}
          </div>
          <p className="text-xs text-glam-text-muted truncate mt-0.5">
            {service.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-glam-border/30">
        <div className="text-left sm:text-right">
          <div className="text-base font-bold font-outfit text-glam-accent">
            ₹{service.amount.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-glam-text-muted flex items-center gap-1">
            <Clock size={10} />
            {service.duration} mins · {service.locationType}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleStatus(service.id)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer ${
              service.isActive
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
            }`}
          >
            {service.isActive ? "Active" : "Inactive"}
          </button>
          <button
            onClick={() => onEdit(service)}
            className="p-1.5 rounded-lg text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
            title="Edit"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(service.id)}
            className="p-1.5 rounded-lg text-glam-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Category Modal (Add / Edit) ──────────────────────────────────────────────
const CategoryModal = ({
  isOpen,
  onClose,
  onSave,
  editingCategory,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Sparkles");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name || "");
      setDescription(editingCategory.description || "");
      setIcon(editingCategory.icon || "Sparkles");
      setError("");
    } else {
      setName("");
      setDescription("");
      setIcon("Sparkles");
      setError("");
    }
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a category name");
      return;
    }
    onSave({
      id: editingCategory?.id || `cat-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      icon: icon || "Sparkles",
    });
  };

  const fieldClass =
    "w-full h-10 px-3.5 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-sm text-glam-text/90 focus:outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent/50";

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <Modal.Header
        title={editingCategory ? "Edit Category" : "Create New Category"}
        icon={Tag}
        onClose={onClose}
      />
      <Modal.Body>
        <form id="category-form" onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-glam-text mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Nail Couture & Extensions"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className={fieldClass}
            />
            {error && (
              <p className="text-xs text-rose-500 font-medium mt-1">{error}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-glam-text mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of treatments and services in this category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-xs text-glam-text/90 focus:outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent/50"
            />
          </div>

          {/* Visual Icon Picker */}
          <div>
            <label className="block text-xs font-semibold text-glam-text mb-2">
              Select Category Icon
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {AVAILABLE_CATEGORY_ICONS.map((item) => {
                const IconCmp = item.icon;
                const isSelected = icon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-glam-accent/15 border-glam-accent text-glam-accent shadow-xs ring-2 ring-glam-accent/30"
                        : "bg-glam-surface-alt/40 border-glam-border/40 text-glam-text-muted hover:text-glam-text hover:bg-glam-surface-alt"
                    }`}
                    title={item.label}
                  >
                    <IconCmp size={18} />
                    <span className="text-[9px] mt-1 truncate max-w-full font-medium">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-10 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-xs font-semibold text-glam-text hover:bg-glam-surface-alt/70 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="category-form"
          className="flex-1 h-10 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-xs font-semibold text-white shadow-md hover:opacity-95 transition-opacity cursor-pointer"
        >
          {editingCategory ? "Update Category" : "Create Category"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Delete Category Modal (With Reassignment Safeguard) ───────────────────────
const DeleteCategoryModal = ({
  isOpen,
  onClose,
  onConfirm,
  categoryObj,
  serviceCount,
  availableCategories,
}) => {
  const otherCategories = (availableCategories || []).filter(
    (c) => c.name !== categoryObj?.name
  );
  const [reassignTarget, setReassignTarget] = useState(
    otherCategories[0]?.name || ""
  );

  useEffect(() => {
    if (otherCategories.length > 0 && !reassignTarget) {
      setReassignTarget(otherCategories[0].name);
    }
  }, [categoryObj, otherCategories, reassignTarget]);

  if (!isOpen || !categoryObj) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <Modal.Body className="text-center pt-2">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle size={22} />
        </div>
        <h3 className="text-lg font-bold font-outfit text-glam-text">
          Delete Category?
        </h3>
        <p className="text-xs text-glam-text-muted mt-2 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-glam-text">
            &ldquo;{categoryObj.name}&rdquo;
          </span>
          ? This category will be removed from your catalog.
        </p>

        {serviceCount > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-left space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs font-bold">
              <AlertTriangle size={14} />
              <span>
                Contains {serviceCount} active {serviceCount === 1 ? "service" : "services"}
              </span>
            </div>
            {otherCategories.length > 0 ? (
              <div className="space-y-1">
                <p className="text-[11px] text-glam-text-muted">
                  Reassign existing services to another category:
                </p>
                <ThemeSelect
                  value={reassignTarget}
                  onChange={(val) => setReassignTarget(val)}
                  options={otherCategories.map((c) => c.name)}
                  triggerClassName="h-9 text-xs"
                />
              </div>
            ) : (
              <p className="text-[11px] text-rose-500 font-medium">
                Warning: No other categories available. Services will become uncategorized.
              </p>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button
          onClick={onClose}
          className="flex-1 h-10 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-xs font-semibold text-glam-text hover:bg-glam-surface-alt/70 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={() => onConfirm(categoryObj, reassignTarget)}
          className="flex-1 h-10 rounded-xl bg-rose-500 text-xs font-semibold text-white hover:bg-rose-600 shadow-md cursor-pointer"
        >
          Delete Category
        </button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Service Modal (Add / Edit) ───────────────────────────────────────────────
const ServiceModal = ({
  isOpen,
  onClose,
  onSave,
  editingService,
  defaultCategory,
  categoryOptions,
  onOpenAddCategory,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    category: defaultCategory || "Bridal & Luxury",
    amount: "",
    duration: 60,
    description: "",
    featuresStr: "",
    isActive: true,
    isPopular: false,
    locationType: "Both",
  });

  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name || "",
        category: editingService.category || defaultCategory || "Bridal & Luxury",
        amount: editingService.amount || "",
        duration: editingService.duration || 60,
        description: editingService.description || "",
        featuresStr: editingService.features
          ? editingService.features.join(", ")
          : "",
        isActive: editingService.isActive ?? true,
        isPopular: editingService.isPopular ?? false,
        locationType: editingService.locationType || "Both",
      });
    } else {
      setFormData({
        name: "",
        category: defaultCategory || categoryOptions?.[0] || "Bridal & Luxury",
        amount: "",
        duration: 60,
        description: "",
        featuresStr: "",
        isActive: true,
        isPopular: false,
        locationType: "Both",
      });
    }
  }, [editingService, isOpen, defaultCategory, categoryOptions]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;

    const featuresArray = formData.featuresStr
      ? formData.featuresStr
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    onSave({
      ...formData,
      amount: Number(formData.amount),
      duration: Number(formData.duration),
      features: featuresArray,
    });
  };

  const fieldClass =
    "w-full h-10 px-3.5 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-sm text-glam-text/90 focus:outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent/50";

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <Modal.Header
        title={editingService ? "Edit Service Package" : "Add Service Package"}
        icon={Sparkles}
        onClose={onClose}
      />
      <Modal.Body>
        <form id="service-form" onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-glam-text mb-1">
              Service Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal HD Bridal Makeup"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-glam-text">
                  Category *
                </label>
                {onOpenAddCategory && (
                  <button
                    type="button"
                    onClick={onOpenAddCategory}
                    className="text-[11px] font-semibold text-glam-accent hover:underline cursor-pointer"
                  >
                    + New Category
                  </button>
                )}
              </div>
              <ThemeSelect
                value={formData.category}
                onChange={(val) =>
                  setFormData({ ...formData, category: val })
                }
                options={categoryOptions}
                triggerClassName="h-10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-glam-text mb-1">
                Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-glam-text-muted">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="25000"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full h-10 pl-8 pr-3 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-sm text-glam-text/90 focus:outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent/50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-glam-text mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                className={fieldClass}
              />
            </div>

            <div>
              <ThemeSelect
                label="Location Availability"
                value={formData.locationType}
                onChange={(val) =>
                  setFormData({ ...formData, locationType: val })
                }
                options={[
                  { value: "Both", label: "Studio & On-Location" },
                  { value: "Studio", label: "Studio Only" },
                  { value: "On-Location", label: "On-Location Only" },
                ]}
                triggerClassName="h-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-glam-text mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Provide key details about this package..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-3 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-xs text-glam-text/90 focus:outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-glam-text mb-1">
              Key Features / Inclusions (comma separated)
            </label>
            <input
              type="text"
              placeholder="Airbrush Finish, Hair Styling, Lash Extensions"
              value={formData.featuresStr}
              onChange={(e) =>
                setFormData({ ...formData, featuresStr: e.target.value })
              }
              className={fieldClass}
            />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-glam-text cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 accent-glam-accent rounded"
              />
              Active Service
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-glam-text cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) =>
                  setFormData({ ...formData, isPopular: e.target.checked })
                }
                className="w-4 h-4 accent-glam-accent rounded"
              />
              Mark as Popular
            </label>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-10 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-xs font-semibold text-glam-text hover:bg-glam-surface-alt/70 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="service-form"
          className="flex-1 h-10 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-xs font-semibold text-white shadow-md hover:opacity-95 transition-opacity cursor-pointer"
        >
          {editingService ? "Update Service" : "Create Service"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Delete Service Confirmation Modal ─────────────────────────────────────────
const DeleteModal = ({ isOpen, onClose, onConfirm, serviceName }) => {
  return (
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
          Delete Service?
        </h3>
        <p className="text-xs text-glam-text-muted mt-2">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-glam-text">&ldquo;{serviceName}&rdquo;</span>?
          This action cannot be undone.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <button
          onClick={onClose}
          className="flex-1 h-10 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-xs font-semibold text-glam-text hover:bg-glam-surface-alt/70 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 h-10 rounded-xl bg-rose-500 text-xs font-semibold text-white hover:bg-rose-600 shadow-md cursor-pointer"
        >
          Delete
        </button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Main Service Master Component ────────────────────────────────────────────
const ServiceMaster = () => {
  // Categories State with LocalStorage persistence
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CATEGORIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load categories from localStorage:", e);
    }
    return initialCategoryObjects;
  });

  // Services State with LocalStorage persistence
  const [services, setServices] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SERVICES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load services from localStorage:", e);
    }
    return initialServices;
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category"); // null = Level-1 category overview

  const setActiveCategory = (catName) => {
    if (catName) {
      setSearchParams({ category: catName });
    } else {
      setSearchParams({});
    }
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  // Service modal states
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Category modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategoryObj, setDeletingCategoryObj] = useState(null);

  // Sync Live Services and Categories from MongoDB Backend on mount
  useEffect(() => {
    let isMounted = true;
    const fetchMasters = async () => {
      try {
        const [backendServices, backendCategories] = await Promise.allSettled([
          servicesApi.getAll(),
          servicesApi.getCategories(),
        ]);

        if (!isMounted) return;

        if (
          backendServices.status === "fulfilled" &&
          Array.isArray(backendServices.value) &&
          backendServices.value.length > 0
        ) {
          setServices(
            backendServices.value.map((s) => ({
              ...s,
              id: s._id || s.id,
              _id: s._id || s.id,
            }))
          );
        }

        if (
          backendCategories.status === "fulfilled" &&
          Array.isArray(backendCategories.value) &&
          backendCategories.value.length > 0
        ) {
          setCategories(
            backendCategories.value.map((c) => ({
              ...c,
              id: c._id || c.id,
              _id: c._id || c.id,
            }))
          );
        }
      } catch (err) {
        console.warn("Backend services sync failed, using cached state:", err.message);
      }
    };

    fetchMasters();
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist Categories to localStorage as offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
    } catch (e) {
      console.warn("Failed to save categories:", e);
    }
  }, [categories]);

  // Persist Services to localStorage as offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SERVICES_KEY, JSON.stringify(services));
    } catch (e) {
      console.warn("Failed to save services:", e);
    }
  }, [services]);

  const categoryNames = useMemo(() => {
    return categories.map((c) => c.name);
  }, [categories]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.isActive).length;
    const totalAmount = services.reduce((sum, s) => sum + s.amount, 0);
    const avgAmount = total > 0 ? Math.round(totalAmount / total) : 0;

    const catCounts = services.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {});

    let topCategory = categories[0]?.name || "Bridal & Luxury";
    let maxCount = 0;
    Object.entries(catCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCategory = cat;
      }
    });

    return { total, active, avgAmount, topCategory, categoryCount: categories.length };
  }, [services, categories]);

  // Filtered & Sorted Services for Active View
  const filteredServices = useMemo(() => {
    return services
      .filter((service) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          service.name.toLowerCase().includes(q) ||
          service.description.toLowerCase().includes(q) ||
          (service.features && service.features.some((f) => f.toLowerCase().includes(q)));

        if (!matchesSearch) return false;

        // If in Category Detail view (and not global searching), filter by active category
        if (activeCategory && !q) {
          return service.category === activeCategory;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "recent") return (b.createdAt || 0) - (a.createdAt || 0);
        if (sortBy === "popular") {
          if (a.isPopular !== b.isPopular) return b.isPopular ? 1 : -1;
          return (b.createdAt || 0) - (a.createdAt || 0);
        }
        if (sortBy === "price-low") return a.amount - b.amount;
        if (sortBy === "price-high") return b.amount - a.amount;
        if (sortBy === "duration") return a.duration - b.duration;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [services, activeCategory, searchQuery, sortBy]);

  // Service Handlers with Backend Sync
  const handleToggleStatus = async (id) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id || s._id === id ? { ...s, isActive: !s.isActive } : s))
    );
    try {
      await servicesApi.toggleStatus(id);
    } catch (e) {
      console.warn("Backend toggle service status failed:", e.message);
    }
  };

  const handleOpenAddServiceModal = (cat) => {
    setEditingService(null);
    setIsServiceModalOpen(true);
  };

  const handleOpenEditServiceModal = (service) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (savedData) => {
    if (editingService) {
      const targetId = editingService.id || editingService._id;
      setServices((prev) =>
        prev.map((s) =>
          s.id === targetId || s._id === targetId ? { ...s, ...savedData } : s
        )
      );
      setIsServiceModalOpen(false);

      try {
        await servicesApi.update(targetId, savedData);
      } catch (e) {
        console.warn("Backend update service failed, updated locally:", e.message);
      }
    } else {
      setIsServiceModalOpen(false);
      try {
        const created = await servicesApi.create(savedData);
        const normalized = {
          ...created,
          id: created._id || created.id,
          _id: created._id || created.id,
        };
        setServices((prev) => [normalized, ...prev.filter((s) => s.id !== normalized.id)]);
      } catch (e) {
        console.warn("Backend create service failed, saved locally:", e.message);
        const newService = {
          ...savedData,
          id: `srv-${Date.now()}`,
          createdAt: savedData.createdAt || Date.now(),
        };
        setServices((prev) => [newService, ...prev]);
      }
      setSortBy("recent");
      setSearchQuery("");
    }
  };

  const handleDeleteServiceConfirm = async () => {
    if (deletingId) {
      const idToDelete = deletingId;
      setServices((prev) => prev.filter((s) => s.id !== idToDelete && s._id !== idToDelete));
      setDeletingId(null);

      try {
        await servicesApi.delete(idToDelete);
      } catch (e) {
        console.warn("Backend delete service failed:", e.message);
      }
    }
  };

  // Category Handlers
  const handleOpenAddCategoryModal = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (catObj) => {
    setEditingCategory(catObj);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (categoryData) => {
    if (editingCategory) {
      const oldName = editingCategory.name;
      const newName = categoryData.name;

      // Update category record in local state
      setCategories((prev) =>
        prev.map((c) =>
          (c.id === editingCategory.id || c._id === editingCategory._id || c.name === oldName)
            ? { ...c, ...categoryData }
            : c
        )
      );

      // If category name was renamed, update linked services
      if (oldName !== newName) {
        setServices((prev) =>
          prev.map((s) =>
            s.category === oldName ? { ...s, category: newName } : s
          )
        );
        if (activeCategory === oldName) {
          setActiveCategory(newName);
        }
      }

      try {
        const catTargetId = editingCategory._id || editingCategory.id || oldName;
        await servicesApi.updateCategory(catTargetId, categoryData);
      } catch (e) {
        console.warn("Backend update category failed, saved locally:", e.message);
      }
    } else {
      // Check for duplicate names
      const isDuplicate = categories.some(
        (c) => c.name.toLowerCase() === categoryData.name.toLowerCase()
      );
      if (isDuplicate) {
        alert("A category with this name already exists.");
        return;
      }
      try {
        const created = await servicesApi.createCategory(categoryData);
        const normalized = {
          ...created,
          id: created._id || created.id,
          _id: created._id || created.id,
        };
        setCategories((prev) => [normalized, ...prev]);
      } catch (e) {
        console.warn("Backend create category failed, saved locally:", e.message);
        setCategories((prev) => [categoryData, ...prev]);
      }
    }
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategoryConfirm = async (catObj, reassignTarget) => {
    // Reassign services if target chosen
    if (reassignTarget) {
      setServices((prev) =>
        prev.map((s) =>
          s.category === catObj.name ? { ...s, category: reassignTarget } : s
        )
      );
    }

    // Remove category
    setCategories((prev) =>
      prev.filter((c) => c.id !== catObj.id && c._id !== catObj.id && c.name !== catObj.name)
    );

    // Reset active category view if we were currently viewing it
    if (activeCategory === catObj.name) {
      setActiveCategory(null);
    }

    try {
      const targetId = catObj._id || catObj.id;
      if (targetId) {
        await servicesApi.deleteCategory(targetId);
      }
    } catch (e) {
      console.warn("Backend delete category failed:", e.message);
    }

    setDeletingCategoryObj(null);
  };

  const deletingServiceObj = services.find((s) => s.id === deletingId);
  const activeCategoryObj = categories.find((c) => c.name === activeCategory);
  const ActiveIcon = activeCategory
    ? getCategoryIconComponent(activeCategoryObj?.icon, activeCategory)
    : null;

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-glam-surface border border-glam-border/60 p-4 sm:p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-glam-accent/10 text-glam-accent">
              <Sparkles size={18} />
            </span>
            <h1 className="text-xl font-bold font-outfit text-glam-text tracking-tight">
              Service Master
            </h1>
          </div>
          <p className="text-xs text-glam-text-muted mt-1 max-w-xl">
            Browse service categories, add customized classifications, and manage salon packages.
          </p>
        </div>

        {/* Action Buttons: Add Category & Add Service */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleOpenAddCategoryModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-glam-surface-alt border border-glam-border/50 text-glam-text hover:text-glam-accent hover:border-glam-accent/50 font-semibold text-xs transition-all cursor-pointer"
          >
            <FolderPlus size={15} />
            <span>Add Category</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddServiceModal(activeCategory)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white font-semibold text-xs shadow-sm hover:shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>
              {activeCategory ? `Add to ${activeCategory}` : "Add New Service"}
            </span>
          </button>
        </div>
      </div>

      {/* Quick Metrics / Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Layers}
          title="Total Services"
          value={stats.total}
          subtitle={`${stats.active} Active Packages`}
          bgGradient="bg-linear-to-br from-glam-accent to-amber-600"
        />
        <StatCard
          icon={IndianRupee}
          title="Average Package"
          value={`₹${stats.avgAmount.toLocaleString("en-IN")}`}
          subtitle="Across all categories"
          bgGradient="bg-linear-to-br from-emerald-500 to-teal-600"
        />
        <StatCard
          icon={Crown}
          title="Top Category"
          value={stats.topCategory}
          subtitle="Most offered packages"
          bgGradient="bg-linear-to-br from-glam-accent-2 to-rose-600"
        />
        <StatCard
          icon={FolderKanban}
          title="Categories"
          value={`${categories.length} Types`}
          subtitle="Fully configurable lines"
          bgGradient="bg-linear-to-br from-indigo-500 to-purple-600"
        />
      </div>

      {/* Global Search & Navigation Control Bar */}
      <div className="flex flex-col gap-3 bg-glam-surface border border-glam-border/60 p-3.5 sm:p-4 rounded-2xl shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-3 text-glam-accent"
            />
            <input
              type="text"
              placeholder="Search across all services (e.g. Airbrush, Keratin, Saree)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-9 rounded-2xl border border-glam-border bg-glam-surface-alt text-xs font-medium text-glam-text placeholder:text-glam-text-muted focus:outline-none focus:border-glam-accent transition-colors"
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

          <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
            {/* View Mode Toggle when viewing services */}
            {(activeCategory || searchQuery) && (
              <>
                <div className="flex items-center gap-1.5 text-xs font-medium text-glam-text min-w-[170px]">
                  <SlidersHorizontal size={14} className="text-glam-accent shrink-0" />
                  <ThemeSelect
                    value={sortBy}
                    onChange={(val) => setSortBy(val)}
                    options={[
                      { value: "recent", label: "Recently Added" },
                      { value: "popular", label: "Popular First" },
                      { value: "price-high", label: "Price: High to Low" },
                      { value: "price-low", label: "Price: Low to High" },
                      { value: "duration", label: "Duration" },
                      { value: "name", label: "Name (A-Z)" },
                    ]}
                    triggerClassName="h-10 rounded-2xl border-glam-border bg-glam-surface-alt text-xs"
                  />
                </div>

                <div className="flex items-center p-1 rounded-2xl bg-glam-surface-alt border border-glam-border">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-glam-surface text-glam-accent shadow-xs"
                        : "text-glam-text-muted hover:text-glam-text"
                    }`}
                    title="Grid View"
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                      viewMode === "list"
                        ? "bg-glam-surface text-glam-accent shadow-xs"
                        : "text-glam-text-muted hover:text-glam-text"
                    }`}
                    title="List View"
                  >
                    <List size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Breadcrumb / Category Status Strip when drilled down */}
        {activeCategory && !searchQuery && (
          <div className="flex items-center justify-between border-t border-glam-border/40 pt-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveCategory(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-glam-border/60 bg-glam-surface-alt text-xs font-semibold text-glam-text hover:text-glam-accent hover:border-glam-accent/50 transition-all cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>All Categories</span>
              </button>
              <ChevronRight size={14} className="text-glam-text-muted/50" />
              <div className="flex items-center gap-1.5">
                {ActiveIcon && <ActiveIcon size={15} className="text-glam-accent" />}
                <span className="text-xs font-bold font-outfit text-glam-text">
                  {activeCategory}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-glam-accent/10 text-glam-accent">
                {filteredServices.length} {filteredServices.length === 1 ? "Service" : "Services"}
              </span>

              {/* Edit Category from within Category View */}
              {activeCategoryObj && (
                <div className="flex items-center gap-1 ml-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditCategoryModal(activeCategoryObj)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-glam-accent bg-glam-accent/10 hover:bg-glam-accent/20 transition-colors cursor-pointer"
                    title="Edit Category Info"
                  >
                    <Edit2 size={12} />
                    <span>Edit Category</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingCategoryObj(activeCategoryObj)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 size={12} />
                    <span>Delete Category</span>
                  </button>
                </div>
              )}
            </div>

            <p className="text-[11px] text-glam-text-muted hidden sm:block max-w-sm truncate">
              {activeCategoryObj?.description}
            </p>
          </div>
        )}

        {/* Global Search Result Banner */}
        {searchQuery && (
          <div className="flex items-center justify-between border-t border-glam-border/40 pt-3 text-xs">
            <span className="text-glam-text-muted">
              Showing{" "}
              <strong className="text-glam-text">{filteredServices.length}</strong>{" "}
              services matching &ldquo;
              <span className="text-glam-accent font-semibold">{searchQuery}</span>&rdquo;
              across all categories
            </span>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-semibold text-glam-accent hover:underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* ─── MAIN CONTENT AREA ─── */}

      {/* 1. Global Search Results View */}
      {searchQuery ? (
        filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-glam-surface border border-glam-border rounded-3xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-glam-accent/10 text-glam-accent flex items-center justify-center mb-3">
              <Sparkles size={28} />
            </div>
            <h3 className="text-base font-bold font-outfit text-glam-text">
              No services found for &ldquo;{searchQuery}&rdquo;
            </h3>
            <p className="text-xs text-glam-text-muted mt-1 max-w-sm">
              Try searching with a different keyword or browse through the category cards.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 px-4 py-2 rounded-xl bg-glam-surface-alt border border-glam-border text-xs font-semibold text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={handleOpenEditServiceModal}
                onDelete={(id) => setDeletingId(id)}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredServices.map((service) => (
              <ServiceListItem
                key={service.id}
                service={service}
                onEdit={handleOpenEditServiceModal}
                onDelete={(id) => setDeletingId(id)}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )
      ) : activeCategory ? (
        /* 2. Drilled-down Category Detail View (Level 2) */
        filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-glam-surface border border-glam-border/50 rounded-3xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-glam-accent/10 text-glam-accent flex items-center justify-center mb-3">
              {ActiveIcon ? <ActiveIcon size={28} /> : <Sparkles size={28} />}
            </div>
            <h3 className="text-base font-bold font-outfit text-glam-text">
              No services in {activeCategory}
            </h3>
            <p className="text-xs text-glam-text-muted mt-1 max-w-sm">
              You haven&apos;t configured any packages in this category yet.
            </p>
            <button
              onClick={() => handleOpenAddServiceModal(activeCategory)}
              className="mt-4 px-4 py-2 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white text-xs font-semibold shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
            >
              Add First Service
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={handleOpenEditServiceModal}
                onDelete={(id) => setDeletingId(id)}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredServices.map((service) => (
              <ServiceListItem
                key={service.id}
                service={service}
                onEdit={handleOpenEditServiceModal}
                onDelete={(id) => setDeletingId(id)}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )
      ) : (
        /* 3. Category Overview View (Level 1) */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold font-outfit text-glam-text">
                Service Categories
              </h2>
              <p className="text-xs text-glam-text-muted">
                Select a category to view its packages, or create and manage categories.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-glam-accent bg-glam-accent/10 px-2.5 py-1 rounded-xl">
                {categories.length} Total Categories
              </span>
              <button
                type="button"
                onClick={handleOpenAddCategoryModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white font-semibold text-xs shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
              >
                <Plus size={14} />
                <span>New Category</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((catObj) => (
              <CategoryCard
                key={catObj.id || catObj.name}
                categoryObj={catObj}
                services={services}
                onSelectCategory={(categoryName) => setActiveCategory(categoryName)}
                onEditCategory={handleOpenEditCategoryModal}
                onDeleteCategory={(cat) => setDeletingCategoryObj(cat)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Service Modal (Add / Edit) */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSave={handleSaveService}
        editingService={editingService}
        defaultCategory={activeCategory || categoryNames[0] || "Bridal & Luxury"}
        categoryOptions={categoryNames}
        onOpenAddCategory={() => {
          setIsServiceModalOpen(false);
          handleOpenAddCategoryModal();
        }}
      />

      {/* Delete Service Modal */}
      <DeleteModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteServiceConfirm}
        serviceName={deletingServiceObj?.name}
      />

      {/* Category Modal (Add / Edit) */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        editingCategory={editingCategory}
      />

      {/* Delete Category Modal */}
      <DeleteCategoryModal
        isOpen={!!deletingCategoryObj}
        onClose={() => setDeletingCategoryObj(null)}
        onConfirm={handleDeleteCategoryConfirm}
        categoryObj={deletingCategoryObj}
        serviceCount={
          deletingCategoryObj
            ? services.filter((s) => s.category === deletingCategoryObj.name).length
            : 0
        }
        availableCategories={categories}
      />
    </div>
  );
};

export default ServiceMaster;
