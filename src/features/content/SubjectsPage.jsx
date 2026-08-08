import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { contentApi } from '../../shared/api/platformApi';
import SearchInput, { filterByQuery } from '../../shared/ui/SearchInput';

const GRADES = [
  { value: 'grade_10', labelKey: 'auth.grade10' },
  { value: 'grade_11', labelKey: 'auth.grade11' },
  { value: 'grade_12', labelKey: 'auth.grade12' },
  { value: 'general', labelKey: 'content.general' },
];

export default function SubjectsPage() {
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', gradeLevel: 'grade_12', description: '' });
  const [saving, setSaving] = useState(false);

  const load = async (q = search) => {
    setLoading(true);
    try {
      const data = await contentApi.listSubjects(q ? { q } : {});
      setSubjects(data.subjects || []);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(''); }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await contentApi.updateSubject(editing, form);
      } else {
        await contentApi.createSubject(form);
      }
      toast.success(t('common.success'));
      setForm({ name: '', gradeLevel: 'grade_12', description: '' });
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (subject) => {
    setEditing(subject._id);
    setForm({ name: subject.name, gradeLevel: subject.gradeLevel, description: subject.description || '' });
  };

  const onDelete = async (id) => {
    if (!window.confirm(t('content.confirmDelete'))) return;
    try {
      await contentApi.deleteSubject(id);
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const filtered = filterByQuery(subjects, search, ['name']);

  return (
    <div className="space-y-6">
      <SearchInput value={search} onChange={setSearch} />

      <div className="ce-card p-6">
        <h2 className="text-xl font-extrabold text-[var(--ce-primary)]">
          {editing ? t('content.editSubject') : t('dashboard.subjects')}
        </h2>
        <form onSubmit={onSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
          <input className="ce-input" placeholder={t('content.subjectName')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <select className="ce-input" value={form.gradeLevel} onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })}>
            {GRADES.map((g) => <option key={g.value} value={g.value}>{t(g.labelKey)}</option>)}
          </select>
          <textarea className="ce-input min-h-[90px] md:col-span-2" placeholder={t('content.description')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-2">
            <button type="submit" className="ce-btn ce-btn-accent" disabled={saving}>{saving ? t('common.loading') : t('common.save')}</button>
            {editing && <button type="button" className="ce-btn ce-btn-ghost" onClick={() => { setEditing(null); setForm({ name: '', gradeLevel: 'grade_12', description: '' }); }}>{t('common.cancel')}</button>}
          </div>
        </form>
      </div>

      <div className="ce-card overflow-hidden">
        {loading ? (
          <p className="p-6 text-[var(--ce-muted)]">{t('common.loading')}</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-[var(--ce-muted)]">{t('content.noSubjects')}</p>
        ) : (
          <ul className="divide-y divide-[var(--ce-border)]">
            {filtered.map((s) => (
              <li key={s._id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                <div>
                  <div className="font-bold text-[var(--ce-primary)]">{s.name}</div>
                  <div className="text-sm text-[var(--ce-muted)]">{s.gradeLevel} · {s.status}</div>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => startEdit(s)}>{t('content.edit')}</button>
                  <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => onDelete(s._id)}>{t('content.delete')}</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
