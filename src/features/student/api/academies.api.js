// src/features/student/api/academies.api.js
import apiClient from '@/shared/api/client';

export const studentAcademiesApi = {
  /** GET /platform/academies — كل الأكاديميات */
  getAcademies: (params = {}) =>
    apiClient.get('/platform/academies', { params }),

  /** GET /platform/academies/:slug — تفاصيل أكاديمية */
  getAcademyBySlug: (slug) =>
    apiClient.get(`/platform/academies/${slug}`),

  /** GET /public/tenants/:slug — بيانات أكاديمية عامة */
  getPublicTenant: (slug) =>
    apiClient.get(`/public/tenants/${slug}`),

  /** GET /public/tenants/:slug/plans — خطط دفع الأكاديمية */
  getAcademyPlans: (slug) =>
    apiClient.get(`/public/tenants/${slug}/plans`),

  /** GET /public/tenants/:slug/groups — مجموعات الأكاديمية */
  getAcademyGroups: (slug) =>
    apiClient.get(`/public/tenants/${slug}/groups`),

  /** POST /student/enrollments — إرسال طلب انضمام */
  createEnrollment: (data) =>
    apiClient.post('/student/enrollments', data),

  /** GET /student/enrollments — طلبات الانضمام */
  getMyEnrollments: () =>
    apiClient.get('/student/enrollments'),
};

export default studentAcademiesApi;
