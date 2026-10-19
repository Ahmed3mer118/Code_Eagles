// src/features/assistant/api/assistantApi.js
import apiClient from '../../../shared/api/client';

export const assistantApi = {
  getMe: () => apiClient.get('/assistant/me'),
  getDashboard: () => apiClient.get('/assistant/dashboard'),
  getGroups: () => apiClient.get('/assistant/groups'),
  getGroupById: (id) => apiClient.get(`/assistant/groups/${id}`),
  getGroupStudents: (id) => apiClient.get(`/assistant/groups/${id}/students`),
};

export default assistantApi;
