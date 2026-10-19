import { useState, useEffect } from 'react';
import { X, Check, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// تم تصحيح المسار هنا (5 مستويات لفوق)
import teacherApi from '../../../../../shared/api/teacherApi';

export default function AssignGroupsModal({ assistant, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [groupsRes, assistantRes] = await Promise.all([
          teacherApi.getGroups({ limit: 100 }),
          teacherApi.getAssistant(assistant.id),
        ]);

        const allGroups = groupsRes.data?.data ?? groupsRes.data ?? [];
        const assignedGroups = assistantRes.data?.groups ?? [];

        setGroups(allGroups);
        setSelected(new Set(assignedGroups.map((g) => g.id)));
      } catch (err) {
        setError(err?.response?.data?.message || t('teacher.assistants.messages.error'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [assistant.id]);

  const toggle = (groupId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const handleSubmit = async () => {
    setError('');
    setSaving(true);
    try {
      await teacherApi.assignAssistantGroups(assistant.id, {
        groupIds: Array.from(selected),
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || t('teacher.assistants.messages.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users size={20} />
              {t('teacher.assistants.groups.title')}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-3">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('teacher.assistants.groups.noGroups')}
            </div>
          ) : (
            <div className="space-y-2">
              {groups.map((group) => {
                const isSelected = selected.has(group.id);
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => toggle(group.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-start transition-colors ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-primary-600 border-primary-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {group.name}
                      </p>
                      {group.gradeLevel && (
                        <p className="text-xs text-gray-500">
                          {group.gradeLevel}
                        </p>
                      )}
                    </div>
                    {group._count?.enrollments != null && (
                      <span className="text-xs text-gray-500">
                        {group._count.enrollments} {t('teacher.assistants.table.students')}
                      </span>
                    )}
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
            disabled={saving || loading}
            className="flex-1 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? t('common.loading') : t('teacher.assistants.actions.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
