// src/features/student/pages/StudentCourseDetails.jsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  BookOpen,
  Video,
  Play,
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Lock,
} from 'lucide-react';
import useStudentCourseDetails from '../hooks/useStudentCourseDetails';

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('ar-EG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

const fmtDuration = (seconds) => {
  if (!seconds) return '—';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours} س ${remainingMins} د`;
};

function StatItem({ icon: Icon, label, value, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600',
  };
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colors[color]}`}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function ModuleAccordion({ module, index, isOpen, onToggle, onLectureClick }) {
  const lectures = module.lectures || [];
  const completedLectures = lectures.filter(
    (l) => l.progress?.completed || l.completed,
  ).length;
  const progress = lectures.length > 0
    ? Math.round((completedLectures / lectures.length) * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition text-right"
      >
        {/* Index */}
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
          {index + 1}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 dark:text-white truncate">
            {module.title || module.name || `وحدة ${index + 1}`}
          </h4>
          <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
            <Video size={10} />
            {lectures.length} محاضرة
            {completedLectures > 0 && (
              <>
                <span>·</span>
                <span className="text-emerald-600 font-medium">
                  {completedLectures} مكتملة
                </span>
              </>
            )}
          </p>
        </div>

        {/* Progress */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-emerald-500 to-emerald-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-10">
            {progress}%
          </span>
        </div>

        {/* Chevron */}
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Lectures */}
      {isOpen && (
        <div className="border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          {lectures.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              لا توجد محاضرات في هذه الوحدة
            </div>
          ) : (
            lectures.map((lecture, lIdx) => {
              const isCompleted =
                lecture.progress?.completed || lecture.completed || false;
              const isLocked =
                lecture.isLocked || lecture.locked || false;

              return (
                <button
                  key={lecture.id}
                  onClick={() => !isLocked && onLectureClick(lecture)}
                  disabled={isLocked}
                  className={`w-full flex items-center gap-3 p-3 pr-14 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition text-right disabled:opacity-50 disabled:cursor-not-allowed ${
                    isCompleted ? 'bg-emerald-50/30 dark:bg-emerald-900/5' : ''
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                        : isLocked
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                          : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                    }`}
                  >
                    {isLocked ? (
                      <Lock size={14} />
                    ) : isCompleted ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <Play size={14} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isCompleted
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {lecture.title || `محاضرة ${lIdx + 1}`}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      {lecture.durationSeconds || lecture.duration ? (
                        <>
                          <Clock size={10} />
                          {fmtDuration(
                            lecture.durationSeconds || lecture.duration,
                          )}
                        </>
                      ) : (
                        fmtDate(lecture.createdAt)
                      )}
                    </p>
                  </div>

                  {/* Play icon */}
                  {!isLocked && (
                    <ChevronLeft size={16} className="text-gray-400 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function StudentCourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { course, modules, lectures, loading, error, refetch } =
    useStudentCourseDetails(courseId);

  const [openModules, setOpenModules] = useState(() => {
    // فتح أول module افتراضياً
    return { 0: true };
  });

  const toggleModule = (index) => {
    setOpenModules((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleLectureClick = (lecture) => {
    navigate(`/student/lectures/${lecture.id}`);
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={36} className="text-red-500 mb-3" />
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <div className="flex gap-2">
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold"
          >
            <RefreshCw size={16} /> حاول تاني
          </button>
          <button
            onClick={() => navigate('/student/courses')}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  // حساب الإحصائيات
  const totalLectures = lectures.length;
  const completedLectures = lectures.filter(
    (l) => l.progress?.completed || l.completed,
  ).length;
  const overallProgress =
    totalLectures > 0
      ? Math.round((completedLectures / totalLectures) * 100)
      : 0;

  const totalDuration = lectures.reduce(
    (sum, l) => sum + (l.durationSeconds || l.duration || 0),
    0,
  );

  return (
    <div className="space-y-5" dir="rtl">
      {/* Back */}
      <button
        onClick={() => navigate('/student/courses')}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition"
      >
        <ArrowRight size={16} />
        رجوع للكورسات
      </button>

      {/* Hero */}
      <div className="relative bg-gradient-to-l from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl overflow-hidden">
        {/* Cover */}
        {course?.coverImage && (
          <div className="absolute inset-0">
            <img
              src={course.coverImage}
              alt={course.title}
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-emerald-500/80 to-cyan-500/80" />
          </div>
        )}

        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        <div className="relative p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <GraduationCap size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold">
                {course?.title || course?.name || 'تفاصيل الكورس'}
              </h1>
              {course?.description && (
                <p className="text-sm opacity-90 mt-1 line-clamp-2">
                  {course.description}
                </p>
              )}

              {/* Overall progress */}
              {overallProgress > 0 && (
                <div className="mt-4 max-w-xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="opacity-90">التقدم الكلي</span>
                    <span className="font-bold">{overallProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatItem
          icon={BookOpen}
          label="الوحدات"
          value={modules.length}
          color="indigo"
        />
        <StatItem
          icon={Video}
          label="المحاضرات"
          value={totalLectures}
          color="emerald"
        />
        <StatItem
          icon={CheckCircle2}
          label="مكتملة"
          value={completedLectures}
          color="amber"
        />
        <StatItem
          icon={Clock}
          label="المدة"
          value={fmtDuration(totalDuration)}
          color="violet"
        />
      </div>

      {/* Modules */}
      <div>
        <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <BookOpen size={16} className="text-primary-500" />
          محتوى الكورس
        </h3>

        {modules.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <BookOpen size={28} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              لا توجد وحدات في هذا الكورس بعد
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map((module, idx) => (
              <ModuleAccordion
                key={module.id || idx}
                module={module}
                index={idx}
                isOpen={openModules[idx] || false}
                onToggle={() => toggleModule(idx)}
                onLectureClick={handleLectureClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      {modules.length > 0 && completedLectures < totalLectures && (
        <div className="bg-gradient-to-l from-primary-500 to-indigo-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Play size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">استمر في التعلم!</h3>
              <p className="text-xs opacity-90 mt-0.5">
                لسه عندك {totalLectures - completedLectures} محاضرة مكملتهاش
              </p>
            </div>
            <button
              onClick={() => {
                const nextLecture = lectures.find(
                  (l) => !(l.progress?.completed || l.completed) && !l.isLocked,
                );
                if (nextLecture) handleLectureClick(nextLecture);
              }}
              className="px-4 py-2 bg-white text-primary-600 rounded-lg text-sm font-bold hover:bg-gray-100 transition shrink-0"
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {/* Completed Message */}
      {modules.length > 0 && completedLectures === totalLectures && totalLectures > 0 && (
        <div className="bg-gradient-to-l from-emerald-500 to-teal-600 rounded-2xl p-5 text-white text-center">
          <CheckCircle2 size={32} className="mx-auto mb-2" />
          <h3 className="font-bold text-lg">أكملت الكورس! 🎉</h3>
          <p className="text-sm opacity-90 mt-1">
            مبروك! خلصت كل المحاضرات
          </p>
        </div>
      )}
    </div>
  );
}
