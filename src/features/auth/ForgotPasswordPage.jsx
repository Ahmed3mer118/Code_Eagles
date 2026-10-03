import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import AuthServices from '../../shared/api/authService';
import { getCleanParam } from '../../shared/utils/queryParams';
import getApiErrorMessage from '../../shared/utils/apiError';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const auth = new AuthServices();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(getCleanParam(params, 'token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const requestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.forgotPassword(email.trim());
      toast.success(t('auth.resetEmailSent'));
      setStep(2);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const reset = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t('auth.passwordsDontMatch'));
      return;
    }

    setLoading(true);
    try {
      await auth.resetPassword(token.trim(), password, confirmPassword);
      toast.success(t('auth.resetSuccess'));
      setStep(3);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Toaster position="top-center" />
      <div className="ce-card w-full max-w-md p-6 md:p-8">
        <h1 className="mb-6 text-center text-2xl font-extrabold text-[var(--ce-primary)]">
          {t('auth.forgotPassword')}
        </h1>

        {step === 1 && (
          <form onSubmit={requestCode}>
            <p className="mb-4 text-sm text-[var(--ce-muted)]">
              {t('auth.resetEmailHint')}
            </p>
            <label className="ce-label">{t('auth.email')}</label>
            <input
              type="email"
              className="ce-input mb-5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="ce-btn ce-btn-primary w-full"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('auth.sendResetLink')}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={reset}>
            <p className="mb-4 text-sm text-[var(--ce-muted)]">
              {t('auth.resetTokenHint')}
            </p>

            <label className="ce-label">{t('auth.resetToken')}</label>
            <input
              className="ce-input mb-4"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={t('auth.resetTokenPlaceholder')}
              required
            />

            <label className="ce-label">{t('auth.password')}</label>
            <input
              type="password"
              className="ce-input mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={10}
              required
            />

            <label className="ce-label">{t('auth.confirmPassword')}</label>
            <input
              type="password"
              className="ce-input mb-5"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={10}
              required
            />

            <button
              type="submit"
              className="ce-btn ce-btn-primary w-full"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('auth.submitReset')}
            </button>
          </form>
        )}

        {step === 3 && (
          <p className="text-center text-[var(--ce-muted)]">
            {t('auth.resetSuccess')} —{' '}
            <Link
              to="/auth/login"
              className="font-bold text-[var(--ce-primary)]"
            >
              {t('nav.login')}
            </Link>
          </p>
        )}

        <p className="mt-5 text-center text-sm text-[var(--ce-muted)]">
          <Link
            to="/auth/login"
            className="font-semibold text-[var(--ce-primary)]"
          >
            {t('nav.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}