// src/features/assistant/pages/AssistantGradeAttemptModal.jsx
import { useState, useEffect } from 'react';
import { X, Award, AlertCircle } from 'lucide-react';
import assistantApi from '../api/assistantApi';

const getText = (v) => {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') return v.ar || v.en || '';
  return String(v);
};

export default function AssistantGradeAttemptModal({ attempt, onClose, onSuccess }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({}); // { answerId: marksAwarded }
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await assistantApi.getQuizAttempt(attempt.id);
        const data = res?.data?.data ?? res?.data ?? res;
        setDetails(data);
        // prefill الدرجات
        const map = {};
        (data?.answers || []).forEach((a) => {
          map[a.id] = a.marksAwarded ?? 0;
        });
        setAnswers(map);
      } catch (err) {
        setError(err?.response?.data?.message || 'فشل تحميل تفاصيل المحاولة');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [attempt.id]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      // بعض الـ backends بتقبل manualGrades: [{ answerId, marks }]
      // وبعضها بيحسب تلقائي — ده الـ shape الشائع
      await assistantApi.gradeQuizAttempt(attempt.id, {
        manualGrades: Object.entries(answers).map(([answerId, marks]) => ({
          answerId,
          marksAwarded: Number(marks),
        })),
      });
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل حفظ الدرجات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" dir="rtl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              تصحيح - {attempt.student?.name}
            </h3>
            <p className="text-xs text-gray-500">محاولة #{attempt.attemptNumber}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="text-center">
                  <p className="text-xs text-gray-500">الدرجة</p>
                  <p className="text-lg font-bold text-primary-600">
                    {details?.score ?? 0} / {details?.maxScore ?? '—'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">النسبة</p>
                  <p className="text-lg font-bold text-indigo-600">
                    {details?.percentage != null ? `${Number(details.percentage).toFixed(0)}%` : '—'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">النتيجة</p>
                  <p className={`text-lg font-bold ${details?.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                    {details?.passed ? 'ناجح' : 'راسب'}
                  </p>
                </div>
              </div>

              {/* Answers */}
              <div className="space-y-2">
                {(details?.answers || []).map((ans, i) => {
                  const q = ans.question;
                  if (!q) return null;
                  const maxMarks = q.marks || 1;
                  return (
                    <div key={ans.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-1">
                            سؤال {i + 1} · {q.marks} درجة
                          </p>
                          <p className="font-medium text-sm">{getText(q.text)}</p>
                        </div>
                        <div className="shrink-0">
                          {ans.isCorrect === true && <span className="text-emerald-600 text-xs font-bold">✓ صحيح</span>}
                          {ans.isCorrect === false && <span className="text-red-600 text-xs font-bold">✗ خطأ</span>}
                        </div>
                      </div>

                      {/* إجابة الطالب */}
                      <div className="text-xs bg-gray-50 dark:bg-gray-800 rounded p-2 mb-2">
                        <span className="text-gray-500">إجابة الطالب: </span>
                        <span className="font-medium">
                          {ans.textAnswer || getText(ans.selectedOptionRef?.text) || '—'}
                        </span>
                      </div>

                      {/* الدرجة اليدوية */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">الدرجة الممنوحة:</label>
                        <input
                          type="number"
                          min={0}
                          max={maxMarks}
                          value={answers[ans.id] ?? 0}
                          onChange={(e) => {
                            const v = Math.min(maxMarks, Math.max(0, Number(e.target.value) || 0));
                            setAnswers((p) => ({ ...p, [ans.id]: v }));
                          }}
                          className="w-20 border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                        />
                        <span className="text-xs text-gray-400">/ {maxMarks}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t border-gray-100 dark:border-gray-800">
          <button onClick={handleSave} disabled={saving || loading || !!error}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50">
            <Award size={16} />
            {saving ? 'جاري الحفظ...' : 'حفظ الدرجات'}
          </button>
          <button onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}