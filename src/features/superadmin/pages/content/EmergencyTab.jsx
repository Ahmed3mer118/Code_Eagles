// src/features/superadmin/pages/content/EmergencyTab.jsx
import { useEffect, useState } from 'react';
import { Siren, AlertTriangle, Save } from 'lucide-react';
import contentService from '../../../../shared/api/contentService';
import { useI18n } from '../../../../shared/i18n';
import { broadcastUpdate } from '../../../../shared/utils/liveUpdates';

export default function EmergencyTab() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [enabled, setEnabled] = useState(false);
  const [messageAr, setMessageAr] = useState('');
  const [messageEn, setMessageEn] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await contentService.getEmergency();
        setEnabled(!!data?.enabled);
        setMessageAr(data?.message?.ar || '');
        setMessageEn(data?.message?.en || '');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    setSaving(true);
    setSuccess('');
    try {
      await contentService.updateEmergency({
        enabled,
        message: { ar: messageAr, en: messageEn },
      });
      broadcastUpdate('emergency-updated');
      setSuccess(isAr ? 'تم حفظ إعدادات الطوارئ بنجاح' : 'Emergency settings saved');
      setTimeout(() => setSuccess(''), 2500);
    } catch (e) {
      alert(e?.response?.data?.message || (isAr ? 'فشل الحفظ' : 'Failed to save'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#0f2744] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <Siren className="h-5 w-5 text-rose-500" />
          {isAr ? 'وضع الطوارئ' : 'Emergency Mode'}
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          {isAr
            ? 'عند التفعيل، سيظهر بانر تحذيري لجميع المستخدمين في كل أنحاء المنصة.'
            : 'When enabled, an emergency banner will appear to all users across the platform.'}
        </p>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
          ✅ {success}
        </div>
      )}

      {/* Toggle */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <div className="text-sm font-bold text-slate-800">
            {isAr ? 'تفعيل وضع الطوارئ' : 'Enable emergency mode'}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {isAr
              ? 'سيظهر البانر في أعلى كل صفحة في المنصة.'
              : 'The banner will appear at the top of every page.'}
          </div>
        </div>
        <button
          onClick={() => setEnabled((v) => !v)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${
            enabled ? 'bg-rose-500' : 'bg-slate-300'
          }`}
          aria-pressed={enabled}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
              enabled ? (isAr ? 'right-0.5' : 'left-[22px]') : (isAr ? 'right-[22px]' : 'left-0.5')
            }`}
          />
        </button>
      </div>

      {/* Warning */}
      {enabled && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {isAr
              ? 'تحذير: تفعيل وضع الطوارئ سيُظهر البانر لكل المستخدمين فوراً بعد الحفظ.'
              : 'Warning: Enabling emergency mode will show the banner to all users immediately after saving.'}
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            {isAr ? 'الرسالة (عربي)' : 'Message (Arabic)'}
          </label>
          <textarea
            rows={3}
            value={messageAr}
            onChange={(e) => setMessageAr(e.target.value)}
            dir="rtl"
            className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm outline-none transition focus:border-[#0f2744]/40 focus:bg-white focus:ring-4 focus:ring-[#0f2744]/5"
            placeholder={isAr ? 'مثال: صيانة مجدولة الليلة من 2 إلى 4 صباحاً' : 'e.g. Scheduled maintenance tonight 2-4 AM'}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            {isAr ? 'الرسالة (إنجليزي)' : 'Message (English)'}
          </label>
          <textarea
            rows={3}
            value={messageEn}
            onChange={(e) => setMessageEn(e.target.value)}
            dir="ltr"
            className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm outline-none transition focus:border-[#0f2744]/40 focus:bg-white focus:ring-4 focus:ring-[#0f2744]/5"
            placeholder="e.g. Scheduled maintenance tonight 2-4 AM"
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0f2744] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#12325a] disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving
            ? (isAr ? 'جاري الحفظ...' : 'Saving...')
            : (isAr ? 'حفظ التغييرات' : 'Save changes')}
        </button>
      </div>
    </div>
  );
}
