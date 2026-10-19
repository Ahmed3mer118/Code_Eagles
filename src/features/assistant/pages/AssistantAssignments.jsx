// src/features/assistant/pages/AssistantAssignments.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  Eye,
  Users,
} from 'lucide-react';
import teacherApi from '../../../shared/api/teacherApi';
import assistantApi from '../api/assistantApi';
import PermissionGate from '../components/PermissionGate';

const STATUS_LABELS = {
  draft: 'مسودة',
  published: 'منشور',
  closed: 'مغلق',
  archived: 'مؤرشف',
};

const STATUS_COLORS = {
  draft: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  published: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  closed: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  archived: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
};

export default function AssistantAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [groupIds, setGroupIds] = useState([]);

  // جلب المجموعات اللي المساعد مسؤول عنها
  useEffect(() => {
    assistantApi.getGroups()
      .then(res => {
        const payload = res?.data ?? res;
        const groups = Array.isArray(payload) ? payload : payload?.data ?? [];
        setGroupIds(groups.map(g => g.id));
      })
      .catch(() => setGroupIds([]));
  }, []);

  // جلب الواجبات
  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await teacherApi.getAssignments({ limit: 100, search });
      const payload = res?.data?.data ?? res?.data ?? res;
      const items = Array.isArray(payload)
        ? payload
        : payload?.data ?? payload?.items ?? [];

      // فلترة الواجبات اللي مرتبطة بمجموعات المساعد
      // (الباك بيرجع groupIds جوه الواجب أو في groups)
      const filtered = items.filter(a => {
        const assignmentGroupIds =
          a.groups?.map(g => g.groupId || g.group?.id || g.id) || [];
        // لو الواجب ملوش مجموعات محددة، نعرضه (لأنه ممكن يكون لكل المجموعات)
        if (assignmentGroupIds.length === 0) return true;
        // لو فيه تقاطع مع مجموعات المساعد
        return assignmentGroupIds.some(id => groupIds.includes(id));
      });

      setAssignments(filtered);
    } catch (err) {
      const status = err?.response?.status;
      setError(
        status === 403
          ? 'ليس لديك صلاحية لعرض الواجبات. تواصل مع المدرس.'
          : err?.response?.data?.message || 'فشل تحميل الواجبات',
      );
    } finally {
      setLoading(false);
    }
  }, [search, groupIds]);

  useEffect(() => {
    if (groupIds.length > 0) {
      fetchAssignments();
    }
  }, [fetchAssignments, groupIds]);

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('ar-EG'); } catch { return '—'; }
  };

  return (
    <PermissionGate
      permission="assignments.view"
      fallback={
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={36} className="text-amber-500 mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ليس لديك صلاحية لعرض الواجبات. تواصل مع المدرس لتفعيلها.
          </p>
        </div>
      }
    >
      <div className="space-y-5" dir="rtl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText size={24} className="text-primary-600" />
            الواجبات
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {assignments.length > 0
              ? `${assignments.length} واجب في مجموعاتك`
              : 'واجبات مجموعاتك'}
          </p>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بعنوان الواجب..."
              className="w-full pr-9 pl-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
            <button onClick={fetchAssignments} className="mr-auto text-xs underline">
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <FileText size={36} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">لا توجد واجبات</h3>
            <p className="text-sm text-gray-500 mt-1">
              لم يتم إنشاء واجبات لمجموعاتك بعد.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {a.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {a.subject?.name || 'مادة'} · الدرجة الكلية: {a.maxPoints}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-md font-bold shrink-0 ${
                      STATUS_COLORS[a.status] || ''
                    }`}
                  >
                    {STATUS_LABELS[a.status] || a.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
                  {a.dueDate && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      التسليم: {formatDate(a.dueDate)}
                    </span>
                  )}
                  {a._count?.submissions !== undefined && (
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {a._count.submissions} تسليم
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => navigate(`/assistant/assignments/${a.id}`)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg hover:bg-primary-100 font-medium"
                  >
                    <Eye size={14} /> عرض التسليمات
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
