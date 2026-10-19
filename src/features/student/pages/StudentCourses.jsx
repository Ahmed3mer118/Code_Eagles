// src/features/student/pages/StudentCourses.jsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  BookOpen,
  Video,
  ChevronLeft,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import useStudentCourses from '../hooks/useStudentCourses';

const COLORS = [
  { bg: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600' },
  { bg: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600' },
  { bg: 'from-amber-500 to-orange-600', light: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600' },
  { bg: 'from-violet-500 to-purple-600', light: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600' },
  { bg: 'from-rose-500 to-pink-600', light: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600' },
  { bg: 'from-cyan-500 to-teal-600', light: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600' },
];

function CourseCard({ course, index, onClick }) {
  const color = COLORS[index % COLORS.length];
  const modulesCount = course._count?.modules || course.modules?.length || 0;
  const lecturesCount = course._count?.lectures || course.lectures?.length || 0;

  // نسبة التقدم لو موجودة
  const progress = course.progress || course.progressPercent || 0;

  return (
    <button
      onClick={onClick}
      className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-700 transition-all text-right w-full"
    >
      {/* Cover */}
      <div
        className={`relative h-32 bg-gradient-to-br ${color.bg} flex items-center justify-center overflow-hidden`}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {course.coverImage ? (
          <img
            src={course.coverImage}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <GraduationCap size={48} className="text-white opacity-90 relative" />
        )}

        {/* Progress badge */}
        {progress > 0 && (
          <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-gray-900 dark:text-white">
              {progress}%
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate">
          {course.title || course.name || 'كورس'}
        </h3>
        {course.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {course.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mb-3">
          {modulesCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <BookOpen size={12} className={color.text} />
              <span>{modulesCount} وحدة</span>
            </div>
          )}
          {lecturesCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <Video size={12} className={color.text} />
              <span>{lecturesCount} محاضرة</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {progress > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
              <span>التقدم</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-emerald-500 to-emerald-600 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <span className={`text-xs font-medium ${color.text}`}>
            عرض الكورس
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

export default function StudentCourses() {
  const navigate = useNavigate();
  const { courses, loading, error, refetch } = useStudentCourses();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return courses;
    const q = search.toLowerCase();
    return courses.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q),
    );
  }, [courses, search]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"
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
          <GraduationCap size={24} className="text-primary-600" />
          الكورسات
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {courses.length > 0
            ? `عندك ${courses.length} كورس`
            : 'الكورسات المتاحة لك'}
        </p>
      </div>

      {/* Search */}
      {courses.length > 0 && (
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
              placeholder="ابحث باسم الكورس..."
              className="w-full pr-9 pl-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* Empty */}
      {courses.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            لا توجد كورسات
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            لسه ما انضميتش لأي كورس، أو المدرس ما أضافش كورسات بعد.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">
            لا توجد نتائج مطابقة للبحث
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course, idx) => (
            <CourseCard
              key={course.id}
              course={course}
              index={idx}
              onClick={() => navigate(`/student/courses/${course.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
