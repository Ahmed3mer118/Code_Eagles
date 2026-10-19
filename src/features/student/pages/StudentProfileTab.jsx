// src/features/student/pages/StudentProfileTab.jsx
import { useEffect, useState, useRef } from 'react';
import userService from '../../../shared/api/userService';
import { Camera, Trash2, User as UserIcon, Mail, Phone, BookOpen, CheckCircle2, Lock } from 'lucide-react';

export default function StudentProfileTab() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    gradeLevel: '',
    parentPhone: '',
  });

  const fileInputRef = useRef(null);

  // جلب البيانات
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await userService.getMyProfile();
      setProfile(data);
      setForm({
        name: data.name || '',
        phoneNumber: data.phoneNumber || '',
        gradeLevel: data.gradeLevel || '',
        parentPhone: data.parentPhone || '',
      });
    } catch (err) {
      showToast('error', 'تعذر تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // حفظ البيانات
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await userService.updateMyProfile(form);
      setProfile((prev) => ({ ...prev, ...updated }));
      showToast('success', 'تم حفظ البيانات بنجاح ✅');
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  // رفع الصورة
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return showToast('error', 'حجم الصورة يجب أن يكون أقل من 5MB');
    }

    setSaving(true);
    try {
      await userService.uploadAvatar(file);
      await fetchProfile(); // تحديث الصورة
      showToast('success', 'تم رفع الصورة بنجاح ✅');
    } catch (err) {
      showToast('error', 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // حذف الصورة
  const handleDeleteImage = async () => {
    if (!window.confirm('هل أنت متأكد من حذف الصورة؟')) return;
    setSaving(true);
    try {
      await userService.removeAvatar();
      await fetchProfile();
      showToast('success', 'تم حذف الصورة ✅');
    } catch (err) {
      showToast('error', 'حدث خطأ أثناء حذف الصورة');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">جاري التحميل...</div>;
  if (!profile) return <div className="text-center text-red-500 py-10">تعذر تحميل البيانات</div>;

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm shadow-xl ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
        
        {/* قسم الصورة الشخصية */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full blur opacity-30" />
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-100 bg-gray-100 flex items-center justify-center">
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-indigo-500">
                  {profile.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
              {saving && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white shadow">
              <CheckCircle2 size={14} />
            </div>
          </div>
          
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
          
          <div className="flex gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={saving} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">
              <Camera size={14} /> تغيير
            </button>
            {profile.profileImageUrl && (
              <button type="button" onClick={handleDeleteImage} disabled={saving} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 transition">
                <Trash2 size={14} /> حذف
              </button>
            )}
          </div>
        </div>

        {/* قسم الفورم */}
        <form onSubmit={handleSubmit} className="flex-1 w-full space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <UserIcon size={16} className="text-indigo-500" /> الاسم الكامل
              </label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone size={16} className="text-indigo-500" /> رقم الهاتف
              </label>
              <input type="tel" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <BookOpen size={16} className="text-indigo-500" /> الصف الدراسي
              </label>
              <input type="text" value={form.gradeLevel} onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })} placeholder="مثال: الصف الثالث الثانوي" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone size={16} className="text-indigo-500" /> رقم ولي الأمر
              </label>
              <input type="tel" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} placeholder="01xxxxxxxxx" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-2"><Mail size={16} className="text-indigo-500" /> البريد الإلكتروني</span>
              {profile.emailVerified && <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> موثّق</span>}
            </label>
            <div className="relative">
              <input type="email" value={profile.email} disabled className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-500 cursor-not-allowed outline-none" />
              <Lock size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={saving} className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all">
              {saving ? 'جاري الحفظ...' : '💾 حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
