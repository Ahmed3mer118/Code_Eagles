import apiClient from './client';

const BASE = '/tenant';

export const tenantSubscriptionService = {
  getCurrentSubscription: async () => {
    const { data } = await apiClient.get(`${BASE}/subscription`);
    return data;
  },

  getSubscriptionHistory: async (params = {}) => {
    const { data } = await apiClient.get(`${BASE}/subscription/history`, { params });
    return data;
  },

  requestSubscription: async (payload) => {
    const { data } = await apiClient.post(`${BASE}/subscription/request`, payload);
    return data;
  },

  submitPaymentProof: async (subscriptionId, paymentProofUrl) => {
    const { data } = await apiClient.patch(
      `${BASE}/subscriptions/${subscriptionId}/payment-proof`,
      { paymentProofUrl }
    );
    return data;
  },

  /** رفع صورة الإيصال */
  uploadImage: async (file, folder = 'payments/proofs') => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post(
      `/upload/image?folder=${encodeURIComponent(folder)}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },
};

export default tenantSubscriptionService;
