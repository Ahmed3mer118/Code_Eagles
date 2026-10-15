// src/features/teacher/pages/settings/ProfileTab.jsx
import { useEffect, useState } from 'react';
import { useTeacherProfile } from '../../hooks/useTeacherProfile';
import AvatarUpload from '../../components/AvatarUpload';
import ChangeEmailModal from '../../components/ChangeEmailModal';

export default function ProfileTab() {
  const {
    profile,
    loading,
    saving,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    refetch,
  } = useTeacherProfile();

  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    preferredLanguage: 'ar',
  });
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        phoneNumber: profile.phoneNumber || '',
        preferredLanguage: profile.preferredLanguage || 'ar',
      });
    }
  }, [profile]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await updateProfile(form);
    if (res.success) showToast('success', 'تم حفظ البيانات بنجاح ✅');
    else showToast('error', res.error);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-gray-500">
        تعذّر تحميل البيانات
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white text-sm shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Card: البيانات الأساسية */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-bold mb-1">الملف الشخصي</h2>
        <p className="text-sm text-gray-500 mb-6">
          إدارة معلومات حسابك الشخصي
        </p>

        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <AvatarUpload
            currentUrl={profile.profileImageUrl}
            name={profile.name}
            saving={saving}
            onUpload={async (file) => {
              const res = await uploadAvatar(file);
              if (res.success) showToast('success', 'تم رفع الصورة ✅');
              else showToast('error', res.error);
            }}
            onDelete={async () => {
              const res = await deleteAvatar();
              if (res.success) showToast('success', 'تم حذف الصورة ✅');
              else showToast('error', res.error);
            }}
          />

          <form
            onSubmit={handleSubmit}
            className="flex-1 w-full space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                الاسم الكامل
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                البريد الإلكتروني
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={profile.email || ''}
                  disabled
                  className="flex-1 px-3 py-2 border rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(true)}
                  className="px-3 py-2 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 whitespace-nowrap transition"
                >
                  تغيير
                </button>
              </div>
              {profile.emailVerified === false && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ البريد الإلكتروني غير موثّق
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value })
                }
                placeholder="+20 1xx xxx xxxx"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                اللغة المفضلة
              </label>
              <select
                value={form.preferredLanguage}
                onChange={(e) =>
                  setForm({
                    ...form,
                    preferredLanguage: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </form>
        </div>
      </div>

      {/* Card: الأكاديميات المنضم لها */}
      {profile.memberships && profile.memberships.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-bold mb-3">الأكاديميات المنضم لها</h3>
          <div className="space-y-2">
            {profile.memberships.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                  {m.tenant?.logo ? (
                    <img
                      src={m.tenant.logo}
                      alt={m.tenant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    m.tenant?.name?.charAt(0) || '?'
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {m.tenant?.name || m.tenantId}
                  </p>
                  <p className="text-xs text-gray-500">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ChangeEmailModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        currentEmail={profile.email}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
