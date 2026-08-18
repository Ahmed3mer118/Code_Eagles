import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { quizApi, contentApi, groupApi, uploadApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import ConfirmDialog from '../../shared/ui/ConfirmDialog';
import FormModal from '../../shared/ui/FormModal';
import FormField, { getFriendlyError } from '../../shared/ui/FormField';
import SearchInput, { filterByQuery } from '../../shared/ui/SearchInput';
import StatusBadge from '../../shared/ui/StatusBadge';
import GroupCheckboxList from '../../shared/ui/GroupCheckboxList';
import Modal from '../../shared/ui/Modal';
import EmptyState from '../../shared/ui/EmptyState';
import { Link } from 'react-router-dom';

const emptyQuestion = () => ({
  type: 'mcq',
  text: '',
  points: 1,
  difficulty: 'medium',
  tags: [],
  options: ['', '', '', ''],
  correctIndex: 0,
  correctBoolean: true,
  correctText: '',
  explanation: '',
  hint: '',
  imageUrl: '',
  attachmentUrl: '',
});

const defaultForm = {
  title: '',
  subjectId: '',
  moduleId: '',
  lessonId: '',
  groupIds: [],
  description: '',
  instructions: '',
  coverImageUrl: '',
  durationMinutes: 30,
  passingGrade: 50,
  passingMarks: null,
  maxAttempts: 3,
  shuffleQuestions: false,
  shuffleAnswers: false,
  oneQuestionPerPage: true,
  allowBackNavigation: true,
  autoSaveEnabled: true,
  negativeMarking: false,
  negativeMarkValue: 0,
  startDate: '',
  endDate: '',
  timezone: 'Africa/Cairo',
  resultMode: 'immediate',
  resultPublishAt: '',
  hideMarksShowPassFail: false,
  questions: [emptyQuestion()],
  status: 'draft',
};

function normalizeQuizForm(quiz) {
  if (!quiz) return { ...defaultForm, questions: [emptyQuestion()] };
  return {
    ...defaultForm,
    ...quiz,
    subjectId: quiz.subjectId?._id || quiz.subjectId || '',
    moduleId: quiz.moduleId?._id || quiz.moduleId || '',
    lessonId: quiz.lessonId?._id || quiz.lessonId || '',
    groupIds: (quiz.groupIds || []).map((g) => g?._id || g),
    startDate: quiz.startDate ? quiz.startDate.slice(0, 16) : '',
    endDate: quiz.endDate ? quiz.endDate.slice(0, 16) : '',
    resultPublishAt: quiz.resultPublishAt ? quiz.resultPublishAt.slice(0, 16) : '',
    questions: (quiz.questions?.length ? quiz.questions : [emptyQuestion()]).map((q) => ({
      ...emptyQuestion(),
      ...q,
      options: [...(q.options || ['', '', '', '']), '', '', '', ''].slice(0, 4),
    })),
  };
}

function validateQuiz(values, t) {
  const errors = {};
  if (!values.title?.trim()) errors.title = t('quizzes.errors.titleRequired');
  if (!values.subjectId) errors.subject = t('quizzes.errors.subjectRequired');
  if (!values.moduleId) errors.module = t('quizzes.errors.moduleRequired');
  if (!values.durationMinutes || values.durationMinutes < 1) errors.duration = t('quizzes.errors.durationRequired');
  values.questions?.forEach((q, i) => {
    if (!q.text?.trim()) errors[`q${i}`] = t('quizzes.errors.questionRequired', { n: i + 1 });
    if (q.type === 'mcq' && (q.correctIndex === null || q.correctIndex === undefined)) {
      errors[`q${i}c`] = t('quizzes.errors.correctRequired', { n: i + 1 });
    }
  });
  return errors;
}

function QuizFormFields({ values, setValues, errors, subjects, groups, t }) {
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

  const updateQuestion = (index, patch) => {
    setValues({
      ...values,
      questions: values.questions.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    });
  };

  const addQuestion = () => setValues({ ...values, questions: [...values.questions, emptyQuestion()] });

  const removeQuestion = (index) => {
    if (values.questions.length <= 1) return;
    setValues({ ...values, questions: values.questions.filter((_, i) => i !== index) });
  };

  const uploadQuestionImage = async (index, file) => {
    if (!file) return;
    try {
      const data = await uploadApi.uploadImage(file);
      updateQuestion(index, { imageUrl: data.url });
      toast.success(t('quizzes.imageUploaded'));
    } catch (err) {
      toast.error(getFriendlyError(err));
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label={t('quizzes.title')} required error={errors.title}>
          <input className="ce-input" value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} />
        </FormField>
        <FormField label={t('content.subjectName')} required error={errors.subject}>
          <select
            className="ce-input"
            value={values.subjectId}
            onChange={(e) => setValues({ ...values, subjectId: e.target.value, moduleId: '', lessonId: '' })}
          >
            <option value="">{t('content.subjectName')}</option>
            {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </FormField>
      </div>

      <p className="text-sm text-[var(--ce-muted)]">{t('quizzes.linkHint')}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label={t('content.unitName')} required error={errors.module}>
          <select
            className="ce-input"
            value={values.moduleId}
            disabled={!values.subjectId || !modules.length}
            onChange={(e) => setValues({ ...values, moduleId: e.target.value, lessonId: '' })}
          >
            <option value="">{t('quizzes.selectUnit')}</option>
            {modules.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
          </select>
        </FormField>
        <FormField label={t('content.lessonName')} helper={t('quizzes.lessonOptionalHint')} error={errors.lesson}>
          <select
            className="ce-input"
            value={values.lessonId}
            disabled={!values.moduleId || !lessons.length}
            onChange={(e) => setValues({ ...values, lessonId: e.target.value })}
          >
            <option value="">{t('quizzes.unitExamNoLesson')}</option>
            {lessons.map((l) => <option key={l._id} value={l._id}>{l.title}</option>)}
          </select>
        </FormField>
      </div>

      <FormField label={t('content.description')}>
        <textarea className="ce-input min-h-[70px]" value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} />
      </FormField>

      <FormField label={t('exams.instructionsTitle')}>
        <textarea className="ce-input min-h-[90px]" value={values.instructions} onChange={(e) => setValues({ ...values, instructions: e.target.value })} />
      </FormField>

      <FormField label={t('exams.coverImage')}>
        <input className="ce-input" value={values.coverImageUrl} onChange={(e) => setValues({ ...values, coverImageUrl: e.target.value })} />
      </FormField>

      <FormField label={t('dashboard.groups')} helper={t('groups.selectHint')}>
        <GroupCheckboxList
          groups={groups}
          value={values.groupIds}
          onChange={(groupIds) => setValues({ ...values, groupIds })}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label={t('quizzes.duration')} error={errors.duration}>
          <input className="ce-input" type="number" min={1} value={values.durationMinutes} onChange={(e) => setValues({ ...values, durationMinutes: Number(e.target.value) })} />
        </FormField>
        <FormField label={t('quizzes.passingGrade')}>
          <input className="ce-input" type="number" min={0} max={100} value={values.passingGrade} onChange={(e) => setValues({ ...values, passingGrade: Number(e.target.value) })} />
        </FormField>
        <FormField label={t('quizzes.maxAttempts')}>
          <input className="ce-input" type="number" min={1} value={values.maxAttempts} onChange={(e) => setValues({ ...values, maxAttempts: Number(e.target.value) })} />
        </FormField>
        <FormField label={t('quizzes.resultMode')}>
          <select className="ce-input" value={values.resultMode} onChange={(e) => setValues({ ...values, resultMode: e.target.value })}>
            <option value="immediate">{t('quizzes.resultImmediate')}</option>
            <option value="teacher_review">{t('quizzes.resultTeacher')}</option>
            <option value="assistant_review">{t('quizzes.resultAssistant')}</option>
            <option value="scheduled">{t('quizzes.resultScheduled')}</option>
          </select>
        </FormField>
      </div>

      {values.resultMode === 'scheduled' && (
        <FormField label={t('quizzes.resultPublishAt')}>
          <input className="ce-input" type="datetime-local" value={values.resultPublishAt} onChange={(e) => setValues({ ...values, resultPublishAt: e.target.value })} />
        </FormField>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label={t('exams.startDate')}>
          <input className="ce-input" type="datetime-local" value={values.startDate} onChange={(e) => setValues({ ...values, startDate: e.target.value })} />
        </FormField>
        <FormField label={t('exams.endDate')}>
          <input className="ce-input" type="datetime-local" value={values.endDate} onChange={(e) => setValues({ ...values, endDate: e.target.value })} />
        </FormField>
        <FormField label={t('exams.passingMarks')}>
          <input className="ce-input" type="number" min={0} value={values.passingMarks ?? ''} onChange={(e) => setValues({ ...values, passingMarks: e.target.value ? Number(e.target.value) : null })} />
        </FormField>
        <FormField label={t('exams.timezone')}>
          <input className="ce-input" value={values.timezone} onChange={(e) => setValues({ ...values, timezone: e.target.value })} />
        </FormField>
      </div>

      <div className="flex flex-wrap gap-4 rounded-xl bg-[var(--ce-bg)] p-3">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={values.shuffleQuestions} onChange={(e) => setValues({ ...values, shuffleQuestions: e.target.checked })} />
          {t('quizzes.shuffleQuestions')}
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={values.shuffleAnswers} onChange={(e) => setValues({ ...values, shuffleAnswers: e.target.checked })} />
          {t('quizzes.shuffleAnswers')}
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={values.oneQuestionPerPage} onChange={(e) => setValues({ ...values, oneQuestionPerPage: e.target.checked })} />
          {t('exams.oneQuestionPerPage')}
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={values.allowBackNavigation} onChange={(e) => setValues({ ...values, allowBackNavigation: e.target.checked })} />
          {t('exams.allowBackNavigation')}
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={values.autoSaveEnabled} onChange={(e) => setValues({ ...values, autoSaveEnabled: e.target.checked })} />
          {t('exams.autoSaveEnabled')}
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={values.negativeMarking} onChange={(e) => setValues({ ...values, negativeMarking: e.target.checked })} />
          {t('exams.negativeMarking')}
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={values.hideMarksShowPassFail} onChange={(e) => setValues({ ...values, hideMarksShowPassFail: e.target.checked })} />
          {t('exams.hideMarksShowPassFail')}
        </label>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--ce-border)] pt-4">
        <h3 className="font-extrabold text-[var(--ce-primary)]">{t('quizzes.questions')} ({values.questions.length})</h3>
        <button type="button" className="ce-btn ce-btn-ghost text-sm" onClick={addQuestion}>{t('quizzes.addQuestion')}</button>
      </div>

      <div className="space-y-4">
        {values.questions.map((q, qi) => (
          <div key={qi} className="rounded-xl border border-[var(--ce-border)] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-[var(--ce-accent)]">{t('quizzes.question')} {qi + 1}</span>
              {values.questions.length > 1 && (
                <button type="button" className="text-xs text-[var(--ce-danger)]" onClick={() => removeQuestion(qi)}>{t('content.delete')}</button>
              )}
            </div>
            {(errors[`q${qi}`] || errors[`q${qi}c`]) && (
              <p className="mb-2 text-xs font-semibold text-[var(--ce-danger)]">{errors[`q${qi}`] || errors[`q${qi}c`]}</p>
            )}
            <div className="grid gap-3 md:grid-cols-3">
              <select className="ce-input" value={q.type} onChange={(e) => updateQuestion(qi, { type: e.target.value })}>
                <option value="mcq">{t('quizzes.typeMcq')}</option>
                <option value="true_false">{t('quizzes.typeTf')}</option>
                <option value="written">{t('quizzes.typeWritten')}</option>
              </select>
              <input className="ce-input md:col-span-2" placeholder={t('quizzes.question')} value={q.text} onChange={(e) => updateQuestion(qi, { text: e.target.value })} />
              <input className="ce-input" type="number" min={0} placeholder={t('quizzes.points')} value={q.points} onChange={(e) => updateQuestion(qi, { points: Number(e.target.value) })} />
              <select className="ce-input" value={q.difficulty || 'medium'} onChange={(e) => updateQuestion(qi, { difficulty: e.target.value })}>
                <option value="easy">{t('exams.difficulty.easy')}</option>
                <option value="medium">{t('exams.difficulty.medium')}</option>
                <option value="hard">{t('exams.difficulty.hard')}</option>
              </select>
            </div>

            {q.type === 'mcq' && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {(q.options || ['', '', '', '']).slice(0, 4).map((opt, oi) => (
                  <label key={oi} className={`flex items-center gap-2 rounded-lg border p-2 ${q.correctIndex === oi ? 'border-[var(--ce-accent)] bg-amber-50' : 'border-[var(--ce-border)]'}`}>
                    <input type="radio" name={`correct-${qi}`} checked={q.correctIndex === oi} onChange={() => updateQuestion(qi, { correctIndex: oi })} />
                    <span className="w-6 text-xs font-bold">{String.fromCharCode(65 + oi)}</span>
                    <input className="ce-input flex-1 border-0 bg-transparent p-1" value={opt} onChange={(e) => {
                      const options = [...(q.options || ['', '', '', ''])];
                      while (options.length < 4) options.push('');
                      options[oi] = e.target.value;
                      updateQuestion(qi, { options });
                    }} placeholder={t('quizzes.option')} />
                  </label>
                ))}
              </div>
            )}

            {q.type === 'true_false' && (
              <div className="mt-3 flex gap-4">
                <label className="flex items-center gap-2 rounded-lg border px-3 py-2"><input type="radio" checked={q.correctBoolean === true} onChange={() => updateQuestion(qi, { correctBoolean: true })} />{t('quizzes.true')}</label>
                <label className="flex items-center gap-2 rounded-lg border px-3 py-2"><input type="radio" checked={q.correctBoolean === false} onChange={() => updateQuestion(qi, { correctBoolean: false })} />{t('quizzes.false')}</label>
              </div>
            )}

            {q.type === 'written' && (
              <input className="ce-input mt-3" placeholder={t('quizzes.modelAnswer')} value={q.correctText} onChange={(e) => updateQuestion(qi, { correctText: e.target.value })} />
            )}

            <FormField label={t('quizzes.questionImage')} helper={t('quizzes.questionImageHint')}>
              <div className="space-y-2">
                <input type="file" accept="image/*" className="ce-input" onChange={(e) => uploadQuestionImage(qi, e.target.files?.[0])} />
                <input className="ce-input" value={q.imageUrl || ''} onChange={(e) => updateQuestion(qi, { imageUrl: e.target.value })} placeholder={t('quizzes.imageUrlPlaceholder')} />
                {q.imageUrl && <img src={q.imageUrl} alt="" className="max-h-32 rounded-lg border border-[var(--ce-border)] object-contain" />}
              </div>
            </FormField>
            <input className="ce-input mt-2" placeholder={t('quizzes.explanation')} value={q.explanation} onChange={(e) => updateQuestion(qi, { explanation: e.target.value })} />
            <input className="ce-input mt-2" placeholder={t('exams.hint')} value={q.hint || ''} onChange={(e) => updateQuestion(qi, { hint: e.target.value })} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TeacherQuizzesPage() {
  const { t } = useTranslation();
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailQuiz, setDetailQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [attemptSummary, setAttemptSummary] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formInitial, setFormInitial] = useState(defaultForm);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedAttemptIds, setSelectedAttemptIds] = useState([]);
  const [notifyParents, setNotifyParents] = useState(true);
  const [bulkPublishing, setBulkPublishing] = useState(false);

  const isPublishableAttempt = (attempt) => ['pending_review', 'submitted', 'graded'].includes(attempt.status);
  const publishableAttempts = attempts.filter(isPublishableAttempt);

  const load = async () => {
    try {
      const [q, s, g, stats] = await Promise.all([
        quizApi.list(),
        contentApi.listSubjects(),
        groupApi.list(),
        quizApi.teacherDashboard(),
      ]);
      setQuizzes(q.quizzes || []);
      setSubjects(s.subjects || []);
      setGroups(g.groups || []);
      setDashboardStats(stats.stats || null);
    } catch (err) {
      toast.error(getFriendlyError(err));
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setFormInitial({ ...defaultForm, questions: [emptyQuestion()] });
    setModalOpen(true);
  };

  const openDetail = async (quiz) => {
    setDetailQuiz(quiz);
    setDetailOpen(true);
    setDetailLoading(true);
    setSelectedAttemptIds([]);
    try {
      const data = await quizApi.listAttempts(quiz._id);
      setAttempts(data.attempts || []);
      setAttemptSummary(data.summary || null);
    } catch (err) {
      toast.error(getFriendlyError(err));
      setAttempts([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleAttemptSelection = (attemptId) => {
    setSelectedAttemptIds((prev) => (
      prev.includes(attemptId) ? prev.filter((id) => id !== attemptId) : [...prev, attemptId]
    ));
  };

  const toggleSelectAllPublishable = () => {
    const ids = publishableAttempts.map((a) => a._id);
    setSelectedAttemptIds((prev) => (prev.length === ids.length ? [] : ids));
  };

  const bulkPublish = async () => {
    if (!detailQuiz?._id || !selectedAttemptIds.length) return;
    setBulkPublishing(true);
    try {
      const data = await quizApi.bulkPublishAttempts(detailQuiz._id, {
        attemptIds: selectedAttemptIds,
        notifyParents,
      });
      toast.success(t('exams.bulkPublishSuccess', { count: data.published || selectedAttemptIds.length }));
      setSelectedAttemptIds([]);
      const refreshed = await quizApi.listAttempts(detailQuiz._id);
      setAttempts(refreshed.attempts || []);
      setAttemptSummary(refreshed.summary || null);
    } catch (err) {
      toast.error(getFriendlyError(err));
    } finally {
      setBulkPublishing(false);
    }
  };

  const openEdit = async (quiz) => {
    try {
      const data = await quizApi.getOne(quiz._id);
      setEditing(data.quiz);
      setFormInitial(normalizeQuizForm(data.quiz));
      setModalOpen(true);
    } catch (err) {
      toast.error(getFriendlyError(err));
    }
  };

  const saveQuiz = async (values) => {
    const payload = {
      ...values,
      moduleId: values.moduleId || null,
      lessonId: values.lessonId || null,
      startDate: values.startDate || null,
      endDate: values.endDate || null,
      resultPublishAt: values.resultPublishAt || null,
    };
    if (editing?._id) await quizApi.update(editing._id, payload);
    else await quizApi.create(payload);
    toast.success(t('common.success'));
    load();
  };

  const togglePublish = async (e, quiz) => {
    e.stopPropagation();
    try {
      await quizApi.update(quiz._id, { isVisible: true, status: quiz.status === 'published' ? 'draft' : 'published' });
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(getFriendlyError(err));
    }
  };

  const filtered = filterByQuery(quizzes, search, ['title']);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard.quizzes')}
        subtitle={t('quizzes.subtitle')}
        actions={<button type="button" className="ce-btn ce-btn-accent" onClick={openCreate}>{t('quizzes.add')}</button>}
      />

      <SearchInput value={search} onChange={setSearch} />

      {dashboardStats && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {[
            { label: t('exams.stats.submitted'), value: dashboardStats.submitted },
            { label: t('exams.stats.pendingReview'), value: dashboardStats.pendingReview },
            { label: t('exams.stats.averageScore'), value: `${dashboardStats.averageScore}%` },
            { label: t('exams.stats.passRate'), value: `${dashboardStats.passRate}%` },
            { label: t('exams.stats.inProgress'), value: dashboardStats.inProgress },
          ].map((item) => (
            <div key={item.label} className="ce-stat-card text-center">
              <p className="text-2xl font-extrabold text-[var(--ce-primary)]">{item.value}</p>
              <p className="text-xs font-semibold text-[var(--ce-muted)]">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon="📝" title={t('quizzes.empty')} description={t('quizzes.emptyDesc')} action={<button type="button" className="ce-btn ce-btn-accent" onClick={openCreate}>{t('quizzes.add')}</button>} />
      ) : (
        <div className="ce-card overflow-hidden">
          <ul className="divide-y divide-[var(--ce-border)]">
            {filtered.map((quiz) => (
              <li key={quiz._id}>
                <button
                  type="button"
                  className="flex w-full flex-wrap items-center justify-between gap-3 px-6 py-4 text-start transition hover:bg-[var(--ce-bg)]"
                  onClick={() => openDetail(quiz)}
                >
                  <div>
                    <div className="font-bold text-[var(--ce-primary)]">{quiz.title}</div>
                    <div className="text-sm text-[var(--ce-muted)]">
                      {quiz.subjectId?.name}
                      {quiz.moduleId?.title ? ` · ${quiz.moduleId.title}` : ''}
                      {quiz.lessonId?.title ? ` · ${quiz.lessonId.title}` : ''}
                      {' · '}
                      {quiz.questions?.length || 0} {t('quizzes.questions')} · {quiz.durationMinutes} {t('quizzes.minutes')}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <StatusBadge status={quiz.status} label={quiz.status} />
                    <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => openEdit(quiz)}>{t('content.edit')}</button>
                    <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={(e) => togglePublish(e, quiz)}>
                      {quiz.status === 'published' ? t('quizzes.unpublish') : t('quizzes.publish')}
                    </button>
                    <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => setConfirmDelete(quiz)}>{t('content.delete')}</button>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <FormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? t('quizzes.edit') : t('quizzes.add')}
        draftKey={editing ? `quiz-${editing._id}` : 'quiz-create'}
        initialValues={formInitial}
        validate={(values) => validateQuiz(values, t)}
        onSubmit={saveQuiz}
        size="xl"
      >
        {({ values, setValues, errors }) => (
          <QuizFormFields values={values} setValues={setValues} errors={errors} subjects={subjects} groups={groups} t={t} />
        )}
      </FormModal>

      <Modal
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setDetailQuiz(null); }}
        title={detailQuiz ? `${t('quizzes.resultsTitle')}: ${detailQuiz.title}` : t('quizzes.resultsTitle')}
        size="lg"
        footer={(
          <>
            <button type="button" className="ce-btn ce-btn-ghost" onClick={() => setDetailOpen(false)}>{t('common.cancel')}</button>
            {detailQuiz && (
              <button type="button" className="ce-btn ce-btn-accent" onClick={() => { setDetailOpen(false); openEdit(detailQuiz); }}>
                {t('content.edit')}
              </button>
            )}
          </>
        )}
      >
        {detailLoading ? (
          <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>
        ) : attempts.length === 0 ? (
          <EmptyState icon="📊" title={t('quizzes.noAttempts')} description={t('quizzes.noAttemptsDesc')} />
        ) : (
          <div className="space-y-4">
            {attemptSummary && (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-[var(--ce-bg)] p-4 text-center">
                  <div className="text-2xl font-extrabold text-[var(--ce-primary)]">{attemptSummary.total}</div>
                  <div className="text-xs text-[var(--ce-muted)]">{t('quizzes.attemptsCount')}</div>
                </div>
                <div className="rounded-xl bg-[var(--ce-bg)] p-4 text-center">
                  <div className="text-2xl font-extrabold text-emerald-600">{attemptSummary.passed}</div>
                  <div className="text-xs text-[var(--ce-muted)]">{t('quizzes.passedCount')}</div>
                </div>
                <div className="rounded-xl bg-[var(--ce-bg)] p-4 text-center">
                  <div className="text-2xl font-extrabold text-[var(--ce-accent)]">{attemptSummary.average}%</div>
                  <div className="text-xs text-[var(--ce-muted)]">{t('quizzes.averageScore')}</div>
                </div>
              </div>
            )}
            <div className="overflow-x-auto rounded-xl border border-[var(--ce-border)]">
              {publishableAttempts.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ce-border)] bg-[var(--ce-bg)] px-4 py-3">
                  <label className="inline-flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={selectedAttemptIds.length === publishableAttempts.length && publishableAttempts.length > 0}
                      onChange={toggleSelectAllPublishable}
                    />
                    {t('exams.selectAllPublishable')}
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={notifyParents}
                      onChange={(e) => setNotifyParents(e.target.checked)}
                    />
                    {t('exams.notifyParents')}
                  </label>
                  <button
                    type="button"
                    className="ce-btn ce-btn-accent text-sm"
                    disabled={!selectedAttemptIds.length || bulkPublishing}
                    onClick={bulkPublish}
                  >
                    {bulkPublishing ? t('common.loading') : t('exams.bulkPublishResults', { count: selectedAttemptIds.length })}
                  </button>
                </div>
              )}
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-[var(--ce-bg)] text-start">
                  <tr>
                    <th className="px-4 py-3 font-bold">{t('exams.select')}</th>
                    <th className="px-4 py-3 font-bold">{t('dashboard.students')}</th>
                    <th className="px-4 py-3 font-bold">{t('quizzes.score')}</th>
                    <th className="px-4 py-3 font-bold">{t('quizzes.attempt')}</th>
                    <th className="px-4 py-3 font-bold">{t('exams.status')}</th>
                    <th className="px-4 py-3 font-bold">{t('requests.requestDate')}</th>
                    <th className="px-4 py-3 font-bold">{t('exams.review')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ce-border)]">
                  {attempts.map((a) => (
                    <tr key={a._id}>
                      <td className="px-4 py-3">
                        {isPublishableAttempt(a) ? (
                          <input
                            type="checkbox"
                            checked={selectedAttemptIds.includes(a._id)}
                            onChange={() => toggleAttemptSelection(a._id)}
                            aria-label={a.studentId?.name}
                          />
                        ) : (
                          <span className="text-[var(--ce-muted)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{a.studentId?.name}</div>
                        <div className="text-xs text-[var(--ce-muted)]">{a.studentId?.email}</div>
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {a.score != null ? `${a.score}/${a.maxScore}` : '—'}
                        {a.percentage != null && (
                          <span className="ms-1 text-[var(--ce-muted)]">({a.percentage}%)</span>
                        )}
                      </td>
                      <td className="px-4 py-3">#{a.attemptNumber}</td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={a.status === 'published' ? 'approved' : 'pending'}
                          label={t(`exams.attemptStatus.${a.status}`, a.status)}
                        />
                      </td>
                      <td className="px-4 py-3 text-[var(--ce-muted)]">
                        {new Date(a.submittedAt || a.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {(a.status === 'pending_review' || a.status === 'submitted') && detailQuiz?._id && (
                          <Link
                            to={`/dashboard/teacher/quizzes/${detailQuiz._id}/review/${a._id}`}
                            className="font-semibold text-[var(--ce-primary)]"
                          >
                            {t('exams.review')}
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title={t('quizzes.confirmDelete')}
        message={t('quizzes.confirmDeleteDesc')}
        confirmLabel={t('content.delete')}
        cancelLabel={t('common.cancel')}
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          try {
            await quizApi.remove(confirmDelete._id);
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
