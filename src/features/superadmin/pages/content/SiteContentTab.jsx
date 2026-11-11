// src/features/superadmin/pages/content/SiteContentTab.jsx
import { useEffect, useMemo, useState } from 'react';
import { Search, Sprout, Save, X, Eye } from 'lucide-react';
import contentService from '../../../../shared/api/contentService';
import { useI18n } from '../../../../shared/i18n';
import { broadcastUpdate } from '../../../../shared/utils/liveUpdates';

/* ============================================================
   Constants
   ============================================================ */
const CATEGORIES = [
  { key: 'all',              label: { ar: 'الكل',              en: 'All Keys' },        icon: '📋' },
  { key: 'landing.hero',     label: { ar: 'الهيرو',            en: 'Hero' },            icon: '🎯' },
  { key: 'landing.trusted',  label: { ar: 'ثقة / إحصائيات',    en: 'Trusted / Stats' }, icon: '📊' },
  { key: 'landing.academies', label: { ar: 'الأكاديميات',       en: 'Academies' },       icon: '🏫' },
  { key: 'landing.features', label: { ar: 'المميزات',          en: 'Features' },        icon: '✨' },
  { key: 'landing.pricing',  label: { ar: 'الأسعار',           en: 'Pricing' },         icon: '💳' },
  { key: 'landing.testimonials', label: { ar: 'آراء العملاء',   en: 'Testimonials' },    icon: '💬' },
  { key: 'landing.impact',   label: { ar: 'التأثير',           en: 'Impact' },          icon: '📈' },
  { key: 'landing.teacherCta', label: { ar: 'دعوة المدرسين',   en: 'Teacher CTA' },     icon: '🎓' },
  { key: 'landing.faq',      label: { ar: 'الأسئلة',           en: 'FAQ' },             icon: '❓' },
  { key: 'landing.contact',  label: { ar: 'التواصل',           en: 'Contact' },         icon: '📧' },
  { key: 'landing.footer',   label: { ar: 'الفوتر',            en: 'Footer' },          icon: '🦶' },
  { key: 'landing.nav',      label: { ar: 'التنقل',            en: 'Nav' },             icon: '🧭' },
  { key: 'landing.mobileNav', label: { ar: 'تنقل الموبايل',    en: 'Mobile Nav' },      icon: '📱' },
  { key: 'landing.links',    label: { ar: 'الروابط',           en: 'Links' },           icon: '🔗' },
  { key: 'landing.header',   label: { ar: 'الهيدر',            en: 'Header' },          icon: '🏷️' },
  { key: 'other',            label: { ar: 'أخرى',              en: 'Other' },           icon: '📦' },
];

const CATEGORY_PREFIXES = CATEGORIES.filter(
  (c) => c.key !== 'all' && c.key !== 'other',
).map((c) => c.key);

function getCategory(key) {
  for (const prefix of CATEGORY_PREFIXES) {
    if (key.startsWith(prefix)) return prefix;
  }
  return 'other';
}

function parseDraft(raw) {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return '';
  try {
    return JSON.parse(trimmed);
  } catch {
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }
}

function draftToString(content) {
  if (content === null || content === undefined) return '';
  if (typeof content === 'string') return content;
  return JSON.stringify(content, null, 2);
}

/* ============================================================
   Main
   ============================================================ */
