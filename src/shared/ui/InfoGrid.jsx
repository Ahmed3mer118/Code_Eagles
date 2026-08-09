const COLUMNS = {
  1: '',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 xl:grid-cols-3',
};

/**
 * Read-only key/value grid used for profile, academy and detail panels.
 * `items`: [{ icon, label, value, hint, wide }] — falsy entries are skipped.
 */
export default function InfoGrid({ items = [], columns = 2, className = '' }) {
  const visible = items.filter(Boolean);
  if (!visible.length) return null;

  return (
    <dl className={`grid gap-3 ${COLUMNS[columns] ?? COLUMNS[2]} ${className}`}>
      {visible.map(({ icon: Icon, label, value, hint, wide }) => (
        <div
          key={label}
          className={`rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)] p-4 ${wide ? 'sm:col-span-2' : ''}`}
        >
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--ce-muted)]">
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
            <span className="truncate">{label}</span>
          </dt>
          <dd className="mt-1.5 break-words text-base font-bold text-[var(--ce-primary)]">
            {value === 0 || value ? value : '—'}
          </dd>
          {hint && <p className="mt-1 text-xs text-[var(--ce-muted)]">{hint}</p>}
        </div>
      ))}
    </dl>
  );
}
