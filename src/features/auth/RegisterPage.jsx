import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import AuthServices from '../../shared/api/authService';
import { resolveReturnTo } from '../../shared/guards/RoleGuard';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const auth = new AuthServices();

  const initialRole = useMemo(() => {
    const r = params.get('role');
    if (['teacher', 'student', 'parent'].includes(r)) return r;
    return 'student';
  }, [params]);

  const academyFromUrl = params.get('academy') || '';
  const groupFromUrl = params.get('group') || '';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    role: initialRole,
    academyName: '',
    academySlug: academyFromUrl,
    gradeLevel: 'grade_12',
    preferredLanguage: localStorage.getItem('ce_lang') || 'ar',
    parentPhone: '',
  });
  const [loading, setLoading] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const returnTo = resolveReturnTo(params, groupFromUrl ? `/dashboard/student/join?group=${groupFromUrl}${academyFromUrl ? `&academy=${academyFromUrl}` : ''}` : null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (form.role !== 'teacher') {
        delete payload.academyName;
      }
      if (form.role === 'student' && academyFromUrl) {
        payload.academySlug = academyFromUrl;
      } else if (form.role !== 'teacher') {
        delete payload.academySlug;
      }
      if (form.role !== 'student') delete payload.gradeLevel;

      await auth.register(payload);
      toast.success(t('common.success'));
      const verifyQs = new URLSearchParams({ email: form.email });
      if (returnTo) verifyQs.set('returnTo', returnTo);
      else {
        if (groupFromUrl) verifyQs.set('group', groupFromUrl);
        if (academyFromUrl) verifyQs.set('academy', academyFromUrl);
      }
      navigate(`/auth/verif-email?${verifyQs.toString()}`);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Toaster position="top-center" />
      <form onSubmit={onSubmit} className="ce-card w-full max-w-lg p-6 md:p-8">
        <div className="mb-6 text-center">
          <img src="/images/LOGO.png" alt="" className="mx-auto mb-3 h-14 w-14" />
          <h1 className="text-2xl font-extrabold text-[var(--ce-primary)]">
            {t('auth.registerTitle')}
          </h1>
        </div>

        <label className="ce-label">{t('auth.role')}</label>
        <select
          className="ce-input mb-4"
          value={form.role}
          onChange={(e) => setField('role', e.target.value)}
        >
          <option value="teacher">{t('auth.roleTeacher')}</option>
          <option value="student">{t('auth.roleStudent')}</option>
          <option value="parent">{t('auth.roleParent')}</option>
        </select>

        <label className="ce-label">{t('auth.name')}</label>
        <input className="ce-input mb-4" value={form.name} onChange={(e) => setField('name', e.target.value)} required />

        <label className="ce-label">{t('auth.email')}</label>
        <input type="email" className="ce-input mb-4" value={form.email} onChange={(e) => setField('email', e.target.value)} required />

        <label className="ce-label">{t('auth.phone')}</label>
        <input className="ce-input mb-4" value={form.phone_number} onChange={(e) => setField('phone_number', e.target.value)} required />

        <label className="ce-label">{t('auth.password')}</label>
        <input type="password" className="ce-input mb-4" value={form.password} onChange={(e) => setField('password', e.target.value)} minLength={10} required />

        {form.role === 'teacher' && (
          <>
            <label className="ce-label">{t('auth.academyName')}</label>
            <input className="ce-input mb-4" value={form.academyName} onChange={(e) => setField('academyName', e.target.value)} required />
            <label className="ce-label">{t('auth.academySlug')}</label>
            <input className="ce-input mb-4" value={form.academySlug} onChange={(e) => setField('academySlug', e.target.value)} placeholder="ahmedamer" />
          </>
        )}

        {form.role === 'student' && (
          <>
            {academyFromUrl && (
              <p className="mb-4 rounded-xl bg-[var(--ce-bg)] p-3 text-sm text-[var(--ce-muted)]">
                {t('student.registeringFor')}: <strong>{academyFromUrl}</strong>
              </p>
            )}
            <label className="ce-label">{t('auth.gradeLevel')}</label>
            <select className="ce-input mb-4" value={form.gradeLevel} onChange={(e) => setField('gradeLevel', e.target.value)}>
              <option value="grade_10">{t('auth.grade10')}</option>
              <option value="grade_11">{t('auth.grade11')}</option>
              <option value="grade_12">{t('auth.grade12')}</option>
            </select>
            <label className="ce-label">{t('requests.parentPhone')}</label>
            <input className="ce-input mb-4" value={form.parentPhone} onChange={(e) => setField('parentPhone', e.target.value)} />
          </>
        )}

        <button type="submit" className="ce-btn ce-btn-accent w-full" disabled={loading}>
          {loading ? t('common.loading') : t('auth.submitRegister')}
        </button>

        <p className="mt-5 text-center text-sm text-[var(--ce-muted)]">
          {t('auth.haveAccount')}{' '}
          <Link to={returnTo ? `/auth/login?returnTo=${encodeURIComponent(returnTo)}` : '/auth/login'} className="font-bold text-[var(--ce-primary)]">
            {t('nav.login')}
          </Link>
        </p>
      </form>
    </div>
  );
}
