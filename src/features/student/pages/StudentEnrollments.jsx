// src/features/student/pages/StudentEnrollments.jsx
import { useState, useEffect } from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  User,
  BookOpen,
  Calendar,
  Users,
  Search,
  Filter,
  ChevronLeft,
  Video,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStudentEnrollments from '../hooks/useStudentEnrollments';
import studentLecturesApi from '../api/lectures.api';

// ============ Helpers ============
const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('ar-EG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

const STATUS_CONFIG = {
  pending: {
    label: 'قيد المراجعة',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: Clock,
  },
  active: {
    label: 'نشط',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'ملغي',
    color: 'text-gray-700 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    icon: XCircle,
  },
  left: {
    label: 'غادر',
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: XCircle,
  },
  completed: {
    label: 'مكتمل',
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: CheckCircle2,
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}
    >
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

// ============ Group Card ============
function GroupCard({ enrollment, onClick }) {
  const group = enrollment.group || {};
  const subject = group.subject || {};
  const teacher = group.teacher || {};
  const paymentPlan = enrollment.paymentPlan || {};

  // حالة لجلب المحاضرات
  const [lecturesCount, setLecturesCount] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLecturesCount = async () => {
      // بنجيب الـ modules من جوه الـ group (لو موجودة)
      const modules = group.modules || group.course?.modules || [];
      let totalLectures = 0;

      if (modules.length > 0) {
        const results = await Promise.allSettled(
          modules.map((m) => studentLecturesApi.getModuleLectures(m.id)),
        );
        results.forEach((r) => {
          if (r.status === 'fulfilled') {
            const payload = r.value?.data ?? r.value;
            const items = Array.isArray(payload) ? payload : payload?.data || [];
            totalLectures += items.length;
          }
        });
      }
      if (isMounted) setLecturesCount(totalLectures);
    };

    fetchLecturesCount();
    return () => {
      isMounted = false;
    };
  }, [group]);

  const capacity = group.capacity || 0;
  const enrolled = group._count?.enrollments || 0;
  const usage = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="relative p-4 pb-3 bg-gradient-to-l from-primary-500/10 via-indigo-500/10 to-violet-500/10 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">
              {group.name || 'مجموعة'}
            </h3>
            {subject.name && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                <BookOpen size={10} />
                {subject.name}
              </p>
            )}
          </div>
          <StatusBadge status={enrollment.status} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Teacher */}
        {teacher.name && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
              {teacher.profileImageUrl ? (
                <img
                  src={teacher.profileImageUrl}
                  alt={teacher.name}
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <User size={14} className="text-primary-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">المدرس</p>
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {teacher.name}
              </p>
            </div>
          </div>
        )}

        {/* Schedule */}
        {group.schedule && (
          <div className="flex items-start gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
              <Calendar size={14} className="text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">المواعيد</p>
              <p className="font-medium text-gray-900 dark:text-white text-xs">
                {typeof group.schedule === 'string'
                  ? group.schedule
                  : JSON.stringify(group.schedule)}
              </p>
            </div>
          </div>
        )}

        {/* Lectures Count */}
        {lecturesCount !== null && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
              <Video size={14} className="text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">المحاضرات</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {lecturesCount} محاضرة
              </p>
            </div>
          </div>
        )}

        {/* Capacity */}
        {capacity > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
              <Users size={14} className="text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">السعة</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {enrolled} / {capacity}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    usage >= 90
                      ? 'bg-red-500'
                      : usage >= 70
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(usage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Calendar size={12} />
          <span>من {fmtDate(enrollment.startDate)}</span>
          {enrollment.endDate && (
            <>
              <span>·</span>
              <span>إلى {fmtDate(enrollment.endDate)}</span>
            </>
          )}
        </div>

        {/* Payment Plan */}
        {paymentPlan.name && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <span>💳</span>
            <span className="font-medium">{paymentPlan.name}</span>
            {paymentPlan.price && (
              <span className="font-bold text-primary-600">
                · {Number(paymentPlan.price).toLocaleString('ar-EG')} ج.م
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-xs font-medium text-primary-600">
          عرض التفاصيل
        </span>
        <ChevronLeft
          size={14}
          className="text-primary-600 group-hover:-translate-x-1 transition"
        />
      </div>
    </div>
  );
}

// ============ Main ============
export default function StudentEnrollments() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useStudentEnrollments();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = data.filter((e) => {
    if (statusFilter && e.status !== statusFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const group = e.group || {};
      const subject = group.subject || {};
      return (
        group.name?.toLowerCase().includes(q) ||
        subject.name?.toLowerCase().includes(q) ||
        group.teacher?.name?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const stats = {
    total: data.length,
    active: data.filter((e) => e.status === 'active').length,
    pending: data.filter((e) => e.status === 'pending').length,
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Layers size={24} className="text-primary-600" />
          مجموعاتي
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {data.length > 0
            ? `عندك ${data.length} مجموعة`
            : 'المجموعات اللي أنت مسجل فيها'}
        </p>
      </div>

      {/* Stats */}
      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Layers size={14} className="text-primary-500" />
              <span className="text-xs text-gray-500">الإجمالي</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-xs text-gray-500">نشط</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {stats.active}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-amber-500" />
              <span className="text-xs text-gray-500">قيد المراجعة</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {stats.pending}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      {data.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={16}
              className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم المجموعة، المادة، أو المدرس..."
              className="w-full pr-9 pl-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">كل الحالات</option>
              <option value="active">نشط</option>
              <option value="pending">قيد المراجعة</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
              <option value="left">غادر</option>
            </select>
          </div>
        </div>
      )}

      {/* Empty */}
      {data.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Layers size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            لا توجد مجموعات
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            لسه ما انضميتش لأي مجموعة. تواصل مع المدرس للانضمام لمجموعة.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">
            لا توجد نتائج مطابقة للفلاتر
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((enrollment) => (
            <GroupCard
              key={enrollment.id}
              enrollment={enrollment}
              onClick={() => {
                const subjectId = enrollment.group?.subject?.id;
                if (subjectId) {
                  navigate(`/student/subjects/${subjectId}`);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
