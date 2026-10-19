// src/features/student/pages/StudentLecturePlayer.jsx
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Video,
  Clock,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Play,
  Lock,
  Download,
  FileText,
} from 'lucide-react';
import useStudentLecture from '../hooks/useStudentLecture';
import { updateLectureProgress } from '../api/lectures.api';
import { getVideoUrl, getThumbnailUrl } from '../utils/videoUrl';

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function StudentLecturePlayer() {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const { lecture, isLoading, error, refetch } = useStudentLecture(lectureId);
  const videoRef = useRef(null);
  const lastSentRef = useRef(0);
  const [isMarkedComplete, setIsMarkedComplete] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // 🆕 حل مشكلة الفيديو
  const videoUrl = useMemo(() => getVideoUrl(lecture), [lecture]);
  const thumbnailUrl = useMemo(() => getThumbnailUrl(lecture), [lecture]);

  const sendProgress = useCallback(
    async (watchedSeconds, completed) => {
      try {
        await updateLectureProgress(lectureId, {
          watchedSeconds: Math.floor(watchedSeconds),
          ...(completed !== undefined ? { completed } : {}),
        });
      } catch (err) {
        console.warn('Failed to update progress:', err);
      }
    },
    [lectureId],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = Math.floor(video.currentTime);
      if (current - lastSentRef.current >= 15) {
        lastSentRef.current = current;
        sendProgress(current);
      }
    };

    const handleEnded = () => {
      sendProgress(Math.floor(video.duration), true);
      setIsMarkedComplete(true);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [sendProgress, lecture]);

  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video && video.currentTime > 0) {
        sendProgress(Math.floor(video.currentTime));
      }
    };
  }, [sendProgress]);

  // ========== Loading ==========
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
    );
  }

  // ========== Error ==========
  if (error || !lecture) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={36} className="text-red-500 mb-3" />
        <p className="text-sm text-gray-500 mb-4">
          {error || 'المحاضرة غير موجودة'}
        </p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold"
        >
          <RefreshCw size={16} /> حاول تاني
        </button>
      </div>
    );
  }

  const quizzes = lecture.quizzes || [];
  const progress = lecture.progress;
  const watched = progress?.watchedSeconds ?? 0;
  const duration = lecture.duration ?? 0;
  const percent =
    duration > 0 ? Math.min(100, Math.round((watched / duration) * 100)) : 0;
  const completed = progress?.completed || isMarkedComplete;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link
          to="/student/lectures"
          className="inline-flex items-center gap-1.5 hover:text-primary-600 transition-colors"
        >
          <ArrowRight size={16} />
          المحاضرات
        </Link>
        {lecture.module?.course && (
          <>
            <span>/</span>
            <Link
              to={`/student/courses/${lecture.module.course.id}`}
              className="hover:text-primary-600 transition-colors"
            >
              {lecture.module.course.title}
            </Link>
          </>
        )}
        {lecture.module && (
          <>
            <span>/</span>
            <Link
              to={`/student/modules/${lecture.module.id}/lectures`}
              className="hover:text-primary-600 transition-colors"
            >
              {lecture.module.title}
            </Link>
          </>
        )}
      </div>

      {/* Video Player */}
      <div className="rounded-2xl overflow-hidden bg-black aspect-video relative">
        {videoUrl && !videoError ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnailUrl || undefined}
            controls
            controlsList="nodownload"
            preload="metadata"
            playsInline
            className="w-full h-full"
            onError={(e) => {
              console.error('Video load error:', {
                url: videoUrl,
                error: e.target.error,
              });
              setVideoError(true);
            }}
          >
            <source src={videoUrl} type="video/mp4" />
            {/* Fallback لو mp4 مش شغال */}
            <source src={videoUrl} type="video/webm" />
            <p className="text-white text-center p-4">
              متصفحك لا يدعم تشغيل الفيديو
            </p>
          </video>
        ) : videoError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/70 p-6 text-center">
            <AlertCircle size={48} className="mb-3 text-red-400" />
            <p className="text-sm font-medium mb-2">تعذر تحميل الفيديو</p>
            <p className="text-xs text-white/50 mb-3 max-w-md">
              الرابط: {videoUrl || 'غير متوفر'}
            </p>
            <button
              onClick={() => {
                setVideoError(false);
                refetch();
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/70 p-6">
            <Video size={48} className="mb-3" />
            <p className="text-sm">الفيديو مش متاح حالياً</p>
          </div>
        )}
      </div>

      {/* Title & Meta */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
          {lecture.title}
          {completed && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold">
              <CheckCircle2 size={14} />
              مكتملة
            </span>
          )}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          {duration > 0 && (
            <span className="inline-flex items-center gap-1">
              <Clock size={14} />
              {formatDuration(duration)}
            </span>
          )}
          {lecture.isFree && (
            <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold">
              مجاني
            </span>
          )}
          {progress && (
            <span className="text-primary-600 dark:text-primary-400 font-medium">
              شاهدت {percent}% {completed ? '✓' : ''}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {progress && duration > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>التقدم</span>
              <span className="font-bold">{percent}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  completed ? 'bg-emerald-500' : 'bg-primary-500'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {lecture.pdfUrl && (
          <a
            href={lecture.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <FileText size={16} />
            تحميل الملف
          </a>
        )}
        {lecture.attachmentUrl && (
          <a
            href={lecture.attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <Download size={16} />
            تحميل المرفقات
          </a>
        )}
      </div>

      {/* Description */}
      {lecture.description && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
            الوصف
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {lecture.description}
          </p>
        </div>
      )}

      {/* Quizzes */}
      {quizzes.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
            <ClipboardList size={20} className="text-indigo-600" />
            اختبارات المحاضرة
          </h2>
          <div className="space-y-2">
            {quizzes.map((q) => (
              <button
                key={q.id}
                onClick={() => navigate(`/student/quizzes/${q.id}`)}
                className="w-full text-start bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ClipboardList
                      size={16}
                      className="text-indigo-600 shrink-0"
                    />
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {q.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                    <Clock size={12} />
                    {q.durationMinutes} د
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-medium">
                      {q.totalMarks} درجة
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
