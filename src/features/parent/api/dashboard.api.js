// src/features/parent/api/dashboard.api.js
import apiClient from '../../../shared/api/client';

export const parentDashboardApi = {
  // جلب التقرير الشامل للابن (فيه الإحصائيات)
  getChildReports: (childId) => apiClient.get(`/parent/children/${childId}/reports`),
  
  // جلب الواجبات (عشان نعرف عدد الواجبات اللي لسه متصححتش)
  getChildAssignments: (childId) => apiClient.get(`/parent/children/${childId}/assignments`),
  
  // جلب الاختبارات
  getChildQuizzes: (childId) => apiClient.get(`/parent/children/${childId}/quizzes`),
};

export default parentDashboardApi;
