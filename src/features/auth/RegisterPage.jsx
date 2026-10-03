import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import AuthServices from '../../shared/api/authService';
import { platformPlanApi, FEATURE_KEYS } from '../../shared/api/platformApi';
import { formatPlanPeriod } from '../../shared/utils/subscriptionDays';
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
    accountType: initialRole,
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    preferredLanguage: localStorage.getItem('ce_lang') === 'en' ? 'en' : 'ar',
    academyName: '',
    requestedPlanId: '',
    gradeLevel: 'grade_12',
    parentContact: '',
    childContact: '',
  });
  const [loading, setLoading] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const returnTo = resolveReturnTo(
    params,
    groupFromUrl
      ? `/dashboard/student/join?${buildQueryString({
          group: groupFromUrl,
          academy: academyFromUrl,
        })}`
      : null
  );

  useEffect(() => {
    if (form.accountType !== 'teacher') return;
    platformPlanApi
      .listPublic()
      .then((data) => {
        const activePlans = data.plans || [];
        setPlans(activePlans);
        if (activePlans.length && !form.requestedPlanId) {
          const firstId = activePlans[0].id || activePlans[0].key;
          setField('requestedPlanId', firstId);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.accountType]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error(t('auth.passwordsDontMatch'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        accountType: form.accountType,
        name: form.name.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        preferredLanguage: form.preferredLanguage,
      };

      if (form.accountType === 'teacher') {
        payload.academyName = form.academyName.trim();
        payload.requestedPlanId = form.requestedPlanId;
      }

      if (form.accountType === 'student') {
        payload.gradeLevel = form.gradeLevel;
        if (form.parentContact.trim()) {
          payload.parentContact = form.parentContact.trim();
        }
      }

      if (form.accountType === 'parent') {
        if (form.childContact.trim()) {
          payload.childContact = form.childContact.trim();
        }
      }

      await auth.register(payload);
      toast.success(t('common.success'));

      // ✅ روح لصفحة "افتح إيميلك"
      const verifyQs = buildQueryString({
        email: form.email.trim(),
        ...(returnTo ? { returnTo } : {}),
        ...(groupFromUrl ? { group: groupFromUrl } : {}),
        ...(academyFromUrl ? { academy: academyFromUrl } : {}),
      });
      navigate(`/auth/verif-email?${verifyQs}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ✅ بدء Google OAuth flow
  const handleGoogleSignup = () => {
    const googleUrl = auth.getGoogleAuthUrl(returnTo || undefined);
    window.location.href = googleUrl;
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

        {/* ✅ زر Google في الأعلى */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          className="ce-btn mb-4 flex w-full items-center justify-center gap-3 border border-[var(--ce-border)] bg-white text-[var(--ce-primary)] hover:bg-gray-50"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C41.9 35.5 44 30.1 44 24c0-1.3-.1-2.4-.4-3.5z"
            />
          </svg>
          <span className="font-semibold">
            {t('auth.signupWithGoogle')}
          </span>
        </button>

        {/* ✅ فاصل "أو" */}
        <div className="mb-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-[var(--ce-border)]" />
          <span className="text-xs font-semibold text-[var(--ce-muted)]">
            {t('auth.or')}
          </span>
          <span className="h-px flex-1 bg-[var(--ce-border)]" />
        </div>

        <label className="ce-label">{t('auth.role')}</label>
        <select
          className="ce-input mb-4"
          value={form.accountType}
          onChange={(e) => setField('accountType', e.target.value)}
        >
          <option value="teacher">{t('auth.roleTeacher')}</option>
          <option value="student">{t('auth.roleStudent')}</option>
          <option value="parent">{t('auth.roleParent')}</option>
        </select>

        <label className="ce-label">{t('auth.name')}</label>
        <input
          className="ce-input mb-4"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          required
        />

        <label className="ce-label">{t('auth.email')}</label>
        <input
          type="email"
          className="ce-input mb-4"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          required
        />

        <label className="ce-label">{t('auth.phone')}</label>
        <input
          className="ce-input mb-4"
          value={form.phoneNumber}
          onChange={(e) => setField('phoneNumber', e.target.value)}
          required
        />

        <label className="ce-label">{t('auth.password')}</label>
        <input
          type="password"
          className="ce-input mb-4"
          value={form.password}
          onChange={(e) => setField('password', e.target.value)}
          minLength={10}
          required
        />

        <label className="ce-label">{t('auth.confirmPassword')}</label>
        <input
          type="password"
          className="ce-input mb-4"
          value={form.confirmPassword}
          onChange={(e) => setField('confirmPassword', e.target.value)}
          minLength={10}
          required
        />

        {form.accountType === 'teacher' && (
          <>
            <label className="ce-label">{t('auth.academyName')}</label>
            <input
              className="ce-input mb-4"
              value={form.academyName}
              onChange={(e) => setField('academyName', e.target.value)}
              required
            />

            <label className="ce-label">{t('platformSub.choosePlan')}</label>
            <div className="mb-4 space-y-2">
              {plans.map((plan) => {
                const planId = plan.id || plan.key;
                return (
                  <label
                    key={planId}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                      form.requestedPlanId === planId
                        ? 'border-[var(--ce-accent)] bg-[var(--ce-accent)]/10'
                        : 'border-[var(--ce-border)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="requestedPlanId"
                      value={planId}
                      checked={form.requestedPlanId === planId}
                      onChange={(e) => setField('requestedPlanId', e.target.value)}
                      className="mt-1"
                      required
                    />
                    <span>
                      <span className="block font-bold text-[var(--ce-primary)]">
                        {plan.name?.[lang] || plan.key}
                      </span>
                      <span className="text-sm text-[var(--ce-muted)]">
                        {plan.price} {t('payments.currency')} ·{' '}
                        {plan.description?.[lang]} · {formatPlanPeriod(plan, t)}
                      </span>
                      {(plan.features || []).length > 0 && (
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          {[...(plan.features || [])]
                            .filter((feature) => FEATURE_KEYS.includes(feature))
                            .sort(
                              (a, b) =>
                                FEATURE_KEYS.indexOf(a) - FEATURE_KEYS.indexOf(b)
                            )
                            .map((feature) => (
                              <span
                                key={feature}
                                className="rounded-full bg-[var(--ce-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--ce-primary)]"
                              >
                                {t(`features.${feature}`, feature)}
                              </span>
                            ))}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
              {!plans.length && (
                <p className="text-sm text-[var(--ce-muted)]">
                  {t('platformSub.noPlans')}
                </p>
              )}
            </div>
            <p className="mb-4 text-xs text-[var(--ce-muted)]">
              {t('auth.academySlugAutoHint')}
            </p>
          </>
        )}

        {form.accountType === 'student' && (
          <>
            {academyFromUrl && (
              <p className="mb-4 rounded-xl bg-[var(--ce-bg)] p-3 text-sm text-[var(--ce-muted)]">
                {t('student.registeringFor')}: <strong>{academyFromUrl}</strong>
              </p>
            )}

            <label className="ce-label">{t('auth.gradeLevel')}</label>
            <select
              className="ce-input mb-4"
              value={form.gradeLevel}
              onChange={(e) => setField('gradeLevel', e.target.value)}
            >
              <option value="grade_10">{t('auth.grade10')}</option>
              <option value="grade_11">{t('auth.grade11')}</option>
              <option value="grade_12">{t('auth.grade12')}</option>
            </select>

            <label className="ce-label">{t('requests.parentContact')}</label>
            <input
              className="ce-input mb-1"
              value={form.parentContact}
              onChange={(e) => setField('parentContact', e.target.value)}
              placeholder={t('requests.parentContactHint')}
            />
            <p className="mb-4 text-xs text-[var(--ce-muted)]">
              {t('requests.parentContactHint')}
            </p>
          </>
        )}

        {form.accountType === 'parent' && (
          <>
            {academyFromUrl && (
              <p className="mb-4 rounded-xl bg-[var(--ce-bg)] p-3 text-sm text-[var(--ce-muted)]">
                {t('student.registeringFor')}: <strong>{academyFromUrl}</strong>
              </p>
            )}

            <label className="ce-label">{t('auth.childContact')}</label>
            <input
              className="ce-input mb-1"
              value={form.childContact}
              onChange={(e) => setField('childContact', e.target.value)}
              placeholder={t('auth.childContactHint')}
            />
            <p className="mb-4 text-xs text-[var(--ce-muted)]">
              {t('auth.childContactHint')}
            </p>
          </>
        )}

        <button
          type="submit"
          className="ce-btn ce-btn-accent w-full"
          disabled={
            loading ||
            (form.accountType === 'teacher' && !form.requestedPlanId)
          }
        >
          {loading ? t('common.loading') : t('auth.submitRegister')}
        </button>

        <p className="mt-5 text-center text-sm text-[var(--ce-muted)]">
          {t('auth.haveAccount')}{' '}
          <Link
            to={
              returnTo
                ? `/auth/login?returnTo=${encodeURIComponent(returnTo)}`
                : '/auth/login'
            }
            className="font-bold text-[var(--ce-primary)]"
          >
            {t('nav.login')}
          </Link>
        </p>
      </form>
    </div>
  );
}