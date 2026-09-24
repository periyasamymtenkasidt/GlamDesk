import apiClient from "./apiClient";

// ─── CLIENTS MASTER & CONVERSION API ─────────────────────────────────────────
export const clientsApi = {
  getAll: async (params = {}) => {
    const res = await apiClient.get("/clients", params);
    return res?.data || [];
  },

  getById: async (id) => {
    const res = await apiClient.get(`/clients/${id}`);
    return res?.data;
  },

  create: async (clientData) => {
    const res = await apiClient.post("/clients", clientData);
    return res?.data;
  },

  update: async (id, clientData) => {
    const res = await apiClient.put(`/clients/${id}`, clientData);
    return res?.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/clients/${id}`);
    return res?.data;
  },

  upsertFromAppointment: async (appointmentData) => {
    const res = await apiClient.post("/clients/upsert-from-appointment", appointmentData);
    return res?.data;
  },
};

export default clientsApi;
