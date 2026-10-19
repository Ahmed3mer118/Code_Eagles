import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useI18n } from '../../../../shared/i18n';
import teacherApi from '../../../../shared/api/teacherApi';

export default function CreateCourseModal({ isOpen, onClose, course, onSuccess }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    title: '',
    subjectId: '',
    description: '',
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
    if (course) {
      setForm({
        title: course.title || '',
        subjectId: course.subjectId || '',
        description: course.description || '',
      });
    } else {
      setForm({ title: '', subjectId: '', description: '' });
    }
    setError('');
  }, [course, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // نبحث عن المادة المختارة عشان ناخد الـ gradeLevel بتاعها
      const selectedSubject = subjects.find((s) => s.id === form.subjectId);
      const gradeLevel = selectedSubject?.gradeLevel;

      const payload = {
        title: form.title,
        subjectId: form.subjectId,
        description: form.description,
        ...(gradeLevel && { gradeLevel }),
      };

      if (course) {
        await teacherApi.updateCourse(course.id, payload);
      } else {
        await teacherApi.createCourse(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || t('common.error') || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {course ? t('common.edit') : t('common.addNew')} {t('sidebar.courses')}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* المادة */}
          <div>
            <label className="block text-sm font-medium mb-1">{t('teacher.courses.form.subject')} *</label>
            <select
              required
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              disabled={fetching}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">{fetching ? t('common.loading') : `— ${t('common.choose')} —`}</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* اسم الكورس */}
          <div>
            <label className="block text-sm font-medium mb-1">{t('common.name')} *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {/* الوصف */}
          <div>
            <label className="block text-sm font-medium mb-1">{t('common.description')}</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={loading || fetching} className="flex-1 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">
              {loading ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
