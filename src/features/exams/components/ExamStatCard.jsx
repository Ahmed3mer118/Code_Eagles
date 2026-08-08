export default function ExamStatCard({ label, value, hint }) {
  return (
    <div className="ce-stat-card">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--ce-muted)]">{label}</p>
      <p className="mt-2 text-xl font-extrabold text-[var(--ce-primary)]">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--ce-muted)]">{hint}</p>}
    </div>
  );
}
