// src/features/parent/ParentRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import ParentGuard from './ParentGuard';
import ParentLayout from './ParentLayout';
import ParentDashboard from './pages/ParentDashboard';
import ParentChildren from './pages/ParentChildren';
import ParentGrades from './pages/ParentGrades';
import ParentPoints from './pages/ParentPoints';
import ParentPayments from './pages/ParentPayments';
import ParentEnrollments from './pages/ParentEnrollments';
import ParentProfile from './pages/ParentProfile';
import ParentLinkRequests from './pages/ParentLinkRequests'; // 🆕
import ParentNotifications from './pages/ParentNotifications'; // 🆕
import ParentAssignments from './pages/ParentAssignments'; // 🆕
import ParentQuizzes from './pages/ParentQuizzes'; // 🆕

export default function ParentRoutes() {
  return (
    <Routes>
      <Route element={<ParentGuard />}>
        <Route element={<ParentLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ParentDashboard />} />
          <Route path="children" element={<ParentChildren />} />
          <Route path="requests" element={<ParentLinkRequests />} />
          <Route path="notifications" element={<ParentNotifications />} />
          
          <Route path="grades" element={<ParentGrades />} />
          <Route path="points" element={<ParentPoints />} />
          <Route path="quizzes" element={<ParentQuizzes />} />
          <Route path="assignments" element={<ParentAssignments />} />
          
          <Route path="enrollments" element={<ParentEnrollments />} />
          <Route path="payments" element={<ParentPayments />} />
          
          <Route path="profile" element={<ParentProfile />} />
        </Route>
      </Route>
    </Routes>
  );
}
