import { useTranslation } from 'react-i18next';
import { Flag } from 'lucide-react';

const blockClipboard = (e) => {
  e.preventDefault();
  return false;
};

export default function QuestionPanel({
  question,
  index,
  total,
  value,
  onChange,
  flagged,
  onToggleFlag,
}) {
  const { t } = useTranslation();
  if (!question) return null;

  const qid = String(question._id);

  return (
    <article
      className="ce-card ce-exam-question p-6 select-none"
      onCopy={blockClipboard}
      onCut={blockClipboard}
      onPaste={blockClipboard}
      onContextMenu={blockClipboard}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--ce-accent)]">
            {t('exams.questionOf', { current: index + 1, total })}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-[var(--ce-muted)]">
            <span className="ce-badge">{question.points || 1} {t('quizzes.points')}</span>
            {question.difficulty && (
              <span className="ce-badge">{t(`exams.difficulty.${question.difficulty}`, question.difficulty)}</span>
            )}
          </div>
        </div>
        <button
          type="button"
          className={`ce-btn text-sm ${flagged ? 'ce-btn-accent' : 'ce-btn-ghost'}`}
          onClick={() => onToggleFlag(qid)}
        >
          <Flag className="h-4 w-4" />
          {t('exams.flagForReview')}
        </button>
      </div>

      <h3 className="pointer-events-none text-lg font-extrabold leading-relaxed text-[var(--ce-primary)]">{question.text}</h3>

      {question.imageUrl && (
        <img src={question.imageUrl} alt="" draggable={false} className="pointer-events-none mt-4 max-h-64 w-full rounded-xl object-contain" />
      )}

      {question.hint && (
        <details className="mt-4 rounded-xl bg-[var(--ce-bg)] p-3 text-sm">
          <summary className="cursor-pointer font-semibold text-[var(--ce-primary)]">{t('exams.showHint')}</summary>
          <p className="mt-2 text-[var(--ce-muted)]">{question.hint}</p>
        </details>
      )}

      <div className="mt-6">
        {question.type === 'true_false' && (
          <div className="grid gap-3 sm:grid-cols-2">
            {[true, false].map((opt) => (
              <label
                key={String(opt)}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                  value === opt ? 'border-[var(--ce-accent)] bg-amber-50' : 'border-[var(--ce-border)]'
                }`}
              >
                <input type="radio" name={qid} checked={value === opt} onChange={() => onChange(opt)} />
                <span className="font-semibold">{opt ? t('quizzes.true') : t('quizzes.false')}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'written' && (
          <textarea
            className="ce-input min-h-[160px]"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onPaste={blockClipboard}
            onCopy={blockClipboard}
            onCut={blockClipboard}
            onDrop={blockClipboard}
            autoComplete="off"
            spellCheck={false}
            placeholder={t('exams.writeAnswer')}
          />
        )}

        {(question.type === 'mcq' || !question.type) && (
          <div className="grid gap-3">
            {(question.options || []).map((opt, oi) => (
              <label
                key={oi}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                  value === oi ? 'border-[var(--ce-accent)] bg-amber-50' : 'border-[var(--ce-border)]'
                }`}
              >
                <input type="radio" name={qid} checked={value === oi} onChange={() => onChange(oi)} />
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--ce-primary)] text-xs font-bold text-white">
                  {String.fromCharCode(65 + oi)}
                </span>
                <span className="pointer-events-none font-medium leading-relaxed">{opt}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
