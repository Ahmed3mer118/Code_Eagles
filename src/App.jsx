import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './shared/components/ErrorBoundary.jsx';
import LoadingScreen from './shared/ui/LoadingScreen.jsx';
import RoleGuard from './shared/guards/RoleGuard.jsx';
import MarketingLayout from './shared/layouts/MarketingLayout.jsx';

const LandingPage = React.lazy(() => import('./features/marketing/LandingPage.jsx'));
const ContactPage = React.lazy(() => import('./features/contact/ContactPage.jsx'));
const LoginPage = React.lazy(() => import('./features/auth/LoginPage.jsx'));
const RegisterPage = React.lazy(() => import('./features/auth/RegisterPage.jsx'));
const VerifyEmailPage = React.lazy(() => import('./features/auth/VerifyEmailPage.jsx'));
const ForgotPasswordPage = React.lazy(() => import('./features/auth/ForgotPasswordPage.jsx'));
const NotFoundPage = React.lazy(() => import('./shared/pages/NotFoundPage.jsx'));

const SuperAdminDashboard = React.lazy(() => import('./features/dashboards/superAdmin/SuperAdminDashboard.jsx'));
const TeacherDashboard = React.lazy(() => import('./features/dashboards/teacher/TeacherDashboard.jsx'));
const AssistantDashboard = React.lazy(() => import('./features/dashboards/assistant/AssistantDashboard.jsx'));
const ParentDashboard = React.lazy(() => import('./features/dashboards/parent/ParentDashboard.jsx'));
const StudentDashboard = React.lazy(() => import('./features/dashboards/student/StudentDashboard.jsx'));

const SuperAdminOverview = React.lazy(() => import('./features/dashboards/superAdmin/SuperAdminOverview.jsx'));
const TenantsPage = React.lazy(() => import('./features/dashboards/superAdmin/TenantsPage.jsx'));
const SubscriptionsPage = React.lazy(() => import('./features/dashboards/superAdmin/SubscriptionsPage.jsx'));
const TeacherOverview = React.lazy(() => import('./features/dashboards/teacher/TeacherOverview.jsx'));
const SubjectsPage = React.lazy(() => import('./features/content/ContentHubPage.jsx'));
const GroupsPage = React.lazy(() => import('./features/groups/GroupsPage.jsx'));
const AssistantsPage = React.lazy(() => import('./features/assistants/AssistantsPage.jsx'));
const TeacherQuizzesPage = React.lazy(() => import('./features/quizzes/TeacherQuizzesPage.jsx'));
const PaymentReviewPage = React.lazy(() => import('./features/payments/PaymentReviewPage.jsx'));
const PaymentPlansPage = React.lazy(() => import('./features/payments/PaymentPlansPage.jsx'));
const PaymentHistoryPage = React.lazy(() => import('./features/payments/PaymentHistoryPage.jsx'));
const PaymentSubmitPage = React.lazy(() => import('./features/payments/PaymentSubmitPage.jsx'));
const StudentCoursesPage = React.lazy(() => import('./features/student/StudentCoursesPage.jsx'));
const StudentJoinPage = React.lazy(() => import('./features/student/StudentJoinPage.jsx'));
const StudentQuizzesPage = React.lazy(() => import('./features/student/StudentQuizzesPage.jsx'));
const ExamPreFlightPage = React.lazy(() => import('./features/exams/pages/ExamPreFlightPage.jsx'));
const ExamTakingPage = React.lazy(() => import('./features/exams/pages/ExamTakingPage.jsx'));
const ExamResultsPage = React.lazy(() => import('./features/exams/pages/ExamResultsPage.jsx'));
const ExamHistoryPage = React.lazy(() => import('./features/exams/pages/ExamHistoryPage.jsx'));
const AttemptReviewPage = React.lazy(() => import('./features/exams/pages/AttemptReviewPage.jsx'));
const PendingJoinRequestsPage = React.lazy(() => import('./features/teacher/PendingJoinRequestsPage.jsx'));
const TeacherResultsPage = React.lazy(() => import('./features/teacher/TeacherResultsPage.jsx'));
const StudentLeaderboardPage = React.lazy(() => import('./features/student/StudentLeaderboardPage.jsx'));
const SettingsPage = React.lazy(() => import('./features/settings/SettingsPage.jsx'));
const TeacherAssignmentsPage = React.lazy(() => import('./features/assignments/TeacherAssignmentsPage.jsx'));
const AssignmentReviewPage = React.lazy(() => import('./features/assignments/AssignmentReviewPage.jsx'));
const StudentAssignmentsPage = React.lazy(() => import('./features/assignments/StudentAssignmentsPage.jsx'));
const StudentOverviewPage = React.lazy(() => import('./features/student/StudentOverviewPage.jsx'));
const AcademyPublicPage = React.lazy(() => import('./features/academy/AcademyPublicPage.jsx'));

