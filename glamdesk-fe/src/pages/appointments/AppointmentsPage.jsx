import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Clock,
  Calendar,
  MapPin,
  CalendarCheck,
} from "lucide-react";
import { appointmentStatuses } from "../../data/appointmentData";
import { useAppointments } from "../../context/AppointmentContext";
import BookAppointmentModal from "./BookAppointmentModal";
import { DataTable } from "../../components/common/table";

// ─── Status Config for Glowing Dots ──────────────────────────────────────────
const statusConfig = {
  Booked: {
    textColor: "text-amber-700 dark:text-amber-300",
    bgLight: "bg-amber-500/15",
    dot: "bg-amber-500 shadow-xs shadow-amber-500/50",
  },
  "Quote Sent": {
    textColor: "text-sky-700 dark:text-sky-300",
    bgLight: "bg-sky-500/15",
    dot: "bg-sky-500 shadow-xs shadow-sky-500/50",
  },
  Confirmed: {
    textColor: "text-emerald-700 dark:text-emerald-300",
    bgLight: "bg-emerald-500/10",
    dot: "bg-emerald-500 shadow-xs shadow-emerald-500/50",
  },
  "In-Progress": {
    textColor: "text-purple-700 dark:text-purple-300",
    bgLight: "bg-purple-500/15",
    dot: "bg-purple-500 shadow-xs shadow-purple-500/50",
  },
  Completed: {
    textColor: "text-blue-700 dark:text-blue-300",
    bgLight: "bg-blue-500/10",
    dot: "bg-blue-500 shadow-xs shadow-blue-500/50",
  },
  Cancelled: {
    textColor: "text-rose-700 dark:text-rose-300",
    bgLight: "bg-rose-500/10",
    dot: "bg-rose-500 shadow-xs shadow-rose-500/50",
  },
};

// ─── Date & Duration Formatting Helpers ──────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthName = months[parseInt(m, 10) - 1] || m;
    return `${parseInt(d, 10)} ${monthName} ${y}`;
  } catch {
    return dateStr;
  }
};

const formatDuration = (mins) => {
  if (!mins) return "";
  const hours = mins / 60;
  return hours % 1 === 0 ? `${hours} hrs` : `${hours.toFixed(1)} hrs`;
};

