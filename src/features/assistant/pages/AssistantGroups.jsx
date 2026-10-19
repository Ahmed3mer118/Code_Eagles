// src/features/assistant/pages/AssistantGroups.jsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Users,
  Search,
  BookOpen,
  ChevronLeft,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import useAssistantGroups from '../hooks/useAssistantGroups';

const COLOR_PALETTES = [
  { bg: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600' },
  { bg: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600' },
  { bg: 'from-amber-500 to-orange-600', light: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600' },
  { bg: 'from-violet-500 to-purple-600', light: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600' },
  { bg: 'from-rose-500 to-pink-600', light: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600' },
  { bg: 'from-cyan-500 to-teal-600', light: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600' },
];

// أسماء الصفوف الدراسية
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

function GroupCard({ group, index, onClick }) {
  const color = COLOR_PALETTES[index % COLOR_PALETTES.length];
  const studentsCount = group._count?.enrollments || 0;

  return (
    <button
      onClick={onClick}
      className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-700 transition-all text-right w-full"
    >
      {/* Header */}
      <div
        className={`relative h-24 bg-gradient-to-br ${color.bg} flex items-center justify-center overflow-hidden`}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <Layers size={40} className="text-white opacity-90 relative" />

        {/* Badge عدد الطلاب */}
        <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
          <Users size={12} className="text-gray-700 dark:text-gray-300" />
          <span className="text-[10px] font-bold text-gray-900 dark:text-white">
            {studentsCount}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate">
          {group.name || 'مجموعة'}
        </h3>

        {group.subject?.name && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mb-2 truncate">
            <BookOpen size={12} className={color.text} />
            {group.subject.name}
          </p>
        )}

        {/* Stats */}
        <div className="space-y-1.5 mt-3">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Users size={12} className={color.text} />
            <span>{studentsCount} طالب</span>
          </div>

          {group.gradeLevel && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <GraduationCap size={12} className={color.text} />
              <span>{GRADE_LABELS[group.gradeLevel] || group.gradeLevel}</span>
            </div>
          )}

          {group.schedule && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Calendar size={12} className={color.text} />
              <span className="truncate">
                {typeof group.schedule === 'string'
                  ? group.schedule
                  : JSON.stringify(group.schedule).slice(0, 30)}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
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

export default function AssistantGroups() {
  const navigate = useNavigate();
  const { groups, loading, error, refetch } = useAssistantGroups();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups.filter(
      (g) =>
        g.name?.toLowerCase().includes(q) ||
        g.subject?.name?.toLowerCase().includes(q) ||
        g.gradeLevel?.toLowerCase().includes(q),
    );
  }, [groups, search]);

  // إحصائيات
  const totalStudents = groups.reduce(
    (sum, g) => sum + (g._count?.enrollments || 0),
    0,
  );

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
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
          <Layers size={24} className="text-primary-600" />
          مجموعاتي
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {groups.length > 0
            ? `${groups.length} مجموعة · ${totalStudents} طالب`
            : 'المجموعات المخصصة لك'}
        </p>
      </div>

      {/* Stats Summary */}
      {groups.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Layers size={14} className="text-indigo-500" />
              <span className="text-xs text-gray-500">المجموعات</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {groups.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-emerald-500" />
              <span className="text-xs text-gray-500">إجمالي الطلاب</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {totalStudents}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      {groups.length > 0 && (
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
              placeholder="ابحث باسم المجموعة أو المادة..."
              className="w-full pr-9 pl-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {groups.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Layers size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            لا توجد مجموعات
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            لم يتم تخصيص أي مجموعات لك حتى الآن. تواصل مع المدرس.
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
          {filtered.map((group, idx) => (
            <GroupCard
              key={group.id}
              group={group}
              index={idx}
              onClick={() => navigate(`/assistant/groups/${group.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
