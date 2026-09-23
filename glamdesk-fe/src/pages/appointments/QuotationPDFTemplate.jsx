import { forwardRef } from "react";

/**
 * QuotationPDFTemplate — Premium A4 Quotation Document
 * Built entirely with Tailwind CSS utility classes.
 * Aesthetic: High-fashion invoice — minimalist, authoritative, generous whitespace.
 */
const QuotationPDFTemplate = forwardRef(
  (
    {
      appointment,
      settings,
      advanceAmount,
      balanceDue,
      upiDetails,
      documentId = "printable-quote-template",
    },
    ref
  ) => {
    if (!appointment) return null;

    const salon = settings?.salon || {
      name: "GlamDesk",
      tagline: "Luxury Bridal Artistry & Couture Styling",
      phone: "+91 98401 12345",
      email: "concierge@glamdesk.atelier",
      address: "14 Cathedral Road, Poes Garden, Chennai 600086",
      gst: "33AABCU9603R1ZM",
    };

    const payment = settings?.payment || {
      upiId: "glamdesk@okhdfcbank",
      payeeName: "GlamDesk LLP",
      bankName: "HDFC Bank",
      accountName: "GlamDesk LLP",
      accountNumber: "50200084729102",
      ifscCode: "HDFC0001234",
    };

    const total = Number(appointment.totalAmount) || 0;
    const advance = Number(advanceAmount) || 0;
    const balance = Math.max(0, total - advance);

    const todayDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const formatEventDate = (dateStr) => {
      if (!dateStr) return "";
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      } catch {
        return dateStr;
      }
    };

    // Calculate unified package amount (baking venue rate into service package price)
    const travelFee = Number(appointment.travelFee) || 0;
    const packageAmount =
      (Number(appointment.baseAmount) || 0) + (Number(appointment.venueDelta) || 0) ||
      (total - travelFee) ||
      total;

    // Build client-facing line items (no internal venue surcharges or vendor splits)
    const lineItems = [];
    lineItems.push({
      description: appointment.serviceName,
      detail: appointment.venueName
        ? `${appointment.serviceCategory || "Bridal & Luxury"} · Service at ${appointment.venueName}`
        : appointment.serviceCategory || "Bridal & Luxury",
      amount: packageAmount,
    });

    if (travelFee > 0) {
      lineItems.push({
        description: "Outstation Transit & Travel Allowance",
        detail: "Logistics",
        amount: travelFee,
      });
    }

    return (
      <div
        id={documentId}
        ref={ref}
        className="w-full max-w-[210mm] min-h-[297mm] mx-auto box-border bg-white text-[#1a1a1a] font-sans text-[11px] leading-[1.5] p-10 sm:p-11 relative overflow-hidden select-text"
      >
        {/* ═══ Decorative top gold accent bar ═══ */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#a67c52] via-[#c9a96e] to-[#a67c52]" />

        {/* ═══ HEADER ═══ */}
        <div className="flex justify-between items-start pb-6 border-b border-[#e0dcd5]">
          {/* Left: Brand Identity */}
          <div>
            <h1 className="text-[26px] font-extrabold font-outfit tracking-[-0.5px] text-[#1a1a1a] m-0 leading-tight uppercase">
              {salon.name || "GlamDesk"}
            </h1>
            <p className="text-[10px] font-semibold text-[#a67c52] tracking-[2.5px] uppercase mt-1.5">
              {salon.tagline || "Luxury Bridal Artistry & Couture Styling"}
            </p>
            <p className="text-[9.5px] text-[#7a7a7a] mt-2.5 leading-[1.6] max-w-[260px]">
              {salon.address}
              <br />
              {salon.phone} &nbsp;·&nbsp; {salon.email}
              {salon.gst && (
                <>
                  <br />
                  <span className="text-[9px] tracking-[0.3px]">
                    GSTIN: {salon.gst}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Right: Document Metadata */}
          <div className="text-right">
            <div className="inline-block px-4 py-1 border-[1.5px] border-[#a67c52] text-[#a67c52] text-[11px] font-bold tracking-[3px] uppercase">
              Quotation
            </div>
            <p className="text-lg font-mono font-bold text-[#1a1a1a] mt-2.5 tracking-[0.5px]">
              #{appointment.code}
            </p>
            <div className="mt-2 text-[9.5px] text-[#7a7a7a] leading-[1.8]">
              <span>
                Date: <strong className="text-[#1a1a1a] font-semibold">{todayDate}</strong>
              </span>
              <br />
              <span>
                Valid for <strong className="text-[#1a1a1a] font-semibold">7 days</strong>
              </span>
            </div>
          </div>
        </div>

        {/* ═══ CLIENT & EVENT DETAILS ═══ */}
        <div className="flex my-7 bg-[#faf8f4] border border-[#e0dcd5]">
          {/* Client */}
          <div className="flex-1 p-[18px_22px] border-r border-[#e0dcd5]">
            <p className="text-[8.5px] font-bold tracking-[2.5px] uppercase text-[#a67c52] mb-2.5">
              Prepared For
            </p>
            <p className="text-sm font-bold font-outfit text-[#1a1a1a] mb-1">
              {appointment.clientName}
            </p>
            <p className="text-[10.5px] text-[#3d3d3d] m-0">
              {appointment.clientPhone}
            </p>
            {appointment.clientEmail && (
              <p className="text-[10px] text-[#7a7a7a] mt-0.5">
                {appointment.clientEmail}
              </p>
            )}
          </div>

          {/* Event */}
          <div className="flex-1 p-[18px_22px]">
            <p className="text-[8.5px] font-bold tracking-[2.5px] uppercase text-[#a67c52] mb-2.5">
              Event Details
            </p>
            <p className="text-[11.5px] font-semibold text-[#1a1a1a] mb-0.5">
              {formatEventDate(appointment.eventDate)}
            </p>
            <p className="text-[10.5px] text-[#3d3d3d] mb-0.5">
              {appointment.eventTime}
              {appointment.duration ? ` · ${appointment.duration} mins` : ""}
            </p>
            <p className="text-[10.5px] text-[#3d3d3d] mb-0.5">
              {appointment.venueName}
              {appointment.venueType ? ` (${appointment.venueType})` : ""}
            </p>
            {appointment.assignedVendorName && (
              <p className="text-[10px] text-[#7a7a7a] mt-0.5">
                Lead Artist: {appointment.assignedVendorName}
              </p>
            )}
          </div>
        </div>

        {/* ═══ SERVICES TABLE ═══ */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr>
              <th className="text-left py-2.5 border-b-2 border-[#1a1a1a] text-[8.5px] font-bold tracking-[2px] uppercase text-[#1a1a1a] w-[8%]">
                No.
              </th>
              <th className="text-left py-2.5 border-b-2 border-[#1a1a1a] text-[8.5px] font-bold tracking-[2px] uppercase text-[#1a1a1a]">
                Service Description
              </th>
              <th className="text-left py-2.5 border-b-2 border-[#1a1a1a] text-[8.5px] font-bold tracking-[2px] uppercase text-[#1a1a1a] w-[22%]">
                Category
              </th>
              <th className="text-right py-2.5 border-b-2 border-[#1a1a1a] text-[8.5px] font-bold tracking-[2px] uppercase text-[#1a1a1a] w-[18%]">
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => (
              <tr key={idx}>
                <td className="py-3.5 border-b border-[#e0dcd5] text-[10px] font-mono text-[#7a7a7a] align-top">
                  {String(idx + 1).padStart(2, "0")}
                </td>
                <td className="py-3.5 pr-3 border-b border-[#e0dcd5] align-top">
                  <span className="block text-xs font-semibold text-[#1a1a1a]">
                    {item.description}
                  </span>
                </td>
                <td className="py-3.5 border-b border-[#e0dcd5] text-[10.5px] text-[#7a7a7a] align-top">
                  {item.detail}
                </td>
                <td className="py-3.5 border-b border-[#e0dcd5] text-right text-xs font-semibold font-outfit text-[#1a1a1a] align-top">
                  ₹{item.amount.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ═══ TOTAL QUOTE AMOUNT CARD (Reference Design) ═══ */}
        <div className="bg-[#ba8c59] rounded-2xl p-[16px_24px] mb-3 shadow-[0_2px_8px_rgba(186,140,89,0.12)]">
          <p className="text-[9.5px] font-bold tracking-[1.8px] uppercase text-white/90 mb-1.5">
            TOTAL QUOTE AMOUNT
          </p>
          <p className="text-[26px] font-extrabold font-outfit text-white m-0 leading-none tracking-[-0.5px]">
            Rs. {total.toLocaleString("en-IN")}
          </p>
        </div>

        {/* ═══ ADVANCE DEPOSIT & UPI PAYMENT CARD (Reference Design) ═══ */}
        <div className="bg-[#fcf9f5] border-[1.5px] border-[#ba8c59] rounded-2xl p-[16px_22px] mb-6 flex justify-between items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[9.5px] font-bold tracking-[1.6px] uppercase text-[#ba8c59] mb-2">
              ADVANCE DEPOSIT &amp; UPI PAYMENT
            </p>

            <p className="text-[13.5px] font-bold text-[#1a1a1a] mb-1">
              Advance Required ({total > 0 ? Math.round((advance / total) * 100) : 40}%):{" "}
              <span className="font-extrabold">Rs. {advance.toLocaleString("en-IN")}</span>
            </p>

            <p className="text-[12.5px] font-bold text-[#ba8c59] mb-2">
              UPI ID / VPA:{" "}
              <span className="font-mono text-[#1a1a1a]">
                {payment.upiId}
              </span>
            </p>

            <p className="text-[9.5px] text-[#78716c] m-0 leading-[1.4]">
              Scan QR code or use UPI ID to pay advance deposit &amp; confirm slot.
            </p>
          </div>

          {/* Right: Clean White QR Code Box */}
          {upiDetails?.qrImageUrl && (
            <div className="p-1.5 bg-white rounded-xl border border-[#e7e0d6] shadow-[0_2px_6px_rgba(0,0,0,0.04)] shrink-0">
              <img
                src={upiDetails.qrImageUrl}
                alt="UPI Payment QR"
                className="w-[84px] h-[84px] block object-contain"
                crossOrigin="anonymous"
              />
            </div>
          )}
        </div>

        {/* ═══ TERMS & CONDITIONS ═══ */}
        <div className="p-[16px_20px] bg-[#faf8f4] border border-[#e0dcd5] mb-8">
          <p className="text-[8.5px] font-bold tracking-[2.5px] uppercase text-[#a67c52] mb-2">
            Terms &amp; Conditions
          </p>
          <div className="text-[9.5px] text-[#7a7a7a] leading-[1.7] space-y-0.5">
            <p className="m-0">
              1. Booking is confirmed only upon receipt of the advance payment.
            </p>
            <p className="m-0">
              2. Balance of Rs. {balance.toLocaleString("en-IN")} is payable on
              the event date before commencement of services.
            </p>
            <p className="m-0">
              3. Advance is non-refundable in case of cancellation by the client.
            </p>
            <p className="m-0">
              4. Please notify at least 48 hours prior for any schedule modifications.
            </p>
          </div>
        </div>

        {/* ═══ SIGNATURES ═══ */}
        <div className="flex justify-between items-end pt-5 border-t border-[#e0dcd5]">
          <div>
            <div className="w-[150px] border-b border-[#7a7a7a] mb-1.5 h-8" />
            <p className="text-[9px] text-[#7a7a7a] m-0 font-medium">
              Client Signature
            </p>
          </div>

          <div className="text-right">
            <div className="w-[150px] border-b border-[#7a7a7a] mb-1.5 ml-auto h-8" />
            <p className="text-[9px] text-[#7a7a7a] m-0 font-medium">
              For {salon.name || "GlamDesk"}
            </p>
          </div>
        </div>

        {/* ═══ Bottom gold accent bar ═══ */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#a67c52] via-[#c9a96e] to-[#a67c52]" />
      </div>
    );
  }
);

QuotationPDFTemplate.displayName = "QuotationPDFTemplate";

export default QuotationPDFTemplate;
