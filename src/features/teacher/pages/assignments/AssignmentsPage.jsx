import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAssignments,
  usePublishAssignment,
  useDeleteAssignment,
} from '../../hooks/useAssignments';
import { CreateAssignmentModal } from './CreateAssignmentModal';

const STATUS_LABELS = {
  draft: 'مسودة',
  published: 'منشور',
  closed: 'مغلق',
  archived: 'مؤرشف',
};

const STATUS_COLORS = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  archived: 'bg-red-100 text-red-800',
};

export default function AssignmentsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, isError, error } = useAssignments({
    page,
    limit: 20,
    ...(search && { search }),
    ...(status && { status }),
  });

  const publishMut = usePublishAssignment();
  const deleteMut = useDeleteAssignment();

  // للتأكد من شكل البيانات في الكونسول
  console.log("Assignments API Response:", data);

  // لو البيانات جاية مباشرة كـ Array أو جواها data
  const assignments = Array.isArray(data) ? data : (data?.data || []);
  const totalPages = data?.totalPages ?? 1;

  const handlePublish = async (a) => {
    if (!confirm(`نشر التكليف "${a.title}"؟`)) return;
    try {
      await publishMut.mutateAsync(a.id);
      window.location.reload(); // إعادة تحميل بسيطة لتحديث القائمة
    } catch (err) {
      alert(err?.response?.data?.message || 'فشل النشر');
    }
  };

  const handleDelete = async (a) => {
    if (!confirm(`حذف التكليف "${a.title}"؟`)) return;
    try {
      await deleteMut.mutateAsync(a.id);
      window.location.reload();
    } catch (err) {
      alert(err?.response?.data?.message || 'فشل الحذف');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">التكليفات</h1>
          <p className="text-gray-500">إدارة تكليفات الطلاب</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + تكليف جديد
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="بحث بالعنوان..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border rounded px-3 py-2 flex-1"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border rounded px-3 py-2"
        >
          <option value="">كل الحالات</option>
          <option value="draft">مسودة</option>
          <option value="published">منشور</option>
          <option value="closed">مغلق</option>
          <option value="archived">مؤرشف</option>
        </select>
      </div>

      {isLoading && (
        <div className="text-center py-10 text-gray-500">جاري التحميل...</div>
      )}

      {isError && (
        <div className="bg-red-50 text-red-700 p-4 rounded">
          {error?.response?.data?.message || 'حدث خطأ في تحميل التكليفات'}
        </div>
      )}

      {!isLoading && !isError && assignments.length === 0 && (
        <div className="text-center py-10 text-gray-500 border border-dashed rounded-lg bg-gray-50">
          لا توجد تكليفات. ابدأ بإنشاء أول تكليف.
        </div>
      )}

      {!isLoading && assignments.length > 0 && (
        <div className="bg-white rounded shadow overflow-hidden border">
          <table className="w-full text-right">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">العنوان</th>
                <th className="px-4 py-3">المادة</th>
                <th className="px-4 py-3 text-center">الدرجة الكلية</th>
                <th className="px-4 py-3 text-center">التسليمات</th>
                <th className="px-4 py-3 text-center">الحالة</th>
                <th className="px-4 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{a.title}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {a.subject?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center">{a.maxPoints}</td>
                  <td className="px-4 py-3 text-center">
                    {a._count?.submissions ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        STATUS_COLORS[a.status] ?? ''
                      }`}
                    >
                      {STATUS_LABELS[a.status] ?? a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => navigate(`/teacher/assignments/${a.id}`)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(a)}
                        disabled={deleteMut.isPending}
                        className="text-red-600 hover:underline text-sm"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {showCreate && (
        <CreateAssignmentModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
