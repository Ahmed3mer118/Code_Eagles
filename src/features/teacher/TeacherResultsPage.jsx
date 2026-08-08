import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { teacherApi, groupApi, contentApi, quizApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import EmptyState from '../../shared/ui/EmptyState';
import StatusBadge from '../../shared/ui/StatusBadge';
import { getFriendlyError } from '../../shared/ui/FormField';

export default function TeacherResultsPage() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [filters, setFilters] = useState({ groupId: '', subjectId: '', quizId: '' });
  const [data, setData] = useState({ students: [], attempts: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [g, s, q] = await Promise.all([groupApi.list(), contentApi.listSubjects(), quizApi.list()]);
        setGroups(g.groups || []);
        setSubjects(s.subjects || []);
        setQuizzes(q.quizzes || []);
      } catch (err) {
        toast.error(getFriendlyError(err));
      }
    })();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.groupId) params.groupId = filters.groupId;
      if (filters.subjectId) params.subjectId = filters.subjectId;
      if (filters.quizId) params.quizId = filters.quizId;
      const res = await teacherApi.studentResults(params);
      setData(res);
    } catch (err) {
      toast.error(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadResults(); }, [filters]);

  const exportCsv = () => {
    const rows = [['Student', 'Quiz', 'Score', 'Percentage', 'Status']];
    (data.attempts || []).forEach((a) => {
      rows.push([
        a.studentId?.name || '',
        a.quizId?.title || '',
        `${a.score}/${a.maxScore}`,
        `${a.percentage}%`,
        a.status,
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student-results.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('results.title')}
        subtitle={t('results.subtitle')}
        actions={<button type="button" className="ce-btn ce-btn-accent" onClick={exportCsv}>{t('results.export')}</button>}
      />

      <div className="ce-card grid gap-4 p-5 md:grid-cols-3">
        <select className="ce-input" value={filters.groupId} onChange={(e) => setFilters({ ...filters, groupId: e.target.value })}>
          <option value="">{t('results.allGroups')}</option>
          {groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
        </select>
        <select className="ce-input" value={filters.subjectId} onChange={(e) => setFilters({ ...filters, subjectId: e.target.value })}>
          <option value="">{t('results.allSubjects')}</option>
          {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <select className="ce-input" value={filters.quizId} onChange={(e) => setFilters({ ...filters, quizId: e.target.value })}>
          <option value="">{t('results.allQuizzes')}</option>
          {quizzes.map((q) => <option key={q._id} value={q._id}>{q.title}</option>)}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="ce-card p-5">
          <h3 className="font-extrabold text-[var(--ce-primary)]">{t('dashboard.students')}</h3>
          {loading ? (
            <p className="mt-4 text-sm text-[var(--ce-muted)]">{t('common.loading')}</p>
          ) : (data.students || []).length === 0 ? (
            <EmptyState icon="👥" title={t('results.noStudents')} />
          ) : (
            <ul className="mt-4 divide-y divide-[var(--ce-border)]">
              {data.students.map((s) => (
                <li key={s._id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-[var(--ce-muted)]">{s.email}</div>
                  </div>
                  <span className="text-sm font-bold text-[var(--ce-accent)]">{s.xp || 0} XP</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="ce-card overflow-hidden">
          <div className="border-b border-[var(--ce-border)] px-5 py-4 font-extrabold text-[var(--ce-primary)]">{t('results.attempts')}</div>
          {loading ? (
            <p className="p-5 text-sm text-[var(--ce-muted)]">{t('common.loading')}</p>
          ) : (data.attempts || []).length === 0 ? (
            <EmptyState icon="📝" title={t('results.noAttempts')} />
          ) : (
            <ul className="divide-y divide-[var(--ce-border)]">
              {data.attempts.map((a) => (
                <li key={a._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <div className="font-semibold">{a.studentId?.name}</div>
                    <div className="text-sm text-[var(--ce-muted)]">{a.quizId?.title}</div>
                  </div>
                  <div className="text-end">
                    <div className="font-bold">{a.score}/{a.maxScore} ({a.percentage}%)</div>
                    <StatusBadge status={a.passed ? 'approved' : 'pending'} label={a.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
