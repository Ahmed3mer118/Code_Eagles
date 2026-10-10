import { useEffect, useRef, useState } from 'react';
import { platformPlansService } from '../../../shared/api/platformPlansService';
import { useI18n } from '../../../shared/i18n/I18nContext';

/* ─────────────────────────────────────────────
   Constants
   ───────────────────────────────────────────── */

const STATUS_OPTIONS = [
  { value: 'active',   labelAr: 'نشط',    labelEn: 'Active',   dot: 'bg-emerald-500' },
  { value: 'inactive', labelAr: 'موقوف',  labelEn: 'Inactive', dot: 'bg-amber-500'   },
  { value: 'archived', labelAr: 'مؤرشف', labelEn: 'Archived', dot: 'bg-slate-400'   },
];

const DURATION_UNITS = [
  { value: 1,  labelAr: 'بالأشهر',  labelEn: 'Months' },
  { value: 12, labelAr: 'بالسنوات', labelEn: 'Years' },
];

const PLAN_FEATURES = [
  { key: 'groups',       labelAr: 'المجموعات',          labelEn: 'Groups' },
  { key: 'lessons',      labelAr: 'الدروس والمحاضرات',  labelEn: 'Lessons & Lectures' },
  { key: 'quizzes',      labelAr: 'الاختبارات',          labelEn: 'Quizzes' },
  { key: 'assignments',  labelAr: 'الواجبات',            labelEn: 'Assignments' },
  { key: 'certificates', labelAr: 'الشهادات',            labelEn: 'Certificates' },
  { key: 'assistants',   labelAr: 'المساعدون',           labelEn: 'Assistants' },
  { key: 'payments',     labelAr: 'المدفوعات',           labelEn: 'Payments' },
  { key: 'leaderboard',  labelAr: 'المتصدرون',           labelEn: 'Leaderboard' },
  { key: 'discussions',  labelAr: 'النقاشات',            labelEn: 'Discussions' },
];

const DEFAULT_FEATURES = {
  groups: true,
  lessons: true,
  quizzes: true,
  assignments: true,
  certificates: true,
  assistants: false,
  payments: true,
  leaderboard: true,
  discussions: false,
};

const EMPTY_FORM = {
  name: '',
  slug: '',
  price: 0,
  periodMonths: 1,
  durationUnit: 1,
  features: { ...DEFAULT_FEATURES },
  maxStudents: '',
  maxAssistants: '',
  sortOrder: 0,
  status: 'active',
};

/* ─────────────────────────────────────────────
   Page Component
   ───────────────────────────────────────────── */

