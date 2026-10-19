// src/features/teacher/pages/reports/GroupAnalyticsTab.jsx
import { useEffect, useState } from 'react';
import {
  Users,
  Layers,
  TrendingUp,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import teacherApi from '@/shared/api/teacherApi';
import EmptyState from '../../components/EmptyState';

function GroupCard({ group }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    teacherApi
      .getGroupStats(group.id)
      .then((res) => {
        if (mounted) setStats(res?.data ?? res);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [group.id]);

  const enrolled = stats?.activeEnrollments ?? group._count?.enrollments ?? 0;
  const capacity = stats?.capacity ?? group.capacity ?? 0;
  const usage = stats?.capacityUsage ?? (capacity > 0
    ? Math.round((enrolled / capacity) * 100)
    : 0);

  const usageColor =
    usage >= 90
      ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
      : usage >= 70
        ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
        : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-gray-900 dark:text-white truncate">
            {group.name}
          </h4>
          {group.subject?.name && (
            <p className="text-xs text-gray-500 truncate">
              {group.subject.name}
            </p>
          )}
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${usageColor}`}
        >
          {usage}%
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={16} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Capacity bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>السعة المستخدمة</span>
              <span className="font-medium">
                {enrolled} / {capacity}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
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

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.activeEnrollments ?? 0}
                </p>
                <p className="text-[10px] text-gray-500">نشط</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-amber-600">
                  {stats.pendingEnrollments ?? 0}
                </p>
                <p className="text-[10px] text-gray-500">معلق</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.totalAssignments ?? 0}
                </p>
                <p className="text-[10px] text-gray-500">واجبات</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.totalQuizzes ?? 0}
                </p>
                <p className="text-[10px] text-gray-500">اختبارات</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function GroupAnalyticsTab({ groups }) {
  if (!groups || groups.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="لا توجد مجموعات"
        description="لم يتم إنشاء أي مجموعات بعد"
      />
    );
  }

  // Aggregate stats
  const totalCapacity = groups.reduce(
    (sum, g) => sum + (g.capacity || 0),
    0,
  );
  const totalEnrolled = groups.reduce(
    (sum, g) => sum + (g._count?.enrollments || 0),
    0,
  );
  const overallUsage = totalCapacity > 0
    ? Math.round((totalEnrolled / totalCapacity) * 100)
    : 0;

  const fullGroups = groups.filter((g) => {
    const enrolled = g._count?.enrollments || 0;
    const capacity = g.capacity || 0;
    return capacity > 0 && enrolled / capacity >= 0.9;
  });

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Layers size={14} className="text-primary-500" />
            <span className="text-xs text-gray-500">المجموعات</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {groups.length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-emerald-500" />
            <span className="text-xs text-gray-500">إجمالي المسجلين</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalEnrolled}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-primary-500" />
            <span className="text-xs text-gray-500">استخدام السعة</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {overallUsage}%
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={14} className="text-red-500" />
            <span className="text-xs text-gray-500">مجموعات ممتلئة</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {fullGroups.length}
          </p>
        </div>
      </div>

      {/* Groups Grid */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
          تفاصيل المجموعات
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
}
