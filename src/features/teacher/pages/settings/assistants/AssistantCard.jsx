import { useState } from 'react';
import { Users, Shield, Pencil, Trash2, UserCog, Power } from 'lucide-react';
// ✅ التعديل هنا: استخدام useI18n بدل useTranslation
import { useI18n } from '../../../../../shared/i18n'; 
import teacherApi from '../../../../../shared/api/teacherApi';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AssistantCard({ assistant, onEdit, onPermissions, onGroups, onDelete, onStatusChange }) {
  // ✅ استخدام useI18n
  const { t } = useI18n();
  const [toggling, setToggling] = useState(false);
  
  const user = assistant.user || {};
  const groupsCount = assistant._count?.groups ?? assistant.groups?.length ?? 0;
  const permissionsCount = assistant.permissions?.length ?? 0;

  // ✅ تعديل بسيط لضمان ظهور الاسم بالكامل لو النص طويل
  const displayName = user.name || 'Unknown';
  const initial = displayName.charAt(0).toUpperCase();

  const handleToggleStatus = async () => {
    const newStatus = assistant.status === 'active' ? 'inactive' : 'active';
    setToggling(true);
    try {
      await teacherApi.updateAssistantStatus(assistant.id, newStatus);
      onStatusChange?.();
    } catch (err) {
      console.error('Failed to toggle status', err);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">
              {initial}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {displayName}
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                STATUS_COLORS[assistant.status] || STATUS_COLORS.inactive
              }`}
            >
              {/* ✅ الترجمة هنا هتشتغل صح دلوقتي */}
              {t(`teacher.assistants.${assistant.status}`)}
            </span>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {user.email}
          </p>
          {user.phoneNumber && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {user.phoneNumber}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Users size={14} />
              {groupsCount} {t('teacher.assistants.table.groups')}
            </span>
            <span className="flex items-center gap-1">
              <Shield size={14} />
              {permissionsCount} {t('teacher.assistants.table.permissions')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          <button
            onClick={handleToggleStatus}
            disabled={toggling}
            className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
              assistant.status === 'active' ? 'text-green-600' : 'text-gray-400'
            } disabled:opacity-50`}
            title={t('teacher.assistants.actions.toggleStatus')}
          >
            <Power size={16} />
          </button>
          <button
            onClick={() => onPermissions(assistant)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            title={t('teacher.assistants.actions.permissions')}
          >
            <Shield size={16} />
          </button>
          <button
            onClick={() => onGroups(assistant)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            title={t('teacher.assistants.actions.groups')}
          >
            <UserCog size={16} />
          </button>
          <button
            onClick={() => onEdit(assistant)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            title={t('teacher.assistants.actions.edit')}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(assistant)}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
            title={t('teacher.assistants.actions.delete')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
