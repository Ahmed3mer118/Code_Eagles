// src/features/student/components/AcademySelector.jsx
import { Search, GraduationCap, Users, BookOpen, Loader2 } from 'lucide-react';
import useAcademies from '../hooks/useAcademies';

export default function AcademySelector({ onSelect }) {
  const { data, loading, error, search, setSearch } = useAcademies();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          الخطوة 1: اختر الأكاديمية
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          اختر أكاديمية لتصفح خطط الدفع المتاحة
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم الأكاديمية..."
          className="w-full ps-10 pe-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Loader2 className="animate-spin me-2" size={20} />
          جاري تحميل الأكاديميات...
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
          حدث خطأ في تحميل الأكاديميات. حاول مرة أخرى.
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">لا توجد أكاديميات متاحة</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && data.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((academy) => (
            <button
              key={academy.id}
              type="button"
              onClick={() => onSelect(academy)}
              className="group text-start bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:border-primary-400 transition"
            >
              <div className="h-24 bg-gradient-to-br from-primary-500 to-primary-700 relative">
                {academy.coverUrl && (
                  <img
                    src={academy.coverUrl}
                    alt={academy.name}
                    className="w-full h-full object-cover"
                  />
                )}
                {academy.logoUrl && (
                  <div className="absolute -bottom-5 start-3 w-12 h-12 rounded-lg bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-800 overflow-hidden shadow">
                    <img
                      src={academy.logoUrl}
                      alt={academy.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="p-4 pt-7">
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition">
                  {academy.name}
                </h3>
                {academy.ownerName && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    بواسطة {academy.ownerName}
                  </p>
                )}
                {academy.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {academy.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {academy.studentsCount ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={12} />
                    {academy.coursesCount ?? 0}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
