// src/features/parent/hooks/useParentRequests.js
import { useState, useEffect, useCallback } from 'react';
import parentRequestsApi from '../api/requests.api';

export function useParentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await parentRequestsApi.getMyRequests();
      const payload = res?.data ?? res;
      setRequests(Array.isArray(payload) ? payload : payload?.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تحميل طلبات الربط');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, error, refetch: fetchRequests };
}

export default useParentRequests;
