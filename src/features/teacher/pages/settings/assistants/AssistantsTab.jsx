import { useState, useEffect } from 'react';
import { Plus, Search, Filter, UserCog, ChevronLeft, ChevronRight } from 'lucide-react';
// ✅ تم تصحيح المسار هنا (5 مستويات لفوق)
import { useI18n } from '../../../../../shared/i18n';
import { useAssistants } from '../../../hooks/useAssistants';
import AssistantCard from './AssistantCard';
import AssistantFormModal from './AssistantFormModal';
import PermissionsModal from './PermissionsModal';
import AssignGroupsModal from './AssignGroupsModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import EmptyState from '../../../components/EmptyState';

const STATUS_OPTIONS = [
  { value: '', labelKey: 'teacher.assistants.allStatuses' },
  { value: 'active', labelKey: 'teacher.assistants.active' },
  { value: 'inactive', labelKey: 'teacher.assistants.inactive' },
  { value: 'suspended', labelKey: 'teacher.assistants.suspended' },
];

export default function AssistantsTab() {
  // ✅ استخدام useI18n بدل useTranslation
  const { t } = useI18n();

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals
  const [formModal, setFormModal] = useState({ open: false, assistant: null });
  const [permissionsModal, setPermissionsModal] = useState({ open: false, assistant: null });
  const [groupsModal, setGroupsModal] = useState({ open: false, assistant: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, assistant: null });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when status changes
  useEffect(() => {
    setPage(1);
  }, [status]);

  // Data
  const { data: assistants, total, totalPages, loading, error, refetch } = useAssistants({
    search: debouncedSearch || undefined,
    status: status || undefined,
    page,
    limit,
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UserCog size={20} />
            {t('teacher.assistants.title')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('teacher.assistants.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setFormModal({ open: true, assistant: null })}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          {t('teacher.assistants.addNew')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('teacher.assistants.search')}
            className="w-full ps-10 pe-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="relative sm:w-48">
          <Filter
            size={18}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full ps-10 pe-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl">
          {error}
        </div>
      ) : assistants.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title={t('teacher.assistants.empty')}
          description={t('teacher.assistants.emptyHint')}
          actionLabel={t('teacher.assistants.addNew')}
          onAction={() => setFormModal({ open: true, assistant: null })}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {assistants.map((assistant) => (
              <AssistantCard
                key={assistant.id}
                assistant={assistant}
                onEdit={(a) => setFormModal({ open: true, assistant: a })}
                onPermissions={(a) => setPermissionsModal({ open: true, assistant: a })}
                onGroups={(a) => setGroupsModal({ open: true, assistant: a })}
                onDelete={(a) => setDeleteModal({ open: true, assistant: a })}
                onStatusChange={refetch}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500">
                {t('teacher.assistants.showingResults', { count: assistants.length, total })}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {formModal.open && (
        <AssistantFormModal
          assistant={formModal.assistant}
          onClose={() => setFormModal({ open: false, assistant: null })}
          onSuccess={refetch}
        />
      )}

      {permissionsModal.open && (
        <PermissionsModal
          assistant={permissionsModal.assistant}
          onClose={() => setPermissionsModal({ open: false, assistant: null })}
          onSuccess={refetch}
        />
      )}

      {groupsModal.open && (
        <AssignGroupsModal
          assistant={groupsModal.assistant}
          onClose={() => setGroupsModal({ open: false, assistant: null })}
          onSuccess={refetch}
        />
      )}

      {deleteModal.open && (
        <DeleteConfirmModal
          assistant={deleteModal.assistant}
          onClose={() => setDeleteModal({ open: false, assistant: null })}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
