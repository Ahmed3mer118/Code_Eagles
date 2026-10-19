// src/features/student/api/payments.api.js
import apiClient from '@/shared/api/client';

export const studentPaymentsApi = {
  /** GET /student/payment-plans — خطط الدفع المتاحة */
  getPaymentPlans: () =>
    apiClient.get('/student/payment-plans'),

  /** POST /student/payment-requests — إنشاء طلب دفع */
  createPaymentRequest: (data) =>
    apiClient.post('/student/payment-requests', data),

  /** GET /student/payment-requests — قائمة طلبات الدفع */
  getMyPaymentRequests: () =>
    apiClient.get('/student/payment-requests'),

  /** GET /student/payment-requests/:id — طلب واحد */
  getPaymentRequest: (id) =>
    apiClient.get(`/student/payment-requests/${id}`),

  /** POST /student/promo-codes/validate — التحقق من كود خصم */
  validatePromoCode: (data) =>
    apiClient.post('/student/promo-codes/validate', data),
};

export default studentPaymentsApi;
