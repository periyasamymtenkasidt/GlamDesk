import { createContext, useContext, useState, useEffect } from "react";
import { initialVendors, vendorRolesList } from "../data/vendorData";

const VendorContext = createContext(null);

const STORAGE_KEY = "glamdesk_vendors_data";
const STORAGE_ROLES_KEY = "glamdesk_vendor_roles_v1";

const defaultInitialRoles = vendorRolesList.filter((r) => r !== "All");

export const VendorProvider = ({ children }) => {
  const [vendors, setVendors] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to load vendors from localStorage:", e);
    }
    return initialVendors;
  });

  const [roles, setRoles] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ROLES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load vendor roles from localStorage:", e);
    }
    return defaultInitialRoles;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
    } catch (e) {
      console.warn("Failed to persist vendors to localStorage:", e);
    }
  }, [vendors]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ROLES_KEY, JSON.stringify(roles));
    } catch (e) {
      console.warn("Failed to persist vendor roles to localStorage:", e);
    }
  }, [roles]);

  const addRole = (newRoleName) => {
    const trimmed = (newRoleName || "").trim();
    if (!trimmed) return null;
    if (roles.some((r) => r.toLowerCase() === trimmed.toLowerCase())) {
      alert("A role with this name already exists.");
      return trimmed;
    }
    setRoles((prev) => [trimmed, ...prev]);
    return trimmed;
  };

  const renameRole = (oldName, newName) => {
    if (!newName.trim() || oldName === newName) return;
    const trimmed = newName.trim();
    if (
      roles.some(
        (r) => r.toLowerCase() === trimmed.toLowerCase() && r !== oldName
      )
    ) {
      alert("A role with this name already exists.");
      return;
    }
    setRoles((prev) => prev.map((r) => (r === oldName ? trimmed : r)));
    // Cascade update to all vendors who have this role
    setVendors((prev) =>
      prev.map((v) => (v.role === oldName ? { ...v, role: trimmed } : v))
    );
  };

  const deleteRole = (roleName, reassignTarget = null) => {
    if (reassignTarget) {
      setVendors((prev) =>
        prev.map((v) =>
          v.role === roleName ? { ...v, role: reassignTarget } : v
        )
      );
    }
    setRoles((prev) => prev.filter((r) => r !== roleName));
  };

  const getVendorById = (id) => {
    return vendors.find((v) => String(v.id) === String(id)) || null;
  };

  const addVendor = (vendorData) => {
    const roleFirstChar = (vendorData.role || "V").charAt(0).toUpperCase();
    const code = `${roleFirstChar}-${Math.floor(
      Math.random() * 900 + 100
    )}`;
    const newVendor = {
      ...vendorData,
      id: `vnd-${Date.now()}`,
      code: vendorData.code || code,
      createdAt: vendorData.createdAt || Date.now(),
      specializations: Array.isArray(vendorData.specializations)
        ? vendorData.specializations
        : [],
      rating: 5.0,
      completedEvents: 0,
      blackouts: vendorData.blackouts || [],
      isActive: vendorData.isActive !== undefined ? vendorData.isActive : true,
    };
    setVendors((prev) => [newVendor, ...prev]);
    return newVendor;
  };

  const updateVendor = (id, updatedData) => {
    setVendors((prev) =>
      prev.map((v) =>
        String(v.id) === String(id)
          ? {
              ...v,
              ...updatedData,
              specializations:
                updatedData.specializations !== undefined
                  ? updatedData.specializations
                  : v.specializations,
            }
          : v
      )
    );
  };

  const deleteVendor = (id) => {
    setVendors((prev) => prev.filter((v) => String(v.id) !== String(id)));
  };

  const toggleActive = (id) => {
    setVendors((prev) =>
      prev.map((v) =>
        String(v.id) === String(id) ? { ...v, isActive: !v.isActive } : v
      )
    );
  };

  const addBlackout = (vendorId, slot) => {
    const slotWithId = {
      id: slot.id || `bo-${Date.now()}`,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      reason: slot.reason || "Scheduled assignment / conflict",
    };
    setVendors((prev) =>
      prev.map((v) =>
        String(v.id) === String(vendorId)
          ? { ...v, blackouts: [...(v.blackouts || []), slotWithId] }
          : v
      )
    );
  };

  const removeBlackout = (vendorId, slotId) => {
    setVendors((prev) =>
      prev.map((v) =>
        String(v.id) === String(vendorId)
          ? {
              ...v,
              blackouts: (v.blackouts || []).filter(
                (b) => String(b.id) !== String(slotId)
              ),
            }
          : v
      )
    );
  };

  return (
    <VendorContext.Provider
      value={{
        vendors,
        roles,
        addRole,
        renameRole,
        deleteRole,
        getVendorById,
        addVendor,
        updateVendor,
        deleteVendor,
        toggleActive,
        addBlackout,
        removeBlackout,
      }}
    >
      {children}
    </VendorContext.Provider>
  );
};

export const useVendors = () => {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error("useVendors must be used within a VendorProvider");
  }
  return context;
};

export default VendorContext;
