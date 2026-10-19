import { useState, useEffect } from 'react';
import { useCreateAssignment } from '../../hooks/useAssignments';
import teacherApi from '@/shared/api/teacherApi';

export function CreateAssignmentModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    subjectId: '', // الحقل الجديد
    dueDate: '',
    maxPoints: 100,
    allowLateSubmission: false,
    latePenaltyPercent: 0,
  });

  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  const createMut = useCreateAssignment();

  // جلب المواد عند فتح المودال
  useEffect(() => {
    if (!open) return;

    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      try {
        const res = await teacherApi.getSubjects({ limit: 100 }); // نجيب كل المواد
        // التأكد من شكل الداتا
        const subjectsData = res?.data?.data || res?.data || [];
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      } catch (err) {
        console.error('Failed to load subjects', err);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [open]);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: form.title.trim(),
      maxPoints: Number(form.maxPoints),
      allowLateSubmission: form.allowLateSubmission,
    };

    // إضافة الوصف لو موجود
    if (form.description.trim()) {
      payload.description = form.description.trim();
    }

    // إضافة المادة لو تم اختيارها
    if (form.subjectId) {
      payload.subjectId = form.subjectId;
    }

    // إضافة تاريخ التسليم لو موجود
    if (form.dueDate) {
      payload.dueDate = new Date(form.dueDate).toISOString();
    }

    // إضافة نسبة الخصم لو التأخير مسموح
    if (form.allowLateSubmission) {
      payload.latePenaltyPercent = Number(form.latePenaltyPercent);
    }

    try {
      const assignment = await createMut.mutateAsync(payload);
      onCreated?.(assignment);
      onClose();
    } catch (err) {
      alert(err?.response?.data?.message || 'فشل إنشاء التكليف');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold mb-4">تكليف جديد</h2>

        <label className="block mb-3">
          <span className="text-sm font-medium">العنوان *</span>
          <input
            required
            minLength={2}
            maxLength={300}
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </label>

        {/* الحقل الجديد للمادة */}
        <label className="block mb-3">
          <span className="text-sm font-medium">المادة (اختياري)</span>
          <select
            value={form.subjectId}
            onChange={(e) => handleChange('subjectId', e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
            disabled={isLoadingSubjects}
          >
            <option value="">
              {isLoadingSubjects ? 'جاري تحميل المواد...' : '-- اختر المادة --'}
            </option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block mb-3">
          <span className="text-sm font-medium">الوصف</span>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
            rows={3}
          />
        </label>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <label>
            <span className="text-sm font-medium">تاريخ التسليم</span>
            <input
              type="datetime-local"
              value={form.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>
          <label>
            <span className="text-sm font-medium">الدرجة الكلية</span>
            <input
              type="number"
              min={1}
              value={form.maxPoints}
              onChange={(e) => handleChange('maxPoints', e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>
        </div>

        <div className="space-y-2 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.allowLateSubmission}
              onChange={(e) =>
                handleChange('allowLateSubmission', e.target.checked)
              }
            />
            <span>السماح بالتسليم المتأخر</span>
          </label>

          {form.allowLateSubmission && (
            <label className="block">
              <span className="text-sm font-medium">
                نسبة خصم التأخير (%)
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={form.latePenaltyPercent}
                onChange={(e) =>
                  handleChange('latePenaltyPercent', e.target.value)
                }
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </label>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={createMut.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {createMut.isPending ? 'جاري الحفظ...' : 'إنشاء'}
          </button>
        </div>
      </form>
    </div>
  );
}
