import { useState, useEffect, useCallback } from 'react';
import tenantApi from '@/shared/api/tenantApi';

export function useTeacherTenant() {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTenant = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tenantApi.getSettings();
      setTenant(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'فشل تحميل إعدادات الأكاديمية';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenant();
  }, [fetchTenant]);

  return {
    tenant,
    loading,
    error,
    refetch: fetchTenant,
    setTenant,
  };
}

export default useTeacherTenant;
