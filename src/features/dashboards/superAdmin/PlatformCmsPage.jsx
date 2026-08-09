import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Download, Eye, LayoutTemplate, Pencil, Save } from 'lucide-react';
import { platformSiteApi } from '../../../shared/api/platformApi';
import PageHeader from '../../../shared/ui/PageHeader';
import StatusBadge from '../../../shared/ui/StatusBadge';
import ToggleSwitch from '../../../shared/ui/ToggleSwitch';
import FormModal from '../../../shared/ui/FormModal';
import FormField from '../../../shared/ui/FormField';

const TABS = ['sections', 'faq', 'testimonials', 'footer', 'backup'];
const SECTION_LABELS = {
  hero: 'Hero', features: 'Features', statistics: 'Statistics', featured: 'Featured',
  testimonials: 'Testimonials', faq: 'FAQ', cta: 'CTA',
};

const emptyTestimonial = {
  authorName: '', authorRole: 'student', academyName: '',
  review: { ar: '', en: '' }, rating: 5, status: 'approved', visible: true, pinned: false, order: 0,
};

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PlatformCmsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ar';
  const [tab, setTab] = useState('sections');
  const [site, setSite] = useState(null);
  const [faq, setFaq] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [backups, setBackups] = useState([]);
  const [sectionKey, setSectionKey] = useState('hero');
  const [sectionForm, setSectionForm] = useState({ enabled: true, published: true, title: { ar: '', en: '' }, subtitle: { ar: '', en: '' }, content: {} });
  const [faqForm, setFaqForm] = useState({ question: { ar: '', en: '' }, answer: { ar: '', en: '' }, published: true, order: 0 });
  const [editFaq, setEditFaq] = useState(null);
  const [editTestimonial, setEditTestimonial] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonial);
  const [footerForm, setFooterForm] = useState({ text: { ar: '', en: '' }, contactEmail: '', contactPhone: '', socialLinks: [] });
  const [backupForm, setBackupForm] = useState({ frequency: 'weekly', customCron: '' });
  const [runningBackup, setRunningBackup] = useState(false);

  const load = async () => {
    const [data, backupData] = await Promise.all([
      platformSiteApi.getAdmin(),
      platformSiteApi.listBackups().catch(() => ({ backups: [] })),
    ]);
    setSite(data.site);
    setFaq(data.faq || []);
    setTestimonials(data.testimonials || []);
    setBackups(backupData.backups || []);
    setBackupForm({ frequency: data.site?.backupSettings?.frequency || 'weekly', customCron: data.site?.backupSettings?.customCron || '' });
    setFooterForm({
      text: data.site?.footer?.text || { ar: '', en: '' },
      contactEmail: data.site?.footer?.contactEmail || '',
      contactPhone: data.site?.footer?.contactPhone || '',
      socialLinks: data.site?.footer?.socialLinks || [],
    });
    const section = (data.site?.sections || []).find((s) => s.key === sectionKey);
    if (section) setSectionForm(section);
  };

  useEffect(() => { load().catch((err) => toast.error(err?.message || t('common.error'))); }, [t]);
  useEffect(() => {
    const section = (site?.sections || []).find((s) => s.key === sectionKey);
    if (section) setSectionForm(section);
  }, [sectionKey, site]);

  const sortedSections = useMemo(
    () => [...(site?.sections || [])].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [site?.sections]
  );

  const saveSection = async () => {
    try {
      await platformSiteApi.updateSection(sectionKey, sectionForm);
      toast.success(t('common.success'));
      load();
    } catch (err) { toast.error(err?.message || t('common.error')); }
  };

  const toggleSectionEnabled = async (section, enabled) => {
    try {
      await platformSiteApi.updateSection(section.key, { ...section, enabled });
      toast.success(t('common.success'));
      load();
    } catch (err) { toast.error(err?.message || t('common.error')); }
  };

  const addFaq = async () => {
    try {
      await platformSiteApi.createFaq(faqForm);
      toast.success(t('common.success'));
      setFaqForm({ question: { ar: '', en: '' }, answer: { ar: '', en: '' }, published: true, order: faq.length });
      load();
    } catch (err) { toast.error(err?.message || t('common.error')); }
  };

  const saveFaqEdit = async (values) => {
    await platformSiteApi.updateFaq(editFaq._id, values);
    toast.success(t('common.success'));
    load();
  };

  const addTestimonial = async () => {
    try {
      await platformSiteApi.createTestimonial(testimonialForm);
      toast.success(t('common.success'));
      setTestimonialForm(emptyTestimonial);
      load();
    } catch (err) { toast.error(err?.message || t('common.error')); }
  };

  const saveTestimonialEdit = async (values) => {
    await platformSiteApi.updateTestimonial(editTestimonial._id, values);
    toast.success(t('common.success'));
    load();
  };

  const toggleTestimonial = async (item, patch) => {
    try {
      await platformSiteApi.updateTestimonial(item._id, patch);
      load();
    } catch (err) { toast.error(err?.message || t('common.error')); }
  };

  const saveFooter = async () => {
    try {
      await platformSiteApi.updateFooter(footerForm);
      toast.success(t('common.success'));
      load();
    } catch (err) { toast.error(err?.message || t('common.error')); }
  };

  const saveBackupSettings = async () => {
    try {
      await platformSiteApi.updateBackupSettings(backupForm);
      toast.success(t('common.success'));
      load();
    } catch (err) { toast.error(err?.message || t('common.error')); }
  };

  const runBackup = async () => {
    setRunningBackup(true);
    try {
      await platformSiteApi.runBackup();
      toast.success(t('admin.backupSuccess'));
      load();
    } catch (err) { toast.error(err?.message || t('common.error')); }
    finally { setRunningBackup(false); }
  };

  const downloadBackup = async (filename) => {
    try {
      const blob = await platformSiteApi.downloadBackup(filename);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) { toast.error(err?.message || t('common.error')); }
  };

  const updateSocialLink = (index, field, value) => {
    const next = [...(footerForm.socialLinks || [])];
    next[index] = { ...next[index], [field]: value };
    setFooterForm({ ...footerForm, socialLinks: next });
  };

  const featuredMode = sectionForm.content?.mode || sectionForm.content?.type || 'programming_tracks';

  return (
    <div className="space-y-6">
      <PageHeader title={t('admin.cmsTitle')} subtitle={t('admin.cmsSubtitle')} />

      <div className="flex flex-wrap gap-2 rounded-2xl bg-[var(--ce-bg)] p-2">
        {TABS.map((key) => (
          <button key={key} type="button" className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === key ? 'bg-[var(--ce-primary)] text-white shadow-sm' : 'text-[var(--ce-primary)] hover:bg-white'}`} onClick={() => setTab(key)}>
            {t(`admin.tab.${key}`)}
          </button>
        ))}
      </div>

      {tab === 'sections' && (
        <div className="grid gap-6 xl:grid-cols-[260px_1fr_320px]">
          <aside className="ce-card p-4">
            <div className="mb-3 flex items-center gap-2 font-bold text-[var(--ce-primary)]">
              <LayoutTemplate className="h-4 w-4" />{t('admin.sections')}
            </div>
            <div className="space-y-2">
              {sortedSections.map((section) => (
                <div key={section.key} className={`rounded-xl border p-3 ${sectionKey === section.key ? 'border-[var(--ce-accent)] bg-[var(--ce-accent)]/5' : 'border-[var(--ce-border)]'}`}>
                  <button type="button" className="mb-2 w-full text-start text-sm font-semibold text-[var(--ce-primary)]" onClick={() => setSectionKey(section.key)}>
                    {SECTION_LABELS[section.key] || section.key}
                  </button>
                  <ToggleSwitch
                    label={t('admin.sectionVisible')}
                    checked={section.enabled !== false}
                    onChange={(v) => toggleSectionEnabled(section, v)}
                  />
                </div>
              ))}
            </div>
          </aside>

          <div className="ce-card space-y-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-extrabold text-[var(--ce-primary)]">{t('admin.cmsEditor')}: {sectionKey}</h3>
              <button type="button" className="ce-btn ce-btn-primary inline-flex items-center gap-2" onClick={saveSection}>
                <Save className="h-4 w-4" />{t('common.save')}
              </button>
            </div>
            <FormField label={t('admin.sectionVisible')} helper={t('admin.sectionVisibleHint')}>
              <ToggleSwitch label={sectionForm.enabled !== false ? t('admin.on') : t('admin.off')} checked={sectionForm.enabled !== false} onChange={(v) => setSectionForm({ ...sectionForm, enabled: v })} />
            </FormField>
            <FormField label={t('admin.published')} helper={t('admin.publishedHint')}>
              <ToggleSwitch label={sectionForm.published !== false ? t('admin.on') : t('admin.off')} checked={sectionForm.published !== false} onChange={(v) => setSectionForm({ ...sectionForm, published: v })} />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label={`${t('admin.title')} (AR)`} helper={t('admin.fieldSectionTitleHint')}>
                <input className="ce-input" value={sectionForm.title?.ar || ''} onChange={(e) => setSectionForm({ ...sectionForm, title: { ...sectionForm.title, ar: e.target.value } })} />
              </FormField>
              <FormField label={`${t('admin.title')} (EN)`}>
                <input className="ce-input" value={sectionForm.title?.en || ''} onChange={(e) => setSectionForm({ ...sectionForm, title: { ...sectionForm.title, en: e.target.value } })} />
              </FormField>
              <FormField label={`${t('admin.subtitle')} (AR)`} helper={t('admin.fieldSectionSubtitleHint')}>
                <input className="ce-input md:col-span-2" value={sectionForm.subtitle?.ar || ''} onChange={(e) => setSectionForm({ ...sectionForm, subtitle: { ...sectionForm.subtitle, ar: e.target.value } })} />
              </FormField>
              <FormField label={`${t('admin.subtitle')} (EN)`}>
                <input className="ce-input md:col-span-2" value={sectionForm.subtitle?.en || ''} onChange={(e) => setSectionForm({ ...sectionForm, subtitle: { ...sectionForm.subtitle, en: e.target.value } })} />
              </FormField>
            </div>
            {sectionKey === 'featured' && (
              <FormField label={t('admin.featuredMode')} helper={t('admin.fieldFeaturedModeHint')}>
                <select className="ce-input max-w-md" value={featuredMode} onChange={(e) => setSectionForm({ ...sectionForm, content: { ...sectionForm.content, mode: e.target.value, type: e.target.value } })}>
                  <option value="programming_tracks">{t('admin.featuredProgramming')}</option>
                  <option value="top_academies">{t('admin.featuredAcademies')}</option>
                </select>
              </FormField>
            )}
          </div>

          <aside className="ce-card p-6">
            <div className="mb-4 flex items-center gap-2 font-bold text-[var(--ce-primary)]"><Eye className="h-4 w-4" />{t('admin.cmsPreview')}</div>
            <div className="rounded-2xl border border-dashed border-[var(--ce-border)] bg-gradient-to-br from-[var(--ce-bg)] to-white p-5">
              <p className="text-xs uppercase tracking-wide text-[var(--ce-muted)]">{sectionKey}</p>
              <h4 className="mt-2 text-xl font-black text-[var(--ce-primary)]">{sectionForm.title?.[lang] || t('admin.title')}</h4>
              <p className="mt-2 text-sm text-[var(--ce-muted)]">{sectionForm.subtitle?.[lang] || t('admin.subtitle')}</p>
              <div className="mt-4 flex gap-2">
                <StatusBadge status={sectionForm.enabled ? 'approved' : 'pending'} label={sectionForm.enabled ? t('admin.sectionVisible') : t('admin.hidden')} />
              </div>
            </div>
          </aside>
        </div>
      )}

      {tab === 'faq' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="ce-card space-y-4 p-6">
            <h3 className="font-bold text-[var(--ce-primary)]">{t('admin.addFaq')}</h3>
            <FormField label={t('admin.questionAr')} helper={t('admin.fieldFaqQuestionHint')}><input className="ce-input" value={faqForm.question.ar} onChange={(e) => setFaqForm({ ...faqForm, question: { ...faqForm.question, ar: e.target.value } })} /></FormField>
            <FormField label={t('admin.questionEn')}><input className="ce-input" value={faqForm.question.en} onChange={(e) => setFaqForm({ ...faqForm, question: { ...faqForm.question, en: e.target.value } })} /></FormField>
            <FormField label={t('admin.answerAr')} helper={t('admin.fieldFaqAnswerHint')}><textarea className="ce-input min-h-[80px]" value={faqForm.answer.ar} onChange={(e) => setFaqForm({ ...faqForm, answer: { ...faqForm.answer, ar: e.target.value } })} /></FormField>
            <FormField label={t('admin.answerEn')}><textarea className="ce-input min-h-[80px]" value={faqForm.answer.en} onChange={(e) => setFaqForm({ ...faqForm, answer: { ...faqForm.answer, en: e.target.value } })} /></FormField>
            <button type="button" className="ce-btn ce-btn-accent" onClick={addFaq}>{t('admin.addFaq')}</button>
          </div>
          <div className="ce-card p-6">
            <h3 className="mb-4 font-bold text-[var(--ce-primary)]">{t('admin.faq')} ({faq.length})</h3>
            <div className="space-y-2 max-h-[520px] overflow-y-auto">
              {faq.map((item) => (
                <div key={item._id} className="rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] p-4">
                  <p className="font-semibold">{item.question?.[lang]}</p>
                  <p className="mt-1 text-sm text-[var(--ce-muted)]">{item.answer?.[lang]}</p>
                  <button type="button" className="ce-btn ce-btn-ghost mt-3 inline-flex items-center gap-1 text-xs" onClick={() => setEditFaq(item)}>
                    <Pencil className="h-3.5 w-3.5" />{t('admin.editContent')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'testimonials' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="ce-card space-y-4 p-6">
            <h3 className="font-bold text-[var(--ce-primary)]">{t('admin.addTestimonial')}</h3>
            <FormField label={t('admin.authorName')} helper={t('admin.fieldAuthorHint')}><input className="ce-input" value={testimonialForm.authorName} onChange={(e) => setTestimonialForm({ ...testimonialForm, authorName: e.target.value })} /></FormField>
            <FormField label={t('admin.academyName')}><input className="ce-input" value={testimonialForm.academyName} onChange={(e) => setTestimonialForm({ ...testimonialForm, academyName: e.target.value })} /></FormField>
            <FormField label={t('admin.reviewAr')}><textarea className="ce-input min-h-[70px]" value={testimonialForm.review.ar} onChange={(e) => setTestimonialForm({ ...testimonialForm, review: { ...testimonialForm.review, ar: e.target.value } })} /></FormField>
            <FormField label={t('admin.reviewEn')}><textarea className="ce-input min-h-[70px]" value={testimonialForm.review.en} onChange={(e) => setTestimonialForm({ ...testimonialForm, review: { ...testimonialForm.review, en: e.target.value } })} /></FormField>
            <button type="button" className="ce-btn ce-btn-accent" onClick={addTestimonial}>{t('admin.addTestimonial')}</button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {testimonials.map((item) => (
              <article key={item._id} className="ce-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div><p className="font-bold">{item.authorName}</p><p className="text-xs text-[var(--ce-muted)]">{item.review?.[lang]}</p></div>
                  <StatusBadge status={item.visible ? 'approved' : 'pending'} label={item.visible ? t('admin.show') : t('admin.hide')} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => toggleTestimonial(item, { visible: !item.visible })}>{item.visible ? t('admin.hide') : t('admin.show')}</button>
                  <button type="button" className="ce-btn ce-btn-ghost text-xs inline-flex items-center gap-1" onClick={() => setEditTestimonial(item)}><Pencil className="h-3.5 w-3.5" />{t('admin.editContent')}</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === 'footer' && (
        <div className="ce-card space-y-4 p-6">
          <h3 className="font-bold text-[var(--ce-primary)]">{t('admin.footer')}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label={`${t('admin.footerText')} (AR)`} helper={t('admin.fieldFooterTextHint')}><textarea className="ce-input min-h-[80px]" value={footerForm.text?.ar || ''} onChange={(e) => setFooterForm({ ...footerForm, text: { ...footerForm.text, ar: e.target.value } })} /></FormField>
            <FormField label={`${t('admin.footerText')} (EN)`}><textarea className="ce-input min-h-[80px]" value={footerForm.text?.en || ''} onChange={(e) => setFooterForm({ ...footerForm, text: { ...footerForm.text, en: e.target.value } })} /></FormField>
            <FormField label={t('admin.contactEmail')} helper={t('admin.fieldContactEmailHint')}><input className="ce-input" value={footerForm.contactEmail} onChange={(e) => setFooterForm({ ...footerForm, contactEmail: e.target.value })} /></FormField>
            <FormField label={t('admin.contactPhone')} helper={t('admin.fieldContactPhoneHint')}><input className="ce-input" value={footerForm.contactPhone} onChange={(e) => setFooterForm({ ...footerForm, contactPhone: e.target.value })} /></FormField>
          </div>
          <button type="button" className="ce-btn ce-btn-primary" onClick={saveFooter}>{t('common.save')}</button>
        </div>
      )}

      {tab === 'backup' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="ce-card space-y-4 p-6">
            <h3 className="font-bold text-[var(--ce-primary)]">{t('admin.backupTitle')}</h3>
            <p className="text-sm text-[var(--ce-muted)]">{t('admin.backupHint')}</p>
            <FormField label={t('admin.backupFrequency')} helper={t('admin.fieldBackupFreqHint')}>
              <select className="ce-input max-w-xs" value={backupForm.frequency} onChange={(e) => setBackupForm({ ...backupForm, frequency: e.target.value })}>
                <option value="daily">{t('admin.freq.daily')}</option>
                <option value="every_3_days">{t('admin.freq.every3')}</option>
                <option value="weekly">{t('admin.freq.weekly')}</option>
                <option value="monthly">{t('admin.freq.monthly')}</option>
                <option value="custom">{t('admin.freq.custom')}</option>
              </select>
            </FormField>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="ce-btn ce-btn-primary" onClick={saveBackupSettings}>{t('common.save')}</button>
              <button type="button" className="ce-btn ce-btn-accent" onClick={runBackup} disabled={runningBackup}>{runningBackup ? t('common.loading') : t('admin.runBackup')}</button>
            </div>
          </div>
          <div className="ce-card p-6">
            <h3 className="mb-4 font-bold text-[var(--ce-primary)]">{t('admin.lastBackup')}</h3>
            <div className="space-y-3">
              {(site?.backupLogs || []).slice(0, 5).map((log, i) => (
                <div key={i} className="rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{log.ranAt ? new Date(log.ranAt).toLocaleString() : '—'}</p>
                    <StatusBadge status={log.status === 'success' ? 'approved' : 'rejected'} label={log.status} />
                  </div>
                  {log.filename && (
                    <button type="button" className="ce-btn ce-btn-ghost mt-3 inline-flex items-center gap-1 text-xs" onClick={() => downloadBackup(log.filename)}>
                      <Download className="h-3.5 w-3.5" />{t('admin.backupDownload')}
                    </button>
                  )}
                </div>
              ))}
              {backups.map((file) => (
                <div key={file.filename} className="flex items-center justify-between rounded-xl border border-[var(--ce-border)] p-3 text-sm">
                  <div><p className="font-semibold">{file.filename}</p><p className="text-[var(--ce-muted)]">{formatBytes(file.sizeBytes)}</p></div>
                  <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => downloadBackup(file.filename)}>{t('admin.backupDownload')}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <FormModal open={!!editFaq} onClose={() => setEditFaq(null)} title={t('admin.editContent')} initialValues={editFaq || faqForm} onSubmit={saveFaqEdit} size="lg">
        {({ values, setValues }) => (
          <>
            <FormField label={t('admin.questionAr')}><input className="ce-input" value={values.question?.ar || ''} onChange={(e) => setValues({ ...values, question: { ...values.question, ar: e.target.value } })} /></FormField>
            <FormField label={t('admin.questionEn')}><input className="ce-input" value={values.question?.en || ''} onChange={(e) => setValues({ ...values, question: { ...values.question, en: e.target.value } })} /></FormField>
            <FormField label={t('admin.answerAr')}><textarea className="ce-input min-h-[80px]" value={values.answer?.ar || ''} onChange={(e) => setValues({ ...values, answer: { ...values.answer, ar: e.target.value } })} /></FormField>
            <FormField label={t('admin.answerEn')}><textarea className="ce-input min-h-[80px]" value={values.answer?.en || ''} onChange={(e) => setValues({ ...values, answer: { ...values.answer, en: e.target.value } })} /></FormField>
          </>
        )}
      </FormModal>

      <FormModal open={!!editTestimonial} onClose={() => setEditTestimonial(null)} title={t('admin.editContent')} initialValues={editTestimonial || emptyTestimonial} onSubmit={saveTestimonialEdit} size="lg">
        {({ values, setValues }) => (
          <>
            <FormField label={t('admin.authorName')}><input className="ce-input" value={values.authorName || ''} onChange={(e) => setValues({ ...values, authorName: e.target.value })} /></FormField>
            <FormField label={t('admin.academyName')}><input className="ce-input" value={values.academyName || ''} onChange={(e) => setValues({ ...values, academyName: e.target.value })} /></FormField>
            <FormField label={t('admin.reviewAr')}><textarea className="ce-input min-h-[70px]" value={values.review?.ar || ''} onChange={(e) => setValues({ ...values, review: { ...values.review, ar: e.target.value } })} /></FormField>
            <FormField label={t('admin.reviewEn')}><textarea className="ce-input min-h-[70px]" value={values.review?.en || ''} onChange={(e) => setValues({ ...values, review: { ...values.review, en: e.target.value } })} /></FormField>
          </>
        )}
      </FormModal>
    </div>
  );
}
