import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ArrowLeft, BookOpen, Calendar, CheckCircle2, Clock, Target, Users } from 'lucide-react';
import { quizApi } from '../../../shared/api/platformApi';
import LoadingScreen from '../../../shared/ui/LoadingScreen';
import StudentWaitingView from '../../student/StudentWaitingView';
import ExamStatCard from '../components/ExamStatCard';
import { formatDateTime, getAvailabilityLabel, getResultModeLabel, canStartExam, getExamInstructions } from '../utils/examHelpers';

export default function ExamPreFlightPage() {
  const { quizId } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [understood, setUnderstood] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await quizApi.examInfo(quizId);
        setExam(data.exam);
      } catch (err) {
        toast.error(err?.response?.data?.message || err?.message || t('common.error'));
        navigate('/dashboard/student/quizzes');
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId, navigate, t]);

  const handleStart = async () => {
    if (!understood) {
      toast.error(t('exams.mustAcceptInstructions'));
      return;
    }
    setStarting(true);
    try {
      const data = await quizApi.start(quizId);
      navigate(`/dashboard/student/quizzes/${quizId}/attempt/${data.attempt._id}`, {
        state: { session: data },
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    } finally {
      setStarting(false);
    }
  };

  const resumeAttempt = () => {
    if (exam?.inProgressAttemptId) {
      navigate(`/dashboard/student/quizzes/${quizId}/attempt/${exam.inProgressAttemptId}`);
    }
  };

  if (loading) return <LoadingScreen />;

  const canStart = canStartExam(exam);
  const attemptsExhausted = !exam?.hasInProgress && (exam?.attemptsRemaining ?? 0) <= 0;

  return (
    <StudentWaitingView>
      <div className="mx-auto max-w-4xl space-y-6">
        <Link to="/dashboard/student/quizzes" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ce-muted)]">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>

        <div className="ce-card overflow-hidden">
          {exam?.coverImageUrl && (
            <img src={exam.coverImageUrl} alt="" className="h-40 w-full object-cover" />
          )}
          <div className="p-6 sm:p-8">
            <span className="ce-eyebrow">{t('exams.preExam')}</span>
            <h1 className="mt-3 text-3xl font-extrabold text-[var(--ce-primary)]">{exam?.title}</h1>
            {exam?.description && (
              <p className="mt-3 text-[var(--ce-muted)]">{exam.description}</p>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ExamStatCard label={t('exams.subject')} value={exam?.subject?.name || '—'} />
              <ExamStatCard label={t('exams.lesson')} value={exam?.lesson?.title || exam?.module?.title || '—'} />
              <ExamStatCard label={t('exams.totalQuestions')} value={exam?.totalQuestions} />
              <ExamStatCard label={t('exams.totalMarks')} value={exam?.totalMarks} />
              <ExamStatCard label={t('exams.passingMarks')} value={`${exam?.passingMarks} (${exam?.passingGrade}%)`} />
              <ExamStatCard label={t('exams.duration')} value={`${exam?.durationMinutes} ${t('quizzes.minutes')}`} />
              <ExamStatCard
                label={t('exams.attemptsUsed')}
                value={`${exam?.attemptsUsed} / ${exam?.maxAttempts}`}
                hint={`${t('exams.attemptsRemaining')}: ${exam?.attemptsRemaining}`}
              />
              <ExamStatCard label={t('exams.startDate')} value={formatDateTime(exam?.startDate, i18n.language)} />
              <ExamStatCard label={t('exams.endDate')} value={formatDateTime(exam?.endDate, i18n.language)} />
              <ExamStatCard label={t('exams.status')} value={getAvailabilityLabel(exam, t)} />
              <ExamStatCard label={t('exams.resultStatus')} value={getResultModeLabel(exam, t)} />
            </div>
          </div>
        </div>

        <div className="ce-card p-6">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-[var(--ce-primary)]">
            <BookOpen className="h-5 w-5 text-[var(--ce-accent)]" />
            {t('exams.instructionsTitle')}
          </h2>
          <div className="mt-4 space-y-3 whitespace-pre-line text-sm leading-relaxed text-[var(--ce-muted)]">
            <p>{getExamInstructions(exam, i18n.language?.startsWith('en') ? 'en' : 'ar')}</p>
          </div>

          {attemptsExhausted ? (
            <div className="mt-6 space-y-4">
              <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                {t('exams.availability.max_attempts')}
              </p>
              {(exam?.attemptsUsed ?? 0) > 0 && (
                <Link to="/dashboard/student/quizzes/history" className="ce-btn ce-btn-accent inline-flex">
                  {t('exams.viewResult')}
                </Link>
              )}
            </div>
          ) : (
            <>
              <label className="mt-6 flex items-start gap-3 rounded-2xl bg-[var(--ce-bg)] p-4">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={understood}
                  onChange={(e) => setUnderstood(e.target.checked)}
                />
                <span className="font-semibold text-[var(--ce-primary)]">{t('exams.acceptInstructions')}</span>
              </label>

              <div className="mt-6 flex flex-wrap gap-3">
                {exam?.hasInProgress ? (
                  <button type="button" className="ce-btn ce-btn-accent" onClick={resumeAttempt}>
                    {t('exams.resumeExam')}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ce-btn ce-btn-accent"
                    disabled={!canStart || starting}
                    onClick={handleStart}
                  >
                    {starting ? t('common.loading') : t('exams.startExam')}
                  </button>
                )}
              </div>

              {!canStart && !exam?.hasInProgress && (
                <p className="mt-4 text-sm font-semibold text-[var(--ce-danger)]">
                  {getAvailabilityLabel(exam, t)}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </StudentWaitingView>
  );
}
