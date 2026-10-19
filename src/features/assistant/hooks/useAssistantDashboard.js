// src/features/assistant/hooks/useAssistantDashboard.js
import { useState, useEffect, useCallback } from 'react';
import assistantApi from '../api/assistantApi';

export function useAssistantDashboard() {
  const [data, setData] = useState({
    stats: null,
    groups: [],
    profile: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, groupsRes, meRes] = await Promise.allSettled([
        assistantApi.getDashboard(),
        assistantApi.getGroups(),
        assistantApi.getMe(),
      ]);

      const extract = (r, fallback = []) => {
        if (r.status !== 'fulfilled') return fallback;
        const payload = r.value?.data ?? r.value;
        return Array.isArray(payload) ? payload : payload?.data ?? payload;
      };

      setData({
        stats: extract(statsRes, null),
        groups: extract(groupsRes, []),
        profile: extract(meRes, null),
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...data, loading, error, refetch: fetchAll };
}

export default useAssistantDashboard;
