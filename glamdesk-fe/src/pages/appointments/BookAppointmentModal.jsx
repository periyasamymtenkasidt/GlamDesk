import { useState, useMemo, useEffect } from "react";
import {
  X,
  Calendar,
  ChevronDown,
  Users as UsersIcon,
  Check,
  MapPin,
} from "lucide-react";
import { initialServices } from "../../data/serviceData";
import { initialVendors } from "../../data/vendorData";
import { initialAppointments } from "../../data/appointmentData";
import { venueTypesList, initialVenues } from "../../data/venueData";
import ThemeSelect from "../../components/common/form/ThemeSelect";

// Helper to calculate end time given hour, minute, period, and duration in minutes
const calculateEndTime = (hour, minute, period, durationMinutes) => {
  let h = parseInt(hour, 10);
  const m = parseInt(minute, 10);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;

  const totalMins = h * 60 + m + (durationMinutes || 120);
  const endTotalMins = totalMins % (24 * 60);

  let endH = Math.floor(endTotalMins / 60);
  const endM = endTotalMins % 60;
  const endPeriod = endH >= 12 ? "PM" : "AM";

  if (endH > 12) endH -= 12;
  if (endH === 0) endH = 12;

  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(endH)}:${pad(endM)} ${endPeriod}`;
};

const BookAppointmentModal = ({
  isOpen,
  onClose,
  onAddAppointment,
  onUpdateAppointment,
  editingAppointment,
}) => {
  const isEditMode = Boolean(editingAppointment);

  // Helper to parse "09:30 AM" into { hour, minute, period }
  const parseTime = (timeStr) => {
    if (!timeStr) return { hour: 9, minute: 0, period: "AM" };
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return { hour: 9, minute: 0, period: "AM" };
    return {
      hour: parseInt(match[1], 10),
      minute: parseInt(match[2], 10),
      period: match[3].toUpperCase(),
    };
  };

  // Form State matching Reference Image 1 & 2
  const [selectedClientType, setSelectedClientType] = useState("new");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [eventDate, setEventDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [showAvailableSlots, setShowAvailableSlots] = useState(true);

  // Start Time State
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState("AM");

  // Service & Group Size
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [personsCount, setPersonsCount] = useState(1);

  // Vendor Selection
  const [selectedVendorIds, setSelectedVendorIds] = useState([]);
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);

  // Location & Venue Fields from Venue Master
  const [locationType, setLocationType] = useState("studio");
  const [venueCategory, setVenueCategory] = useState("");
  const [venueAddress, setVenueAddress] = useState("");

  // Financials
  const [totalAmount, setTotalAmount] = useState(8000);
  const [advanceRequired, setAdvanceRequired] = useState(3200);
  const [vendorCost, setVendorCost] = useState(0);

  // Notes
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  // Pre-fill form when opening in edit mode
  useEffect(() => {
    if (isOpen && isEditMode && editingAppointment) {
      const apt = editingAppointment;
      setClientName(apt.clientName || "");
      setClientPhone(apt.clientPhone || "");
      setSelectedClientType("new"); // treat as manual entry with pre-filled values
      setEventDate(apt.eventDate || new Date().toISOString().split("T")[0]);

      // Parse time
      const parsed = parseTime(apt.eventTime);
      setHour(parsed.hour);
      setMinute(parsed.minute);
      setPeriod(parsed.period);

      // Match service by name
      const matchedService = initialServices.find(
        (s) => s.name === apt.serviceName,
      );
      setSelectedServiceId(matchedService ? matchedService.id : "");

      // Location
      const isStudio = apt.venueType?.toLowerCase().includes("studio");
      setLocationType(isStudio ? "studio" : "venue");
      setVenueCategory(
        isStudio ? "" : apt.venueCategory || apt.venueType || "",
      );
      setVenueAddress(isStudio ? "" : apt.venueAddress || apt.venueName || "");

      // Financials
      setTotalAmount(apt.totalAmount || 0);
      setAdvanceRequired(apt.advancePaid || 0);
      setVendorCost(apt.vendorPayout || 0);

      // Vendor IDs — try matching by name
      if (apt.vendorPayout && apt.vendorPayout > 0) {
        const matchedVendor = initialVendors.find((v) =>
          apt.assignedVendorName?.includes(v.name),
        );
        setSelectedVendorIds(matchedVendor ? [matchedVendor.id] : []);
      } else {
        setSelectedVendorIds([]);
      }

      setNotes(apt.notes || "");
      setErrors({});
    } else if (isOpen && !isEditMode) {
      // Reset to defaults when opening for new booking
      setSelectedClientType("new");
      setClientName("");
      setClientPhone("");
      const d = new Date();
      setEventDate(d.toISOString().split("T")[0]);
      setHour(9);
      setMinute(0);
      setPeriod("AM");
      setSelectedServiceId("");
      setPersonsCount(1);
      setSelectedVendorIds([]);
      setLocationType("studio");
      setVenueCategory("");
      setVenueAddress("");
      setTotalAmount(8000);
      setAdvanceRequired(3200);
      setVendorCost(0);
      setNotes("");
      setErrors({});
    }
  }, [isOpen, isEditMode, editingAppointment]);

  // Clients list matching the reference design and existing seed appointments
  const clientOptions = useMemo(() => {
    const list = [
      { value: "new", label: "+ New Client", name: "", phone: "" },
      {
        value: "c-priya",
        label: "Priya Mehta · 98765 43210",
        name: "Priya Mehta",
        phone: "98765 43210",
      },
      {
        value: "c-anjali",
        label: "Anjali Sharma · 91234 56789",
        name: "Anjali Sharma",
        phone: "91234 56789",
      },
      {
        value: "c-kavya",
        label: "Kavya Nair · 99887 76655",
        name: "Kavya Nair",
        phone: "99887 76655",
      },
      {
        value: "c-ritika",
        label: "Ritika Joshi · 87654 32109",
        name: "Ritika Joshi",
        phone: "87654 32109",
      },
    ];

    const knownPhones = new Set(list.map((c) => c.phone.replace(/\D/g, "")));
    initialAppointments.forEach((apt) => {
      const cleanPhone = (apt.clientPhone || "").replace(/\D/g, "");
      if (cleanPhone && !knownPhones.has(cleanPhone)) {
        knownPhones.add(cleanPhone);
        list.push({
          value: apt.id,
          label: `${apt.clientName} · ${apt.clientPhone}`,
          name: apt.clientName,
          phone: apt.clientPhone,
        });
      }
    });

    return list;
  }, []);

  // Service package options
  const serviceOptions = useMemo(() => {
    return [
      { value: "", label: "— Select a service package —" },
      ...initialServices.map((s) => ({
        value: s.id,
        label: `${s.name} — ₹${s.amount.toLocaleString("en-IN")} (${s.duration} mins)`,
      })),
    ];
  }, []);

  // Location options
  const locationOptions = [
    { value: "studio", label: "🏠 Studio Appointment" },
    { value: "venue", label: "📍 On-Location / Client Venue" },
  ];

  // Venue Category options from Venue Master (matches reference image)
  const venueCategoryOptions = useMemo(() => {
    try {
      const saved = localStorage.getItem("glamdesk_venues_data_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .filter((v) => v.isActive)
            .map((v) => ({
              value: v.venueName,
              label: v.venueName,
            }));
        }
      }
    } catch (e) {
      console.warn("Failed to load venues in BookAppointmentModal:", e);
    }
    return initialVenues.map((v) => ({
      value: v.venueName,
      label: v.venueName,
    }));
  }, [isOpen]);

  // Selected Service
  const selectedService = useMemo(() => {
    return initialServices.find((s) => s.id === selectedServiceId) || null;
  }, [selectedServiceId]);

  // When Service changes, automatically update pricing & duration
  useEffect(() => {
    if (selectedService) {
      const baseAmt = selectedService.amount * personsCount;
      setTotalAmount(baseAmt);
      setAdvanceRequired(Math.round(baseAmt * 0.4));
    }
  }, [selectedService, personsCount]);

  // When existing client is picked from dropdown
  const handleClientSelect = (val) => {
    setSelectedClientType(val);
    if (val === "new") {
      setClientName("");
      setClientPhone("");
    } else {
      const client = clientOptions.find((c) => c.value === val);
      if (client) {
        setClientName(client.name);
        setClientPhone(client.phone);
      }
    }
  };

  // Adjust hours in time picker
  const adjustHour = (delta) => {
    setHour((prev) => {
      let next = prev + delta;
      if (next > 12) next = 1;
      if (next < 1) next = 12;
      return next;
    });
  };

  // Adjust minutes in time picker (steps of 5)
  const adjustMinute = (delta) => {
    setMinute((prev) => {
      let next = prev + delta;
      if (next >= 60) next = 0;
      if (next < 0) next = 55;
      return next;
    });
  };

  const togglePeriod = () => {
    setPeriod((prev) => (prev === "AM" ? "PM" : "AM"));
  };

  // Format hour & minute strings
  const pad = (n) => String(n).padStart(2, "0");
  const formattedHour = pad(hour);
  const formattedMinute = pad(minute);

  const prevHour = pad(hour === 1 ? 12 : hour - 1);
  const nextHour = pad(hour === 12 ? 1 : hour + 1);

  const prevMinute = pad(minute === 0 ? 55 : minute - 5);
  const nextMinute = pad(minute === 55 ? 0 : minute + 5);

  const duration = selectedService?.duration || 120;
  const calculatedEndTime = useMemo(
    () => calculateEndTime(hour, minute, period, duration),
    [hour, minute, period, duration],
  );

  // Vendor selection toggle
  const toggleVendor = (vId) => {
    setSelectedVendorIds((prev) => {
      const exists = prev.includes(vId);
      const updated = exists ? prev.filter((id) => id !== vId) : [...prev, vId];

      // Auto update vendor cost sum
      const cost = updated.reduce((sum, id) => {
        const v = initialVendors.find((vnd) => vnd.id === id);
        return sum + (v?.baseEventRate || 0);
      }, 0);
      setVendorCost(cost);

      return updated;
    });
  };

  // Estimated profit = Total Amount - Vendor Cost
  const estimatedProfit = useMemo(() => {
    if (totalAmount === "" || totalAmount === null) return null;
    return Math.max(0, Number(totalAmount) - (Number(vendorCost) || 0));
  }, [totalAmount, vendorCost]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!clientName.trim()) {
      newErrors.clientName = "Client name is required";
    }
    if (!clientPhone.trim()) {
      newErrors.clientPhone = "Phone number is required";
    }
    if (!eventDate) {
      newErrors.eventDate = "Please choose the event date";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (locationType === "venue") {
      if (!venueCategory) {
        newErrors.venueCategory = "Please select a venue category";
      }
      if (!venueAddress.trim()) {
        newErrors.venueAddress =
          "Please enter the venue location or exact address";
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    const assignedVendorObj = initialVendors.find((v) =>
      selectedVendorIds.includes(v.id),
    );

    let venuesList = initialVenues;
    try {
      const savedVenues = localStorage.getItem("glamdesk_venues_data_v2");
      if (savedVenues) {
        const parsed = JSON.parse(savedVenues);
        if (Array.isArray(parsed) && parsed.length > 0) venuesList = parsed;
      }
    } catch (e) {
      console.warn(e);
    }

    const matchedVenue = venuesList.find(
      (v) =>
        v.venueName.toLowerCase() === venueCategory.trim().toLowerCase() ||
        v.venueName.toLowerCase() === venueAddress.trim().toLowerCase() ||
        v.venueType === venueCategory,
    );

    const appointmentData = {
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: `${clientName.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
      serviceName: selectedService
        ? selectedService.name
        : "Custom Glam Package",
      serviceCategory: selectedService
        ? selectedService.category
        : "Bridal & Luxury",
      baseAmount: Number(totalAmount) || 8000,
      venueName:
        locationType === "studio"
          ? "GlamDesk Atelier Studio"
          : venueAddress.trim() || `${venueCategory || "On-Site"} Venue`,
      venueType:
        locationType === "studio" ? "Studio" : venueCategory || "Venue",
      venueCategory:
        locationType === "studio" ? "Studio" : venueCategory || "Venue",
      venueDelta:
        locationType === "studio" ? 0 : matchedVenue?.priceDelta || 1500,
      travelFee:
        locationType === "studio" ? 0 : matchedVenue?.travelSurcharge || 500,
      assignedVendorName: assignedVendorObj
        ? `${assignedVendorObj.name} (${assignedVendorObj.role})`
        : "None (Solo Artist)",
      vendorPayout: Number(vendorCost) || 0,
      eventDate,
      eventTime: `${formattedHour}:${formattedMinute} ${period}`,
      duration,
      paymentStatus:
        Number(advanceRequired) >= Number(totalAmount)
          ? "Fully Paid"
          : Number(advanceRequired) > 0
            ? "Advance Paid"
            : "Pending",
      totalAmount: Number(totalAmount) || 8000,
      advancePaid: Number(advanceRequired) || 0,
      balanceDue: Math.max(
        0,
        (Number(totalAmount) || 8000) - (Number(advanceRequired) || 0),
      ),
      notes: notes.trim() || "Regular booking created via Lead form.",
    };

    if (isEditMode && editingAppointment) {
      // Preserve existing id, code, and status
      onUpdateAppointment(editingAppointment.id, {
        ...appointmentData,
        id: editingAppointment.id,
        code: editingAppointment.code,
        status: editingAppointment.status,
      });
    } else {
      const newAppointment = {
        ...appointmentData,
        id: `apt-${Date.now()}`,
        code: `APT-${Math.floor(4800 + Math.random() * 500)}`,
        status: "Booked",
        quoteSent: false,
      };
      onAddAppointment(newAppointment);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-[#fefaf7] border border-[#e8dcd0] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Modal Header matching Reference Image */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#f0e4d8] flex items-center justify-between shrink-0 bg-[#fefaf7]">
          <h2 className="text-xl font-bold font-serif text-[#2d1b2e] tracking-tight">
            {isEditMode ? (
              <>
                Edit{" "}
                <span className="font-sans font-light text-[#8b6340]">/</span>{" "}
                Booking
              </>
            ) : (
              <>
                New Lead{" "}
                <span className="font-sans font-light text-[#8b6340]">/</span>{" "}
                Booking
              </>
            )}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f5eae0]/70 hover:bg-[#f5eae0] flex items-center justify-center text-glam-text transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto scrollbar-none p-5 sm:p-6 space-y-4"
        >
          {/* 1. CLIENT Dropdown matching Reference Image */}
          <div className="relative z-50">
            <ThemeSelect
              label="Client"
              value={selectedClientType}
              onChange={handleClientSelect}
              options={clientOptions}
              searchable={true}
              searchPlaceholder="Search by name or phone..."
            />
          </div>

          {/* 2. CLIENT NAME * & PHONE NUMBER * */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-[#8b6340] uppercase mb-1.5">
                Client Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ananya Roy"
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  if (errors.clientName)
                    setErrors({ ...errors, clientName: "" });
                }}
                className={`w-full h-11 px-3.5 rounded-xl border ${
                  errors.clientName ? "border-rose-400" : "border-[#e6d5c7]"
                } bg-[#fdf8f4]/60 text-sm font-medium text-[#2d1b2e] placeholder:text-[#2d1b2e]/35 focus:outline-none focus:border-[#c9956c] transition-colors`}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-[#8b6340] uppercase mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="98765 43210"
                value={clientPhone}
                onChange={(e) => {
                  setClientPhone(e.target.value);
                  if (errors.clientPhone)
                    setErrors({ ...errors, clientPhone: "" });
                }}
                className={`w-full h-11 px-3.5 rounded-xl border ${
                  errors.clientPhone ? "border-rose-400" : "border-[#e6d5c7]"
                } bg-[#fdf8f4]/60 text-sm font-medium text-[#2d1b2e] placeholder:text-[#2d1b2e]/35 focus:outline-none focus:border-[#c9956c] transition-colors`}
                required
              />
            </div>
          </div>

          {/* 3. EVENT DATE */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider text-[#8b6340] uppercase mb-1.5">
              Event Date
            </label>
            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-3.5 top-3.5 text-[#2d1b2e]/70 pointer-events-none"
              />
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[#e6d5c7] bg-[#fdf8f4]/60 text-sm font-medium text-[#2d1b2e] focus:outline-none focus:border-[#c9956c] transition-colors cursor-pointer"
                required
              />
            </div>
          </div>

          {/* 4. SHOW AVAILABLE SLOTS Checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none pt-0.5">
            <input
              type="checkbox"
              checked={showAvailableSlots}
              onChange={(e) => setShowAvailableSlots(e.target.checked)}
              className="w-4 h-4 rounded border-[#e6d5c7] text-[#c9956c] focus:ring-0 cursor-pointer accent-[#c9956c]"
            />
            <span className="text-[11px] font-bold tracking-wider text-[#8b6340] uppercase">
              Show Available Slots
            </span>
          </label>

          {/* 5. START TIME Time Picker Card */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider text-[#8b6340] uppercase mb-1.5">
              Start Time
            </label>
            <div className="rounded-2xl border border-[#e6d5c7] bg-[#fdf8f4]/40 p-4 sm:p-5 flex flex-col items-center justify-center">
              {/* Dial Columns */}
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {/* Hours column */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => adjustHour(-1)}
                    className="text-sm font-serif text-[#2d1b2e]/30 hover:text-[#2d1b2e]/60 cursor-pointer select-none h-6 flex items-center justify-center"
                    aria-label="Previous hour"
                  >
                    {prevHour}
                  </button>
                  <div className="w-14 sm:w-16 h-12 rounded-xl bg-[#f5eae0] border border-[#e2d0c0] flex items-center justify-center text-xl sm:text-2xl font-bold font-serif text-[#2d1b2e] shadow-2xs select-none">
                    {formattedHour}
                  </div>
                  <button
                    type="button"
                    onClick={() => adjustHour(1)}
                    className="text-sm font-serif text-[#2d1b2e]/30 hover:text-[#2d1b2e]/60 cursor-pointer select-none h-6 flex items-center justify-center"
                    aria-label="Next hour"
                  >
                    {nextHour}
                  </button>
                </div>

                {/* Colon separator */}
                <span className="text-xl font-bold text-[#2d1b2e] pb-1 select-none">
                  :
                </span>

                {/* Minutes column */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => adjustMinute(-5)}
                    className="text-sm font-serif text-[#2d1b2e]/30 hover:text-[#2d1b2e]/60 cursor-pointer select-none h-6 flex items-center justify-center"
                    aria-label="Previous minute"
                  >
                    {prevMinute}
                  </button>
                  <div className="w-14 sm:w-16 h-12 rounded-xl bg-[#f5eae0] border border-[#e2d0c0] flex items-center justify-center text-xl sm:text-2xl font-bold font-serif text-[#2d1b2e] shadow-2xs select-none">
                    {formattedMinute}
                  </div>
                  <button
                    type="button"
                    onClick={() => adjustMinute(5)}
                    className="text-sm font-serif text-[#2d1b2e]/30 hover:text-[#2d1b2e]/60 cursor-pointer select-none h-6 flex items-center justify-center"
                    aria-label="Next minute"
                  >
                    {nextMinute}
                  </button>
                </div>

                {/* AM / PM column */}
                <div className="flex flex-col items-center ml-1">
                  <button
                    type="button"
                    onClick={togglePeriod}
                    className="text-sm font-serif text-[#2d1b2e]/30 hover:text-[#2d1b2e]/60 cursor-pointer select-none h-6 flex items-center justify-center"
                  >
                    {period === "AM" ? "PM" : "AM"}
                  </button>
                  <button
                    type="button"
                    onClick={togglePeriod}
                    className="w-14 sm:w-16 h-12 rounded-xl bg-[#f5eae0] border border-[#e2d0c0] flex items-center justify-center text-lg sm:text-xl font-bold font-serif text-[#2d1b2e] shadow-2xs cursor-pointer select-none"
                  >
                    {period}
                  </button>
                  <button
                    type="button"
                    onClick={togglePeriod}
                    className="text-sm font-serif text-[#2d1b2e]/30 hover:text-[#2d1b2e]/60 cursor-pointer select-none h-6 flex items-center justify-center"
                  >
                    {period === "AM" ? "PM" : "AM"}
                  </button>
                </div>
              </div>
            </div>

            {/* Availability Pill matching Reference Images 1 & 3 */}
            {showAvailableSlots ? (
              <div className="mt-2.5 w-full py-2 px-3 rounded-xl bg-[#e8f5ed] border border-[#c3e6cb] text-emerald-800 text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-all">
                <span>✓ This time slot looks available</span>
              </div>
            ) : (
              <div className="mt-2.5 w-full py-2 px-3 rounded-xl bg-[#fdf2f2] border border-[#f5c6cb] text-[#c53030] text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-all">
                <span>
                  ✕ Artist may be unavailable — we'll confirm after review
                </span>
              </div>
            )}

            {/* Calculated End Time */}
            <p className="text-xs font-medium text-[#2d1b2e]/70 mt-1.5">
              Ends at:{" "}
              <span className="font-bold text-[#2d1b2e]">
                {calculatedEndTime}
              </span>
            </p>
          </div>

          {/* 6. SERVICE PACKAGE matching Reference Image */}
          <div className="relative z-40">
            <ThemeSelect
              label="Service Package"
              value={selectedServiceId}
              onChange={setSelectedServiceId}
              options={serviceOptions}
              placeholder="— Select a service package —"
              searchable={true}
              searchPlaceholder="Search service package..."
            />
          </div>

          {/* 7. NUMBER OF PERSONS Stepper */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider text-[#8b6340] uppercase mb-1.5">
              Number of Persons
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPersonsCount((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-xl border border-[#e6d5c7] bg-[#fdf8f4]/60 flex items-center justify-center font-bold text-sm text-[#2d1b2e] hover:bg-[#f5eae0] transition-colors cursor-pointer"
                aria-label="Decrease persons"
              >
                −
              </button>
              <span className="w-8 text-center font-bold font-serif text-base text-[#2d1b2e]">
                {personsCount}
              </span>
              <button
                type="button"
                onClick={() => setPersonsCount((prev) => prev + 1)}
                className="w-10 h-10 rounded-xl border border-[#e6d5c7] bg-[#fdf8f4]/60 flex items-center justify-center font-bold text-sm text-[#2d1b2e] hover:bg-[#f5eae0] transition-colors cursor-pointer"
                aria-label="Increase persons"
              >
                +
              </button>
            </div>
          </div>

          {/* 8. ASSIGN TEAM & ARTISTS */}
          <div className="relative z-30">
            <label className="block text-[11px] font-bold tracking-wider text-[#8b6340] uppercase mb-1.5">
              Assign Team & Artists ({selectedVendorIds.length} Selected)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsVendorDropdownOpen((prev) => !prev)}
                className="w-full h-11 px-3.5 pr-9 rounded-xl border border-[#e6d5c7] bg-[#fdf8f4]/60 text-sm font-medium text-left flex items-center justify-between text-[#2d1b2e] focus:outline-none focus:border-[#c9956c] transition-colors cursor-pointer"
              >
                <span
                  className={
                    selectedVendorIds.length === 0
                      ? "text-[#2d1b2e]/40 italic"
                      : "text-[#2d1b2e]"
                  }
                >
                  {selectedVendorIds.length === 0
                    ? "Select a service package first..."
                    : selectedVendorIds
                        .map(
                          (id) => initialVendors.find((v) => v.id === id)?.name,
                        )
                        .filter(Boolean)
                        .join(", ")}
                </span>
                <div className="flex items-center gap-1 text-[#8b6340]">
                  <UsersIcon size={15} />
                  <ChevronDown size={15} />
                </div>
              </button>

              {/* Vendor Multi-select Popover */}
              {isVendorDropdownOpen && (
                <div className="absolute left-0 right-0 top-12 z-30 p-2 rounded-2xl bg-[#fefaf7] border border-[#e6d5c7] shadow-2xl max-h-48 overflow-y-auto scrollbar-none space-y-1">
                  {initialVendors.map((v) => {
                    const isSelected = selectedVendorIds.includes(v.id);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => toggleVendor(v.id)}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#a87447] text-white font-semibold shadow-2xs"
                            : "hover:bg-[#f5eae0]/70 text-[#2d1b2e] font-medium"
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{v.name}</p>
                          <p
                            className={`text-[10px] ${
                              isSelected ? "text-white/80" : "text-[#8b6340]"
                            }`}
                          >
                            {v.role} · ₹{v.baseEventRate}
                          </p>
                        </div>
                        {isSelected && (
                          <Check
                            size={16}
                            className="text-white shrink-0 ml-2"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 9. APPOINTMENT LOCATION & VENUE CATEGORY (Side by side when Venue, matching reference image) */}
          <div
            className={`grid gap-3 sm:gap-4 relative z-20 ${
              locationType === "venue"
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {/* Appointment Location */}
            <div>
              <ThemeSelect
                label="Appointment Location"
                value={locationType}
                onChange={(val) => {
                  setLocationType(val);
                  if (val === "studio") {
                    setVenueCategory("");
                    setVenueAddress("");
                    if (errors.venueCategory || errors.venueAddress) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.venueCategory;
                        delete copy.venueAddress;
                        return copy;
                      });
                    }
                  }
                }}
                options={locationOptions}
              />
            </div>

            {/* Venue Category */}
            {locationType === "venue" && (
              <div>
                <ThemeSelect
                  label="Venue Category"
                  value={venueCategory}
                  onChange={(val) => {
                    setVenueCategory(val);
                    if (errors.venueCategory) {
                      setErrors((prev) => ({ ...prev, venueCategory: "" }));
                    }
                  }}
                  options={venueCategoryOptions}
                  placeholder="— Select Venue Category —"
                  error={errors.venueCategory}
                />
              </div>
            )}
          </div>

          {/* 10. VENUE ADDRESS / EXACT LOCATION (Only when location is Venue, matching reference image) */}
          {locationType === "venue" && (
            <div className="relative z-10">
              <label className="block text-[11px] font-bold tracking-wider text-[#8b6340] uppercase mb-1.5">
                Venue Address / Exact Location{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3.5 top-3.5 text-[#8b6340] pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="e.g. Taj Hotel, Nungambakkam, Chennai"
                  value={venueAddress}
                  onChange={(e) => {
                    setVenueAddress(e.target.value);
                    if (errors.venueAddress) {
                      setErrors((prev) => ({ ...prev, venueAddress: "" }));
                    }
                  }}
                  className={`w-full h-11 pl-10 pr-3.5 rounded-xl border ${
                    errors.venueAddress ? "border-rose-400" : "border-[#e6d5c7]"
                  } bg-[#fdf8f4]/60 text-sm font-medium text-[#2d1b2e] placeholder:text-[#2d1b2e]/35 focus:outline-none focus:border-[#c9956c] transition-colors`}
                  required
                />
              </div>
              {errors.venueAddress && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">
                  {errors.venueAddress}
                </p>
              )}
            </div>
          )}

          {/* 10. Financial Grid (2 columns x 2 rows) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-[#8b6340] uppercase mb-1.5">
                Total Package Amount (₹)
              </label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#e6d5c7] bg-[#fdf8f4]/60 text-sm font-bold text-[#2d1b2e] focus:outline-none focus:border-[#c9956c] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-[#8b6340] uppercase mb-1.5">
                Advance Required (₹)
              </label>
              <input
                type="number"
                value={advanceRequired}
                onChange={(e) => setAdvanceRequired(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#e6d5c7] bg-[#fdf8f4]/60 text-sm font-bold text-[#2d1b2e] focus:outline-none focus:border-[#c9956c] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-[#8b6340] uppercase mb-1.5">
                Vendor Cost (₹){" "}
                <span className="font-normal lowercase text-[10px] text-glam-text-muted">
                  internal
                </span>
              </label>
              <input
                type="number"
                value={vendorCost}
                onChange={(e) => setVendorCost(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#e6d5c7] bg-[#fdf8f4]/60 text-sm font-bold text-[#2d1b2e] focus:outline-none focus:border-[#c9956c] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-[#8b6340] uppercase mb-1.5">
                Estimated Profit (₹)
              </label>
              <div className="w-full h-11 px-3.5 rounded-xl border border-[#e6d5c7] bg-[#fdf8f4]/40 flex items-center text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {estimatedProfit !== null
                  ? `₹${estimatedProfit.toLocaleString("en-IN")}`
                  : "—"}
              </div>
            </div>
          </div>

          {/* 11. NOTES / CLIENT REQUIREMENTS */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider text-[#8b6340] uppercase mb-1.5">
              Notes / Client Requirements
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Skin allergies, preferred look, early morning slot"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-[#e6d5c7] bg-[#fdf8f4]/60 text-sm font-medium text-[#2d1b2e] placeholder:text-[#2d1b2e]/35 focus:outline-none focus:border-[#c9956c] transition-colors resize-none"
            />
          </div>
        </form>

        {/* Modal Footer matching Reference Image */}
        <div className="p-4 sm:p-5 border-t border-[#f0e4d8] bg-[#fefaf7] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#d8c8ba] bg-[#fbf6f2] hover:bg-[#f3ebe4] text-xs font-semibold text-[#2d1b2e] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c97587] to-[#b85c70] hover:from-[#be6c7e] hover:to-[#ac5367] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            {isEditMode ? "Save Changes" : "Create Booking"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentModal;
