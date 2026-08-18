import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ArrowRight, CreditCard } from 'lucide-react';
import { groupApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import PlanPickerGrid, { CurrentPlanSummary, UpdateIntentPicker } from '../../shared/ui/PlanPickerGrid';
import getApiErrorMessage from '../../shared/utils/apiError';

const PACKAGES = [
  { value: 'lectures_only', labelKey: 'payments.lecturesOnly' },
  { value: 'exams_only', labelKey: 'payments.examsOnly' },
  { value: 'lectures_and_exams', labelKey: 'payments.fullPackage' },
];

export default function StudentSubscriptionPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const [enrollments, setEnrollments] = useState([]);
  const [paymentPlans, setPaymentPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updateIntent, setUpdateIntent] = useState('renew');
  const [enrollmentId, setEnrollmentId] = useState(params.get('enrollment') || '');
  const [paymentPlanId, setPaymentPlanId] = useState('');
  const [packageType, setPackageType] = useState('lectures_and_exams');
  const [amount, setAmount] = useState(0);

  const load = async () => {
    const data = await groupApi.myEnrollments();
    setEnrollments(data.enrollments || []);
    setPaymentPlans(data.tenant?.paymentPlans || []);
  };

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (err) {
        toast.error(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const eligibleEnrollments = useMemo(
    () => enrollments.filter((en) => ['pending', 'active'].includes(en.status)),
    [enrollments]
  );

  const selectedEnrollment = useMemo(
    () => eligibleEnrollments.find((en) => en._id === enrollmentId),
    [eligibleEnrollments, enrollmentId]
  );

  const currentPlanId = selectedEnrollment?.paymentPlanId?._id
    || selectedEnrollment?.paymentPlanId
    || '';

  const applyEnrollmentPlan = (enrollment) => {
    const planId = enrollment.paymentPlanId?._id || enrollment.paymentPlanId || '';
    const plan = paymentPlans.find((p) => p._id === planId);
    setPaymentPlanId(planId);
    setPackageType(plan?.packageType || enrollment.packageType);
    setAmount(plan?.price ?? enrollment.amountDue ?? 0);
  };

  useEffect(() => {
    if (!selectedEnrollment) return;
    if (updateIntent === 'renew') applyEnrollmentPlan(selectedEnrollment);
  }, [selectedEnrollment, paymentPlans, updateIntent]);

  useEffect(() => {
    if (!enrollmentId && eligibleEnrollments.length === 1) {
      setEnrollmentId(eligibleEnrollments[0]._id);
    }
  }, [enrollmentId, eligibleEnrollments]);

  const currentPlan = paymentPlans.find((p) => p._id === currentPlanId);
  const currentPlanName = currentPlan?.name
    || selectedEnrollment?.planName
    || (selectedEnrollment
      ? t(PACKAGES.find((p) => p.value === selectedEnrollment.packageType)?.labelKey || 'payments.fullPackage')
      : '');
  const currentPackageLabel = selectedEnrollment?.packageLabel
    || (selectedEnrollment?.packageType
      ? t(PACKAGES.find((p) => p.value === selectedEnrollment.packageType)?.labelKey || 'payments.fullPackage')
      : '');

  const onPlanSelect = (planId, plan) => {
    setPaymentPlanId(planId);
    setPackageType(plan?.packageType || packageType);
    setAmount(plan?.price ?? 0);
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!enrollmentId) {
      toast.error(t('payments.enrollmentRequired'));
      return;
    }
    if (updateIntent === 'change' && paymentPlanId && currentPlanId && paymentPlanId === currentPlanId) {
      toast.error(t('payments.samePlanSelected'));
      return;
    }
    if (!paymentPlanId && !packageType) {
      toast.error(t('student.errors.packageRequired'));
      return;
    }

    setSaving(true);
    try {
      const payload = paymentPlanId ? { paymentPlanId } : { packageType };
      await groupApi.updateMyPlan(enrollmentId, payload);
      toast.success(t('payments.planSaved'));
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={t('dashboard.subscription')}
        subtitle={t('payments.subscriptionPageHint')}
      />

      <div className="flex flex-wrap gap-2">
        <Link to="/dashboard/student/subscription" className="ce-btn ce-btn-primary text-sm">
          {t('dashboard.subscription')}
        </Link>
        <Link to="/dashboard/student/payments" className="ce-btn ce-btn-ghost text-sm">
          <CreditCard className="h-4 w-4" />
          {t('dashboard.payments')}
        </Link>
      </div>

      {eligibleEnrollments.length === 0 ? (
        <div className="ce-card p-10 text-center">
          <p className="text-[var(--ce-muted)]">{t('payments.noSubscriptionEnrollment')}</p>
          <Link to="/dashboard/student/join" className="ce-btn ce-btn-accent mt-5 inline-flex">
            {t('student.joinGroup')}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSave} className="space-y-4">
          <section className="ce-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[var(--ce-border)] bg-[var(--ce-bg)]/60 px-5 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ce-primary)] text-xs font-bold text-white">1</span>
              <h3 className="font-extrabold text-[var(--ce-primary)]">{t('payments.stepEnrollment')}</h3>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="ce-label">{t('payments.enrollment')}</label>
                <select
                  className="ce-input"
                  value={enrollmentId}
                  onChange={(e) => {
                    setUpdateIntent('renew');
                    setEnrollmentId(e.target.value);
                    setPaymentPlanId('');
                  }}
                  required
                >
                  <option value="">{t('payments.selectEnrollment')}</option>
                  {eligibleEnrollments.map((en) => (
                    <option key={en._id} value={en._id}>
                      {en.groupId?.name} — {en.groupId?.subjectId?.name}
                      {en.planName ? ` (${en.planName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEnrollment && (
                <>
                  <div className="rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)]/50 p-4">
                    <p className="text-xs font-bold uppercase text-[var(--ce-muted)]">{t('payments.updateOnGroup')}</p>
                    <p className="mt-1 font-extrabold text-[var(--ce-primary)]">{selectedEnrollment.groupId?.name}</p>
                    <p className="text-sm text-[var(--ce-muted)]">{selectedEnrollment.groupId?.subjectId?.name}</p>
                  </div>

                  <div>
                    <label className="ce-label">{t('payments.updateIntent')}</label>
                    <div className="mt-2">
                      <UpdateIntentPicker
                        value={updateIntent}
                        onChange={(intent) => {
                          setUpdateIntent(intent);
                          if (intent === 'renew') applyEnrollmentPlan(selectedEnrollment);
                        }}
                      />
                    </div>
                  </div>

                  {updateIntent === 'renew' && (
                    <CurrentPlanSummary
                      planName={currentPlanName}
                      packageLabel={currentPackageLabel}
                      amount={amount}
                      t={t}
                    />
                  )}

                  {updateIntent === 'change' && paymentPlans.length > 0 && (
                    <div>
                      <label className="ce-label">{t('payments.selectPlan')}</label>
                      <div className="mt-2">
                        <PlanPickerGrid
                          plans={paymentPlans}
                          value={paymentPlanId}
                          currentPlanId={currentPlanId}
                          disableCurrentPlan
                          layout="stack"
                          onChange={onPlanSelect}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {selectedEnrollment && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="ce-btn ce-btn-primary flex-1" disabled={saving}>
                {saving ? t('common.loading') : t('payments.savePlan')}
              </button>
              <Link
                to={`/dashboard/student/payments?enrollment=${enrollmentId}`}
                className="ce-btn ce-btn-accent flex-1"
              >
                {t('payments.goToPayment')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
