import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  GraduationCap,
  UserPlus,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import AuthServices from '../../../shared/api/authService';
import { statsApi, subscriptionApi } from '../../../shared/api/platformApi';
import { StatCards, SimpleBarChart } from '../../../shared/ui/Charts';
import AcademyUrlCard from '../../../shared/ui/AcademyUrlCard';

export default function TeacherOverview() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [tenantSlug, setTenantSlug] = useState('');
  const [subStatus, setSubStatus] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [statsData, auth, subData] = await Promise.all([
          statsApi.me(),
          new AuthServices().me(),
          subscriptionApi.mine().catch(() => null),
        ]);
        setStats(statsData.stats);
        setTenantSlug(auth.tenant?.slug || '');
        setSubStatus(subData);
      } catch (err) {
        toast.error(err?.message || t('common.error'));
      }
    })();
  }, [t]);

  const academyApproved = subStatus?.academyApproved;
  const hasAccess = subStatus?.hasAccess;
  const pending = subStatus?.pending;

  return (
    <div className="space-y-6">
      {!academyApproved && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <Clock className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">{t('platformSub.academyPendingTitle')}</p>
            <p className="mt-1 text-sm">{t('platformSub.academyPendingHint')}</p>
          </div>
        </div>
      )}

      {academyApproved && !hasAccess && !pending && (
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[var(--ce-accent)]/30 bg-[var(--ce-accent)]/10 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ce-accent)]" />
            <div>
              <p className="font-bold text-[var(--ce-primary)]">{t('platformSub.needSubscriptionTitle')}</p>
              <p className="mt-1 text-sm text-[var(--ce-muted)]">{t('platformSub.needSubscriptionHint')}</p>
            </div>
          </div>
          <Link to="/dashboard/teacher/platform-subscription" className="ce-btn ce-btn-accent">
            {t('platformSub.choosePlanCta')}
          </Link>
        </div>
      )}

      {academyApproved && pending && !hasAccess && (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-900">
          <Clock className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">{t('platformSub.pendingTitle')}</p>
            <p className="mt-1 text-sm">{t('platformSub.pendingHint')}</p>
          </div>
        </div>
      )}

      {hasAccess && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm font-semibold">{t('platformSub.dashboardUnlocked')}</p>
        </div>
      )}

      <AcademyUrlCard slug={tenantSlug} />
      <StatCards
        items={[
          { label: t('dashboard.students'), value: stats?.students, icon: GraduationCap, tone: 'accent' },
          { label: t('dashboard.subjects'), value: stats?.subjects, icon: BookOpen },
          { label: t('dashboard.groups'), value: stats?.groups, icon: UsersRound },
          { label: t('payments.pendingTitle'), value: stats?.pendingPayments, icon: WalletCards, tone: 'info' },
          { label: t('dashboard.quizzes'), value: stats?.quizzes, icon: ClipboardCheck },
          { label: t('admin.pendingEnrollments'), value: stats?.pendingEnrollments, icon: UserPlus, tone: 'info' },
        ]}
      />
      <div className="ce-card p-6">
        <h3 className="mb-4 font-extrabold text-[var(--ce-primary)]">{t('admin.enrollmentsByMonth')}</h3>
        <SimpleBarChart data={stats?.enrollmentsByMonth || []} xKey="_id" yKey="count" />
      </div>
    </div>
  );
}
