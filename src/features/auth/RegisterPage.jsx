import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import AuthServices from '../../shared/api/authService';
import { platformPlanApi } from '../../shared/api/platformApi';
import { resolveReturnTo } from '../../shared/guards/RoleGuard';
import { buildQueryString, getCleanParam } from '../../shared/utils/queryParams';
import getApiErrorMessage from '../../shared/utils/apiError';

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ar';
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const auth = new AuthServices();

  const initialRole = useMemo(() => {
    const r = params.get('role');
    if (['teacher', 'student', 'parent'].includes(r)) return r;
    return 'student';
  }, [params]);

  const academyFromUrl = getCleanParam(params, 'academy');
  const groupFromUrl = getCleanParam(params, 'group');

  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    role: initialRole,
    academyName: '',
    requestedPlan: '',
    gradeLevel: 'grade_12',
    preferredLanguage: localStorage.getItem('ce_lang') || 'ar',
    parentPhone: '',
    childContact: '',
  });
  const [loading, setLoading] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const returnTo = resolveReturnTo(
    params,
    groupFromUrl ? `/dashboard/student/join?${buildQueryString({ group: groupFromUrl, academy: academyFromUrl })}` : null
  );

  useEffect(() => {
    if (form.role !== 'teacher') return;
    platformPlanApi.listPublic()
      .then((data) => {
        const activePlans = data.plans || [];
        setPlans(activePlans);
        if (activePlans.length && !form.requestedPlan) {
          setField('requestedPlan', activePlans[0].key);
        }
      })
      .catch(() => {});
  }, [form.role]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (form.role !== 'teacher') {
        delete payload.academyName;
        delete payload.requestedPlan;
      }
      if (['student', 'parent'].includes(form.role) && academyFromUrl) {
        payload.academySlug = academyFromUrl;
      } else {
        delete payload.academySlug;
      }
      if (form.role !== 'student') delete payload.gradeLevel;
      if (form.role !== 'student') delete payload.parentPhone;
      if (form.role !== 'parent') delete payload.childContact;

      await auth.register(payload);
      toast.success(t('common.success'));
      const verifyQs = returnTo
        ? buildQueryString({ email: form.email, returnTo })
        : buildQueryString({ email: form.email, group: groupFromUrl, academy: academyFromUrl });
      navigate(`/auth/verif-email?${verifyQs}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
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

            <label className="ce-label">{t('platformSub.choosePlan')}</label>
            <div className="mb-4 space-y-2">
              {plans.map((plan) => (
                <label
                  key={plan.key}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                    form.requestedPlan === plan.key
                      ? 'border-[var(--ce-accent)] bg-[var(--ce-accent)]/10'
                      : 'border-[var(--ce-border)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="requestedPlan"
                    value={plan.key}
                    checked={form.requestedPlan === plan.key}
                    onChange={(e) => setField('requestedPlan', e.target.value)}
                    className="mt-1"
                    required
                  />
                  <span>
                    <span className="block font-bold text-[var(--ce-primary)]">{plan.name?.[lang] || plan.key}</span>
                    <span className="text-sm text-[var(--ce-muted)]">
                      {plan.price} {t('payments.currency')} · {plan.description?.[lang]}
                    </span>
                  </span>
                </label>
              ))}
              {!plans.length && (
                <p className="text-sm text-[var(--ce-muted)]">{t('platformSub.noPlans')}</p>
              )}
            </div>
            <p className="mb-4 text-xs text-[var(--ce-muted)]">{t('auth.academySlugAutoHint')}</p>
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
            <label className="ce-label">{t('requests.parentContact')}</label>
            <input className="ce-input mb-1" value={form.parentPhone} onChange={(e) => setField('parentPhone', e.target.value)} placeholder={t('requests.parentContactHint')} />
            <p className="mb-4 text-xs text-[var(--ce-muted)]">{t('requests.parentContactHint')}</p>
          </>
        )}

        {form.role === 'parent' && (
          <>
            {academyFromUrl && (
              <p className="mb-4 rounded-xl bg-[var(--ce-bg)] p-3 text-sm text-[var(--ce-muted)]">
                {t('student.registeringFor')}: <strong>{academyFromUrl}</strong>
              </p>
            )}
            <label className="ce-label">{t('auth.childContact')}</label>
            <input className="ce-input mb-1" value={form.childContact} onChange={(e) => setField('childContact', e.target.value)} placeholder={t('auth.childContactHint')} />
            <p className="mb-4 text-xs text-[var(--ce-muted)]">{t('auth.childContactHint')}</p>
          </>
        )}

        <button type="submit" className="ce-btn ce-btn-accent w-full" disabled={loading || (form.role === 'teacher' && !form.requestedPlan)}>
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
