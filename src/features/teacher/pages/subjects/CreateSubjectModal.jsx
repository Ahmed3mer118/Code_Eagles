import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useI18n } from '../../../../shared/i18n';
import teacherApi from '../../../../shared/api/teacherApi';

export default function CreateSubjectModal({ isOpen, onClose, subject, onSuccess }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: '', description: '', gradeLevel: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (subject) {
      setForm({
        name: subject.name || '',
        description: subject.description || '',
        gradeLevel: subject.gradeLevel || ''
      });
    } else {
      setForm({ name: '', description: '', gradeLevel: '' });
    }
    setError('');
  }, [subject, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        description: form.description,
        ...(form.gradeLevel && { gradeLevel: form.gradeLevel }),
      };
      if (subject) {
        await teacherApi.updateSubject(subject.id, payload);
      } else {
        await teacherApi.createSubject(payload);
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

  const gradeLevels = [
    'grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5', 'grade_6',
    'grade_7', 'grade_8', 'grade_9', 'grade_10', 'grade_11', 'grade_12'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {subject ? t('common.edit') : t('common.addNew')} {t('sidebar.subjects')}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* اسم المادة */}
          <div>
            <label className="block text-sm font-medium mb-1">{t('common.name')} *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* الصف الدراسي */}
          <div>
            <label className="block text-sm font-medium mb-1">{t('common.gradeLevel')}</label>
            <select
              value={form.gradeLevel}
              onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">— {t('common.choose')} —</option>
              {gradeLevels.map((g) => (
                <option key={g} value={g}>{t(`grades.${g}`) || g}</option>
              ))}
            </select>
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
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">
              {loading ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
