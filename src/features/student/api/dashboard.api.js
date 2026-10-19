// src/features/student/api/dashboard.api.js
import apiClient from '@/shared/api/client';

/**
 * Student Dashboard API
 * بيجمع من endpoints مختلفة
 */
export const studentDashboardApi = {
  /** GET /student/points — النقاط + المستوى */
  getPoints: () => apiClient.get('/student/points'),

  /** GET /student/level — تفاصيل المستوى فقط */
  getLevel: () => apiClient.get('/student/level'),

  /** GET /student/leaderboard — المتصدرين */
  getLeaderboard: (params = {}) =>
    apiClient.get('/student/leaderboard', { params }),

  /** GET /student/enrollments — المجموعات المسجل فيها */
  getEnrollments: () => apiClient.get('/student/enrollments'),

  /** GET /student/assignments — الواجبات */
  getAssignments: (params = {}) =>
    apiClient.get('/student/assignments', { params }),

  /** GET /student/quizzes — الاختبارات */
  getQuizzes: (params = {}) =>
    apiClient.get('/student/quizzes', { params }),

  /** GET /me/notifications — الإشعارات */
  getNotifications: (params = {}) =>
    apiClient.get('/me/notifications', { params }),

  /** GET /me/notifications/unread-count */
  getUnreadCount: () =>
    apiClient.get('/me/notifications/unread-count'),
};

export default studentDashboardApi;
