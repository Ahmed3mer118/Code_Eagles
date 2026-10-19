// src/features/assistant/pages/AssistantStudents.jsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Mail,
  Phone,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  Layers,
  Eye,
} from 'lucide-react';
import useAssistantStudents from '../hooks/useAssistantStudents';
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

function StudentCard({ student, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all text-right w-full"
    >
      <div className="flex items-start gap-3 mb-3">
        {student.profileImageUrl ? (
          <img
            src={student.profileImageUrl}
            alt={student.name}
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center text-lg font-bold shrink-0">
            {student.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white truncate">
            {student.name}
          </h3>
          <p className="text-xs text-gray-500 truncate flex items-center gap-1">
            <Mail size={10} /> {student.email}
          </p>
        </div>
        <span
          className={`text-[10px] px-2 py-1 rounded-full font-bold shrink-0 ${
            student.status === 'active'
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {student.status === 'active' ? 'نشط' : student.status || '—'}
        </span>
      </div>

      {/* Groups */}
      {student.groups?.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-gray-500 mb-1.5 flex items-center gap-1">
            <Layers size={10} /> المجموعات ({student.groups.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {student.groups.slice(0, 2).map((g) => (
              <span
                key={g.id}
                className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-md text-[10px] font-medium truncate max-w-[120px]"
              >
                {g.name}
              </span>
            ))}
            {student.groups.length > 2 && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-[10px] font-medium">
                +{student.groups.length - 2}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs font-medium text-primary-600">
          عرض التفاصيل
        </span>
        <Eye
          size={14}
          className="text-primary-600 group-hover:scale-110 transition"
        />
      </div>
    </button>
  );
}

export default function AssistantStudents() {
  const navigate = useNavigate();
  const { students, groups, loading, error, refetch } = useAssistantStudents();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phoneNumber?.toLowerCase().includes(q),
    );
  }, [students, search]);

  return (
    <PermissionGate
      permission="students.view"
      fallback={
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={36} className="text-amber-500 mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ليس لديك صلاحية لعرض الطلاب. تواصل مع المدرس لتفعيلها.
          </p>
        </div>
      }
    >
      <div className="space-y-5" dir="rtl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users size={24} className="text-primary-600" />
            الطلاب
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {students.length > 0
              ? `${students.length} طالب في ${groups.length} مجموعة`
              : 'طلاب مجموعاتك'}
          </p>
        </div>

        {/* Stats */}
        {students.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users size={14} className="text-primary-500" />
                <span className="text-xs text-gray-500">إجمالي الطلاب</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {students.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Layers size={14} className="text-emerald-500" />
                <span className="text-xs text-gray-500">المجموعات</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                {groups.length}
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        {students.length > 0 && (
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
                placeholder="ابحث بالاسم أو البريد أو الهاتف..."
                className="w-full pr-9 pl-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
            <button onClick={refetch} className="mr-auto text-xs underline">
              إعادة المحاولة
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Users size={36} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              لا يوجد طلاب
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              لم يتم تسجيل طلاب في مجموعاتك بعد.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">لا توجد نتائج مطابقة للبحث</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((student) => (
              <StudentCard
                key={student.studentId || student.id}
                student={student}
                onClick={() =>
                  navigate(`/assistant/students/${student.studentId || student.id}`)
                }
              />
            ))}
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
