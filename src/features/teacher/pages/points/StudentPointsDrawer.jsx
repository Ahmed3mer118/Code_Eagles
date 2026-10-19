// src/features/teacher/pages/points/StudentPointsDrawer.jsx
import { useEffect, useState } from 'react';
import {
  X,
  Star,
  TrendingUp,
  TrendingDown,
  Award,
  Loader2,
} from 'lucide-react';
import teacherApi from '@/shared/api/teacherApi';

export default function StudentPointsDrawer({ open, onClose, studentId, studentName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !studentId) return;
    let mounted = true;
    setLoading(true);
    setError('');
    teacherApi
      .getStudentPoints(studentId)
      .then((res) => {
        if (mounted) setData(res?.data ?? res);
      })
      .catch((err) => {
        if (mounted)
          setError(err?.response?.data?.message || 'فشل تحميل النقاط');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [open, studentId]);

  if (!open) return null;

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString('ar-EG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-md h-full overflow-y-auto shadow-2xl" dir="rtl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between z-10">
          <h3 className="font-bold text-gray-900 dark:text-white">
            نقاط {studentName || 'الطالب'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary-500" size={32} />
          </div>
        ) : error ? (
          <div className="p-4 text-red-600 text-sm">{error}</div>
        ) : data ? (
          <>
            {/* Summary */}
            <div className="p-4 grid grid-cols-2 gap-3 border-b border-gray-100 dark:border-gray-800">
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Star size={14} className="text-primary-600" />
                  <span className="text-xs text-primary-700 dark:text-primary-400">
                    إجمالي النقاط
                  </span>
                </div>
                <p className="text-2xl font-bold text-primary-900 dark:text-primary-300">
                  {data.totalPoints ?? 0}
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Award size={14} className="text-amber-600" />
                  <span className="text-xs text-amber-700 dark:text-amber-400">
                    المستوى
                  </span>
                </div>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-300">
                  Lv.{data.level ?? 1}
                </p>
              </div>

              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1 text-xs text-gray-600 dark:text-gray-400">
                  <span>التقدم للمستوى القادم</span>
                  <span>{data.progressPercent ?? 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-l from-primary-500 to-primary-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, data.progressPercent || 0)}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  XP: {data.currentLevelXp ?? 0} / {data.nextLevelXp ?? 0}
                </p>
              </div>
            </div>

            {/* Logs */}
            <div className="p-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                آخر العمليات
              </h4>
              {!data.logs || data.logs.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">
                  لا توجد عمليات بعد
                </p>
              ) : (
                <div className="space-y-2">
                  {data.logs.map((log) => {
                    const pts = Number(log.points || 0);
                    const isPositive = pts > 0;
                    return (
                      <div
                        key={log.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isPositive
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp size={14} />
                          ) : (
                            <TrendingDown size={14} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                            {log.reason || '—'}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {formatDate(log.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-bold shrink-0 ${
                            isPositive ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {pts}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
