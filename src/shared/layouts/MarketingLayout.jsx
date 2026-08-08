import { Outlet } from 'react-router-dom';
import MarketingNavbar from '../../features/marketing/components/MarketingNavbar';
import MarketingFooter from '../../features/marketing/components/MarketingFooter';

export default function MarketingLayout() {
  return (
    <div className="min-h-screen pb-mobile-nav">
      <MarketingNavbar />
      <Outlet />
      <MarketingFooter />
    </div>
  );
}
