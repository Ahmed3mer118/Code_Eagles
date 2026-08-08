import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { assignmentApi, groupApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import FormModal from '../../shared/ui/FormModal';
import FormField from '../../shared/ui/FormField';

const empty = {
  title: '',
  description: '',
  instructions: '',
  groupIds: [],
  dueDate: '',
  maxPoints: 100,
  allowLateSubmission: false,
  status: 'published',
};

export default function TeacherAssignmentsPage() {
  const { t } = useTranslation();
  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [modal, setModal] = useState(null);

  const load = async () => {
    try {
      const [a, g] = await Promise.all([assignmentApi.list(), groupApi.list()]);
      setAssignments(a.assignments || []);
      setGroups(g.groups || []);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (values) => {
    try {
      const payload = {
        ...values,
        groupIds: values.groupIds,
        dueDate: new Date(values.dueDate).toISOString(),
        maxPoints: Number(values.maxPoints),
      };
      if (modal?.item?._id) await assignmentApi.update(modal.item._id, payload);
      else await assignmentApi.create(payload);
      toast.success(t('common.success'));
      setModal(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('assignments.title')}
        subtitle={t('assignments.teacherHint')}
        actions={<button type="button" className="ce-btn ce-btn-accent text-sm" onClick={() => setModal({ item: null })}>{t('assignments.add')}</button>}
      />

      <div className="grid gap-4">
        {assignments.map((item) => (
          <article key={item._id} className="ce-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-[var(--ce-primary)]">{item.title}</h3>
                <p className="mt-1 text-sm text-[var(--ce-muted)]">{new Date(item.dueDate).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/dashboard/teacher/assignments/${item._id}`} className="ce-btn ce-btn-ghost text-sm">{t('assignments.review')}</Link>
                <button type="button" className="ce-btn ce-btn-ghost text-sm" onClick={() => setModal({ item })}>{t('groups.edit')}</button>
              </div>
            </div>
          </article>
        ))}
        {assignments.length === 0 && <div className="ce-card p-8 text-center text-[var(--ce-muted)]">{t('assignments.empty')}</div>}
      </div>

      <FormModal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.item?._id ? t('assignments.edit') : t('assignments.add')}
        initialValues={modal?.item ? {
          ...modal.item,
          dueDate: modal.item.dueDate?.slice(0, 16),
          groupIds: (modal.item.groupIds || []).map((g) => g._id || g),
        } : empty}
        onSubmit={save}
      >
        {({ values, setValues }) => (
          <div className="space-y-4">
            <FormField label={t('assignments.fieldTitle')} required>
              <input className="ce-input" value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} />
            </FormField>
            <FormField label={t('assignments.description')}>
              <textarea className="ce-input min-h-[80px]" value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} />
            </FormField>
            <FormField label={t('assignments.instructions')}>
              <textarea className="ce-input min-h-[80px]" value={values.instructions} onChange={(e) => setValues({ ...values, instructions: e.target.value })} />
            </FormField>
            <FormField label={t('dashboard.groups')} required>
              <select multiple className="ce-input min-h-[100px]" value={values.groupIds} onChange={(e) => setValues({ ...values, groupIds: [...e.target.selectedOptions].map((o) => o.value) })}>
                {groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
              </select>
            </FormField>
            <FormField label={t('assignments.dueDate')} required>
              <input type="datetime-local" className="ce-input" value={values.dueDate} onChange={(e) => setValues({ ...values, dueDate: e.target.value })} />
            </FormField>
            <FormField label={t('assignments.maxPoints')}>
              <input type="number" min="0" className="ce-input" value={values.maxPoints} onChange={(e) => setValues({ ...values, maxPoints: e.target.value })} />
            </FormField>
          </div>
        )}
      </FormModal>
    </div>
  );
}
