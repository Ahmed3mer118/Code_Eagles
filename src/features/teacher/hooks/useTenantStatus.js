// src/features/teacher/hooks/useTenantStatus.js
import { useEffect, useState } from 'react';
import teacherApi from '@/shared/api/teacherApi';

export function useTenantStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await teacherApi.getTenantStatus();
        if (mounted) setStatus(res?.data ?? res);
      } catch (err) {
        console.error('Tenant status error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { status, loading };
}
