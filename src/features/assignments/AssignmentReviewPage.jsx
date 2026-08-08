import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { assignmentApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import StatusBadge from '../../shared/ui/StatusBadge';

export default function AssignmentReviewPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [grades, setGrades] = useState({});

  const load = async () => {
    try {
      const [a, s] = await Promise.all([
        assignmentApi.getOne(id),
        assignmentApi.listSubmissions(id),
      ]);
      setAssignment(a.assignment);
      setSubmissions(s.submissions || []);
      const initial = {};
      (s.submissions || []).forEach((sub) => {
        initial[sub._id] = { grade: sub.grade ?? '', feedback: sub.feedback || '' };
      });
      setGrades(initial);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  useEffect(() => { load(); }, [id]);

  const saveGrade = async (submissionId) => {
    try {
      await assignmentApi.grade(id, submissionId, {
        grade: Number(grades[submissionId].grade),
        feedback: grades[submissionId].feedback,
        status: 'graded',
      });
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  if (!assignment) return <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>;

  return (
    <div className="space-y-6">
      <PageHeader title={assignment.title} subtitle={t('assignments.reviewHint')} />

      {submissions.length === 0 ? (
        <div className="ce-card p-8 text-center text-[var(--ce-muted)]">{t('assignments.noSubmissions')}</div>
      ) : submissions.map((sub) => (
        <article key={sub._id} className="ce-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-[var(--ce-primary)]">{sub.studentId?.name}</h3>
              <p className="text-sm text-[var(--ce-muted)]">{new Date(sub.submittedAt).toLocaleString()}</p>
            </div>
            <StatusBadge status={sub.status === 'graded' ? 'approved' : 'pending'} label={t(`assignments.status.${sub.status}`)} />
          </div>
          {sub.notes && <p className="mt-3 text-sm">{sub.notes}</p>}
          <div className="mt-3 flex flex-wrap gap-3">
            {(sub.files || []).map((file) => (
              <a key={file.url} href={file.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[var(--ce-primary)]">{file.name || t('assignments.file')}</a>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="ce-label">{t('assignments.grade')}</span>
              <input type="number" min="0" max={assignment.maxPoints} className="ce-input" value={grades[sub._id]?.grade ?? ''} onChange={(e) => setGrades({ ...grades, [sub._id]: { ...grades[sub._id], grade: e.target.value } })} />
            </label>
            <label className="block md:col-span-2">
              <span className="ce-label">{t('assignments.feedback')}</span>
              <textarea className="ce-input min-h-[80px]" value={grades[sub._id]?.feedback || ''} onChange={(e) => setGrades({ ...grades, [sub._id]: { ...grades[sub._id], feedback: e.target.value } })} />
            </label>
          </div>
          <button type="button" className="ce-btn ce-btn-accent mt-3 text-sm" onClick={() => saveGrade(sub._id)}>{t('assignments.saveGrade')}</button>
        </article>
      ))}
    </div>
  );
}
