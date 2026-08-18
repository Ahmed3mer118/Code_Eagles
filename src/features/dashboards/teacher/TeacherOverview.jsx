import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  BookOpen,
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
  const showStatusAlerts = !hasAccess;

  const statusAlerts = [];
  if (showStatusAlerts && !academyApproved) {
    statusAlerts.push({
      key: 'academy-pending',
      className: 'border-amber-200 bg-amber-50 text-amber-900',
      icon: Clock,
      title: t('platformSub.academyPendingTitle'),
      hint: t('platformSub.academyPendingHint'),
    });
  }
  if (showStatusAlerts && academyApproved && !hasAccess && !pending) {
    statusAlerts.push({
      key: 'need-subscription',
      className: 'border-[var(--ce-accent)]/30 bg-[var(--ce-accent)]/10',
      icon: AlertCircle,
      iconClassName: 'text-[var(--ce-accent)]',
      title: t('platformSub.needSubscriptionTitle'),
      titleClassName: 'text-[var(--ce-primary)]',
      hint: t('platformSub.needSubscriptionHint'),
      hintClassName: 'text-[var(--ce-muted)]',
      action: (
        <Link to="/dashboard/teacher/subscription" className="ce-btn ce-btn-accent shrink-0">
          {t('platformSub.choosePlanCta')}
        </Link>
      ),
    });
  }
  if (showStatusAlerts && academyApproved && pending && !hasAccess) {
    statusAlerts.push({
      key: 'subscription-pending',
      className: 'border-blue-200 bg-blue-50 text-blue-900',
      icon: Clock,
      title: t('platformSub.pendingTitle'),
      hint: t('platformSub.pendingHint'),
      action: (
        <Link to="/dashboard/teacher/platform-payments" className="ce-btn ce-btn-accent shrink-0">
          {t('platformSub.paymentNav')}
        </Link>
      ),
    });
  }

  return (
    <div className="space-y-6">
      <div className={`grid gap-4 ${statusAlerts.length > 0 ? 'lg:grid-cols-2' : ''}`}>
        {statusAlerts.length > 0 && (
          <div className={`grid gap-4 ${statusAlerts.length > 1 ? 'sm:grid-cols-2 lg:grid-cols-1' : ''}`}>
            {statusAlerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <div
                  key={alert.key}
                  className={`flex flex-wrap items-start justify-between gap-4 rounded-2xl border p-5 ${alert.className}`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${alert.iconClassName || ''}`} />
                    <div>
                      <p className={`font-bold ${alert.titleClassName || ''}`}>{alert.title}</p>
                      {alert.hint && <p className={`mt-1 text-sm ${alert.hintClassName || ''}`}>{alert.hint}</p>}
                    </div>
                  </div>
                  {alert.action}
                </div>
              );
            })}
          </div>
        )}
        <AcademyUrlCard slug={tenantSlug} />
      </div>
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
