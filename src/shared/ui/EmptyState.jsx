export default function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="ce-card flex flex-col items-center px-6 py-14 text-center">
      <div className="text-5xl">{icon}</div>
      <h3 className="mt-4 text-lg font-extrabold text-[var(--ce-primary)]">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-[var(--ce-muted)]">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
