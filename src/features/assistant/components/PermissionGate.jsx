// src/features/assistant/components/PermissionGate.jsx
import { useEffect, useState } from 'react';
import assistantApi from '../api/assistantApi';

let permissionsCache = null;
let permissionsPromise = null;

function loadPermissions(force = false) {
  if (force) {
    permissionsCache = null;
    permissionsPromise = null;
  }
  if (permissionsCache) return Promise.resolve(permissionsCache);
  if (permissionsPromise) return permissionsPromise;

  permissionsPromise = assistantApi
    .getMe()
    .then((res) => {
      const data = res?.data ?? res;
      permissionsCache = Array.isArray(data?.permissions) ? data.permissions : [];
      return permissionsCache;
    })
    .catch(() => {
      permissionsCache = [];
      return permissionsCache;
    })
    .finally(() => { permissionsPromise = null; });

  return permissionsPromise;
}

export function invalidatePermissionsCache() {
  permissionsCache = null;
  permissionsPromise = null;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState(permissionsCache);
  const [loading, setLoading] = useState(!permissionsCache);

  useEffect(() => {
    let mounted = true;
    loadPermissions().then((perms) => {
      if (mounted) {
        setPermissions(perms);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  return {
    permissions: permissions || [],
    loading,
    has: (p) => (permissions || []).includes(p),
  };
}

export default function PermissionGate({ permission, children, fallback = null, loadingFallback = null }) {
  const { permissions, loading } = usePermissions();
  if (loading) return loadingFallback;

  const required = Array.isArray(permission) ? permission : [permission];
  const allowed = required.some((p) => permissions.includes(p));
  return allowed ? children : fallback;
}