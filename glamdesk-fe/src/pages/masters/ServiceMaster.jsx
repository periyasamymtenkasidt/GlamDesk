import { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import { initialServices, categoriesList } from "../../data/serviceData";
import Modal from "../../components/common/Modal";

// ─── Category Icons Mapping ───────────────────────────────────────────────────
const categoryIcons = {
  "Bridal & Luxury": Crown,
  "Party & Occasion": Gem,
  "Editorial & Fashion": Camera,
  "Hair & Styling": Scissors,
  "Skincare & Spa": Smile,
};

// ─── Category Metadata ────────────────────────────────────────────────────────
const categoryMeta = {
  "Bridal & Luxury": {
    description:
      "Royal HD bridal packages, Sagan, engagement glam, airbrush reception looks, and couture draping.",
  },
  "Party & Occasion": {
    description:
      "Celebrity event glam, bridesmaid makeup, cocktail party looks, and customized gala styling.",
  },
  "Editorial & Fashion": {
    description:
      "Studio-ready HD shoot makeup, runway looks, high-fashion styling, and portfolio photography sessions.",
  },
  "Hair & Styling": {
    description:
      "Keratin & cysteine treatments, couture hair updos, blowouts, extensions, and bridal hair prep.",
  },
  "Skincare & Spa": {
    description:
      "Hydra-glow facials, deep pore extraction, pre-bridal cleanups, and luxury skin prep sessions.",
  },
};

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
const CategoryCard = ({ category, services, onSelectCategory }) => {
  const IconComponent = categoryIcons[category] || Sparkles;
  const meta = categoryMeta[category] || {
    description: "Specialized beauty and salon offerings.",
  };

  const catServices = services.filter((s) => s.category === category);
  const totalCount = catServices.length;
  const activeCount = catServices.filter((s) => s.isActive).length;
  const popularCount = catServices.filter((s) => s.isPopular).length;

  // Price range calculation
  const amounts = catServices.map((s) => s.amount).filter(Boolean);
  const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0;
  const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;

  return (
    <div
      onClick={() => onSelectCategory(category)}
      className="group relative flex flex-col justify-between rounded-2xl border border-glam-border/60 bg-glam-surface p-5 shadow-xs hover:border-glam-accent/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Subtle top hover accent line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-glam-accent to-glam-accent-2 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Top Icon & Count Badges */}
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
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold font-outfit text-glam-text group-hover:text-glam-accent transition-colors leading-snug">
          {category}
        </h3>

        {/* Description */}
        <p className="text-xs text-glam-text-muted mt-1 leading-relaxed line-clamp-2">
          {meta.description}
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
  const IconComponent = categoryIcons[service.category] || Sparkles;

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
  const IconComponent = categoryIcons[service.category] || Sparkles;

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

// ─── Service Modal (Add / Edit) ───────────────────────────────────────────────
const ServiceModal = ({ isOpen, onClose, onSave, editingService, defaultCategory }) => {
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
        category: editingService.category || "Bridal & Luxury",
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
        category: defaultCategory || "Bridal & Luxury",
        amount: "",
        duration: 60,
        description: "",
        featuresStr: "",
        isActive: true,
        isPopular: false,
        locationType: "Both",
      });
    }
  }, [editingService, isOpen, defaultCategory]);

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
              <label className="block text-xs font-semibold text-glam-text mb-1">
                Category / Classification *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className={fieldClass}
              >
                {categoriesList
                  .filter((c) => c !== "All")
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
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
              <label className="block text-xs font-semibold text-glam-text mb-1">
                Location Availability
              </label>
              <select
                value={formData.locationType}
                onChange={(e) =>
                  setFormData({ ...formData, locationType: e.target.value })
                }
                className={fieldClass}
              >
                <option value="Both">Studio & On-Location</option>
                <option value="Studio">Studio Only</option>
                <option value="On-Location">On-Location Only</option>
              </select>
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

// ─── Delete Confirmation Modal ─────────────────────────────────────────────────
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
          <span className="font-semibold text-glam-text">"{serviceName}"</span>?
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
  const [services, setServices] = useState(initialServices);
  const [activeCategory, setActiveCategory] = useState(null); // null = Level-1 category overview
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Distinct category list (excluding "All")
  const categories = useMemo(() => {
    return categoriesList.filter((c) => c !== "All");
  }, []);

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

    let topCategory = "Bridal & Luxury";
    let maxCount = 0;
    Object.entries(catCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCategory = cat;
      }
    });

    return { total, active, avgAmount, topCategory };
  }, [services]);

  // Filtered & Sorted Services for Active View
  const filteredServices = useMemo(() => {
    return services
      .filter((service) => {
        // If searching, search across all or within active category
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          service.name.toLowerCase().includes(q) ||
          service.description.toLowerCase().includes(q) ||
          service.features.some((f) => f.toLowerCase().includes(q));

        if (!matchesSearch) return false;

        // If in Category Detail view (and not global searching), filter by active category
        if (activeCategory && !q) {
          return service.category === activeCategory;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.amount - b.amount;
        if (sortBy === "price-high") return b.amount - a.amount;
        if (sortBy === "duration") return a.duration - b.duration;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (a.isPopular !== b.isPopular) return b.isPopular ? 1 : -1;
        return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
      });
  }, [services, activeCategory, searchQuery, sortBy]);

  // Handlers
  const handleToggleStatus = (id) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleOpenAddModal = (cat) => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleSaveService = (savedData) => {
    if (editingService) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id ? { ...s, ...savedData } : s
        )
      );
    } else {
      const newService = {
        ...savedData,
        id: `srv-${Date.now()}`,
      };
      setServices((prev) => [newService, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
      setServices((prev) => prev.filter((s) => s.id !== deletingId));
      setDeletingId(null);
    }
  };

  const deletingServiceObj = services.find((s) => s.id === deletingId);
  const ActiveIcon = activeCategory ? categoryIcons[activeCategory] || Sparkles : null;

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
            Browse service categories, manage salon packages, durations, and client offerings.
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal(activeCategory)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white font-semibold text-xs shadow-sm hover:shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>
            {activeCategory ? `Add to ${activeCategory}` : "Add New Service"}
          </span>
        </button>
      </div>

      {/* Quick Metrics / Stats Grid (always visible) */}
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
          subtitle="Distinct service lines"
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
                <div className="flex items-center gap-1.5 text-xs font-medium text-glam-text">
                  <SlidersHorizontal size={14} className="text-glam-accent" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-10 px-3 rounded-2xl border border-glam-border bg-glam-surface-alt text-xs text-glam-text focus:outline-none focus:border-glam-accent cursor-pointer"
                  >
                    <option value="popular">Popular First</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="duration">Duration</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-glam-border/60 bg-glam-surface-alt text-xs font-semibold text-glam-text hover:text-glam-accent hover:border-glam-accent/50 transition-all cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>All Categories</span>
              </button>
              <ChevronRight size={14} className="text-glam-text-muted/50" />
              <div className="flex items-center gap-1.5">
                {ActiveIcon && <ActiveIcon size={14} className="text-glam-accent" />}
                <span className="text-xs font-bold font-outfit text-glam-text">
                  {activeCategory}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-glam-accent/10 text-glam-accent">
                {filteredServices.length} {filteredServices.length === 1 ? "Service" : "Services"}
              </span>
            </div>

            <p className="text-[11px] text-glam-text-muted hidden sm:block">
              {categoryMeta[activeCategory]?.description}
            </p>
          </div>
        )}

        {/* Global Search Result Banner */}
        {searchQuery && (
          <div className="flex items-center justify-between border-t border-glam-border/40 pt-3 text-xs">
            <span className="text-glam-text-muted">
              Showing{" "}
              <strong className="text-glam-text">{filteredServices.length}</strong>{" "}
              services matching "
              <span className="text-glam-accent font-semibold">{searchQuery}</span>"
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
              No services found for "{searchQuery}"
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
                onEdit={handleOpenEditModal}
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
                onEdit={handleOpenEditModal}
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
              You haven't configured any packages in this category yet.
            </p>
            <button
              onClick={() => handleOpenAddModal(activeCategory)}
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
                onEdit={handleOpenEditModal}
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
                onEdit={handleOpenEditModal}
                onDelete={(id) => setDeletingId(id)}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )
      ) : (
        /* 3. Category Overview View (Level 1) */
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold font-outfit text-glam-text">
                Service Categories
              </h2>
              <p className="text-xs text-glam-text-muted">
                Select a makeup or styling category to view and manage its packages.
              </p>
            </div>
            <span className="text-xs font-semibold text-glam-accent">
              {categories.length} Total Categories
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <CategoryCard
                key={cat}
                category={cat}
                services={services}
                onSelectCategory={(categoryName) => setActiveCategory(categoryName)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal Dialogs */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveService}
        editingService={editingService}
        defaultCategory={activeCategory || "Bridal & Luxury"}
      />

      <DeleteModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        serviceName={deletingServiceObj?.name}
      />
    </div>
  );
};

export default ServiceMaster;
