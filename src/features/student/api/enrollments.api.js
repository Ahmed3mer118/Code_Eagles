// src/features/student/api/enrollments.api.js
import apiClient from '@/shared/api/client';

export const studentEnrollmentsApi = {
  getMyEnrollments: () => apiClient.get('/student/enrollments'),
  getEnrollment: (id) => apiClient.get(`/student/enrollments/${id}`),
  createEnrollment: (data) => apiClient.post('/student/enrollments', data),
  cancelEnrollment: (id) => apiClient.delete(`/student/enrollments/${id}`),
};

export default studentEnrollmentsApi;
