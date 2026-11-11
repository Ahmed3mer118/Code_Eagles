// src/shared/api/tenantApi.js
import api from './client';

export const tenantApi = {
  // ============ Super Admin ============

  /** GET /admin/tenants */
  async list(params = {}) {
    const { data } = await api.get('/admin/tenants', { params });
    return data;
  },

  async getOne(id) {
    const { data } = await api.get(`/admin/tenants/${id}`);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.patch(`/admin/tenants/${id}`, payload);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/admin/tenants/${id}`);
    return data;
  },

  async approve(id, payload = {}) {
    const { data } = await api.patch(`/admin/tenants/${id}/approve`, payload);
    return data;
  },

  async reject(id, payload) {
    const { data } = await api.patch(`/admin/tenants/${id}/reject`, payload);
    return data;
  },

  async updateStatus(id, status) {
    const { data } = await api.patch(`/admin/tenants/${id}/status`, { status });
    return data;
  },

  async changePlan(id, platformPlanId) {
    const { data } = await api.patch(`/admin/tenants/${id}/plan`, {
      platformPlanId,
    });
    return data;
  },

  async getStats(id) {
    const { data } = await api.get(`/admin/tenants/${id}/stats`);
    return data;
  },

  /** POST /tenants/register */
  async create(payload) {
    const { data } = await api.post('/tenants/register', payload);
    return data;
  },

  /** GET /tenants/check-slug/:slug */
  async checkSlug(slug) {
    const { data } = await api.get(`/tenants/check-slug/${slug}`);
    return data;
  },

  // ============ Teacher ============

  async getSettings() {
    const { data } = await api.get('/tenant/settings');
    return data;
  },

  async updateSettings(payload) {
    const { data } = await api.patch('/tenant/settings', payload);
    return data;
  },

  async uploadLogo(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/tenant/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async uploadCover(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/tenant/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async getTeacherStats() {
    const { data } = await api.get('/tenant/stats');
    return data;
  },

  async getDashboard() {
    const { data } = await api.get('/tenant/dashboard');
    return data;
  },
};

export default tenantApi;
