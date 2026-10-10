import { Navigate, Route, Routes } from 'react-router-dom';

import SuperAdminLayout from './SuperAdminLayout';
import DashboardOverview from './pages/DashboardOverview';
import AcademiesPage from './pages/AcademiesPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ProfilePage from './pages/ProfilePage';
import ContentManagementPage from './pages/content/ContentManagementPage';
import PlansPage from './pages/PlansPage';

import {
  IconAcademy,
  IconRequests,
  IconMessages,
  IconPlans,
  IconUsers,
  IconBell,
} from './icons';

export default function SuperAdminRoutes() {
  return (
    <SuperAdminLayout>
      <Routes>
        <Route path="dashboard"     element={<DashboardOverview />} />
        <Route path="academies"     element={<AcademiesPage />} />
        <Route path="requests"      element={<PlaceholderPage sectionKey="requests"      Icon={IconRequests} />} />
        <Route path="messages"      element={<PlaceholderPage sectionKey="messages"      Icon={IconMessages} />} />
        <Route path="plans"         element={<PlansPage />} />
        <Route path="content"       element={<ContentManagementPage />} />
        <Route path="users"         element={<PlaceholderPage sectionKey="users"         Icon={IconUsers} />} />
        <Route path="notifications" element={<PlaceholderPage sectionKey="notifications" Icon={IconBell} />} />
        <Route path="settings"      element={<ProfilePage />} />
        <Route path="*"             element={<Navigate to="dashboard" replace />} />
      </Routes>
    </SuperAdminLayout>
  );
}