export default function PlansPage() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [plans, setPlans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [saving, setSaving]   = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({}); // ⭐ أخطاء الحقول

  /* ── Fetch ── */
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await platformPlansService.list();
      setPlans(res?.data ?? res ?? []);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          (isAr ? 'فشل تحميل الباقات' : 'Failed to load plans'),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Modal handlers ── */
  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, features: { ...DEFAULT_FEATURES } });
    setFieldErrors({});       // ⭐ صفّر الأخطاء
    setError('');
    setModalOpen(true);
  };

  const openEdit = (plan) => {
    setEditing(plan);
    const months = plan.periodMonths ?? 1;

    const incoming = plan.features ?? {};
    const normalizedFeatures = Array.isArray(incoming)
      ? Object.fromEntries(incoming.map((k) => [k, true]))
      : { ...DEFAULT_FEATURES, ...incoming };

    setForm({
      name: plan.name ?? '',
      slug: plan.slug ?? '',
      price: Number(plan.price ?? 0),
      periodMonths: months,
      durationUnit: months % 12 === 0 && months > 0 ? 12 : 1,
      features: normalizedFeatures,
      maxStudents: plan.maxStudents ?? '',
      maxAssistants: plan.maxAssistants ?? '',
      sortOrder: plan.sortOrder ?? 0,
      status: plan.status ?? 'active',
    });
    setFieldErrors({});       // ⭐ صفّر الأخطاء
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!saving) setModalOpen(false);
  };

  const handleChange = (key) => (e) => {
    const value =
      e.target.type === 'number' ? Number(e.target.value) : e.target.value;

    setForm((p) => ({ ...p, [key]: value }));

    // ⭐ امسح خطأ الحقل ده لما المستخدم يعدّله
    if (fieldErrors[key]) {
      setFieldErrors((p) => {
        const copy = { ...p };
        delete copy[key];
        return copy;
      });
    }
  };

  const toggleFeature = (key) => (val) => {
    setForm((p) => ({
      ...p,
      features: { ...p.features, [key]: val },
    }));
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setFieldErrors({});

      const totalMonths =
        Number(form.periodMonths) * Number(form.durationUnit);

      const payload = {
        name: form.name,
        slug: form.slug,
        price: Number(form.price),
        periodMonths: totalMonths,
        features: form.features,
        maxStudents: form.maxStudents === '' ? null : Number(form.maxStudents),
        maxAssistants:
          form.maxAssistants === '' ? null : Number(form.maxAssistants),
        sortOrder: Number(form.sortOrder),
        status: form.status,
      };

      if (editing) {
        await platformPlansService.update(editing.id, payload);
      } else {
        await platformPlansService.create(payload);
      }

      setModalOpen(false);
      await fetchPlans();
    } catch (e) {
      const res = e?.response?.data;
      const status = e?.response?.status;

      // ⭐ 409 = duplicate → رسالة واضحة تحت الحقل
      if (status === 409) {
        const msg =
          (typeof res?.message === 'string' && res.message) ||
          (isAr
            ? `المعرّف "${form.slug}" مستخدم بالفعل. اختر معرّفاً آخر.`
            : `Slug "${form.slug}" is already used. Choose another one.`);

        setError(msg);

        const field = res?.field || 'slug';
        setFieldErrors((p) => ({ ...p, [field]: msg }));
        return;
      }

      // 400 = validation error
      if (status === 400) {
        const raw = res?.message;
        const msg = Array.isArray(raw)
          ? raw.join(' • ')
          : raw || (isAr ? 'بيانات غير صحيحة' : 'Invalid data');
        setError(msg);
        return;
      }

      // باقي الأخطاء
      const raw = res?.message;
      const msg = Array.isArray(raw)
        ? raw.join(' • ')
        : raw || (isAr ? 'فشل الحفظ' : 'Save failed');
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  /* ── ⭐ Change Status ── */
  const handleChangeStatus = async (plan, newStatus) => {
    if (plan.status === newStatus) return;
    try {
      setStatusLoadingId(plan.id);
      setError('');
      await platformPlansService.updateStatus(plan.id, newStatus);
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, status: newStatus } : p)),
      );
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          (isAr ? 'فشل تغيير الحالة' : 'Failed to change status'),
      );
    } finally {
      setStatusLoadingId(null);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (plan) => {
    const ok = window.confirm(
      isAr ? `تأكيد حذف باقة "${plan.name}"؟` : `Delete plan "${plan.name}"?`,
    );
    if (!ok) return;
    try {
      await platformPlansService.remove(plan.id);
      setPlans((p) => p.filter((x) => x.id !== plan.id));
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          (isAr ? 'فشل الحذف' : 'Delete failed'),
      );
    }
  };

  /* ── Seed Free ── */
  const handleSeedFree = async () => {
    try {
      setSaving(true);
      await platformPlansService.seedFree();
      await fetchPlans();
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          (isAr ? 'فشل إنشاء الباقة المجانية' : 'Seed failed'),
      );
    } finally {
      setSaving(false);
    }
  };

  /* ── Count active features ── */
  const activeFeaturesCount = (features) => {
    if (!features) return 0;
    if (Array.isArray(features)) return features.length;
    return Object.values(features).filter(Boolean).length;
  };

  /* ─────────────────────────────────────────
     Render
     ───────────────────────────────────────── */
  return (
    <div
      className="p-6 space-y-6 bg-slate-50 min-h-screen"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isAr ? 'باقات المنصة' : 'Platform Plans'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isAr
              ? 'إدارة اشتراكات وباقات المدارس على المنصة'
              : 'Manage platform subscription plans'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedFree}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 text-sm font-medium"
          >
            {isAr ? 'إضافة الباقة المجانية' : 'Seed Free Plan'}
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-white text-sm font-bold shadow-sm"
          >
            + {isAr ? 'إضافة باقة' : 'New Plan'}
          </button>
        </div>
      </div>

      {/* ⭐ Error Banner — خارج المودال بس */}
      {error && !modalOpen && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-slate-500">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          {isAr ? 'لا توجد باقات بعد' : 'No plans yet'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {plan.slug}
                  </p>
                </div>

                <StatusMenu
                  currentStatus={plan.status}
                  isAr={isAr}
                  loading={statusLoadingId === plan.id}
                  onChange={(newStatus) => handleChangeStatus(plan, newStatus)}
                />
              </div>

              <div className="mt-4 text-slate-600">
                <div className="text-2xl font-bold text-slate-800">
                  {Number(plan.price).toLocaleString('en-EG')}{' '}
                  <span className="text-sm font-normal text-slate-500">ج.م</span>
                  <span className="text-sm font-normal text-slate-400 ms-1">
                    / {plan.periodMonths} {isAr ? 'شهر' : 'mo'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  👥 {isAr ? 'طلاب' : 'Students'}: {plan.maxStudents ?? '∞'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                  🎓 {isAr ? 'مساعدين' : 'Assistants'}:{' '}
                  {plan.maxAssistants ?? '∞'}
                </span>
              </div>

              {/* Feature chips summary */}
              <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
                {PLAN_FEATURES.filter((f) => {
                  const feats = plan.features ?? {};
                  if (Array.isArray(feats)) return feats.includes(f.key);
                  return !!feats[f.key];
                })
                  .slice(0, 5)
                  .map((f) => (
                    <span
                      key={f.key}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100"
                    >
                      ✓ {isAr ? f.labelAr : f.labelEn}
                    </span>
                  ))}
                {activeFeaturesCount(plan.features) > 5 && (
                  <span className="text-slate-400 self-center">
                    +{activeFeaturesCount(plan.features) - 5}
                  </span>
                )}
              </div>

              <div className="mt-auto pt-5 flex items-center gap-2">
                <button
                  onClick={() => openEdit(plan)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium"
                >
                  {isAr ? 'تعديل' : 'Edit'}
                </button>
                <button
                  onClick={() => handleDelete(plan)}
                  className="px-3 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-medium"
                >
                  {isAr ? 'حذف' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════ Modal ═══════════ */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Modal Header */}
            <div className="relative px-8 pt-6 pb-4 border-b border-slate-100">
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-5 end-5 w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold text-slate-800">
                {editing
                  ? isAr
                    ? 'تعديل الباقة'
                    : 'Edit Plan'
                  : isAr
                    ? 'إضافة باقة'
                    : 'Add Plan'}
              </h2>
            </div>

            {/* ⭐ Error Alert داخل المودال */}
            {error && (
              <div className="mx-8 mt-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm flex items-start gap-2">
                <span className="text-base leading-none">⚠️</span>
                <span className="flex-1">{error}</span>
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="text-rose-400 hover:text-rose-600 shrink-0"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="px-8 py-6 space-y-5 overflow-y-auto">
              {/* Slug */}
              <Field label={isAr ? 'معرّف الباقة *' : 'Plan slug *'}>
                <input
                  required
                  value={form.slug}
                  onChange={handleChange('slug')}
                  className={`input-lite font-mono ${
                    fieldErrors.slug
                      ? '!border-rose-400 !ring-2 !ring-rose-200'
                      : ''
                  }`}
                  placeholder="starter-plus"
                  dir="ltr"
                />
                {fieldErrors.slug ? (
                  <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{fieldErrors.slug}</span>
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-500">
                    {isAr
                      ? 'معرّف فريد بالإنجليزية (مثل: starter-plus)'
                      : 'Unique English identifier (e.g. starter-plus)'}
                  </p>
                )}
              </Field>

              {/* Name */}
              <Field label={isAr ? 'اسم الباقة *' : 'Plan name *'}>
                <input
                  required
                  value={form.name}
                  onChange={handleChange('name')}
                  className="input-lite"
                  placeholder={isAr ? 'الباقة الأساسية' : 'Starter Plan'}
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  {isAr
                    ? 'اسم الباقة كما تظهر للمستخدمين'
                    : 'The name shown to users'}
                </p>
              </Field>

              {/* Price + Duration + Unit */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label={isAr ? 'المبلغ (ج.م) *' : 'Amount (EGP) *'}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange('price')}
                    className="input-lite"
                    placeholder="500"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    {isAr ? 'السعر بالجنيه المصري' : 'Price in EGP'}
                  </p>
                </Field>

                <Field label={isAr ? 'مدة الاشتراك *' : 'Duration *'}>
                  <input
                    type="number"
                    min="1"
                    value={form.periodMonths}
                    onChange={handleChange('periodMonths')}
                    className="input-lite"
                    placeholder="1"
                  />
                </Field>

                <Field label={isAr ? 'وحدة المدة' : 'Duration unit'}>
                  <select
                    value={form.durationUnit}
                    onChange={handleChange('durationUnit')}
                    className="input-lite"
                  >
                    {DURATION_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {isAr ? u.labelAr : u.labelEn}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <p className="text-xs text-slate-500 -mt-2">
                {isAr
                  ? 'مدة الاشتراك = العدد × الوحدة (مثال: 3 أشهر)'
                  : 'Duration = number × unit (e.g. 3 months)'}
              </p>

              {/* Limits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label={isAr ? 'أقصى عدد طلاب' : 'Max students'}>
                  <input
                    type="number"
                    min="0"
                    value={form.maxStudents}
                    onChange={handleChange('maxStudents')}
                    className="input-lite"
                    placeholder={isAr ? 'فارغ = لا محدود' : 'empty = unlimited'}
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    {isAr
                      ? 'الحد الأقصى لطلاب المدرسة'
                      : 'Maximum students per tenant'}
                  </p>
                </Field>

                <Field label={isAr ? 'أقصى عدد مساعدين' : 'Max assistants'}>
                  <input
                    type="number"
                    min="0"
                    value={form.maxAssistants}
                    onChange={handleChange('maxAssistants')}
                    className="input-lite"
                    placeholder={isAr ? 'فارغ = لا محدود' : 'empty = unlimited'}
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    {isAr
                      ? 'الحد الأقصى للمساعدين'
                      : 'Maximum assistants per tenant'}
                  </p>
                </Field>
              </div>

              {/* ⭐ Features Section — Toggles */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  {isAr ? 'المميزات المتاحة' : 'Available Features'}
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  {isAr
                    ? 'حدد المميزات المتاحة في هذه الباقة'
                    : 'Enable the features available in this plan'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PLAN_FEATURES.map((f) => (
                    <FeatureSwitch
                      key={f.key}
                      label={isAr ? f.labelAr : f.labelEn}
                      checked={!!form.features[f.key]}
                      onChange={toggleFeature(f.key)}
                    />
                  ))}
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  {isAr
                    ? `${Object.values(form.features).filter(Boolean).length} ميزة مفعّلة`
                    : `${Object.values(form.features).filter(Boolean).length} feature(s) enabled`}
                </p>
              </div>

              {/* Status + Sort */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label={isAr ? 'الحالة' : 'Status'}>
                  <select
                    value={form.status}
                    onChange={handleChange('status')}
                    className="input-lite"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {isAr ? s.labelAr : s.labelEn}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={isAr ? 'الترتيب' : 'Sort order'}>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={handleChange('sortOrder')}
                    className="input-lite"
                  />
                </Field>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="px-5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-sm font-medium"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-white text-sm font-bold shadow-sm disabled:opacity-50"
              >
                {saving
                  ? isAr
                    ? 'جاري الحفظ...'
                    : 'Saving...'
                  : isAr
                    ? 'حفظ'
                    : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sub Components
   ───────────────────────────────────────────── */

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function FeatureSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
        checked
          ? 'border-amber-300 bg-amber-50/60 hover:bg-amber-50'
          : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      <span
        className={`text-sm font-semibold ${
          checked ? 'text-slate-800' : 'text-slate-500'
        }`}
      >
        {label}
      </span>

      <span
        dir="ltr"
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? 'bg-amber-400' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}

/* ⭐ Status Menu — dropdown لتغيير الحالة بسرعة */
function StatusMenu({ currentStatus, onChange, isAr, loading }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current =
    STATUS_OPTIONS.find((s) => s.value === currentStatus) || STATUS_OPTIONS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
          currentStatus === 'active'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            : currentStatus === 'inactive'
              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
        } ${loading ? 'opacity-60 cursor-wait' : ''}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
        {isAr ? current.labelAr : current.labelEn}
        {loading ? (
          <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="text-[10px] opacity-70">▼</span>
        )}
      </button>

      {open && !loading && (
        <div
          className="absolute end-0 top-full mt-1.5 w-40 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-20"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          {STATUS_OPTIONS.map((opt) => {
            const isCurrent = opt.value === currentStatus;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={isCurrent}
                onClick={() => {
                  setOpen(false);
                  onChange(opt.value);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition ${
                  isCurrent
                    ? 'bg-slate-50 text-slate-400 cursor-default'
                    : 'text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
                <span>{isAr ? opt.labelAr : opt.labelEn}</span>
                {isCurrent && (
                  <span className="ms-auto text-emerald-500">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}