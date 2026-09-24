import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { initialQuotations, getConsolidatedClientItems } from "../data/quotationData";
import { useAppointments } from "./AppointmentContext";
import { useClients } from "./ClientContext";

const QuotationContext = createContext(null);

const STORAGE_KEY = "glamdesk_quotations_data_v2";

export const QuotationProvider = ({ children }) => {
  const { appointments, updateAppointment, updateStatus } = useAppointments();
  const { convertAppointmentToClient } = useClients();

  const [quotations, setQuotations] = useState(() => {
    try {
      // Check v2 first, then check v1 for auto-migration
      const savedV2 = localStorage.getItem(STORAGE_KEY);
      const savedV1 = localStorage.getItem("glamdesk_quotations_data_v1");
      const saved = savedV2 || savedV1;

      if (savedV1 && !savedV2) {
        try {
          localStorage.removeItem("glamdesk_quotations_data_v1");
        } catch {}
      }

      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((q) => {
            const cleanItems = getConsolidatedClientItems(q);
            return {
              ...q,
              items: cleanItems,
            };
          });
        }
      }
    } catch (e) {
      console.warn("Failed to load quotations from localStorage:", e);
    }
    return initialQuotations;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotations));
    } catch (e) {
      console.warn("Failed to persist quotations to localStorage:", e);
    }
  }, [quotations]);

  // Automated check for expired quotations
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setQuotations((prev) =>
      prev.map((q) => {
        if (
          q.status === "Sent" &&
          q.validUntil &&
          q.validUntil < today
        ) {
          // Auto flag as Expired
          return {
            ...q,
            status: "Expired",
            lossReason: "Quote validity period expired without response",
          };
        }
        return q;
      })
    );
  }, []);

  const getQuotationById = useCallback(
    (id) => {
      if (!id) return null;
      const target = String(id).toLowerCase().trim();
      return (
        quotations.find(
          (q) =>
            (q.id && String(q.id).toLowerCase() === target) ||
            (q.code && String(q.code).toLowerCase() === target)
        ) || null
      );
    },
    [quotations]
  );

  const getQuotationByAppointmentId = useCallback(
    (aptId) => {
      if (!aptId) return null;
      const target = String(aptId).toLowerCase().trim();
      return (
        quotations.find(
          (q) =>
            (q.appointmentId && String(q.appointmentId).toLowerCase() === target) ||
            (q.appointmentCode && String(q.appointmentCode).toLowerCase() === target)
        ) || null
      );
    },
    [quotations]
  );

  const createQuotation = (data) => {
    const codeNum = Math.floor(1000 + Math.random() * 9000);
    const consolidatedItems = getConsolidatedClientItems(data);
    const subtotal = consolidatedItems.reduce(
      (sum, item) => sum + (Number(item.amount) || 0) * (Number(item.qty) || 1),
      0
    );
    const discount = Number(data.discountAmount) || 0;
    const totalAmount = Math.max(0, subtotal - discount);
    const advanceRequired = Math.round(totalAmount * 0.4); // Standard 40% deposit

    // 5 days validity default
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 5);

    const newQuote = {
      id: `qt-${Date.now()}`,
      code: `QT-${codeNum}`,
      appointmentId: data.appointmentId || null,
      appointmentCode: data.appointmentCode || null,
      clientName: (data.clientName || "").trim(),
      clientPhone: (data.clientPhone || "").trim(),
      clientEmail: (data.clientEmail || "").trim(),
      serviceName: data.serviceName || "Bridal Service",
      serviceCategory: data.serviceCategory || "Bridal & Luxury",
      eventDate: data.eventDate || "",
      venueName: data.venueName || "Studio / Client Venue",
      items: consolidatedItems,
      subtotal,
      discountAmount: discount,
      discountNotes: data.discountNotes || "",
      totalAmount,
      advanceRequired,
      advancePaid: 0,
      status: data.status || "Draft",
      revision: 1,
      validUntil: data.validUntil || validUntilDate.toISOString().split("T")[0],
      sentAt: data.status === "Sent" ? new Date().toISOString() : null,
      notes: data.notes || "Commercial quote prepared for client.",
      lossReason: null,
      createdAt: new Date().toISOString(),
    };

    setQuotations((prev) => [newQuote, ...prev]);

    // If an appointment was linked, keep it in sync
    if (newQuote.appointmentId && newQuote.status === "Sent") {
      updateStatus(newQuote.appointmentId, "Quote Sent");
    }

    return newQuote;
  };

  const updateQuotation = (id, updatedData) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === id || q.code === id) {
          const merged = { ...q, ...updatedData };
          const consolidatedItems = updatedData.items
            ? getConsolidatedClientItems(merged)
            : q.items;
          const subtotal = consolidatedItems.reduce(
            (sum, item) => sum + (Number(item.amount) || 0) * (Number(item.qty) || 1),
            0
          );
          const discount =
            updatedData.discountAmount !== undefined
              ? Number(updatedData.discountAmount) || 0
              : q.discountAmount;
          const totalAmount = Math.max(0, subtotal - discount);
          const advanceRequired = Math.round(totalAmount * 0.4);

          return {
            ...merged,
            items: consolidatedItems,
            subtotal,
            discountAmount: discount,
            totalAmount,
            advanceRequired,
          };
        }
        return q;
      })
    );
  };

  /**
   * Revisions: Client requested changes to services, pricing, or discounts.
   * Increments the revision counter (v2, v3...), updates pricing, and sets status to Under Revision.
   */
  const reviseQuotation = (id, { items, discountAmount, discountNotes, notes }) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === id || q.code === id) {
          const consolidatedItems = getConsolidatedClientItems({ ...q, items });
          const subtotal = consolidatedItems.reduce(
            (sum, item) => sum + (Number(item.amount) || 0) * (Number(item.qty) || 1),
            0
          );
          const discount = Number(discountAmount) || 0;
          const totalAmount = Math.max(0, subtotal - discount);
          const advanceRequired = Math.round(totalAmount * 0.4);

          return {
            ...q,
            items: consolidatedItems,
            subtotal,
            discountAmount: discount,
            discountNotes: discountNotes || q.discountNotes,
            totalAmount,
            advanceRequired,
            revision: (q.revision || 1) + 1,
            status: "Under Revision",
            notes: notes || `Revision ${(q.revision || 1) + 1} updated per client discussion.`,
          };
        }
        return q;
      })
    );
  };

  /**
   * Send Quote to Client (via WhatsApp or Email)
   */
  const sendQuotation = (id, method = "whatsapp") => {
    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + 5);

    let targetQuote = null;

    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === id || q.code === id) {
          const updated = {
            ...q,
            status: "Sent",
            sentAt: new Date().toISOString(),
            validUntil: q.validUntil || expiry.toISOString().split("T")[0],
          };
          targetQuote = updated;
          return updated;
        }
        return q;
      })
    );

    // Sync appointment status to "Quote Sent"
    if (targetQuote?.appointmentId) {
      updateStatus(targetQuote.appointmentId, "Quote Sent");
    }
  };

  /**
   * The "Won" Trigger: Client approved quote & paid advance deposit.
   * 1. Marks Quote as "Won"
   * 2. Marks Appointment as "Confirmed"
   * 3. Records advance payment & balance due
   * 4. Auto-converts Lead into official Client in ClientContext!
   */
  const markQuotationWon = (id, { advancePaid, paymentMethod, paymentRef } = {}) => {
    let targetQuote = null;

    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === id || q.code === id) {
          const adv = advancePaid !== undefined ? Number(advancePaid) : q.advanceRequired;
          const updated = {
            ...q,
            status: "Won",
            advancePaid: adv,
            paymentMethod: paymentMethod || "UPI",
            paymentRef: paymentRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
            wonAt: new Date().toISOString(),
          };
          targetQuote = updated;
          return updated;
        }
        return q;
      })
    );

    if (targetQuote && targetQuote.appointmentId) {
      const adv = advancePaid !== undefined ? Number(advancePaid) : targetQuote.advanceRequired;
      const bal = Math.max(0, targetQuote.totalAmount - adv);

      // 1. Update appointment to Confirmed with payment
      updateAppointment(targetQuote.appointmentId, {
        status: "Confirmed",
        totalAmount: targetQuote.totalAmount,
        advancePaid: adv,
        balanceDue: bal,
        paymentStatus: bal === 0 ? "Paid in Full" : "Advance Paid",
      });

      // 2. Fetch the updated appointment object and convert to official Client
      const linkedApt = appointments.find(
        (a) =>
          String(a.id) === String(targetQuote.appointmentId) ||
          String(a.code) === String(targetQuote.appointmentCode)
      );

      if (linkedApt && convertAppointmentToClient) {
        convertAppointmentToClient({
          ...linkedApt,
          totalAmount: targetQuote.totalAmount,
          advancePaid: adv,
          balanceDue: bal,
          status: "Confirmed",
        });
      }
    }
  };

  /**
   * The "Lost" Trigger: Client declined quote or timeout expired.
   * 1. Marks Quote as "Lost"
   * 2. Updates linked Appointment to "Rejected" (freeing artist calendar slot)
   * 3. No client created.
   */
  const markQuotationLost = (id, reason) => {
    let targetQuote = null;

    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === id || q.code === id) {
          const updated = {
            ...q,
            status: "Lost",
            lossReason: reason || "Declined by client",
            lostAt: new Date().toISOString(),
          };
          targetQuote = updated;
          return updated;
        }
        return q;
      })
    );

    if (targetQuote && targetQuote.appointmentId) {
      updateStatus(targetQuote.appointmentId, "Rejected");
    }
  };

  const deleteQuotation = (id) => {
    setQuotations((prev) => prev.filter((q) => q.id !== id && q.code !== id));
  };

  return (
    <QuotationContext.Provider
      value={{
        quotations,
        getQuotationById,
        getQuotationByAppointmentId,
        createQuotation,
        updateQuotation,
        reviseQuotation,
        sendQuotation,
        markQuotationWon,
        markQuotationLost,
        deleteQuotation,
      }}
    >
      {children}
    </QuotationContext.Provider>
  );
};

export const useQuotations = () => {
  const context = useContext(QuotationContext);
  if (!context) {
    throw new Error("useQuotations must be used within a QuotationProvider");
  }
  return context;
};

export default QuotationContext;
