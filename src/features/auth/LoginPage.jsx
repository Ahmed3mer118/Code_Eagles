import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import AuthServices from '../../shared/api/authService';
import { buildRegisterUrl, resolveReturnTo } from '../../shared/guards/RoleGuard';
import { getCleanParam } from '../../shared/utils/queryParams';
import getApiErrorMessage from '../../shared/utils/apiError';
import { resolveStudentPostLoginPath } from '../student/useStudentAcademy';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const auth = new AuthServices();

  const [email, setEmail] = useState(getCleanParam(params, 'email') || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const returnTo = resolveReturnTo(params, null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await auth.login(email.trim(), password);

      if (res?.user?.preferredLanguage) {
        i18n.changeLanguage(res.user.preferredLanguage);
      }

      const role = res?.role || res?.user?.role || auth.getRole();
      const dashboardPath = res?.dashboardPath || auth.getDashboardPath(role);

      if (role === 'student') {
        const studentPath = await resolveStudentPostLoginPath(returnTo);
        toast.success(t('auth.loginSuccess'));
        navigate(studentPath);
        return;
      }

      toast.success(t('auth.loginSuccess'));

      if (
        returnTo &&
        ['teacher', 'assistant'].includes(role) &&
        returnTo.includes('/join')
      ) {
        navigate(dashboardPath);
      } else if (returnTo) {
        navigate(returnTo);
      } else {
        navigate(dashboardPath);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ✅ بدء Google OAuth flow
  const handleGoogleLogin = () => {
    const googleUrl = auth.getGoogleAuthUrl(returnTo || undefined);
    window.location.href = googleUrl;
  };

  const registerHref = buildRegisterUrl(returnTo, {
    academy: getCleanParam(params, 'academy'),
    group: getCleanParam(params, 'group'),
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Toaster position="top-center" />
      <form onSubmit={onSubmit} className="ce-card w-full max-w-md p-6 md:p-8">
        <div className="mb-6 text-center">
          <img src="/images/LOGO.png" alt="" className="mx-auto mb-3 h-14 w-14" />
          <h1 className="text-2xl font-extrabold text-[var(--ce-primary)]">
            {t('auth.loginTitle')}
          </h1>
          {returnTo && (
            <p className="mt-2 text-sm text-[var(--ce-muted)]">
              {t('auth.continueJoinFlow')}
            </p>
          )}
        </div>

        <label className="ce-label" htmlFor="email">
          {t('auth.email')}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="ce-input mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="ce-label" htmlFor="password">
          {t('auth.password')}
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="ce-input mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="mb-5 text-end">
          <Link
            to="/auth/forget-password"
            className="text-sm font-semibold text-[var(--ce-primary)]"
          >
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <button
          type="submit"
          className="ce-btn ce-btn-primary w-full"
          disabled={loading}
        >
          {loading ? t('common.loading') : t('auth.submitLogin')}
        </button>

        {/* ✅ فاصل */}
        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-[var(--ce-border)]" />
          <span className="text-xs font-semibold text-[var(--ce-muted)]">
            {t('auth.or')}
          </span>
          <span className="h-px flex-1 bg-[var(--ce-border)]" />
        </div>

        {/* ✅ زر Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="ce-btn flex w-full items-center justify-center gap-3 border border-[var(--ce-border)] bg-white text-[var(--ce-primary)] hover:bg-gray-50"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C41.9 35.5 44 30.1 44 24c0-1.3-.1-2.4-.4-3.5z"
            />
          </svg>
          <span className="font-semibold">{t('auth.continueWithGoogle')}</span>
        </button>

        <p className="mt-5 text-center text-sm text-[var(--ce-muted)]">
          {t('auth.noAccount')}{' '}
          <Link to={registerHref} className="font-bold text-[var(--ce-accent)]">
            {t('nav.register')}
          </Link>
        </p>
      </form>
    </div>
  );
}