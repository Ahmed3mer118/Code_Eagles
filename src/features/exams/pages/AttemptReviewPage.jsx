import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { quizApi } from '../../../shared/api/platformApi';
import LoadingScreen from '../../../shared/ui/LoadingScreen';
import PageHeader from '../../../shared/ui/PageHeader';
import ExamAnswerReview from '../components/ExamAnswerReview';

export default function AttemptReviewPage() {
  const { quizId, attemptId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [review, setReview] = useState(null);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await quizApi.getAttempt(quizId, attemptId);
        setQuiz(data.quiz);
        setAttempt(data.attempt);
        setReview(data.review || null);
        const initial = {};
        (data.attempt?.answers || []).forEach((a) => {
          initial[String(a.questionId)] = {
            questionId: a.questionId,
            value: a.value,
            isCorrect: a.isCorrect,
            pointsAwarded: a.pointsAwarded || 0,
            feedback: a.feedback || '',
          };
        });
        setGrades(initial);
      } catch (err) {
        toast.error(err?.response?.data?.message || err?.message || t('common.error'));
        navigate('/dashboard/teacher/quizzes');
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId, navigate, quizId, t]);

  const questionMap = useMemo(
    () => Object.fromEntries((quiz?.questions || []).map((q) => [String(q._id), q])),
    [quiz]
  );

  const writtenItems = useMemo(
    () => (review?.items || []).filter((item) => questionMap[String(item.questionId)]?.type === 'written'),
    [review, questionMap]
  );

  const updateGrade = (questionId, patch) => {
    setGrades((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], ...patch },
    }));
  };

  const saveReview = async (publish = false) => {
    setSaving(true);
    try {
      await quizApi.reviewAttempt(quizId, attemptId, {
        answers: Object.values(grades),
        status: publish ? 'published' : 'pending_review',
        saveDraft: !publish,
      });
      toast.success(t('common.success'));
      navigate('/dashboard/teacher/quizzes');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('exams.reviewTitle')}
        subtitle={`${quiz?.title || ''} · ${attempt?.studentId?.name || ''}`}
        actions={(
          <Link to="/dashboard/teacher/quizzes" className="ce-btn ce-btn-ghost text-sm">{t('common.back')}</Link>
        )}
      />

      {review?.items?.length > 0 && <ExamAnswerReview review={review} />}

      {writtenItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-[var(--ce-primary)]">{t('exams.manualGrading')}</h2>
          {writtenItems.map((item) => {
            const q = questionMap[String(item.questionId)];
            const grade = grades[String(item.questionId)] || {};
            if (!q) return null;

            return (
              <article key={item.questionId} className="ce-card p-5">
                <h3 className="font-extrabold text-[var(--ce-primary)]">{item.questionText}</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="ce-label">{t('exams.awardedMarks')}</span>
                    <input
                      type="number"
                      min={0}
                      max={q.points || 1}
                      className="ce-input"
                      value={grade.pointsAwarded ?? 0}
                      onChange={(e) => updateGrade(String(item.questionId), {
                        pointsAwarded: Number(e.target.value),
                        isCorrect: Number(e.target.value) >= (q.points || 1),
                      })}
                    />
                  </label>
                  <label className="flex items-center gap-2 pt-7 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={Boolean(grade.isCorrect)}
                      onChange={(e) => updateGrade(String(item.questionId), { isCorrect: e.target.checked })}
                    />
                    {t('exams.markCorrect')}
                  </label>
                </div>
                <label className="mt-3 block">
                  <span className="ce-label">{t('exams.feedback')}</span>
                  <textarea
                    className="ce-input min-h-[90px]"
                    value={grade.feedback || ''}
                    onChange={(e) => updateGrade(String(item.questionId), { feedback: e.target.value })}
                  />
                </label>
              </article>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="button" className="ce-btn ce-btn-ghost" disabled={saving} onClick={() => saveReview(false)}>
          {t('exams.saveDraft')}
        </button>
        <button type="button" className="ce-btn ce-btn-accent" disabled={saving} onClick={() => saveReview(true)}>
          {t('exams.publishResult')}
        </button>
      </div>
    </div>
  );
}
