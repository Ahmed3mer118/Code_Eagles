import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../shared/api/authService';
import publicService from '../../shared/api/publicService';
import { extractApiError } from '../../shared/utils/apiError';
import { useI18n } from '../../shared/i18n';
import AuthLayout, {
  AuthInput,
  AuthButton,
  AuthAlert,
  AuthSelect,
} from './AuthLayout';
import PlanCard from './PlanCard';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  const [form, setForm] = useState({
    accountType: 'teacher',
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    preferredLanguage: 'ar',
    academyName: '',
    requestedPlanId: '',
    gradeLevel: '',
    parentContact: '',
    childContact: '',
    academyId: '',
    parentAcademyId: '',
  });

  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState('');

  // قائمة الأكاديميات للطالب وولي الأمر
  const [academies, setAcademies] = useState([]);
  const [academiesLoading, setAcademiesLoading] = useState(false);
  const [academiesError, setAcademiesError] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  /* ——— Fetch plans (للمدرس فقط) ——— */
  useEffect(() => {
    if (form.accountType !== 'teacher') return;
    if (plans.length > 0) return;

    let mounted = true;
    setPlansLoading(true);
    setPlansError('');

    (async () => {
      try {
        const data = await publicService.getPlans();
        if (mounted) setPlans(data);
      } catch (err) {
        if (mounted) setPlansError(extractApiError(err).message);
      } finally {
        if (mounted) setPlansLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [form.accountType, plans.length]);

  /* ——— Fetch academies (للطالب وولي الأمر) ——— */
  useEffect(() => {
    if (form.accountType !== 'student' && form.accountType !== 'parent') {
      return;
    }
    if (academies.length > 0) return;

    let mounted = true;
    setAcademiesLoading(true);
    setAcademiesError('');

    (async () => {
      try {
        const data = await authService.getSignupAcademies();
        if (mounted) setAcademies(data || []);
      } catch (err) {
        if (mounted) setAcademiesError(extractApiError(err).message);
      } finally {
        if (mounted) setAcademiesLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [form.accountType, academies.length]);

  const onSelectPlan = (planId) => {
    setForm((s) => ({ ...s, requestedPlanId: planId }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      return setError(t('auth.passwordsDontMatch'));
    }

    if (form.accountType === 'teacher' && !form.requestedPlanId) {
      return setError(t('auth.pleaseChoosePlan'));
    }
    
    if (form.accountType === 'student' && !form.academyId) {
      return setError('يرجى اختيار الأكاديمية');
    }
    
    if (form.accountType === 'parent') {
      if (!form.parentAcademyId) {
        return setError('يرجى اختيار الأكاديمية');
      }
      if (!form.childContact?.trim()) {
        return setError('يرجى إدخال إيميل أو موبايل الطفل');
      }
    }

    setLoading(true);
    try {
      // ✅ بناء الـ payload بشكل صريح عشان نضمن إن كل حاجة بتوصل
      const payload = {
        accountType: form.accountType,
        name: form.name,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
        confirmPassword: form.confirmPassword,
        preferredLanguage: form.preferredLanguage,
      };

      if (form.accountType === 'teacher') {
        payload.academyName = form.academyName;
        payload.requestedPlanId = form.requestedPlanId;
      }

      if (form.accountType === 'student') {
        payload.gradeLevel = form.gradeLevel;
        payload.academyId = form.academyId;
        if (form.parentContact) payload.parentContact = form.parentContact;
      }

      if (form.accountType === 'parent') {
        payload.childContact = form.childContact;
        payload.parentAcademyId = form.parentAcademyId;
      }

      console.log('🚀🚀 SENDING TO BACKEND:', payload);
      await authService.register(payload);
      
      setSuccess(t('auth.registerSuccess'));
      setTimeout(
        () => navigate(`/verify-email?email=${encodeURIComponent(form.email)}`),
        1200,
      );
    } catch (err) {
      console.error('Registration error:', err);
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.register')}
      subtitle={t('auth.registerSubtitle')}
      maxWidth="max-w-2xl"
    >
      <AuthAlert>{error}</AuthAlert>
      <AuthAlert type="success">{success}</AuthAlert>

      <form onSubmit={onSubmit} className="space-y-4">
        <AuthSelect
          label={t('auth.accountType')}
          name="accountType"
          value={form.accountType}
          onChange={onChange}
        >
          <option value="teacher">🎓 {t('auth.teacher')}</option>
          <option value="student">📚 {t('auth.student')}</option>
          <option value="parent">👨‍👩‍👧 {t('auth.parent')}</option>
        </AuthSelect>

        <AuthInput
          label={t('auth.name')}
          name="name"
          value={form.name}
          onChange={onChange}
          required
        />

        <AuthInput
          label={t('auth.email')}
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          required
        />

        <AuthInput
          label={t('auth.phone')}
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={onChange}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AuthInput
            label={t('auth.password')}
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            required
            minLength={8}
          />
          <AuthInput
            label={t('auth.confirmPassword')}
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={onChange}
            required
            minLength={8}
          />
        </div>

        {/* Teacher only */}
        {form.accountType === 'teacher' && (
          <>
            <AuthInput
              label={t('auth.academyName')}
              name="academyName"
              value={form.academyName}
              onChange={onChange}
              required
            />

            <div className="pt-3">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-slate-800">
                  {t('auth.choosePlan')}
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {plans.length} {lang === 'ar' ? 'باقة' : 'plans'}
                </span>
              </div>

              {plansLoading && (
                <div className="flex items-center justify-center py-10 bg-slate-50 rounded-2xl">
                  <svg className="w-7 h-7 animate-spin text-[#1a3a5c]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm text-slate-500 ms-3">{t('auth.plansLoading')}</span>
                </div>
              )}

              {plansError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {plansError}
                </div>
              )}

              {!plansLoading && !plansError && plans.length === 0 && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-slate-500 text-sm text-center">
                  {t('auth.noPlansAvailable')}
                </div>
              )}

              {!plansLoading && plans.length > 0 && (
                <div className="space-y-3">
                  {plans
                    .slice()
                    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                    .map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        selected={form.requestedPlanId}
                        onSelect={onSelectPlan}
                        lang={lang}
                      />
                    ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Student only */}
        {form.accountType === 'student' && (
          <>
            {academiesLoading ? (
              <div className="p-3 rounded-lg bg-slate-50 text-slate-500 text-sm text-center animate-pulse">
                جاري تحميل الأكاديميات...
              </div>
            ) : academiesError ? (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                {academiesError}
              </div>
            ) : academies.length === 0 ? (
              <div className="p-3 rounded-lg bg-amber-50 text-amber-700 text-sm text-center">
                لا توجد أكاديميات متاحة حالياً للتسجيل
              </div>
            ) : (
              <AuthSelect
                label="الأكاديمية"
                name="academyId"
                value={form.academyId}
                onChange={onChange}
                required
              >
                <option value="">اختر الأكاديمية</option>
                {academies.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </AuthSelect>
            )}

            <AuthSelect
              label={t('auth.gradeLevel')}
              name="gradeLevel"
              value={form.gradeLevel}
              onChange={onChange}
              required
            >
              <option value="">{t('auth.choose')}</option>
              <option value="grade_1">{t('grades.grade_1')}</option>
              <option value="grade_2">{t('grades.grade_2')}</option>
              <option value="grade_3">{t('grades.grade_3')}</option>
              <option value="grade_4">{t('grades.grade_4')}</option>
              <option value="grade_5">{t('grades.grade_5')}</option>
              <option value="grade_6">{t('grades.grade_6')}</option>
              <option value="grade_7">{t('grades.grade_7')}</option>
              <option value="grade_8">{t('grades.grade_8')}</option>
              <option value="grade_9">{t('grades.grade_9')}</option>
              <option value="grade_10">{t('grades.grade_10')}</option>
              <option value="grade_11">{t('grades.grade_11')}</option>
              <option value="grade_12">{t('grades.grade_12')}</option>
            </AuthSelect>

            <AuthInput
              label={t('auth.parentContact')}
              name="parentContact"
              value={form.parentContact}
              onChange={onChange}
              placeholder="+201000000000"
            />
          </>
        )}

        {/* Parent only */}
        {form.accountType === 'parent' && (
          <>
            {academiesLoading ? (
              <div className="p-3 rounded-lg bg-slate-50 text-slate-500 text-sm text-center animate-pulse">
                جاري تحميل الأكاديميات...
              </div>
            ) : academiesError ? (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                {academiesError}
              </div>
            ) : academies.length === 0 ? (
              <div className="p-3 rounded-lg bg-amber-50 text-amber-700 text-sm text-center">
                لا توجد أكاديميات متاحة حالياً للتسجيل
              </div>
            ) : (
              <AuthSelect
                label="الأكاديمية"
                name="parentAcademyId"
                value={form.parentAcademyId}
                onChange={onChange}
                required
              >
                <option value="">اختر الأكاديمية</option>
                {academies.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </AuthSelect>
            )}

            <AuthInput
              label="إيميل أو موبايل الطفل"
              name="childContact"
              value={form.childContact}
              onChange={onChange}
              placeholder="child@example.com أو +201000000000"
              required
            />

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              ⚠️ سيتم إرسال طلب ربط لطفلك — سيحتاج المدرس للموافقة عليه قبل
              أن تتمكن من متابعة بياناته.
            </div>
          </>
        )}

        <AuthButton type="submit" loading={loading}>
          {loading ? t('auth.signingUp') : t('auth.register')}
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {t('auth.haveAccount')}{' '}
        <Link to="/login" className="text-[#1a3a5c] font-bold hover:underline">
          {t('auth.login')}
        </Link>
      </p>
    </AuthLayout>
  );
}
