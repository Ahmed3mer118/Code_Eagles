// src/features/parent/api/points.api.js
import apiClient from '../../../shared/api/client';

export const parentPointsApi = {
  // نقاط الابن
  getChildPoints: (childId) => apiClient.get(`/parent/children/${childId}/points`),
};

export default parentPointsApi;
