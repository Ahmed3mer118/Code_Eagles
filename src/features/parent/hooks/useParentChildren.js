// src/features/parent/hooks/useParentChildren.js
import { useState, useEffect, useCallback } from 'react';
import parentChildrenApi from '../api/children.api';

export function useParentChildren() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchChildren = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await parentChildrenApi.getMyChildren();
      const payload = res?.data ?? res;
      setChildren(Array.isArray(payload) ? payload : payload?.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تحميل قائمة الأبناء');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  return { children, loading, error, refetch: fetchChildren };
}

export default useParentChildren;
