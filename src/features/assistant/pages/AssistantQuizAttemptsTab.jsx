// src/features/assistant/pages/AssistantQuizAttemptsTab.jsx
import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Award, User as UserIcon } from 'lucide-react';
import assistantApi from '../api/assistantApi';
import PermissionGate from '../components/PermissionGate';
import AssistantGradeAttemptModal from './AssistantGradeAttemptModal';

const STATUS_LABELS = {
  in_progress: 'قيد التنفيذ',
  submitted: 'بانتظار التصحيح',
  graded: 'تم التصحيح',
  cancelled: 'ملغي',
};

const STATUS_COLORS = {
  in_progress: 'bg-blue-50 text-blue-700',
  submitted: 'bg-amber-50 text-amber-700',
  graded: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
};

export default function AssistantQuizAttemptsTab({ quizId }) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [grading, setGrading] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchAttempts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await assistantApi.getQuizAttempts(quizId, { limit: 100 });
      const payload = res?.data?.data ?? res?.data ?? res;
      const items = Array.isArray(payload) ? payload : payload?.data ?? payload?.items ?? [];
      setAttempts(items);
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تحميل المحاولات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttempts(); }, [quizId]);

  const filtered = filter === 'all'
    ? attempts
    : attempts.filter((a) => a.status === filter);

  const stats = {
    total: attempts.length,
    graded: attempts.filter((a) => a.status === 'graded').length,
    pending: attempts.filter((a) => a.status === 'submitted').length,
    passed: attempts.filter((a) => a.passed === true).length,
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي', value: stats.total, color: 'text-gray-900 dark:text-white' },
          { label: 'مصححة', value: stats.graded, color: 'text-emerald-600' },
          { label: 'بانتظار التصحيح', value: stats.pending, color: 'text-amber-600' },
          { label: 'ناجحون', value: stats.passed, color: 'text-primary-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border p-3">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'الكل' },
          { key: 'submitted', label: 'بانتظار التصحيح' },
          { key: 'graded', label: 'مصححة' },
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              filter === f.key
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-900 border text-gray-700 dark:text-gray-300'
            }`}>
            {f.label} ({f.key === 'all' ? attempts.length : attempts.filter((a) => a.status === f.key).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-sm text-gray-500 bg-white dark:bg-gray-900 rounded-xl border">
          لا توجد محاولات مطابقة.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((a) => (
              <div key={a.id} className="p-4 flex flex-wrap items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold shrink-0">
                  {a.student?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {a.student?.name || 'طالب'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{a.student?.email || ''}</p>
                  {a.submittedAt && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {new Date(a.submittedAt).toLocaleString('ar-EG')}
                    </p>
                  )}
                </div>

                <span className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0">
                  محاولة #{a.attemptNumber}
                </span>

                {a.status === 'graded' ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${
                      a.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {a.passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {a.score}/{a.maxScore}
                    </span>
                    {a.percentage != null && (
                      <span className="text-xs text-gray-500">{Number(a.percentage).toFixed(0)}%</span>
                    )}
                  </div>
                ) : (
                  <span className={`text-xs px-2 py-1 rounded-md font-bold shrink-0 ${STATUS_COLORS[a.status] || ''}`}>
                    {STATUS_LABELS[a.status] || a.status}
                  </span>
                )}

                {/* ✅ زرار التصحيح — يظهر لو المساعد عنده quizzes.grade */}
                {a.status !== 'cancelled' && a.status !== 'in_progress' && (
                  <PermissionGate permission="quizzes.grade">
                    <button onClick={() => setGrading(a)}
                      className="text-xs px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg hover:bg-primary-100 font-medium shrink-0">
                      {a.status === 'graded' ? 'تعديل الدرجة' : 'تصحيح'}
                    </button>
                  </PermissionGate>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {grading && (
        <AssistantGradeAttemptModal
          attempt={grading}
          onClose={() => setGrading(null)}
          onSuccess={() => { setGrading(null); fetchAttempts(); }}
        />
      )}
    </div>
  );
}