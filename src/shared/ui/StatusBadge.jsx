const TONES = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-blue-50 text-blue-700 ring-blue-200',
};

const DOTS = {
  neutral: 'bg-slate-400',
  warning: 'bg-amber-500',
  success: 'bg-emerald-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
};

/** Status → tone mapping shared by every list, card and table in the app. */
const STATUS_TONE = {
  pending: 'warning',
  in_progress: 'warning',
  submitted: 'info',
  under_review: 'warning',
  active: 'success',
  approved: 'success',
  paid: 'success',
  passed: 'success',
  published: 'info',
  draft: 'neutral',
  left: 'neutral',
  closed: 'neutral',
  archived: 'neutral',
  cancelled: 'danger',
  rejected: 'danger',
  failed: 'danger',
  suspended: 'danger',
  expired: 'danger',
  success: 'success',
  failure: 'danger',
  info: 'info',
};

export default function StatusBadge({ status, label, tone }) {
  const resolvedTone = tone || STATUS_TONE[status] || 'neutral';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${TONES[resolvedTone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOTS[resolvedTone]}`} aria-hidden="true" />
      {label || status}
    </span>
  );
}
