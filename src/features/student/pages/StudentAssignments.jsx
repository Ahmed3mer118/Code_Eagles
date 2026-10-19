import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  AlertCircle,
  RefreshCw,
  Inbox,
  CheckCircle2,
  XCircle,
  Send,
  Calendar,
  Award,
} from 'lucide-react';
import useStudentAssignments from '../hooks/useStudentAssignments';

// ===== Helpers =====
const STATUS_META = {
  pending: {
    label: 'مستحق',
    color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
    icon: Clock,
  },
  overdue: {
    label: 'متأخر',
    color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    icon: XCircle,
  },
  submitted: {
    label: 'مسلّم',
    color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    icon: Send,
  },
  graded: {
    label: 'مصحح',
    color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    icon: CheckCircle2,
  },
  returned: {
    label: 'مرتجع',
    color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
    icon: RefreshCw,
  },
};

/**
 * تحديد حالة الواجب من منظور الطالب
 */
function getAssignmentStatus(assignment) {
  const submission = assignment.submissions?.[0];

  if (submission) {
    if (submission.status === 'graded') return 'graded';
    if (submission.status === 'returned') return 'returned';
    return 'submitted';
  }

  const now = new Date();
  const due = assignment.dueDate ? new Date(assignment.dueDate) : null;
  if (due && now > due) return 'overdue';
  return 'pending';
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ===== Skeleton =====
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
      <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-4" />
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20" />
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20" />
      </div>
    </div>
  );
}

// ===== Assignment Card =====
function AssignmentCard({ assignment }) {
  const status = getAssignmentStatus(assignment);
  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;
  const submission = assignment.submissions?.[0];

  return (
    <Link
      to={`/student/assignments/${assignment.id}`}
      className="block bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 transition-colors flex-1">
          {assignment.title}
        </h3>
        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold ${meta.color}`}
        >
          <StatusIcon size={12} />
          {meta.label}
        </span>
      </div>

      {assignment.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
          {assignment.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        {assignment.subject?.name && (
          <span className="inline-flex items-center gap-1">
            <FileText size={12} />
            {assignment.subject.name}
          </span>
        )}
        {assignment.dueDate && (
          <span
            className={`inline-flex items-center gap-1 ${
              status === 'overdue' ? 'text-red-600 dark:text-red-400 font-medium' : ''
            }`}
          >
            <Calendar size={12} />
            {formatDate(assignment.dueDate)}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Award size={12} />
          {assignment.maxPoints} درجة
        </span>
      </div>

      {/* Grade display */}
      {submission?.grade != null && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">الدرجة</span>
            <span className="font-bold text-green-600 dark:text-green-400">
              {submission.grade} / {assignment.maxPoints}
            </span>
          </div>
        </div>
      )}

      {/* Submitted at */}
      {submission?.submittedAt && status === 'submitted' && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
          سلّمت {formatDateTime(submission.submittedAt)}
        </div>
      )}
    </Link>
  );
}

// ===== Empty State =====
function EmptyState({ hasFilter }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Inbox size={36} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        {hasFilter ? 'مفيش واجبات في الفلتر ده' : 'مفيش واجبات'}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md">
        {hasFilter
          ? 'جرب تختار فلتر تاني.'
          : 'مفيش واجبات متاحة ليك دلوقتي.'}
      </p>
    </div>
  );
}

// ===== Main Page =====
export default function StudentAssignments() {
  const { assignments, isLoading, error, refetch } = useStudentAssignments();
  const [activeFilter, setActiveFilter] = useState('all');

  // عدّاد لكل حالة
  const counts = useMemo(() => {
    const c = { all: 0, pending: 0, overdue: 0, submitted: 0, graded: 0, returned: 0 };
    assignments.forEach((a) => {
      c.all += 1;
      c[getAssignmentStatus(a)] += 1;
    });
    return c;
  }, [assignments]);

  // الفلترة
  const filtered = useMemo(() => {
    if (activeFilter === 'all') return assignments;
    return assignments.filter((a) => getAssignmentStatus(a) === activeFilter);
  }, [assignments, activeFilter]);

  const filters = [
    { key: 'all', label: 'الكل', count: counts.all },
    { key: 'pending', label: 'مستحق', count: counts.pending },
    { key: 'overdue', label: 'متأخر', count: counts.overdue },
    { key: 'submitted', label: 'مسلّم', count: counts.submitted },
    { key: 'graded', label: 'مصحح', count: counts.graded },
    { key: 'returned', label: 'مرتجع', count: counts.returned },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText size={24} className="text-primary-600" />
          الواجبات
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isLoading
            ? 'جاري التحميل...'
            : assignments.length > 0
            ? `${assignments.length} واجب`
            : 'الواجبات المطلوبة منك'}
        </p>
      </div>

      {/* Filters */}
      {!isLoading && assignments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {f.label} ({f.count})
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={36} className="text-red-500 mb-3" />
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold"
          >
            <RefreshCw size={16} /> حاول تاني
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasFilter={activeFilter !== 'all'} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <AssignmentCard key={a.id} assignment={a} />
          ))}
        </div>
      )}
    </div>
  );
}
