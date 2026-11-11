// src/shared/hooks/usePlanFeatures.js
import { useAuth } from '@/shared/context/AuthContext';

export function usePlanFeatures() {
  const { user, activeTenant } = useAuth(); 
  const features = activeTenant?.planFeatures || activeTenant?.platformPlan?.features || user?.planFeatures || {};

  const hasFeature = (featureName) => {
    if (!features) return false;
    
    if (typeof features === 'object' && !Array.isArray(features)) {
      return features[featureName] === true;
    }
    
    if (Array.isArray(features)) {
      return features.includes(featureName);
    }

    return false;
  };

  return { hasFeature, features };
}
