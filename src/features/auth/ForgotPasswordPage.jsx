import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import authService from '../../shared/api/authService';
import { extractApiError } from '../../shared/utils/apiError';
import { useI18n } from '../../shared/i18n';
import AuthLayout, { AuthInput, AuthButton, AuthAlert } from './AuthLayout';

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const [mode] = useState(tokenFromUrl ? 'reset' : 'forgot');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onForgot = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      await authService.forgotPassword(email);
      setMessage(t('auth.emailSentMessage'));
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const onReset = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (password !== confirmPassword)
      return setError(t('auth.passwordsDontMatch'));
    setLoading(true);
    try {
      await authService.resetPassword(tokenFromUrl, password, confirmPassword);
      setMessage(t('auth.resetSuccess'));
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === 'forgot' ? t('auth.forgotPasswordTitle') : t('auth.resetPassword');
  const subtitle =
    mode === 'forgot'
      ? t('auth.forgotPasswordSubtitle')
      : t('auth.resetPasswordSubtitle');

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      <AuthAlert>{error}</AuthAlert>
      <AuthAlert type="success">{message}</AuthAlert>

      {mode === 'forgot' ? (
        <form onSubmit={onForgot} className="space-y-4">
          <AuthInput
            label={t('auth.email')}
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthButton type="submit" loading={loading}>
            {loading ? t('auth.sending') : t('auth.save')}
          </AuthButton>
        </form>
      ) : (
        <form onSubmit={onReset} className="space-y-4">
          <AuthInput
            label={t('auth.password')}
            type="password"
            required
            minLength={8}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <AuthInput
            label={t('auth.confirmPassword')}
            type="password"
            required
            minLength={8}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <AuthButton type="submit" loading={loading}>
            {loading ? t('auth.saving') : t('auth.resetPassword')}
          </AuthButton>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link
          to="/login"
          className="text-[#1a3a5c] font-bold hover:underline"
        >
          {t('auth.backToLogin')}
        </Link>
      </p>
    </AuthLayout>
  );
}