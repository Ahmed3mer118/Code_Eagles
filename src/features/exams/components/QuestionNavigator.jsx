import { useTranslation } from 'react-i18next';
import { Check, Flag } from 'lucide-react';
import { isAnswered } from '../utils/examHelpers';

export default function QuestionNavigator({
  questions = [],
  currentIndex = 0,
  answerMap = {},
  flaggedIds = [],
  onSelect,
}) {
  const { t } = useTranslation();

  return (
    <div className="ce-card p-4">
      <div className="mb-3 flex flex-wrap gap-3 text-xs font-semibold text-[var(--ce-muted)]">
        <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-[var(--ce-success)]/20 ring-2 ring-[var(--ce-success)]" /> {t('exams.navAnswered')}</span>
        <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-[var(--ce-accent)]/20 ring-2 ring-[var(--ce-accent)]" /> {t('exams.navCurrent')}</span>
        <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-[var(--ce-border)]" /> {t('exams.navUnanswered')}</span>
        <span className="inline-flex items-center gap-1"><Flag className="h-3 w-3 text-amber-500" /> {t('exams.navFlagged')}</span>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-8">
        {questions.map((q, index) => {
          const answered = isAnswered(answerMap[String(q._id)]);
          const current = index === currentIndex;
          const flagged = flaggedIds.includes(String(q._id));
          return (
            <button
              key={q._id}
              type="button"
              onClick={() => onSelect(index)}
              className={`relative flex h-10 items-center justify-center rounded-xl text-sm font-bold transition ${
                current
                  ? 'bg-[var(--ce-accent)] text-[#1a1200] ring-2 ring-[var(--ce-accent)]'
                  : answered
                    ? 'bg-[var(--ce-success)]/15 text-[var(--ce-success)]'
                    : 'bg-[var(--ce-bg)] text-[var(--ce-muted)]'
              }`}
            >
              {index + 1}
              {answered && !current && <Check className="absolute -end-1 -top-1 h-3.5 w-3.5 rounded-full bg-[var(--ce-success)] text-white" />}
              {flagged && <Flag className="absolute -bottom-1 -end-1 h-3 w-3 text-amber-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
