// src/features/student/pages/StudentSubjects.jsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Layers,
  GraduationCap,
  ChevronLeft,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import useStudentSubjects from '../hooks/useStudentSubjects';

const COLORS = [
  { bg: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600' },
  { bg: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600' },
  { bg: 'from-amber-500 to-orange-600', light: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600' },
  { bg: 'from-violet-500 to-purple-600', light: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600' },
  { bg: 'from-rose-500 to-pink-600', light: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600' },
  { bg: 'from-cyan-500 to-teal-600', light: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600' },
];

function SubjectCard({ subject, index, onClick }) {
  const color = COLORS[index % COLORS.length];
  const groupsCount = subject.groups?.length || subject.enrollmentsCount || 0;
  const coursesCount = subject.coursesCount || subject._count?.courses || 0;

  return (
    <button
      onClick={onClick}
      className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-700 transition-all text-right w-full"
    >
      {/* Header */}
      <div
        className={`relative h-24 bg-gradient-to-br ${color.bg} flex items-center justify-center`}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {subject.coverImage || subject.logoUrl ? (
          <img
            src={subject.coverImage || subject.logoUrl}
            alt={subject.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <BookOpen size={36} className="text-white opacity-90 relative" />
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate">
          {subject.name || 'مادة'}
        </h3>
        {subject.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {subject.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mb-3">
          {groupsCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <Layers size={12} className={color.text} />
              <span>{groupsCount} مجموعة</span>
            </div>
          )}
          {coursesCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <GraduationCap size={12} className={color.text} />
              <span>{coursesCount} كورس</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800`}>
          <span className={`text-xs font-medium ${color.text}`}>
            عرض التفاصيل
          </span>
          <div
            className={`w-7 h-7 rounded-lg ${color.light} flex items-center justify-center group-hover:scale-110 transition`}
          >
            <ChevronLeft size={14} className={color.text} />
          </div>
        </div>
      </div>
    </button>
  );
}

export default function StudentSubjects() {
  const navigate = useNavigate();
  const { subjects, loading, error, refetch } = useStudentSubjects();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return subjects;
    const q = search.toLowerCase();
    return subjects.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q),
    );
  }, [subjects, search]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-56 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"
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
          <BookOpen size={24} className="text-primary-600" />
          المواد
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {subjects.length > 0
            ? `عندك ${subjects.length} مادة`
            : 'المواد الخاصة بك'}
        </p>
      </div>

      {/* Search */}
      {subjects.length > 0 && (
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
              placeholder="ابحث باسم المادة..."
              className="w-full pr-9 pl-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* Empty */}
      {subjects.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            لا توجد مواد
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            لسه ما انضميتش لأي مجموعة، أو المواد ما تم تحميلها بعد. تواصل مع المدرس.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">
            لا توجد نتائج مطابقة للبحث
          </p>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((subject, idx) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                index={idx}
                onClick={() => navigate(`/student/subjects/${subject.id}`)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
