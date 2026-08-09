/** `icon` accepts an emoji string or a lucide component for a cleaner look. */
export default function EmptyState({ icon = '📭', title, description, action }) {
  const Icon = typeof icon === 'function' ? icon : null;

  return (
    <div className="ce-card flex flex-col items-center px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--ce-bg)] text-3xl text-[var(--ce-muted)]">
        {Icon ? <Icon className="h-7 w-7" aria-hidden="true" /> : icon}
      </div>
      <h3 className="mt-4 text-lg font-extrabold text-[var(--ce-primary)]">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--ce-muted)]">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
