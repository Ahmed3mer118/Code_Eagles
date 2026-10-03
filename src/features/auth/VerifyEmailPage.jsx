import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import AuthServices from '../../shared/api/authService';
import { getCleanParam } from '../../shared/utils/queryParams';
import getApiErrorMessage from '../../shared/utils/apiError';

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const auth = new AuthServices();

  const initialToken = getCleanParam(params, 'token') || '';
  const email = getCleanParam(params, 'email') || '';

  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(!!initialToken);
  const [autoVerifying, setAutoVerifying] = useState(!!initialToken);
  const [success, setSuccess] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [resending, setResending] = useState(false);
  const processed = useRef(false);

  const redirectToLogin = (delayMs = 2500) => {
    window.setTimeout(() => {
      const loginQs = email ? `?email=${encodeURIComponent(email)}` : '';
      navigate(`/auth/login${loginQs}`, { replace: true });
    }, delayMs);
  };

  const verify = async (tokenValue) => {
    await auth.verifyEmail(tokenValue.trim());
    setSuccess(true);
    toast.success(t('auth.verifySuccess'));
    redirectToLogin();
  };

  // ✅ Auto-verify لما الـ token يكون في الـ URL
  useEffect(() => {
    if (!initialToken || processed.current) return;
    processed.current = true;

    verify(initialToken).catch((err) => {
      toast.error(getApiErrorMessage(err));
      setAutoVerifying(false);
      setLoading(false);
      setShowManual(true); // fallback للمستخدم يلزق التوكن يدويًا
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    try {
      await verify(token);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error(t('auth.emailRequiredForResend'));
      return;
    }
    setResending(true);
    try {
      await auth.resendVerification(email);
      toast.success(t('auth.verificationResent'));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Toaster position="top-center" />

      {/* ============ 1. نجاح ============ */}
      {success && (
        <div className="ce-card w-full max-w-md p-6 text-center md:p-8">
          <img src="/images/LOGO.png" alt="" className="mx-auto mb-4 h-14 w-14" />
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-extrabold text-[var(--ce-primary)]">
            {t('auth.verifySuccessTitle')}
          </h1>
          <p className="mb-4 text-sm text-[var(--ce-muted)]">
            {t('auth.verifySuccessBody')}
          </p>
          <Link
            to={email ? `/auth/login?email=${encodeURIComponent(email)}` : '/auth/login'}
            className="ce-btn ce-btn-primary w-full"
          >
            {t('nav.login')}
          </Link>
        </div>
      )}

      {/* ============ 2. Auto-verify loading ============ */}
      {!success && autoVerifying && (
        <div className="ce-card w-full max-w-md p-6 text-center md:p-8">
          <img src="/images/LOGO.png" alt="" className="mx-auto mb-4 h-14 w-14" />
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--ce-border)] border-t-[var(--ce-primary)]" />
          <h1 className="mb-2 text-xl font-extrabold text-[var(--ce-primary)]">
            {t('auth.verifyingEmail')}
          </h1>
          <p className="text-sm text-[var(--ce-muted)]">
            {t('auth.verifyingEmailHint')}
          </p>
        </div>
      )}

      {/* ============ 3. "افتح إيميلك" ============ */}
      {!success && !autoVerifying && !showManual && (
        <div className="ce-card w-full max-w-md p-6 text-center md:p-8">
          <img src="/images/LOGO.png" alt="" className="mx-auto mb-4 h-14 w-14" />

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-9 w-9 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="mb-2 text-xl font-extrabold text-[var(--ce-primary)]">
            {t('auth.checkYourEmailTitle')}
          </h1>
          <p className="mb-2 text-sm text-[var(--ce-muted)]">
            {t('auth.checkYourEmailBody')}
          </p>
          {email && (
            <p className="mb-5 break-all text-sm font-bold text-[var(--ce-primary)]">
              {email}
            </p>
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="ce-btn ce-btn-primary w-full"
          >
            {resending ? t('common.loading') : t('auth.resendVerification')}
          </button>

          <button
            type="button"
            onClick={() => setShowManual(true)}
            className="mt-3 w-full text-center text-sm font-semibold text-[var(--ce-primary)]"
          >
            {t('auth.haveTokenInstead')}
          </button>

          <p className="mt-5 text-center text-sm text-[var(--ce-muted)]">
            <Link
              to={email ? `/auth/login?email=${encodeURIComponent(email)}` : '/auth/login'}
              className="font-semibold text-[var(--ce-primary)]"
            >
              {t('nav.login')}
            </Link>
          </p>
        </div>
      )}

      {/* ============ 4. Manual input (نادرًا) ============ */}
      {!success && !autoVerifying && showManual && (
        <form onSubmit={onSubmit} className="ce-card w-full max-w-md p-6 md:p-8">
          <div className="mb-6 text-center">
            <img src="/images/LOGO.png" alt="" className="mx-auto mb-3 h-14 w-14" />
            <h1 className="text-2xl font-extrabold text-[var(--ce-primary)]">
              {t('auth.verifyTitle')}
            </h1>
            {email && (
              <p className="mt-2 text-sm text-[var(--ce-muted)]">
                {t('auth.verifySentTo')}: <strong>{email}</strong>
              </p>
            )}
          </div>

          <label className="ce-label">{t('auth.verifyCode')}</label>
          <input
            className="ce-input mb-2"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={t('auth.verifyTokenPlaceholder')}
            autoComplete="one-time-code"
            required
          />
          <p className="mb-4 text-xs text-[var(--ce-muted)]">
            {t('auth.verifyTokenHint')}
          </p>

          <button
            type="submit"
            className="ce-btn ce-btn-primary w-full"
            disabled={loading || !token.trim()}
          >
            {loading ? t('common.loading') : t('auth.verifySubmit')}
          </button>

          <button
            type="button"
            onClick={() => setShowManual(false)}
            className="mt-3 w-full text-center text-sm font-semibold text-[var(--ce-muted)]"
          >
            {t('common.back')}
          </button>
        </form>
      )}
    </div>
  );
}