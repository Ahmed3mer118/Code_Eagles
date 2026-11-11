import { Navigate, useLocation } from 'react-router-dom';
import { usePlanFeatures } from '../hooks/usePlanFeatures';

export function FeatureRoute({ feature, children }) {
  const { hasFeature } = usePlanFeatures();
  const location = useLocation();

  // لو الميزة مش متاحة، نوجه المستخدم لصفحة الترقية
  if (!hasFeature(feature)) {
    return (
      <Navigate 
        to="/teacher/upgrade" 
        state={{ from: location.pathname, featureName: feature }} 
        replace 
      />
    );
  }

  return children;
}
