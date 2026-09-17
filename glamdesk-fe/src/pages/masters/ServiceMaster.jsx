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
} from "lucide-react";
import { initialServices, categoriesList } from "../../data/serviceData";

const categoryIcons = {
  "Bridal & Luxury": Crown,
  "Party & Occasion": Gem,
  "Hair & Styling": Scissors,
  "Skincare & Spa": Smile,
  "Nail & Lash Art": Sparkles,
  "Express & Add-ons": Tag,
};

const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  iconColor,
  bgGradient,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-glam-border/60 bg-glam-surface p-4 shadow-sm hover:shadow-md transition-all duration-300">
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
      className={`group relative flex flex-col justify-between rounded-3xl border border-glam-border/60 transition-all duration-300 overflow-hidden bg-glam-surface shadow-sm ${
        service.isActive
          ? "hover:-translate-y-1 hover:border-glam-accent/80 hover:shadow-md"
          : "opacity-75 hover:opacity-100"
      }`}
    >
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row with Category badge & Active status */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium bg-glam-accent/10 text-glam-accent">
              <IconComponent size={13} />
              {service.category}
            </span>

            <div className="flex items-center gap-2">
              {service.isPopular && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles size={10} />
                  Popular
                </span>
              )}
              <button
                onClick={() => onToggleStatus(service.id)}
                title={
                  service.isActive ? "Deactivate service" : "Activate service"
                }
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer ${
                  service.isActive
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                }`}
              >
                {service.isActive ? (
                  <>
                    <CheckCircle2 size={11} />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle size={11} />
                    Inactive
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Title & Amount */}
          <div className="mt-2">
            <h3 className="text-md font-semibold font-outfit text-glam-text leading-snug group-hover:text-glam-accent transition-colors">
              {service.name}
            </h3>

            {/* Pricing Section */}
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-xs font-medium text-glam-text-muted">
                Amount:
              </span>
              <span className="text-xl font-semibold font-outfit text-transparent bg-clip-text bg-linear-to-r from-glam-accent to-glam-accent-2">
                ₹{service.amount.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] font-medium text-glam-text-muted">
                / session
              </span>
            </div>
          </div>

          {/* Duration & Location details */}
          <div className="mt-3 flex items-center gap-4 text-xs text-glam-text-muted font-medium py-2">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-glam-accent" />
              <span>{formatDuration(service.duration)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-glam-accent-2" />
              <span>{service.locationType}</span>
            </div>
          </div>

          {/* Description */}
          <p className="mt-2 text-xs text-glam-text-muted leading-relaxed line-clamp-2">
            {service.description}
          </p>

          {/* Feature tags */}
          {service.features && service.features.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {service.features.map((feat, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-glam-surface-alt text-glam-text"
                >
                  ✓ {feat}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Footer Action Buttons */}
        <div className="mt-6 pt-2 flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(service)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-glam-accent hover:bg-glam-accent/10 transition-colors"
            title="Edit Service"
          >
            <Edit2 size={13} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(service.id)}
            className="p-1.5 rounded-xl text-glam-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            title="Delete Service"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ServiceListItem = ({
  service,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const IconComponent = categoryIcons[service.category] || Sparkles;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-glam-border/60 bg-glam-surface shadow-sm hover:border-glam-accent hover:shadow-md transition-all duration-200">
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-glam-accent/10 flex items-center justify-center shrink-0 text-glam-accent">
          <IconComponent size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-bold font-outfit text-glam-text truncate">
              {service.name}
            </h4>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-glam-surface-alt text-glam-text-muted">
              {service.category}
            </span>
          </div>
          <p className="text-xs text-glam-text-muted truncate mt-0.5">
            {service.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0">
        <div className="text-left sm:text-right">
          <div className="text-lg font-bold font-outfit text-glam-accent">
            ₹{service.amount.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-glam-text-muted flex items-center gap-1">
            <Clock size={11} />
            {service.duration} mins
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleStatus(service.id)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              service.isActive
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
            }`}
          >
            {service.isActive ? "Active" : "Inactive"}
          </button>
          <button
            onClick={() => onEdit(service)}
            className="p-2 rounded-xl text-glam-accent hover:bg-glam-accent/10 transition-colors"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => onDelete(service.id)}
            className="p-2 rounded-xl text-glam-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ServiceModal = ({ isOpen, onClose, onSave, editingService }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "Bridal & Luxury",
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
        category: "Bridal & Luxury",
        amount: "",
        duration: 60,
        description: "",
        featuresStr: "",
        isActive: true,
        isPopular: false,
        locationType: "Both",
      });
    }
  }, [editingService, isOpen]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-lg rounded-3xl bg-glam-surface p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 inset-x-0 h-1" />

        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-glam-accent/10 text-glam-accent flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <h3 className="text-lg font-bold font-outfit text-glam-text">
              {editingService ? "Edit Service" : "Add New Service"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-glam-text-muted hover:text-glam-text hover:bg-glam-surface-alt/50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
              className="w-full h-10 px-3.5 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-sm text-glam-text/90 focus:outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-glam-text mb-1">
                Category / Type *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full h-10 px-3 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-sm text-glam-text/90 focus:outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent/50"
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
                <span className="absolute left-3 top-2.5 text-xs font-semibold text-glam-text-muted">
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
                  className="w-full h-10 pl-7 pr-3 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-sm text-glam-text/90 focus:outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent/50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full h-10 px-3.5 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-sm text-glam-text/90 focus:outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-glam-text mb-1">
                Location Type
              </label>
              <select
                value={formData.locationType}
                onChange={(e) =>
                  setFormData({ ...formData, locationType: e.target.value })
                }
                className="w-full h-10 px-3 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-sm text-glam-text/90 focus:outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent/50"
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
              rows={3}
              placeholder="Provide key details about this service..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-3 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-sm text-glam-text/90 focus:outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-glam-text mb-1">
              Key Features / Highlights (comma separated)
            </label>
            <input
              type="text"
              placeholder="Airbrush Finish, Hair Styling, Lash Extensions"
              value={formData.featuresStr}
              onChange={(e) =>
                setFormData({ ...formData, featuresStr: e.target.value })
              }
              className="w-full h-10 px-3.5 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-sm text-glam-text/90 focus:outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent/50"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-glam-text cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 accent-glam-accent/40 rounded"
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
                className="w-4 h-4 accent-glam-accent/40 rounded"
              />
              Mark as Popular
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-sm font-semibold text-glam-text hover:bg-glam-surface-alt/70 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-sm font-semibold text-white shadow-md hover:opacity-95 transition-opacity"
            >
              {editingService ? "Update Service" : "Create Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ isOpen, onClose, onConfirm, serviceName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-glam-surface p-6 shadow-2xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-bold font-outfit text-glam-text">
          Delete Service?
        </h3>
        <p className="text-xs text-glam-text-muted mt-2">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-glam-text">"{serviceName}"</span>?
          This action cannot be undone.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-glam-border/60 bg-glam-surface-alt/40 text-xs font-semibold text-glam-text hover:bg-glam-surface-alt/70"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 rounded-xl bg-rose-500 text-xs font-semibold text-white hover:bg-rose-600 shadow-md"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ServiceMaster = () => {
  const [services, setServices] = useState(initialServices);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.isActive).length;
    const totalAmount = services.reduce((sum, s) => sum + s.amount, 0);
    const avgAmount = total > 0 ? Math.round(totalAmount / total) : 0;

    // Category distribution
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

  // Filtered & Sorted Services
  const filteredServices = useMemo(() => {
    return services
      .filter((service) => {
        const matchesCategory =
          selectedCategory === "All" || service.category === selectedCategory;
        const matchesSearch =
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          service.features.some((f) =>
            f.toLowerCase().includes(searchQuery.toLowerCase()),
          );
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.amount - b.amount;
        if (sortBy === "price-high") return b.amount - a.amount;
        if (sortBy === "duration") return a.duration - b.duration;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        // Default: popular first, then active
        if (a.isPopular !== b.isPopular) return b.isPopular ? 1 : -1;
        return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
      });
  }, [services, selectedCategory, searchQuery, sortBy]);

  // Handlers
  const handleToggleStatus = (id) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)),
    );
  };

  const handleOpenAddModal = () => {
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
          s.id === editingService.id ? { ...s, ...savedData } : s,
        ),
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

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-glam-surface border border-glam-border/60 p-4 sm:p-5 rounded-2xl shadow-sm">
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
            Manage salon services, pricing packages, durations, and offerings.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white font-semibold text-xs shadow-md hover:shadow-lg hover:opacity-95 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Quick Metrics / Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Layers}
          title="Total Services"
          value={stats.total}
          subtitle={`${stats.active} Active Services`}
          bgGradient="bg-linear-to-br from-glam-accent to-amber-600"
        />
        <StatCard
          icon={IndianRupee}
          title="Average Service Amount"
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
          icon={CheckCircle2}
          title="Active Rate"
          value={`${Math.round((stats.active / (stats.total || 1)) * 100)}%`}
          subtitle="Available for booking"
          bgGradient="bg-linear-to-br from-indigo-500 to-purple-600"
        />
      </div>

      {/* Filters, Search & Toolbar */}
      <div className="flex flex-col gap-3 bg-glam-surface border border-glam-border/60 p-3.5 sm:p-4 rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-3 text-glam-accent"
            />
            <input
              type="text"
              placeholder="Search service name, features, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-9 rounded-2xl border border-glam-border bg-glam-surface-alt text-xs font-medium text-glam-text placeholder:text-glam-text-muted focus:outline-none focus:border-glam-accent transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-glam-text-muted hover:text-glam-text"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
            {/* Sort options */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-glam-text">
              <SlidersHorizontal size={14} className="text-glam-accent" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 px-3 rounded-2xl border border-glam-border bg-glam-surface-alt text-xs text-glam-text focus:outline-none focus:border-glam-accent"
              >
                <option value="popular">Sort by: Popular</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="duration">Duration</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-2xl bg-glam-surface-alt border border-glam-border">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === "grid"
                    ? "bg-glam-surface text-glam-accent shadow-sm"
                    : "text-glam-text-muted hover:text-glam-text"
                }`}
                title="Grid View"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === "list"
                    ? "bg-glam-surface text-glam-accent shadow-sm"
                    : "text-glam-text-muted hover:text-glam-text"
                }`}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-glam-border/40 pt-3">
          {categoriesList.map((cat) => {
            const IconComponent = categoryIcons[cat];
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-linear-to-r from-glam-accent to-glam-accent-2 text-white shadow-md scale-102"
                    : "bg-glam-surface-alt text-glam-text-muted border border-glam-border/50 hover:bg-glam-accent/10 hover:text-glam-accent"
                }`}
              >
                {IconComponent && <IconComponent size={13} />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List / Cards Grid */}
      {filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-glam-surface border border-glam-border rounded-3xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-glam-accent/10 text-glam-accent flex items-center justify-center mb-3">
            <Sparkles size={28} />
          </div>
          <h3 className="text-lg font-bold font-outfit text-glam-text">
            No services found
          </h3>
          <p className="text-xs text-glam-text-muted mt-1 max-w-sm">
            Try adjusting your search filter or category selection to find what
            you're looking for.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-glam-surface-alt border border-glam-border text-xs font-semibold text-glam-accent hover:bg-glam-accent/10 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="space-y-3">
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
      )}

      {/* Modal Dialogs */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveService}
        editingService={editingService}
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
