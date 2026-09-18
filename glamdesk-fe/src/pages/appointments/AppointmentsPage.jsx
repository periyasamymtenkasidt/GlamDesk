import { useState, useMemo } from "react";
import {
  CalendarCheck,
  Plus,
  Search,
  X,
  SlidersHorizontal,
  Clock,
  MapPin,
  IndianRupee,
  Phone,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  User,
  Building2,
  CreditCard,
  Layers,
} from "lucide-react";
import {
  initialAppointments,
  appointmentStatuses,
} from "../../data/appointmentData";
import BookAppointmentModal from "./BookAppointmentModal";
import AppointmentDetailsModal from "./AppointmentDetailsModal";

// ─── Status Config ────────────────────────────────────────────────────────────
const statusConfig = {
  Confirmed: {
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-500/10",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  "In-Progress": {
    textColor: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-500/15",
    dot: "bg-amber-500",
    icon: Clock,
  },
  Completed: {
    textColor: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-500/10",
    dot: "bg-blue-500",
    icon: CheckCircle2,
  },
  Cancelled: {
    textColor: "text-rose-600 dark:text-rose-400",
    bgLight: "bg-rose-500/10",
    dot: "bg-rose-500",
    icon: XCircle,
  },
};

const paymentConfig = {
  "Fully Paid": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "Advance Paid": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Pending: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

// ─── Compact KPI Metric Card ──────────────────────────────────────────────────
const StatCard = ({ icon: Icon, title, value, badge }) => (
  <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-glam-border/40 bg-glam-surface shadow-2xs hover:border-glam-accent/40 transition-colors">
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-7 h-7 rounded-lg bg-glam-accent/10 text-glam-accent flex items-center justify-center shrink-0">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-glam-text-muted uppercase tracking-wider truncate">
          {title}
        </p>
        <h3 className="text-sm font-bold font-outfit text-glam-text leading-none mt-0.5">
          {value}
        </h3>
      </div>
    </div>
    {badge && (
      <span className="text-[10px] font-medium text-glam-accent bg-glam-accent/10 px-1.5 py-0.5 rounded-md shrink-0">
        {badge}
      </span>
    )}
  </div>
);

// ─── Main Appointments Page Component ─────────────────────────────────────────
const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-asc");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const handleAddAppointment = (newApt) => {
    setAppointments((prev) => [newApt, ...prev]);
  };

  const handleUpdateStatus = (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
    setSelectedAppointment((prev) =>
      prev && prev.id === id ? { ...prev, status: newStatus } : prev
    );
  };

  // Summary Metrics
  const stats = useMemo(() => {
    const total = appointments.length;
    const upcoming = appointments.filter(
      (a) => a.status === "Confirmed" || a.status === "In-Progress"
    ).length;
    const completed = appointments.filter((a) => a.status === "Completed").length;
    const totalRevenue = appointments
      .filter((a) => a.status !== "Cancelled")
      .reduce((sum, a) => sum + a.totalAmount, 0);

    return { total, upcoming, completed, totalRevenue };
  }, [appointments]);

  // Filtered & Sorted Appointments
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((apt) => {
        const matchesStatus =
          selectedStatus === "All" || apt.status === selectedStatus;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          apt.clientName.toLowerCase().includes(q) ||
          apt.clientPhone.includes(q) ||
          apt.code.toLowerCase().includes(q) ||
          apt.serviceName.toLowerCase().includes(q) ||
          apt.venueName.toLowerCase().includes(q);

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "date-asc") return new Date(a.eventDate) - new Date(b.eventDate);
        if (sortBy === "date-desc") return new Date(b.eventDate) - new Date(a.eventDate);
        if (sortBy === "amount-high") return b.totalAmount - a.totalAmount;
        if (sortBy === "amount-low") return a.totalAmount - b.totalAmount;
        return a.clientName.localeCompare(b.clientName);
      });
  }, [appointments, selectedStatus, searchQuery, sortBy]);

  return (
    <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-2.5 sm:space-y-3">
      {/* Compact Top Header */}
      <div className="flex items-center justify-between gap-3 bg-glam-surface border border-glam-border/40 px-3.5 py-2.5 rounded-xl shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-glam-accent/10 text-glam-accent">
            <CalendarCheck size={16} />
          </span>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold font-outfit text-glam-text tracking-tight">
              Appointments & Bookings
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-glam-accent/10 text-glam-accent">
              {stats.total} Bookings
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white font-semibold text-xs shadow-xs hover:shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus size={14} />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Compact KPI Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard
          icon={Calendar}
          title="Total Bookings"
          value={stats.total}
          badge={`${stats.upcoming} Active`}
        />
        <StatCard
          icon={CheckCircle2}
          title="Completed"
          value={stats.completed}
          badge="Delivered"
        />
        <StatCard
          icon={IndianRupee}
          title="Pipeline Revenue"
          value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
          badge="Active"
        />
        <StatCard
          icon={Sparkles}
          title="Top Category"
          value="Bridal HD"
          badge="Popular"
        />
      </div>

      {/* Compact Search, Status Filter & Sort Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 p-2 rounded-xl bg-glam-surface border border-glam-border/40 shadow-2xs">
        {/* Search bar */}
        <div className="relative flex-1 min-w-48">
          <Search
            size={13}
            className="absolute left-2.5 top-2.5 text-glam-accent"
          />
          <input
            type="text"
            placeholder="Search client, phone, #APT-XXXX, or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-7 rounded-lg border border-glam-border/50 bg-glam-surface-alt text-xs font-medium text-glam-text placeholder:text-glam-text-muted focus:outline-none focus:border-glam-accent transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-2 text-glam-text-muted hover:text-glam-text cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
          {appointmentStatuses.map((status) => {
            const isSelected = selectedStatus === status;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-linear-to-r from-glam-accent to-glam-accent-2 text-white shadow-2xs"
                    : "bg-glam-surface-alt text-glam-text-muted border border-glam-border/40 hover:text-glam-accent"
                }`}
              >
                <span>{status}</span>
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1 text-xs text-glam-text font-medium shrink-0">
          <SlidersHorizontal size={12} className="text-glam-accent" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-8 px-2 rounded-lg border border-glam-border/50 bg-glam-surface-alt text-xs text-glam-text focus:outline-none focus:border-glam-accent cursor-pointer"
          >
            <option value="date-asc">Date: Upcoming</option>
            <option value="date-desc">Date: Latest</option>
            <option value="amount-high">Quote: High to Low</option>
            <option value="amount-low">Quote: Low to High</option>
          </select>
        </div>
      </div>

      {/* Appointments Data Table */}
      {filteredAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-glam-surface border border-glam-border/40 rounded-xl text-center shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-glam-accent/10 text-glam-accent flex items-center justify-center mb-2">
            <CalendarCheck size={20} />
          </div>
          <h3 className="text-sm font-bold font-outfit text-glam-text">
            No appointments found
          </h3>
          <p className="text-xs text-glam-text-muted mt-0.5">
            Try adjusting your search query or status filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedStatus("All");
            }}
            className="mt-3 px-3 py-1.5 rounded-lg bg-glam-surface-alt border border-glam-border/50 text-xs font-semibold text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-glam-border/50 bg-glam-surface shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glam-border/40 bg-glam-surface-alt/40 text-[10px] font-bold uppercase tracking-wider text-glam-text-muted">
                  <th className="py-2.5 px-3.5">Client & Code</th>
                  <th className="py-2.5 px-3.5">Service Package</th>
                  <th className="py-2.5 px-3.5">Event Date & Time</th>
                  <th className="py-2.5 px-3.5">Venue & Travel</th>
                  <th className="py-2.5 px-3.5">Total & Payment</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glam-border/30 text-xs">
                {filteredAppointments.map((apt) => {
                  const sc = statusConfig[apt.status] || statusConfig.Confirmed;
                  const payBadge =
                    paymentConfig[apt.paymentStatus] || paymentConfig.Pending;

                  return (
                    <tr
                      key={apt.id}
                      onClick={() => setSelectedAppointment(apt)}
                      className="hover:bg-glam-surface-alt/30 transition-colors cursor-pointer group"
                    >
                      {/* Client Info */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-glam-accent/10 text-glam-accent flex items-center justify-center font-bold font-outfit text-xs shrink-0">
                            {apt.clientName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold font-outfit text-glam-text text-xs group-hover:text-glam-accent transition-colors">
                                {apt.clientName}
                              </span>
                              <span className="text-[10px] text-glam-text-muted">
                                #{apt.code}
                              </span>
                            </div>
                            <p className="text-[10px] text-glam-text-muted">
                              {apt.clientPhone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Service Package */}
                      <td className="py-2.5 px-3.5">
                        <span className="font-semibold text-glam-text text-xs block leading-tight">
                          {apt.serviceName}
                        </span>
                        <span className="text-[10px] font-medium text-glam-accent">
                          {apt.serviceCategory}
                        </span>
                      </td>

                      {/* Schedule */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-1.5 font-bold font-outfit text-glam-text text-xs">
                          <Calendar size={12} className="text-glam-accent" />
                          <span>{apt.eventDate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-glam-text-muted">
                          <Clock size={10} />
                          <span>{apt.eventTime} ({apt.duration}m)</span>
                        </div>
                      </td>

                      {/* Venue & Location */}
                      <td className="py-2.5 px-3.5">
                        <span className="font-medium text-glam-text text-xs block truncate max-w-40 leading-tight">
                          {apt.venueName}
                        </span>
                        <span className="text-[10px] text-glam-text-muted">
                          {apt.venueType}
                          {apt.travelFee > 0 && ` (+₹${apt.travelFee})`}
                        </span>
                      </td>

                      {/* Total & Payment */}
                      <td className="py-2.5 px-3.5">
                        <div className="font-bold font-outfit text-xs text-glam-text">
                          ₹{apt.totalAmount.toLocaleString("en-IN")}
                        </div>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] font-bold ${payBadge}`}
                        >
                          {apt.paymentStatus}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sc.bgLight} ${sc.textColor}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {apt.status}
                        </span>
                      </td>

                      {/* View Action */}
                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAppointment(apt);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-glam-accent hover:bg-glam-accent/10 transition-colors cursor-pointer"
                        >
                          <span>Details</span>
                          <ArrowRight size={11} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Appointment Modal Form */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onAddAppointment={handleAddAppointment}
      />

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default AppointmentsPage;
