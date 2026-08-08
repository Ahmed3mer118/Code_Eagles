import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import AuthServices from '../../../shared/api/authService';
import { statsApi } from '../../../shared/api/platformApi';
import { StatCards, SimpleBarChart } from '../../../shared/ui/Charts';
import AcademyUrlCard from '../../../shared/ui/AcademyUrlCard';

export default function TeacherOverview() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [tenantSlug, setTenantSlug] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [statsData, auth] = await Promise.all([
          statsApi.me(),
          new AuthServices().me(),
        ]);
        setStats(statsData.stats);
        setTenantSlug(auth.tenant?.slug || '');
      } catch (err) {
        toast.error(err?.message || t('common.error'));
      }
    })();
  }, [t]);

  return (
    <div className="space-y-6">
      <AcademyUrlCard slug={tenantSlug} />
      <StatCards
        items={[
          { label: t('dashboard.students'), value: stats?.students },
          { label: t('dashboard.subjects'), value: stats?.subjects },
          { label: t('dashboard.groups'), value: stats?.groups },
          { label: t('payments.pendingTitle'), value: stats?.pendingPayments },
          { label: t('dashboard.quizzes'), value: stats?.quizzes },
          { label: t('admin.pendingEnrollments'), value: stats?.pendingEnrollments },
        ]}
      />
      <div className="ce-card p-6">
        <h3 className="mb-4 font-extrabold text-[var(--ce-primary)]">{t('admin.enrollmentsByMonth')}</h3>
        <SimpleBarChart data={stats?.enrollmentsByMonth || []} xKey="_id" yKey="count" />
      </div>
    </div>
  );
}
