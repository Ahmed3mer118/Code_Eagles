// src/features/assistant/pages/AssistantStudentDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  User,
  Mail,
  Phone,
  GraduationCap,
  Layers,
  BookOpen,
  Star,
  Award,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
  Clock,
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

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0">
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

export default function AssistantStudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. جلب مجموعات المساعد
        const groupsRes = await assistantApi.getGroups();
        const groupsPayload = groupsRes?.data ?? groupsRes;
        const groupsList = Array.isArray(groupsPayload)
          ? groupsPayload
          : groupsPayload?.data ?? [];

        // 2. نبحث عن الطالب في كل مجموعة
        let foundStudent = null;
        const studentGroups = [];

        for (const group of groupsList) {
          try {
            const studentsRes = await assistantApi.getGroupStudents(group.id);
            const p = studentsRes?.data ?? studentsRes;
            const students = Array.isArray(p) ? p : p?.data ?? [];
            const found = students.find(
              (s) => (s.studentId || s.id) === id,
            );
            if (found) {
              if (!foundStudent) foundStudent = found;
              studentGroups.push({
                id: group.id,
                name: group.name,
                subject: group.subject?.name,
                teacher: group.teacher?.name,
              });
            }
          } catch {
            // تجاهل - مجموعة ممكن فشلت
          }
        }

        if (!foundStudent) {
          throw new Error('الطالب غير موجود في مجموعاتك');
        }

        setStudent({ ...foundStudent, groups: studentGroups });

        // 3. جلب النقاط (اختياري - ممكن يرجع 403)
        try {
          const pointsRes = await teacherApi.getStudentPoints(id);
          const pointsData = pointsRes?.data?.data ?? pointsRes?.data ?? pointsRes;
          setPoints(pointsData);
        } catch {
          setPoints(null); // المساعد مش عنده صلاحية points.view
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'فشل تحميل بيانات الطالب');
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
          onClick={() => navigate('/assistant/students')}
          className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg"
        >
          رجوع للطلاب
        </button>
      </div>
    );
  }

  return (
    <PermissionGate
      permission="students.view"
      fallback={
        <div className="text-center py-16">
          <AlertCircle size={36} className="text-amber-500 mb-3" />
          <p className="text-sm text-gray-500">ليس لديك صلاحية لعرض هذا الطالب.</p>
        </div>
      }
    >
      <div className="space-y-5" dir="rtl">
        <button
          onClick={() => navigate('/assistant/students')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition"
        >
          <ArrowRight size={16} /> رجوع للطلاب
        </button>

        {/* Hero */}
        <div className="bg-gradient-to-l from-primary-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            {student?.profileImageUrl ? (
              <img
                src={student.profileImageUrl}
                alt={student.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold">
                {student?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{student?.name}</h1>
              <p className="text-sm opacity-90 flex items-center gap-1 mt-1">
                <Mail size={14} /> {student?.email}
              </p>
              {student?.gradeLevel && (
                <p className="text-sm opacity-90 flex items-center gap-1 mt-1">
                  <GraduationCap size={14} /> {GRADE_LABELS[student.gradeLevel] || student.gradeLevel}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Layers size={14} className="text-indigo-500" />
              <span className="text-xs text-gray-500">المجموعات</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {student?.groups?.length || 0}
            </p>
          </div>
          {points && (
            <>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Star size={14} className="text-amber-500" />
                  <span className="text-xs text-gray-500">النقاط</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">
                  {points?.totalPoints ?? 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Award size={14} className="text-purple-500" />
                  <span className="text-xs text-gray-500">المستوى</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  Lv.{points?.level ?? 1}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={14} className="text-emerald-500" />
                  <span className="text-xs text-gray-500">XP</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  {points?.xp ?? 0}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Info + Groups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* بيانات */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h2 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <User size={16} className="text-primary-500" /> بيانات الطالب
            </h2>
            <InfoRow icon={User} label="الاسم" value={student?.name} />
            <InfoRow icon={Mail} label="البريد الإلكتروني" value={student?.email} />
            <InfoRow icon={Phone} label="رقم الهاتف" value={student?.phoneNumber} />
            <InfoRow
              icon={GraduationCap}
              label="الصف الدراسي"
              value={
                student?.gradeLevel
                  ? GRADE_LABELS[student.gradeLevel] || student.gradeLevel
                  : null
              }
            />
            <InfoRow
              icon={Clock}
              label="حالة التسجيل"
              value={student?.status === 'active' ? 'نشط' : student?.status}
            />
          </div>

          {/* المجموعات */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h2 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Layers size={16} className="text-indigo-500" /> المجموعات (
              {student?.groups?.length || 0})
            </h2>
            {student?.groups?.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                غير مسجل في أي مجموعة.
              </p>
            ) : (
              <div className="space-y-2">
                {student?.groups?.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => navigate(`/assistant/groups/${g.id}`)}
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-right transition"
                  >
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {g.name}
                    </p>
                    {g.subject && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <BookOpen size={10} /> {g.subject}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* سجل النقاط */}
        {points?.logs?.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h2 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Star size={16} className="text-amber-500" /> آخر النقاط
            </h2>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {points.logs.slice(0, 10).map((log) => {
                const pts = Number(log.points || 0);
                const isPositive = pts > 0;
                return (
                  <div key={log.id} className="py-2 flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isPositive
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {log.reason || '—'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleDateString('ar-EG')
                          : '—'}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold shrink-0 ${
                        isPositive ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {pts}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
