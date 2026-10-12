import apiClient from './client';

const ADMIN_BASE = '/platform/subscriptions';
const TENANT_BASE = '/tenant/subscriptions';

export const subscriptionRequestsService = {
  /* ═══════════════════════════════════════════
     Super Admin APIs
     ═══════════════════════════════════════════ */
  list: async (params = {}) => {
    const { data } = await apiClient.get(ADMIN_BASE, { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await apiClient.get(`${ADMIN_BASE}/${id}`);
    return data;
  },
  approvePlan: async (id, { amount, notes }) => {
    const { data } = await apiClient.patch(`${ADMIN_BASE}/${id}/approve`, {
      amount,
      notes,
    });
    return data;
  },
  rejectPlan: async (id, rejectionReason) => {
    const { data } = await apiClient.patch(`${ADMIN_BASE}/${id}/reject`, {
      rejectionReason,
    });
    return data;
  },
  approvePayment: async (id) => {
    const { data } = await apiClient.patch(
      `${ADMIN_BASE}/${id}/payment/approve`,
    );
    return data;
  },
  rejectPayment: async (id, rejectionReason) => {
    const { data } = await apiClient.patch(
      `${ADMIN_BASE}/${id}/payment/reject`,
      { rejectionReason },
    );
    return data;
  },

  /* ═══════════════════════════════════════════
     Tenant (Teacher) APIs
     ═══════════════════════════════════════════ */
  request: async (payload) => {
    const { data } = await apiClient.post(`${TENANT_BASE}/request`, payload);
    return data;
  },
  getMySubscription: async (tenantId) => {
    const { data } = await apiClient.get(`${TENANT_BASE}/me`, {
      params: { tenantId },
    });
    return data;
  },
  submitPaymentProof: async (subscriptionId, paymentProofUrl) => {
    const { data } = await apiClient.patch(
      `${TENANT_BASE}/${subscriptionId}/payment-proof`,
      { paymentProofUrl },
    );
    return data;
  },

  /* ═══════════════════════════════════════════
     ⭐ Upload Image (بيستخدم للـ payment proofs)
     ═══════════════════════════════════════════ */
  uploadImage: async (file, folder = 'payment-proofs') => {
    if (!file) {
      throw new Error('No file selected');
    }

    const formData = new FormData();
    formData.append('file', file);

    // ⭐ headers مهمة للـ backend
    const token = localStorage.getItem('ce_access_token');
    const tenantId = localStorage.getItem('ce_tenant_id');

    const { data } = await apiClient.post(
      `/api/upload/image?folder=${encodeURIComponent(folder)}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(tenantId && { 'x-tenant-id': tenantId }),
        },
      },
    );

    return data; // { id, url, path, fileName, ... }
  },

  /* ═══════════════════════════════════════════
     رفع عام لأي ملف (احتياطي)
     ═══════════════════════════════════════════ */
  uploadFile: async (file, folder = 'files') => {
    if (!file) throw new Error('No file selected');

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('ce_access_token');
    const tenantId = localStorage.getItem('ce_tenant_id');

    const { data } = await apiClient.post(
      `/api/upload/file?folder=${encodeURIComponent(folder)}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(tenantId && { 'x-tenant-id': tenantId }),
        },
      },
    );
    return data;
  },
};