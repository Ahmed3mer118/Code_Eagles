import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BookOpen,
  ChevronDown,
  ClipboardList,
  Layers,
  PlayCircle,
  Trophy,
  Video,
} from 'lucide-react';
import { contentApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import SearchInput, { filterByQuery } from '../../shared/ui/SearchInput';
import StatusBadge from '../../shared/ui/StatusBadge';
import LecturePlayerModal from '../../shared/ui/LecturePlayerModal';
import resolveMediaUrl from '../../shared/utils/mediaUrl';
import getApiErrorMessage from '../../shared/utils/apiError';
import StudentWaitingView from './StudentWaitingView';
import ListPagination from '../../shared/ui/ListPagination';

const SUBJECTS_PER_PAGE = 5;

function flattenSubject(subject) {
  const modules = (subject.courses || []).flatMap((c) => c.modules || []);
  const lessons = modules.flatMap((m) => m.lessons || []);
  const lectures = lessons.flatMap((l) => l.lectures || []);
  return { modules, lessons, lectures };
}

function hasPlayableVideo(lecture) {
  return Boolean(resolveMediaUrl(lecture.videoUrl || lecture.videoFileUrl));
}

function WatchButton({ lecture, t, onWatch }) {
  if (!hasPlayableVideo(lecture)) {
    return (
      <span className="text-xs text-[var(--ce-muted)]">{t('student.lectureNoVideo')}</span>
    );
  }
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--ce-primary)] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
      onClick={() => onWatch(lecture)}
    >
      <PlayCircle className="h-3.5 w-3.5" />
      {t('student.watch')}
    </button>
  );
}