// ─── Main Appointments Page Component ─────────────────────────────────────────
const AppointmentsPage = () => {
  const navigate = useNavigate();
  const { appointments, addAppointment } = useAppointments();
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState("All");

  // Dropdown Filter matching Reference Screenshot 3
  const locationFilterDropdown = useMemo(
    () => ({
      label: "LOCATION",
      options: [
        { label: "All Locations", value: "All" },
        { label: "Studio", value: "Studio" },
        { label: "Venue", value: "Venue" },
      ],
      value: selectedLocation,
      onChange: (val) => setSelectedLocation(val),
      filterFn: (item, val) => {
        if (!val || val === "All" || val === "All Locations") return true;
        const isStudio = item.venueType?.toLowerCase().includes("studio");
        if (val === "Studio") return isStudio;
        if (val === "Venue") return !isStudio;
        return true;
      },
    }),
    [selectedLocation]
  );

  // Sort Options matching Reference Screenshot 2
  const sortOptions = useMemo(
    () => [
      {
        label: "Recently Added",
        value: "recent",
        compare: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
      },
      {
        label: "Date (Newest)",
        value: "date-desc",
        compare: (a, b) => new Date(b.eventDate) - new Date(a.eventDate),
      },
      {
        label: "Date (Oldest)",
        value: "date-asc",
        compare: (a, b) => new Date(a.eventDate) - new Date(b.eventDate),
      },
      {
        label: "Amount ↓",
        value: "amount-high",
        compare: (a, b) => b.totalAmount - a.totalAmount,
      },
      {
        label: "Amount ↑",
        value: "amount-low",
        compare: (a, b) => a.totalAmount - b.totalAmount,
      },
      {
        label: "Name A–Z",
        value: "client-asc",
        compare: (a, b) => a.clientName.localeCompare(b.clientName),
      },
    ],
    []
  );

  // Declarative Column Definitions matching the reference design
  const columns = useMemo(
    () => [
      {
        key: "code",
        header: "APPT ID",
        cell: (apt) => (
          <span className="inline-block px-2.5 py-1 rounded-lg bg-[#f6eae0] dark:bg-white/5 border border-glam-border/30 text-[11px] font-mono text-glam-text">
            {apt.code}
          </span>
        ),
      },
      {
        key: "clientName",
        header: "CLIENT",
        cell: (apt) => (
          <span className="font-medium text-xs sm:text-sm text-glam-text group-hover:text-glam-accent transition-colors block leading-tight">
            {apt.clientName}
          </span>
        ),
      },
      {
        key: "clientPhone",
        header: "MOBILE",
        cell: (apt) => (
          <span className="text-xs text-glam-text font-normal">
            {apt.clientPhone}
          </span>
        ),
      },
      {
        key: "serviceName",
        header: "SERVICE",
        cell: (apt) => (
          <div>
            <span className="font-medium text-xs sm:text-sm text-glam-text block leading-snug">
              {apt.serviceName}
            </span>
            <span className="text-[11px] text-[#a67c52] dark:text-glam-accent font-normal mt-0.5 block">
              {apt.serviceCategory}
            </span>
          </div>
        ),
      },
      {
        key: "venueType",
        header: "LOCATION",
        cell: (apt) => {
          const isStudio = apt.venueType?.toLowerCase().includes("studio");
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-normal border ${
                isStudio
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
              }`}
            >
              <MapPin size={11} className="shrink-0" />
              <span>{isStudio ? "Studio" : "Venue"}</span>
            </span>
          );
        },
      },
      {
        key: "eventDate",
        header: "DATE & TIME",
        cell: (apt) => (
          <div>
            <div className="flex items-center gap-1.5 font-normal text-xs sm:text-sm text-glam-text">
              <Calendar size={12} className="text-[#a67c52]" />
              <span>{formatDate(apt.eventDate)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-glam-text-muted mt-0.5 font-normal">
              <Clock size={11} />
              <span>{apt.eventTime}</span>
              {apt.duration && (
                <span className="px-1.5 py-0.5 rounded bg-glam-surface-alt text-[10px] font-normal border border-glam-border/30">
                  {formatDuration(apt.duration)}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "status",
        header: "STATUS",
        cell: (apt) => {
          const sc = statusConfig[apt.status] || statusConfig.Confirmed;
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-normal border ${sc.bgLight} ${sc.textColor} border-current/20`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              <span>{apt.status}</span>
            </span>
          );
        },
      },
      {
        key: "totalAmount",
        header: "AMOUNT",
        align: "right",
        cell: (apt) => (
          <span className="font-semibold text-xs sm:text-base text-glam-text tracking-tight block text-right">
            ₹{apt.totalAmount.toLocaleString("en-IN")}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-3 sm:p-4 max-w-7xl mx-auto w-full space-y-3 sm:space-y-4">
      {/* 1. Minimalist Serene Page Header */}
      <div className="shrink-0 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-medium font-outfit text-glam-text tracking-tight">
            Appointments
          </h1>
          <p className="text-xs text-glam-text-muted mt-0.5">
            Manage all your bookings in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsBookModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white font-medium text-xs shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus size={14} />
          <span>New Appointment</span>
        </button>
      </div>

      {/* 2. Reusable Luxury Data Table Component */}
      <DataTable
        columns={columns}
        data={appointments}
        searchPlaceholder="Search by name or service..."
        searchFields={[
          "clientName",
          "clientPhone",
          "code",
          "serviceName",
          "venueName",
        ]}
        dateField="eventDate"
        filterKey="status"
        filterOptions={appointmentStatuses}
        filterDropdown={locationFilterDropdown}
        sortOptions={sortOptions}
        defaultSortBy="recent"
        pageSize={6}
        itemLabel="bookings"
        onRowClick={(apt) => navigate(`/appointments/${apt.id}`)}
        emptyIcon={CalendarCheck}
        emptyTitle="No appointments found"
        emptyMessage="Try adjusting your search query, status filter, or date range."
      />

      {/* 3. Book Appointment Modal Form */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onAddAppointment={addAppointment}
      />
    </div>
  );
};

export default AppointmentsPage;
