import { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import { useI18n } from '../../../../shared/i18n';
import teacherApi from '../../../../shared/api/teacherApi';

export default function AddStudentToGroupModal({ isOpen, onClose, groupId, currentStudentIds = [], onSuccess }) {
  const { t } = useI18n();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // جلب الطلاب
  useEffect(() => {
    if (!isOpen) return;
    const loadStudents = async () => {
      try {
        setLoading(true);
        // بنجيب الأعضاء من teacher/members ونفلتر بس الطلاب
        const res = await teacherApi.getMembers({ limit: 200 });
        const allMembers = res.data?.data || res.data || [];
        
        // فلترة الطلاب فقط
        const studentsList = allMembers.filter(
          (m) => m.role === 'student' || m.membership?.role === 'student'
        );
        
        // فلترة اللي مش موجودين في المجموعة أصلاً
        const available = studentsList.filter(
          (s) => !currentStudentIds.includes(s.id || s.userId)
        );
        
        setStudents(available);
        setFilteredStudents(available);
      } catch (err) {
        console.error(err);
        setError('فشل في تحميل قائمة الطلاب');
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, [isOpen]);

  // بحث
  useEffect(() => {
    if (!search.trim()) {
      setFilteredStudents(students);
    } else {
      const q = search.toLowerCase();
      setFilteredStudents(
        students.filter(
          (s) => s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, students]);

  const handleAdd = async (studentId) => {
    setSaving(studentId);
    setError('');
    try {
      await teacherApi.addGroupStudent(groupId, { studentId });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل في إضافة الطالب');
    } finally {
      setSaving(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-800">
          <h2 className="text-lg font-bold">إضافة طالب للمجموعة</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b dark:border-gray-800">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو البريد..."
              className="w-full ps-9 pe-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded">{error}</div>}

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              {search ? 'لا توجد نتائج مطابقة' : 'لا يوجد طلاب متاحين للإضافة'}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredStudents.map((s) => (
                <div
                  key={s.id || s.userId}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.email}</p>
                  </div>
                  <button
                    onClick={() => handleAdd(s.id || s.userId)}
                    disabled={saving === (s.id || s.userId)}
                    className="px-3 py-1 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    {saving === (s.id || s.userId) ? '...' : <><Check size={14} /> إضافة</>}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
