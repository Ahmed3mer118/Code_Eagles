import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

export default function TestimonialCarousel({ items = [] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return undefined;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  const item = items[index];

  return (
    <div className="relative mx-auto max-w-4xl">
      <article className="ce-card ce-gradient-border p-8 sm:p-10">
        <Quote className="h-10 w-10 text-[var(--ce-accent)]/40" />
        <p className="mt-4 text-lg leading-relaxed text-[var(--ce-text)] sm:text-xl">
          &ldquo;{item.review}&rdquo;
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--ce-primary)] to-[var(--ce-accent)] text-lg font-extrabold text-white">
              {item.name?.charAt(0)}
            </div>
            <div>
              <p className="font-extrabold text-[var(--ce-primary)]">{item.name}</p>
              <p className="text-sm text-[var(--ce-muted)]">{item.academy}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < item.rating ? 'fill-[var(--ce-accent)] text-[var(--ce-accent)]' : 'text-[var(--ce-border)]'}`}
              />
            ))}
          </div>
        </div>

        {item.outcome && (
          <p className="mt-4 rounded-xl bg-[var(--ce-bg)] px-4 py-3 text-sm font-semibold text-[var(--ce-primary)]">
            {item.outcome}
          </p>
        )}
      </article>

      {items.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            className="ce-icon-btn"
            onClick={() => setIndex((prev) => (prev - 1 + items.length) % items.length)}
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`h-2.5 rounded-full transition-all ${i === index ? 'w-8 bg-[var(--ce-accent)]' : 'w-2.5 bg-[var(--ce-border)]'}`}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            className="ce-icon-btn"
            onClick={() => setIndex((prev) => (prev + 1) % items.length)}
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
