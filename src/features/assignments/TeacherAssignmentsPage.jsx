import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { assignmentApi, contentApi, groupApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import FormModal from '../../shared/ui/FormModal';
import FormField from '../../shared/ui/FormField';
import GroupCheckboxList from '../../shared/ui/GroupCheckboxList';
import StatusBadge from '../../shared/ui/StatusBadge';

const empty = {
  title: '',
  description: '',
  instructions: '',
  subjectId: '',
  moduleId: '',
  lessonId: '',
  groupIds: [],
  dueDate: '',
  maxPoints: 100,
  allowLateSubmission: false,
  status: 'published',
};

function normalizeForm(item) {
  if (!item) return { ...empty };
  return {
    ...empty,
    ...item,
    subjectId: item.subjectId?._id || item.subjectId || '',
    moduleId: item.moduleId?._id || item.moduleId || '',
    lessonId: item.lessonId?._id || item.lessonId || '',
    groupIds: (item.groupIds || []).map((g) => g._id || g),
    dueDate: item.dueDate ? item.dueDate.slice(0, 16) : '',
  };
}

function validate(values, t) {
  const errors = {};
  if (!values.title?.trim()) errors.title = t('assignments.errors.titleRequired');
  if (!values.subjectId) errors.subject = t('assignments.errors.subjectRequired');
  if (!values.moduleId) errors.module = t('assignments.errors.moduleRequired');
  if (!values.lessonId) errors.lesson = t('assignments.errors.lessonRequired');
  if (!values.groupIds?.length) errors.groups = t('assignments.errors.groupsRequired');
  if (!values.dueDate) errors.dueDate = t('assignments.errors.dueDateRequired');
  return errors;
}

function AssignmentFormFields({ values, setValues, errors, subjects, groups, t }) {
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    if (!values.subjectId || !/^[a-f0-9]{24}$/i.test(values.subjectId)) {
      setModules([]);
      setLessons([]);
      return undefined;
    }
    contentApi.getSubjectTree(values.subjectId)
      .then((data) => {
        const tree = data.subject || data;
        setModules((tree.courses || []).flatMap((c) => c.modules || []));
      })
      .catch(() => setModules([]));
    return undefined;
  }, [values.subjectId]);

  useEffect(() => {
    if (!values.moduleId) {
      setLessons([]);
      return;
    }
    const mod = modules.find((m) => m._id === values.moduleId);
    setLessons(mod?.lessons || []);
  }, [values.moduleId, modules]);

  const filteredGroups = values.subjectId
    ? groups.filter((g) => (g.subjectId?._id || g.subjectId) === values.subjectId)
    : groups;

  return (
    <div className="space-y-4">
      <FormField label={t('assignments.fieldTitle')} required error={errors.title}>
        <input className="ce-input" value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} />
      </FormField>
      <FormField label={t('assignments.description')}>
        <textarea className="ce-input min-h-[80px]" value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} />
      </FormField>
      <FormField label={t('assignments.instructions')}>
        <textarea className="ce-input min-h-[80px]" value={values.instructions} onChange={(e) => setValues({ ...values, instructions: e.target.value })} />
      </FormField>

      <p className="text-sm text-[var(--ce-muted)]">{t('assignments.linkHint')}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label={t('content.subjectName')} required error={errors.subject}>
          <select
            className="ce-input"
            value={values.subjectId}
            onChange={(e) => setValues({ ...values, subjectId: e.target.value, moduleId: '', lessonId: '', groupIds: [] })}
          >
            <option value="">{t('content.subjectName')}</option>
            {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </FormField>
        <FormField label={t('content.unitName')} required error={errors.module}>
          <select
            className="ce-input"
            value={values.moduleId}
            disabled={!values.subjectId || !modules.length}
            onChange={(e) => setValues({ ...values, moduleId: e.target.value, lessonId: '' })}
          >
            <option value="">{t('assignments.selectUnit')}</option>
            {modules.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
          </select>
        </FormField>
        <FormField label={t('content.lessonName')} required error={errors.lesson}>
          <select
            className="ce-input"
            value={values.lessonId}
            disabled={!values.moduleId || !lessons.length}
            onChange={(e) => setValues({ ...values, lessonId: e.target.value })}
          >
            <option value="">{t('assignments.selectLesson')}</option>
            {lessons.map((l) => <option key={l._id} value={l._id}>{l.title}</option>)}
          </select>
        </FormField>
        <FormField label={t('assignments.dueDate')} required error={errors.dueDate}>
          <input type="datetime-local" className="ce-input" value={values.dueDate} onChange={(e) => setValues({ ...values, dueDate: e.target.value })} />
        </FormField>
      </div>

      <FormField label={t('dashboard.groups')} helper={t('groups.selectHint')} required error={errors.groups}>
        <GroupCheckboxList
          groups={filteredGroups}
          value={values.groupIds}
          onChange={(groupIds) => setValues({ ...values, groupIds })}
        />
      </FormField>
      <FormField label={t('assignments.maxPoints')}>
        <input type="number" min="0" className="ce-input" value={values.maxPoints} onChange={(e) => setValues({ ...values, maxPoints: e.target.value })} />
      </FormField>
    </div>
  );
}

