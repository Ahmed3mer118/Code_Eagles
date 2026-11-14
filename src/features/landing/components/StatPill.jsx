// src/features/landing/components/StatPill.jsx
export default function StatPill({ value, label, variant = 'default', icon: Icon }) {
  if (variant === 'hero') {
    return (
      <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur">
        <div className="text-lg font-extrabold text-[var(--ce-accent-soft)] sm:text-xl">
          {value}
        </div>
        <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/60">
          {label}
        </div>
      </div>
    );
  }

  if (variant === 'accent') {
    return (
      <div className="rounded-2xl border border-[var(--ce-accent)]/30 bg-[var(--ce-accent)]/10 p-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-[var(--ce-accent)]" />}
          <span className="text-xs font-bold text-[var(--ce-accent)]">{label}</span>
        </div>
        <div className="mt-2 text-2xl font-extrabold text-[var(--ce-primary)]">
          {value}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-[var(--ce-border)] bg-[var(--ce-surface)] px-3 py-2">
      {Icon && (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--ce-accent)]/15">
          <Icon className="h-3.5 w-3.5 text-[var(--ce-accent)]" />
        </div>
      )}
      <div>
        <div className="text-sm font-extrabold text-[var(--ce-text)]">{value}</div>
        <div className="text-[10px] text-[var(--ce-muted)]">{label}</div>
      </div>
    </div>
  );
}
