// src/features/parent/api/payments.api.js
import apiClient from '../../../shared/api/client';

export const parentPaymentsApi = {
  // TODO: ضيفي الـ Endpoint الصح لما يتعمل في الباك
  getChildPayments: (childId) => Promise.resolve({ data: [] }), 
};

export default parentPaymentsApi;
