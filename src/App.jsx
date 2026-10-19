// src/App.jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useSearchParams,
} from 'react-router-dom';
import ErrorBoundary from './shared/components/ErrorBoundary';
import { isAuthenticated } from './shared/api/client';

// ===== Auth Pages =====
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import VerifyEmailPage from './features/auth/VerifyEmailPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import SelectTenantPage from './features/auth/SelectTenantPage';
import DashboardPage from './features/dashboard/DashboardPage';
import MySubscriptionPage from './features/dashboard/MySubscriptionPage';
import { SuperAdminRoutes, SuperAdminGuard } from './features/superadmin';
import LandingPage from './features/landing/LandingPage';
import AcademyPublicPage from './features/landing/AcademyPublicPage';
import ContactPage from './features/landing/ContactPage';

// ===== Teacher, Student, Parent & Assistant =====
import TeacherRoutes from './features/teacher/TeacherRoutes';
import StudentRoutes from './features/student/StudentRoutes';
import ParentRoutes from './features/parent/ParentRoutes';
import AssistantRoutes from './features/assistant/AssistantRoutes'; // 🆕

function Protected({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  return isAuthenticated() ? <Navigate to="/select-tenant" replace /> : children;
}

function RootRedirect() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || searchParams.get('code') || searchParams.get('verificationToken');
  if (token) return <Navigate to={`/verify-email?token=${encodeURIComponent(token)}`} replace />;
  const verified = searchParams.get('verified');
  if (verified === '1' || verified === 'true') return <Navigate to="/login?verified=1" replace />;
  return <LandingPage />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* ✅ 1. مسار الطالب */}
          <Route path="/student/*" element={<StudentRoutes />} />

          {/* ✅ 2. مسار المدرس */}
          <Route path="/teacher/*" element={<TeacherRoutes />} />

          {/* ✅ 3. مسار ولي الأمر */}
          <Route path="/parent/*" element={<ParentRoutes />} />

          {/* ✅ 4. مسار المساعد (جديد) */}
          <Route path="/assistant/*" element={<AssistantRoutes />} />

          {/* ✅ 5. مسار الأدمن */}
          <Route path="/admin/*" element={<SuperAdminGuard><SuperAdminRoutes /></SuperAdminGuard>} />

          {/* ==================== PUBLIC ==================== */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/academy/:slug" element={<AcademyPublicPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* ==================== AUTH ==================== */}
          <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
          <Route path="/auth/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
          <Route path="/auth/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />

          {/* ==================== VERIFY EMAIL ==================== */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/verify-email/:token" element={<VerifyEmailPage />} />

          {/* ==================== PASSWORD RESET ==================== */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ForgotPasswordPage />} />

          {/* ==================== POST LOGIN ==================== */}
          <Route path="/select-tenant" element={<Protected><SelectTenantPage /></Protected>} />
          <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
          <Route path="/dashboard/subscription" element={<Protected><MySubscriptionPage /></Protected>} />
          <Route path="/subscription" element={<Protected><MySubscriptionPage /></Protected>} />

          {/* ==================== 404 ==================== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
