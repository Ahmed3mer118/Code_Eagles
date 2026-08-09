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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const returnTo = resolveReturnTo(params, null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await auth.login(email, password);
      if (res?.user?.preferredLanguage) {
        i18n.changeLanguage(res.user.preferredLanguage);
      }

      if (res.role === 'student') {
        const studentPath = await resolveStudentPostLoginPath(returnTo);
        navigate(studentPath);
        toast.success(t('auth.loginSuccess'));
        return;
      }

      toast.success(t('auth.loginSuccess'));

      if (returnTo && ['teacher', 'assistant'].includes(res.role) && returnTo.includes('/join')) {
        navigate(res.dashboardPath || auth.getDashboardPath(res.role));
      } else if (returnTo) {
        navigate(returnTo);
      } else {
        navigate(res.dashboardPath || auth.getDashboardPath(res.role));
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-extrabold text-[var(--ce-primary)]">{t('auth.loginTitle')}</h1>
          {returnTo && <p className="mt-2 text-sm text-[var(--ce-muted)]">{t('auth.continueJoinFlow')}</p>}
        </div>

        <label className="ce-label" htmlFor="email">{t('auth.email')}</label>
        <input id="email" type="email" className="ce-input mb-4" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label className="ce-label" htmlFor="password">{t('auth.password')}</label>
        <input id="password" type="password" className="ce-input mb-2" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <div className="mb-5 text-end">
          <Link to="/auth/forget-password" className="text-sm font-semibold text-[var(--ce-primary)]">{t('auth.forgotPassword')}</Link>
        </div>

        <button type="submit" className="ce-btn ce-btn-primary w-full" disabled={loading}>
          {loading ? t('common.loading') : t('auth.submitLogin')}
        </button>

        <p className="mt-5 text-center text-sm text-[var(--ce-muted)]">
          {t('auth.noAccount')}{' '}
          <Link to={registerHref} className="font-bold text-[var(--ce-accent)]">{t('nav.register')}</Link>
        </p>
      </form>
    </div>
  );
}
