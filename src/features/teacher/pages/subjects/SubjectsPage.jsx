import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, BookOpen, Pencil, Trash2, Eye, CheckCircle, Archive } from 'lucide-react';
import { useI18n } from '../../../../shared/i18n';
import teacherApi from '../../../../shared/api/teacherApi';
import CreateSubjectModal from './CreateSubjectModal';
import EmptyState from '../../components/EmptyState';

export default function SubjectsPage() {
  const { t } = useI18n();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await teacherApi.getSubjects({ search, limit: 100 });
      setSubjects(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchSubjects(), 400);
    return () => clearTimeout(timer);
  }, [fetchSubjects]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete') || 'هل أنت متأكد من الحذف؟')) return;
    setDeletingId(id);
    try {
      await teacherApi.deleteSubject(id);
      fetchSubjects();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublish = async (id) => {
    setActionLoadingId(id);
    try {
      await teacherApi.publishSubject(id);
      fetchSubjects();
    } catch (err) {
      console.error('Publish failed', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleArchive = async (id) => {
    setActionLoadingId(id);
    try {
      await teacherApi.archiveSubject(id);
      fetchSubjects();
    } catch (err) {
      console.error('Archive failed', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ترجمة الحالات
  const statusLabel = (status) => {
    const labels = {
      draft: t('teacher.status.draft') || 'مسودة',
      published: t('teacher.status.published') || 'منشور',
      archived: t('teacher.status.archived') || 'مؤرشف',
    };
    return labels[status] || status;
  };

  const statusColor = (status) => {
    const colors = {
      draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      archived: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    };
    return colors[status] || colors.draft;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen size={24} /> {t('sidebar.subjects')}
          </h1>
          <p className="text-sm text-gray-500">{t('teacher.subjects.subtitle') || 'إدارة المواد الدراسية'}</p>
        </div>
        <button
          onClick={() => { setEditingSubject(null); setIsModalOpen(true); }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition"
        >
          <Plus size={18} /> {t('common.addNew') || 'إضافة مادة'}
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
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t('teacher.subjects.empty') || 'لا توجد مواد'}
          description={t('teacher.subjects.emptyHint') || 'ابدأ بإضافة مادة جديدة'}
          actionLabel={t('common.addNew') || 'إضافة مادة'}
          onAction={() => { setEditingSubject(null); setIsModalOpen(true); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => (
            <div key={sub.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{sub.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{sub.description || '—'}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(sub.status)}`}>
                  {statusLabel(sub.status)}
                </span>
              </div>
              
              <div className="flex justify-end gap-1 mt-auto pt-2 border-t dark:border-gray-800">
                {/* زرار النشر */}
                {sub.status === 'draft' && (
                  <button
                    onClick={() => handlePublish(sub.id)}
                    disabled={actionLoadingId === sub.id}
                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg disabled:opacity-50"
                    title="نشر"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
                {/* زرار الأرشفة */}
                {sub.status === 'published' && (
                  <button
                    onClick={() => handleArchive(sub.id)}
                    disabled={actionLoadingId === sub.id}
                    className="p-1.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg disabled:opacity-50"
                    title="أرشفة"
                  >
                    <Archive size={16} />
                  </button>
                )}
                {/* زرار التعديل */}
                <button
                  onClick={() => { setEditingSubject(sub); setIsModalOpen(true); }}
                  className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  title="تعديل"
                >
                  <Pencil size={16} />
                </button>
                {/* زرار الحذف */}
                <button
                  onClick={() => handleDelete(sub.id)}
                  disabled={deletingId === sub.id}
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
        <CreateSubjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          subject={editingSubject}
          onSuccess={fetchSubjects}
        />
      )}
    </div>
  );
}
