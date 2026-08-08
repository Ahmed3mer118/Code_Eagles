import { CheckCircle2 } from 'lucide-react';

export default function LearningPathTimeline({ steps = [] }) {
  if (!steps.length) return null;

  return (
    <ol className="relative mx-auto max-w-3xl border-s-2 border-[var(--ce-accent)]/30 ps-6 sm:ps-8">
      {steps.map((step, index) => (
        <li key={`${step}-${index}`} className="relative pb-8 last:pb-0">
          <span className="absolute -start-[1.65rem] flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ce-accent)] text-[#1a1200] shadow-lg sm:-start-[2.05rem] sm:h-9 sm:w-9">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          <div className="ce-card p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--ce-muted)]">
              {String(index + 1).padStart(2, '0')}
            </p>
            <h3 className="mt-1 font-extrabold text-[var(--ce-primary)]">{step}</h3>
          </div>
        </li>
      ))}
    </ol>
  );
}
