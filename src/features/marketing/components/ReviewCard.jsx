import { ThumbsUp, BadgeCheck, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ReviewCard({ review }) {
  const { t } = useTranslation();

  return (
    <article className="ce-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ce-primary)] text-sm font-bold text-white">
            {review.name?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-[var(--ce-primary)]">{review.name}</p>
            {review.verified && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--ce-success)]">
                <BadgeCheck className="h-3.5 w-3.5" />
                {t('academy.verifiedStudent')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-[var(--ce-accent)] text-[var(--ce-accent)]' : 'text-[var(--ce-border)]'}`}
            />
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-[var(--ce-muted)]">{review.comment}</p>
      <button type="button" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--ce-muted)]">
        <ThumbsUp className="h-3.5 w-3.5" />
        {t('academy.helpful', { count: review.helpful || 0 })}
      </button>
    </article>
  );
}
