import { useEffect, useState } from 'react';
import contentService from '../../../../shared/api/contentService';

export default function EmergencyTab() {
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
      setSuccess('Emergency settings saved');
      setTimeout(() => setSuccess(''), 2500);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="py-10 text-center text-sm text-slate-400">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-800">Emergency Settings</h2>
        <p className="text-xs text-slate-500">
          Show an emergency banner to all visitors and users on the platform
        </p>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* Toggle */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
        <div>
          <div className="text-sm font-semibold text-slate-800">
            Emergency mode
          </div>
          <div className="text-xs text-slate-500">
            When enabled, the banner is visible everywhere on the platform
          </div>
        </div>
        <button
          onClick={() => setEnabled((v) => !v)}
          className={`relative h-7 w-12 rounded-full transition ${
            enabled ? 'bg-red-500' : 'bg-slate-300'
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
              enabled ? 'left-[22px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {/* Messages */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3">
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Message (Arabic)
          </label>
          <textarea
            rows={3}
            value={messageAr}
            onChange={(e) => setMessageAr(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm outline-none focus:border-[#0f2744]/40 focus:bg-white focus:ring-4 focus:ring-[#0f2744]/5"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Message (English)
          </label>
          <textarea
            rows={3}
            value={messageEn}
            onChange={(e) => setMessageEn(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm outline-none focus:border-[#0f2744]/40 focus:bg-white focus:ring-4 focus:ring-[#0f2744]/5"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-[#0f2744] px-5 py-2 text-sm font-semibold text-white hover:bg-[#12325a] disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}