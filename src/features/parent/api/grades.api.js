// src/features/parent/api/grades.api.js
import apiClient from '../../../shared/api/client';

export const parentGradesApi = {
  // المسار الصح اللي بيجيب الإحصائيات (reports)
  getChildReports: (childId) => apiClient.get(`/parent/children/${childId}/reports`),
  
  // الواجبات
  getChildAssignments: (childId) => apiClient.get(`/parent/children/${childId}/assignments`),
  
  // الاختبارات
  getChildQuizzes: (childId) => apiClient.get(`/parent/children/${childId}/quizzes`),
};

export default parentGradesApi;
