import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { assignmentApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import StatusBadge from '../../shared/ui/StatusBadge';

const TABS = ['all', 'submitted', 'not_submitted', 'late', 'graded'];

export default function AssignmentReviewPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [assignment, setAssignment] = useState(null);
  const [roster, setRoster] = useState([]);
  const [summary, setSummary] = useState({});
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState(null);
  const [grades, setGrades] = useState({});

  const load = async (filter = tab) => {
    try {
      const params = filter && filter !== 'all' ? { filter } : {};
      const data = await assignmentApi.roster(id, params);
      setAssignment(data.assignment);
      setRoster(data.roster || []);
      setSummary(data.summary || {});
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  useEffect(() => { load(tab); }, [id, tab]);

  const selectedSubmission = useMemo(
    () => roster.find((row) => row.student?._id === selected)?.submission || null,
    [roster, selected]
  );

  useEffect(() => {
    if (selectedSubmission) {
      setGrades((prev) => ({
        ...prev,
        [selectedSubmission._id]: {
          grade: prev[selectedSubmission._id]?.grade ?? selectedSubmission.grade ?? '',
          feedback: prev[selectedSubmission._id]?.feedback ?? selectedSubmission.feedback ?? '',
        },
      }));
    }
  }, [selectedSubmission]);

  const saveGrade = async (submissionId) => {
    try {
      await assignmentApi.grade(id, submissionId, {
        grade: Number(grades[submissionId].grade),
        feedback: grades[submissionId].feedback,
        status: 'graded',
      });
      toast.success(t('common.success'));
      load(tab);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  if (!assignment) return <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>;

  return (
    <div className="space-y-6">
      <PageHeader title={assignment.title} subtitle={t('assignments.reviewHint')} />

      <div className="flex flex-wrap gap-2">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            className={`ce-btn text-sm ${tab === key ? 'ce-btn-accent' : 'ce-btn-ghost'}`}
            onClick={() => { setTab(key); setSelected(null); }}
          >
            {t(`assignments.roster.${key}`)}
            {key !== 'all' && summary[key === 'not_submitted' ? 'notSubmitted' : key] != null && (
              <span className="ms-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {summary[key === 'not_submitted' ? 'notSubmitted' : key]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="ce-card overflow-hidden">
          {roster.length === 0 ? (
            <p className="p-6 text-center text-[var(--ce-muted)]">{t('assignments.noSubmissions')}</p>
          ) : (
            <ul className="divide-y divide-[var(--ce-border)]">
              {roster.map((row) => (
                <li
                  key={row.student?._id}
                  className={`cursor-pointer px-5 py-4 hover:bg-[var(--ce-bg)] ${selected === row.student?._id ? 'bg-[var(--ce-bg)]' : ''}`}
                  onClick={() => setSelected(row.student?._id)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{row.student?.name}</p>
                      <p className="text-xs text-[var(--ce-muted)]">{row.student?.email}</p>
                    </div>
                    <StatusBadge
                      status={row.status === 'graded' ? 'approved' : row.submission ? 'pending' : 'rejected'}
                      label={t(`assignments.rosterStatus.${row.status}`, row.status)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="ce-card p-5">
          {!selectedSubmission ? (
            <p className="text-sm text-[var(--ce-muted)]">{t('assignments.selectStudent')}</p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-[var(--ce-primary)]">{selectedSubmission.studentId?.name || roster.find((r) => r.student?._id === selected)?.student?.name}</h3>
                  <p className="text-sm text-[var(--ce-muted)]">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                </div>
                <StatusBadge status={selectedSubmission.status === 'graded' ? 'approved' : 'pending'} label={t(`assignments.status.${selectedSubmission.status}`)} />
              </div>
              {selectedSubmission.notes && <p className="mt-3 text-sm">{selectedSubmission.notes}</p>}
              <div className="mt-3 flex flex-wrap gap-3">
                {(selectedSubmission.files || []).map((file) => (
                  <a key={file.url} href={file.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[var(--ce-primary)]">{file.name || t('assignments.file')}</a>
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="ce-label">{t('assignments.grade')}</span>
                  <input type="number" min="0" max={assignment.maxPoints} className="ce-input" value={grades[selectedSubmission._id]?.grade ?? ''} onChange={(e) => setGrades({ ...grades, [selectedSubmission._id]: { ...grades[selectedSubmission._id], grade: e.target.value } })} />
                </label>
                <label className="block md:col-span-2">
                  <span className="ce-label">{t('assignments.feedback')}</span>
                  <textarea className="ce-input min-h-[80px]" value={grades[selectedSubmission._id]?.feedback || ''} onChange={(e) => setGrades({ ...grades, [selectedSubmission._id]: { ...grades[selectedSubmission._id], feedback: e.target.value } })} />
                </label>
              </div>
              <button type="button" className="ce-btn ce-btn-accent mt-3 text-sm" onClick={() => saveGrade(selectedSubmission._id)}>{t('assignments.saveGrade')}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
