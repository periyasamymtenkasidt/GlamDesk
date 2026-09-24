import { createContext, useContext, useState, useEffect } from "react";
import { initialVendors, vendorRolesList } from "../data/vendorData";
import { vendorsApi } from "../services/mastersApi";

const VendorContext = createContext(null);

const STORAGE_KEY = "glamdesk_vendors_data";
const STORAGE_ROLES_KEY = "glamdesk_vendor_roles_v1";

const defaultInitialRoles = vendorRolesList.filter((r) => r !== "All");

// Normalizer to ensure both MongoDB Atlas schema and frontend components interoperate cleanly
const normalizeVendor = (v) => {
  if (!v) return null;
  const baseRate = Number(v.baseEventRate ?? v.defaultPayout ?? 2000);
  const extraRate = Number(v.perExtraHeadRate ?? 0);
  const travelRate = Number(v.travelSurcharge ?? 0);
  const rawId = v._id || v.id || `vnd-${Date.now()}`;
  const code = v.code || `VND-${String(rawId).slice(-4).toUpperCase()}`;

  const blackoutsList = Array.isArray(v.blackouts)
    ? v.blackouts
    : Array.isArray(v.availability)
      ? v.availability.map((a, i) => ({
          id: `bo-${i}`,
          date: a.date,
          reason: a.reason || a.status || "Leave",
        }))
      : [];

  const specs = Array.isArray(v.specializations) && v.specializations.length > 0
    ? v.specializations
    : Array.isArray(v.tags) && v.tags.length > 0
      ? v.tags
      : [];

  return {
    ...v,
    id: rawId,
    _id: rawId,
    code,
    name: v.name || "Vendor",
    role: v.role || "Specialist",
    phone: v.phone || "",
    email: v.email || "",
    city: v.city || v.address || "Chennai",
    address: v.address || v.city || "Chennai, Tamil Nadu",
    experience: v.experience || "3+ years",
    payoutType: v.payoutType || "Per Event",
    baseEventRate: baseRate,
    defaultPayout: baseRate,
    perExtraHeadRate: extraRate,
    travelSurcharge: travelRate,
    rating: Number(v.rating ?? 4.9),
    completedEvents: Number(v.completedEvents ?? 0),
    isActive: v.isActive !== undefined ? Boolean(v.isActive) : true,
    specializations: specs,
    tags: specs,
    blackouts: blackoutsList,
    availability: v.availability || [],
    upiId: v.upiId || v.bankDetails?.upiId || "",
    bankName: v.bankName || v.bankDetails?.bankName || "",
    accountNumber: v.accountNumber || v.bankDetails?.accountNumber || "",
    ifsc: v.ifsc || v.bankDetails?.ifscCode || "",
    notes: v.notes || "",
  };
};

