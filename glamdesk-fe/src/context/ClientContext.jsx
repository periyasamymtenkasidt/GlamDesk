import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { initialClients } from "../data/clientData";
import { clientsApi } from "../services/clientsApi";

const ClientContext = createContext(null);

const STORAGE_KEY = "glamdesk_clients_data_v1";

export const ClientProvider = ({ children }) => {
  const [clients, setClients] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load clients from localStorage:", e);
    }
    return initialClients;
  });

  // Save to localStorage whenever clients change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    } catch (e) {
      console.warn("Failed to persist clients to localStorage:", e);
    }
  }, [clients]);

  // Sync with Backend /api/clients on mount
  useEffect(() => {
    let isMounted = true;
    const syncBackendClients = async () => {
      try {
        const backendClients = await clientsApi.getAll();
        if (!isMounted) return;
        if (Array.isArray(backendClients) && backendClients.length > 0) {
          setClients(backendClients);
        } else {
          // If backend is empty, seed it with the default confirmed clients
          for (const client of initialClients) {
            try {
              await clientsApi.create(client);
            } catch (err) {
              // ignore duplicate seed errors
            }
          }
        }
      } catch (err) {
        console.warn("Backend clients sync offline, using local state:", err.message);
      }
    };

    syncBackendClients();
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Helper to normalize a phone number into its last 10 digits
   */
  const normalizePhone = (phone) => {
    if (!phone) return "";
    return String(phone).replace(/[^0-9]/g, "").slice(-10);
  };

  /**
   * Core Workflow: Convert an appointment into an official active client
   * Called when an appointment status reaches 'Confirmed' or advance payment is recorded.
   */
  const convertAppointmentToClient = useCallback((appointment) => {
    if (!appointment || !appointment.clientName) return null;

    const phoneDigits = normalizePhone(appointment.clientPhone);
    const emailLower = (appointment.clientEmail || "").toLowerCase().trim();
    const numAmount = Number(appointment.totalAmount) || 0;
    const isBridal =
      (appointment.serviceCategory || "").toLowerCase().includes("bridal") ||
      (appointment.serviceName || "").toLowerCase().includes("bridal");

    let resultClient = null;
    let isNew = false;

    setClients((prev) => {
      // 1. Search for existing client by phone or email
      const existingIndex = prev.findIndex((c) => {
        const cPhone = c.cleanPhone || normalizePhone(c.phone);
        if (phoneDigits && cPhone && phoneDigits === cPhone) return true;
        if (emailLower && c.email && c.email.toLowerCase().trim() === emailLower) return true;
        return false;
      });

      const appointmentItem = {
        appointmentId: String(appointment.id || ""),
        code: String(appointment.code || ""),
        serviceName: String(appointment.serviceName || "Bridal Makeup"),
        eventDate: String(appointment.eventDate || ""),
        totalAmount: numAmount,
      };

      if (existingIndex >= 0) {
        // ─── Existing Client: Update Stats & Link Appointment ─────────────
        const existing = prev[existingIndex];
        const existingAppointments = existing.linkedAppointments || [];
        const alreadyLinked = existingAppointments.some(
          (apt) =>
            apt.appointmentId === String(appointment.id) ||
            apt.code === String(appointment.code)
        );

        const updatedAppointments = alreadyLinked
          ? existingAppointments
          : [appointmentItem, ...existingAppointments];

        const updatedTotalSpent = updatedAppointments.reduce(
          (sum, a) => sum + (Number(a.totalAmount) || 0),
          0
        );

        const updated = {
          ...existing,
          status: "Active", // Ensure client is active
          category: isBridal && existing.category !== "VIP" ? "Bridal" : existing.category,
          totalBookings: updatedAppointments.length,
          totalSpent: updatedTotalSpent,
          lastVisit:
            appointment.eventDate && (!existing.lastVisit || appointment.eventDate >= existing.lastVisit)
              ? appointment.eventDate
              : existing.lastVisit,
          linkedAppointments: updatedAppointments,
          email: existing.email || appointment.clientEmail || "",
        };

        resultClient = updated;
        isNew = false;

        const updatedList = [...prev];
        updatedList[existingIndex] = updated;
        return updatedList;
      } else {
        // ─── New Client: Create Official Record ───────────────────────────
        const codeNum = Math.floor(1000 + Math.random() * 9000);
        const newClient = {
          id: `cli-${Date.now()}`,
          code: `CLI-${codeNum}`,
          name: appointment.clientName.trim(),
          phone: appointment.clientPhone?.trim() || "",
          cleanPhone: phoneDigits,
          email: (appointment.clientEmail || "").trim(),
          city: appointment.city || "Chennai",
          category: isBridal ? "Bridal" : "Regular",
          status: "Active",
          totalBookings: 1,
          totalSpent: numAmount,
          lastVisit: appointment.eventDate || new Date().toISOString().split("T")[0],
          notes: `Converted automatically upon confirmation of booking ${appointment.code || ""}.`,
          source: "Appointment Conversion",
          linkedAppointments: [appointmentItem],
          createdAt: new Date().toISOString(),
        };

        resultClient = newClient;
        isNew = true;
        return [newClient, ...prev];
      }
    });

    // Asynchronously notify backend
    clientsApi
      .upsertFromAppointment({
        appointmentId: appointment.id,
        code: appointment.code,
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone,
        clientEmail: appointment.clientEmail,
        serviceName: appointment.serviceName,
        serviceCategory: appointment.serviceCategory,
        eventDate: appointment.eventDate,
        totalAmount: appointment.totalAmount,
        city: appointment.city || "Chennai",
      })
      .catch((err) => {
        console.warn("Backend client upsert offline, cached locally:", err.message);
      });

    return { client: resultClient, isNew };
  }, []);

  const addClient = async (clientData) => {
    const codeNum = Math.floor(1000 + Math.random() * 9000);
    const newClient = {
      ...clientData,
      id: clientData.id || `cli-${Date.now()}`,
      code: clientData.code || `CLI-${codeNum}`,
      cleanPhone: normalizePhone(clientData.phone),
      status: clientData.status || "Active",
      totalBookings: Number(clientData.totalBookings) || 0,
      totalSpent: Number(clientData.totalSpent) || 0,
      source: "Manual Entry",
      linkedAppointments: clientData.linkedAppointments || [],
      createdAt: clientData.createdAt || new Date().toISOString(),
    };

    setClients((prev) => [newClient, ...prev]);

    try {
      const created = await clientsApi.create(newClient);
      if (created) {
        setClients((prev) =>
          prev.map((c) => (c.id === newClient.id ? { ...c, ...created, id: created._id || c.id } : c))
        );
      }
    } catch (e) {
      console.warn("Backend create client failed, saved locally:", e.message);
    }

    return newClient;
  };

  const updateClient = async (id, updatedData) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === id || c._id === id
          ? {
              ...c,
              ...updatedData,
              cleanPhone: updatedData.phone ? normalizePhone(updatedData.phone) : c.cleanPhone,
            }
          : c
      )
    );

    try {
      await clientsApi.update(id, updatedData);
    } catch (e) {
      console.warn("Backend update client failed, saved locally:", e.message);
    }
  };

  const deleteClient = async (id) => {
    setClients((prev) => prev.filter((c) => c.id !== id && c._id !== id));

    try {
      await clientsApi.delete(id);
    } catch (e) {
      console.warn("Backend delete client failed, saved locally:", e.message);
    }
  };

  const getClientById = (id) => {
    if (!id) return null;
    const target = String(id).toLowerCase().trim();
    return (
      clients.find(
        (c) =>
          (c.id && String(c.id).toLowerCase() === target) ||
          (c._id && String(c._id).toLowerCase() === target) ||
          (c.code && String(c.code).toLowerCase() === target) ||
          (c.code && String(c.code).toLowerCase().replace(/[^a-z0-9]/g, "") === target.replace(/[^a-z0-9]/g, ""))
      ) || null
    );
  };

  const getClientByPhone = (phone) => {
    const digits = normalizePhone(phone);
    if (!digits) return null;
    return clients.find((c) => (c.cleanPhone || normalizePhone(c.phone)) === digits) || null;
  };

  const resetToDefaults = () => {
    setClients(initialClients);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialClients));
    } catch (e) {}
  };

  return (
    <ClientContext.Provider
      value={{
        clients,
        convertAppointmentToClient,
        addClient,
        updateClient,
        deleteClient,
        getClientById,
        getClientByPhone,
        resetToDefaults,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useClients = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useClients must be used within a ClientProvider");
  }
  return context;
};
