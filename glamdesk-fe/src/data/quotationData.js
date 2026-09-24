// ─── Quotations Seed Data ──────────────────────────────────────────────────
// Manages commercial quotes, line items, revisions, pricing negotiation,
// validity timeouts, and automated conversion upon advance payment.

export const quotationStatuses = [
  "All",
  "Draft",
  "Sent",
  "Under Revision",
  "Won",
  "Lost",
  "Expired",
];

export const lossReasons = [
  "Budget / Price too high",
  "Selected another artist / studio",
  "Event cancelled / Postponed",
  "Date / Slot unavailable",
  "No response / Timed out",
  "Venue changed out of city",
];

// Helper to compute date relative to today
const getDateOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

/**
 * Checks if a line item description belongs to internal pricing/costs
 * (e.g. travel, venue surcharge, setup, logistics, outstation fees).
 * These must be hidden from client quotes and rolled into the makeup service price.
 */
export const isInternalPricingDesc = (desc) => {
  if (!desc || typeof desc !== "string") return false;
  const d = desc.toLowerCase().trim();
  if (
    d.includes("travel") ||
    d.includes("logistics") ||
    d.includes("surcharge") ||
    d.includes("setup") ||
    d.includes("outstation") ||
    d.includes("vendor cost") ||
    d.includes("vendor fee") ||
    d.includes("internal pricing")
  ) {
    return true;
  }
  if (
    d.includes("venue") &&
    (d.includes("fee") || d.includes("charge") || d.includes("cost") || d.includes("pricing") || d.includes("delta"))
  ) {
    return true;
  }
  return false;
};

/**
 * Strips internal pricing items completely and rolls any internal costs
 * (service cost + venue pricing cost + vendor cost) into the primary client makeup service.
 */
export const getConsolidatedClientItems = (quote) => {
  if (!quote) return [];
  const rawItems =
    quote.items && quote.items.length > 0
      ? quote.items
      : [
          {
            id: "item-base",
            description: quote.serviceName || "Bridal Makeup Artistry",
            amount: quote.totalAmount || 0,
            qty: 1,
          },
        ];

  const clientItems = [];
  let internalCostsSum = 0;

  for (const it of rawItems) {
    if (isInternalPricingDesc(it.description)) {
      internalCostsSum += (Number(it.amount) || 0) * (Number(it.qty) || 1);
    } else {
      clientItems.push({ ...it });
    }
  }

  // If internal costs were stripped, roll them into the primary service item
  if (clientItems.length > 0) {
    if (internalCostsSum > 0) {
      clientItems[0] = {
        ...clientItems[0],
        amount: (Number(clientItems[0].amount) || 0) + internalCostsSum,
      };
    }
    return clientItems;
  }

  // Fallback: single consolidated service item with full amount
  return [
    {
      id: "item-1",
      description: quote.serviceName || "Bridal Makeup Artistry",
      amount: Number(quote.subtotal || quote.totalAmount || internalCostsSum || 0),
      qty: 1,
    },
  ];
};

