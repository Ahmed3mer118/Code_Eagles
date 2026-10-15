import { Navigate, Route, Routes } from 'react-router-dom';

import SuperAdminLayout from './SuperAdminLayout';
import DashboardOverview from './pages/DashboardOverview';
import AcademiesPage from './pages/AcademiesPage';
import MessagesPage from './pages/MessagesPage';
import UsersPage from './pages/UsersPage';                       // ⭐ لازم يكون موجود
import PlaceholderPage from './pages/PlaceholderPage';
import ProfilePage from './pages/ProfilePage';
import ContentManagementPage from './pages/content/ContentManagementPage';
import PlansPage from './pages/PlansPage';
import RequestsPage from './pages/RequestsPage';

import { IconBell } from './icons';

export default function SuperAdminRoutes() {
  return (
    <SuperAdminLayout>
      <Routes>
        <Route path="dashboard"     element={<DashboardOverview />} />
        <Route path="academies"     element={<AcademiesPage />} />
        <Route path="requests"      element={<RequestsPage />} />
        <Route path="messages"      element={<MessagesPage />} />
        <Route path="plans"         element={<PlansPage />} />
        <Route path="content"       element={<ContentManagementPage />} />
        <Route path="users"         element={<UsersPage />} />        {/* ⭐ هنا التعديل */}
        <Route path="notifications" element={<PlaceholderPage sectionKey="notifications" Icon={IconBell} />} />
        <Route path="settings"      element={<ProfilePage />} />
        <Route path="*"             element={<Navigate to="dashboard" replace />} />
      </Routes>
    </SuperAdminLayout>
  );
}
