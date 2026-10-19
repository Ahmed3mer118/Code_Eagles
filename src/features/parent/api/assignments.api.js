// src/features/parent/api/assignments.api.js
import apiClient from '../../../shared/api/client';

export const parentAssignmentsApi = {
  // جلب واجبات الابن
  getChildAssignments: (childId) => apiClient.get(`/parent/children/${childId}/assignments`),
};

export default parentAssignmentsApi;
