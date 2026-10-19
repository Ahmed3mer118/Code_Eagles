import { useState, useEffect, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { useI18n } from '../../../../shared/i18n';
import teacherApi from '../../../../shared/api/teacherApi';
import client from '../../../../shared/api/client'; // تأكد إن ده الـ axios instance بتاعك

export default function CreateLectureModal({ isOpen, onClose, moduleId, lecture, onSuccess }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: 0,
    isFree: false,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (lecture) {
      setForm({
        title: lecture.title || '',
        description: lecture.description || '',
        videoUrl: lecture.videoUrl || '',
        duration: lecture.duration || 0,
        isFree: lecture.isFree || false,
      });
    } else {
      setForm({ title: '', description: '', videoUrl: '', duration: 0, isFree: false });
      setVideoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    setError('');
  }, [lecture, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let finalVideoUrl = form.videoUrl;

      // 1. لو فيه ملف فيديو جديد، نرفعه على endpoint الفيديو
      if (videoFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append('file', videoFile);
        
        // ✅ هنا بنستخدم /upload/video مش /upload/image
        const uploadRes = await client.post('/upload/video', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        // استخراج الرابط من الـ response (حسب شكل الـ ResponseInterceptor بتاعك)
        finalVideoUrl = uploadRes.data?.url || uploadRes.data?.data?.url;
        if (!finalVideoUrl) throw new Error('فشل رفع الفيديو، لم يتم استلام الرابط');
        setUploading(false);
      }

      // 2. نجهز بيانات المحاضرة
      const payload = {
        title: form.title,
        description: form.description,
        videoUrl: finalVideoUrl,
        duration: Number(form.duration) || 0,
        isFree: form.isFree,
      };

      if (lecture) {
        await teacherApi.updateLecture(lecture.id, payload);
      } else {
        await teacherApi.createLecture(moduleId, payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error') || 'حدث خطأ');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {lecture ? t('common.edit') : t('common.addNew')} {t('sidebar.lectures')}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* عنوان المحاضرة */}
          <div>
            <label className="block text-sm font-medium mb-1">{t('common.name')} *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {/* رفع الفيديو */}
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
                <p className="text-xs text-green-600 mt-2">يوجد فيديو مرفوع بالفعل</p>
              )}
            </div>
          </div>

          {/* المدة */}
          <div>
            <label className="block text-sm font-medium mb-1">{t('teacher.lectures.duration') || 'المدة (بالدقائق)'}</label>
            <input
              type="number"
              min={0}
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {/* الوصف */}
          <div>
            <label className="block text-sm font-medium mb-1">{t('common.description')}</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {/* مجاني */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFree}
              onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm">{t('teacher.lectures.isFree') || 'محاضرة مجانية (معاينة)'}</span>
          </label>

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={loading || uploading} className="flex-1 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">
              {uploading ? 'جاري رفع الفيديو...' : (loading ? t('common.loading') : t('common.save'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