export default function StudentCoursesPage() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: SUBJECTS_PER_PAGE });
  const [expanded, setExpanded] = useState(null);
  const [expandedUnits, setExpandedUnits] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});
  const [subjectTab, setSubjectTab] = useState({});
  const [playerLecture, setPlayerLecture] = useState(null);

  const load = async (nextPage = page) => {
    try {
      const res = await contentApi.myLearning({ page: nextPage, limit: SUBJECTS_PER_PAGE });
      setData(res);
      setPagination(res.pagination || { page: nextPage, pages: 1, total: 0, limit: SUBJECTS_PER_PAGE });
      if (res.subjects?.length === 1 && nextPage === 1) {
        setExpanded(res.subjects[0]._id);
        setSubjectTab({ [res.subjects[0]._id]: 'lectures' });
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  useEffect(() => { load(page); }, [page]);

  const subjects = useMemo(
    () => filterByQuery(data?.subjects || [], search, ['name']),
    [data?.subjects, search]
  );

  if (!data) return <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>;

  const pending = data.pendingEnrollments || [];
  const activeEnrollments = data.enrollments || [];

  const setTab = (subjectId, tab) => {
    setSubjectTab((prev) => ({ ...prev, [subjectId]: tab }));
  };

  const toggleUnit = (moduleId) => {
    setExpandedUnits((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessons((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  return (
    <StudentWaitingView>
      <div className="space-y-6">
        <PageHeader title={t('dashboard.myCourses')} subtitle={t('student.myLearningHint')} />

        {pending.length > 0 && (
          <div className="ce-card border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5">
            <h3 className="font-extrabold text-amber-900">{t('student.pendingBanner')}</h3>
            <ul className="mt-3 space-y-2">
              {pending.map((en) => (
                <li key={en._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/70 px-4 py-3 text-sm text-amber-900">
                  <span>
                    <strong>{en.groupId?.name}</strong>
                    {' · '}
                    {en.groupId?.subjectId?.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status="pending" label={t('student.status.pending')} />
                    {en.amountDue > 0 && (
                      <Link
                        to={`/dashboard/student/payments?enrollment=${en._id}`}
                        className="ce-btn ce-btn-accent text-xs"
                      >
                        {t('payments.payNow')}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeEnrollments.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {activeEnrollments.map((en) => (
              <div key={en._id} className="ce-card flex items-start gap-3 p-4">
                <div className="rounded-xl bg-[var(--ce-primary)]/10 p-2.5 text-[var(--ce-primary)]">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-[var(--ce-muted)]">
                    {en.groupId?.subjectId?.name || t('dashboard.subjects')}
                  </p>
                  <p className="mt-0.5 font-extrabold text-[var(--ce-primary)]">{en.groupId?.name}</p>
                  <StatusBadge status="approved" label={t('student.status.active')} />
                </div>
              </div>
            ))}
          </div>
        )}

        <SearchInput value={search} onChange={setSearch} placeholder={t('student.searchSubjects')} />

        {subjects.length === 0 ? (
          <div className="ce-card p-10 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-[var(--ce-muted)]/40" />
            <p className="mt-4 text-[var(--ce-muted)]">
              {activeEnrollments.length
                ? t('exams.noPublishedContent')
                : pending.length
                  ? t('student.contentLocked')
                  : t('student.noCourses')}
            </p>
            <Link to="/dashboard/student/join" className="ce-btn ce-btn-accent mt-5 inline-flex">
              {t('student.joinGroup')}
            </Link>
          </div>
        ) : (
          subjects.map((subject) => {
            const { modules, lectures } = flattenSubject(subject);
            const tab = subjectTab[subject._id] || 'lectures';
            const isOpen = expanded === subject._id;

            return (
              <div key={subject._id} className="ce-card overflow-hidden">
                <button
                  type="button"
                  className="flex w-full items-center gap-4 px-5 py-4 text-start transition hover:bg-[var(--ce-bg)]/50"
                  onClick={() => setExpanded(isOpen ? null : subject._id)}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--ce-primary)]/10 text-[var(--ce-primary)]">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{subject.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs font-semibold text-[var(--ce-muted)]">
                      <span>{t('student.unitsCount', { count: modules.length })}</span>
                      <span>{t('student.lecturesCount', { count: lectures.length })}</span>
                      <span>{t('student.quizzesCount', { count: (subject.quizzes || []).length })}</span>
                      <span>{t('student.assignmentsCount', { count: (subject.assignments || []).length })}</span>
                    </div>
                  </div>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-[var(--ce-muted)] transition ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="border-t border-[var(--ce-border)] bg-[var(--ce-bg)]/30 px-5 py-5">
                    <div className="mb-4 flex flex-wrap gap-2">
                      {['lectures', 'assignments', 'quizzes'].map((key) => (
                        <button
                          key={key}
                          type="button"
                          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition ${
                            tab === key
                              ? 'bg-[var(--ce-primary)] text-white shadow-sm'
                              : 'bg-white text-[var(--ce-primary)] ring-1 ring-[var(--ce-border)]'
                          }`}
                          onClick={() => setTab(subject._id, key)}
                        >
                          {key === 'lectures' && <Video className="h-4 w-4" />}
                          {key === 'assignments' && <ClipboardList className="h-4 w-4" />}
                          {key === 'quizzes' && <Trophy className="h-4 w-4" />}
                          {t(`student.tab.${key}`)}
                        </button>
                      ))}
                    </div>

                    {tab === 'lectures' && (
                      <div className="space-y-4">
                        {modules.length === 0 ? (
                          <p className="rounded-xl bg-white p-6 text-center text-sm text-[var(--ce-muted)]">
                            {t('student.noLectures')}
                          </p>
                        ) : (
                          modules.map((mod, modIndex) => {
                            const unitOpen = expandedUnits[mod._id] ?? modIndex === 0;
                            return (
                            <section key={mod._id} className="overflow-hidden rounded-2xl border border-[var(--ce-border)] bg-white">
                              <button
                                type="button"
                                className="flex w-full items-center gap-3 border-b border-[var(--ce-border)] bg-[var(--ce-primary)]/5 px-4 py-3 text-start"
                                onClick={() => toggleUnit(mod._id)}
                              >
                                <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--ce-muted)] transition ${unitOpen ? 'rotate-180' : ''}`} />
                                <Layers className="h-4 w-4 shrink-0 text-[var(--ce-accent)]" />
                                <h4 className="min-w-0 flex-1 font-extrabold text-[var(--ce-primary)]">
                                  {t('student.unitNumber', { n: modIndex + 1 })}
                                  {' — '}
                                  {mod.title}
                                </h4>
                                <span className="text-xs font-semibold text-[var(--ce-muted)]">
                                  {(mod.lessons || []).length} {t('content.lessons')}
                                </span>
                              </button>
                              {unitOpen && (
                              <div className="divide-y divide-[var(--ce-border)]">
                                {(mod.lessons || []).map((lesson, lessonIndex) => {
                                  const lessonOpen = expandedLessons[lesson._id] ?? lessonIndex === 0;
                                  return (
                                  <div key={lesson._id}>
                                    <button
                                      type="button"
                                      className="flex w-full items-center gap-3 px-4 py-3 text-start hover:bg-[var(--ce-bg)]/40"
                                      onClick={() => toggleLesson(lesson._id)}
                                    >
                                      <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--ce-muted)] transition ${lessonOpen ? 'rotate-180' : ''}`} />
                                      <BookOpen className="h-4 w-4 shrink-0 text-[var(--ce-primary)]" />
                                      <p className="min-w-0 flex-1 text-sm font-bold text-[var(--ce-primary)]">
                                        {t('student.lessonNumber', { n: lessonIndex + 1 })}
                                        {' — '}
                                        {lesson.title}
                                      </p>
                                    </button>
                                    {lessonOpen && (
                                    <div className="border-t border-[var(--ce-border)] bg-[var(--ce-bg)]/20 px-4 py-3">
                                      {(lesson.lectures || []).length > 0 ? (
                                        <ul className="space-y-2">
                                          {lesson.lectures.map((lecture) => (
                                            <li
                                              key={lecture._id}
                                              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2.5 shadow-sm"
                                            >
                                              <div className="min-w-0">
                                                <p className="text-sm font-semibold">{lecture.title}</p>
                                                {lecture.description && (
                                                  <p className="mt-0.5 line-clamp-2 text-xs text-[var(--ce-muted)]">
                                                    {lecture.description}
                                                  </p>
                                                )}
                                              </div>
                                              <WatchButton lecture={lecture} t={t} onWatch={setPlayerLecture} />
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p className="text-xs text-[var(--ce-muted)]">{t('student.noLecturesInLesson')}</p>
                                      )}
                                    </div>
                                    )}
                                  </div>
                                );})}
                                {!(mod.lessons || []).length && (
                                  <p className="px-4 py-3 text-xs text-[var(--ce-muted)]">{t('student.noLessonsInUnit')}</p>
                                )}
                              </div>
                              )}
                            </section>
                          );})
                        )}
                      </div>
                    )}

                    {tab === 'assignments' && (
                      <div>
                        {(subject.assignments || []).length ? (
                          <ul className="space-y-2">
                            {subject.assignments.map((a) => (
                              <li
                                key={a._id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--ce-border)] bg-white p-4"
                              >
                                <div>
                                  <p className="font-bold text-[var(--ce-primary)]">{a.title}</p>
                                  {a.dueDate && (
                                    <p className="mt-1 text-xs text-[var(--ce-muted)]">
                                      {t('assignments.dueDate')}: {new Date(a.dueDate).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                <Link to="/dashboard/student/assignments" className="ce-btn ce-btn-accent text-sm">
                                  {t('student.viewAssignment')}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="rounded-xl bg-white p-6 text-center text-sm text-[var(--ce-muted)]">
                            {t('student.noAssignments')}
                          </p>
                        )}
                      </div>
                    )}

                    {tab === 'quizzes' && (
                      <div>
                        {(subject.quizzes || []).length ? (
                          <ul className="space-y-2">
                            {subject.quizzes.map((q) => (
                              <li
                                key={q._id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--ce-border)] bg-white p-4"
                              >
                                <p className="font-bold text-[var(--ce-primary)]">{q.title}</p>
                                <Link to={`/dashboard/student/quizzes/${q._id}`} className="ce-btn ce-btn-accent text-sm">
                                  {t('student.startQuiz')}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="rounded-xl bg-white p-6 text-center text-sm text-[var(--ce-muted)]">
                            {t('student.noQuizzes')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        <ListPagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          onPageChange={setPage}
        />

        <LecturePlayerModal
          lecture={playerLecture}
          open={!!playerLecture}
          onClose={() => setPlayerLecture(null)}
        />
      </div>
    </StudentWaitingView>
  );
}
