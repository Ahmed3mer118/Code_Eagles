import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useI18n } from '../../../../shared/i18n';
import teacherApi from '../../../../shared/api/teacherApi';

export default function CreateGroupModal({ isOpen, onClose, group, onSuccess }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: '',
    subjectId: '',
    gradeLevel: '',
    capacity: 30,
    meetingDays: [],
  });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  // جلب المواد
  useEffect(() => {
    if (!isOpen) return;
    const loadSubjects = async () => {
      try {
        setFetching(true);
        const res = await teacherApi.getSubjects({ limit: 100 });
        setSubjects(res.data?.data || res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    loadSubjects();
  }, [isOpen]);

  useEffect(() => {
    if (group) {
      setForm({
        name: group.name || '',
        subjectId: group.subjectId || '',
        gradeLevel: group.gradeLevel || '',
        capacity: group.capacity || 30,
        meetingDays: group.meetingDays || [],
      });
    } else {
      setForm({ name: '', subjectId: '', gradeLevel: '', capacity: 30, meetingDays: [] });
    }
    setError('');
  }, [group, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        subjectId: form.subjectId,
        gradeLevel: form.gradeLevel || undefined,
        capacity: Number(form.capacity) || 30,
      };
      if (group) {
        await teacherApi.updateGroup(group.id, payload);
      } else {
        await teacherApi.createGroup(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const gradeLevels = [
    'grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5', 'grade_6',
    'grade_7', 'grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {group ? 'تعديل مجموعة' : 'إضافة مجموعة جديدة'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم المجموعة *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">المادة *</label>
            <select
              required
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              disabled={fetching}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">{fetching ? 'جاري التحميل...' : '— اختر مادة —'}</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">الصف الدراسي</label>
              <select
                value={form.gradeLevel}
                onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">— اختر —</option>
                {gradeLevels.map((g) => (
                  <option key={g} value={g}>{t(`grades.${g}`) || g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">السعة</label>
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">
              إلغاء
            </button>
            <button type="submit" disabled={loading || fetching} className="flex-1 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
