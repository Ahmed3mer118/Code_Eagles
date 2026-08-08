import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
  const [rows, setRows] = useState([]);
  const [expanded, setExpanded] = useState({});
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
      setRows(res.rows || []);
      setExpanded({});
    } catch (err) {
      toast.error(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadResults(); }, [filters]);

  const toggleRow = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const exportCsv = () => {
    const csvRows = [['Student', 'Quiz', 'Attempt', 'Score', 'Percentage', 'Status']];
    rows.forEach((row) => {
      (row.attempts || []).forEach((a) => {
        csvRows.push([
          row.student?.name || '',
          a.quiz?.title || '',
          a.attemptNumber || '',
          `${a.score}/${a.maxScore}`,
          `${a.percentage}%`,
          a.status,
        ]);
      });
    });
    const csv = csvRows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
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

      <div className="ce-card overflow-hidden">
        {loading ? (
          <p className="p-5 text-sm text-[var(--ce-muted)]">{t('common.loading')}</p>
        ) : rows.length === 0 ? (
          <EmptyState icon="📝" title={t('results.noAttempts')} />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[var(--ce-bg)]">
              <tr>
                <th className="px-4 py-3 text-start">{t('students.name')}</th>
                <th className="px-4 py-3 text-start">{t('results.attemptsCount')}</th>
                <th className="px-4 py-3 text-start">{t('results.bestScore')}</th>
                <th className="px-4 py-3 text-start">{t('results.latestScore')}</th>
                <th className="px-4 py-3 text-end">{t('results.details')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ce-border)]">
              {rows.map((row) => {
                const sid = row.student?._id;
                const open = expanded[sid];
                return (
                  <Fragment key={sid}>
                    <tr className="hover:bg-[var(--ce-bg)]">
                      <td className="px-4 py-3 font-semibold">{row.student?.name}</td>
                      <td className="px-4 py-3">{row.attemptsCount}</td>
                      <td className="px-4 py-3 font-bold text-[var(--ce-accent)]">{row.bestScore}%</td>
                      <td className="px-4 py-3">{row.latestScore}%</td>
                      <td className="px-4 py-3 text-end">
                        <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => toggleRow(sid)}>
                          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          {t('results.viewAttempts')}
                        </button>
                      </td>
                    </tr>
                    {open && (
                      <tr>
                        <td colSpan={5} className="bg-[var(--ce-bg)] px-4 py-3">
                          <div className="space-y-2">
                            {(row.attempts || []).map((a) => (
                              <div key={a._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3">
                                <div>
                                  <p className="font-semibold">{a.quiz?.title}</p>
                                  <p className="text-xs text-[var(--ce-muted)]">
                                    {t('results.attemptNumber', { n: a.attemptNumber })}
                                    {a.submittedAt ? ` · ${new Date(a.submittedAt).toLocaleString()}` : ''}
                                  </p>
                                </div>
                                <div className="text-end">
                                  <p className="font-bold">{a.score}/{a.maxScore} ({a.percentage}%)</p>
                                  <StatusBadge status={a.passed ? 'approved' : 'pending'} label={a.status} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
