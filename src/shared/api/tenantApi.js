import api from './client';

export const tenantApi = {
  /** GET /api/admin/tenants */
  async list(params = {}) {
    const { data } = await api.get('/api/admin/tenants', { params });
    return data;
  },

  /** GET /api/admin/tenants/:id */
  async getOne(id) {
    const { data } = await api.get(`/api/admin/tenants/${id}`);
    return data;
  },

  /** PATCH /api/admin/tenants/:id */
  async update(id, payload) {
    const { data } = await api.patch(`/api/admin/tenants/${id}`, payload);
    return data;
  },

  /** DELETE /api/admin/tenants/:id */
  async remove(id) {
    const { data } = await api.delete(`/api/admin/tenants/${id}`);
    return data;
  },

  /** PATCH /api/admin/tenants/:id/approve */
  async approve(id, payload = {}) {
    const { data } = await api.patch(`/api/admin/tenants/${id}/approve`, payload);
    return data;
  },

  /** PATCH /api/admin/tenants/:id/reject */
  async reject(id, payload) {
    const { data } = await api.patch(`/api/admin/tenants/${id}/reject`, payload);
    return data;
  },

  /** PATCH /api/admin/tenants/:id/status */
  async updateStatus(id, status) {
    const { data } = await api.patch(`/api/admin/tenants/${id}/status`, { status });
    return data;
  },

  /** PATCH /api/admin/tenants/:id/plan */
  async changePlan(id, platformPlanId) {
    const { data } = await api.patch(`/api/admin/tenants/${id}/plan`, { platformPlanId });
    return data;
  },

  /** GET /api/admin/tenants/:id/stats */
  async getStats(id) {
    const { data } = await api.get(`/api/admin/tenants/${id}/stats`);
    return data;
  },

  /** POST /api/tenants/register — إنشاء أكاديمية جديدة */
  async create(payload) {
    const { data } = await api.post('/api/tenants/register', payload);
    return data;
  },

  /** GET /api/tenants/check-slug/:slug */
  async checkSlug(slug) {
    const { data } = await api.get(`/api/tenants/check-slug/${slug}`);
    return data;
  },
};

export default tenantApi;