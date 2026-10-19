import { useState, useEffect, useCallback } from 'react';
import { Plus, Video, Pencil, Trash2, Layers } from 'lucide-react';
import { useI18n } from '../../../../shared/i18n';
import teacherApi from '../../../../shared/api/teacherApi';
import CreateLectureModal from './CreateLectureModal';
import CreateModuleModal from './CreateModuleModal';
import EmptyState from '../../components/EmptyState';

export default function LecturesPage() {
  const { t } = useI18n();

  // Selection states
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');

  // Data states
  const [lectures, setLectures] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingLectures, setLoadingLectures] = useState(false);

  // Modals
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);

  // 1. جلب الكورسات
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await teacherApi.getCourses({ limit: 100 });
        setCourses(res.data?.data || res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, []);

  // 2. جلب الوحدات عند اختيار كورس
  useEffect(() => {
    if (!selectedCourseId) {
      setModules([]);
      setSelectedModuleId('');
      return;
    }
    const loadModules = async () => {
      try {
        setLoadingModules(true);
        const res = await teacherApi.getModules(selectedCourseId);
        setModules(res.data?.data || res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingModules(false);
      }
    };
    loadModules();
  }, [selectedCourseId]);

  // 3. جلب المحاضرات عند اختيار وحدة
  const fetchLectures = useCallback(async () => {
    if (!selectedModuleId) return;
    try {
      setLoadingLectures(true);
      const res = await teacherApi.getLectures(selectedModuleId);
      setLectures(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLectures(false);
    }
  }, [selectedModuleId]);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete') || 'هل أنت متأكد من الحذف؟')) return;
    try {
      await teacherApi.deleteLecture(id);
      fetchLectures();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Video size={24} /> {t('sidebar.lectures')}
        </h1>
        <p className="text-sm text-gray-500">
          {t('teacher.lectures.subtitle') || 'إدارة المحاضرات والدروس'}
        </p>
      </div>

      {/* Filters: Course & Module Selector */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-end">
        {/* اختيار الكورس */}
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            {t('sidebar.courses')}
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            disabled={loadingCourses}
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">— اختر كورس —</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* اختيار الوحدة */}
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('teacher.lectures.module') || 'الوحدة'}
            </label>
            {selectedCourseId && (
              <button
                onClick={() => setIsModuleModalOpen(true)}
                className="text-xs text-primary-600 hover:underline"
              >
                + إضافة وحدة
              </button>
            )}
          </div>
          <select
            value={selectedModuleId}
            onChange={(e) => setSelectedModuleId(e.target.value)}
            disabled={!selectedCourseId || loadingModules}
            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50"
          >
            <option value="">— اختر وحدة —</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>

        {/* زرار إضافة محاضرة */}
        <button
          onClick={() => { setEditingLecture(null); setIsLectureModalOpen(true); }}
          disabled={!selectedModuleId}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition disabled:opacity-50 whitespace-nowrap"
        >
          <Plus size={18} /> إضافة محاضرة
        </button>
      </div>

      {/* Content */}
      {!selectedModuleId ? (
        <EmptyState
          icon={Layers}
          title="اختر وحدة أولاً"
          description="اختر كورس ووحدة من القائمة فوق عشان تشوف المحاضرات أو تضيف محاضرة جديدة."
        />
      ) : loadingLectures ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
        </div>
      ) : lectures.length === 0 ? (
        <EmptyState
          icon={Video}
          title="لا توجد محاضرات"
          description="ابدأ بإضافة محاضرة جديدة لهذه الوحدة."
          actionLabel="إضافة محاضرة"
          onAction={() => { setEditingLecture(null); setIsLectureModalOpen(true); }}
        />
      ) : (
        <div className="space-y-2">
          {lectures.map((lec, idx) => (
            <div key={lec.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{lec.title}</h3>
                  <p className="text-xs text-gray-500">
                    المدة: {Math.floor(lec.duration / 60)} دقيقة • {lec.isFree ? 'مجاني' : 'مدفوع'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => { setEditingLecture(lec); setIsLectureModalOpen(true); }}
                  className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(lec.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {isLectureModalOpen && (
        <CreateLectureModal
          isOpen={isLectureModalOpen}
          onClose={() => setIsLectureModalOpen(false)}
          moduleId={selectedModuleId}
          lecture={editingLecture}
          onSuccess={fetchLectures}
        />
      )}

      {isModuleModalOpen && (
        <CreateModuleModal
          isOpen={isModuleModalOpen}
          onClose={() => setIsModuleModalOpen(false)}
          courseId={selectedCourseId}
          onSuccess={() => {
            teacherApi.getModules(selectedCourseId).then(res => setModules(res.data?.data || res.data || []));
          }}
        />
      )}
    </div>
  );
}
