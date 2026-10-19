// src/features/assistant/pages/AssistantGroupDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  FileText,
  ClipboardList,
  BookOpen,
  GraduationCap,
  Calendar,
  AlertCircle,
  RefreshCw,
  User,
  Mail,
  Phone,
  Layers,
} from 'lucide-react';
import assistantApi from '../api/assistantApi';
import teacherApi from '../../../shared/api/teacherApi';
import PermissionGate from '../components/PermissionGate';

const GRADE_LABELS = {
  grade_1: 'الصف الأول',
  grade_2: 'الصف الثاني',
  grade_3: 'الصف الثالث',
  grade_4: 'الصف الرابع',
  grade_5: 'الصف الخامس',
  grade_6: 'الصف السادس',
  grade_7: 'الصف السابع',
  grade_8: 'الصف الثامن',
  grade_9: 'الصف التاسع',
  grade_10: 'الصف العاشر',
  grade_11: 'الصف الحادي عشر',
  grade_12: 'الصف الثاني عشر',
};

export default function AssistantGroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('students');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. جلب المجموعة والطلاب (Endpoints المساعد)
        const [groupRes, studentsRes] = await Promise.allSettled([
          assistantApi.getGroupById(id),
          assistantApi.getGroupStudents(id),
        ]);

        const groupData =
          groupRes.status === 'fulfilled'
            ? groupRes.value?.data ?? groupRes.value
            : null;

        const studentsData =
          studentsRes.status === 'fulfilled'
            ? (() => {
                const p = studentsRes.value?.data ?? studentsRes.value;
                return Array.isArray(p) ? p : p?.data ?? [];
              })()
            : [];

        setGroup(groupData);
        setStudents(studentsData);

        // 2. جلب الواجبات والاختبارات (بس لو المساعد عنده صلاحية)
        //    الباك ممكن يرفض (403)، عشان كده بنستخدم allSettled
        const [assignmentsRes, quizzesRes] = await Promise.allSettled([
          teacherApi.getAssignments({ limit: 100, groupId: id }),
          teacherApi.getQuizzes({ limit: 100, groupId: id }),
        ]);

        const extractList = (res) => {
          if (res.status !== 'fulfilled') return [];
          const p = res.value?.data?.data ?? res.value?.data ?? res.value;
          return Array.isArray(p) ? p : p?.data ?? p?.items ?? [];
        };

        setAssignments(extractList(assignmentsRes));
        setQuizzes(extractList(quizzesRes));
      } catch (err) {
        setError(err?.response?.data?.message || 'فشل تحميل بيانات المجموعة');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={36} className="text-red-500 mb-3" />
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => navigate('/assistant/groups')}
          className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg"
        >
          رجوع للمجموعات
        </button>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={36} className="text-amber-500 mb-3" />
        <p className="text-sm text-gray-500">المجموعة غير موجودة</p>
      </div>
    );
  }

  const tabs = [
    { id: 'students', label: 'الطلاب', icon: Users, permission: 'students.view', count: students.length },
    { id: 'assignments', label: 'الواجبات', icon: FileText, permission: 'assignments.view', count: assignments.length },
    { id: 'quizzes', label: 'الاختبارات', icon: ClipboardList, permission: 'quizzes.view', count: quizzes.length },
  ];

  return (
    <div className="space-y-5" dir="rtl">
      {/* Back */}
      <button
        onClick={() => navigate('/assistant/groups')}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition"
      >
        <ArrowRight size={16} /> رجوع للمجموعات
      </button>

      {/* Header */}
      <div className="bg-gradient-to-l from-primary-500 via-indigo-500 to-violet-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={24} />
            <h1 className="text-2xl font-bold">{group.name}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm opacity-90">
            {group.subject?.name && (
              <span className="flex items-center gap-1">
                <BookOpen size={14} /> {group.subject.name}
              </span>
            )}
            {group.gradeLevel && (
              <span className="flex items-center gap-1">
                <GraduationCap size={14} /> {GRADE_LABELS[group.gradeLevel] || group.gradeLevel}
              </span>
            )}
            {group.teacher?.name && (
              <span className="flex items-center gap-1">
                <User size={14} /> المدرس: {group.teacher.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={14} /> {students.length} طالب
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-emerald-500" />
            <span className="text-xs text-gray-500">الطلاب</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{students.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={14} className="text-blue-500" />
            <span className="text-xs text-gray-500">الواجبات</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{assignments.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={14} className="text-amber-500" />
            <span className="text-xs text-gray-500">الاختبارات</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{quizzes.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1.5 flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <PermissionGate key={tab.id} permission={tab.permission}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            </PermissionGate>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        {/* --- الطلاب --- */}
        {activeTab === 'students' && (
          <div>
            {students.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                لا يوجد طلاب في هذه المجموعة.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {students.map((s) => (
                  <div
                    key={s.studentId || s.id}
                    className="p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold shrink-0 overflow-hidden">
                      {s.profileImageUrl ? (
                        <img
                          src={s.profileImageUrl}
                          alt={s.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        s.name?.charAt(0) || '?'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {s.name}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        {s.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={10} /> {s.email}
                          </span>
                        )}
                        {s.phoneNumber && (
                          <span className="flex items-center gap-1">
                            <Phone size={10} /> {s.phoneNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-bold shrink-0 ${
                        s.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s.status === 'active' ? 'نشط' : s.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- الواجبات --- */}
        {activeTab === 'assignments' && (
          <div>
            {assignments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                لا توجد واجبات لهذه المجموعة.
              </p>
            ) : (
              <div className="space-y-2">
                {assignments.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => navigate(`/assistant/assignments/${a.id}`)}
                    className="w-full p-3 flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-right transition"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {a.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {a.dueDate
                          ? `تسليم: ${new Date(a.dueDate).toLocaleDateString('ar-EG')}`
                          : 'بدون تاريخ تسليم'}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 shrink-0">
                      {a.maxPoints} درجة
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- الاختبارات --- */}
        {activeTab === 'quizzes' && (
          <div>
            {quizzes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                لا توجد اختبارات لهذه المجموعة.
              </p>
            ) : (
              <div className="space-y-2">
                {quizzes.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                      <ClipboardList size={18} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {q.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {q.durationMinutes} دقيقة · {q.totalMarks} درجة
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
