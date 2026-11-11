import { useState, useEffect, useMemo } from 'react';
import { useCreateAssignment } from '../../hooks/useAssignments';
import teacherApi from '@/shared/api/teacherApi';

export function CreateAssignmentModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    subjectId: '',
    dueDate: '',
    maxPoints: 100,
    allowLateSubmission: false,
    latePenaltyPercent: 0,
  });

  const [subjects, setSubjects] = useState([]);
  const [allGroups, setAllGroups] = useState([]); // ✅ بنجيب كل المجموعات هنا
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);

  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  const createMut = useCreateAssignment();

  useEffect(() => {
    if (!open) return;

    const fetchInitialData = async () => {
      // 1. جلب المواد
      setIsLoadingSubjects(true);
      try {
        const res = await teacherApi.getSubjects({ limit: 100 });
        const subjectsData = res?.data?.data || res?.data || [];
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      } catch (err) {
        console.error('Failed to load subjects', err);
      } finally {
        setIsLoadingSubjects(false);
      }

      // 2. جلب المجموعات
      setIsLoadingGroups(true);
      try {
        const res = await teacherApi.getGroups({ limit: 100 });
        
        let groupsData = [];
        if (res?.data?.data && Array.isArray(res.data.data)) {
          groupsData = res.data.data;
        } else if (res?.data && Array.isArray(res.data)) {
          groupsData = res.data;
        }

        setAllGroups(groupsData); // ✅ بنحفظ كل المجموعات

      } catch (err) {
        console.error('Failed to load groups', err);
      } finally {
        setIsLoadingGroups(false);
      }
    };

    fetchInitialData();
  }, [open]);

  // ✅ الفلترة السحرية: لو فيه مادة مختارة، نعرض بس المجموعات اللي ليها نفس الـ subjectId
  const filteredGroups = useMemo(() => {
    if (!form.subjectId) return []; // لو مفيش مادة مختارة، نعرض صفر مجموعات
    return allGroups.filter((group) => group.subjectId === form.subjectId);
  }, [allGroups, form.subjectId]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    
    // ✅ لو غيرت المادة، بنصفر المجموعات المختارة عشان ميبقاش فيه تعارض
    if (field === 'subjectId') {
      setSelectedGroupIds([]); 
    }
  };

  const toggleGroup = (groupId) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedGroupIds.length === 0) {
      alert('لازم تختاري مجموعة واحدة على الأقل عشان التكليف يظهر للطلاب');
      return;
    }

    const payload = {
      title: form.title.trim(),
      maxPoints: Number(form.maxPoints),
      allowLateSubmission: form.allowLateSubmission,
    };

    if (form.description.trim()) payload.description = form.description.trim();
    if (form.subjectId) payload.subjectId = form.subjectId;
    if (form.dueDate) payload.dueDate = new Date(form.dueDate).toISOString();
    if (form.allowLateSubmission) payload.latePenaltyPercent = Number(form.latePenaltyPercent);

    try {
      // 1. إنشاء التكليف
      const assignment = await createMut.mutateAsync(payload);

      // 2. ربط الـ groups
      await teacherApi.linkAssignmentGroups(assignment.id, {
        groupIds: selectedGroupIds,
      });

      onCreated?.(assignment);
      onClose();
    } catch (err) {
      console.error('Create assignment error:', err);
      alert(err?.response?.data?.message || 'فشل إنشاء التكليف');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">تكليف جديد</h2>

        <label className="block mb-3">
          <span className="text-sm font-medium">العنوان *</span>
          <input required minLength={2} maxLength={300} value={form.title} onChange={(e) => handleChange('title', e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
        </label>

        <label className="block mb-3">
          <span className="text-sm font-medium">المادة *</span>
          <select 
            value={form.subjectId} 
            onChange={(e) => handleChange('subjectId', e.target.value)} 
            className="w-full border rounded px-3 py-2 mt-1" 
            disabled={isLoadingSubjects}
            required
          >
            <option value="">{isLoadingSubjects ? 'جاري تحميل المواد...' : '-- اختر المادة أولاً --'}</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </label>

        <label className="block mb-3">
          <span className="text-sm font-medium">الوصف</span>
          <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} className="w-full border rounded px-3 py-2 mt-1" rows={3} />
        </label>

        {/* اختيار المجموعات */}
        <div className="mb-3 border rounded p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">المجموعات * <span className="text-red-500">(مطلوب)</span></span>
            {filteredGroups.length > 0 && (
              <button type="button" onClick={() => { if (selectedGroupIds.length === filteredGroups.length) setSelectedGroupIds([]); else setSelectedGroupIds(filteredGroups.map((g) => g.id)); }} className="text-xs text-blue-600 hover:underline">
                {selectedGroupIds.length === filteredGroups.length ? 'إلغاء الكل' : 'تحديد الكل'}
              </button>
            )}
          </div>

          {!form.subjectId ? (
            <div className="text-sm text-amber-600">
              ⚠️ اختاري المادة أولاً عشان تظهرلك المجموعات الخاصة بيها.
            </div>
          ) : isLoadingGroups ? (
            <div className="text-sm text-gray-500">جاري تحميل المجموعات...</div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-sm text-red-600">
              ⚠️ مفيش مجموعات مرتبطة بالمادة دي. روحي لصفحة المجموعات واعملي مجموعة واختاري لها المادة دي.
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredGroups.map((g) => (
                <label key={g.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white p-1 rounded">
                  <input type="checkbox" checked={selectedGroupIds.includes(g.id)} onChange={() => toggleGroup(g.id)} />
                  <span>{g.name}</span>
                </label>
              ))}
            </div>
          )}
          {selectedGroupIds.length > 0 && (
            <div className="text-xs text-green-600 mt-2">✅ تم اختيار {selectedGroupIds.length} مجموعة</div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <label>
            <span className="text-sm font-medium">تاريخ التسليم</span>
            <input type="datetime-local" value={form.dueDate} onChange={(e) => handleChange('dueDate', e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
          </label>
          <label>
            <span className="text-sm font-medium">الدرجة الكلية</span>
            <input type="number" min={1} value={form.maxPoints} onChange={(e) => handleChange('maxPoints', e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">إلغاء</button>
          <button type="submit" disabled={createMut.isPending || selectedGroupIds.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {createMut.isPending ? 'جاري الحفظ...' : 'إنشاء'}
          </button>
        </div>
      </form>
    </div>
  );
}
