import apiClient from "./apiClient";

// ─── SERVICES MASTER API ─────────────────────────────────────────────────────
export const servicesApi = {
  getAll: async (params = {}) => {
    const res = await apiClient.get("/masters/services", params);
    return res?.data || [];
  },

  getById: async (id) => {
    const res = await apiClient.get(`/masters/services/${id}`);
    return res?.data;
  },

  create: async (serviceData) => {
    const res = await apiClient.post("/masters/services", serviceData);
    return res?.data;
  },

  update: async (id, serviceData) => {
    const res = await apiClient.put(`/masters/services/${id}`, serviceData);
    return res?.data;
  },

  toggleStatus: async (id) => {
    const res = await apiClient.patch(`/masters/services/${id}/status`);
    return res?.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/masters/services/${id}`);
    return res?.data;
  },

  getCategories: async () => {
    const res = await apiClient.get("/masters/services/categories");
    return res?.data || [];
  },

  createCategory: async (categoryData) => {
    const res = await apiClient.post("/masters/services/categories", categoryData);
    return res?.data;
  },

  updateCategory: async (id, categoryData) => {
    const res = await apiClient.put(`/masters/services/categories/${encodeURIComponent(id)}`, categoryData);
    return res?.data;
  },

  deleteCategory: async (id) => {
    const res = await apiClient.delete(`/masters/services/categories/${encodeURIComponent(id)}`);
    return res?.data;
  },
};

// ─── VENUES MASTER API ───────────────────────────────────────────────────────
export const venuesApi = {
  getAll: async (params = {}) => {
    const res = await apiClient.get("/masters/venues", params);
    return res?.data || [];
  },

  getById: async (id) => {
    const res = await apiClient.get(`/masters/venues/${id}`);
    return res?.data;
  },

  create: async (venueData) => {
    const res = await apiClient.post("/masters/venues", venueData);
    return res?.data;
  },

  update: async (id, venueData) => {
    const res = await apiClient.put(`/masters/venues/${id}`, venueData);
    return res?.data;
  },

  toggleStatus: async (id) => {
    const res = await apiClient.patch(`/masters/venues/${id}/status`);
    return res?.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/masters/venues/${id}`);
    return res?.data;
  },

  getTypes: async () => {
    const res = await apiClient.get("/masters/venues/types");
    return res?.data || [];
  },

  createType: async (typeData) => {
    const res = await apiClient.post("/masters/venues/types", typeData);
    return res?.data;
  },

  updateType: async (id, typeData) => {
    const res = await apiClient.put(`/masters/venues/types/${encodeURIComponent(id)}`, typeData);
    return res?.data;
  },

  deleteType: async (id) => {
    const res = await apiClient.delete(`/masters/venues/types/${encodeURIComponent(id)}`);
    return res?.data;
  },
};

// ─── VENDORS MASTER API ─────────────────────────────────────────────────────
export const vendorsApi = {
  getAll: async (params = {}) => {
    const res = await apiClient.get("/masters/vendors", params);
    return res?.data || [];
  },

  getById: async (id) => {
    const res = await apiClient.get(`/masters/vendors/${id}`);
    return res?.data;
  },

  create: async (vendorData) => {
    const res = await apiClient.post("/masters/vendors", vendorData);
    return res?.data;
  },

  update: async (id, vendorData) => {
    const res = await apiClient.put(`/masters/vendors/${id}`, vendorData);
    return res?.data;
  },

  toggleStatus: async (id) => {
    const res = await apiClient.patch(`/masters/vendors/${id}/status`);
    return res?.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/masters/vendors/${id}`);
    return res?.data;
  },

  addAvailability: async (id, availabilityData) => {
    const res = await apiClient.post(`/masters/vendors/${id}/availability`, availabilityData);
    return res?.data;
  },

  getRoles: async () => {
    const res = await apiClient.get("/masters/vendors/roles");
    return res?.data || [];
  },

  createRole: async (roleData) => {
    const res = await apiClient.post("/masters/vendors/roles", roleData);
    return res?.data;
  },

  updateRole: async (id, roleData) => {
    const res = await apiClient.put(`/masters/vendors/roles/${encodeURIComponent(id)}`, roleData);
    return res?.data;
  },

  deleteRole: async (id) => {
    const res = await apiClient.delete(`/masters/vendors/roles/${encodeURIComponent(id)}`);
    return res?.data;
  },
};
