import { useState, useEffect } from 'react';
import { X, Check, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// تم تصحيح المسار هنا (5 مستويات لفوق)
import teacherApi from '../../../../../shared/api/teacherApi';

export default function PermissionsModal({ assistant, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(new Set());
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setFetching(true);
        const res = await teacherApi.getAvailablePermissions();
        setAvailablePermissions(res.data ?? []);
        if (assistant?.permissions) {
          setSelected(new Set(assistant.permissions));
        }
      } catch (err) {
        setError(err?.response?.data?.message || t('teacher.assistants.messages.error'));
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [assistant]);

  const toggle = (perm) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) next.delete(perm);
      else next.add(perm);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(availablePermissions.map((p) => p.key)));
  const clearAll = () => setSelected(new Set());

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await teacherApi.updateAssistantPermissions(assistant.id, {
        permissions: Array.from(selected),
      });
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
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield size={20} />
              {t('teacher.assistants.permissions.title')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {assistant.user?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Actions Bar */}
        <div className="flex gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={selectAll}
            className="text-sm px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100"
          >
            {t('teacher.assistants.permissions.selectAll')}
          </button>
          <button
            onClick={clearAll}
            className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
          >
            {t('teacher.assistants.permissions.clearAll')}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-3">
              {error}
            </div>
          )}

          {fetching ? (
            <p className="text-center text-gray-500 py-8">{t('common.loading')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availablePermissions.map((perm) => {
                const isSelected = selected.has(perm.key);
                return (
                  <button
                    key={perm.key}
                    type="button"
                    onClick={() => toggle(perm.key)}
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

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t('teacher.assistants.actions.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || fetching}
            className="flex-1 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? t('common.loading') : t('teacher.assistants.actions.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
