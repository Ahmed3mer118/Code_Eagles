import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { studentApi } from '../../shared/api/platformApi';
import EmptyState from '../../shared/ui/EmptyState';
import StatusBadge from '../../shared/ui/StatusBadge';

export default function StudentWaitingView({ children }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await studentApi.accessStatus();
        setStatus(data);
      } catch {
        setStatus({ canAccessContent: false, pendingCount: 0 });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>;

  if (status?.canAccessContent) return children;

  return (
    <EmptyState
      icon="⏳"
      title={t('student.waitingTitle')}
      description={t('student.waitingDesc')}
      action={
        <div className="flex flex-col items-center gap-3">
          {status?.pendingCount > 0 && (
            <StatusBadge status="pending" label={t('student.status.pending')} />
          )}
          <Link to="/dashboard/student/join" className="ce-btn ce-btn-accent">{t('student.viewRequests')}</Link>
          {status?.paymentsEnabled && (
            <Link to="/dashboard/student/payments" className="ce-btn ce-btn-ghost text-sm">{t('dashboard.payments')}</Link>
          )}
        </div>
      }
    />
  );
}
