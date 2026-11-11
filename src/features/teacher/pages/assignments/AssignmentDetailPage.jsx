import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useAssignment,
  useUpdateAssignment,
  usePublishAssignment,
} from '../../hooks/useAssignments';
import SubmissionsTab from './SubmissionsTab';
import teacherApi from '@/shared/api/teacherApi'; // ✅ استيراد الـ API

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
  
  // ✅ States جديدة للمجموعات
  const [allGroups, setAllGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [isSavingGroups, setIsSavingGroups] = useState(false);

  useEffect(() => {
    if (!assignment) return;
    
    // تحويل التاريخ لـ format يقبله input type="datetime-local"
    let formattedDate = '';
    if (assignment.dueDate) {
      const d = new Date(assignment.dueDate);
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

    // ✅ نحدث الـ groups المختارة بناءً على اللي جاي من الباك إند
    if (assignment.groups) {
      setSelectedGroupIds(assignment.groups.map((g) => g.groupId));
    }
  }, [assignment]);

  // ✅ جلب كل المجموعات المتاحة عشان نختار منها
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await teacherApi.getGroups({ limit: 100 });
        const data = res?.data?.data || res?.data || [];
        setAllGroups(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load groups', err);
      }
    };
    if (id) fetchGroups();
  }, [id]);

  // ✅ فلترة المجموعات عشان نعرض بس اللي تابعين لنفس المادة
  const filteredGroups = useMemo(() => {
    if (!assignment?.subjectId) return allGroups;
    return allGroups.filter((g) => g.subjectId === assignment.subjectId);
  }, [allGroups, assignment?.subjectId]);

  // ✅ دالة تبديل المجموعة (اختيار/إلغاء)
  const toggleGroup = (groupId) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((gid) => gid !== groupId)
        : [...prev, groupId],
    );
  };

  // ✅ دالة حفظ المجموعات الجديدة
  const handleSaveGroups = async () => {
    try {
      setIsSavingGroups(true);
      await teacherApi.linkAssignmentGroups(id, { groupIds: selectedGroupIds });
      refetch(); // تحديث بيانات التكليف
      setSuccessMsg('تم تحديث المجموعات بنجاح');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err?.response?.data?.message || 'فشل حفظ المجموعات');
    } finally {
      setIsSavingGroups(false);
    }
  };

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
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mb-8"
          >
            {updateMut.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>

          {/* ✅ قسم إدارة المجموعات الجديد */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-3">المجموعات المرتبطة</h3>
            <p className="text-sm text-gray-500 mb-4">
              يمكنك تعديل المجموعات التي يظهر لها هذا التكليف.
            </p>

            <div className="border rounded p-3 bg-gray-50 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">المجموعات</span>
                {filteredGroups.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedGroupIds.length === filteredGroups.length) setSelectedGroupIds([]);
                      else setSelectedGroupIds(filteredGroups.map((g) => g.id));
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {selectedGroupIds.length === filteredGroups.length ? 'إلغاء الكل' : 'تحديد الكل'}
                  </button>
                )}
              </div>

              {filteredGroups.length === 0 ? (
                <div className="text-sm text-red-600">
                  لا توجد مجموعات متاحة لهذه المادة.
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredGroups.map((g) => (
                    <label key={g.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedGroupIds.includes(g.id)}
                        onChange={() => toggleGroup(g.id)}
                      />
                      <span>{g.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSaveGroups}
              disabled={isSavingGroups}
              className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSavingGroups ? 'جاري حفظ المجموعات...' : 'حفظ المجموعات'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'submissions' && (
        <SubmissionsTab assignmentId={id} maxPoints={assignment.maxPoints} />
      )}
    </div>
  );
}
