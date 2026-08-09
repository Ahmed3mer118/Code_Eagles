import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { assignmentApi, uploadApi } from '../../shared/api/platformApi';
import StudentWaitingView from '../student/StudentWaitingView';
import StatusBadge from '../../shared/ui/StatusBadge';

function groupAssignments(assignments) {
  const map = new Map();
  assignments.forEach((item) => {
    (item.groupIds || [{ _id: 'general', name: '' }]).forEach((group) => {
      const gid = group._id || group;
      const gname = group.name || '';
      if (!map.has(gid)) map.set(gid, { group: { _id: gid, name: gname }, items: [] });
      if (!map.get(gid).items.some((a) => a._id === item._id)) {
        map.get(gid).items.push(item);
      }
    });
  });
  return [...map.values()]
    .sort((a, b) => (a.group.name || '').localeCompare(b.group.name || ''));
}

function AssignmentCard({ item, t, onSubmitClick }) {
  return (
    <article className="rounded-2xl border border-[var(--ce-border)] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-extrabold text-[var(--ce-primary)]">{item.title}</h4>
          <p className="mt-1 text-sm text-[var(--ce-muted)]">
            {item.subjectId?.name}
            {item.moduleId?.title ? ` · ${item.moduleId.title}` : ''}
            {item.lessonId?.title ? ` · ${item.lessonId.title}` : ''}
          </p>
          <p className="mt-1 text-sm text-[var(--ce-muted)]">
            {t('assignments.dueDate')}: {new Date(item.dueDate).toLocaleString()}
          </p>
          {item.description && <p className="mt-2 text-sm">{item.description}</p>}
        </div>
        <StatusBadge
          status={item.submission?.status === 'graded' ? 'approved' : item.submission ? 'pending' : 'pending'}
          label={item.submission ? t(`assignments.status.${item.submission.status}`) : t('assignments.status.pending')}
        />
      </div>
      {item.submission?.grade != null && (
        <p className="mt-3 text-sm font-semibold">{t('assignments.grade')}: {item.submission.grade}/{item.maxPoints}</p>
      )}
      {item.submission?.feedback && (
        <p className="mt-2 rounded-xl bg-[var(--ce-bg)] p-3 text-sm">{item.submission.feedback}</p>
      )}
      {!item.submission || item.submission.status !== 'graded' ? (
        <button type="button" className="ce-btn ce-btn-accent mt-4 text-sm" onClick={() => onSubmitClick(item)}>
          {item.submission ? t('assignments.resubmit') : t('assignments.submit')}
        </button>
      ) : null}
    </article>
  );
}

export default function StudentAssignmentsPage() {
  const { t } = useTranslation();
  const [assignments, setAssignments] = useState([]);
  const [active, setActive] = useState(null);
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const data = await assignmentApi.listMine();
      setAssignments(data.assignments || []);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => groupAssignments(assignments), [assignments]);

  const onUpload = async (fileList) => {
    const list = [...fileList];
    if (!list.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of list) {
        const data = await uploadApi.uploadAssignment(file);
        uploaded.push({ url: data.url, name: data.name || file.name, mimeType: data.mimeType || file.type });
      }
      setFiles((prev) => [...prev, ...uploaded]);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!active || !files.length) {
      toast.error(t('assignments.filesRequired'));
      return;
    }
    setSubmitting(true);
    try {
      await assignmentApi.submit(active._id, { files, notes });
      toast.success(t('assignments.submitted'));
      setActive(null);
      setFiles([]);
      setNotes('');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StudentWaitingView>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--ce-primary)]">{t('assignments.studentTitle')}</h2>
          <p className="mt-1 text-sm text-[var(--ce-muted)]">{t('assignments.studentHint')}</p>
        </div>

        {grouped.length === 0 ? (
          <div className="ce-card p-8 text-center text-[var(--ce-muted)]">{t('assignments.empty')}</div>
        ) : (
          grouped.map(({ group, items }) => (
            <section key={group._id} className="space-y-3">
              {group.name && (
                <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{group.name}</h3>
              )}
              <div className="grid gap-3">
                {items.map((item) => (
                  <AssignmentCard
                    key={item._id}
                    item={item}
                    t={t}
                    onSubmitClick={(next) => { setActive(next); setFiles([]); setNotes(''); }}
                  />
                ))}
              </div>
            </section>
          ))
        )}

        {active && (
          <div className="ce-card space-y-4 p-5">
            <h3 className="font-extrabold text-[var(--ce-primary)]">{active.title}</h3>
            {active.instructions && <p className="text-sm text-[var(--ce-muted)]">{active.instructions}</p>}
            <label className="block">
              <span className="ce-label">{t('assignments.uploadFiles')}</span>
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx" className="ce-input" onChange={(e) => onUpload(e.target.files)} disabled={uploading} />
            </label>
            {files.length > 0 && (
              <ul className="text-sm">
                {files.map((f) => <li key={f.url}>{f.name}</li>)}
              </ul>
            )}
            <label className="block">
              <span className="ce-label">{t('payments.notes')}</span>
              <textarea className="ce-input min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <div className="flex gap-2">
              <button type="button" className="ce-btn ce-btn-accent text-sm" disabled={submitting || uploading} onClick={submit}>{t('assignments.submit')}</button>
              <button type="button" className="ce-btn ce-btn-ghost text-sm" onClick={() => setActive(null)}>{t('common.cancel')}</button>
            </div>
          </div>
        )}
      </div>
    </StudentWaitingView>
  );
}
