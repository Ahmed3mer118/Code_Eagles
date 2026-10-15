export default function EnrollStudentModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">تسجيل طالب</h2>
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">إغلاق</button>
      </div>
    </div>
  );
}
