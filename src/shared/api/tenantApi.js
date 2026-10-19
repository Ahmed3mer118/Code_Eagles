import api from './client';

export const tenantApi = {
  // ============================================
  // 👑 Super Admin Endpoints
  // ============================================

  /** GET /admin/tenants */
  async list(params = {}) {
    const { data } = await api.get('/admin/tenants', { params });
    return data;
  },

  /** GET /admin/tenants/:id */
  async getOne(id) {
    const { data } = await api.get(`/admin/tenants/${id}`);
    return data;
  },

  /** PATCH /admin/tenants/:id */
  async update(id, payload) {
    const { data } = await api.patch(`/admin/tenants/${id}`, payload);
    return data;
  },

  /** DELETE /admin/tenants/:id */
  async remove(id) {
    const { data } = await api.delete(`/admin/tenants/${id}`);
    return data;
  },

  /** PATCH /admin/tenants/:id/approve */
  async approve(id, payload = {}) {
    const { data } = await api.patch(`/admin/tenants/${id}/approve`, payload);
    return data;
  },

  /** PATCH /admin/tenants/:id/reject */
  async reject(id, payload) {
    const { data } = await api.patch(`/admin/tenants/${id}/reject`, payload);
    return data;
  },

  /** PATCH /admin/tenants/:id/status */
  async updateStatus(id, status) {
    const { data } = await api.patch(`/admin/tenants/${id}/status`, { status });
    return data;
  },

  /** PATCH /admin/tenants/:id/plan */
  async changePlan(id, platformPlanId) {
    const { data } = await api.patch(`/admin/tenants/${id}/plan`, {
      platformPlanId,
    });
    return data;
  },

  /** GET /admin/tenants/:id/stats */
  async getStats(id) {
    const { data } = await api.get(`/admin/tenants/${id}/stats`);
    return data;
  },

  /** POST /tenants/register — إنشاء أكاديمية جديدة */
  async create(payload) {
    const { data } = await api.post('/tenants/register', payload);
    return data;
  },

  /** GET /tenants/check-slug/:slug */
  async checkSlug(slug) {
    const { data } = await api.get(`/tenants/check-slug/${slug}`);
    return data;
  },

  // ============================================
  // 👨‍🏫 Teacher Endpoints (tenant-scoped)
  // ============================================

  /** GET /tenant/settings — جلب إعدادات الأكاديمية */
  async getSettings() {
    const { data } = await api.get('/tenant/settings');
    return data;
  },

  /** PATCH /tenant/settings — تحديث إعدادات الأكاديمية */
  async updateSettings(payload) {
    const { data } = await api.patch('/tenant/settings', payload);
    return data;
  },

  /** POST /tenant/logo — رفع شعار الأكاديمية */
  async uploadLogo(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/tenant/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /** POST /tenant/cover — رفع صورة غلاف الأكاديمية */
  async uploadCover(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/tenant/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /** GET /tenant/stats — إحصائيات الأكاديمية */
  async getTeacherStats() {
    const { data } = await api.get('/tenant/stats');
    return data;
  },

  /** GET /tenant/dashboard — Dashboard الأكاديمية */
  async getDashboard() {
    const { data } = await api.get('/tenant/dashboard');
    return data;
  },
};

export default tenantApi;
