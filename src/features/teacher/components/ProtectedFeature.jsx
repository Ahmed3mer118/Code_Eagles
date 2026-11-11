import { Navigate, Outlet } from 'react-router-dom';
import { usePlanFeatures } from '@/shared/hooks/usePlanFeatures';

export default function ProtectedFeature({ feature }) {
  const { hasFeature } = usePlanFeatures();

  // لو الميزة مقفولة، بنوديه للداشبورد
  if (!hasFeature(feature)) {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  return <Outlet />;
}
