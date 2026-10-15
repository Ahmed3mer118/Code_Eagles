export default function StudentDetailDrawer({ student, onClose }) {
  if (!student) return null;
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg p-6 z-50">
      <h2 className="text-xl font-bold mb-4">تفاصيل الطالب</h2>
      <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">إغلاق</button>
    </div>
  );
}
