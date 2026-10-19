// src/features/parent/api/quizzes.api.js
import apiClient from '../../../shared/api/client';

export const parentQuizzesApi = {
  // جلب اختبارات الابن
  getChildQuizzes: (childId) => apiClient.get(`/parent/children/${childId}/quizzes`),
};

export default parentQuizzesApi;
