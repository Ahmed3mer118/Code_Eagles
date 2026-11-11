// src/features/student/api/paymentPlans.api.js
import apiClient from '@/shared/api/client';

export const paymentPlansApi = {
  /* ═════════════════════════════════════════════
     Public
     ═════════════════════════════════════════════ */
  getAcademies: (params = {}) =>
    apiClient.get('/platform/academies', { params }),

  getAcademyBySlug: (slug) =>
    apiClient.get(`/platform/academies/${slug}`),

  getPublicTenant: (slug) =>
    apiClient.get(`/public/tenants/${slug}`),

  getAcademyPlans: (slug) =>
    apiClient.get(`/public/tenants/${slug}/plans`),

  getAcademyGroups: (slug) =>
    apiClient.get(`/public/tenants/${slug}/groups`),

  /* ═════════════════════════════════════════════
     Upload
     ═════════════════════════════════════════════ */
  uploadProofImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(
      '/upload/image?folder=payment-proofs',
      formData,
      { headers: { 'Content-Type': undefined } },
    );
  },

  /* ═════════════════════════════════════════════
     Student — Promo & Payments
     ═════════════════════════════════════════════ */

  // ✅ جديد: للتحقق من كود الخصم
  validatePromoCode: (payload) =>
    apiClient.post('/student/promo-codes/validate', payload),

  requestEnrollment: (payload) =>
    apiClient.post('/student/enrollments/request', payload),

  requestPayment: (payload) =>
    apiClient.post('/student/payment-requests/request', payload),

  canSubmitNewRequest: (tenantId) =>
    apiClient.get('/student/payment-requests/can-submit', {
      params: tenantId ? { tenantId } : {},
    }),

  getMyPaymentRequests: () =>
    apiClient.get('/student/payment-requests'),

  getPaymentRequest: (id) =>
    apiClient.get(`/student/payment-requests/${id}`),

  getMyEnrollments: () =>
    apiClient.get('/student/enrollments'),
};

export default paymentPlansApi;
