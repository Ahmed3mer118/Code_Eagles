import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Layers,
  Pencil,
  PlayCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { contentApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import EmptyState from '../../shared/ui/EmptyState';
import ConfirmDialog from '../../shared/ui/ConfirmDialog';
import FormModal from '../../shared/ui/FormModal';
import FormField, { getFriendlyError } from '../../shared/ui/FormField';
import SearchInput from '../../shared/ui/SearchInput';
import VisibilityToggle from '../../shared/ui/VisibilityToggle';

const emptySubject = { name: '', gradeLevel: 'grade_12', description: '' };
const emptyUnit = { title: '' };
const emptyLesson = { title: '' };
const emptyLecture = { title: '', description: '', videoUrl: '', order: 0, isVisible: true };

export default function ContentHubPage() {
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeLesson, setActiveLesson] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [subjectModal, setSubjectModal] = useState(null);
  const [unitModal, setUnitModal] = useState(false);
  const [lessonModal, setLessonModal] = useState(null);
  const [lectureModal, setLectureModal] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});

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
        await contentApi.createCourse(id, { title: subjectTree.name || 'Main track', description: '', status: 'published' });
        const refreshed = await contentApi.getSubjectTree(id);
        setTree(refreshed.subject || refreshed);
      }
    } catch (err) {
      toast.error(getFriendlyError(err));
    }
  };

  useEffect(() => { loadSubjects(); }, [search]);
  useEffect(() => { if (selectedId) loadTree(selectedId); }, [selectedId]);

  const loadLectures = async (lessonId) => {
    setActiveLesson(lessonId);
    try {
      const data = await contentApi.listLectures(lessonId);
      setLectures(data.lectures || []);
    } catch (err) {
      toast.error(getFriendlyError(err));
    }
  };

  const saveSubject = async (values) => {
    if (subjectModal?.id) await contentApi.updateSubject(subjectModal.id, values);
    else await contentApi.createSubject(values);
    toast.success(t('common.success'));
    loadSubjects();
    if (subjectModal?.id === selectedId) loadTree(selectedId);
  };

  const addUnit = async ({ title }) => {
    const courseId = tree?.courses?.[0]?._id;
    if (!courseId) return;
    await contentApi.createModule(courseId, { title, order: (tree.courses[0].modules?.length || 0) + 1 });
    toast.success(t('common.success'));
    loadTree(selectedId);
  };

  const addLesson = async ({ title }, moduleId) => {
    await contentApi.createLesson(moduleId, { title, order: 99 });
    toast.success(t('common.success'));
    loadTree(selectedId);
  };

  const saveLecture = async (values) => {
    if (values._id) await contentApi.updateLecture(values._id, values);
    else await contentApi.createLecture(activeLesson, values);
    toast.success(t('common.success'));
    loadLectures(activeLesson);
  };

  const toggleLectureVisibility = async (lec) => {
    try {
      await contentApi.updateLecture(lec._id, { isVisible: lec.isVisible === false });
      toast.success(t('common.success'));
      loadLectures(activeLesson);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    }
  };

  const toggleModuleVisibility = async (mod) => {
    try {
      await contentApi.updateModule(mod._id, { isVisible: mod.isVisible === false });
      toast.success(t('common.success'));
      loadTree(selectedId);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    }
  };

  const toggleLessonVisibility = async (lesson) => {
    try {
      await contentApi.updateLesson(lesson._id, { isVisible: lesson.isVisible === false });
      toast.success(t('common.success'));
      loadTree(selectedId);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    }
  };

  const toggleModuleOpen = (moduleId) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const toggleLessonOpen = (lessonId) => {
    setExpandedLessons((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
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

  const course = tree?.courses?.[0];
  const selectedSubject = subjects.find((s) => s._id === selectedId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('content.hubTitle')}
        subtitle={t('content.subjectsHint')}
        actions={
          <button type="button" className="ce-btn ce-btn-accent text-sm" onClick={() => setSubjectModal({ id: null })}>
            <Plus className="h-4 w-4" />
            {t('content.addSubject')}
          </button>
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder={t('common.search')} />

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <div className="ce-card p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-extrabold text-[var(--ce-primary)]">{t('dashboard.subjects')}</h3>
            <span className="rounded-full bg-[var(--ce-bg)] px-2.5 py-0.5 text-xs font-bold text-[var(--ce-muted)]">
              {subjects.length}
            </span>
          </div>
          {loading ? (
            <p className="mt-4 text-sm text-[var(--ce-muted)]">{t('common.loading')}</p>
          ) : subjects.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--ce-muted)]">{t('content.noSubjects')}</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {subjects.map((s) => (
                <li key={s._id}>
                  <button
                    type="button"
                    className={`flex w-full items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-start transition ${
                      selectedId === s._id
                        ? 'border-[var(--ce-accent)] bg-[var(--ce-accent)]/10 shadow-sm'
                        : 'border-[var(--ce-border)] hover:border-[var(--ce-primary)]/30'
                    }`}
                    onClick={() => { setSelectedId(s._id); setActiveLesson(null); setLectures([]); }}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-[var(--ce-primary)]">{s.name}</p>
                      <p className="text-xs text-[var(--ce-muted)]">{s.gradeLevel || '—'}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--ce-muted)]" />
                  </button>
                  <div className="mt-1 flex justify-end gap-1 px-1">
                    <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => setSubjectModal({ id: s._id, values: { name: s.name, gradeLevel: s.gradeLevel, description: s.description || '' } })}>
                      <Pencil className="h-3.5 w-3.5" />
                      {t('content.edit')}
                    </button>
                    <button type="button" className="ce-btn ce-btn-ghost text-xs text-red-700" onClick={() => setConfirm({ type: 'subject', id: s._id })}>
                      <Trash2 className="h-3.5 w-3.5" />
                      {t('content.delete')}
                    </button>
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
              <div className="ce-card overflow-hidden">
                <div className="bg-gradient-to-r from-[var(--ce-primary)] to-[var(--ce-primary-soft)] px-6 py-5 text-white">
                  <p className="text-xs font-bold uppercase tracking-wide text-white/70">{t('content.currentSubject')}</p>
                  <h3 className="mt-1 text-2xl font-extrabold">{selectedSubject?.name || tree?.name}</h3>
                  {selectedSubject?.description && (
                    <p className="mt-2 max-w-2xl text-sm text-white/80">{selectedSubject.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 border-b border-[var(--ce-border)] px-6 py-4">
                  <button type="button" className="ce-btn ce-btn-accent text-sm" onClick={() => setUnitModal(true)}>
                    <Plus className="h-4 w-4" />
                    {t('content.addUnit')}
                  </button>
                </div>

                <div className="space-y-4 p-6">
                  {(course?.modules || []).length === 0 ? (
                    <EmptyState icon="📦" title={t('content.noUnits')} description={t('content.addUnitHint')} />
                  ) : (
                    (course?.modules || []).map((mod, mi) => {
                      const moduleOpen = expandedModules[mod._id] ?? true;
                      return (
                      <div key={mod._id} className="overflow-hidden rounded-2xl border border-[var(--ce-border)] bg-white">
                        <div className="flex items-center gap-2 border-b border-[var(--ce-border)] bg-[var(--ce-primary)]/5 px-4 py-3">
                          <button
                            type="button"
                            className="flex min-w-0 flex-1 items-center gap-2 text-start"
                            onClick={() => toggleModuleOpen(mod._id)}
                          >
                            <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--ce-muted)] transition ${moduleOpen ? 'rotate-180' : ''}`} />
                            <Layers className="h-4 w-4 shrink-0 text-[var(--ce-accent)]" />
                            <span className="truncate text-lg font-extrabold text-[var(--ce-primary)]">{mod.title}</span>
                          </button>
                          <VisibilityToggle
                            visible={mod.isVisible}
                            onToggle={() => toggleModuleVisibility(mod)}
                            title={mod.isVisible === false ? t('content.showItem') : t('content.hideItem')}
                          />
                          <div className="flex flex-wrap gap-1">
                            <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => setLessonModal({ moduleId: mod._id })}>{t('content.addLesson')}</button>
                            <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => moveItem('module', course.modules, mi, -1)}>↑</button>
                            <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => moveItem('module', course.modules, mi, 1)}>↓</button>
                            <button type="button" className="ce-btn ce-btn-ghost text-xs text-red-700" onClick={() => setConfirm({ type: 'module', id: mod._id })}>{t('content.delete')}</button>
                          </div>
                        </div>
                        {moduleOpen && (
                        <ul className="divide-y divide-[var(--ce-border)]">
                          {(mod.lessons || []).map((lesson, li) => {
                            const lessonOpen = expandedLessons[lesson._id] ?? activeLesson === lesson._id;
                            return (
                            <li key={lesson._id} className="bg-[var(--ce-bg)]/20">
                              <div className="flex items-center gap-2 px-4 py-3">
                                <button
                                  type="button"
                                  className={`flex min-w-0 flex-1 items-center gap-2 text-start font-semibold ${activeLesson === lesson._id ? 'text-[var(--ce-accent)]' : 'text-[var(--ce-primary)]'}`}
                                  onClick={() => {
                                    toggleLessonOpen(lesson._id);
                                    loadLectures(lesson._id);
                                  }}
                                >
                                  <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--ce-muted)] transition ${lessonOpen ? 'rotate-180' : ''}`} />
                                  <PlayCircle className="h-4 w-4 shrink-0" />
                                  <span className="truncate">{lesson.title}</span>
                                </button>
                                <VisibilityToggle
                                  visible={lesson.isVisible}
                                  onToggle={() => toggleLessonVisibility(lesson)}
                                  title={lesson.isVisible === false ? t('content.showItem') : t('content.hideItem')}
                                />
                                <div className="flex gap-1">
                                  <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => { setActiveLesson(lesson._id); setLectureModal({ values: emptyLecture }); loadLectures(lesson._id); }}>{t('content.addLecture')}</button>
                                  <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => moveItem('lesson', mod.lessons, li, -1)}>↑</button>
                                  <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => moveItem('lesson', mod.lessons, li, 1)}>↓</button>
                                  <button type="button" className="ce-btn ce-btn-ghost text-xs text-red-700" onClick={() => setConfirm({ type: 'lesson', id: lesson._id })}>{t('content.delete')}</button>
                                </div>
                              </div>
                              {lessonOpen && activeLesson === lesson._id && (
                                <div className="border-t border-[var(--ce-border)] bg-white px-4 py-4">
                                  {lectures.length === 0 ? (
                                    <p className="text-sm text-[var(--ce-muted)]">{t('content.noLectures')}</p>
                                  ) : (
                                    <ul className="grid gap-3 sm:grid-cols-2">
                                      {lectures.map((lec, i) => (
                                        <li key={lec._id} className="flex flex-col rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)]/30 p-4">
                                          <div className="flex aspect-video items-center justify-center rounded-xl bg-white">
                                            <BookOpen className="h-8 w-8 text-[var(--ce-accent)]" />
                                          </div>
                                          <div className="mt-3 flex flex-1 flex-col gap-2">
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="font-semibold text-[var(--ce-primary)]">{lec.title}</div>
                                              <VisibilityToggle
                                                visible={lec.isVisible}
                                                onToggle={() => toggleLectureVisibility(lec)}
                                                title={lec.isVisible === false ? t('content.showItem') : t('content.hideItem')}
                                              />
                                            </div>
                                            {lec.description && <p className="line-clamp-2 text-xs text-[var(--ce-muted)]">{lec.description}</p>}
                                            <div className="mt-auto flex flex-wrap gap-1 pt-2">
                                              <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => setLectureModal({ values: { ...lec, isVisible: lec.isVisible !== false } })}>{t('content.edit')}</button>
                                              <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => moveItem('lecture', lectures, i, -1)}>↑</button>
                                              <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => moveItem('lecture', lectures, i, 1)}>↓</button>
                                              <button type="button" className="ce-btn ce-btn-ghost text-xs text-red-700" onClick={() => setConfirm({ type: 'lecture', id: lec._id })}>{t('content.delete')}</button>
                                            </div>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}
                            </li>
                          );})}
                          {!(mod.lessons || []).length && (
                            <li className="px-4 py-4 text-sm text-[var(--ce-muted)]">{t('content.noLessons')}</li>
                          )}
                        </ul>
                        )}
                      </div>
                    );})
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <FormModal
        open={!!subjectModal}
        onClose={() => setSubjectModal(null)}
        title={subjectModal?.id ? t('content.editSubject') : t('content.addSubject')}
        initialValues={subjectModal?.values || emptySubject}
        validate={(values) => (!values.name?.trim() ? { name: t('content.errors.nameRequired') } : {})}
        onSubmit={saveSubject}
      >
        {({ values, setValues, errors }) => (
          <div className="space-y-4">
            <FormField label={t('content.subjectName')} required error={errors.name}>
              <input className="ce-input" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
            </FormField>
            <FormField label={t('auth.gradeLevel')}>
              <select className="ce-input" value={values.gradeLevel} onChange={(e) => setValues({ ...values, gradeLevel: e.target.value })}>
                <option value="grade_10">Grade 10</option>
                <option value="grade_11">Grade 11</option>
                <option value="grade_12">Grade 12</option>
                <option value="general">{t('academy.filters.programming')}</option>
              </select>
            </FormField>
            <FormField label={t('content.description')}>
              <textarea className="ce-input min-h-[90px]" value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} />
            </FormField>
          </div>
        )}
      </FormModal>

      <FormModal
        open={unitModal}
        onClose={() => setUnitModal(false)}
        title={t('content.addUnit')}
        initialValues={emptyUnit}
        validate={(values) => (!values.title?.trim() ? { title: t('content.errors.unitRequired') } : {})}
        onSubmit={addUnit}
      >
        {({ values, setValues, errors }) => (
          <FormField label={t('content.unitName')} required error={errors.title}>
            <input className="ce-input" value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} />
          </FormField>
        )}
      </FormModal>

      <FormModal
        open={!!lessonModal}
        onClose={() => setLessonModal(null)}
        title={t('content.addLesson')}
        initialValues={emptyLesson}
        validate={(values) => (!values.title?.trim() ? { title: t('content.errors.lessonRequired') } : {})}
        onSubmit={(values) => addLesson(values, lessonModal.moduleId)}
      >
        {({ values, setValues, errors }) => (
          <FormField label={t('content.lessonName')} required error={errors.title}>
            <input className="ce-input" value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} />
          </FormField>
        )}
      </FormModal>

      <FormModal
        open={!!lectureModal}
        onClose={() => setLectureModal(null)}
        title={lectureModal?.values?._id ? t('content.editLecture') : t('content.addLecture')}
        initialValues={lectureModal?.values || emptyLecture}
        validate={(values) => (!values.title?.trim() ? { title: t('content.errors.lectureRequired') } : {})}
        onSubmit={saveLecture}
      >
        {({ values, setValues, errors }) => (
          <div className="space-y-4">
            <FormField label={t('content.lectureTitle')} required error={errors.title}>
              <input className="ce-input" value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} />
            </FormField>
            <FormField label={t('content.videoUrl')} helper={t('content.videoUrlHint')}>
              <input className="ce-input" value={values.videoUrl} onChange={(e) => setValues({ ...values, videoUrl: e.target.value })} />
            </FormField>
            <FormField label={t('content.description')}>
              <textarea className="ce-input min-h-[90px]" value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} />
            </FormField>
          </div>
        )}
      </FormModal>

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
