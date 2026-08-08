import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { assistantApi, groupApi, ASSISTANT_PERMISSIONS } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import FormModal from '../../shared/ui/FormModal';
import FormField, { getFriendlyError } from '../../shared/ui/FormField';
import SearchInput, { filterByQuery } from '../../shared/ui/SearchInput';

const emptyAssistant = {
  name: '',
  email: '',
  password: 'Assistant12345',
  phone_number: '',
  permissions: ['enroll_students', 'review_payments', 'record_attendance'],
  assignedGroupIds: [],
};

export default function AssistantsPage() {
  const { t } = useTranslation();
  const [assistants, setAssistants] = useState([]);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      const [a, g] = await Promise.all([assistantApi.list(), groupApi.list()]);
      setAssistants(a.assistants || []);
      setGroups(g.groups || []);
    } catch (err) {
      toast.error(getFriendlyError(err));
    }
  };

  useEffect(() => { load(); }, []);

  const saveAssistant = async (values) => {
    if (editing) {
      await assistantApi.update(editing._id, {
        permissions: values.permissions,
        assignedGroupIds: values.assignedGroupIds,
      });
    } else {
      await assistantApi.create(values);
    }
    toast.success(t('common.success'));
    load();
  };

  const togglePermission = async (assistant, perm) => {
    const permissions = assistant.permissions.includes(perm)
      ? assistant.permissions.filter((p) => p !== perm)
      : [...assistant.permissions, perm];
    try {
      await assistantApi.update(assistant._id, { permissions });
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(getFriendlyError(err));
    }
  };

  const toggleGroup = async (assistant, groupId) => {
    const assignedGroupIds = (assistant.assignedGroupIds || []).map(String);
    const next = assignedGroupIds.includes(groupId)
      ? assignedGroupIds.filter((id) => id !== groupId)
      : [...assignedGroupIds, groupId];
    try {
      await assistantApi.update(assistant._id, { assignedGroupIds: next });
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(getFriendlyError(err));
    }
  };

  const filtered = filterByQuery(
    assistants.map((a) => ({ ...a, name: a.userId?.name, email: a.userId?.email })),
    search,
    ['name', 'email']
  );

  const initialValues = editing ? {
    name: editing.userId?.name,
    email: editing.userId?.email,
    permissions: editing.permissions || [],
    assignedGroupIds: (editing.assignedGroupIds || []).map(String),
    password: '',
    phone_number: editing.userId?.phone_number || '',
  } : emptyAssistant;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard.assistants')}
        subtitle={t('assistants.subtitle')}
        actions={<button type="button" className="ce-btn ce-btn-accent" onClick={() => { setEditing(null); setModalOpen(true); }}>{t('assistants.add')}</button>}
      />

      <SearchInput value={search} onChange={setSearch} />

      <div className="ce-card overflow-hidden">
        <ul className="divide-y divide-[var(--ce-border)]">
          {filtered.map((assistant) => (
            <li key={assistant._id} className="px-6 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-bold">{assistant.userId?.name}</div>
                  <div className="text-sm text-[var(--ce-muted)]">{assistant.userId?.email}</div>
                </div>
                <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => { setEditing(assistant); setModalOpen(true); }}>
                  {t('content.edit')}
                </button>
              </div>
              <p className="mt-3 text-xs font-bold text-[var(--ce-muted)]">{t('assistants.permissions')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ASSISTANT_PERMISSIONS.map((perm) => (
                  <button
                    key={perm}
                    type="button"
                    onClick={() => togglePermission(assistant, perm)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${assistant.permissions.includes(perm) ? 'bg-[var(--ce-accent)] text-[var(--ce-primary)]' : 'bg-[var(--ce-bg)] text-[var(--ce-muted)]'}`}
                  >
                    {t(`permissions.${perm}`, perm)}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs font-bold text-[var(--ce-muted)]">{t('assistants.assignedGroups')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {groups.map((g) => {
                  const active = (assistant.assignedGroupIds || []).map(String).includes(g._id);
                  return (
                    <button
                      key={g._id}
                      type="button"
                      onClick={() => toggleGroup(assistant, g._id)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? 'bg-emerald-100 text-emerald-900' : 'bg-[var(--ce-bg)] text-[var(--ce-muted)]'}`}
                    >
                      {active ? '✓ ' : ''}{g.name}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? t('assistants.edit') : t('assistants.add')}
        draftKey={editing ? `assistant-${editing._id}` : 'assistant-create'}
        initialValues={initialValues}
        validate={(values) => {
          const errors = {};
          if (!editing && !values.name?.trim()) errors.name = t('assistants.errors.nameRequired');
          if (!editing && !values.email?.trim()) errors.email = t('assistants.errors.emailRequired');
          if (!values.assignedGroupIds?.length) errors.groups = t('assistants.errors.groupsRequired');
          return errors;
        }}
        onSubmit={saveAssistant}
        size="lg"
      >
        {({ values, setValues, errors }) => (
          <div className="space-y-4">
            {!editing && (
              <>
                <FormField label={t('auth.name')} required error={errors.name}>
                  <input className="ce-input" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
                </FormField>
                <FormField label={t('auth.email')} required error={errors.email}>
                  <input className="ce-input" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
                </FormField>
                <FormField label={t('auth.phone')}>
                  <input className="ce-input" value={values.phone_number} onChange={(e) => setValues({ ...values, phone_number: e.target.value })} />
                </FormField>
                <FormField label={t('auth.password')}>
                  <input className="ce-input" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} />
                </FormField>
              </>
            )}
            <FormField label={t('assistants.assignedGroups')} required error={errors.groups}>
              <div className="flex flex-wrap gap-2">
                {groups.map((g) => {
                  const active = (values.assignedGroupIds || []).includes(g._id);
                  return (
                    <button
                      key={g._id}
                      type="button"
                      className={`rounded-full px-3 py-1 text-xs font-bold ${active ? 'bg-emerald-100 text-emerald-900' : 'bg-[var(--ce-bg)]'}`}
                      onClick={() => setValues({
                        ...values,
                        assignedGroupIds: active
                          ? values.assignedGroupIds.filter((id) => id !== g._id)
                          : [...(values.assignedGroupIds || []), g._id],
                      })}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </FormField>
            <FormField label={t('assistants.permissions')}>
              <div className="flex flex-wrap gap-2">
                {ASSISTANT_PERMISSIONS.map((perm) => (
                  <button
                    key={perm}
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${values.permissions.includes(perm) ? 'bg-[var(--ce-accent)]' : 'bg-[var(--ce-bg)]'}`}
                    onClick={() => setValues({
                      ...values,
                      permissions: values.permissions.includes(perm)
                        ? values.permissions.filter((p) => p !== perm)
                        : [...values.permissions, perm],
                    })}
                  >
                    {t(`permissions.${perm}`, perm)}
                  </button>
                ))}
              </div>
            </FormField>
          </div>
        )}
      </FormModal>
    </div>
  );
}
