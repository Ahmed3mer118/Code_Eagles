import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { CreditCard } from 'lucide-react';
import { platformPlanApi, FEATURE_KEYS } from '../../../shared/api/platformApi';
import { normalizePlanPeriod } from '../../../shared/utils/subscriptionDays';
import PageHeader from '../../../shared/ui/PageHeader';
import StatusBadge from '../../../shared/ui/StatusBadge';
import ToggleSwitch from '../../../shared/ui/ToggleSwitch';
import FormModal from '../../../shared/ui/FormModal';
import FormField from '../../../shared/ui/FormField';

const emptyNewPlan = {
  key: '',
  name: { ar: '', en: '' },
  description: { ar: '', en: '' },
  price: 500,
  periodUnit: 'months',
  periodValue: 1,
  maxStudents: 300,
  maxAssistants: 2,
  features: ['quizzes', 'assignments', 'lectures', 'certificates', 'groups', 'payments', 'leaderboard'],
};

function PlanPeriodFields({ values, onChange, t }) {
  const period = normalizePlanPeriod(values);
  return (
    <div className="grid gap-1 md:grid-cols-2">
      <FormField label={t('platformSub.periodUnit')} helper={t('admin.fieldPlanPeriodHint')}>
        <select
          className="ce-input"
          value={period.periodUnit}
          onChange={(e) => onChange({ ...values, periodUnit: e.target.value })}
        >
          <option value="months">{t('platformSub.periodUnitMonths')}</option>
          <option value="days">{t('platformSub.periodUnitDays')}</option>
        </select>
      </FormField>
      <FormField label={t('platformSub.periodValue')} required>
        <input
          className="ce-input"
          type="number"
          min="1"
          value={period.periodValue}
          onChange={(e) => onChange({ ...values, periodValue: Number(e.target.value) })}
        />
      </FormField>
    </div>
  );
}

export default function SubscriptionsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ar';
  const [plans, setPlans] = useState([]);
  const [savingPlan, setSavingPlan] = useState('');
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const planRes = await platformPlanApi.listAdmin();
      setPlans(planRes.plans || []);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
      const period = normalizePlanPeriod(plan);
      await platformPlanApi.update(plan.key, {
        name: plan.name,
        description: plan.description,
        price: Number(plan.price),
        periodUnit: period.periodUnit,
        periodValue: period.periodValue,
        periodMonths: period.periodUnit === 'months' ? period.periodValue : plan.periodMonths,
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
      <PageHeader
        title={t('admin.platformPlans')}
        subtitle={t('admin.subTab.plans')}
        icon={CreditCard}
        actions={(
          <button type="button" className="ce-btn ce-btn-accent" onClick={() => setShowNewPlan(true)}>
            {t('admin.addPlan')}
          </button>
        )}
      />

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
              <PlanPeriodFields values={values} onChange={setValues} t={t} />
              <FormField label={t('dashboard.students')} helper={t('admin.fieldMaxStudentsHint')}>
                <input className="ce-input" type="number" value={values.maxStudents} onChange={(e) => setValues({ ...values, maxStudents: Number(e.target.value) })} />
              </FormField>
              <FormField label={t('dashboard.assistants')} helper={t('admin.fieldMaxAssistantsHint')}>
                <input className="ce-input" type="number" value={values.maxAssistants} onChange={(e) => setValues({ ...values, maxAssistants: Number(e.target.value) })} />
              </FormField>
            </div>
            <div className="grid gap-1 md:grid-cols-2">
              <FormField label={`${t('admin.description')} (AR)`}>
                <textarea className="ce-input min-h-[70px]" value={values.description?.ar || ''} onChange={(e) => setValues({ ...values, description: { ...values.description, ar: e.target.value } })} />
              </FormField>
              <FormField label={`${t('admin.description')} (EN)`}>
                <textarea className="ce-input min-h-[70px]" value={values.description?.en || ''} onChange={(e) => setValues({ ...values, description: { ...values.description, en: e.target.value } })} />
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

      {loading ? (
        <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>
      ) : (
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
                <FormField label={`${t('admin.description')} (AR)`}>
                  <textarea className="ce-input min-h-[70px]" value={plan.description?.ar || ''} onChange={(e) => updatePlanLocalized(plan.key, 'description', 'ar', e.target.value)} />
                </FormField>
                <FormField label={`${t('admin.description')} (EN)`}>
                  <textarea className="ce-input min-h-[70px]" value={plan.description?.en || ''} onChange={(e) => updatePlanLocalized(plan.key, 'description', 'en', e.target.value)} />
                </FormField>
                <FormField label={t('payments.amount')} helper={t('admin.fieldPlanPriceHint')}>
                  <input className="ce-input" type="number" value={plan.price} onChange={(e) => updatePlanField(plan.key, 'price', e.target.value)} />
                </FormField>
                <FormField label={t('dashboard.students')} helper={t('admin.fieldMaxStudentsHint')}>
                  <input className="ce-input" type="number" value={plan.maxStudents} onChange={(e) => updatePlanField(plan.key, 'maxStudents', e.target.value)} />
                </FormField>
                <FormField label={t('dashboard.assistants')} helper={t('admin.fieldMaxAssistantsHint')}>
                  <input className="ce-input" type="number" value={plan.maxAssistants} onChange={(e) => updatePlanField(plan.key, 'maxAssistants', e.target.value)} />
                </FormField>
              </div>
              <PlanPeriodFields
                values={plan}
                onChange={(next) => setPlans((prev) => prev.map((p) => (p.key === plan.key ? { ...p, ...next } : p)))}
                t={t}
              />
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
      )}
    </div>
  );
}
