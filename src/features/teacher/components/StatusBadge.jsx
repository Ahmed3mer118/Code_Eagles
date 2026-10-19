// src/features/teacher/components/StatusBadge.jsx
import {
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

const STATUS_MAP = {
  // Enrollments
  pending: {
    label: 'قيد المراجعة',
    cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    icon: Clock,
  },
  approved: {
    label: 'مقبول',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'مرفوض',
    cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    icon: XCircle,
  },
  cancelled: {
    label: 'ملغي',
    cls: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    icon: Ban,
  },
  blocked: {
    label: 'محظور',
    cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    icon: Ban,
  },
  // Members / users
  active: {
    label: 'نشط',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  inactive: {
    label: 'غير نشط',
    cls: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    icon: AlertCircle,
  },
  suspended: {
    label: 'موقوف',
    cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    icon: ShieldCheck,
  },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_MAP[status] || {
    label: status || '—',
    cls: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: AlertCircle,
  };
  const Icon = cfg.icon;
  const sizeCls = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${cfg.cls} ${sizeCls}`}
    >
      <Icon size={size === 'md' ? 14 : 12} />
      {cfg.label}
    </span>
  );
}
