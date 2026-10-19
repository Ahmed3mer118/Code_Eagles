// src/features/parent/api/children.api.js
import apiClient from '../../../shared/api/client';

export const parentChildrenApi = {
  // جلب أبناء ولي الأمر
  getMyChildren: () => apiClient.get('/parent/children'),
  
  // جلب بيانات ابن معين
  getChildById: (childId) => apiClient.get(`/parent/children/${childId}`),
};

export default parentChildrenApi;
