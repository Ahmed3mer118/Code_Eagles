// src/features/assistant/hooks/useAssistantGroups.js
import { useState, useEffect, useCallback } from 'react';
import assistantApi from '../api/assistantApi';

export function useAssistantGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await assistantApi.getGroups();
      const payload = res?.data ?? res;
      const items = Array.isArray(payload) ? payload : payload?.data ?? [];
      setGroups(items);
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تحميل المجموعات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { groups, loading, error, refetch: fetchGroups };
}

export default useAssistantGroups;
