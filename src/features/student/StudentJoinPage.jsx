import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';
import { groupApi, paymentApi, paymentPlanApi } from '../../shared/api/platformApi';
import { getStoredTenantSlug, setTenantSlug } from '../../shared/api/tenantContext';
import PageHeader from '../../shared/ui/PageHeader';
import EmptyState from '../../shared/ui/EmptyState';
import FormModal from '../../shared/ui/FormModal';
import FormField, { getFriendlyError } from '../../shared/ui/FormField';
import SearchInput, { filterByQuery } from '../../shared/ui/SearchInput';
import StudentAcademyPanel from './components/StudentAcademyPanel';
import PlanPickerGrid from '../../shared/ui/PlanPickerGrid';
import { useStudentAcademyContext } from './StudentAcademyContext';

const PACKAGES = [
  { value: 'lectures_only', labelKey: 'payments.lecturesOnly' },
  { value: 'exams_only', labelKey: 'payments.examsOnly' },
  { value: 'lectures_and_exams', labelKey: 'payments.fullPackage' },
];

const statusClass = {
  pending: 'bg-amber-100 text-amber-900',
  active: 'bg-green-100 text-green-900',
  cancelled: 'bg-red-100 text-red-900',
};

export default function StudentJoinPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const { currentAcademy, academies } = useStudentAcademyContext();
  const [groups, setGroups] = useState([]);
  const [mine, setMine] = useState([]);
  const [packages, setPackages] = useState({});
  const [paymentPlans, setPaymentPlans] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tenantMissing, setTenantMissing] = useState(false);
  const [joinTarget, setJoinTarget] = useState(null);
  const preselectedGroup = params.get('group');
  const academySlug = params.get('academy') || getStoredTenantSlug();

  useEffect(() => {
    if (params.get('academy')) setTenantSlug(params.get('academy'));
  }, [params]);

  const load = async () => {
    setLoading(true);
    setTenantMissing(false);
    try {
      const [g, m, payments] = await Promise.all([
        groupApi.list(),
        groupApi.myEnrollments(),
        paymentApi.listMine().catch(() => ({ paymentRequests: [] })),
      ]);
      setGroups(g.groups || []);
      setMine(m.enrollments || []);
      setPaymentRequests(payments.paymentRequests || []);
      setPackages(m.tenant?.studentPackages || g.tenant?.studentPackages || {});
      let plans = m.tenant?.paymentPlans || g.tenant?.paymentPlans || [];
      if (!plans.length && academySlug) {
        try {
          const publicPlans = await paymentPlanApi.listPublic(academySlug);
          plans = publicPlans.plans || [];
        } catch {
          /* ignore */
        }
      }
      setPaymentPlans(plans);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message;
      if (err?.response?.status === 400 && /academy|tenant/i.test(msg || '')) {
        setTenantMissing(true);
      } else {
        toast.error(getFriendlyError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [academySlug]);

  useEffect(() => {
    if (preselectedGroup && groups.length) {
      const g = groups.find((x) => x._id === preselectedGroup);
      if (g && !getEnrollment(g._id)) setJoinTarget(g);
    }
  }, [preselectedGroup, groups, mine]);

  const getEnrollment = (groupId) => mine.find((e) => e.groupId?._id === groupId || e.groupId === groupId);

  const getPaymentForEnrollment = (enrollmentId) => paymentRequests.find(
    (req) => String(req.enrollmentId?._id || req.enrollmentId) === String(enrollmentId)
  );

  const isPaymentPending = (enrollmentId) => {
    const payment = getPaymentForEnrollment(enrollmentId);
    return payment && ['pending', 'under_review'].includes(payment.status);
  };

  const getPrice = (packageType) => {
    const map = {
      lectures_only: packages.lecturesOnly,
      exams_only: packages.examsOnly,
      lectures_and_exams: packages.lecturesAndExams,
    };
    return map[packageType] || 0;
  };

  const submitJoin = async ({ packageType, paymentPlanId, notes, parentPhone }) => {
    if (!joinTarget) return;
    const res = await groupApi.enroll(joinTarget._id, { packageType, paymentPlanId, notes, parentPhone });
    toast.success(res.message || t('student.requestSent'));
    await load();
    if (res.enrollment?._id) {
      toast.success(t('payments.goPayNow'), { duration: 5000 });
    }
  };

  const filtered = filterByQuery(groups, search, ['name']);
  const currentEntry = academies.find((a) => a.academy._id === currentAcademy?._id);

  if (loading) return <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>;

  if (tenantMissing) {
    return (
      <EmptyState
        icon="🏫"
        title={t('student.noAcademyTitle')}
        description={t('student.noAcademyDesc')}
        action={
          academySlug ? (
            <Link to={`/academy/${academySlug}`} className="ce-btn ce-btn-accent">{t('student.goToAcademy')}</Link>
          ) : (
            <Link to="/dashboard/student/select-academy" className="ce-btn ce-btn-accent">{t('student.switchAcademy')}</Link>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('student.joinGroup')} subtitle={t('student.joinHint')} />

      {currentAcademy && (
        <div className="space-y-3">
          <StudentAcademyPanel
            academy={currentAcademy}
            activeCount={currentEntry?.activeCount || 0}
            pendingCount={currentEntry?.pendingCount || 0}
            selected
            showEnter={false}
          />
        </div>
      )}

      {mine.length > 0 && (
        <div className="ce-card p-6">
          <h3 className="font-bold text-[var(--ce-primary)]">{t('student.myRequests')}</h3>
          <ul className="mt-4 space-y-3">
            {mine.map((en) => (
              <li key={en._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)]/40 p-4">
                <div>
                  <div className="font-semibold text-[var(--ce-primary)]">{en.groupId?.name}</div>
                  <div className="text-sm text-[var(--ce-muted)]">{en.groupId?.subjectId?.name}</div>
                  {en.amountDue > 0 && (
                    <div className="mt-1 text-xs text-[var(--ce-muted)]">{t('student.expectedAmount')}: {en.amountDue} {t('academy.currency')}</div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[en.status] || 'bg-gray-100'}`}>
                    {t(`student.status.${en.status}`, en.status)}
                  </span>
                  {en.status === 'pending' && isPaymentPending(en._id) && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                      {t('payments.awaitingApproval')}
                    </span>
                  )}
                  {en.status === 'pending' && !isPaymentPending(en._id) && (
                    <Link
                      to={`/dashboard/student/payments?enrollment=${en._id}`}
                      className="ce-btn ce-btn-accent text-xs"
                    >
                      {en.amountDue > 0 ? t('payments.payNow') : t('payments.goPayNow')}
                    </Link>
                  )}
                  {en.status === 'active' && (
                    <Link
                      to={`/dashboard/student/subscription?enrollment=${en._id}`}
                      className="ce-btn ce-btn-ghost text-xs"
                    >
                      {t('payments.updatePlan')}
                    </Link>
                  )}
                  {en.status === 'cancelled' && en.rejectionReason && (
                    <p className="w-full text-xs text-red-700">{t('requests.rejectionReason')}: {en.rejectionReason}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <SearchInput value={search} onChange={setSearch} placeholder={t('common.search')} />

      {filtered.length === 0 ? (
        <EmptyState icon="👥" title={t('student.noGroups')} description={t('student.noGroupsDesc')} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((group) => {
            const existing = getEnrollment(group._id);
            return (
              <article key={group._id} className="ce-card overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-[var(--ce-primary)]/10 p-2.5 text-[var(--ce-primary)]">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[var(--ce-primary)]">{group.name}</h3>
                      <p className="mt-1 text-sm text-[var(--ce-muted)]">{group.subjectId?.name}</p>
                      {group.gradeLevel && (
                        <span className="mt-2 inline-block rounded-full bg-[var(--ce-bg)] px-3 py-1 text-xs font-semibold">{group.gradeLevel}</span>
                      )}
                      {group.startTime && (
                        <p className="mt-2 text-xs text-[var(--ce-muted)]">{group.startTime} - {group.endTime}</p>
                      )}
                    </div>
                  </div>
                  {existing ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold">{t(`student.status.${existing.status}`)}</p>
                      {existing.status === 'cancelled' && existing.rejectionReason && (
                        <p className="text-xs text-red-700">{t('requests.rejectionReason')}: {existing.rejectionReason}</p>
                      )}
                      {existing.status === 'cancelled' && (
                        <button type="button" className="ce-btn ce-btn-accent w-full text-sm" onClick={() => setJoinTarget(group)}>
                          {t('student.resubmitRequest')}
                        </button>
                      )}
                    </div>
                  ) : (
                    <button type="button" className="ce-btn ce-btn-accent mt-4 w-full text-sm" onClick={() => setJoinTarget(group)}>
                      {t('student.requestJoin')}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <FormModal
        open={!!joinTarget}
        onClose={() => setJoinTarget(null)}
        title={t('student.requestJoin')}
        draftKey={joinTarget ? `join-${joinTarget._id}` : 'join'}
        initialValues={{ packageType: 'lectures_and_exams', paymentPlanId: '', notes: '', parentPhone: '' }}
        validate={(values) => {
          const errors = {};
          if (paymentPlans.length > 0 && !values.paymentPlanId) {
            errors.packageType = t('student.errors.packageRequired');
          } else if (!values.paymentPlanId && !values.packageType) {
            errors.packageType = t('student.errors.packageRequired');
          }
          return errors;
        }}
        onSubmit={submitJoin}
      >
        {({ values, setValues, errors }) => joinTarget && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[var(--ce-bg)] p-4">
              <div className="font-bold text-[var(--ce-primary)]">{joinTarget.name}</div>
              <div className="text-sm text-[var(--ce-muted)]">{joinTarget.subjectId?.name}</div>
            </div>
            <FormField label={t('payments.package')} required error={errors.packageType}>
              {paymentPlans.length > 0 ? (
                <PlanPickerGrid
                  plans={paymentPlans}
                  value={values.paymentPlanId}
                  layout="stack"
                  onChange={(planId, plan) => setValues({
                    ...values,
                    paymentPlanId: planId,
                    packageType: plan?.packageType || values.packageType,
                  })}
                />
              ) : (
                <select className="ce-input" value={values.packageType} onChange={(e) => setValues({ ...values, packageType: e.target.value })}>
                  {PACKAGES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {t(p.labelKey)} — {getPrice(p.value)} {t('academy.currency')}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
            <FormField label={t('requests.parentContact')} helper={t('requests.parentContactHint')}>
              <input className="ce-input" value={values.parentPhone} onChange={(e) => setValues({ ...values, parentPhone: e.target.value })} placeholder={t('requests.parentContactHint')} />
            </FormField>
            <FormField label={t('payments.notes')}>
              <textarea className="ce-input min-h-[80px]" value={values.notes} onChange={(e) => setValues({ ...values, notes: e.target.value })} />
            </FormField>
          </div>
        )}
      </FormModal>
    </div>
  );
}
