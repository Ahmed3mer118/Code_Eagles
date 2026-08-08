import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, Trophy, XCircle } from 'lucide-react';
import { quizApi } from '../../../shared/api/platformApi';
import LoadingScreen from '../../../shared/ui/LoadingScreen';
import StudentWaitingView from '../../student/StudentWaitingView';
import ExamAnswerReview from '../components/ExamAnswerReview';
import { formatDuration } from '../utils/examHelpers';

export default function ExamResultsPage() {
  const { quizId, attemptId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || null);
  const [review, setReview] = useState(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await quizApi.getAttempt(quizId, attemptId);
        setResult((prev) => prev || data.attempt);
        setReview(data.review || null);
        setQuizTitle(data.quiz?.title || '');
      } catch {
        navigate('/dashboard/student/quizzes');
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId, navigate, quizId]);

  if (loading) return <LoadingScreen />;

  const data = result || {};
  const showResults = data.resultAvailable !== false && (data.score != null || data.passed != null);
  const showReview = Boolean(review?.items?.length);
  const passed = data.passed;
  const autoSubmitted = location.state?.autoSubmitted || data.autoSubmitted;

  return (
    <StudentWaitingView>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="ce-card overflow-hidden p-8 text-center">
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            showResults ? (passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700') : 'bg-[var(--ce-bg)] text-[var(--ce-primary)]'
          }`}>
            {showResults ? (
              passed ? <CheckCircle2 className="h-10 w-10" /> : <XCircle className="h-10 w-10" />
            ) : (
              <CheckCircle2 className="h-10 w-10" />
            )}
          </div>

          <h1 className="mt-5 text-3xl font-extrabold text-[var(--ce-primary)]">
            {t('exams.submittedTitle')}
          </h1>

          {autoSubmitted && (
            <p className="mt-2 text-sm font-semibold text-[var(--ce-danger)]">{t('exams.autoSubmittedNote')}</p>
          )}

          {showResults ? (
            <>
              <p className="mt-3 text-[var(--ce-muted)]">{quizTitle || t('dashboard.quizzes')}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-[var(--ce-bg)] p-4">
                  <Trophy className="mx-auto h-6 w-6 text-[var(--ce-accent)]" />
                  <p className="mt-2 text-2xl font-extrabold">{data.score}/{data.maxScore}</p>
                  <p className="text-xs text-[var(--ce-muted)]">{t('quizzes.score')}</p>
                </div>
                <div className="rounded-2xl bg-[var(--ce-bg)] p-4">
                  <p className="mt-2 text-2xl font-extrabold">{data.percentage}%</p>
                  <p className="text-xs text-[var(--ce-muted)]">{t('exams.percentage')}</p>
                </div>
                <div className="rounded-2xl bg-[var(--ce-bg)] p-4">
                  <Clock className="mx-auto h-6 w-6 text-[var(--ce-primary)]" />
                  <p className="mt-2 text-2xl font-extrabold">{formatDuration(data.timeTakenSeconds)}</p>
                  <p className="text-xs text-[var(--ce-muted)]">{t('exams.timeTaken')}</p>
                </div>
              </div>
              <p className={`mt-6 text-lg font-extrabold ${passed ? 'text-emerald-600' : 'text-red-600'}`}>
                {passed ? t('quizzes.passed') : t('quizzes.failed')}
              </p>
            </>
          ) : (
            <p className="mt-4 leading-relaxed text-[var(--ce-muted)]">
              {data?.message || t(`exams.resultMessages.${data?.resultMessageKey || 'teacher_review'}`, t('exams.resultsPending'))}
            </p>
          )}
        </div>

        {showReview && (
          <div className="ce-card p-6">
            <h2 className="mb-6 text-xl font-extrabold text-[var(--ce-primary)]">{t('exams.analysisTitle')}</h2>
            <ExamAnswerReview review={review} />
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/dashboard/student/quizzes/history" className="ce-btn ce-btn-primary">
            {t('exams.viewHistory')}
          </Link>
          <Link to="/dashboard/student/quizzes" className="ce-btn ce-btn-ghost">
            {t('exams.backToExams')}
          </Link>
        </div>
      </div>
    </StudentWaitingView>
  );
}
