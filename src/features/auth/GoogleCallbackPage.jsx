import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import AuthServices from '../../shared/api/authService';
import LoadingScreen from '../../shared/ui/LoadingScreen';
import { resolveStudentPostLoginPath } from '../student/useStudentAcademy';
import getApiErrorMessage from '../../shared/utils/apiError';

export default function GoogleCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const auth = new AuthServices();
  const [error, setError] = useState(null);
  const processed = useRef(false);

  useEffect(() => {
    // ⚠️ React StrictMode بيشغل useEffect مرتين في dev → نمنع التكرار
    if (processed.current) return;
    processed.current = true;

    const run = async () => {
      try {
        // ✅ التوكن جاي من الباك في الـ query string
        const { role: cbRole } = auth.handleGoogleCallback(params);

        const role = cbRole || auth.getRole();
        const dashboardPath = auth.getDashboardPath(role);
        const returnTo = params.get('state') || null;

        toast.success(t('auth.loginSuccess'));

        // 🎓 لو طالب → resolve مسار مخصص
        if (role === 'student') {
          const studentPath = await resolveStudentPostLoginPath(returnTo);
          navigate(studentPath, { replace: true });
          return;
        }

        // 🧭 باقي الأدوار
        if (returnTo && returnTo.startsWith('/')) {
          navigate(returnTo, { replace: true });
        } else {
          navigate(dashboardPath, { replace: true });
        }
      } catch (err) {
        const message = getApiErrorMessage(err, 'auth.googleLoginFailed');
        setError(message);
        toast.error(message);
        window.setTimeout(
          () => navigate('/auth/login', { replace: true }),
          2500
        );
      }
    };

    run();
  }, [auth, navigate, params, t]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Toaster position="top-center" />
      <div className="ce-card w-full max-w-md p-6 text-center md:p-8">
        <img src="/images/LOGO.png" alt="" className="mx-auto mb-4 h-14 w-14" />
        {error ? (
          <>
            <h1 className="mb-2 text-xl font-extrabold text-[var(--ce-primary)]">
              {t('auth.googleLoginFailed')}
            </h1>
            <p className="text-sm text-[var(--ce-muted)]">{error}</p>
            <p className="mt-4 text-xs text-[var(--ce-muted)]">
              {t('auth.redirectingToLogin')}
            </p>
          </>
        ) : (
          <>
            <LoadingScreen />
            <p className="mt-4 text-sm text-[var(--ce-muted)]">
              {t('auth.completingGoogleLogin')}
            </p>
          </>
        )}
      </div>
    </div>
  );
}