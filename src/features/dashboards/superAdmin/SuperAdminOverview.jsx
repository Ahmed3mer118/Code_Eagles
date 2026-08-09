import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { BadgeDollarSign, Building2, CircleCheckBig, GraduationCap } from 'lucide-react';
import { statsApi } from '../../../shared/api/platformApi';
import ContentLoader from '../../../shared/ui/ContentLoader';
import { StatCards, SimpleBarChart, SimpleLineChart, CHART_COLORS } from '../../../shared/ui/Charts';

export default function SuperAdminOverview() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await statsApi.platform();
        setStats(data.stats);
      } catch (err) {
        toast.error(err?.message || t('common.error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  if (loading) return <ContentLoader cards={4} rows={3} />;

  const planData = (stats?.tenantsByPlan || []).map((p) => ({ name: p._id, count: p.count }));

  return (
    <div className="space-y-6">
      <StatCards
        items={[
          { label: t('dashboard.tenants'), value: stats?.totalTenants, icon: Building2, tone: 'accent' },
          { label: t('admin.activeTenants'), value: stats?.activeTenants, icon: CircleCheckBig, tone: 'success' },
          { label: t('dashboard.students'), value: stats?.totalStudents, icon: GraduationCap },
          {
            label: t('admin.subscriptionRevenue'),
            value: `${stats?.subscriptionRevenue ?? 0} ${t('academy.currency')}`,
            icon: BadgeDollarSign,
            tone: 'success',
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="ce-card p-6">
          <h3 className="mb-4 font-extrabold text-[var(--ce-primary)]">{t('admin.tenantsByPlan')}</h3>
          <SimpleBarChart data={planData} />
        </div>
        <div className="ce-card p-6">
          <h3 className="mb-4 font-extrabold text-[var(--ce-primary)]">{t('admin.revenueByMonth')}</h3>
          <SimpleLineChart data={stats?.subscriptionRevenueByMonth || []} yKey="total" />
        </div>
      </div>

      <div className="ce-card p-6">
        <h3 className="mb-4 font-extrabold text-[var(--ce-primary)]">{t('admin.newTenantsByMonth')}</h3>
        <SimpleBarChart data={stats?.tenantsByMonth || []} xKey="_id" yKey="count" color={CHART_COLORS.primary} />
      </div>
    </div>
  );
}
