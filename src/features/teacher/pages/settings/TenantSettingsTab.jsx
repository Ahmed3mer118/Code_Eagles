import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTeacherTenant } from '../../hooks/useTeacherTenant';
import tenantApi from '@/shared/api/tenantApi';
import { Upload, Image as ImageIcon, AlertTriangle } from 'lucide-react';

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export default function TenantSettingsTab() {
  const { t } = useTranslation();
  const { tenant, loading, error, refetch, setTenant } = useTeacherTenant();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        slug: tenant.slug || '',
        description: tenant.description || '',
      });
    }
  }, [tenant]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'name' && !slugTouched) {
        newData.slug = generateSlug(value);
      }
      return newData;
    });
  };

  const handleSlugChange = (e) => {
    setSlugTouched(true);
    setFormData((prev) => ({
      ...prev,
      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'اسم الأكاديمية مطلوب' });
      return;
    }
    if (!formData.slug.trim()) {
      setMessage({ type: 'error', text: 'الرابط (Slug) مطلوب' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const updated = await tenantApi.updateSettings(formData);

      setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' });

      if (updated && typeof updated === 'object' && updated.id) {
        setTenant((prev) => ({ ...prev, ...updated }));
      } else {
        refetch();
      }
    } catch (err) {
      const status = err?.response?.status;
      let msg = err.response?.data?.message || 'حدث خطأ أثناء الحفظ';
      if (status === 403) {
        msg = 'ليس لديك صلاحية لتعديل إعدادات الأكاديمية. تواصل مع الدعم.';
      } else if (status === 409) {
        msg = 'الرابط (Slug) مستخدم بالفعل، اختر رابطاً آخر.';
      }
      setMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'الملف يجب أن يكون صورة' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'حجم الصورة يجب أن يكون أقل من 5MB' });
      return;
    }

    try {
      setUploadingLogo(true);
      setMessage({ type: '', text: '' });
      const result = await tenantApi.uploadLogo(file);
      setMessage({ type: 'success', text: 'تم رفع الشعار بنجاح' });
      if (result?.logoUrl) {
        setTenant((prev) => ({ ...prev, logoUrl: result.logoUrl }));
      } else {
        refetch();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'حدث خطأ أثناء رفع الشعار',
      });
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'الملف يجب أن يكون صورة' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'حجم الصورة يجب أن يكون أقل من 10MB' });
      return;
    }

    try {
      setUploadingCover(true);
      setMessage({ type: '', text: '' });
      const result = await tenantApi.uploadCover(file);
      setMessage({ type: 'success', text: 'تم رفع صورة الغلاف بنجاح' });
      if (result?.coverUrl) {
        setTenant((prev) => ({ ...prev, coverUrl: result.coverUrl }));
      } else {
        refetch();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'حدث خطأ أثناء رفع الغلاف',
      });
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">جاري التحميل...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex flex-col items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-xl max-w-md">
          <AlertTriangle size={28} />
          <p className="font-medium">حدث خطأ</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={refetch}
            className="mt-2 bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Messages */}
      {message.text && (
        <div
          className={`p-3 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Cover */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          صورة الغلاف
        </label>
        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200">
          {tenant?.coverUrl ? (
            <img
              src={tenant.coverUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm gap-2">
              <ImageIcon size={20} />
              لا توجد صورة غلاف
            </div>
          )}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            <Upload size={14} />
            {uploadingCover ? 'جاري الرفع...' : 'تغيير الغلاف'}
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
            disabled={uploadingCover}
          />
        </div>
      </div>

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          شعار الأكاديمية
        </label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
            {tenant?.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-xs">لا يوجد</span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 w-fit flex items-center gap-2"
            >
              <Upload size={14} />
              {uploadingLogo ? 'جاري الرفع...' : 'رفع شعار'}
            </button>
            <span className="text-xs text-gray-400">
              PNG أو JPG، بحد أقصى 5MB
            </span>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleLogoUpload}
            disabled={uploadingLogo}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            اسم الأكاديمية <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="مثال: أكاديمية النجاح"
            required
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            الرابط (Slug) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 font-mono">/</span>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleSlugChange}
              className="flex-1 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
              placeholder="academy-slug"
              pattern="[a-z0-9-]+"
              required
              maxLength={80}
            />
          </div>
          <p className="text-xs text-amber-600 mt-1">
            ⚠️ تحذير: تغيير الرابط هيكسر أي روابط قديمة بتشاور على الأكاديمية
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            الوصف
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="نبذة مختصرة عن الأكاديمية..."
          />
        </div>

        {/* Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              الحد الأقصى للطلاب
            </label>
            <div className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-400">
              {tenant?.maxStudents ?? '—'}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              محدد بواسطة الخطة الحالية
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              الحد الأقصى للمساعدين
            </label>
            <div className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-400">
              {tenant?.maxAssistants ?? '—'}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              محدد بواسطة الخطة الحالية
            </p>
          </div>
        </div>

        {/* Plan */}
        {tenant?.platformPlan && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300 mb-1">
              الخطة الحالية
            </p>
            <p className="text-sm text-indigo-700 dark:text-indigo-400">
              {tenant.platformPlan?.name || '—'}
            </p>
          </div>
        )}

        {/* Status */}
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">حالة الأكاديمية:</span>
            <span className="text-gray-800 dark:text-gray-200">
              {tenant?.status === 'active' ? 'نشطة' : 'غير نشطة'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">حالة الموافقة:</span>
            <span className="text-gray-800 dark:text-gray-200">
              {tenant?.approvalStatus === 'approved'
                ? 'موافق عليها'
                : tenant?.approvalStatus === 'pending'
                  ? 'قيد المراجعة'
                  : 'مرفوضة'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
          <button
            type="button"
            onClick={refetch}
            disabled={saving}
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
