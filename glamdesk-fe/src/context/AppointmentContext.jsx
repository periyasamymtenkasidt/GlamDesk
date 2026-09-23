import { createContext, useContext, useState, useEffect } from "react";
import { initialAppointments } from "../data/appointmentData";

const AppointmentContext = createContext(null);

const STORAGE_KEY = "glamdesk_appointments_data";

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to load appointments from localStorage:", e);
    }
    return initialAppointments;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    } catch (e) {
      console.warn("Failed to persist appointments to localStorage:", e);
    }
  }, [appointments]);

  const getAppointmentById = (id) => {
    if (!id) return null;
    return (
      appointments.find(
        (apt) =>
          String(apt.id).toLowerCase() === String(id).toLowerCase() ||
          String(apt.code).toLowerCase() === String(id).toLowerCase()
      ) || null
    );
  };

  const addAppointment = (newApt) => {
    const code = `APT-${Math.floor(Math.random() * 900 + 4100)}`;
    const created = {
      ...newApt,
      id: newApt.id || `apt-${Date.now()}`,
      code: newApt.code || code,
      createdAt: newApt.createdAt || Date.now(),
    };
    setAppointments((prev) => [created, ...prev]);
    return created;
  };

  const updateAppointment = (id, updatedData) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        String(apt.id) === String(id) || String(apt.code) === String(id)
          ? { ...apt, ...updatedData }
          : apt
      )
    );
  };

  const updateStatus = (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        String(apt.id) === String(id) || String(apt.code) === String(id)
          ? { ...apt, status: newStatus }
          : apt
      )
    );
  };

  const deleteAppointment = (id) => {
    setAppointments((prev) =>
      prev.filter(
        (apt) =>
          String(apt.id) !== String(id) && String(apt.code) !== String(id)
      )
    );
  };

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        getAppointmentById,
        addAppointment,
        updateAppointment,
        updateStatus,
        deleteAppointment,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error(
      "useAppointments must be used within an AppointmentProvider"
    );
  }
  return context;
};

export default AppointmentContext;
