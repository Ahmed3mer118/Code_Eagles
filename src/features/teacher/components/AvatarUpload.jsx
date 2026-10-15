// src/features/teacher/components/AvatarUpload.jsx
import { useRef, useState } from 'react';

export default function AvatarUpload({
  currentUrl,
  name,
  onUpload,
  onDelete,
  saving,
}) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('الرجاء اختيار صورة صحيحة');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً (الحد الأقصى 5MB)');
      return;
    }

    // معاينة محلية
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    await onUpload(file);
    setPreview(null);

    // نفضّي input عشان نقدر نرفع نفس الملف تاني
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const imageSrc = preview || currentUrl;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-100 bg-gray-100 flex items-center justify-center">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={name || 'avatar'}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl font-bold text-indigo-500">
              {name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          )}
        </div>

        {saving && (
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={saving}
          className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          تغيير الصورة
        </button>

        {currentUrl && (
          <button
            type="button"
            onClick={onDelete}
            disabled={saving}
            className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
          >
            حذف
          </button>
        )}
      </div>
    </div>
  );
}
