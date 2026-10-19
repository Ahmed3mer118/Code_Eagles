// src/features/student/pages/StudentSubjectDetails.jsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  Layers,
  GraduationCap,
  Video,
  FileText,
  ClipboardList,
  Users,
  Calendar,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  Play,
  User,
  Clock,
} from 'lucide-react';
import useStudentSubjectDetails from '../hooks/useStudentSubjectDetails';

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

function GroupCard({ group, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg transition text-right"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-gray-900 dark:text-white truncate">
            {group.name}
          </h4>
          {group.teacher?.name && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <User size={10} />
              {group.teacher.name}
            </p>
          )}
        </div>
        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
          <Users size={14} className="text-primary-600" />
        </div>
      </div>
      {group.schedule && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock size={10} />
          {typeof group.schedule === 'string'
            ? group.schedule
            : JSON.stringify(group.schedule).slice(0, 50)}
        </div>
      )}
    </button>
  );
}

export default function StudentSubjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    subject,
    courses,
    groups,
    lectures,
    assignments,
    quizzes,
    loading,
    error,
    refetch,
  } = useStudentSubjectDetails(id);

  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: BookOpen },
    {
      id: 'groups',
      label: 'المجموعات',
      icon: Layers,
      count: groups.length,
    },
    {
      id: 'courses',
      label: 'الكورسات',
      icon: GraduationCap,
      count: courses.length,
    },
    {
      id: 'lectures',
      label: 'المحاضرات',
      icon: Video,
      count: lectures.length,
    },
    {
      id: 'assignments',
      label: 'الواجبات',
      icon: FileText,
      count: assignments.length,
    },
    {
      id: 'quizzes',
      label: 'الاختبارات',
      icon: ClipboardList,
      count: quizzes.length,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
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
        <div className="flex gap-2">
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold"
          >
            <RefreshCw size={16} /> حاول تاني
          </button>
          <button
            onClick={() => navigate('/student/subjects')}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5" dir="rtl">
      {/* Back button */}
      <button
        onClick={() => navigate('/student/subjects')}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition"
      >
        <ArrowRight size={16} />
        رجوع للمواد
      </button>

      {/* Hero */}
      <div className="bg-gradient-to-l from-primary-500 via-indigo-500 to-violet-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <BookOpen size={32} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">
              {subject?.name || 'تفاصيل المادة'}
            </h1>
            {subject?.description && (
              <p className="text-sm opacity-90 mt-1 line-clamp-2">
                {subject.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatItem
          icon={Layers}
          label="المجموعات"
          value={groups.length}
          color="indigo"
        />
        <StatItem
          icon={GraduationCap}
          label="الكورسات"
          value={courses.length}
          color="emerald"
        />
        <StatItem
          icon={Video}
          label="المحاضرات"
          value={lectures.length}
          color="amber"
        />
        <StatItem
          icon={FileText}
          label="الواجبات"
          value={assignments.length}
          color="violet"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1.5 flex flex-wrap gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={14} />
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Groups Preview */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Layers size={16} className="text-primary-500" />
              مجموعاتك في المادة
            </h3>
            {groups.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">
                لسه ما انضميتش لأي مجموعة
              </p>
            ) : (
              <div className="space-y-2">
                {groups.slice(0, 3).map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center text-xs font-bold">
                      {g.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {g.name}
                      </p>
                      {g.teacher?.name && (
                        <p className="text-xs text-gray-500 truncate">
                          {g.teacher.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-amber-500" />
              القادم قريباً
            </h3>
            {[...assignments, ...quizzes].length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">
                مفيش حاجة قادمة
              </p>
            ) : (
              <div className="space-y-2">
                {[...assignments, ...quizzes]
                  .filter((x) => x.dueDate && new Date(x.dueDate) > new Date())
                  .slice(0, 3)
                  .map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center shrink-0">
                        <Clock size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {fmtDate(item.dueDate)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'groups' && (
        <div>
          {groups.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <Layers size={28} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">لا توجد مجموعات</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {groups.map((g) => (
                <GroupCard
                  key={g.id}
                  group={g}
                  onClick={() => navigate('/student/enrollments')}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'courses' && (
        <div>
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <GraduationCap size={28} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">لا توجد كورسات</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() =>
                    navigate(`/student/courses/${course.id}`)
                  }
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition text-right"
                >
                  <div className="h-32 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    {course.coverImage ? (
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <GraduationCap size={32} className="text-white opacity-90" />
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {course.title}
                    </h4>
                    {course.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {course.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'lectures' && (
        <div>
          {lectures.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <Video size={28} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">لا توجد محاضرات</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lectures.map((lecture) => (
                <button
                  key={lecture.id}
                  onClick={() =>
                    navigate(`/student/lectures/${lecture.id}`)
                  }
                  className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex items-center gap-3 hover:shadow-md transition text-right"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center shrink-0">
                    <Play size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {lecture.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {lecture.duration
                        ? `${Math.round(lecture.duration / 60)} دقيقة`
                        : fmtDate(lecture.createdAt)}
                    </p>
                  </div>
                  <ChevronLeft size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div>
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <FileText size={28} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">لا توجد واجبات</p>
            </div>
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => (
                <button
                  key={a.id}
                  onClick={() =>
                    navigate(`/student/assignments/${a.id}`)
                  }
                  className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex items-center gap-3 hover:shadow-md transition text-right"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {a.title}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={10} />
                      {fmtDate(a.dueDate)}
                    </p>
                  </div>
                  <ChevronLeft size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div>
          {quizzes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <ClipboardList size={28} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">لا توجد اختبارات</p>
            </div>
          ) : (
            <div className="space-y-2">
              {quizzes.map((q) => (
                <button
                  key={q.id}
                  onClick={() => navigate(`/student/quizzes`)}
                  className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex items-center gap-3 hover:shadow-md transition text-right"
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center shrink-0">
                    <ClipboardList size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {q.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {q.durationMinutes
                        ? `${q.durationMinutes} دقيقة`
                        : '—'}
                    </p>
                  </div>
                  <ChevronLeft size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
