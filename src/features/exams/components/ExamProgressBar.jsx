export default function ExamProgressBar({ answered = 0, total = 0 }) {
  const pct = total ? Math.round((answered / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-semibold">
        <span className="text-[var(--ce-primary)]">{answered} / {total}</span>
        <span className="text-[var(--ce-muted)]">{pct}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[var(--ce-bg)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--ce-accent)] to-[var(--ce-accent-soft)] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
