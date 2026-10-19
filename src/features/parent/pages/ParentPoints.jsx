// src/features/parent/pages/ParentPoints.jsx
import { useState } from 'react';
import { Star, Flame, Award, AlertCircle } from 'lucide-react';
import ChildSelector from '../components/ChildSelector';
import EmptyChildState from '../components/EmptyChildState';
import useParentChildren from '../hooks/useParentChildren';
import useChildPoints from '../hooks/useChildPoints';

export default function ParentPoints() {
  const { children, loading: childrenLoading } = useParentChildren();
  const [selectedChild, setSelectedChild] = useState(null);
  const { data, loading, error } = useChildPoints(selectedChild);

  if (!childrenLoading && children.length === 0) {
    return <EmptyChildState />;
  }

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Star size={24} className="text-amber-500" /> النقاط
          </h1>
          <p className="text-sm text-gray-500 mt-1">نقاط ومستوى ابنك</p>
        </div>
        <ChildSelector selectedChildId={selectedChild} onSelect={setSelectedChild} />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : selectedChild && data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">إجمالي النقاط</p>
                <p className="text-xl font-bold">{data.totalPoints ?? 0}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Award size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">المستوى</p>
                <p className="text-xl font-bold">Lv.{data.level ?? 1}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Flame size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">XP</p>
                <p className="text-xl font-bold">{data.xp ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold mb-3">آخر العمليات</h3>
            {(!data.recentLogs || data.recentLogs.length === 0) ? (
              <p className="text-sm text-gray-500">لا توجد عمليات مسجلة.</p>
            ) : (
              <div className="space-y-2">
                {data.recentLogs.map((log, i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b pb-1">
                    <span className="text-gray-600">{log.reason || 'نقاط'}</span>
                    <span className={`font-bold ${log.points > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {log.points > 0 ? '+' : ''}{log.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">اختر ابناً لعرض نقاطه.</div>
      )}
    </div>
  );
}
