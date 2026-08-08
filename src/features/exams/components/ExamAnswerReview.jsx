import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

export default function ExamAnswerReview({ review }) {
  const { t } = useTranslation();
  if (!review?.items?.length) return null;

  const { summary, items } = review;

  return (
    <div className="space-y-6 text-start">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="ce-stat-card text-center">
          <CheckCircle2 className="mx-auto h-5 w-5 text-[var(--ce-success)]" />
          <p className="mt-2 text-xl font-extrabold">{summary.correct}</p>
          <p className="text-xs text-[var(--ce-muted)]">{t('exams.analysis.correct')}</p>
        </div>
        <div className="ce-stat-card text-center">
          <XCircle className="mx-auto h-5 w-5 text-[var(--ce-danger)]" />
          <p className="mt-2 text-xl font-extrabold">{summary.wrong}</p>
          <p className="text-xs text-[var(--ce-muted)]">{t('exams.analysis.wrong')}</p>
        </div>
        <div className="ce-stat-card text-center">
          <MinusCircle className="mx-auto h-5 w-5 text-[var(--ce-muted)]" />
          <p className="mt-2 text-xl font-extrabold">{summary.skipped}</p>
          <p className="text-xs text-[var(--ce-muted)]">{t('exams.analysis.skipped')}</p>
        </div>
        <div className="ce-stat-card text-center">
          <p className="mt-2 text-xl font-extrabold">{summary.total}</p>
          <p className="text-xs text-[var(--ce-muted)]">{t('exams.totalQuestions')}</p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.questionId} className="ce-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-[var(--ce-accent)]">
                  {t('quizzes.question')} {item.index}
                </p>
                <h3 className="mt-1 font-extrabold text-[var(--ce-primary)]">{item.questionText}</h3>
              </div>
              <span className={`ce-badge ${item.isCorrect ? 'ce-badge-success' : item.skipped ? '' : 'ce-badge-accent'}`}>
                {item.pointsAwarded}/{item.points} {t('quizzes.points')}
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-[var(--ce-bg)] p-4">
                <p className="text-xs font-bold uppercase text-[var(--ce-muted)]">{t('exams.studentAnswer')}</p>
                <p className="mt-2 font-medium">{item.studentAnswer || t('exams.analysis.skipped')}</p>
              </div>
              <div className="rounded-xl border border-dashed border-[var(--ce-border)] p-4">
                <p className="text-xs font-bold uppercase text-[var(--ce-muted)]">{t('exams.correctAnswer')}</p>
                <p className="mt-2 font-medium">{item.correctAnswer}</p>
              </div>
            </div>

            {item.feedback && (
              <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{item.feedback}</p>
            )}
            {item.explanation && (
              <p className="mt-3 text-sm text-[var(--ce-muted)]">{item.explanation}</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
