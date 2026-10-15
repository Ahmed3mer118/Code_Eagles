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

// ===== Subscription =====
import MySubscriptionPage from './features/dashboard/MySubscriptionPage';

// ===== Super Admin =====
import { SuperAdminRoutes, SuperAdminGuard } from './features/superadmin';

// ===== Landing & Marketing =====
import LandingPage from './features/landing/LandingPage';
import AcademyPublicPage from './features/landing/AcademyPublicPage';
import ContactPage from './features/landing/ContactPage';

// ===== Teacher =====
import TeacherRoutes from './features/teacher/TeacherRoutes';

/* ============================================================
   Guards
   ============================================================ */

function Protected({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  return isAuthenticated() ? (
    <Navigate to="/select-tenant" replace />
  ) : (
    children
  );
}

function RootRedirect() {
  const [searchParams] = useSearchParams();

  const token =
    searchParams.get('token') ||
    searchParams.get('code') ||
    searchParams.get('verificationToken');

  if (token) {
    return (
      <Navigate
        to={`/verify-email?token=${encodeURIComponent(token)}`}
        replace
      />
    );
  }

  const verified = searchParams.get('verified');
  if (verified === '1' || verified === 'true') {
    return <Navigate to="/login?verified=1" replace />;
  }

  return <LandingPage />;
}

/* ============================================================
   App
   ============================================================ */

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* ==================== PUBLIC ==================== */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/academy/:slug" element={<AcademyPublicPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* ==================== AUTH ==================== */}
          <Route
            path="/login"
            element={
              <PublicOnly>
                <LoginPage />
              </PublicOnly>
            }
          />
          <Route
            path="/auth/login"
            element={
              <PublicOnly>
                <LoginPage />
              </PublicOnly>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnly>
                <RegisterPage />
              </PublicOnly>
            }
          />
          <Route
            path="/auth/register"
            element={
              <PublicOnly>
                <RegisterPage />
              </PublicOnly>
            }
          />

          {/* ==================== VERIFY EMAIL ==================== */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/verify" element={<VerifyEmailPage />} />
          <Route path="/activate" element={<VerifyEmailPage />} />

          {/* ==================== PASSWORD RESET ==================== */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ForgotPasswordPage />} />

          {/* ==================== POST LOGIN ==================== */}
          <Route
            path="/select-tenant"
            element={
              <Protected>
                <SelectTenantPage />
              </Protected>
            }
          />
          <Route
            path="/dashboard"
            element={
              <Protected>
                <DashboardPage />
              </Protected>
            }
          />

          {/* ==================== SUBSCRIPTION ==================== */}
          <Route
            path="/dashboard/subscription"
            element={
              <Protected>
                <MySubscriptionPage />
              </Protected>
            }
          />
          <Route
            path="/subscription"
            element={
              <Protected>
                <MySubscriptionPage />
              </Protected>
            }
          />

          <Route
            path="/onboarding"
            element={
              <Protected>
                <div className="min-h-screen flex items-center justify-center text-2xl font-bold">
                  🚧 Onboarding (coming soon)
                </div>
              </Protected>
            }
          />

          {/* ==================== TEACHER ==================== */}
          <Route path="/teacher/*" element={<TeacherRoutes />} />

          {/* ==================== SUPER ADMIN ==================== */}
          <Route
            path="/admin/*"
            element={
              <SuperAdminGuard>
                <SuperAdminRoutes />
              </SuperAdminGuard>
            }
          />

          {/* ==================== 404 ==================== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
