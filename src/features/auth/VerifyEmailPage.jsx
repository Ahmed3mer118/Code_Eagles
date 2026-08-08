import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import AuthServices from '../../shared/api/authService';
import { resolveReturnTo } from '../../shared/guards/RoleGuard';

export default function VerifyEmailPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const auth = new AuthServices();
  const [email, setEmail] = useState(params.get('email') || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const returnTo = resolveReturnTo(params, '/dashboard/student/join');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await auth.verifyEmail(email, code);
      if (res?.accessToken) {
        auth.setToken(res.accessToken);
        if (res.user?.name) localStorage.setItem('ce_user_name', res.user.name);
        if (res.user?.preferredLanguage) {
          i18n.changeLanguage(res.user.preferredLanguage);
          localStorage.setItem('ce_lang', res.user.preferredLanguage);
        }
        toast.success(t('auth.verifySuccess'));
        if (res.role === 'student' && returnTo) navigate(returnTo);
        else navigate(res.dashboardPath || auth.getDashboardPath(res.role));
        return;
      }
      toast.success(t('common.success'));
      const loginQs = new URLSearchParams({ email });
      if (params.get('returnTo')) loginQs.set('returnTo', params.get('returnTo'));
      else {
        if (params.get('group')) loginQs.set('group', params.get('group'));
        if (params.get('academy')) loginQs.set('academy', params.get('academy'));
      }
      navigate(`/auth/login?${loginQs.toString()}`);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Toaster position="top-center" />
      <form onSubmit={onSubmit} className="ce-card w-full max-w-md p-6 md:p-8">
        <h1 className="mb-6 text-center text-2xl font-extrabold text-[var(--ce-primary)]">{t('auth.verifyTitle')}</h1>
        <label className="ce-label">{t('auth.email')}</label>
        <input type="email" className="ce-input mb-4" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label className="ce-label">{t('auth.verifyCode')}</label>
        <input className="ce-input mb-5" value={code} onChange={(e) => setCode(e.target.value)} minLength={6} maxLength={6} required />
        <button type="submit" className="ce-btn ce-btn-primary w-full" disabled={loading}>
          {loading ? t('common.loading') : t('auth.verifySubmit')}
        </button>
        <p className="mt-4 text-center text-sm">
          <Link to={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-[var(--ce-primary)]">{t('nav.login')}</Link>
        </p>
      </form>
    </div>
  );
}
