// src/features/student/pages/StudentGrades.jsx
import { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Search,
  BookOpen,
  ClipboardList,
} from 'lucide-react';
import useStudentGrades from '../hooks/useStudentGrades';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function StudentGrades() {
  const { grades, isLoading, error, refetch } = useStudentGrades();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, passed, failed

  const filteredGrades = grades.filter((g) => {
    const title = g.quiz?.title || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'passed') return matchesSearch && g.passed === true;
    if (filter === 'failed') return matchesSearch && g.passed === false;
    return matchesSearch;
  });

  // حساب الإحصائيات
  const totalAttempts = grades.length;
  const passedAttempts = grades.filter((g) => g.passed === true).length;
  const failedAttempts = grades.filter((g) => g.passed === false).length;
  
  // حساب المعدل (متوسط النسب المئوية للمحاولات المصححة)
  const gradedOnly = grades.filter((g) => g.percentage !== null && g.percentage !== undefined);
  const averageScore = gradedOnly.length > 0 
    ? Math.round(gradedOnly.reduce((sum, g) => sum + Number(g.percentage), 0) / gradedOnly.length) 
    : 0;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Award size={24} className="text-indigo-600" />
          درجاتي
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          تابع نتائجك في الاختبارات والواجبات
        </p>
      </div>

      {/* Stats */}
      {!isLoading && !error && totalAttempts > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
              <ClipboardList size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">إجمالي الاختبارات</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{totalAttempts}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">ناجح</p>
              <p className="text-xl font-bold text-emerald-600">{passedAttempts}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600">
              <XCircle size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">راسب</p>
              <p className="text-xl font-bold text-red-600">{failedAttempts}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">المعدل العام</p>
              <p className="text-xl font-bold text-primary-600">{averageScore}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      {!isLoading && !error && totalAttempts > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex flex-wrap gap-2 items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم الاختبار..."
              className="w-full pr-9 pl-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'الكل' },
              { key: 'passed', label: 'ناجح' },
              { key: 'failed', label: 'راسب' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === f.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading / Error / Empty / List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={36} className="text-red-500 mb-3" />
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold"
          >
            <RefreshCw size={16} /> حاول تاني
          </button>
        </div>
      ) : filteredGrades.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Award size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            مفيش درجات
          </h3>
          <p className="mt-1 text-sm text-gray-500 max-w-md">
            {searchTerm || filter !== 'all' 
              ? 'مفيش نتائج مطابقة للبحث أو الفلتر.' 
              : 'لسه مخلصتش أي اختبارات عشان تظهر درجاتك هنا.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filteredGrades.map((grade) => {
            const passed = grade.passed === true;
            const score = grade.score ?? 0;
            const maxScore = grade.maxScore ?? grade.quiz?.totalMarks ?? 100;
            const percentage = grade.percentage !== null ? Math.round(grade.percentage) : null;

            return (
              <div 
                key={grade.id} 
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      passed 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' 
                        : 'bg-red-50 dark:bg-red-900/20 text-red-600'
                    }`}>
                      {passed ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                        {grade.quiz?.title || 'اختبار'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        {formatDate(grade.submittedAt || grade.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <span className={`shrink-0 px-2 py-1 rounded text-[11px] font-bold ${
                    passed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                           : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {passed ? 'ناجح' : 'راسب'}
                  </span>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[10px] text-gray-500">الدرجة</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {score} / {maxScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">النسبة</p>
                      <p className={`text-sm font-bold ${passed ? 'text-emerald-600' : 'text-red-600'}`}>
                        {percentage !== null ? `${percentage}%` : '—'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    محاولة {grade.attemptNumber || 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