const withRole = (roles, element) => <RoleGuard roles={roles}>{element}</RoleGuard>;

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <MarketingLayout />,
      children: [
        { index: true, element: <LandingPage /> },
        { path: 'contact', element: <ContactPage /> },
      ],
    },
    {
      path: '/auth',
      children: [
        { path: 'login', element: <LoginPage /> },
        { path: 'register', element: <RegisterPage /> },
        { path: 'verif-email', element: <VerifyEmailPage /> },
        { path: 'forget-password', element: <ForgotPasswordPage /> },
      ],
    },
    {
      path: '/dashboard/super-admin',
      element: withRole(['super_admin'], <SuperAdminDashboard />),
      children: [
        { index: true, element: <SuperAdminOverview /> },
        { path: 'tenants', element: <TenantsPage /> },
        { path: 'subscriptions', element: <SubscriptionsPage /> },
        { path: 'settings', element: <SettingsPage /> },
      ],
    },
    {
      path: '/dashboard/teacher',
      element: withRole(['teacher'], <TeacherDashboard />),
      children: [
        { index: true, element: <TeacherOverview /> },
        { path: 'subjects', element: <SubjectsPage /> },
        { path: 'groups', element: <GroupsPage /> },
        { path: 'requests', element: <PendingJoinRequestsPage /> },
        { path: 'quizzes', element: <TeacherQuizzesPage /> },
        { path: 'quizzes/:quizId/review/:attemptId', element: <AttemptReviewPage /> },
        { path: 'results', element: <TeacherResultsPage /> },
        { path: 'payments', element: <PaymentReviewPage /> },
        { path: 'payment-plans', element: <PaymentPlansPage /> },
        { path: 'payment-history', element: <PaymentHistoryPage /> },
        { path: 'assignments', element: <TeacherAssignmentsPage /> },
        { path: 'assignments/:id', element: <AssignmentReviewPage /> },
        { path: 'assistants', element: <AssistantsPage /> },
        { path: 'settings', element: <SettingsPage /> },
      ],
    },
    {
      path: '/dashboard/assistant',
      element: withRole(['assistant'], <AssistantDashboard />),
      children: [
        { index: true, element: <Navigate to="groups" replace /> },
        { path: 'groups', element: <GroupsPage /> },
        { path: 'requests', element: <PendingJoinRequestsPage /> },
        { path: 'payments', element: <PaymentReviewPage /> },
        { path: 'content', element: <SubjectsPage /> },
        { path: 'quizzes', element: <TeacherQuizzesPage /> },
        { path: 'quizzes/:quizId/review/:attemptId', element: <AttemptReviewPage /> },
        { path: 'results', element: <TeacherResultsPage /> },
        { path: 'payments', element: <PaymentReviewPage /> },
        { path: 'assignments', element: <TeacherAssignmentsPage /> },
        { path: 'assignments/:id', element: <AssignmentReviewPage /> },
        { path: 'settings', element: <SettingsPage /> },
      ],
    },
    {
      path: '/dashboard/parent',
      element: withRole(['parent'], <ParentDashboard />),
      children: [
        { index: true, element: <Navigate to="payments" replace /> },
        { path: 'payments', element: <PaymentSubmitPage /> },
        { path: 'settings', element: <SettingsPage /> },
      ],
    },
    {
      path: '/dashboard/student',
      element: withRole(['student'], <StudentDashboard />),
      children: [
        { index: true, element: <StudentOverviewPage /> },
        { path: 'join', element: <StudentJoinPage /> },
        { path: 'courses', element: <StudentCoursesPage /> },
        { path: 'assignments', element: <StudentAssignmentsPage /> },
        { path: 'payments', element: <PaymentSubmitPage /> },
        { path: 'quizzes', element: <StudentQuizzesPage /> },
        { path: 'quizzes/history', element: <ExamHistoryPage /> },
        { path: 'quizzes/:quizId', element: <ExamPreFlightPage /> },
        { path: 'quizzes/:quizId/attempt/:attemptId', element: <ExamTakingPage /> },
        { path: 'quizzes/:quizId/results/:attemptId', element: <ExamResultsPage /> },
        { path: 'leaderboard', element: <StudentLeaderboardPage /> },
        { path: 'settings', element: <SettingsPage /> },
      ],
    },
    {
      path: '/academy/:slug',
      element: <AcademyPublicPage />,
    },
    { path: '/dashboard', element: <Navigate to="/dashboard/super-admin" replace /> },
    { path: '/instructor', element: <Navigate to="/dashboard/teacher" replace /> },
    { path: '/my-courses', element: <Navigate to="/dashboard/student/courses" replace /> },
    { path: '*', element: <NotFoundPage /> },
  ]);

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Toaster position="top-center" />
        <Suspense fallback={<LoadingScreen />}>
          <RouterProvider router={router} />
        </Suspense>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
