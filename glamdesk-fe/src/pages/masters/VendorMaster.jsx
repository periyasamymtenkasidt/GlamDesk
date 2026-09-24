import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Scissors,
  Sparkles,
  Smile,
  Gem,
  Camera,
  Crown,
  Plus,
  Clock,
  IndianRupee,
  Layers,
  Search,
  X,
  SlidersHorizontal,
  Settings,
  FolderKanban,
} from "lucide-react";
import { useVendors } from "../../context/VendorContext";
import { VendorModal, ManageVendorRolesModal } from "./VendorModals";
import ThemeSelect from "../../components/common/form/ThemeSelect";
import Pagination from "../../components/common/table/Pagination";

// ─── Role Icon Mapping ────────────────────────────────────────────────────────
const roleIcons = {
  "Hair Stylist": Scissors,
  "Saree Draper": Sparkles,
  "Assistant Makeup Artist": Smile,
  "Mehendi Artist": Gem,
  "Photographer / BTS": Camera,
  "Flower / Jewelry Stylist": Crown,
};

const getRoleIcon = (role) => {
  if (!role) return Users;
  if (roleIcons[role]) return roleIcons[role];
  const lower = role.toLowerCase();
  if (lower.includes("hair") || lower.includes("braid")) return Scissors;
  if (lower.includes("drap") || lower.includes("saree") || lower.includes("pleat")) return Sparkles;
  if (lower.includes("makeup") || lower.includes("artist") || lower.includes("skin")) return Smile;
  if (lower.includes("mehendi") || lower.includes("henna")) return Gem;
  if (lower.includes("photo") || lower.includes("video") || lower.includes("bts") || lower.includes("reel")) return Camera;
  if (lower.includes("flower") || lower.includes("jewel") || lower.includes("crown") || lower.includes("veni")) return Crown;
  return Users;
};

// ─── KPI Stat Card ────────────────────────────────────────────────────────────
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

