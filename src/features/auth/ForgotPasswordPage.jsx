import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import AuthServices from '../../shared/api/authService';
import getApiErrorMessage from '../../shared/utils/apiError';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const auth = new AuthServices();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const requestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.forgotPassword(email);
      toast.success(t('common.success'));
      setStep(2);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const reset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.resetPassword(email, newPassword, resetCode);
      toast.success(t('common.success'));
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
            <label className="ce-label">{t('auth.email')}</label>
            <input type="email" className="ce-input mb-5" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" className="ce-btn ce-btn-primary w-full" disabled={loading}>
              {loading ? t('common.loading') : t('common.save')}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={reset}>
            <label className="ce-label">{t('auth.verifyCode')}</label>
            <input className="ce-input mb-4" value={resetCode} onChange={(e) => setResetCode(e.target.value)} required />
            <label className="ce-label">{t('auth.password')}</label>
            <input type="password" className="ce-input mb-5" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={10} required />
            <button type="submit" className="ce-btn ce-btn-primary w-full" disabled={loading}>
              {loading ? t('common.loading') : t('common.save')}
            </button>
          </form>
        )}

        {step === 3 && (
          <p className="text-center text-[var(--ce-muted)]">
            {t('common.success')} —{' '}
            <Link to="/auth/login" className="font-bold text-[var(--ce-primary)]">
              {t('nav.login')}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
