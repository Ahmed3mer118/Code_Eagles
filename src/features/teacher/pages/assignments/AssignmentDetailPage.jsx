import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useAssignment,
  useUpdateAssignment,
  usePublishAssignment,
} from '../../hooks/useAssignments';
import SubmissionsTab from './SubmissionsTab';

const TABS = [
  { key: 'settings', label: 'إعدادات التكليف' },
  { key: 'submissions', label: 'التسليمات' },
];

const STATUS_LABELS = {
  draft: 'مسودة',
  published: 'منشور',
  closed: 'مغلق',
  archived: 'مؤرشف',
};

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('settings');
  const [successMsg, setSuccessMsg] = useState('');

  const { data: assignment, isLoading, isError, error, refetch } = useAssignment(id);
  const updateMut = useUpdateAssignment();
  const publishMut = usePublishAssignment();

  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!assignment) return;
    // تحويل التاريخ لـ format يقبله input type="datetime-local"
    let formattedDate = '';
    if (assignment.dueDate) {
      const d = new Date(assignment.dueDate);
      // نطرح فرق التوقيت عشان يظهر صح في الـ input
      const offset = d.getTimezoneOffset() * 60000;
      formattedDate = new Date(d.getTime() - offset).toISOString().slice(0, 16);
    }

    setForm({
      title: assignment.title ?? '',
      description: assignment.description ?? '',
      dueDate: formattedDate,
      maxPoints: assignment.maxPoints ?? 100,
      allowLateSubmission: assignment.allowLateSubmission ?? false,
      latePenaltyPercent: assignment.latePenaltyPercent ?? 0,
    });
  }, [assignment]);

  if (isLoading) {
    return <div className="p-6 text-gray-500">جاري التحميل...</div>;
  }

  if (isError || !assignment) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded">
          {error?.response?.data?.message || 'لم يتم العثور على التكليف'}
        </div>
        <button
          onClick={() => navigate('/teacher/assignments')}
          className="mt-4 text-blue-600 hover:underline"
        >
          ← رجوع للقائمة
        </button>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // تجهيز البايلود بدقة حسب الـ UpdateAssignmentDto
      const payload = {
        title: form.title.trim(),
        maxPoints: Number(form.maxPoints),
        allowLateSubmission: form.allowLateSubmission,
      };

      if (form.description.trim()) {
        payload.description = form.description.trim();
      }
      
      if (form.dueDate) {
        payload.dueDate = new Date(form.dueDate).toISOString();
      } else {
        // لو المستخدم مسح التاريخ، بنبعت null عشان الباك يمسحه
        // (لو الباك بيرفض null، ممكن نشيل السطرين دول)
        payload.dueDate = null; 
      }

      if (form.allowLateSubmission) {
        payload.latePenaltyPercent = Number(form.latePenaltyPercent);
      } else {
        payload.latePenaltyPercent = 0;
      }

      await updateMut.mutateAsync({ id, payload });
      refetch();
      
      setSuccessMsg('تم الحفظ بنجاح');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err?.response?.data?.message || 'فشل الحفظ، تأكد من البيانات');
    }
  };

  const handlePublish = async () => {
    if (!confirm('نشر التكليف؟ لن تستطيع تعديله بعد النشر.')) return;
    try {
      await publishMut.mutateAsync(id);
      refetch();
      setSuccessMsg('تم النشر بنجاح');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err?.response?.data?.message || 'فشل النشر');
    }
  };

  return (
    <div className="p-6 relative">
      {/* رسالة النجاح */}
      {successMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-100 text-green-800 px-4 py-2 rounded shadow z-50">
          {successMsg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/teacher/assignments')}
            className="text-sm text-blue-600 hover:underline mb-1"
          >
            ← رجوع للقائمة
          </button>
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <div className="text-sm text-gray-500 mt-1">
            الحالة: {STATUS_LABELS[assignment.status] ?? assignment.status} ·
            الدرجة: {assignment.maxPoints} · التسليمات:{' '}
            {assignment._count?.submissions ?? 0}
          </div>
        </div>
        {assignment.status === 'draft' && (
          <button
            onClick={handlePublish}
            disabled={publishMut.isPending}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {publishMut.isPending ? 'جاري النشر...' : 'نشر التكليف'}
          </button>
        )}
      </div>

      <div className="border-b mb-4">
        <div className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 px-1 ${
                activeTab === tab.key
                  ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'settings' && form && (
        <form onSubmit={handleSave} className="max-w-2xl">
          <label className="block mb-3">
            <span className="text-sm font-medium">العنوان *</span>
            <input
              required
              minLength={2}
              maxLength={300}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>

          <label className="block mb-3">
            <span className="text-sm font-medium">الوصف</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <label>
              <span className="text-sm font-medium">تاريخ التسليم</span>
              <input
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </label>
            <label>
              <span className="text-sm font-medium">الدرجة الكلية</span>
              <input
                type="number"
                min={1}
                value={form.maxPoints}
                onChange={(e) => setForm({ ...form, maxPoints: e.target.value })}
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </label>
          </div>

          <div className="space-y-2 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.allowLateSubmission}
                onChange={(e) =>
                  setForm({ ...form, allowLateSubmission: e.target.checked })
                }
              />
              <span>السماح بالتسليم المتأخر</span>
            </label>

            {form.allowLateSubmission && (
              <label className="block">
                <span className="text-sm font-medium">
                  نسبة خصم التأخير (%)
                </span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.latePenaltyPercent}
                  onChange={(e) =>
                    setForm({ ...form, latePenaltyPercent: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={updateMut.isPending}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {updateMut.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </form>
      )}

      {activeTab === 'submissions' && (
        <SubmissionsTab assignmentId={id} maxPoints={assignment.maxPoints} />
      )}
    </div>
  );
}
