const styles = {
  pending: 'bg-amber-100 text-amber-900',
  active: 'bg-emerald-100 text-emerald-900',
  cancelled: 'bg-red-100 text-red-900',
  draft: 'bg-slate-100 text-slate-700',
  published: 'bg-blue-100 text-blue-900',
  rejected: 'bg-red-100 text-red-900',
  approved: 'bg-emerald-100 text-emerald-900',
};

export default function StatusBadge({ status, label }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {label || status}
    </span>
  );
}
