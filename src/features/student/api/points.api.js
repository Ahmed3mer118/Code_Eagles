// src/features/student/api/points.api.js
import apiClient from '@/shared/api/client';

/**
 * Student Points API
 * ⚠️ بدون /api prefix — client.js بيضيفه
 */
export const studentPointsApi = {
  /** GET /student/points — نقاطي + xp + level + progress + logs */
  getMyPoints: (params = {}) =>
    apiClient.get('/student/points', { params }),

  /** GET /student/points/history — سجل النقاط */
  getMyHistory: (params = {}) =>
    apiClient.get('/student/points/history', { params }),

  /** GET /student/level — المستوى + التقدم */
  getMyLevel: () => apiClient.get('/student/level'),

  /** GET /student/leaderboard — لوحة المتصدرين */
  getLeaderboard: (params = {}) =>
    apiClient.get('/student/leaderboard', { params }),
};

export default studentPointsApi;
