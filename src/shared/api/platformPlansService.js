import apiClient from './client';

const BASE = '/platform-plans';

export const platformPlansService = {
  list: async (params = {}) => {
    const { data } = await apiClient.get(BASE, { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await apiClient.post(BASE, payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await apiClient.patch(`${BASE}/${id}`, payload);
    return data;
  },
  /** ⭐ تغيير الحالة فقط */
  updateStatus: async (id, status) => {
    const { data } = await apiClient.patch(`${BASE}/${id}/status`, { status });
    return data;
  },
  remove: async (id) => {
    const { data } = await apiClient.delete(`${BASE}/${id}`);
    return data;
  },
  seedFree: async () => {
    const { data } = await apiClient.post(`${BASE}/seed-free`);
    return data;
  },
};