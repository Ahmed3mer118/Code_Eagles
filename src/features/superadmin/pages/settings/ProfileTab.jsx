// src/features/superadmin/pages/settings/ProfileTab.jsx
import { useEffect, useState } from 'react';
import { useAdminProfile } from '../../hooks/useAdminProfile';
import AvatarUpload from '../../../teacher/components/AvatarUpload';
import { useI18n } from '../../../../shared/i18n';

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);
const GlobeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
  </svg>
);
const CheckBadgeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd" />
  </svg>
);
const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function ProfileTab() {
  const i18n = useI18n();
  const { t } = i18n;

  const {
    profile,
    loading,
    saving,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
  } = useAdminProfile();

  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    preferredLanguage: 'ar',
  });
  const [toast, setToast] = useState(null);

  // ✅ دالة موحّدة لتطبيق اللغة على الـ UI
  const applyLanguage = (lang) => {
    if (!lang) return;
    if (typeof i18n?.setLang === 'function') return i18n.setLang(lang);
    if (typeof i18n?.setLanguage === 'function') return i18n.setLanguage(lang);
    if (typeof i18n?.changeLanguage === 'function') return i18n.changeLanguage(lang);
    if (typeof i18n?.i18n?.changeLanguage === 'function')
      return i18n.i18n.changeLanguage(lang);
    try {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    } catch (_) {}
  };

  // ✅ مزامنة الفورم + تطبيق اللغة المفضلة من الباك
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        phoneNumber: profile.phoneNumber || '',
        preferredLanguage: profile.preferredLanguage || 'ar',
      });

      const savedLang = profile.preferredLanguage;
      const currentLang = i18n?.lang || i18n?.language;
      if (savedLang && savedLang !== currentLang) {
        applyLanguage(savedLang);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await updateProfile(form);
    if (res.success) {
      showToast('success', t('admin.profile.toastSaveSuccess'));

      // ✅ لو اللغة اتغيرت، طبّقها فورًا
      const currentLang = i18n?.lang || i18n?.language;
      if (form.preferredLanguage && form.preferredLanguage !== currentLang) {
        applyLanguage(form.preferredLanguage);
      }
    } else {
      showToast('error', res.error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">{t('common.loading')}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center bg-white border rounded-2xl p-10 shadow-sm">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-bold text-gray-800 mb-1">
          {t('admin.profile.loadFailedTitle')}
        </h3>
        <p className="text-sm text-gray-500">
          {t('admin.profile.loadFailedHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm shadow-xl ${
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        >
          <span className="text-lg">{toast.type === 'success' ? '✅' : '⚠️'}</span>
          {toast.msg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="relative bg-gradient-to-l from-indigo-600 via-indigo-500 to-violet-500 px-6 py-5">
          <div className="relative flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <UserIcon />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('admin.profile.cardTitle')}</h2>
              <p className="text-xs text-indigo-100">
                {t('admin.profile.cardSubtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full blur opacity-30" />
                <div className="relative">
                  <AvatarUpload
                    currentUrl={profile.profileImageUrl}
                    name={profile.name}
                    saving={saving}
                    onUpload={async (file) => {
                      const res = await uploadAvatar(file);
                      if (res.success)
                        showToast('success', t('admin.profile.toastUploadSuccess'));
                      else showToast('error', res.error);
                    }}
                    onDelete={async () => {
                      const res = await deleteAvatar();
                      if (res.success)
                        showToast('success', t('admin.profile.toastDeleteSuccess'));
                      else showToast('error', res.error);
                    }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white shadow">
                  <CheckBadgeIcon />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 w-full space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <span className="text-indigo-500"><UserIcon /></span>
                  {t('admin.profile.fullName')}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t('admin.profile.namePlaceholder')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="text-indigo-500"><MailIcon /></span>
                    {t('admin.profile.email')}
                  </span>
                  {profile.emailVerified ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckBadgeIcon /> {t('admin.profile.verified')}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      ⚠️ {t('admin.profile.unverified')}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={profile.email || ''}
                    disabled
                    readOnly
                    className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                  />
                  <span className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400">
                    <LockIcon />
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  🔒 {t('admin.profile.emailLockedHint')}
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <span className="text-indigo-500"><PhoneIcon /></span>
                  {t('admin.profile.phone')}
                </label>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  placeholder="+20 1xx xxx xxxx"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none"
                  maxLength={30}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <span className="text-indigo-500"><GlobeIcon /></span>
                  {t('admin.profile.preferredLanguage')}
                </label>
                <select
                  value={form.preferredLanguage}
                  onChange={(e) => {
                    const lang = e.target.value;
                    setForm({ ...form, preferredLanguage: lang });
                    applyLanguage(lang); // ✅ يتقلب فورًا
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none cursor-pointer"
                >
                  <option value="ar">🇪🇬 {t('admin.profile.languageAr')}</option>
                  <option value="en">🇬🇧 {t('admin.profile.languageEn')}</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-l from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('admin.profile.savingBtn')}
                    </>
                  ) : (
                    <>💾 {t('admin.profile.saveBtn')}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
