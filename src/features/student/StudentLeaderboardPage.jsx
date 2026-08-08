import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { gamificationApi, groupApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import EmptyState from '../../shared/ui/EmptyState';
import { getFriendlyError } from '../../shared/ui/FormField';
import StudentWaitingView from '../student/StudentWaitingView';

export default function StudentLeaderboardPage() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await groupApi.myEnrollments();
        const active = (data.enrollments || []).filter((e) => e.status === 'active');
        const uniqueGroups = [];
        const seen = new Set();
        active.forEach((en) => {
          const id = en.groupId?._id;
          if (id && !seen.has(String(id))) {
            seen.add(String(id));
            uniqueGroups.push({
              _id: id,
              name: en.groupId?.name,
              subjectId: en.groupId?.subjectId?._id,
              subjectName: en.groupId?.subjectId?.name,
            });
          }
        });
        setGroups(uniqueGroups);
      } catch (_) {
        /* ignore */
      }
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (groupId) params.groupId = groupId;
      if (subjectId) params.subjectId = subjectId;
      const data = await gamificationApi.leaderboard(params);
      setRows(data.leaderboard || []);
    } catch (err) {
      toast.error(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [groupId, subjectId]);

  const subjects = [...new Map(
    groups
      .filter((g) => g.subjectId)
      .map((g) => [String(g.subjectId), { _id: g.subjectId, name: g.subjectName }])
  ).values()];

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <StudentWaitingView>
      <div className="space-y-6">
        <PageHeader title={t('dashboard.leaderboard')} subtitle={t('leaderboard.subtitle')} />

        <div className="flex flex-wrap gap-3">
          <select className="ce-input max-w-xs" value={groupId} onChange={(e) => { setGroupId(e.target.value); setSubjectId(''); }}>
            <option value="">{t('leaderboard.allGroups')}</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>{g.name}</option>
            ))}
          </select>
          <select className="ce-input max-w-xs" value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setGroupId(''); }}>
            <option value="">{t('leaderboard.allSubjects')}</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

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
