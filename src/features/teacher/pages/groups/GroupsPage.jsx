import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Users, Pencil, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../../../shared/i18n';
import teacherApi from '../../../../shared/api/teacherApi';
import CreateGroupModal from './CreateGroupModal';
import EmptyState from '../../components/EmptyState';

export default function GroupsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await teacherApi.getGroups({ search, limit: 100 });
      setGroups(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchGroups(), 400);
    return () => clearTimeout(timer);
  }, [fetchGroups]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete') || 'هل أنت متأكد من الحذف؟')) return;
    setDeletingId(id);
    try {
      await teacherApi.deleteGroup(id);
      fetchGroups();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users size={24} /> {t('sidebar.groups')}
          </h1>
          <p className="text-sm text-gray-500">{t('teacher.groups.subtitle') || 'إدارة مجموعات الطلاب'}</p>
        </div>
        <button
          onClick={() => { setEditingGroup(null); setIsModalOpen(true); }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition"
        >
          <Plus size={18} /> {t('common.addNew') || 'إضافة مجموعة'}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={t('common.search') || 'بحث...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full ps-10 pe-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('teacher.groups.empty') || 'لا توجد مجموعات'}
          description={t('teacher.groups.emptyHint') || 'ابدأ بإضافة مجموعة جديدة'}
          actionLabel={t('common.addNew') || 'إضافة مجموعة'}
          onAction={() => { setEditingGroup(null); setIsModalOpen(true); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div key={group.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{group.name}</h3>
                  {group.subject && (
                    <p className="text-sm text-primary-600">{group.subject.name}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    السعة: {group._count?.enrollments || 0} / {group.capacity}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-1 mt-auto pt-2 border-t dark:border-gray-800">
                <button
                  onClick={() => navigate(`/teacher/groups/${group.id}`)}
                  className="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
                  title="عرض التفاصيل"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => { setEditingGroup(group); setIsModalOpen(true); }}
                  className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  title="تعديل"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(group.id)}
                  disabled={deletingId === group.id}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50"
                  title="حذف"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <CreateGroupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          group={editingGroup}
          onSuccess={fetchGroups}
        />
      )}
    </div>
  );
}