export default function SiteContentTab() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [openKey, setOpenKey] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await contentService.listSiteContent();
      setItems(Array.isArray(res) ? res : []);
    } catch (e) {
      setError(e?.response?.data?.message || (isAr ? 'فشل التحميل' : 'Failed to load site content'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSeed = async () => {
    const ok = window.confirm(
      isAr
        ? 'سيتم إضافة كل المفاتيح الافتراضية غير الموجودة. المفاتيح الموجودة لن تُلمس. متابعة؟'
        : 'This will add all missing default keys. Existing keys will not be touched. Continue?',
    );
    if (!ok) return;
    try {
      setSeeding(true);
      setError('');
      const res = await contentService.seedLandingDefaults();
      broadcastUpdate('site-content-updated');
      setSuccess(
        isAr
          ? `✅ تمت الإضافة: ${res?.data?.created ?? 0} مفتاح، تم التخطي: ${res?.data?.skipped ?? 0}`
          : `✅ Seeded ${res?.data?.created ?? 0} keys, skipped ${res?.data?.skipped ?? 0} existing`,
      );
      setTimeout(() => setSuccess(''), 4000);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || (isAr ? 'فشل الـ seed' : 'Seed failed'));
    } finally {
      setSeeding(false);
    }
  };

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (category !== 'all' && getCategory(it.key) !== category) return false;
      if (search.trim() && !it.key.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, search, category]);

  const counts = useMemo(() => {
    const c = { all: items.length, other: 0 };
    CATEGORY_PREFIXES.forEach((p) => (c[p] = 0));
    items.forEach((it) => {
      const cat = getCategory(it.key);
      c[cat] = (c[cat] || 0) + 1;
    });
    return c;
  }, [items]);

  const startEdit = (item) => {
    setOpenKey(item.key);
    const current = item.content ?? '';
    setDrafts((d) => ({ ...d, [item.key]: draftToString(current) }));
  };

  const save = async (key) => {
    try {
      setSaving(true);
      setError('');
      const content = parseDraft(drafts[key] ?? '');
      await contentService.updateSiteContent(key, content);
      broadcastUpdate('site-content-updated', { key });
      await load();
      setOpenKey(null);
      setSuccess(`✅ ${isAr ? 'تم الحفظ' : 'Saved'}: ${key}`);
      setTimeout(() => setSuccess(''), 2500);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || (isAr ? 'فشل الحفظ' : 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {isAr ? 'محتوى الموقع' : 'Site Content'}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {isAr
              ? 'تحكم في كل نصوص وصور اللاندنج بيدج. أي تعديل يظهر فوراً.'
              : 'Control all landing page texts and images. Changes appear instantly.'}
          </p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-60"
        >
          <Sprout className="h-4 w-4" />
          {seeding
            ? (isAr ? 'جاري الإضافة...' : 'Seeding...')
            : (isAr ? 'إضافة المفاتيح الافتراضية' : 'Seed Defaults')}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'ابحث عن مفتاح...' : 'Search keys...'}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 ps-10 pe-4 text-sm outline-none focus:border-[#0f2744]/40 focus:bg-white focus:ring-4 focus:ring-[#0f2744]/5"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => {
            const active = category === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-[#0f2744] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{c.icon}</span>
                <span>{isAr ? c.label.ar : c.label.en}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    active ? 'bg-white/20 text-white' : 'bg-white text-slate-500'
                  }`}
                >
                  {counts[c.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0f2744] border-t-transparent" />
          <p className="text-sm text-slate-500">{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          isAr={isAr}
          hasItems={items.length > 0}
          onSeed={handleSeed}
          seeding={seeding}
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <SiteItem
              key={item.key}
              item={item}
              isAr={isAr}
              isOpen={openKey === item.key}
              draft={drafts[item.key]}
              onEdit={() => startEdit(item)}
              onClose={() => setOpenKey(null)}
              onDraftChange={(v) => setDrafts((d) => ({ ...d, [item.key]: v }))}
              onSave={() => save(item.key)}
              saving={saving}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Sub Components
   ============================================================ */
function SiteItem({ item, isAr, isOpen, draft, onEdit, onClose, onDraftChange, onSave, saving }) {
  const categoryMeta =
    CATEGORIES.find((c) => c.key === getCategory(item.key)) ?? CATEGORIES[0];
  const content = item.content ?? '';
  const contentType = Array.isArray(content) ? 'array' : typeof content;
  const isLocalized =
    typeof content === 'object' &&
    content !== null &&
    !Array.isArray(content) &&
    ('ar' in content || 'en' in content);

  const preview = (() => {
    if (typeof content === 'string') return content.slice(0, 80);
    if (isLocalized) return content.ar || content.en || '';
    if (Array.isArray(content)) return `[${content.length} items]`;
    if (typeof content === 'object')
      return `{${Object.keys(content).slice(0, 3).join(', ')}${
        Object.keys(content).length > 3 ? ', …' : ''
      }}`;
    return String(content);
  })();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-base">{categoryMeta.icon}</span>
          <span className="rounded-md bg-[#0f2744]/5 px-2 py-1 font-mono text-xs font-bold text-[#0f2744]">
            {item.key}
          </span>
          <span className="hidden truncate text-xs text-slate-400 sm:inline">
            {preview}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              contentType === 'string'
                ? 'bg-slate-100 text-slate-600'
                : 'bg-purple-50 text-purple-700'
            }`}
          >
            {contentType}
          </span>
          {isLocalized && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              ar/en
            </span>
          )}
          {!isOpen ? (
            <button
              onClick={onEdit}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              ✏️ {isAr ? 'تعديل' : 'Edit'}
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                <X className="h-3.5 w-3.5" />
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0f2744] px-3 py-1 text-xs font-semibold text-white hover:bg-[#12325a] disabled:opacity-60"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
              </button>
            </>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-100 bg-slate-50/70 p-4">
          <div className="mb-3 rounded-lg border border-slate-200 bg-white p-3">
            <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <Eye className="h-3.5 w-3.5" />
              <span>{isAr ? 'القيمة الحالية' : 'Current Value'}</span>
            </div>
            <p className="line-clamp-3 text-xs text-slate-700">
              {typeof content === 'string'
                ? content
                : isLocalized
                ? `🇸🇦 ${content.ar || '—'} | 🇬🇧 ${content.en || '—'}`
                : preview}
            </p>
          </div>

          <textarea
            value={draft ?? ''}
            onChange={(e) => onDraftChange(e.target.value)}
            rows={10}
            spellCheck={false}
            dir="ltr"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#0f2744]/40 focus:ring-4 focus:ring-[#0f2744]/5"
          />

          <div className="mt-2 rounded-md bg-blue-50 p-2.5 text-[11px] text-blue-800">
            <div className="mb-1 font-semibold">💡 {isAr ? 'نصائح' : 'Tips'}:</div>
            <ul className="list-inside list-disc space-y-0.5 text-[10px]">
              <li>
                <strong>{isAr ? 'نص عادي' : 'Plain text'}</strong> (e.g. <code>hello</code>)
              </li>
              <li>
                <strong>{isAr ? 'مترجم' : 'Localized'}</strong>:{' '}
                <code>{`{"ar":"نص","en":"text"}`}</code>
              </li>
              <li>
                <strong>URL</strong>: <code>https://example.com</code>
              </li>
              <li>
                <strong>Array</strong>: <code>{`[{"key":"x"}]`}</code>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ isAr, hasItems, onSeed, seeding }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
        {hasItems ? '🔍' : '🌱'}
      </div>
      <h3 className="text-sm font-bold text-slate-800">
        {hasItems
          ? (isAr ? 'لا توجد مفاتيح مطابقة' : 'No keys match your filter')
          : (isAr ? 'لا يوجد محتوى بعد' : 'No site content yet')}
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        {hasItems
          ? (isAr ? 'جرب بحث أو تصنيف مختلف.' : 'Try a different search or category.')
          : (isAr ? 'اضغط بالأسفل لإضافة كل المفاتيح الافتراضية.' : 'Click below to seed all default landing keys.')}
      </p>
      {!hasItems && (
        <button
          onClick={onSeed}
          disabled={seeding}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
        >
          <Sprout className="h-4 w-4" />
          {seeding ? (isAr ? 'جاري الإضافة...' : 'Seeding...') : (isAr ? 'إضافة كل المفاتيح' : 'Seed All Landing Keys')}
        </button>
      )}
    </div>
  );
}
