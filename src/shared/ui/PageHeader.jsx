export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-[var(--ce-border)] pb-4">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2.5 text-2xl font-extrabold text-[var(--ce-primary)]">
          <span className="h-6 w-1.5 shrink-0 rounded-full bg-[var(--ce-accent)]" aria-hidden="true" />
          <span className="truncate">{title}</span>
        </h2>
        {subtitle && <p className="mt-1.5 text-sm text-[var(--ce-muted)]">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
