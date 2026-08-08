import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { statsApi } from '../../../shared/api/platformApi';
import { StatCards, SimpleBarChart, SimpleLineChart } from '../../../shared/ui/Charts';

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

  if (loading) return <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>;

  const planData = (stats?.tenantsByPlan || []).map((p) => ({ name: p._id, count: p.count }));

  return (
    <div className="space-y-6">
      <StatCards
        items={[
          { label: t('dashboard.tenants'), value: stats?.totalTenants },
          { label: t('admin.activeTenants'), value: stats?.activeTenants },
          { label: t('dashboard.students'), value: stats?.totalStudents },
          { label: t('admin.subscriptionRevenue'), value: `${stats?.subscriptionRevenue ?? 0} ج.م` },
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
        <SimpleBarChart data={stats?.tenantsByMonth || []} xKey="_id" yKey="count" color="#0B1F33" />
      </div>
    </div>
  );
}
