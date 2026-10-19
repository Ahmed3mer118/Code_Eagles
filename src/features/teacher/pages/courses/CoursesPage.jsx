import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, BookOpen, Pencil, Trash2, CheckCircle, Archive, BookMarked } from 'lucide-react';
import { useI18n } from '../../../../shared/i18n';
import teacherApi from '../../../../shared/api/teacherApi';
import CreateCourseModal from './CreateCourseModal';
import EmptyState from '../../components/EmptyState';

export default function CoursesPage() {
  const { t } = useI18n();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await teacherApi.getCourses({ search, limit: 100 });
      setCourses(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCourses(), 400);
    return () => clearTimeout(timer);
  }, [fetchCourses]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete') || 'هل أنت متأكد من الحذف؟')) return;
    setDeletingId(id);
    try {
      await teacherApi.deleteCourse(id);
      fetchCourses();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublish = async (id) => {
    setActionLoadingId(id);
    try {
      await teacherApi.publishCourse(id);
      fetchCourses();
    } catch (err) {
      console.error('Publish failed', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleArchive = async (id) => {
    setActionLoadingId(id);
    try {
      await teacherApi.archiveCourse(id);
      fetchCourses();
    } catch (err) {
      console.error('Archive failed', err);
    } finally {
      setActionLoadingId(null);
    }
  };

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
            <BookMarked size={24} /> {t('sidebar.courses')}
          </h1>
          <p className="text-sm text-gray-500">{t('teacher.courses.subtitle') || 'إدارة الكورسات التعليمية'}</p>
        </div>
        <button
          onClick={() => { setEditingCourse(null); setIsModalOpen(true); }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition"
        >
          <Plus size={18} /> {t('common.addNew') || 'إضافة كورس'}
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
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title={t('teacher.courses.empty') || 'لا توجد كورسات'}
          description={t('teacher.courses.emptyHint') || 'ابدأ بإضافة كورس جديد'}
          actionLabel={t('common.addNew') || 'إضافة كورس'}
          onAction={() => { setEditingCourse(null); setIsModalOpen(true); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{course.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{course.description || '—'}</p>
                  {course.subject && (
                    <p className="text-xs text-primary-600 mt-1">المادة: {course.subject.name}</p>
                  )}
                  {course._count && (
                    <p className="text-xs text-gray-500 mt-1">
                      الوحدات: {course._count.modules}
                    </p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(course.status)}`}>
                  {statusLabel(course.status)}
                </span>
              </div>
              
              <div className="flex justify-end gap-1 mt-auto pt-2 border-t dark:border-gray-800">
                {course.status === 'draft' && (
                  <button
                    onClick={() => handlePublish(course.id)}
                    disabled={actionLoadingId === course.id}
                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg disabled:opacity-50"
                    title="نشر"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
                {course.status === 'published' && (
                  <button
                    onClick={() => handleArchive(course.id)}
                    disabled={actionLoadingId === course.id}
                    className="p-1.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg disabled:opacity-50"
                    title="أرشفة"
                  >
                    <Archive size={16} />
                  </button>
                )}
                <button
                  onClick={() => { setEditingCourse(course); setIsModalOpen(true); }}
                  className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  title="تعديل"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  disabled={deletingId === course.id}
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
        <CreateCourseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          course={editingCourse}
          onSuccess={fetchCourses}
        />
      )}
    </div>
  );
}
