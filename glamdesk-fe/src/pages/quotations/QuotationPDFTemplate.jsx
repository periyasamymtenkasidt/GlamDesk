import { forwardRef } from "react";
import { getConsolidatedClientItems } from "../../data/quotationData";

/**
 * QuotationPDFTemplate — Ultra-Premium Bridal Quotation Proposal Document
 * Tailored for GlamDesk Atelier commercial quotations.
 * Aesthetic: High-fashion luxury bridal dossier — clean services with pricing, total amount,
 * payment milestone schedule, and instant UPI payment QR code.
 */
const QuotationPDFTemplate = forwardRef(
  (
    {
      quote,
      settings,
      documentId = "printable-quote-template",
    },
    ref
  ) => {
    if (!quote) return null;

    const salon = settings?.salon || {
      name: "GlamDesk Atelier",
      tagline: "Haute Couture Bridal Artistry & Bespoke Styling",
      phone: "+91 98401 12345",
      email: "concierge@glamdesk.atelier",
      address: "14 Cathedral Road, Poes Garden, Chennai 600086",
      gst: "33AABCU9603R1ZM",
    };

    const payment = settings?.payment || {
      upiId: "glamdesk@okhdfcbank",
      payeeName: "GlamDesk Atelier LLP",
      bankName: "HDFC Bank",
      accountName: "GlamDesk Atelier LLP",
      accountNumber: "50200084729102",
      ifscCode: "HDFC0001234",
    };

    const clientItems = getConsolidatedClientItems(quote);
    const total = Number(quote.totalAmount) || 0;
    const advance = Number(quote.advanceRequired) || Math.round(total * 0.4);
    const balance = Math.max(0, total - advance);

    const issueDate = quote.sentAt
      ? new Date(quote.sentAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

    const formatEventDate = (dateStr) => {
      if (!dateStr) return "Date to be confirmed";
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

    const formatValidityDate = (dateStr) => {
      if (!dateStr) return "5 Days from issue";
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      } catch {
        return dateStr;
      }
    };

    // Official UPI Payment Intent String
    const upiString = `upi://pay?pa=${payment.upiId}&pn=${encodeURIComponent(
      salon.name || "GlamDesk Atelier"
    )}&am=${advance}&cu=INR&tn=${encodeURIComponent(
      "GlamDesk Advance " + quote.code
    )}`;

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      upiString
    )}&margin=1`;

    return (
      <div
        id={documentId}
        ref={ref}
        className="w-full max-w-[210mm] min-h-[297mm] mx-auto box-border bg-[#ffffff] text-[#1c1b18] font-sans text-[11px] leading-[1.5] p-10 sm:p-12 relative overflow-hidden select-text print:p-8 print:shadow-none print:m-0"
        style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        {/* ═══ Top Triple Gradient Haute Couture Gold Bar ═══ */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#8c6239] via-[#d4af37] via-[#f3e5ab] via-[#d4af37] to-[#8c6239]" />

        {/* ═══ ATELIER BRAND HEADER ═══ */}
        <div className="flex justify-between items-start pb-6 border-b border-[#e3ded4]">
          {/* Left: Atelier Crest & Brand Identity */}
          <div className="flex items-start gap-4">
            {/* Atelier Gold Seal Emblem */}
            <div className="w-13 h-13 rounded-full border-2 border-[#b88e4f] bg-[#faf7f2] flex flex-col items-center justify-center text-center shadow-xs shrink-0 mt-0.5">
              <span className="font-serif font-extrabold text-[15px] tracking-wider text-[#9b783e] leading-none">
                GD
              </span>
              <span className="text-[7px] font-bold text-[#b88e4f] tracking-widest uppercase mt-0.5">
                Atelier
              </span>
            </div>

            <div>
              <h1 className="text-[24px] font-black tracking-[1.5px] text-[#1a1917] m-0 leading-tight uppercase font-serif">
                {salon.name || "GlamDesk Atelier"}
              </h1>
              <p className="text-[9.5px] font-bold text-[#9b783e] tracking-[2.5px] uppercase mt-1">
                {salon.tagline || "Haute Couture Bridal Artistry & Bespoke Styling"}
              </p>
              <p className="text-[9px] text-[#6e6a63] mt-2 leading-[1.6] max-w-[300px]">
                {salon.address}
                <br />
                {salon.phone} &nbsp;·&nbsp; {salon.email}
                {salon.gst && (
                  <>
                    <br />
                    <span className="text-[8.5px] font-semibold text-[#8c6239]">
                      GSTIN: {salon.gst}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right: Proposal Identification */}
          <div className="text-right">
            <div className="inline-block px-3.5 py-1 border border-[#b88e4f] bg-[#faf7f2] text-[#9b783e] text-[9.5px] font-bold tracking-[2.5px] uppercase rounded-sm">
              Quotation Proposal
            </div>
            <p className="text-xl font-mono font-bold text-[#1a1917] mt-2 tracking-[0.5px]">
              #{quote.code} {quote.revision > 1 ? `· Rev v${quote.revision}` : ""}
            </p>
            <div className="mt-2 text-[9px] text-[#6e6a63] leading-[1.7]">
              <span>
                Date of Issue: <strong className="text-[#1a1917] font-semibold">{issueDate}</strong>
              </span>
              <br />
              <span className="text-amber-900 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 inline-block mt-0.5">
                Valid Until: <strong>{formatValidityDate(quote.validUntil)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* ═══ CLIENT & EVENT CEREMONY DOSSIER ═══ */}
        <div className="flex my-5 bg-[#faf7f2] border border-[#e3ded4] rounded-xl overflow-hidden shadow-2xs">
          {/* Client Dossier */}
          <div className="flex-1 p-4 border-r border-[#e3ded4]">
            <p className="text-[8.5px] font-bold tracking-[2px] uppercase text-[#9b783e] mb-1">
              Prepared For
            </p>
            <p className="text-[15px] font-bold text-[#1a1917] font-serif">{quote.clientName}</p>
            <p className="text-[10px] text-[#5c5852] mt-1 leading-[1.5]">
              {quote.clientPhone}
              {quote.clientEmail && (
                <>
                  <br />
                  {quote.clientEmail}
                </>
              )}
            </p>
          </div>

          {/* Ceremony & Itinerary */}
          <div className="flex-1 p-4">
            <p className="text-[8.5px] font-bold tracking-[2px] uppercase text-[#9b783e] mb-1">
              Ceremony & Event Details
            </p>
            <p className="text-[13px] font-bold text-[#1a1917] font-serif">{quote.serviceName}</p>
            <p className="text-[10px] text-[#5c5852] mt-1 leading-[1.5]">
              <strong>Event Date:</strong> {formatEventDate(quote.eventDate)}
              <br />
              <strong>Venue Location:</strong> {quote.venueName || "Studio Atelier / On-Location"}
            </p>
          </div>
        </div>

        {/* ═══ SERVICES & PRICING TABLE ═══ */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[9px] font-bold tracking-[2px] uppercase text-[#9b783e]">
              Services & Pricing Breakdown
            </p>
            <span className="text-[8.5px] font-medium text-[#7a7670]">
              Official Atelier Rate Card
            </span>
          </div>

          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#faf7f2] border-y border-[#e3ded4] text-[9px] uppercase tracking-[1.5px] text-[#6e6a63]">
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3">Service Description</th>
                <th className="py-2.5 px-3 w-20 text-center">Qty</th>
                <th className="py-2.5 px-3 w-32 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece8e0] text-[10.5px]">
              {clientItems.map((it, idx) => (
                <tr key={idx} className="hover:bg-[#faf7f2]/50">
                  <td className="py-3 px-3 text-center text-[#8a867f] font-mono text-[10px]">
                    0{idx + 1}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-[#1a1917] block text-[11px]">
                      {it.description}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-[#5c5852] font-medium">
                    {it.qty || 1}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#1a1917]">
                    ₹{(Number(it.amount) || 0).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══ COMMERCIAL TOTALS & PAYMENT SCHEDULE ═══ */}
        <div className="flex justify-end mb-5">
          <div className="w-80 space-y-1.5 text-xs">
            <div className="flex justify-between py-1 text-[#6e6a63]">
              <span>Subtotal:</span>
              <span className="font-mono text-[#1a1917]">
                ₹{(quote.subtotal || quote.totalAmount).toLocaleString("en-IN")}
              </span>
            </div>

            {quote.discountAmount > 0 && (
              <div className="flex justify-between py-1 text-rose-700">
                <span>Discount ({quote.discountNotes || "Applied"}):</span>
                <span className="font-mono font-bold">-₹{Number(quote.discountAmount).toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="flex justify-between py-2 border-t-2 border-[#1a1917] text-sm font-bold text-[#1a1917]">
              <span>Total Amount:</span>
              <span className="font-mono text-[17px] text-[#9b783e]">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Advance & Balance Schedule */}
            <div className="bg-[#faf7f2] border border-[#b88e4f]/40 p-3 rounded-lg text-[11px] space-y-1.5 shadow-2xs">
              <div className="flex justify-between font-bold text-amber-950 text-xs">
                <span>💳 Booking Advance (40% to lock date):</span>
                <span className="font-mono text-[#9b783e] text-[13px]">
                  ₹{advance.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-[#6e6a63] text-[10px] pt-0.5 border-t border-[#e3ded4]">
                <span>Balance Due on Event Day (60%):</span>
                <span className="font-mono font-semibold text-[#1a1917]">
                  ₹{balance.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ INSTANT UPI PAYMENT QR CODE & BANK TRANSFER DETAILS ═══ */}
        <div className="bg-[#faf7f2] border border-[#b88e4f]/50 rounded-xl p-4.5 mb-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#e3ded4] pb-2.5 mb-3.5">
            <div>
              <p className="text-[9px] font-bold tracking-[2px] uppercase text-[#9b783e]">
                Instant Payment & Date-Lock Deposit
              </p>
              <p className="text-[9.5px] text-[#6e6a63] mt-0.5">
                Scan the dynamic UPI QR code below with any UPI application to instantly pay the booking advance.
              </p>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#b88e4f]/15 text-[#8c6239] border border-[#b88e4f]/30">
              Advance: ₹{advance.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Left: Dynamic Live UPI QR Code */}
            <div className="col-span-4 bg-white p-2.5 rounded-lg border border-[#e3ded4] text-center shadow-xs flex flex-col items-center justify-center">
              <img
                src={qrCodeUrl}
                alt="UPI Deposit QR Code"
                className="w-28 h-28 rounded border border-[#ece8e0]"
                crossOrigin="anonymous"
              />
              <p className="text-[8.5px] font-bold text-[#1a1917] mt-1.5 uppercase tracking-wider">
                Scan to Pay ₹{advance.toLocaleString("en-IN")}
              </p>
              <p className="text-[7.5px] text-[#7a7670] mt-0.5">
                GPay · PhonePe · Paytm · BHIM
              </p>
            </div>

            {/* Right: Electronic Banking Details & Booking Guarantee */}
            <div className="col-span-8 space-y-2 text-[10px]">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-white rounded border border-[#e3ded4]">
                  <p className="text-[8px] font-bold uppercase tracking-[1px] text-[#9b783e]">
                    Direct UPI ID
                  </p>
                  <p className="font-mono font-bold text-[#1a1917] text-[11px] mt-0.5">
                    {payment.upiId}
                  </p>
                  <p className="text-[8px] text-[#7a7670] mt-0.5">
                    Payee: {payment.payeeName}
                  </p>
                </div>

                <div className="p-2 bg-white rounded border border-[#e3ded4]">
                  <p className="text-[8px] font-bold uppercase tracking-[1px] text-[#9b783e]">
                    Bank Wire Transfer
                  </p>
                  <p className="font-medium text-[#1a1917] text-[10px] mt-0.5">
                    {payment.bankName} · {payment.accountName}
                  </p>
                  <p className="font-mono text-[9px] text-[#5c5852] mt-0.5">
                    A/C: {payment.accountNumber} · IFSC: {payment.ifscCode}
                  </p>
                </div>
              </div>

              <div className="p-2 bg-[#f3efe6]/70 rounded border border-[#e3ded4] text-[9px] text-[#6e6a63] leading-[1.5]">
                🔒 <strong>Booking Confirmation:</strong> Transferring the 40% date-lock advance deposit confirms your booking and reserves artist availability on our atelier calendar.
              </div>
            </div>
          </div>
        </div>

        {/* ═══ ATELIER TERMS & SIGN-OFF ═══ */}
        <div className="grid grid-cols-12 gap-4 border-t border-[#e3ded4] pt-3.5 text-[8.5px] text-[#6e6a63] leading-[1.6]">
          <div className="col-span-8 space-y-1">
            <p className="font-bold uppercase tracking-[1.5px] text-[#9b783e]">
              Commercial Terms & Conditions:
            </p>
            <ul className="list-disc pl-3.5 space-y-0.5">
              <li>
                The 40% advance deposit confirms your booking and locks artist availability on your wedding date.
              </li>
              <li>
                This quotation is valid until <strong>{formatValidityDate(quote.validUntil)}</strong>.
              </li>
              <li>
                Remaining 60% balance is payable on the event day prior to session completion.
              </li>
              <li>
                All premium cosmetics used are genuine, dermatologically certified, hypoallergenic international brands.
              </li>
            </ul>
          </div>

          <div className="col-span-4 text-right flex flex-col justify-end items-end">
            <div className="border-b border-[#1a1917] w-36 mb-1 pb-1">
              <span className="font-serif italic text-xs text-[#9b783e] block">
                GlamDesk Concierge
              </span>
            </div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-[#1a1917]">
              Authorized Atelier Signatory
            </p>
            <p className="text-[7.5px] text-[#8a867f]">
              GlamDesk Atelier Private Limited
            </p>
          </div>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div className="mt-4 text-center border-t border-[#f0eee8] pt-2 text-[8px] text-[#8a867f] uppercase tracking-[1.5px]">
          GlamDesk Atelier · 14 Cathedral Road, Chennai · {salon.email} · {salon.phone}
        </div>
      </div>
    );
  }
);

QuotationPDFTemplate.displayName = "QuotationPDFTemplate";

export default QuotationPDFTemplate;
