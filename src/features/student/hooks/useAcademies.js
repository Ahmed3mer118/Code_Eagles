// src/features/student/hooks/useAcademies.js
import { useCallback, useEffect, useState } from 'react';
import paymentPlansApi from '../api/paymentPlans.api';

/**
 * جلب كل الأكاديميات (public) + البحث
 */
export default function useAcademies(initialSearch = '') {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(initialSearch);

  const fetchAcademies = useCallback(async (q) => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentPlansApi.getAcademies(
        q ? { q } : {}
      );
      const list = res?.data?.data ?? res?.data ?? [];
      setData(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('useAcademies error:', err);
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchAcademies(search.trim());
    }, 400); // debounce
    return () => clearTimeout(timeout);
  }, [search, fetchAcademies]);

  return {
    data,
    loading,
    error,
    search,
    setSearch,
    refetch: () => fetchAcademies(search.trim()),
  };
}
