import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import authService from '../../shared/api/authService';
import { extractApiError } from '../../shared/utils/apiError';
import { useI18n } from '../../shared/i18n';
import AuthLayout, { AuthInput, AuthButton, AuthAlert } from './AuthLayout';

/* ——— Icons ——— */
const MailIcon = () => (
  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const SuccessIcon = () => (
  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/* ——— استخراج التوكن ——— */
function extractToken(searchParams, params, location) {
  let t = searchParams.get('token');
  if (t) return { token: t, source: 'query.token' };

  if (params?.token) return { token: params.token, source: 'path' };

  if (location.hash) {
    const hash = location.hash.startsWith('#')
      ? location.hash.slice(1)
      : location.hash;
    t = new URLSearchParams(hash).get('token');
    if (t) return { token: t, source: 'hash.token' };
  }

  t = searchParams.get('code');
  if (t) return { token: t, source: 'query.code' };

  t = searchParams.get('verificationToken');
  if (t) return { token: t, source: 'query.verificationToken' };

  return { token: null, source: 'none' };
}

const VERIFIED_KEY = 'email_verified_token';
const DEBUG = false;

export default function VerifyEmailPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { token, source } = useMemo(
    () => extractToken(searchParams, params, location),
    [searchParams, params, location],
  );

  const emailFromQuery = searchParams.get('email') || '';

  const [status, setStatus] = useState(() => {
    if (!token) return 'idle';
    if (sessionStorage.getItem(VERIFIED_KEY) === token) return 'success';
    return 'loading';
  });
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(emailFromQuery);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  const verifyStateRef = useRef({ token: null });

  useEffect(() => {
    if (!token) {
      setStatus('idle');
      return;
    }

    if (sessionStorage.getItem(VERIFIED_KEY) === token) {
      setStatus('success');
      setMessage(t('auth.verifySuccessMessage'));
      return;
    }

    if (verifyStateRef.current.token === token) {
      return;
    }

    verifyStateRef.current = { token };
    setStatus('loading');

    authService
      .verifyEmail(token)
      .then(() => {
        sessionStorage.setItem(VERIFIED_KEY, token);
        setStatus('success');
        setMessage(t('auth.verifySuccessMessage'));
      })
      .catch((err) => {
        const errMsg = (
          extractApiError(err).message ||
          err?.message ||
          ''
        ).toLowerCase();

        if (
          errMsg.includes('already') ||
          errMsg.includes('verified') ||
          errMsg.includes('مؤكد') ||
          errMsg.includes('مفعل')
        ) {
          sessionStorage.setItem(VERIFIED_KEY, token);
          setStatus('success');
          setMessage(t('auth.verifySuccessMessage'));
        } else {
          setStatus('error');
          setMessage(
            extractApiError(err).message || err?.message || 'فشل التحقق',
          );
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (status !== 'success') return;
    const timer = setTimeout(() => {
      navigate('/login?verified=1', { replace: true });
    }, 4000);
    return () => clearTimeout(timer);
  }, [status, navigate]);

  const onResend = async (e) => {
    e.preventDefault();
    setResendError('');
    setResendMessage('');
    if (!email) {
      setResendError('من فضلك أدخل بريدك الإلكتروني');
      return;
    }
    setResending(true);
    try {
      await authService.resendVerification(email);
      setResendMessage(t('auth.resendSent'));
    } catch (err) {
      setResendError(extractApiError(err).message);
    } finally {
      setResending(false);
    }
  };

  const onRetry = () => {
    if (!token) return;
    sessionStorage.removeItem(VERIFIED_KEY);
    verifyStateRef.current = { token: null };
    setMessage('');
    setStatus('loading');
    authService
      .verifyEmail(token)
      .then(() => {
        sessionStorage.setItem(VERIFIED_KEY, token);
        setStatus('success');
        setMessage(t('auth.verifySuccessMessage'));
      })
      .catch((err) => {
        setStatus('error');
        setMessage(extractApiError(err).message);
      });
  };

  const DebugPanel = DEBUG ? (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-xl text-[11px] font-mono text-slate-700 overflow-auto max-h-40">
      <div className="font-bold mb-1">🔧 Debug</div>
      <div>URL: {window.location.href}</div>
      <div>Path: {location.pathname}</div>
      <div>Source: {source}</div>
      <div>Token: {token ? token.slice(0, 20) + '...' : '❌ NULL'}</div>
    </div>
  ) : null;

  /* --- idle --- */
  if (status === 'idle') {
    return (
      <AuthLayout
        title={t('auth.verifyEmailTitle')}
        subtitle="أرسلنا لك رابط التحقق على بريدك"
      >
        <div className="text-center mb-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-[#1a3a5c] to-[#0f2744] flex items-center justify-center shadow-lg shadow-[#1a3a5c]/30 mb-5">
            <MailIcon />
          </div>
          <p className="text-slate-600 text-sm leading-6">
            افتح بريدك واضغط على الرابط لتأكيد حسابك.
          </p>
        </div>

        <AuthAlert type="success">{resendMessage}</AuthAlert>
        <AuthAlert>{resendError}</AuthAlert>

        <form onSubmit={onResend} className="space-y-4">
          <AuthInput
            label={t('auth.email')}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <AuthButton type="submit" loading={resending}>
            {resending ? t('auth.sending') : t('auth.resendVerification')}
          </AuthButton>
        </form>

        {DebugPanel}

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

  /* --- loading --- */
  if (status === 'loading') {
    return (
      <AuthLayout
        title={t('auth.verifyEmailTitle')}
        subtitle={t('auth.verifying')}
      >
        <div className="flex flex-col items-center py-8">
          <div className="relative w-20 h-20 mb-5">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1a3a5c] animate-spin" />
          </div>
          <p className="text-slate-500 text-sm">جاري التحقق من الرابط...</p>
        </div>
        {DebugPanel}
      </AuthLayout>
    );
  }

  /* --- success --- */
  if (status === 'success') {
    return (
      <AuthLayout
        title={t('auth.verifySuccess')}
        subtitle={t('auth.verifySuccessMessage')}
      >
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-5">
            <SuccessIcon />
          </div>
          <p className="text-slate-600 text-sm mb-3">{message}</p>
          <p className="text-xs text-slate-400 mb-8">
            جاري تحويلك لصفحة الدخول...
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-[#1a3a5c] to-[#0f2744] hover:shadow-xl hover:shadow-[#1a3a5c]/35 hover:-translate-y-0.5 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-[#1a3a5c]/25"
          >
            {t('auth.goToLogin')}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  /* --- error --- */
  return (
    <AuthLayout
      title={t('auth.verifyFailed')}
      subtitle="الرابط غير صالح أو منتهي"
    >
      <div className="text-center mb-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 mb-5">
          <ErrorIcon />
        </div>
        <p className="text-slate-600 text-sm mb-2">{message}</p>
      </div>

      <AuthAlert type="success">{resendMessage}</AuthAlert>
      <AuthAlert>{resendError}</AuthAlert>

      <div className="space-y-3 mb-4">
        <AuthButton type="button" onClick={onRetry}>
          حاول مرة أخرى
        </AuthButton>
      </div>

      <form onSubmit={onResend} className="space-y-4">
        <AuthInput
          label={t('auth.email')}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <AuthButton type="submit" loading={resending}>
          {resending ? t('auth.sending') : t('auth.resendVerification')}
        </AuthButton>
      </form>

      {DebugPanel}

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