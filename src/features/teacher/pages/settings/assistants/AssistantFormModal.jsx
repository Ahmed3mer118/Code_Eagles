import { useState, useEffect } from 'react';
import { X, Shield, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// تم تصحيح المسار هنا (5 مستويات لفوق)
import teacherApi from '../../../../../shared/api/teacherApi';

export default function AssistantFormModal({ assistant, onClose, onSuccess }) {
  const { t } = useTranslation();
  const isEdit = !!assistant;

  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingPermissions, setFetchingPermissions] = useState(false);
  const [error, setError] = useState('');

  // Fetch available permissions (only for create)
  useEffect(() => {
    if (!isEdit) {
      const fetchPerms = async () => {
        try {
          setFetchingPermissions(true);
          const res = await teacherApi.getAvailablePermissions();
          setAvailablePermissions(res.data ?? []);
        } catch {
          // Fallback if endpoint fails
          setAvailablePermissions([
            { key: 'groups.view', label: 'View Groups' },
            { key: 'groups.manage', label: 'Manage Groups' },
            { key: 'students.view', label: 'View Students' },
            { key: 'assignments.view', label: 'View Assignments' },
            { key: 'assignments.grade', label: 'Grade Assignments' },
          ]);
        } finally {
          setFetchingPermissions(false);
        }
      };
      fetchPerms();
    }
  }, [isEdit]);

  useEffect(() => {
    if (assistant) {
      setForm({
        name: assistant.user?.name || '',
        email: assistant.user?.email || '',
        phoneNumber: assistant.user?.phoneNumber || '',
        password: '',
      });
    }
  }, [assistant]);

  const togglePermission = (key) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await teacherApi.updateAssistant(assistant.id, {
          name: form.name,
          phoneNumber: form.phoneNumber || undefined,
        });
      } else {
        await teacherApi.createAssistant({
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber || undefined,
          password: form.password || undefined,
          permissions: Array.from(selectedPermissions),
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || t('teacher.assistants.messages.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit
              ? t('teacher.assistants.form.editTitle')
              : t('teacher.assistants.form.createTitle')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {t('teacher.assistants.form.name')} *
              </label>
              <input
                type="text"
                required
                minLength={2}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('teacher.assistants.form.namePlaceholder')}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Email (only for create) */}
            {!isEdit && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  {t('teacher.assistants.form.email')} *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={t('teacher.assistants.form.emailPlaceholder')}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {t('teacher.assistants.form.phone')}
              </label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                placeholder={t('teacher.assistants.form.phonePlaceholder')}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Password (only for create) */}
            {!isEdit && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  {t('teacher.assistants.form.password')}
                </label>
                <input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={t('teacher.assistants.form.passwordPlaceholder')}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('teacher.assistants.form.passwordHint')}
                </p>
              </div>
            )}
          </div>

          {/* Permissions (only for create) */}
          {!isEdit && (
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={18} className="text-primary-600" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('teacher.assistants.form.permissions')}
                </h3>
              </div>
              {fetchingPermissions ? (
                <p className="text-sm text-gray-500">{t('common.loading')}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availablePermissions.map((perm) => {
                    const isSelected = selectedPermissions.has(perm.key);
                    return (
                      <button
                        key={perm.key}
                        type="button"
                        onClick={() => togglePermission(perm.key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-start text-sm transition-colors ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'bg-primary-600 border-primary-600'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                        <span>{perm.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {t('teacher.assistants.actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('teacher.assistants.actions.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
