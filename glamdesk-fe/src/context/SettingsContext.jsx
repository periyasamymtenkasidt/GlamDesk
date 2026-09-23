import { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext(null);

const STORAGE_KEY = "glamdesk_atelier_settings_v2";

export const defaultSettings = {
  salon: {
    businessName: "GlamDesk",
    tagline: "Luxury Bridal & Hair Styling Lounge",
    phone: "+91 98765 43210",
    email: "atelier@glamdesk.com",
    address: "T Naga, Chennai",
    website: "https://glamdesk.com",
    currency: "INR",
    currencySymbol: "₹",
    defaultAdvancePercent: 40,
  },
  payment: {
    upiId: "glamdesk@okhdfcbank",
    payeeName: "GlamDesk",
    bankName: "HDFC Bank",
    accountName: "GlamDesk Pvt Ltd",
    accountNumber: "50200084920193",
    ifscCode: "HDFC0001234",
    branchName: "Jubilee Hills Branch",
    qrMode: "dynamic", // "dynamic" | "custom"
    customQrImage: "", // Base64 data URL or external URL
    paymentInstructions:
      "Please transfer the advance payment to lock your date & bridal stylist slot. Kindly share the transaction screenshot once completed.",
  },
  quotation: {
    header: "",
    greeting:
      "Dear *{clientName}*,\n\nThank you for choosing {businessName}! Here is the quotation for your upcoming booking:",
    showBookingId: false,
    showServiceDetails: true,
    showDateTime: true,
    showVenue: true,
    showInvestmentBreakdown: false,
    showPaymentDetails: false,
    quoteNote:
      "📄 *Please find your official quotation PDF attached* with complete service scope, investment breakdown, and advance payment instructions.",
    customNotes:
      "Kindly review the attached quote and transfer the advance deposit to confirm your slot.",
    footer: "Warm regards,\n*Team {businessName}*",
    useCustomTemplate: false,
    rawTemplate: `Dear *{clientName}*,

Thank you for choosing {businessName}! Here is the quotation for your upcoming booking:

💄 *Appointment:* {serviceName}
📅 *Date & Time:* {eventDate} at {eventTime}
📍 *Venue:* {venueName}

📄 *Please find your official quotation PDF attached* with complete service scope, package breakdown, and advance payment instructions.

_Kindly review the attached quote and transfer the advance deposit of ₹{advanceAmount} to confirm your slot._

Warm regards,
*{businessName}*`,
  },
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      // 1. Try v2 settings
      const savedV2 = localStorage.getItem("glamdesk_atelier_settings_v2");
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        return {
          salon: { ...defaultSettings.salon, ...(parsed.salon || {}) },
          payment: { ...defaultSettings.payment, ...(parsed.payment || {}) },
          quotation: { ...defaultSettings.quotation, ...(parsed.quotation || {}) },
        };
      }
      // 2. Migrate from v1 if present, adopting new concise quotation defaults
      const savedV1 = localStorage.getItem("glamdesk_atelier_settings_v1");
      if (savedV1) {
        const parsed = JSON.parse(savedV1);
        return {
          salon: { ...defaultSettings.salon, ...(parsed.salon || {}) },
          payment: { ...defaultSettings.payment, ...(parsed.payment || {}) },
          quotation: {
            ...defaultSettings.quotation,
            ...(parsed.quotation?.useCustomTemplate
              ? { rawTemplate: parsed.quotation.rawTemplate, useCustomTemplate: true }
              : {}),
          },
        };
      }
    } catch (e) {
      console.warn("Failed to load settings from localStorage:", e);
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("Failed to persist settings to localStorage:", e);
    }
  }, [settings]);

  // Update a whole section or individual keys
  const updateSection = (section, values) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...values,
      },
    }));
  };

  // Reset entire settings to defaults
  const resetToDefaults = () => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear settings from localStorage:", e);
    }
  };

  /**
   * Helper to format date nicely
   */
  const formatEventDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const parts = dateStr.split("-");
      if (parts.length !== 3) return dateStr;
      const [y, m, d] = parts;
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1] || m} ${y}`;
    } catch {
      return dateStr;
    }
  };

  /**
   * Dynamic Quotation Message Generator based on configured Settings
   */
  const generateQuotationMessage = (appointment) => {
    if (!appointment) return "";

    const totalAmount = Number(appointment.totalAmount) || 0;
    const advanceAmount =
      Number(appointment.advanceRequired) ||
      Math.round(totalAmount * ((settings.salon.defaultAdvancePercent || 40) / 100)) ||
      2000;
    const balanceDue =
      appointment.balanceDue !== undefined
        ? Number(appointment.balanceDue)
        : Math.max(0, totalAmount - (Number(appointment.advancePaid) || 0));

    const dateFormatted = formatEventDate(appointment.eventDate || appointment.date);
    const venueDelta = Number(appointment.venueDelta) || 0;
    const travelFee = Number(appointment.travelFee) || 0;
    const packageAmount =
      (Number(appointment.baseAmount) || 0) + venueDelta || total;

    const travelFeeText =
      travelFee > 0 ? `• Outstation Travel & Transit: +₹${travelFee.toLocaleString("en-IN")}\n` : "";

    const vars = {
      clientName: appointment.clientName || "Valued Client",
      code: appointment.code || "APT-000",
      serviceName: appointment.serviceName || "Bridal Service",
      serviceCategory: appointment.serviceCategory || "Hair & Makeup",
      eventDate: dateFormatted,
      eventTime: appointment.eventTime || appointment.timeSlot || "10:00 AM",
      duration: appointment.duration ? `${Math.round(appointment.duration / 60)} hrs` : "",
      venueName: appointment.venueName || "GlamDesk Studio",
      venueType: appointment.venueType || "Studio",
      baseAmount: packageAmount.toLocaleString("en-IN"),
      packageAmount: packageAmount.toLocaleString("en-IN"),
      totalAmount: totalAmount.toLocaleString("en-IN"),
      advanceAmount: advanceAmount.toLocaleString("en-IN"),
      balanceDue: balanceDue.toLocaleString("en-IN"),
      venueDeltaText: "", // Kept empty so venue surcharges are never leaked
      travelFeeText,
      upiId: settings.payment.upiId || "glamdesk@okhdfcbank",
      payeeName: settings.payment.payeeName || "GlamDesk",
      bankName: settings.payment.bankName || "HDFC Bank",
      accountName: settings.payment.accountName || "GlamDesk",
      accountNumber: settings.payment.accountNumber || "50200084920193",
      ifscCode: settings.payment.ifscCode || "HDFC0001234",
      branchName: settings.payment.branchName || "Jubilee Hills",
      businessName: settings.salon.businessName || "GlamDesk",
      businessPhone: settings.salon.phone || "+91 98765 43210",
      customNotes: (settings.quotation.customNotes || "").replace(
        /\{advanceAmount\}/g,
        advanceAmount.toLocaleString("en-IN")
      ),
    };

    // If using raw customized template
    if (settings.quotation.useCustomTemplate && settings.quotation.rawTemplate) {
      let result = settings.quotation.rawTemplate;
      Object.keys(vars).forEach((key) => {
        result = result.replace(new RegExp(`\\{${key}\\}`, "g"), vars[key]);
      });
      return result;
    }

    // Structured Modular Builder
    const q = settings.quotation;
    const parts = [];

    // Header (optional)
    if (q.header && q.header.trim()) {
      let header = q.header;
      Object.keys(vars).forEach((key) => {
        header = header.replace(new RegExp(`\\{${key}\\}`, "g"), vars[key]);
      });
      parts.push(header);
      parts.push("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }

    // Greeting
    let greeting = q.greeting || "Dear *{clientName}*,";
    Object.keys(vars).forEach((key) => {
      greeting = greeting.replace(new RegExp(`\\{${key}\\}`, "g"), vars[key]);
    });
    parts.push(greeting);
    parts.push("");

    // Details Block (Appointment, Date/Time, Venue)
    const details = [];
    if (q.showBookingId) details.push(`📋 *Booking ID:* #${vars.code}`);
    if (q.showServiceDetails)
      details.push(`💄 *Appointment:* ${vars.serviceName}${vars.serviceCategory ? ` (${vars.serviceCategory})` : ""}`);
    if (q.showDateTime)
      details.push(
        `📅 *Date & Time:* ${vars.eventDate} at ${vars.eventTime}${
          vars.duration ? ` (${vars.duration})` : ""
        }`
      );
    if (q.showVenue) details.push(`📍 *Venue:* ${vars.venueName}`);

    if (details.length > 0) {
      parts.push(details.join("\n"));
      parts.push("");
    }

    // Quote PDF Notice
    if (q.quoteNote && q.quoteNote.trim()) {
      let note = q.quoteNote;
      Object.keys(vars).forEach((key) => {
        note = note.replace(new RegExp(`\\{${key}\\}`, "g"), vars[key]);
      });
      parts.push(note);
      parts.push("");
    }

    // Investment Breakdown (Only if enabled in settings)
    if (q.showInvestmentBreakdown) {
      parts.push("💵 *INVESTMENT BREAKDOWN*");
      parts.push(`• Service Package: ₹${vars.packageAmount}`);
      if (travelFeeText) parts.push(travelFeeText.trim());
      parts.push("━━━━━━━━━━━━━━━━━━━━━━━━━━");
      parts.push(`💰 *TOTAL QUOTATION:* ₹${vars.totalAmount}`);
      parts.push(`💳 *ADVANCE REQUIRED:* ₹${vars.advanceAmount}`);
      parts.push(`⏳ *BALANCE AT EVENT:* ₹${vars.balanceDue}`);
      parts.push("━━━━━━━━━━━━━━━━━━━━━━━━━━");
      parts.push("");
    }

    // Payment Methods (UPI Only - Never expose private bank accounts)
    if (q.showPaymentDetails) {
      parts.push("📲 *ADVANCE DEPOSIT & UPI PAYMENT*");
      parts.push(`• *Advance Required:* ₹${vars.advanceAmount}`);
      parts.push(`• *UPI ID / VPA:* ${vars.upiId}`);
      parts.push("_Scan QR code on the attached quote or use UPI ID to pay._");
      parts.push("");
    }

    // Custom Terms / Notes
    if (vars.customNotes) {
      parts.push(`_${vars.customNotes}_`);
      parts.push("");
    }

    // Footer
    if (q.footer) {
      let footer = q.footer;
      Object.keys(vars).forEach((key) => {
        footer = footer.replace(new RegExp(`\\{${key}\\}`, "g"), vars[key]);
      });
      parts.push(footer);
    }

    return parts.join("\n");
  };

  /**
   * Helper to construct UPI payment URI and live QR image URL
   */
  const getUpiPaymentUrl = (amount = 0, bookingCode = "") => {
    const upiId = settings.payment.upiId || "glamdesk@okhdfcbank";
    const payeeName = settings.payment.payeeName || "GlamDesk";
    const numAmount = Number(amount) || 0;
    const note = bookingCode ? `Booking_${bookingCode}` : "GlamDesk_Payment";

    // Standard NPCI UPI URI
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      payeeName
    )}${numAmount > 0 ? `&am=${numAmount.toFixed(2)}` : ""}&cu=INR&tn=${encodeURIComponent(
      note
    )}`;

    // Quick QR generation endpoint (renders instantly in browser without external dependencies)
    const qrImageUrl =
      settings.payment.qrMode === "custom" && settings.payment.customQrImage
        ? settings.payment.customQrImage
        : `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
            upiUri
          )}`;

    return {
      upiUri,
      qrImageUrl,
      upiId,
      payeeName,
      isCustom: settings.payment.qrMode === "custom" && Boolean(settings.payment.customQrImage),
    };
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSection,
        resetToDefaults,
        generateQuotationMessage,
        getUpiPaymentUrl,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
