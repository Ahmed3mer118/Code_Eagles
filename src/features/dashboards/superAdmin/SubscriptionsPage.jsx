import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Bell, CalendarClock, CreditCard, Mail } from 'lucide-react';
import { subscriptionApi, platformPlanApi, FEATURE_KEYS } from '../../../shared/api/platformApi';
import { formatSubscriptionExpiry } from '../../../shared/utils/subscriptionDays';
import SearchInput from '../../../shared/ui/SearchInput';
import StatusBadge from '../../../shared/ui/StatusBadge';
import ToggleSwitch from '../../../shared/ui/ToggleSwitch';
import FormModal from '../../../shared/ui/FormModal';
import FormField from '../../../shared/ui/FormField';
import ReceiptViewer from '../../../shared/ui/ReceiptViewer';
import EmptyState from '../../../shared/ui/EmptyState';

const TABS = ['plans', 'requests'];
const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'];

const emptyNewPlan = {
  key: '',
  name: { ar: '', en: '' },
  description: { ar: '', en: '' },
  price: 500,
  periodMonths: 1,
  maxStudents: 300,
  maxAssistants: 2,
  features: ['groups', 'quizzes', 'assignments', 'payments', 'leaderboard'],
};

export default function SubscriptionsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ar';
  const [tab, setTab] = useState('plans');
  const [items, setItems] = useState([]);
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState('');
  const [savingPlan, setSavingPlan] = useState('');
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [reminding, setReminding] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  const statusCounts = useMemo(
    () =>
      STATUS_FILTERS.reduce((acc, key) => {
        acc[key] = key === 'all' ? items.length : items.filter((item) => item.status === key).length;
        return acc;
      }, {}),
    [items]
  );

  const visibleRequests = useMemo(
    () => (statusFilter === 'all' ? items : items.filter((item) => item.status === statusFilter)),
    [items, statusFilter]
  );

  const load = async () => {
    try {
      const [subs, planRes] = await Promise.all([
        subscriptionApi.list(search ? { q: search, source: 'teacher' } : { source: 'teacher' }),
        platformPlanApi.listAdmin(),
      ]);
      setItems(subs.subscriptions || []);
      setPlans(planRes.plans || []);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const review = async (id, status) => {
    try {
      await subscriptionApi.review(id, { status });
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const sendReminder = async (id) => {
    setReminding(id);
    try {
      await subscriptionApi.sendReminder(id);
      toast.success(t('admin.reminderSent'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setReminding('');
    }
  };

  const updatePlanField = (key, field, value) => {
    setPlans((prev) => prev.map((p) => (p.key === key ? { ...p, [field]: value } : p)));
  };

  const updatePlanLocalized = (key, field, locale, value) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.key === key ? { ...p, [field]: { ...(p[field] || {}), [locale]: value } } : p
      )
    );
  };

  const togglePlanFeature = (key, feature, enabled) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.key !== key) return p;
        const features = new Set(p.features || []);
        if (enabled) features.add(feature);
        else features.delete(feature);
        return { ...p, features: [...features] };
      })
    );
  };

  const toggleNewPlanFeature = (feature, enabled, setValues, values) => {
    const features = new Set(values.features || []);
    if (enabled) features.add(feature);
    else features.delete(feature);
    setValues({ ...values, features: [...features] });
  };

  const savePlan = async (plan) => {
    setSavingPlan(plan.key);
    try {
      await platformPlanApi.update(plan.key, {
        name: plan.name,
        description: plan.description,
        price: Number(plan.price),
        periodMonths: Number(plan.periodMonths),
        maxStudents: Number(plan.maxStudents),
        maxAssistants: Number(plan.maxAssistants),
        features: plan.features,
        status: plan.status,
      });
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setSavingPlan('');
    }
  };

  const togglePlanStatus = async (plan) => {
    try {
      await platformPlanApi.toggleStatus(plan.key);
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const createPlan = async (values) => {
    await platformPlanApi.create(values);
    toast.success(t('common.success'));
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-[var(--ce-border)] pb-3">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === key ? 'bg-[var(--ce-primary)] text-white' : 'bg-[var(--ce-bg)] text-[var(--ce-primary)]'}`}
            onClick={() => setTab(key)}
          >
            {t(`admin.subTab.${key}`)}
          </button>
        ))}
      </div>

      {tab === 'plans' && (
        <>
          <div className="flex justify-end">
            <button type="button" className="ce-btn ce-btn-accent" onClick={() => setShowNewPlan(true)}>
              {t('admin.addPlan')}
            </button>
          </div>

          <FormModal
            open={showNewPlan}
            onClose={() => setShowNewPlan(false)}
            title={t('admin.addPlan')}
            initialValues={emptyNewPlan}
            onSubmit={createPlan}
            size="lg"
          >
            {({ values, setValues }) => (
              <div className="space-y-1">
                <FormField label={t('admin.planKey')} helper={t('admin.fieldPlanKeyHint')} required>
                  <input className="ce-input" value={values.key} onChange={(e) => setValues({ ...values, key: e.target.value })} placeholder="starter-plus" required />
                </FormField>
                <div className="grid gap-1 md:grid-cols-2">
                  <FormField label={`${t('admin.title')} (AR)`} helper={t('admin.fieldPlanNameHint')} required>
                    <input className="ce-input" value={values.name.ar} onChange={(e) => setValues({ ...values, name: { ...values.name, ar: e.target.value } })} required />
                  </FormField>
                  <FormField label={`${t('admin.title')} (EN)`} required>
                    <input className="ce-input" value={values.name.en} onChange={(e) => setValues({ ...values, name: { ...values.name, en: e.target.value } })} required />
                  </FormField>
                </div>
                <div className="grid gap-1 md:grid-cols-2">
                  <FormField label={t('payments.amount')} helper={t('admin.fieldPlanPriceHint')} required>
                    <input className="ce-input" type="number" min="0" value={values.price} onChange={(e) => setValues({ ...values, price: Number(e.target.value) })} />
                  </FormField>
                  <FormField label={t('platformSub.periodMonths')} helper={t('admin.fieldPlanPeriodHint')} required>
                    <input className="ce-input" type="number" min="1" value={values.periodMonths} onChange={(e) => setValues({ ...values, periodMonths: Number(e.target.value) })} />
                  </FormField>
                  <FormField label={t('dashboard.students')} helper={t('admin.fieldMaxStudentsHint')}>
                    <input className="ce-input" type="number" value={values.maxStudents} onChange={(e) => setValues({ ...values, maxStudents: Number(e.target.value) })} />
                  </FormField>
                  <FormField label={t('dashboard.assistants')} helper={t('admin.fieldMaxAssistantsHint')}>
                    <input className="ce-input" type="number" value={values.maxAssistants} onChange={(e) => setValues({ ...values, maxAssistants: Number(e.target.value) })} />
                  </FormField>
                </div>
                <FormField label={t('admin.features')} helper={t('admin.fieldPlanFeaturesHint')}>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {FEATURE_KEYS.map((feature) => (
                      <ToggleSwitch
                        key={feature}
                        label={t(`features.${feature}`)}
                        checked={(values.features || []).includes(feature)}
                        onChange={(v) => toggleNewPlanFeature(feature, v, setValues, values)}
                      />
                    ))}
                  </div>
                </FormField>
              </div>
            )}
          </FormModal>

          <div className="grid gap-4 xl:grid-cols-2">
            {plans.map((plan) => (
              <div key={plan.key} className="ce-card space-y-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{plan.name?.[lang] || plan.key}</h3>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={plan.status === 'active' ? 'approved' : 'pending'} label={plan.status} />
                    <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => togglePlanStatus(plan)}>
                      {plan.status === 'active' ? t('admin.deactivatePlan') : t('admin.activatePlan')}
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField label={`${t('admin.title')} (AR)`}>
                    <input className="ce-input" value={plan.name?.ar || ''} onChange={(e) => updatePlanLocalized(plan.key, 'name', 'ar', e.target.value)} />
                  </FormField>
                  <FormField label={`${t('admin.title')} (EN)`}>
                    <input className="ce-input" value={plan.name?.en || ''} onChange={(e) => updatePlanLocalized(plan.key, 'name', 'en', e.target.value)} />
                  </FormField>
                  <FormField label={t('payments.amount')} helper={t('admin.fieldPlanPriceHint')}>
                    <input className="ce-input" type="number" value={plan.price} onChange={(e) => updatePlanField(plan.key, 'price', e.target.value)} />
                  </FormField>
                  <FormField label={t('platformSub.periodMonths')} helper={t('admin.fieldPlanPeriodHint')}>
                    <input className="ce-input" type="number" min="1" value={plan.periodMonths} onChange={(e) => updatePlanField(plan.key, 'periodMonths', e.target.value)} />
                  </FormField>
                </div>
                <FormField label={t('admin.features')} helper={t('admin.fieldPlanFeaturesHint')}>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {FEATURE_KEYS.map((feature) => (
                      <ToggleSwitch
                        key={feature}
                        label={t(`features.${feature}`)}
                        checked={(plan.features || []).includes(feature)}
                        onChange={(v) => togglePlanFeature(plan.key, feature, v)}
                      />
                    ))}
                  </div>
                </FormField>
                <button type="button" className="ce-btn ce-btn-accent" onClick={() => savePlan(plan)} disabled={savingPlan === plan.key}>
                  {savingPlan === plan.key ? t('common.loading') : t('common.save')}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'requests' && (
        <>
          <SearchInput value={search} onChange={setSearch} placeholder={t('admin.searchAcademy')} />

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                  statusFilter === key
                    ? 'border-[var(--ce-primary)] bg-[var(--ce-primary)] text-white'
                    : 'border-[var(--ce-border)] bg-[var(--ce-surface)] text-[var(--ce-muted)] hover:border-[var(--ce-primary)]/40'
                }`}
              >
                {key === 'all' ? t('payments.allStatuses') : t(`payments.status.${key}`)}
                <span
                  className={`rounded-full px-2 text-xs font-bold ${
                    statusFilter === key ? 'bg-white/20' : 'bg-[var(--ce-bg)]'
                  }`}
                >
                  {statusCounts[key] || 0}
                </span>
              </button>
            ))}
          </div>

          {visibleRequests.length === 0 ? (
            <EmptyState icon={CreditCard} title={t('admin.noTeacherRequests')} />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {visibleRequests.map((item) => (
                <article key={item._id} className="ce-card overflow-hidden">
                  <div className="border-b border-[var(--ce-border)] bg-[var(--ce-bg)] px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold text-[var(--ce-primary)]">{item.tenantId?.name}</h3>
                        <p className="mt-1 flex items-center gap-1 text-xs text-[var(--ce-muted)]">
                          <Mail className="h-3.5 w-3.5" />
                          {item.recordedBy?.email || '—'}
                        </p>
                      </div>
                      <StatusBadge status={item.status} label={t(`payments.status.${item.status}`)} />
                    </div>
                  </div>

                  <div className="space-y-3 p-5 text-sm">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-[var(--ce-accent)]" />
                      <span className="font-semibold">{item.plan}</span>
                      <span className="text-[var(--ce-muted)]">· {item.amount} {t('payments.currency')}</span>
                    </div>

                    {item.status === 'approved' && item.expiresAt && (
                      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-900">
                        <CalendarClock className="h-4 w-4" />
                        {formatSubscriptionExpiry(item.expiresAt, t)}
                      </div>
                    )}

                    {item.status === 'pending' && item.tenantActiveDaysRemaining != null && (
                      <div className="rounded-xl bg-amber-50 px-3 py-2 text-amber-900">
                        {t('admin.currentSubDaysLeft', { days: item.tenantActiveDaysRemaining })}
                      </div>
                    )}

                    {item.receiptImageUrl ? (
                      <ReceiptViewer url={item.receiptImageUrl} />
                    ) : (
                      <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">{t('admin.noReceiptYet')}</p>
                    )}

                    {item.lastReminderAt && (
                      <p className="text-xs text-[var(--ce-muted)]">{t('admin.lastReminder')}: {new Date(item.lastReminderAt).toLocaleString()}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-[var(--ce-border)] px-5 py-4">
                    {(item.status === 'pending' || (item.status === 'approved' && item.daysRemaining != null && item.daysRemaining <= 14)) && (
                      <button
                        type="button"
                        className="ce-btn ce-btn-ghost text-xs inline-flex items-center gap-1"
                        onClick={() => sendReminder(item._id)}
                        disabled={reminding === item._id}
                      >
                        <Bell className="h-3.5 w-3.5" />
                        {reminding === item._id ? t('common.loading') : t('admin.sendReminder')}
                      </button>
                    )}
                    {item.status === 'pending' && (
                      <>
                        <button type="button" className="ce-btn ce-btn-accent text-xs" onClick={() => review(item._id, 'approved')}>{t('payments.approve')}</button>
                        <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => review(item._id, 'rejected')}>{t('payments.reject')}</button>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
