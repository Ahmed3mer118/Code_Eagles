// src/features/student/components/PaymentProofUploader.jsx
import { useRef } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

export default function PaymentProofUploader({
  preview,
  onPick,
  onClear,
  disabled,
}) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onPick(file);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        صورة التحويل
      </label>

      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-primary-500 hover:text-primary-600 transition disabled:opacity-50"
        >
          <Upload size={32} />
          <span className="text-sm font-medium">اضغط لرفع صورة التحويل</span>
          <span className="text-xs text-gray-400">
            PNG, JPG (بحد أقصى 5MB)
          </span>
        </button>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <img
            src={preview}
            alt="preview"
            className="w-full h-64 object-contain bg-gray-50 dark:bg-gray-900"
          />
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="absolute top-2 end-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
