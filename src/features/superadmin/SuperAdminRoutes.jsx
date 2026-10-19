// src/features/superadmin/SuperAdminRoutes.jsx
import { Navigate, Route, Routes } from 'react-router-dom';

import SuperAdminLayout from './SuperAdminLayout';
import DashboardOverview from './pages/DashboardOverview';
import AcademiesPage from './pages/AcademiesPage';
import MessagesPage from './pages/MessagesPage';
import UsersPage from './pages/UsersPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ContentManagementPage from './pages/content/ContentManagementPage';
import PlansPage from './pages/PlansPage';
import RequestsPage from './pages/RequestsPage';

// ✅ Settings tabs
import SettingsPage from './pages/settings/SettingsPage';
import ProfileTab from './pages/settings/ProfileTab';
import SecurityPage from './pages/settings/SecurityPage';

import { IconBell } from './icons';

export default function SuperAdminRoutes() {
  return (
    <SuperAdminLayout>
      <Routes>
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="academies" element={<AcademiesPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="content" element={<ContentManagementPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route
          path="notifications"
          element={<PlaceholderPage sectionKey="notifications" Icon={IconBell} />}
        />

        {/* ✅ Settings (Tabs) */}
        <Route path="settings" element={<SettingsPage />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfileTab />} />
          <Route path="security" element={<SecurityPage />} />
        </Route>

        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </SuperAdminLayout>
  );
}
