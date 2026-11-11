// src/features/assistant/pages/AssistantQuizzes.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Search, AlertCircle, Plus, Eye, Clock, Users, Pencil,
} from 'lucide-react';
import assistantApi from '../api/assistantApi';
import { usePermissions } from '../components/PermissionGate';
import AssistantQuizFormModal from './AssistantQuizFormModal';

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

export default function AssistantQuizzes() {
  const navigate = useNavigate();
  const { has, loading: permsLoading } = usePermissions();
  const [quizzes, setQuizzes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  // ✅ الأسماء الصح من الـ backend
  const canManage = !permsLoading && has('manage_quizzes');
  // المساعد بيشوف quizzes بسبب @Roles(assistant) مش permission
  const canView = !permsLoading;

  useEffect(() => {
    assistantApi.getGroups()
      .then((res) => {
        const payload = res?.data ?? res;
        setGroups(Array.isArray(payload) ? payload : payload?.data ?? []);
      })
      .catch(() => setGroups([]));
  }, []);

  const fetchQuizzes = useCallback(async () => {
    if (permsLoading) return;
    setLoading(true);
    setError('');
    try {
      const res = await assistantApi.getQuizzes({ limit: 100, search });
      const payload = res?.data?.data ?? res?.data ?? res;
      const items = Array.isArray(payload)
        ? payload
        : payload?.data ?? payload?.items ?? [];
      setQuizzes(items);
    } catch (err) {
      const status = err?.response?.status;
      setError(
        status === 403
          ? 'ليس لديك صلاحية لعرض الاختبارات.'
          : err?.response?.data?.message || 'فشل تحميل الاختبارات',
      );
    } finally {
      setLoading(false);
    }
  }, [search, permsLoading]);

  useEffect(() => {
    if (!permsLoading) fetchQuizzes();
  }, [fetchQuizzes, permsLoading]);

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('ar-EG'); } catch { return '—'; }
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardList size={24} className="text-primary-600" />
            الاختبارات
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {quizzes.length > 0 ? `${quizzes.length} اختبار` : 'اختبارات مجموعاتك'}
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition shadow-sm"
          >
            <Plus size={16} /> إنشاء اختبار
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
        <div className="relative">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بعنوان الاختبار..."
            className="w-full pr-9 pl-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
          <button onClick={fetchQuizzes} className="mr-auto text-xs underline">
            إعادة المحاولة
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <ClipboardList size={36} className="text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">لا توجد اختبارات</h3>
          <p className="text-sm text-gray-500 mt-1">
            {canManage
              ? 'ابدأ بإنشاء أول اختبار لمجموعاتك'
              : 'لم يتم إنشاء اختبارات لمجموعاتك بعد'}
          </p>
          {canManage && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              <Plus size={16} /> إنشاء اختبار
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q) => (
            <div key={q.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">{q.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {q.subject?.name || 'مادة'} · {q.durationMinutes} دقيقة · {q.totalMarks} درجة
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-md font-bold shrink-0 ${STATUS_COLORS[q.status] || ''}`}>
                  {STATUS_LABELS[q.status] || q.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
                <span>❓ {q._count?.questions ?? 0} سؤال</span>
                <span className="flex items-center gap-1">
                  <Users size={12} />{q._count?.attempts ?? 0} محاولة
                </span>
                {q.endDate && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />ينتهي: {formatDate(q.endDate)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => navigate(`/assistant/quizzes/${q.id}`)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg hover:bg-primary-100 font-medium"
                >
                  <Eye size={14} /> عرض
                </button>

                {canManage && (
                  <button
                    onClick={() => navigate(`/assistant/quizzes/${q.id}/edit`)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 font-medium"
                  >
                    <Pencil size={14} /> تعديل
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && canManage && (
        <AssistantQuizFormModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          groups={groups}
          onCreated={(quiz) => {
            setShowCreate(false);
            fetchQuizzes();
            if (quiz?.id) navigate(`/assistant/quizzes/${quiz.id}/edit`);
          }}
        />
      )}
    </div>
  );
}