export const VendorProvider = ({ children }) => {
  const [vendors, setVendors] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeVendor).filter(Boolean);
        }
      }
    } catch (e) {
      console.warn("Failed to load vendors from localStorage:", e);
    }
    return initialVendors.map(normalizeVendor);
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

  const [isLoading, setIsLoading] = useState(true);

  // Sync live vendors & roles from backend on mount
  useEffect(() => {
    let isMounted = true;

    const loadLiveVendors = async () => {
      try {
        const [backendVendors, backendRoles] = await Promise.allSettled([
          vendorsApi.getAll(),
          vendorsApi.getRoles(),
        ]);

        if (!isMounted) return;

        if (
          backendVendors.status === "fulfilled" &&
          Array.isArray(backendVendors.value) &&
          backendVendors.value.length > 0
        ) {
          const normalized = backendVendors.value.map(normalizeVendor);
          setVendors(normalized);
        }

        if (
          backendRoles.status === "fulfilled" &&
          Array.isArray(backendRoles.value) &&
          backendRoles.value.length > 0
        ) {
          const roleNames = backendRoles.value.map((r) => r.name || r);
          setRoles(roleNames);
        }
      } catch (err) {
        console.warn("Failed to connect to backend vendors API, using local state:", err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadLiveVendors();

    return () => {
      isMounted = false;
    };
  }, []);

  // Offline cache persistence
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

  const addRole = async (newRoleName) => {
    const trimmed = (newRoleName || "").trim();
    if (!trimmed) return null;
    if (roles.some((r) => r.toLowerCase() === trimmed.toLowerCase())) {
      alert("A role with this name already exists.");
      return trimmed;
    }
    setRoles((prev) => [trimmed, ...prev]);

    try {
      await vendorsApi.createRole({ name: trimmed });
    } catch (e) {
      console.warn("Failed to save role to backend:", e.message);
    }
    return trimmed;
  };

  const renameRole = async (oldName, newName) => {
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
    setVendors((prev) =>
      prev.map((v) => (v.role === oldName ? { ...v, role: trimmed } : v))
    );

    try {
      await vendorsApi.updateRole(oldName, { name: trimmed });
    } catch (e) {
      console.warn("Backend update vendor role failed:", e.message);
    }
  };

  const deleteRole = async (roleName, reassignTarget = null) => {
    if (reassignTarget) {
      setVendors((prev) =>
        prev.map((v) =>
          v.role === roleName ? { ...v, role: reassignTarget } : v
        )
      );
    }
    setRoles((prev) => prev.filter((r) => r !== roleName));

    try {
      await vendorsApi.deleteRole(roleName);
    } catch (e) {
      console.warn("Backend delete vendor role failed:", e.message);
    }
  };

  const getVendorById = (id) => {
    return (
      vendors.find(
        (v) =>
          String(v.id) === String(id) ||
          String(v._id) === String(id) ||
          String(v.code).toLowerCase() === String(id).toLowerCase()
      ) || null
    );
  };

  const addVendor = async (vendorData) => {
    try {
      const payload = {
        name: vendorData.name,
        role: vendorData.role,
        phone: vendorData.phone,
        email: vendorData.email || "",
        experience: vendorData.experience || "3+ years",
        payoutType: vendorData.payoutType || "Per Event",
        defaultPayout: Number(vendorData.baseEventRate ?? vendorData.defaultPayout) || 2000,
        rating: Number(vendorData.rating) || 4.8,
        tags: vendorData.specializations || vendorData.tags || [],
        address: vendorData.address || "Chennai, Tamil Nadu",
        notes: vendorData.notes || "",
        bankDetails: vendorData.bankDetails || {},
      };

      const created = await vendorsApi.create(payload);
      const normalized = normalizeVendor(created);
      setVendors((prev) => [normalized, ...prev.filter((v) => v.id !== normalized.id)]);
      return normalized;
    } catch (e) {
      console.warn("Backend create vendor failed, falling back to local:", e.message);
      const roleFirstChar = (vendorData.role || "V").charAt(0).toUpperCase();
      const code = `${roleFirstChar}-${Math.floor(Math.random() * 900 + 100)}`;
      const newVendor = {
        ...vendorData,
        id: `vnd-${Date.now()}`,
        code: vendorData.code || code,
        createdAt: Date.now(),
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
    }
  };

  const updateVendor = async (id, updatedData) => {
    setVendors((prev) =>
      prev.map((v) =>
        String(v.id) === String(id) || String(v._id) === String(id)
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

    try {
      const payload = {
        ...updatedData,
        ...(updatedData.specializations && { tags: updatedData.specializations }),
      };
      await vendorsApi.update(id, payload);
    } catch (e) {
      console.warn("Backend update vendor failed, updated locally:", e.message);
    }
  };

  const deleteVendor = async (id) => {
    setVendors((prev) =>
      prev.filter((v) => String(v.id) !== String(id) && String(v._id) !== String(id))
    );
    try {
      await vendorsApi.delete(id);
    } catch (e) {
      console.warn("Backend delete vendor failed, deleted locally:", e.message);
    }
  };

  const toggleActive = async (id) => {
    setVendors((prev) =>
      prev.map((v) =>
        String(v.id) === String(id) || String(v._id) === String(id)
          ? { ...v, isActive: !v.isActive }
          : v
      )
    );
    try {
      await vendorsApi.toggleStatus(id);
    } catch (e) {
      console.warn("Backend toggle status failed, updated locally:", e.message);
    }
  };

  const addBlackout = async (vendorId, slot) => {
    const slotWithId = {
      id: slot.id || `bo-${Date.now()}`,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      reason: slot.reason || "Scheduled assignment / conflict",
    };
    setVendors((prev) =>
      prev.map((v) =>
        String(v.id) === String(vendorId) || String(v._id) === String(vendorId)
          ? { ...v, blackouts: [...(v.blackouts || []), slotWithId] }
          : v
      )
    );

    try {
      await vendorsApi.addAvailability(vendorId, {
        date: slot.date,
        status: "Leave",
        reason: slot.reason || "Scheduled assignment / conflict",
      });
    } catch (e) {
      console.warn("Backend add availability failed, saved locally:", e.message);
    }
  };

  const removeBlackout = (vendorId, slotId) => {
    setVendors((prev) =>
      prev.map((v) =>
        String(v.id) === String(vendorId) || String(v._id) === String(vendorId)
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
        isLoading,
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
