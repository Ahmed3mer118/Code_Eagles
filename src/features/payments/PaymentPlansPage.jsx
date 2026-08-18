import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { paymentPlanApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import StatusBadge from '../../shared/ui/StatusBadge';
import FormModal from '../../shared/ui/FormModal';
import FormField from '../../shared/ui/FormField';

const emptyPlan = { name: '', price: 0, description: '', status: 'active', packageType: 'lectures_and_exams', planType: 'standard', trialDays: 0 };

export default function PaymentPlansPage() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await paymentPlanApi.list();
      setPlans(data.plans || []);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (values) => {
    try {
      if (modal?.plan?._id) {
        await paymentPlanApi.update(modal.plan._id, values);
      } else {
        await paymentPlanApi.create(values);
      }
      toast.success(t('common.success'));
      setModal(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    }
  };

  const deactivate = async (id) => {
    try {
      await paymentPlanApi.remove(id);
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('payments.plansTitle')}
        subtitle={t('payments.plansHint')}
        actions={(
          <button type="button" className="ce-btn ce-btn-accent text-sm" onClick={() => setModal({ plan: null })}>
            {t('payments.addPlan')}
          </button>
        )}
      />

      {loading ? (
        <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>
      ) : plans.length === 0 ? (
        <div className="ce-card p-8 text-center text-[var(--ce-muted)]">{t('payments.noPlans')}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {plans.map((plan) => (
            <article key={plan._id} className="ce-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-[var(--ce-primary)]">{plan.name}</h3>
                  <p className="mt-1 text-2xl font-extrabold text-[var(--ce-accent)]">{plan.price} {t('academy.currency')}</p>
                </div>
                <StatusBadge status={plan.status === 'active' ? 'approved' : 'pending'} label={t(`payments.planStatus.${plan.status}`)} />
              </div>
              {plan.description && <p className="mt-3 text-sm text-[var(--ce-muted)]">{plan.description}</p>}
              <p className="mt-2 text-xs font-semibold uppercase text-[var(--ce-muted)]">
                {t(`payments.planTypes.${plan.planType || 'standard'}`)}
                {plan.planType === 'trial' && plan.trialDays ? ` · ${plan.trialDays} ${t('payments.trialDays')}` : ''}
              </p>
              <div className="mt-4 flex gap-2">
                <button type="button" className="ce-btn ce-btn-ghost text-sm" onClick={() => setModal({ plan })}>{t('content.edit')}</button>
                {plan.status === 'active' && (
                  <button type="button" className="ce-btn ce-btn-ghost text-sm" onClick={() => deactivate(plan._id)}>{t('payments.deactivate')}</button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <FormModal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.plan?._id ? t('payments.editPlan') : t('payments.addPlan')}
        initialValues={modal?.plan || emptyPlan}
        onSubmit={save}
      >
        {({ values, setValues }) => (
          <div className="space-y-4">
            <FormField label={t('payments.planName')} required>
              <input className="ce-input" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
            </FormField>
            <FormField label={t('payments.amount')} required>
              <input type="number" min="0" className="ce-input" value={values.price} onChange={(e) => setValues({ ...values, price: Number(e.target.value) })} />
            </FormField>
            <FormField label={t('payments.planDescription')}>
              <textarea className="ce-input min-h-[90px]" value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} />
            </FormField>
            <FormField label={t('payments.package')}>
              <select className="ce-input" value={values.packageType} onChange={(e) => setValues({ ...values, packageType: e.target.value })}>
                <option value="lectures_only">{t('payments.lecturesOnly')}</option>
                <option value="exams_only">{t('payments.examsOnly')}</option>
                <option value="lectures_and_exams">{t('payments.fullPackage')}</option>
              </select>
            </FormField>
            <FormField label={t('payments.planType')}>
              <select className="ce-input" value={values.planType || 'standard'} onChange={(e) => setValues({ ...values, planType: e.target.value })}>
                <option value="standard">{t('payments.planTypes.standard')}</option>
                <option value="free">{t('payments.planTypes.free')}</option>
                <option value="trial">{t('payments.planTypes.trial')}</option>
              </select>
            </FormField>
            {values.planType === 'trial' && (
              <FormField label={t('payments.trialDays')}>
                <input type="number" min="1" className="ce-input" value={values.trialDays || 0} onChange={(e) => setValues({ ...values, trialDays: Number(e.target.value) })} />
              </FormField>
            )}
          </div>
        )}
      </FormModal>
    </div>
  );
}
