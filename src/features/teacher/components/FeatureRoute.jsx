// src/features/teacher/components/FeatureRoute.jsx
import { Navigate } from 'react-router-dom';
import { usePlanFeatures } from '@/shared/hooks/usePlanFeatures';

export default function FeatureRoute({ feature, children }) {
  const { hasFeature } = usePlanFeatures();

  // لو الميزة مقفولة، بنطيره للداشبورد
  if (!hasFeature(feature)) {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  // لو مفتوحة، بنعرض الصفحة
  return children;
}
