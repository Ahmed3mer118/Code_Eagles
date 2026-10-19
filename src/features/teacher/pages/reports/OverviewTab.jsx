// src/features/teacher/pages/reports/OverviewTab.jsx
import {
  Users,
  UserCog,
  BookOpen,
  Layers,
  GraduationCap,
  ClipboardList,
  TrendingUp,
  Award,
  Star,
  Trophy,
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import EmptyState from '../../components/EmptyState';

export default function OverviewTab({ overview, groups, topStudents, studentsCount }) {
  if (!overview) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="لا توجد بيانات"
        description="لم يتم تحميل الإحصائيات بعد"
      />
    );
  }

  // حساب إحصائيات المجموعات
  const totalGroups = groups?.length || 0;
  const totalCapacity = groups?.reduce(
    (sum, g) => sum + (g.capacity || 0),
    0,
  ) || 0;
  const totalEnrolled = groups?.reduce(
    (sum, g) => sum + (g._count?.enrollments || 0),
    0,
  ) || 0;
  const capacityUsage = totalCapacity > 0
    ? Math.round((totalEnrolled / totalCapacity) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
          الإحصائيات العامة
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={Users}
            label="الطلاب النشطون"
            value={overview.totalStudents ?? 0}
            color="primary"
          />
          <StatCard
            icon={UserCog}
            label="المساعدون"
            value={overview.totalAssistants ?? 0}
            color="blue"
          />
          <StatCard
            icon={BookOpen}
            label="المواد"
            value={overview.totalSubjects ?? 0}
            color="green"
          />
          <StatCard
            icon={Layers}
            label="المجموعات"
            value={overview.totalGroups ?? 0}
            color="orange"
          />
        </div>
      </div>

      {/* Secondary Stats */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
          المحتوى والتسجيلات
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={GraduationCap}
            label="الكورسات"
            value={overview.totalCourses ?? 0}
            color="primary"
          />
          <StatCard
            icon={ClipboardList}
            label="إجمالي التسجيلات"
            value={overview.totalEnrollments ?? 0}
            color="green"
          />
          <StatCard
            icon={Star}
            label="طلاب في المتصدرين"
            value={topStudents?.length ?? 0}
            color="orange"
          />
          <StatCard
            icon={Award}
            label="نسبة استخدام السعة"
            value={`${capacityUsage}%`}
            color={
              capacityUsage > 80
                ? 'red'
                : capacityUsage > 50
                  ? 'orange'
                  : 'green'
            }
          />
        </div>
      </div>

      {/* Top Students Preview */}
      {topStudents && topStudents.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Trophy size={16} className="text-yellow-500" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              أفضل 5 طلاب
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {topStudents.slice(0, 5).map((student, idx) => (
              <div
                key={student.studentId || idx}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : idx === 1
                        ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        : idx === 2
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-gray-50 text-gray-500 dark:bg-gray-800'
                  }`}
                >
                  {student.rank || idx + 1}
                </div>
                {student.profileImageUrl ? (
                  <img
                    src={student.profileImageUrl}
                    alt={student.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {student.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {student.name}
                  </p>
                  {student.gradeLevel && (
                    <p className="text-xs text-gray-500 truncate">
                      {student.gradeLevel}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-primary-600 shrink-0">
                  <Star size={14} />
                  <span className="font-bold text-sm">
                    {student.totalPoints}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Group Capacity Warnings */}
      {groups && groups.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary-500" />
            حالة المجموعات
          </h3>
          <div className="space-y-2">
            {groups.slice(0, 5).map((group) => {
              const enrolled = group._count?.enrollments || 0;
              const capacity = group.capacity || 0;
              const usage = capacity > 0
                ? Math.round((enrolled / capacity) * 100)
                : 0;
              const isFull = usage >= 90;
              const isWarning = usage >= 70 && usage < 90;

              return (
                <div
                  key={group.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {group.name}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          isFull
                            ? 'text-red-600'
                            : isWarning
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                        }`}
                      >
                        {enrolled} / {capacity}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull
                            ? 'bg-red-500'
                            : isWarning
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(usage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
