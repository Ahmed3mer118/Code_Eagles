// src/features/student/pages/StudentLectures.jsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Search,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  BookOpen,
  GraduationCap,
  ChevronLeft,
  Filter,
} from 'lucide-react';
import useAllStudentLectures from '../hooks/useAllStudentLectures';

const fmtDuration = (seconds) => {
  if (!seconds || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('ar-EG', {
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return '—';
  }
};

function LectureCard({ lecture, onClick, index }) {
  const isCompleted = lecture.progress?.completed || lecture.completed;
  const watched = lecture.progress?.watchedSeconds ?? 0;
  const duration = lecture.duration || 0;
  const percent =
    duration > 0 ? Math.min(100, Math.round((watched / duration) * 100)) : 0;

  return (
    <button
      onClick={onClick}
      className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-700 transition-all text-right w-full"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-primary-500 to-indigo-600 overflow-hidden">
        {lecture.thumbnailUrl ? (
          <img
            src={lecture.thumbnailUrl}
            alt={lecture.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : null}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur flex items-center justify-center">
            <Play size={24} className="text-primary-600 ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Duration */}
        {duration > 0 && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur text-white text-[10px] font-bold flex items-center gap-1">
            <Clock size={10} />
            {fmtDuration(duration)}
          </div>
        )}

        {/* Number */}
        <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white text-xs font-bold">
          {index + 1}
        </div>

        {/* Completed badge */}
        {isCompleted && (
          <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
            <CheckCircle2 size={14} className="text-white" />
          </div>
        )}

        {/* Progress bar */}
        {!isCompleted && percent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div
              className="h-full bg-primary-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">
          {lecture.title}
        </h3>

        {lecture._course?.title && (
          <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-0.5">
            <GraduationCap size={10} />
            <span className="truncate">{lecture._course.title}</span>
          </div>
        )}
        {lecture._module?.title && (
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <BookOpen size={10} />
            <span className="truncate">{lecture._module.title}</span>
          </div>
        )}

        {/* Badges */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {lecture.isFree && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-bold">
              مجاني
            </span>
          )}
          {isCompleted && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              مكتملة
            </span>
          )}
          {!isCompleted && percent > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 font-bold">
              {percent}% مشاهدة
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function LectureRow({ lecture, onClick, index }) {
  const isCompleted = lecture.progress?.completed || lecture.completed;
  const watched = lecture.progress?.watchedSeconds ?? 0;
  const duration = lecture.duration || 0;
  const percent =
    duration > 0 ? Math.min(100, Math.round((watched / duration) * 100)) : 0;

  return (
    <button
      onClick={onClick}
      className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex items-center gap-3 hover:shadow-md hover:border-primary-300 transition text-right"
    >
      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
          isCompleted
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
            : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 size={20} />
        ) : (
          <Play size={20} fill="currentColor" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
          {lecture.title}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
          {lecture._course?.title && (
            <span className="truncate">📚 {lecture._course.title}</span>
          )}
          {lecture._module?.title && (
            <span className="truncate">📖 {lecture._module.title}</span>
          )}
        </div>
        {duration > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
            <Clock size={9} />
            {fmtDuration(duration)}
            {!isCompleted && percent > 0 && (
              <span className="text-amber-600 font-bold ml-1">
                · {percent}% مشاهدة
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chevron */}
      <ChevronLeft size={16} className="text-gray-400 shrink-0" />
    </button>
  );
}

export default function StudentLectures() {
  const navigate = useNavigate();
  const { lectures, loading, error, refetch } = useAllStudentLectures();
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [statusFilter, setStatusFilter] = useState('all'); // all | completed | in_progress

  // الكورسات المتاحة (من المحاضرات)
  const courses = useMemo(() => {
    const map = new Map();
    lectures.forEach((l) => {
      if (l._course?.id && !map.has(l._course.id)) {
        map.set(l._course.id, l._course);
      }
    });
    return Array.from(map.values());
  }, [lectures]);

  const filtered = useMemo(() => {
    return lectures.filter((l) => {
      // فلترة الكورس
      if (courseFilter && l._course?.id !== courseFilter) return false;

      // فلترة الحالة
      const isCompleted = l.progress?.completed || l.completed;
      const watched = l.progress?.watchedSeconds ?? 0;
      if (statusFilter === 'completed' && !isCompleted) return false;
      if (statusFilter === 'in_progress' && (isCompleted || watched === 0)) return false;

      // فلترة البحث
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          l.title?.toLowerCase().includes(q) ||
          l._course?.title?.toLowerCase().includes(q) ||
          l._module?.title?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [lectures, courseFilter, statusFilter, search]);

  // إحصائيات
  const stats = useMemo(() => {
    const completed = lectures.filter((l) => l.progress?.completed || l.completed).length;
    const inProgress = lectures.filter((l) => {
      const watched = l.progress?.watchedSeconds ?? 0;
      return watched > 0 && !(l.progress?.completed || l.completed);
    }).length;
    return { total: lectures.length, completed, inProgress };
  }, [lectures]);

  // Loading
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"
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
          <Video size={24} className="text-primary-600" />
          المحاضرات
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {lectures.length > 0
            ? `عندك ${lectures.length} محاضرة`
            : 'كل المحاضرات المتاحة لك'}
        </p>
      </div>

      {/* Stats */}
      {lectures.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Video size={14} className="text-primary-500" />
              <span className="text-xs text-gray-500">الإجمالي</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-xs text-gray-500">مكتملة</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {stats.completed}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Play size={14} className="text-amber-500" />
              <span className="text-xs text-gray-500">قيد المشاهدة</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {stats.inProgress}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      {lectures.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 space-y-2">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بعنوان المحاضرة..."
                className="w-full pr-9 pl-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-900 text-primary-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                شبكة
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-900 text-primary-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                قائمة
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">كل الكورسات</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title || c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-1">
              {[
                { value: 'all', label: 'الكل' },
                { value: 'in_progress', label: 'قيد المشاهدة' },
                { value: 'completed', label: 'مكتملة' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    statusFilter === f.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty */}
      {lectures.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Video size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            لا توجد محاضرات
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            لسه ما انضميتش لكورس فيه محاضرات، أو المدرس ما أضافش محاضرات بعد.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">
            لا توجد نتائج مطابقة للفلاتر
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lecture, idx) => (
            <LectureCard
              key={lecture.id}
              lecture={lecture}
              index={idx}
              onClick={() => navigate(`/student/lectures/${lecture.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lecture, idx) => (
            <LectureRow
              key={lecture.id}
              lecture={lecture}
              index={idx}
              onClick={() => navigate(`/student/lectures/${lecture.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
