import { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import AuthServices from '../../shared/api/authService';
import { resolveReturnTo } from '../../shared/guards/RoleGuard';
import { buildQueryString, getCleanParam } from '../../shared/utils/queryParams';
import getApiErrorMessage from '../../shared/utils/apiError';
import { resolveStudentPostLoginPath } from '../student/useStudentAcademy';

const CODE_LENGTH = 6;

export default function VerifyEmailPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const auth = new AuthServices();
  const [email] = useState(params.get('email') || '');
  const [digits, setDigits] = useState(() => Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const code = digits.join('');
  const returnTo = resolveReturnTo(params, '/dashboard/student/join');

  const handleDigitChange = (index, rawValue) => {
    const digit = rawValue.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      e.preventDefault();
      setDigits((prev) => {
        const next = [...prev];
        next[index - 1] = '';
        return next;
      });
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;

    const next = Array(CODE_LENGTH).fill('');
    pasted.split('').forEach((char, i) => {
      next[i] = char;
    });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH) - 1]?.focus();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== CODE_LENGTH) return;

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
        if (res.role === 'student') {
          const studentPath = await resolveStudentPostLoginPath(returnTo);
          navigate(studentPath);
          return;
        }
        navigate(res.dashboardPath || auth.getDashboardPath(res.role));
        return;
      }
      toast.success(t('common.success'));
      const rawReturnTo = getCleanParam(params, 'returnTo');
      const loginQs = rawReturnTo
        ? buildQueryString({ email, returnTo: rawReturnTo })
        : buildQueryString({
            email,
            group: getCleanParam(params, 'group'),
            academy: getCleanParam(params, 'academy'),
          });
      navigate(`/auth/login?${loginQs}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
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
        <input
          type="email"
          className="ce-input mb-4 disabled:cursor-not-allowed disabled:opacity-60"
          value={email}
          disabled
          required
        />
        <label className="ce-label">{t('auth.verifyCode')}</label>
        <div
          className="mb-5  flex w-full items-center justify-center gap-1.5 rounded-[12px]  bg-[var(--ce-surface)] px-5 py-2.5 sm:gap-2 sm:px-4"
          dir="ltr"
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              className="h-9 w-10 p-0.5 text-center text-lg font-semibold border border-gray-300 rounded-md outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              aria-label={`${t('auth.verifyCode')} ${index + 1}`}
            />
          ))}
        </div>
        <button
          type="submit"
          className="ce-btn ce-btn-primary w-full"
          disabled={loading || code.length !== CODE_LENGTH}
        >
          {loading ? t('common.loading') : t('auth.verifySubmit')}
        </button>
        <p className="mt-4 text-center text-sm">
          <Link to={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-[var(--ce-primary)]">{t('nav.login')}</Link>
        </p>
      </form>
    </div>
  );
}
