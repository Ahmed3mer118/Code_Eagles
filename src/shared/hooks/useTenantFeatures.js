import { useEffect, useState } from 'react';
import AuthServices from '../api/authService';
import { studentApi, FEATURE_KEYS, OPT_IN_FEATURES } from '../api/platformApi';
import { getStoredTenant, setStoredTenant } from '../api/tenantContext';

export function isFeatureEnabled(features, key) {
  if (!key) return true;
  const value = features?.[key];
  if (value === undefined || value === null) return !OPT_IN_FEATURES.includes(key);
  return value !== false;
}

export function filterNavByFeatures(navItems, features) {
  return navItems.filter((item) => isFeatureEnabled(features, item.featureKey));
}

export default function useTenantFeatures() {
  const [features, setFeatures] = useState(() => getStoredTenant()?.features || null);
  const [packageAccess, setPackageAccess] = useState(null);
  const [studentPackage, setStudentPackage] = useState(null);
  const [loading, setLoading] = useState(!features);

  useEffect(() => {
    const auth = new AuthServices();
    const role = auth.getRole();

    if (role === 'student') {
      studentApi.accessStatus()
        .then((data) => {
          const next = data.features || null;
          setFeatures(next);
          setPackageAccess(data.packageAccess || null);
          setStudentPackage(data.package || null);
          const stored = getStoredTenant();
          if (stored && next) setStoredTenant({ ...stored, features: next });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
      return;
    }

    auth.me()
      .then((data) => {
        const next = data.tenant?.features || null;
        setFeatures(next);
        setPackageAccess(null);
        setStudentPackage(null);
        const stored = getStoredTenant();
        if (data.tenant && stored) {
          setStoredTenant({ ...stored, features: next });
        } else if (data.tenant) {
          setStoredTenant(data.tenant);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const enabledKeys = FEATURE_KEYS.filter((key) => isFeatureEnabled(features, key));

  return {
    features,
    packageAccess,
    studentPackage,
    loading,
    enabledKeys,
    isEnabled: (key) => isFeatureEnabled(features, key),
  };
}
