// src/shared/api/tenantSubscriptionService.js
import apiClient from './client';

const BASE = '/tenant/subscription';

export const tenantSubscriptionService = {
  getCurrentSubscription: async () => {
    const { data } = await apiClient.get(BASE);
    return data;
  },

  getSubscriptionHistory: async (params = {}) => {
    const { data } = await apiClient.get(`${BASE}/history`, { params });
    return data;
  },

  requestSubscription: async (payload) => {
    const { data } = await apiClient.post(`${BASE}/request`, payload);
    return data;
  },

  // ✅ رفع إثبات الدفع — الأصح: سيب Axios يحدد الـ Content-Type
  submitPaymentProof: async (subscriptionId, file) => {
    if (!file) throw new Error('No file provided');

    const formData = new FormData();
    formData.append('file', file); // اسم الحقل لازم يطابق @UploadedFile('file')

    const { data } = await apiClient.patch(
      `${BASE}/${subscriptionId}/payment-proof`,
      formData,
      // ❌ لا تحدد Content-Type يدوياً — Axios يضيف boundary تلقائياً
      // ✅ فقط امسح الهيدر الافتراضي عشان Axios يستخدم multipart
      {
        headers: { 'Content-Type': undefined },
      }
    );
    return data;
  },

  // ✅ رفع صورة عامة (لو محتاجها)
  uploadImage: async (file, folder = 'payments/proofs') => {
    if (!file) throw new Error('No file provided');

    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post(
      `/upload/image?folder=${encodeURIComponent(folder)}`,
      formData,
      { headers: { 'Content-Type': undefined } }
    );
    return data;
  },
};

export default tenantSubscriptionService;
