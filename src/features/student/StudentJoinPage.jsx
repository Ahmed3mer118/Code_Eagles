import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { groupApi } from '../../shared/api/platformApi';
import { getStoredTenantSlug, setTenantSlug } from '../../shared/api/tenantContext';
import PageHeader from '../../shared/ui/PageHeader';
import EmptyState from '../../shared/ui/EmptyState';
import FormModal from '../../shared/ui/FormModal';
import FormField, { getFriendlyError } from '../../shared/ui/FormField';
import SearchInput, { filterByQuery } from '../../shared/ui/SearchInput';

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
  const [groups, setGroups] = useState([]);
  const [mine, setMine] = useState([]);
  const [packages, setPackages] = useState({});
  const [paymentPlans, setPaymentPlans] = useState([]);
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
      const [g, m] = await Promise.all([groupApi.list(), groupApi.myEnrollments()]);
      setGroups(g.groups || []);
      setMine(m.enrollments || []);
      setPackages(m.tenant?.studentPackages || g.tenant?.studentPackages || {});
      setPaymentPlans(m.tenant?.paymentPlans || g.tenant?.paymentPlans || []);
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
            <Link to="/" className="ce-btn ce-btn-accent">{t('nav.home')}</Link>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('student.joinGroup')} subtitle={t('student.joinHint')} />

      {mine.length > 0 && (
        <div className="ce-card p-6">
          <h3 className="font-bold text-[var(--ce-primary)]">{t('student.myRequests')}</h3>
          <ul className="mt-4 space-y-3">
            {mine.map((en) => (
              <li key={en._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ce-border)] p-4">
                <div>
                  <div className="font-semibold">{en.groupId?.name}</div>
                  <div className="text-sm text-[var(--ce-muted)]">{en.groupId?.subjectId?.name}</div>
                  {en.amountDue > 0 && (
                    <div className="text-xs text-[var(--ce-muted)]">{t('student.expectedAmount')}: {en.amountDue} {t('academy.currency')}</div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[en.status] || 'bg-gray-100'}`}>
                    {t(`student.status.${en.status}`, en.status)}
                  </span>
                  {en.status === 'pending' && en.amountDue > 0 && (
                    <Link
                      to={`/dashboard/student/payments?enrollment=${en._id}`}
                      className="ce-btn ce-btn-accent text-xs"
                    >
                      {t('payments.payNow')}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <SearchInput value={search} onChange={setSearch} />

      {filtered.length === 0 ? (
        <EmptyState icon="👥" title={t('student.noGroups')} description={t('student.noGroupsDesc')} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((group) => {
            const existing = getEnrollment(group._id);
            return (
              <article key={group._id} className="ce-card p-5">
                <h3 className="font-bold text-[var(--ce-primary)]">{group.name}</h3>
                <p className="mt-1 text-sm text-[var(--ce-muted)]">{group.subjectId?.name} · {group.gradeLevel}</p>
                {group.startTime && (
                  <p className="mt-2 text-xs text-[var(--ce-muted)]">{group.startTime} - {group.endTime}</p>
                )}
                {existing ? (
                  <p className="mt-4 text-sm font-semibold">{t(`student.status.${existing.status}`)}</p>
                ) : (
                  <button type="button" className="ce-btn ce-btn-accent mt-4 w-full text-sm" onClick={() => setJoinTarget(group)}>
                    {t('student.requestJoin')}
                  </button>
                )}
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
          if (!values.paymentPlanId && !values.packageType) errors.packageType = t('student.errors.packageRequired');
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
                <select className="ce-input" value={values.paymentPlanId} onChange={(e) => {
                  const plan = paymentPlans.find((p) => p._id === e.target.value);
                  setValues({ ...values, paymentPlanId: e.target.value, packageType: plan?.packageType || values.packageType });
                }}>
                  <option value="">{t('payments.selectPlan')}</option>
                  {paymentPlans.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.name} — {plan.price} {t('academy.currency')}
                    </option>
                  ))}
                </select>
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
            <FormField label={t('requests.parentPhone')}>
              <input className="ce-input" value={values.parentPhone} onChange={(e) => setValues({ ...values, parentPhone: e.target.value })} />
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