export const initialQuotations = [
  {
    id: "qt-100",
    code: "QT-4820",
    appointmentId: "apt-100",
    appointmentCode: "APT-4820",
    clientName: "Meenakshi",
    clientPhone: "+91 98410 55667",
    clientEmail: "meenakshi.chennai@gmail.com",
    serviceName: "Bridal Muhurtham & Reception Glam",
    serviceCategory: "Bridal & Luxury",
    eventDate: "2026-11-04",
    venueName: "ITC Grand Chola, Chennai",
    // All-inclusive final amount: service cost (₹16,000) + venue pricing (₹6,000) + vendor/logistics (₹1,000) = ₹23,000
    items: [
      { id: "item-1", description: "Bridal Muhurtham & Reception Makeup (HD)", amount: 23000, qty: 1 },
    ],
    subtotal: 23000,
    discountAmount: 0,
    discountNotes: "",
    totalAmount: 23000,
    advanceRequired: 9200, // 40%
    advancePaid: 0,
    status: "Sent",
    revision: 1,
    validUntil: getDateOffset(5), // 5 days from now
    sentAt: new Date().toISOString(),
    notes: "Newly issued quotation for upcoming wedding. Valid for 5 days.",
    lossReason: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "qt-101",
    code: "QT-4821",
    appointmentId: "apt-101",
    appointmentCode: "APT-4821",
    clientName: "Priya",
    clientPhone: "+91 98401 11223",
    clientEmail: "priya.mua@gmail.com",
    serviceName: "Royal HD Bridal Makeup",
    serviceCategory: "Bridal & Luxury",
    eventDate: "2026-10-24",
    venueName: "Grand Convention Center, Chennai",
    // All-inclusive: service (₹14,000) + mandapam venue surcharge (₹7,500) + travel (₹1,000) = ₹22,500
    items: [
      { id: "item-1", description: "Royal HD Bridal Makeup Artistry", amount: 22500, qty: 1 },
    ],
    subtotal: 22500,
    discountAmount: 0,
    discountNotes: "",
    totalAmount: 22500,
    advanceRequired: 9000,
    advancePaid: 9000,
    status: "Won",
    revision: 1,
    validUntil: "2026-10-20",
    sentAt: "2026-09-18T10:00:00.000Z",
    notes: "Quote approved by bride. Advance received via UPI.",
    lossReason: null,
    createdAt: "2026-09-18T09:30:00.000Z",
  },
  {
    id: "qt-102",
    code: "QT-4822",
    appointmentId: "apt-102",
    appointmentCode: "APT-4822",
    clientName: "Kavitha",
    clientPhone: "+91 99620 44556",
    clientEmail: "kavitha94@gmail.com",
    serviceName: "Signature Engagement & Sagan Glam",
    serviceCategory: "Bridal & Luxury",
    eventDate: "2026-10-26",
    venueName: "Leela Palace, Chennai",
    // All-inclusive makeup service (including venue setup & hair styling) = ₹14,750
    items: [
      { id: "item-1", description: "Signature Engagement & Sagan Glam", amount: 14750, qty: 1 },
    ],
    subtotal: 14750,
    discountAmount: 0,
    discountNotes: "",
    totalAmount: 14750,
    advanceRequired: 5900,
    advancePaid: 5900,
    status: "Won",
    revision: 1,
    validUntil: "2026-10-15",
    sentAt: "2026-09-20T11:00:00.000Z",
    notes: "Quote confirmed. Client in Client Master.",
    lossReason: null,
    createdAt: "2026-09-20T10:30:00.000Z",
  },
  {
    id: "qt-103",
    code: "QT-4823",
    appointmentId: "apt-103",
    appointmentCode: "APT-4823",
    clientName: "Abirami",
    clientPhone: "+91 97890 12345",
    clientEmail: "abirami.sundar@gmail.com",
    serviceName: "Celebrity Red Carpet Glam",
    serviceCategory: "Editorial & Glam",
    eventDate: "2026-10-28",
    venueName: "Taj Coromandel, Chennai",
    // All-inclusive makeup makeover = ₹19,000
    items: [
      { id: "item-1", description: "Celebrity Red Carpet Makeover", amount: 19000, qty: 1 },
    ],
    subtotal: 19000,
    discountAmount: 0,
    discountNotes: "",
    totalAmount: 19000,
    advanceRequired: 7600,
    advancePaid: 7600,
    status: "Won",
    revision: 1,
    validUntil: "2026-10-20",
    sentAt: "2026-09-19T08:00:00.000Z",
    notes: "Direct booking confirmed with deposit.",
    lossReason: null,
    createdAt: "2026-09-19T07:30:00.000Z",
  },
  {
    id: "qt-104",
    code: "QT-4825",
    appointmentId: null,
    appointmentCode: "INQ-9021",
    clientName: "Soundarya",
    clientPhone: "+91 94450 33211",
    clientEmail: "soundarya.bride@gmail.com",
    serviceName: "Traditional South Indian Muhurtham",
    serviceCategory: "Bridal & Luxury",
    eventDate: "2026-11-12",
    venueName: "Mayor Ramanathan Hall, Chennai",
    // All-inclusive makeup service (with venue travel & jasmine draping) = ₹19,000 - ₹1,000 disc = ₹18,000
    items: [
      { id: "item-1", description: "Traditional South Indian Muhurtham Makeup", amount: 16000, qty: 1 },
      { id: "item-2", description: "Saree Draping & Fresh Jasmine Styling", amount: 3000, qty: 1 },
    ],
    subtotal: 19000,
    discountAmount: 1000,
    discountNotes: "Client requested festive courtesy discount",
    totalAmount: 18000,
    advanceRequired: 7200,
    advancePaid: 0,
    status: "Under Revision",
    revision: 2,
    validUntil: getDateOffset(3), // 3 days remaining
    sentAt: new Date().toISOString(),
    notes: "Revision 2 sent after client requested ₹1,000 discount on saree draping package.",
    lossReason: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "qt-105",
    code: "QT-4818",
    appointmentId: null,
    appointmentCode: "INQ-8812",
    clientName: "Swathi",
    clientPhone: "+91 98840 99887",
    clientEmail: "swathi.nair@gmail.com",
    serviceName: "Bridal Trial & Engagement Package",
    serviceCategory: "Bridal & Luxury",
    eventDate: "2026-10-18",
    venueName: "Feathers Hotel, Chennai",
    items: [
      { id: "item-1", description: "Bridal Trial Session", amount: 5000, qty: 1 },
      { id: "item-2", description: "Engagement Ceremony Glam", amount: 10000, qty: 1 },
    ],
    subtotal: 15000,
    discountAmount: 0,
    discountNotes: "",
    totalAmount: 15000,
    advanceRequired: 6000,
    advancePaid: 0,
    status: "Lost",
    revision: 1,
    validUntil: "2026-09-20",
    sentAt: "2026-09-12T10:00:00.000Z",
    notes: "Quotation rejected. Slot released.",
    lossReason: "Budget / Price too high",
    createdAt: "2026-09-12T09:30:00.000Z",
  },
];