function groupAssignments(assignments) {
  const map = new Map();
  assignments.forEach((item) => {
    (item.groupIds || []).forEach((group) => {
      const gid = group._id || group;
      if (!map.has(gid)) map.set(gid, { group, items: [] });
      if (!map.get(gid).items.some((a) => a._id === item._id)) {
        map.get(gid).items.push(item);
      }
    });
  });
  return [...map.values()]
    .sort((a, b) => (a.group?.name || '').localeCompare(b.group?.name || ''))
    .map((section) => ({ ...section, items: [...section.items] }));
}

export default function TeacherAssignmentsPage() {
  const { t } = useTranslation();
  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [modal, setModal] = useState(null);

  const load = async () => {
    try {
      const [a, g, s] = await Promise.all([assignmentApi.list(), groupApi.list(), contentApi.listSubjects()]);
      setAssignments(a.assignments || []);
      setGroups(g.groups || []);
      setSubjects(s.subjects || []);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => groupAssignments(assignments), [assignments]);

  const save = async (values) => {
    const formErrors = validate(values, t);
    if (Object.keys(formErrors).length) {
      toast.error(Object.values(formErrors)[0]);
      return;
    }
    try {
      const payload = {
        ...values,
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

      {grouped.length === 0 ? (
        <div className="ce-card p-8 text-center text-[var(--ce-muted)]">{t('assignments.empty')}</div>
      ) : (
        grouped.map(({ group, items }) => (
          <section key={group._id || group} className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{group.name}</h3>
              <StatusBadge status="approved" label={`${items.length} ${t('assignments.countLabel')}`} />
            </div>
            <div className="grid gap-3">
              {items.map((item) => (
                <article key={item._id} className="ce-card p-5">
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
                        {' · '}
                        {item.maxPoints} {t('assignments.pointsLabel')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/dashboard/teacher/assignments/${item._id}`} className="ce-btn ce-btn-ghost text-sm">{t('assignments.review')}</Link>
                      <button type="button" className="ce-btn ce-btn-ghost text-sm" onClick={() => setModal({ item })}>{t('groups.edit')}</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}

      <FormModal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.item?._id ? t('assignments.edit') : t('assignments.add')}
        initialValues={normalizeForm(modal?.item)}
        onSubmit={save}
      >
        {({ values, setValues }) => (
          <AssignmentFormFields
            values={values}
            setValues={setValues}
            errors={validate(values, t)}
            subjects={subjects}
            groups={groups}
            t={t}
          />
        )}
      </FormModal>
    </div>
  );
}
