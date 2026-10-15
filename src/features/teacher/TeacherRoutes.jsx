import { Routes, Route, Navigate } from 'react-router-dom';
import TeacherLayout from './TeacherLayout';
import DashboardOverview from './pages/DashboardOverview';
import PendingRequestsPage from './pages/pending-requests/PendingRequestsPage';
import StudentsPage from './pages/students/StudentsPage';
import ParentsPage from './pages/parents/ParentsPage';
import SubjectsPage from './pages/subjects/SubjectsPage';
import SubjectDetailPage from './pages/subjects/SubjectDetailPage';
import CoursesPage from './pages/courses/CoursesPage';
import LecturesPage from './pages/lectures/LecturesPage';
import GroupsPage from './pages/groups/GroupsPage';
import GroupDetailPage from './pages/groups/GroupDetailPage';
import QuizzesPage from './pages/quizzes/QuizzesPage';
import QuizBuilderPage from './pages/quizzes/QuizBuilderPage';
import AssignmentsPage from './pages/assignments/AssignmentsPage';
import AssignmentDetailPage from './pages/assignments/AssignmentDetailPage';
import QuestionsBankPage from './pages/questions-bank/QuestionsBankPage';
import PointsPage from './pages/points/PointsPage';
import LeaderboardPage from './pages/points/LeaderboardPage';
import ReportsPage from './pages/reports/ReportsPage';
import PendingPaymentsPage from './pages/payments/PendingPaymentsPage';
import PaymentPlansPage from './pages/payments/PaymentPlansPage';
import PromoCodesPage from './pages/payments/PromoCodesPage';
import PaymentHistoryPage from './pages/payments/PaymentHistoryPage';
import PlatformSubscriptionPage from './pages/payments/PlatformSubscriptionPage';
import PaySubscriptionPage from './pages/payments/PaySubscriptionPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import SettingsPage from './pages/settings/SettingsPage';
import SecurityPage from './pages/settings/SecurityPage';
import TenantSettingsTab from './pages/settings/TenantSettingsTab';
import ProfileTab from './pages/settings/ProfileTab';
import AssistantsTab from './pages/settings/AssistantsTab';
import TeacherGuard from './TeacherGuard';

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route element={<TeacherGuard />}>
        <Route element={<TeacherLayout />}>
          {/* Dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverview />} />

          {/* Students */}
          <Route path="pending-requests" element={<PendingRequestsPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="parents" element={<ParentsPage />} />

          {/* Content */}
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="subjects/:id" element={<SubjectDetailPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="lectures" element={<LecturesPage />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="groups/:id" element={<GroupDetailPage />} />

          {/* Assessments */}
          <Route path="quizzes" element={<QuizzesPage />} />
          <Route path="quizzes/:id" element={<QuizBuilderPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="assignments/:id" element={<AssignmentDetailPage />} />
          <Route path="questions-bank" element={<QuestionsBankPage />} />

          {/* Gamification */}
          <Route path="points" element={<PointsPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />

          {/* Reports */}
          <Route path="reports" element={<ReportsPage />} />

          {/* Payments */}
          <Route path="payments/pending" element={<PendingPaymentsPage />} />
          <Route path="payments/plans" element={<PaymentPlansPage />} />
          <Route path="payments/promo-codes" element={<PromoCodesPage />} />
          <Route path="payments/history" element={<PaymentHistoryPage />} />

          {/* Platform Subscription */}
          <Route path="subscription" element={<PlatformSubscriptionPage />} />
          <Route path="subscription/pay" element={<PaySubscriptionPage />} />

          {/* Notifications */}
          <Route path="notifications" element={<NotificationsPage />} />

          {/* Settings */}
          <Route path="settings" element={<SettingsPage />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="tenant" element={<TenantSettingsTab />} />
            <Route path="profile" element={<ProfileTab />} />
            <Route path="assistants" element={<AssistantsTab />} />
            <Route path="security" element={<SecurityPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
