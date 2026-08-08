import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { contentApi } from '../../shared/api/platformApi';
import SearchInput, { filterByQuery } from '../../shared/ui/SearchInput';
import StatusBadge from '../../shared/ui/StatusBadge';

import StudentWaitingView from './StudentWaitingView';

export default function StudentCoursesPage() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    try {
      const res = await contentApi.myLearning();
      setData(res);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  useEffect(() => { load(); }, [t]);

  if (!data) return <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>;

  const subjects = filterByQuery(data.subjects || [], search, ['name']);
  const pending = data.pendingEnrollments || [];
  const activeEnrollments = data.enrollments || [];

  return (
    <StudentWaitingView>
    <div className="space-y-6">
      {pending.length > 0 && (
        <div className="ce-card border-amber-200 bg-amber-50 p-6">
          <h3 className="font-bold text-amber-900">{t('student.pendingBanner')}</h3>
          <ul className="mt-3 space-y-2">
            {pending.map((en) => (
              <li key={en._id} className="text-sm text-amber-900">
                {en.groupId?.name} — {en.groupId?.subjectId?.name} — {t('student.status.pending')}
                {en.amountDue > 0 && ` · ${t('student.expectedAmount')}: ${en.amountDue} ${t('academy.currency')}`}
              </li>
            ))}
          </ul>
          <Link to="/dashboard/student/join" className="ce-btn ce-btn-ghost mt-4 text-sm">{t('student.viewRequests')}</Link>
        </div>
      )}

      {activeEnrollments.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {activeEnrollments.map((en) => (
            <div key={en._id} className="ce-card p-4">
              <p className="text-xs font-bold uppercase text-[var(--ce-muted)]">{en.groupId?.subjectId?.name || t('dashboard.subjects')}</p>
              <p className="mt-1 font-extrabold text-[var(--ce-primary)]">{en.groupId?.name}</p>
              <StatusBadge status="approved" label={t('student.status.active')} />
            </div>
          ))}
        </div>
      )}

      <SearchInput value={search} onChange={setSearch} />

      {subjects.length === 0 ? (
        <div className="ce-card p-6 text-center">
          <p className="text-[var(--ce-muted)]">
            {activeEnrollments.length
              ? t('exams.noPublishedContent')
              : pending.length
                ? t('student.contentLocked')
                : t('student.noCourses')}
          </p>
          <Link to="/dashboard/student/join" className="ce-btn ce-btn-accent mt-4 inline-flex">{t('student.joinGroup')}</Link>
        </div>
      ) : (
        subjects.map((subject) => (
          <div key={subject._id} className="ce-card overflow-hidden">
            <button
              type="button"
              className="flex w-full items-center justify-between px-6 py-4 text-start"
              onClick={() => setExpanded(expanded === subject._id ? null : subject._id)}
            >
              <div>
                <div className="font-extrabold text-[var(--ce-primary)]">{subject.name}</div>
                <div className="text-sm text-[var(--ce-muted)]">{subject.courses?.length || 0} {t('student.courses')}</div>
              </div>
              <span>{expanded === subject._id ? '−' : '+'}</span>
            </button>

            {expanded === subject._id && (
              <div className="border-t border-[var(--ce-border)] px-6 py-4 space-y-4">
                {(subject.courses || []).map((course) => (
                  <div key={course._id}>
                    <h4 className="font-bold">{course.title}</h4>
                    {(course.modules || []).map((mod) => (
                      <div key={mod._id} className="mt-3 ms-4">
                        <div className="font-semibold text-[var(--ce-primary)]">{mod.title}</div>
                        <ul className="mt-2 space-y-1">
                          {(mod.lessons || []).map((lesson) => (
                            <li key={lesson._id} className="text-sm text-[var(--ce-muted)]">
                              ▶ {lesson.title}
                              {lesson.videoUrl && (
                                <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="ms-2 text-[var(--ce-primary)] underline">
                                  {t('student.watch')}
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
                {(subject.quizzes || []).length > 0 && (
                  <div>
                    <h4 className="font-bold">{t('dashboard.quizzes')}</h4>
                    <ul className="mt-2 space-y-1">
                      {subject.quizzes.map((q) => (
                        <li key={q._id} className="text-sm">📝 {q.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
    </StudentWaitingView>
  );
}
