import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { contentApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import EmptyState from '../../shared/ui/EmptyState';
import ConfirmDialog from '../../shared/ui/ConfirmDialog';
import FormField, { getFriendlyError } from '../../shared/ui/FormField';
import SearchInput from '../../shared/ui/SearchInput';

const emptyLecture = { title: '', description: '', videoUrl: '', order: 0 };

export default function ContentHubPage() {
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectForm, setSubjectForm] = useState({ name: '', gradeLevel: 'grade_12', description: '' });
  const [editingSubject, setEditingSubject] = useState(null);
  const [unitTitle, setUnitTitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [activeLesson, setActiveLesson] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [lectureForm, setLectureForm] = useState(emptyLecture);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const data = await contentApi.listSubjects(search ? { q: search } : {});
      setSubjects(data.subjects || []);
    } catch (err) {
      toast.error(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const loadTree = async (id) => {
    try {
      const data = await contentApi.getSubjectTree(id);
      const subjectTree = data.subject || data;
      setTree(subjectTree);
      if (!subjectTree.courses?.length) {
        await contentApi.createCourse(id, { title: subjectTree.name || 'Main track', description: '' });
        const refreshed = await contentApi.getSubjectTree(id);
        setTree(refreshed.subject || refreshed);
      }
    } catch (err) {
      toast.error(getFriendlyError(err));
    }
  };

  useEffect(() => { loadSubjects(); }, [search]);

  useEffect(() => {
    if (selectedId) loadTree(selectedId);
  }, [selectedId]);

  const loadLectures = async (lessonId) => {
    setActiveLesson(lessonId);
    try {
      const data = await contentApi.listLectures(lessonId);
      setLectures(data.lectures || []);
    } catch (err) {
      toast.error(getFriendlyError(err));
    }
  };

  const onSaveSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) {
      toast.error(t('content.errors.nameRequired'));
      return;
    }
    setSaving(true);
    try {
      if (editingSubject) {
        await contentApi.updateSubject(editingSubject, subjectForm);
      } else {
        await contentApi.createSubject(subjectForm);
      }
      toast.success(t('common.success'));
      setSubjectForm({ name: '', gradeLevel: 'grade_12', description: '' });
      setEditingSubject(null);
      loadSubjects();
    } catch (err) {
      toast.error(getFriendlyError(err));
    } finally {
      setSaving(false);
    }
  };

  const addUnit = async () => {
    if (!unitTitle.trim()) return toast.error(t('content.errors.unitRequired'));
    const courseId = tree?.courses?.[0]?._id;
    if (!courseId) return;
    try {
      await contentApi.createModule(courseId, { title: unitTitle, order: (tree.courses[0].modules?.length || 0) + 1 });
      toast.success(t('common.success'));
      setUnitTitle('');
      loadTree(selectedId);
    } catch (err) {
      toast.error(getFriendlyError(err));
    }
  };

  const addLesson = async (moduleId) => {
    if (!lessonTitle.trim()) return toast.error(t('content.errors.lessonRequired'));
    try {
      await contentApi.createLesson(moduleId, { title: lessonTitle, order: 99 });
      toast.success(t('common.success'));
      setLessonTitle('');
      loadTree(selectedId);
    } catch (err) {
      toast.error(getFriendlyError(err));
    }
  };

  const moveItem = async (type, items, index, dir) => {
    const swap = index + dir;
    if (swap < 0 || swap >= items.length) return;
    const next = [...items];
    [next[index], next[swap]] = [next[swap], next[index]];
    const payload = next.map((item, i) => ({ id: item._id, order: i + 1 }));
    try {
      if (type === 'module') await contentApi.reorderModules(payload);
      if (type === 'lesson') await contentApi.reorderLessons(payload);
      if (type === 'lecture') await contentApi.reorderLectures(payload);
      if (type === 'lecture') loadLectures(activeLesson);
      else loadTree(selectedId);
    } catch (err) {
      toast.error(getFriendlyError(err));
    }
  };

  const saveLecture = async (e) => {
    e.preventDefault();
    if (!lectureForm.title.trim()) return toast.error(t('content.errors.lectureRequired'));
    try {
      if (lectureForm._id) {
        await contentApi.updateLecture(lectureForm._id, lectureForm);
      } else {
        await contentApi.createLecture(activeLesson, lectureForm);
      }
      toast.success(t('common.success'));
      setLectureForm(emptyLecture);
      loadLectures(activeLesson);
    } catch (err) {
      toast.error(getFriendlyError(err));
    }
  };

  const course = tree?.courses?.[0];

  return (
    <div className="space-y-6">
      <PageHeader title={t('content.hubTitle')} subtitle={t('content.subjectsHint')} />

      <SearchInput value={search} onChange={setSearch} placeholder={t('common.search')} />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="ce-card p-5">
          <h3 className="font-extrabold text-[var(--ce-primary)]">{t('dashboard.subjects')}</h3>
          <form onSubmit={onSaveSubject} className="mt-4 space-y-3">
            <FormField label={t('content.subjectName')} required>
              <input className="ce-input" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} />
            </FormField>
            <button type="submit" className="ce-btn ce-btn-accent w-full" disabled={saving}>
              {editingSubject ? t('common.save') : t('content.addSubject')}
            </button>
          </form>
          {loading ? (
            <p className="mt-4 text-sm text-[var(--ce-muted)]">{t('common.loading')}</p>
          ) : subjects.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--ce-muted)]">{t('content.noSubjects')}</p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--ce-border)]">
              {subjects.map((s) => (
                <li key={s._id} className="flex items-center justify-between gap-2 py-3">
                  <button type="button" className={`text-start font-semibold ${selectedId === s._id ? 'text-[var(--ce-accent)]' : ''}`} onClick={() => setSelectedId(s._id)}>
                    {s.name}
                  </button>
                  <div className="flex gap-1">
                    <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => { setEditingSubject(s._id); setSubjectForm({ name: s.name, gradeLevel: s.gradeLevel, description: s.description || '' }); }}>{t('content.edit')}</button>
                    <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => setConfirm({ type: 'subject', id: s._id })}>{t('content.delete')}</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          {!selectedId ? (
            <EmptyState icon="📚" title={t('content.selectSubject')} description={t('content.subjectsHint')} />
          ) : (
            <div className="space-y-6">
              <div className="ce-card p-5">
                <h3 className="font-extrabold text-[var(--ce-primary)]">{t('content.units')}</h3>
                <div className="mt-3 flex gap-2">
                  <input className="ce-input flex-1" placeholder={t('content.unitName')} value={unitTitle} onChange={(e) => setUnitTitle(e.target.value)} />
                  <button type="button" className="ce-btn ce-btn-accent" onClick={addUnit}>{t('content.addUnit')}</button>
                </div>
                <div className="mt-4 space-y-4">
                  {(course?.modules || []).map((mod, mi) => (
                    <div key={mod._id} className="rounded-xl border border-[var(--ce-border)] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold">{mod.title}</span>
                        <div className="flex gap-1">
                          <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => moveItem('module', course.modules, mi, -1)}>↑</button>
                          <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => moveItem('module', course.modules, mi, 1)}>↓</button>
                          <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => setConfirm({ type: 'module', id: mod._id })}>{t('content.delete')}</button>
                        </div>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {(mod.lessons || []).map((lesson, li) => (
                          <li key={lesson._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--ce-bg)] px-3 py-2 text-sm">
                            <button type="button" className="font-semibold" onClick={() => loadLectures(lesson._id)}>{lesson.title}</button>
                            <div className="flex gap-1">
                              <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => moveItem('lesson', mod.lessons, li, -1)}>↑</button>
                              <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => moveItem('lesson', mod.lessons, li, 1)}>↓</button>
                              <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => setConfirm({ type: 'lesson', id: lesson._id })}>{t('content.delete')}</button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex gap-2">
                        <input className="ce-input flex-1 text-sm" placeholder={t('content.lessonName')} value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
                        <button type="button" className="ce-btn ce-btn-ghost text-sm" onClick={() => addLesson(mod._id)}>{t('content.addLesson')}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {activeLesson && (
                <div className="ce-card p-5">
                  <h3 className="font-extrabold text-[var(--ce-primary)]">{t('content.lectures')}</h3>
                  <form onSubmit={saveLecture} className="mt-4 grid gap-3 md:grid-cols-2">
                    <FormField label={t('content.lectureTitle')} required>
                      <input className="ce-input" value={lectureForm.title} onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })} />
                    </FormField>
                    <FormField label={t('content.videoUrl')} helper={t('content.videoUrlHint')}>
                      <input className="ce-input" value={lectureForm.videoUrl} onChange={(e) => setLectureForm({ ...lectureForm, videoUrl: e.target.value })} />
                    </FormField>
                    <FormField label={t('content.description')} htmlFor="lecture-desc">
                      <textarea id="lecture-desc" className="ce-input min-h-[80px] md:col-span-2" value={lectureForm.description} onChange={(e) => setLectureForm({ ...lectureForm, description: e.target.value })} />
                    </FormField>
                    <button type="submit" className="ce-btn ce-btn-accent md:col-span-2">{lectureForm._id ? t('common.save') : t('content.addLecture')}</button>
                  </form>
                  <ul className="mt-4 space-y-2">
                    {lectures.map((lec, i) => (
                      <li key={lec._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--ce-border)] px-3 py-2">
                        <div>
                          <div className="font-semibold">{lec.title}</div>
                          {lec.videoUrl && <a href={lec.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-[var(--ce-primary)] underline">{t('student.watch')}</a>}
                        </div>
                        <div className="flex gap-1">
                          <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => setLectureForm({ ...lec })}>{t('content.edit')}</button>
                          <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => moveItem('lecture', lectures, i, -1)}>↑</button>
                          <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => moveItem('lecture', lectures, i, 1)}>↓</button>
                          <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => setConfirm({ type: 'lecture', id: lec._id })}>{t('content.delete')}</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={t('content.confirmDelete')}
        message={t('content.confirmDeleteDesc')}
        confirmLabel={t('content.delete')}
        cancelLabel={t('common.cancel')}
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          try {
            if (confirm.type === 'subject') await contentApi.deleteSubject(confirm.id);
            if (confirm.type === 'module') await contentApi.deleteModule(confirm.id);
            if (confirm.type === 'lesson') await contentApi.deleteLesson(confirm.id);
            if (confirm.type === 'lecture') await contentApi.deleteLecture(confirm.id);
            toast.success(t('common.success'));
            if (confirm.type === 'subject') { setSelectedId(null); loadSubjects(); }
            else if (confirm.type === 'lecture') loadLectures(activeLesson);
            else loadTree(selectedId);
          } catch (err) {
            toast.error(getFriendlyError(err));
          } finally {
            setConfirm(null);
          }
        }}
      />
    </div>
  );
}