// ─── Professional Vendor Table View with Pagination ───────────────────────────
const VendorTableView = ({
  vendors,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  onPageChange,
  onToggleActive,
  onRowClick,
}) => {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-glam-border/50 bg-glam-surface shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-glam-border/40 bg-glam-surface-alt/40 text-[11px] font-bold uppercase tracking-wider text-glam-text-muted">
              <th className="py-3.5 px-4 w-24">ID</th>
              <th className="py-3.5 px-5 min-w-[220px]">Vendor</th>
              <th className="py-3.5 px-4 w-44">Mobile</th>
              <th className="py-3.5 px-4 w-52">Role</th>
              <th className="py-3.5 px-4 w-44">Event Payout</th>
              <th className="py-3.5 px-4 w-36">Extra Head</th>
              <th className="py-3.5 px-4 w-40">Travel</th>
              <th className="py-3.5 px-5 w-40 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glam-border/30 text-xs">
            {vendors.map((vendor) => {
              const RoleIcon = getRoleIcon(vendor.role);
              const hasBlackouts =
                vendor.blackouts && vendor.blackouts.length > 0;

              return (
                <tr
                  key={vendor.id}
                  onClick={() => onRowClick(vendor.id)}
                  className="hover:bg-glam-surface-alt/30 transition-colors cursor-pointer group"
                >
                  {/* ID */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-glam-text-muted">
                    #{vendor.code}
                  </td>

                  {/* Vendor */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-glam-accent/10 text-glam-accent flex items-center justify-center shrink-0">
                        <RoleIcon size={15} />
                      </div>
                      <span className="font-medium font-outfit text-glam-text group-hover:text-glam-accent transition-colors block text-sm">
                        {vendor.name}
                      </span>
                    </div>
                  </td>

                  {/* Mobile Number (Separate Column) */}
                  <td className="py-3.5 px-4 text-glam-text font-normal whitespace-nowrap">
                    {vendor.phone}
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-glam-surface-alt text-glam-text border border-glam-border/30 whitespace-nowrap">
                      <RoleIcon size={12} className="text-glam-accent" />
                      <span>{vendor.role}</span>
                    </span>
                  </td>

                  {/* Event Payout */}
                  <td className="py-3.5 px-4">
                    <span className="font-outfit font-normal text-glam-text">
                      ₹{Number(vendor.baseEventRate ?? vendor.defaultPayout ?? 0).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-glam-text-muted">
                      {" "}
                      / event
                    </span>
                  </td>

                  {/* Extra Head */}
                  <td className="py-3.5 px-4 text-glam-text-muted font-normal">
                    {Number(vendor.perExtraHeadRate || 0) > 0
                      ? `+₹${Number(vendor.perExtraHeadRate).toLocaleString("en-IN")}`
                      : "Included"}
                  </td>

                  {/* Travel */}
                  <td className="py-3.5 px-4 text-glam-text-muted font-normal">
                    {Number(vendor.travelSurcharge || 0) > 0
                      ? `+₹${Number(vendor.travelSurcharge).toLocaleString("en-IN")}`
                      : "Local Included"}
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3.5 px-5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleActive(vendor.id);
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-normal cursor-pointer transition-colors ${
                        !vendor.isActive
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : hasBlackouts
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}
                      title="Click to toggle status"
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
                      <span>
                        {!vendor.isActive
                          ? "Inactive"
                          : hasBlackouts
                            ? `${vendor.blackouts?.length || 0} Blocked`
                            : "Available"}
                      </span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
        onPageChange={onPageChange}
        itemLabel="Vendors"
      />
    </div>
  );
};

// ─── Main Vendor Master Component ─────────────────────────────────────────────
const VendorMaster = () => {
  const navigate = useNavigate();
  const {
    vendors,
    roles,
    addRole,
    renameRole,
    deleteRole,
    addVendor,
    toggleActive,
  } = useVendors();

  const [selectedRole, setSelectedRole] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageRolesOpen, setIsManageRolesOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const pageSizeOptions = [6, 12, 24];

  // Reset to first page whenever search query, sorting, role filter, or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, pageSize, selectedRole]);

  // Ensure safe page if totalPages changes (e.g. after deletion or filter)
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(vendors.length / pageSize));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [vendors.length, pageSize, currentPage]);

  // Key Metrics
  const stats = useMemo(() => {
    const total = vendors.length;
    const active = vendors.filter((v) => v.isActive).length;
    const sumRates = vendors.reduce(
      (acc, v) => acc + Number(v.baseEventRate ?? v.defaultPayout ?? 0),
      0,
    );
    const avgRate = total > 0 ? Math.round(sumRates / total) : 0;
    const availableCount = vendors.filter(
      (v) => v.isActive && (!v.blackouts || v.blackouts.length === 0),
    ).length;
    const roleCount = roles?.length || 0;

    return { total, active, avgRate, availableCount, roleCount };
  }, [vendors, roles]);

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
          (vendor.phone && vendor.phone.includes(q)) ||
          (vendor.code && vendor.code.toLowerCase().includes(q)) ||
          (vendor.city && vendor.city.toLowerCase().includes(q)) ||
          (Array.isArray(vendor.specializations) &&
            vendor.specializations.some((s) => s.toLowerCase().includes(q)));
        return matchesRole && matchesSearch;
      })
      .sort((a, b) => {
        const rateA = Number(a.baseEventRate ?? a.defaultPayout ?? 0);
        const rateB = Number(b.baseEventRate ?? b.defaultPayout ?? 0);
        if (sortBy === "recent") return (b.createdAt || 0) - (a.createdAt || 0);
        if (sortBy === "rate-high") return rateB - rateA;
        if (sortBy === "rate-low") return rateA - rateB;
        if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
        if (sortBy === "completed")
          return (b.completedEvents || 0) - (a.completedEvents || 0);
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [vendors, selectedRole, searchQuery, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredVendors.length / pageSize) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedVendors = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredVendors.slice(start, start + pageSize);
  }, [filteredVendors, safePage, pageSize]);

  const handleOpenAddModal = () => {
    setIsModalOpen(true);
  };

  const handleSaveVendor = (savedData) => {
    addVendor(savedData);
    setSortBy("recent");
    setSelectedRole("All");
    setSearchQuery("");
    setCurrentPage(1);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full space-y-5">
      {/* Header Banner */}
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
            Manage freelance hairstylists, saree drapers, assistants, professional roles, and
            per-event remuneration.
          </p>
        </div>

        {/* Action Buttons: Manage Roles & Add Vendor */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => setIsManageRolesOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-glam-surface-alt border border-glam-border/50 text-glam-text hover:text-glam-accent hover:border-glam-accent/50 font-semibold text-xs transition-all cursor-pointer"
          >
            <Settings size={14} />
            <span>Manage Roles</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white font-semibold text-xs shadow-sm hover:shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Plus size={15} />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          icon={Layers}
          title="Total Vendors"
          value={stats.total}
          subtitle={`${stats.active} Active on call`}
        />
        <StatCard
          icon={IndianRupee}
          title="Average Payout"
          value={`₹${stats.avgRate.toLocaleString("en-IN")}`}
          subtitle="Per event assignment"
        />
        <StatCard
          icon={Clock}
          title="24/7 Available"
          value={stats.availableCount}
          subtitle="Zero schedule conflicts"
        />
        <StatCard
          icon={FolderKanban}
          title="Vendor Roles"
          value={`${stats.roleCount} Trades`}
          subtitle="Manageable classifications"
        />
      </div>

      {/* Search, Filter & Sort Toolbar */}
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
              placeholder="Search by name, role, skill tag, phone, or code (#H-101)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-9 rounded-xl border border-glam-border/60 bg-glam-surface-alt text-xs font-medium text-glam-text placeholder:text-glam-text-muted focus:outline-none focus:border-glam-accent transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-glam-text-muted hover:text-glam-text cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-glam-text font-medium min-w-[170px]">
              <SlidersHorizontal
                size={13}
                className="text-glam-accent shrink-0"
              />
              <ThemeSelect
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                options={[
                  { value: "recent", label: "Recently Added" },
                  { value: "rate-high", label: "Highest Payout" },
                  { value: "rate-low", label: "Lowest Payout" },
                  { value: "name", label: "Name (A-Z)" },
                  { value: "completed", label: "Most Completed" },
                ]}
                triggerClassName="h-10 rounded-xl border-glam-border/60 bg-glam-surface-alt text-xs"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Role Filter Pills + Manage Shortcut */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-glam-border/30 pt-2.5">
          {["All", ...(roles || [])].map((role) => {
            const isSelected = selectedRole === role;
            const RoleIcon = role === "All" ? Users : getRoleIcon(role);
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

          <button
            type="button"
            onClick={() => setIsManageRolesOpen(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap bg-glam-surface-alt/60 text-glam-accent border border-glam-accent/30 hover:bg-glam-accent/10 transition-colors cursor-pointer ml-1"
          >
            <Plus size={12} />
            <span>Manage Roles</span>
          </button>
        </div>
      </div>

      {/* Vendors Table Display */}
      {filteredVendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-glam-surface border border-glam-border/40 rounded-2xl text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-glam-accent/10 text-glam-accent flex items-center justify-center mb-3">
            <Users size={24} />
          </div>
          <h3 className="text-base font-bold font-outfit text-glam-text">
            No Vendors found
          </h3>
          <p className="text-xs text-glam-text-muted mt-1 max-w-sm">
            {searchQuery
              ? `No vendors matched "${searchQuery}". Try a different keyword.`
              : selectedRole !== "All"
              ? `No vendors configured under "${selectedRole}". Click Add Vendor to create one.`
              : "No vendors registered in the system yet."}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedRole("All");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-glam-surface-alt border border-glam-border/50 text-xs font-semibold text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <VendorTableView
          vendors={paginatedVendors}
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filteredVendors.length}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          onPageChange={setCurrentPage}
          onToggleActive={toggleActive}
          onRowClick={(id) => navigate(`/masters/vendors/${id}`)}
        />
      )}

      {/* Add Vendor Modal */}
      <VendorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVendor}
        editingVendor={null}
      />

      {/* Manage Vendor Roles Modal */}
      <ManageVendorRolesModal
        isOpen={isManageRolesOpen}
        onClose={() => setIsManageRolesOpen(false)}
        roles={roles}
        vendors={vendors}
        onAddRole={addRole}
        onRenameRole={(oldName, newName) => {
          renameRole(oldName, newName);
          if (selectedRole === oldName) setSelectedRole(newName);
        }}
        onDeleteRole={(roleName, reassign) => {
          deleteRole(roleName, reassign);
          if (selectedRole === roleName) setSelectedRole("All");
        }}
      />
    </div>
  );
};

export default VendorMaster;
