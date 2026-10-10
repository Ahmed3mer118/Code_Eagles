import { useState } from 'react';
import { useI18n } from '../i18n';
import { getAccessToken, getStoredUser } from '../api/client';
import userService from '../api/userService';

export default function LanguageSwitcher() {
  const i18n = useI18n();
  // نحاول نوصل للـ API بأي اسم متاح (lang / language / currentLang)
  const current =
    i18n?.lang || i18n?.language || i18n?.currentLang || i18n?.locale || 'ar';
  const setLang =
    i18n?.setLang || i18n?.changeLanguage || i18n?.setLocale || null;

  const [saving, setSaving] = useState(false);

  const changeLang = async (next) => {
    if (next === current || saving) return;

    // 1️⃣ نحدّث الـ UI فورًا (بدون انتظار الباك)
    try {
      setLang?.(next);
      // fallback: بعض الإعدادات بتحفظ في localStorage باسم i18nextLng
      localStorage.setItem('lang', next);
      localStorage.setItem('i18nextLng', next);
    } catch (_) {}

    // 2️⃣ نحفظ في الباك إند لو المستخدم مسجّل دخول
    if (!getAccessToken()) return;

    try {
      setSaving(true);
      await userService.updateMyProfile({ preferredLanguage: next });

      // 3️⃣ نحدّث نسخة اليوزر في localStorage عشان باقي الصفحات
      const u = getStoredUser() || {};
      localStorage.setItem(
        'user',
        JSON.stringify({ ...u, preferredLanguage: next }),
      );

      // إشعار اختياري: لو عندك toast
      // toast.success(next === 'ar' ? 'تم تغيير اللغة' : 'Language changed');
    } catch (err) {
      // لو الباك فشل، بنرجّع اللغة القديمة
      try {
        setLang?.(current);
      } catch (_) {}
      console.warn('Failed to persist preferredLanguage:', err);
    } finally {
      setSaving(false);
    }
  };

  const isAr = current === 'ar';

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => changeLang('ar')}
        disabled={saving}
        aria-pressed={isAr}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition
          ${
            isAr
              ? 'bg-[#0f2744] text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }
          ${saving ? 'opacity-70 cursor-wait' : ''}`}
      >
        🇸🇦 عربي
      </button>
      <button
        type="button"
        onClick={() => changeLang('en')}
        disabled={saving}
        aria-pressed={!isAr}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition
          ${
            !isAr
              ? 'bg-[#0f2744] text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }
          ${saving ? 'opacity-70 cursor-wait' : ''}`}
      >
        🌐 English
      </button>
    </div>
  );
}