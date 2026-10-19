// src/features/parent/api/requests.api.js
import apiClient from '../../../shared/api/client';

export const parentRequestsApi = {
  // جلب طلبات الربط المعلقة
  getMyRequests: () => apiClient.get('/parent/children/requests'),
  
  // إرسال طلب ربط جديد
  createRequest: (data) => apiClient.post('/parent/children/link', data),
  
  // إلغاء طلب
  cancelRequest: (id) => apiClient.delete(`/parent/children/requests/${id}`),
};

export default parentRequestsApi;
