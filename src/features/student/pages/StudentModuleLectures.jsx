import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Video,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Inbox,
} from 'lucide-react';
import useStudentLectures from '../hooks/useStudentLectures';

// format duration (seconds) → "12:34"
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ===== Skeleton =====
function SkeletonItem() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
      <div className="flex gap-4">
        <div className="w-32 h-20 bg-gray-200 dark:bg-gray-800 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

// ===== Lecture Item =====
function LectureItem({ lecture }) {
  const navigate = useNavigate();
  const progress = lecture.progress;
  const watched = progress?.watchedSeconds ?? 0;
  const completed = progress?.completed ?? false;
  const duration = lecture.duration ?? 0;
  const percent =
    duration > 0 ? Math.min(100, Math.round((watched / duration) * 100)) : 0;

  return (
    <button
      onClick={() => navigate(`/student/lectures/${lecture.id}`)}
      className="w-full text-start bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all group"
    >
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 shrink-0">
          {lecture.thumbnailUrl ? (
            <img
              src={lecture.thumbnailUrl}
              alt={lecture.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video size={28} className="text-white/80" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
            <PlayCircle size={28} className="text-white" />
          </div>
          {completed && (
            <div className="absolute top-1.5 end-1.5">
              <CheckCircle2 size={18} className="text-green-400 drop-shadow" />
            </div>
          )}
          {lecture.isFree && (
            <span className="absolute top-1.5 start-1.5 px-1.5 py-0.5 rounded bg-green-500 text-white text-[9px] font-bold">
              مجاني
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 transition-colors">
            {lecture.title}
          </h3>
          {lecture.description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
              {lecture.description}
            </p>
          )}

          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
            {duration > 0 && (
              <span className="inline-flex items-center gap-1">
                <Clock size={12} />
                {formatDuration(duration)}
              </span>
            )}
            {progress && (
              <span className="text-primary-600 dark:text-primary-400 font-medium">
                شاهدت {percent}%
              </span>
            )}
          </div>

          {/* Progress bar */}
          {progress && duration > 0 && (
            <div className="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  completed ? 'bg-green-500' : 'bg-primary-500'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ===== Main =====
export default function StudentModuleLectures() {
  const { moduleId } = useParams();
  const { lectures, isLoading, error, refetch } = useStudentLectures(moduleId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/student/lectures"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-3"
        >
          <ArrowRight size={16} />
          رجوع
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Video size={24} className="text-primary-600" />
          المحاضرات
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isLoading
            ? 'جاري التحميل...'
            : lectures.length > 0
            ? `${lectures.length} محاضرة`
            : 'محاضرات الوحدة'}
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonItem key={i} />
          ))}
        </div>
      ) : error ? (
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
      ) : lectures.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Inbox size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            مفيش محاضرات
          </h3>
          <p className="mt-1 text-sm text-gray-500 max-w-md">
            الوحدة دي لسه مفيهاش محاضرات منشورة.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {lectures.map((lecture) => (
            <LectureItem key={lecture.id} lecture={lecture} />
          ))}
        </div>
      )}
    </div>
  );
}
