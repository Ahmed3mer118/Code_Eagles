// src/features/teacher/pages/lectures/CreateLectureModal.jsx
import { useState, useEffect, useRef } from 'react';
import { X, Upload, Video as VideoIcon, Layers } from 'lucide-react';
import { useI18n } from '../../../../shared/i18n';
import teacherApi from '../../../../shared/api/teacherApi';
import client from '../../../../shared/api/client';

export default function CreateLectureModal({ isOpen, onClose, moduleId, lecture, onSuccess }) {
  const { t } = useI18n();
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: 0,
    isFree: false,
  });

  const [groups, setGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);

  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // ✅ جلب المجموعات لما المودال يفتح
  useEffect(() => {
    if (isOpen) {
      const fetchGroups = async () => {
        try {
          const res = await teacherApi.getGroups({ limit: 100 });
          const groupsData = res?.data?.data || res?.data || [];
          setGroups(Array.isArray(groupsData) ? groupsData : []);
        } catch (err) {
          console.error('Failed to load groups', err);
        }
      };
      fetchGroups();
    }
  }, [isOpen]);

  useEffect(() => {
    if (lecture) {
      setForm({
        title: lecture.title || '',
        description: lecture.description || '',
        videoUrl: lecture.videoUrl || '',
        duration: lecture.duration || 0,
        isFree: lecture.isFree || false,
      });
      // ✅ لو المحاضرة ليها مجموعات، بنحطها في الـ Checkboxes
      setSelectedGroupIds(lecture.groups?.map((g) => g.groupId) || []);
    } else {
      setForm({ title: '', description: '', videoUrl: '', duration: 0, isFree: false });
      setSelectedGroupIds([]);
      setVideoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    setError('');
  }, [lecture, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        setError('حجم الفيديو كبير جداً. الحد الأقصى 500 ميجابايت.');
        return;
      }
      setVideoFile(file);
      setError('');
    }
  };

  // ✅ تحديد/إلغاء تحديد المجموعة
  const toggleGroup = (groupId) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let finalVideoUrl = form.videoUrl;

      if (videoFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append('file', videoFile);
        
        const uploadRes = await client.post('/upload/video', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 600000, 
        });
        
        finalVideoUrl = uploadRes.data?.url || uploadRes.data?.data?.url;
        if (!finalVideoUrl) throw new Error('فشل رفع الفيديو، لم يتم استلام الرابط');
        setUploading(false);
      }

      // ✅ البيانات اللي هتتبعت (فيها المجموعات)
      const payload = {
        title: form.title,
        description: form.description,
        videoUrl: finalVideoUrl,
        duration: Number(form.duration) || 0,
        isFree: form.isFree,
        groupIds: selectedGroupIds, // الباك اند هيستقبلها ويحفظها
      };

      if (lecture) {
        await teacherApi.updateLecture(lecture.id, payload);
      } else {
        await teacherApi.createLecture(moduleId, payload);
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Submit lecture error:', err);
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('استغرق رفع الفيديو وقتاً طويلاً جداً. يرجى التأكد من سرعة الإنترنت أو تجربة فيديو أصغر.');
      } else {
        setError(err?.response?.data?.message || err.message || 'حدث خطأ أثناء الحفظ');
      }
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {lecture ? 'تعديل محاضرة' : 'إضافة محاضرة'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">عنوان المحاضرة *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">فيديو المحاضرة</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
              />
              <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-2 text-gray-500">
                <Upload size={24} />
                <span className="text-sm">
                  {videoFile ? videoFile.name : 'اختر ملف فيديو'}
                </span>
              </label>
              {form.videoUrl && !videoFile && (
                <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1">
                  <VideoIcon size={12} /> يوجد فيديو مرفوع بالفعل
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">المدة (دقيقة)</label>
              <input
                type="number"
                min={0}
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFree}
                  onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm">محاضرة مجانية</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {/* ✅ قسم اختيار المجموعات */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
              <Layers size={16} className="text-primary-600" />
              المجموعات المسموح لها
            </h3>
            <p className="text-xs text-gray-500 mb-2">اختاري المجموعات اللي عايزة المحاضرة تظهرلها.</p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {groups.length === 0 ? (
                <p className="text-xs text-gray-500">لا توجد مجموعات.</p>
              ) : (
                groups.map((g) => (
                  <label key={g.id} className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGroupIds.includes(g.id)}
                      onChange={() => toggleGroup(g.id)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{g.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">
              إلغاء
            </button>
            <button type="submit" disabled={loading || uploading} className="flex-1 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">
              {uploading ? 'جاري رفع الفيديو...' : (loading ? 'جاري الحفظ...' : 'حفظ')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
