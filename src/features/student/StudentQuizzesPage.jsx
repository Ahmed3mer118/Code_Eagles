import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { History, PlayCircle } from 'lucide-react';
import { quizApi } from '../../shared/api/platformApi';
import StudentWaitingView from './StudentWaitingView';
import SearchInput, { filterByQuery } from '../../shared/ui/SearchInput';
import StatusBadge from '../../shared/ui/StatusBadge';
import PageHeader from '../../shared/ui/PageHeader';
import { getAvailabilityLabel, canStartExam } from '../exams/utils/examHelpers';

export default function StudentQuizzesPage() {
  const { t } = useTranslation();
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState('');
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await quizApi.list();
        setQuizzes(data.quizzes || []);
        setLocked(Boolean(data.message));
      } catch (err) {
        toast.error(err?.message || t('common.error'));
      }
    })();
  }, [t]);

  const filtered = filterByQuery(quizzes, search, ['title']);

  return (
    <StudentWaitingView>
      <div className="space-y-6">
        <PageHeader
          title={t('dashboard.quizzes')}
          subtitle={t('exams.studentSubtitle')}
          actions={(
            <Link to="/dashboard/student/quizzes/history" className="ce-btn ce-btn-ghost text-sm">
              <History className="h-4 w-4" />
              {t('exams.historyTitle')}
            </Link>
          )}
        />

        {locked && (
          <div className="ce-card border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {t('student.quizzesLocked')}
          </div>
        )}

        <SearchInput value={search} onChange={setSearch} placeholder={t('exams.searchExams')} />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((quiz) => {
            const canStart = canStartExam(quiz);
            const actionLabel = quiz.hasInProgress
              ? t('exams.resumeExam')
              : canStart
                ? t('exams.openExam')
                : t('exams.viewDetails');

            return (
              <article key={quiz._id} className="ce-card ce-card-hover flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{quiz.title}</h3>
                    <p className="mt-1 text-sm text-[var(--ce-muted)]">
                      {quiz.durationMinutes} {t('quizzes.minutes')} · {quiz.questions?.length || 0} {t('exams.totalQuestions')}
                    </p>
                  </div>
                  <StatusBadge
                    status={canStart || quiz.hasInProgress ? 'approved' : 'pending'}
                    label={getAvailabilityLabel(quiz, t)}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-[var(--ce-muted)]">
                  <div className="rounded-xl bg-[var(--ce-bg)] p-3">
                    <p>{t('exams.attemptsUsed')}</p>
                    <p className="mt-1 text-base font-extrabold text-[var(--ce-primary)]">
                      {quiz.attemptsUsed} / {quiz.maxAttempts || 3}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[var(--ce-bg)] p-3">
                    <p>{t('exams.attemptsRemaining')}</p>
                    <p className="mt-1 text-base font-extrabold text-[var(--ce-primary)]">
                      {quiz.attemptsRemaining}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/dashboard/student/quizzes/${quiz._id}`}
                  className={`ce-btn mt-auto text-sm ${canStart || quiz.hasInProgress ? 'ce-btn-accent' : 'ce-btn-ghost'}`}
                >
                  <PlayCircle className="h-4 w-4" />
                  {actionLabel}
                </Link>
              </article>
            );
          })}
        </div>

        {!filtered.length && (
          <div className="ce-card p-8 text-center text-[var(--ce-muted)]">{t('exams.noExams')}</div>
        )}
      </div>
    </StudentWaitingView>
  );
}
