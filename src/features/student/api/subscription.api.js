// src/features/student/api/subscription.api.js
import apiClient from '@/shared/api/client';

/**
 * Subscription info — بيستخدم enrollment + payment plans
 * لأن مفيش endpoint مخصص للطالب لمعرفة اشتراكه
 */
export const studentSubscriptionApi = {
  /** نفس endpoint المدرس — GET /tenant/subscription */
  getTenantSubscription: () =>
    apiClient.get('/tenant/subscription'),

  /** سجل الاشتراكات */
  getSubscriptionHistory: (params = {}) =>
    apiClient.get('/tenant/subscription/history', { params }),
};

export default studentSubscriptionApi;
