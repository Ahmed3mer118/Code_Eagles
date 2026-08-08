import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { groupApi, contentApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import ConfirmDialog from '../../shared/ui/ConfirmDialog';
import FormModal from '../../shared/ui/FormModal';
import FormField, { getFriendlyError } from '../../shared/ui/FormField';
import SearchInput, { filterByQuery } from '../../shared/ui/SearchInput';
import ToggleSwitch from '../../shared/ui/ToggleSwitch';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const emptyForm = {
  name: '', subjectId: '', gradeLevel: 'grade_12', capacity: 30,
  meetingDays: [], startTime: '17:00', endTime: '19:00', classroom: '', meetingLink: '',
};

function validateGroup(values) {
  const errors = {};
  if (!values.name?.trim()) errors.name = 'groups.errors.nameRequired';
  if (!values.subjectId) errors.subjectId = 'groups.errors.subjectRequired';
  return errors;
}

export default function GroupsPage() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    try {
      const [g, s] = await Promise.all([groupApi.list(), contentApi.listSubjects()]);
      setGroups(g.groups || []);
      setSubjects(s.subjects || []);
    } catch (err) {
      toast.error(getFriendlyError(err));
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (group) => { setEditing(group); setModalOpen(true); };

  const saveGroup = async (values) => {
    if (editing) await groupApi.update(editing._id, values);
    else await groupApi.create(values);
    toast.success(t('common.success'));
    load();
  };

  const toggleVisible = async (group) => {
    try {
      await groupApi.update(group._id, { isVisible: !group.isVisible });
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(getFriendlyError(err));
    }
  };

  const filtered = filterByQuery(groups, search, ['name']);
  const initialValues = editing ? {
    name: editing.name,
    subjectId: editing.subjectId?._id || editing.subjectId,
    gradeLevel: editing.gradeLevel,
    capacity: editing.capacity,
    meetingDays: editing.meetingDays || [],
    startTime: editing.startTime || '',
    endTime: editing.endTime || '',
    classroom: editing.classroom || '',
    meetingLink: editing.meetingLink || '',
  } : emptyForm;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard.groups')}
        subtitle={t('groups.subtitle')}
        actions={<button type="button" className="ce-btn ce-btn-accent" onClick={openCreate}>{t('groups.add')}</button>}
      />

      <SearchInput value={search} onChange={setSearch} />

      <div className="ce-card overflow-hidden">
        <ul className="divide-y divide-[var(--ce-border)]">
          {filtered.map((group) => (
            <li key={group._id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <div>
                <div className="font-bold">{group.name}</div>
                <div className="text-sm text-[var(--ce-muted)]">
                  {group.subjectId?.name} · {group.startTime}-{group.endTime}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => openEdit(group)}>{t('content.edit')}</button>
                <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => setConfirmDelete(group)}>{t('content.delete')}</button>
                <ToggleSwitch
                  label={group.isVisible ? t('groups.visible') : t('groups.hidden')}
                  checked={group.isVisible !== false}
                  onChange={() => toggleVisible(group)}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t('groups.edit') : t('groups.add')}
        draftKey={editing ? `group-edit-${editing._id}` : 'group-create'}
        initialValues={initialValues}
        validate={(values) => {
          const e = validateGroup(values);
          const out = {};
          Object.entries(e).forEach(([k, v]) => { out[k] = t(v); });
          return out;
        }}
        onSubmit={saveGroup}
        size="lg"
      >
        {({ values, setValues, errors }) => (
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label={t('groups.name')} required error={errors.name}>
              <input className="ce-input" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
            </FormField>
            <FormField label={t('content.subjectName')} required error={errors.subjectId}>
              <select className="ce-input" value={values.subjectId} onChange={(e) => setValues({ ...values, subjectId: e.target.value })}>
                <option value="">{t('content.subjectName')}</option>
                {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </FormField>
            <FormField label={t('groups.capacity')}>
              <input className="ce-input" type="number" min={1} value={values.capacity} onChange={(e) => setValues({ ...values, capacity: Number(e.target.value) })} />
            </FormField>
            <FormField label={t('groups.startTime')}>
              <input className="ce-input" type="time" value={values.startTime} onChange={(e) => setValues({ ...values, startTime: e.target.value })} />
            </FormField>
            <FormField label={t('groups.endTime')}>
              <input className="ce-input" type="time" value={values.endTime} onChange={(e) => setValues({ ...values, endTime: e.target.value })} />
            </FormField>
            <FormField label={t('groups.classroom')}>
              <input className="ce-input" value={values.classroom} onChange={(e) => setValues({ ...values, classroom: e.target.value })} />
            </FormField>
            <FormField label={t('groups.meetingLink')} helper={t('groups.meetingLinkHint')}>
              <input className="ce-input" value={values.meetingLink} onChange={(e) => setValues({ ...values, meetingLink: e.target.value })} />
            </FormField>
            <div className="md:col-span-2">
              <p className="ce-label">{t('groups.meetingDays')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {DAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs font-bold ${values.meetingDays.includes(d) ? 'bg-[var(--ce-accent)] text-[var(--ce-primary)]' : 'bg-[var(--ce-bg)] text-[var(--ce-muted)]'}`}
                    onClick={() => setValues({
                      ...values,
                      meetingDays: values.meetingDays.includes(d)
                        ? values.meetingDays.filter((x) => x !== d)
                        : [...values.meetingDays, d],
                    })}
                  >
                    {t(`groups.days.${d}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </FormModal>

      <ConfirmDialog
        open={!!confirmDelete}
        title={t('groups.confirmDelete')}
        message={t('groups.confirmDeleteDesc')}
        confirmLabel={t('content.delete')}
        cancelLabel={t('common.cancel')}
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          try {
            await groupApi.remove(confirmDelete._id);
            toast.success(t('common.success'));
            load();
          } catch (err) {
            toast.error(getFriendlyError(err));
          } finally {
            setConfirmDelete(null);
          }
        }}
      />
    </div>
  );
}
