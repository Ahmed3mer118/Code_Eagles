// src/features/teacher/pages/points/StudentPicker.jsx
import { useEffect, useState } from 'react';
import { Search, CheckCircle2, User, X } from 'lucide-react';
import useStudentsList from '../../hooks/useStudentsList';

export default function StudentPicker({ selectedIds = [], onChange }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const { students, loading } = useStudentsList(search);

  const isSelected = (id) => selectedIds.includes(id);

  const toggle = (student) => {
    const userId = student.userId || student.id;
    if (isSelected(userId)) {
      onChange(selectedIds.filter((id) => id !== userId));
    } else {
      onChange([...selectedIds, userId]);
    }
  };

  const selected = students.filter((s) =>
    selectedIds.includes(s.userId || s.id),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
          الطلاب <span className="text-red-500">*</span>
        </label>
        {selectedIds.length > 0 && (
          <span className="text-xs font-medium text-primary-600">
            {selectedIds.length} مختار
          </span>
        )}
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((s) => {
            const userId = s.userId || s.id;
            return (
              <span
                key={userId}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg text-xs font-medium"
              >
                {s.name}
                <button
                  type="button"
                  onClick={() => toggle(s)}
                  className="hover:text-primary-900"
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm text-right flex items-center justify-between focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <span className="text-gray-500">
            {selectedIds.length > 0
              ? `${selectedIds.length} طالب مختار`
              : 'اختر الطلاب'}
          </span>
          <User size={16} className="text-gray-400" />
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setOpen(false)}
            />
            <div className="absolute z-40 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-72 overflow-hidden flex flex-col">
              {/* Search */}
              <div className="p-2 border-b border-gray-100 dark:border-gray-800 relative">
                <Search
                  size={14}
                  className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث بالاسم أو البريد..."
                  className="w-full pr-7 pl-2 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-md text-xs outline-none focus:ring-1 focus:ring-primary-500"
                  autoFocus
                />
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-xs text-gray-400">
                    جاري التحميل...
                  </div>
                ) : students.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">
                    لا يوجد طلاب
                  </div>
                ) : (
                  students.map((s) => {
                    const userId = s.userId || s.id;
                    const sel = isSelected(userId);
                    return (
                      <button
                        key={userId}
                        type="button"
                        onClick={() => toggle(s)}
                        className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-right transition ${
                          sel ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                        }`}
                      >
                        {s.profileImageUrl ? (
                          <img
                            src={s.profileImageUrl}
                            alt={s.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {s.name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0 text-right">
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {s.email}
                          </p>
                        </div>
                        {sel && (
                          <CheckCircle2
                            size={16}
                            className="text-primary-500 shrink-0"
                          />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full py-1.5 bg-primary-600 text-white text-xs rounded-md hover:bg-primary-700"
                >
                  تم ({selectedIds.length})
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
