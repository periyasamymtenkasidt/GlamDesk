import { useState, useMemo } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  IndianRupee,
  Building2,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Input, Select, Textarea } from "../../components/common/form";
import { initialServices } from "../../data/serviceData";
import { initialVenues } from "../../data/venueData";
import { initialVendors } from "../../data/vendorData";

const quickTimePresets = [
  { label: "04:30 AM (Muhurtham)", value: "04:30 AM" },
  { label: "06:00 AM (Dawn)", value: "06:00 AM" },
  { label: "10:30 AM (Morning)", value: "10:30 AM" },
  { label: "04:00 PM (Sunset)", value: "04:00 PM" },
  { label: "06:30 PM (Reception)", value: "06:30 PM" },
];

const BookAppointmentModal = ({ isOpen, onClose, onAddAppointment }) => {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState(
    initialServices[0]?.id || ""
  );
  const [selectedVenueId, setSelectedVenueId] = useState(
    initialVenues[0]?.id || ""
  );
  const [selectedVendorId, setSelectedVendorId] = useState("none");
  const [eventDate, setEventDate] = useState(
    new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0]
  );
  const [eventTime, setEventTime] = useState("04:30 AM");
  const [customDuration, setCustomDuration] = useState("");
  const [advancePaid, setAdvancePaid] = useState("");
  const [status, setStatus] = useState("Confirmed");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  // Active Selected Service
  const currentService = useMemo(() => {
    return (
      initialServices.find((s) => s.id === selectedServiceId) ||
      initialServices[0]
    );
  }, [selectedServiceId]);

  // Active Selected Venue
  const currentVenue = useMemo(() => {
    return (
      initialVenues.find((v) => v.id === selectedVenueId) || initialVenues[0]
    );
  }, [selectedVenueId]);

  // Active Selected Vendor
  const currentVendor = useMemo(() => {
    if (selectedVendorId === "none") return null;
    return initialVendors.find((v) => v.id === selectedVendorId) || null;
  }, [selectedVendorId]);

  // Pricing Calculations
  const baseServicePrice = currentService?.amount || 0;
  const venuePriceDelta = currentVenue?.priceDelta || 0;
  const venueTravelFee = currentVenue?.travelSurcharge || 0;
  const totalAmount = baseServicePrice + venuePriceDelta + venueTravelFee;

  const numericAdvance = Math.max(0, Number(advancePaid) || 0);
  const balanceDue = Math.max(0, totalAmount - numericAdvance);

  const paymentStatus =
    numericAdvance >= totalAmount
      ? "Fully Paid"
      : numericAdvance > 0
      ? "Advance Paid"
      : "Pending";

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation: Client Name only requires at least 2 characters (single name allowed & welcomed)
    const newErrors = {};
    if (!clientName.trim()) {
      newErrors.clientName = "Client name is required (single name is allowed)";
    }
    if (!clientPhone.trim()) {
      newErrors.clientPhone = "Contact phone number is required";
    }
    if (!eventDate) {
      newErrors.eventDate = "Please choose the event date";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newAppointment = {
      id: `apt-${Date.now()}`,
      code: `APT-${Math.floor(4800 + Math.random() * 500)}`,
      clientName: clientName.trim(), // Single name or preferred Tamil name format
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim() || `${clientName.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
      serviceName: currentService.name,
      serviceCategory: currentService.category,
      baseAmount: baseServicePrice,
      venueName: currentVenue.venueName,
      venueType: currentVenue.venueType,
      venueDelta: venuePriceDelta,
      travelFee: venueTravelFee,
      assignedVendorName: currentVendor
        ? `${currentVendor.name} (${currentVendor.role})`
        : "None (Solo Artist)",
      vendorPayout: currentVendor ? currentVendor.baseEventRate : 0,
      eventDate,
      eventTime,
      duration: Number(customDuration) || currentService.duration || 120,
      status,
      paymentStatus,
      totalAmount,
      advancePaid: numericAdvance,
      balanceDue,
      notes: notes.trim() || "Regular booking without special requests.",
    };

    onAddAppointment(newAppointment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl bg-glam-surface border border-glam-border/60 shadow-2xl p-4 sm:p-5 space-y-4"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-glam-border/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-glam-accent/10 text-glam-accent flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold font-outfit text-glam-text">
                Book New Appointment
              </h2>
              <p className="text-[11px] text-glam-text-muted">
                Create an event booking with custom venue pricing & collaborator assignment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-glam-surface-alt text-glam-text-muted hover:text-glam-text flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Section 1: Client Information (Single name supported) */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-glam-text uppercase tracking-wider">
              <User size={14} className="text-glam-accent" />
              <span>Client Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Client Name (Single name allowed)"
                name="clientName"
                placeholder="e.g. Priya or Kavitha R."
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  if (errors.clientName) setErrors({ ...errors, clientName: "" });
                }}
                required
                error={errors.clientName}
                hint="Single name / initial preferred format"
                icon={User}
              />

              <Input
                label="Contact Phone"
                name="clientPhone"
                placeholder="+91 98401 12345"
                value={clientPhone}
                onChange={(e) => {
                  setClientPhone(e.target.value);
                  if (errors.clientPhone) setErrors({ ...errors, clientPhone: "" });
                }}
                required
                error={errors.clientPhone}
                icon={Phone}
              />
            </div>

            <Input
              label="Email Address (Optional)"
              name="clientEmail"
              type="email"
              placeholder="e.g. priya@gmail.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              icon={Mail}
            />
          </div>

          {/* Section 2: Service & Venue Selection */}
          <div className="space-y-3 pt-2 border-t border-glam-border/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-glam-text uppercase tracking-wider">
              <Sparkles size={14} className="text-glam-accent" />
              <span>Service Package & Venue</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Service Dropdown */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-glam-text mb-1">
                  Select Makeup Package <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-glam-border/60 bg-glam-surface-alt text-xs font-medium text-glam-text focus:outline-none focus:border-glam-accent transition-colors cursor-pointer"
                >
                  {initialServices.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} — ₹{srv.amount.toLocaleString("en-IN")} ({srv.duration}m)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-glam-text-muted mt-0.5">
                  Category: <span className="text-glam-accent font-semibold">{currentService.category}</span>
                </p>
              </div>

              {/* Venue Dropdown */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-glam-text mb-1">
                  Event Venue / Location <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedVenueId}
                  onChange={(e) => setSelectedVenueId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-glam-border/60 bg-glam-surface-alt text-xs font-medium text-glam-text focus:outline-none focus:border-glam-accent transition-colors cursor-pointer"
                >
                  {initialVenues.map((ven) => (
                    <option key={ven.id} value={ven.id}>
                      {ven.venueName} (+₹{ven.priceDelta} delta)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-glam-text-muted mt-0.5">
                  Type: {currentVenue.venueType} · Travel: ₹{currentVenue.travelSurcharge}
                </p>
              </div>
            </div>

            {/* Collaborator / Vendor Assignment */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-glam-text mb-1">
                Assign Collaborator / Freelancer (Optional)
              </label>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-glam-border/60 bg-glam-surface-alt text-xs font-medium text-glam-text focus:outline-none focus:border-glam-accent transition-colors cursor-pointer"
              >
                <option value="none">None (Solo Makeup Artist / In-House)</option>
                {initialVendors.map((vnd) => (
                  <option key={vnd.id} value={vnd.id}>
                    {vnd.name} — {vnd.role} (₹{vnd.baseEventRate}/event)
                  </option>
                ))}
              </select>
              {currentVendor && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Assigned {currentVendor.name} ({currentVendor.role}) · Event Payout: ₹{currentVendor.baseEventRate}
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Event Date & Timing */}
          <div className="space-y-3 pt-2 border-t border-glam-border/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-glam-text uppercase tracking-wider">
              <Calendar size={14} className="text-glam-accent" />
              <span>Event Date & Timing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Event Date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                error={errors.eventDate}
                icon={Calendar}
              />

              <Input
                label="Event Time (e.g. Muhurtham)"
                type="text"
                placeholder="04:30 AM"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                required
                icon={Clock}
              />

              <Input
                label="Duration (Minutes)"
                type="number"
                placeholder={`${currentService.duration || 120} mins`}
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                icon={Clock}
              />
            </div>

            {/* Quick time preset chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-glam-text-muted font-medium mr-1">
                Presets:
              </span>
              {quickTimePresets.map((preset) => (
                <button
                  type="button"
                  key={preset.value}
                  onClick={() => setEventTime(preset.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    eventTime === preset.value
                      ? "bg-glam-accent text-white"
                      : "bg-glam-surface-alt border border-glam-border/40 text-glam-text-muted hover:text-glam-accent"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Advance & Financial Real-Time Calculator */}
          <div className="p-3 rounded-xl bg-glam-surface-alt/40 border border-glam-border/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-glam-text uppercase tracking-wider flex items-center gap-1.5">
                <IndianRupee size={13} className="text-glam-accent" />
                Live Calculated Quote
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-glam-accent/10 text-glam-accent">
                Auto-calculated
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-glam-surface border border-glam-border/40">
                <p className="text-[10px] text-glam-text-muted">Base Service</p>
                <p className="font-bold font-outfit text-glam-text text-xs mt-0.5">
                  ₹{baseServicePrice.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="p-2 rounded-lg bg-glam-surface border border-glam-border/40">
                <p className="text-[10px] text-glam-text-muted">Venue Delta + Travel</p>
                <p className="font-bold font-outfit text-glam-text text-xs mt-0.5">
                  +₹{(venuePriceDelta + venueTravelFee).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="p-2 rounded-lg bg-glam-surface border border-glam-border/40 col-span-2 sm:col-span-1">
                <p className="text-[10px] text-glam-text-muted">Total Quote</p>
                <p className="font-bold font-outfit text-glam-accent text-xs mt-0.5">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <Input
                label="Advance Payment Received (₹)"
                type="number"
                placeholder="e.g. 5000"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
                prefix="₹"
              />

              <div className="flex flex-col justify-end">
                <div className="p-2 rounded-lg bg-glam-surface border border-glam-border/40 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-glam-text-muted">Balance Due</p>
                    <p className="font-bold font-outfit text-rose-500 text-xs">
                      ₹{balanceDue.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-glam-surface-alt text-glam-text">
                    {paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Notes & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5">
            <div className="sm:col-span-2">
              <Textarea
                label="Event Notes & Special Instructions"
                placeholder="e.g. Saree draping style, Muhurtham time, temple jewelry placement..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-glam-text mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-glam-border/60 bg-glam-surface-alt text-xs font-medium text-glam-text focus:outline-none focus:border-glam-accent cursor-pointer"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-glam-border/40">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-glam-border/50 text-xs font-semibold text-glam-text hover:bg-glam-surface-alt transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-linear-to-r from-glam-accent to-glam-accent-2 text-white text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              <span>Confirm Booking</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointmentModal;
