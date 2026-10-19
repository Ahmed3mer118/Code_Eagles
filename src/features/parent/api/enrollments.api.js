// src/features/parent/api/enrollments.api.js
import apiClient from '../../../shared/api/client';

export const parentEnrollmentsApi = {
  // جلب مجموعات الابن
  getChildEnrollments: (childId) => apiClient.get(`/parent/children/${childId}/groups`),
};

export default parentEnrollmentsApi;
