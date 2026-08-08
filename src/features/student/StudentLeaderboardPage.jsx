import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { gamificationApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import EmptyState from '../../shared/ui/EmptyState';
import { getFriendlyError } from '../../shared/ui/FormField';
import StudentWaitingView from '../student/StudentWaitingView';

export default function StudentLeaderboardPage() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await gamificationApi.leaderboard();
      setRows(data.leaderboard || []);
    } catch (err) {
      toast.error(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <StudentWaitingView>
      <div className="space-y-6">
        <PageHeader title={t('dashboard.leaderboard')} subtitle={t('leaderboard.subtitle')} />
        {loading ? (
          <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>
        ) : rows.length === 0 ? (
          <EmptyState icon="🏆" title={t('leaderboard.empty')} description={t('leaderboard.emptyDesc')} />
        ) : (
          <div className="ce-card overflow-hidden">
            <ul className="divide-y divide-[var(--ce-border)]">
              {rows.map((row, i) => (
                <li key={row.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="w-10 text-center text-xl">{medals[i] || `#${row.rank}`}</span>
                  <div className="flex-1">
                    <div className="font-bold text-[var(--ce-primary)]">{row.name}</div>
                    <div className="text-xs text-[var(--ce-muted)]">{t('leaderboard.level')} {row.level}</div>
                  </div>
                  <div className="text-end">
                    <div className="text-lg font-extrabold text-[var(--ce-accent)]">{row.xp} XP</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </StudentWaitingView>
  );
}
