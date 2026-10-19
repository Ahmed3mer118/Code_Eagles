// src/features/assistant/components/PermissionGate.jsx
import { useEffect, useState } from 'react';
import assistantApi from '../api/assistantApi';

export default function PermissionGate({ permission, children, fallback = null }) {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    assistantApi.getMe()
      .then(res => {
        if (mounted) {
          const data = res?.data ?? res;
          setPermissions(data?.permissions || []);
        }
      })
      .catch(() => {
        if (mounted) setPermissions([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  if (loading) return null;

  return permissions?.includes(permission) ? children : fallback;
}
