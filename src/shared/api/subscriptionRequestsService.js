// src/shared/api/subscriptionRequestsService.js
import apiClient from './client';

const ADMIN_BASE = '/platform/subscriptions';
const TENANT_BASE = '/tenant/subscriptions';

export const subscriptionRequestsService = {
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

  // ✅✅✅ رفع إثبات الدفع — الأصح: FormData فيها file
  submitPaymentProof: async (subscriptionId, file) => {
    if (!file) throw new Error('No file provided');

    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.patch(
      `${TENANT_BASE}/${subscriptionId}/payment-proof`,
      formData,
      { headers: { 'Content-Type': undefined } },
    );
    return data;
  },

  uploadImage: async (file, folder = 'payment-proofs') => {
    if (!file) throw new Error('No file selected');
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post(
      `/upload/image?folder=${encodeURIComponent(folder)}`,
      formData,
      { headers: { 'Content-Type': undefined } },
    );
    return data;
  },

  uploadFile: async (file, folder = 'files') => {
    if (!file) throw new Error('No file selected');
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post(
      `/upload/file?folder=${encodeURIComponent(folder)}`,
      formData,
      { headers: { 'Content-Type': undefined } },
    );
    return data;
  },
};

export default subscriptionRequestsService;
