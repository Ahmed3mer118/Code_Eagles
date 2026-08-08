import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { platformSiteApi } from '../../../shared/api/platformApi';
import PageHeader from '../../../shared/ui/PageHeader';
import StatusBadge from '../../../shared/ui/StatusBadge';

const TABS = ['sections', 'faq', 'testimonials', 'footer', 'backup'];

const emptyTestimonial = {
  authorName: '',
  authorRole: 'student',
  academyName: '',
  review: { ar: '', en: '' },
  rating: 5,
  status: 'approved',
  visible: true,
  pinned: false,
  order: 0,
};

export default function PlatformCmsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ar';
  const [tab, setTab] = useState('sections');
  const [site, setSite] = useState(null);
  const [faq, setFaq] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [sectionKey, setSectionKey] = useState('hero');
  const [sectionForm, setSectionForm] = useState({ enabled: true, published: true, title: { ar: '', en: '' }, subtitle: { ar: '', en: '' }, content: {} });
  const [faqForm, setFaqForm] = useState({ question: { ar: '', en: '' }, answer: { ar: '', en: '' }, published: true, order: 0 });
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonial);
  const [footerForm, setFooterForm] = useState({ text: { ar: '', en: '' }, contactEmail: '', contactPhone: '', socialLinks: [] });
  const [backupForm, setBackupForm] = useState({ frequency: 'weekly', customCron: '' });
  const [runningBackup, setRunningBackup] = useState(false);

  const load = async () => {
    const data = await platformSiteApi.getAdmin();
    setSite(data.site);
    setFaq(data.faq || []);
    setTestimonials(data.testimonials || []);
    setBackupForm({
      frequency: data.site?.backupSettings?.frequency || 'weekly',
      customCron: data.site?.backupSettings?.customCron || '',
    });
    setFooterForm({
      text: data.site?.footer?.text || { ar: '', en: '' },
      contactEmail: data.site?.footer?.contactEmail || '',
      contactPhone: data.site?.footer?.contactPhone || '',
      socialLinks: data.site?.footer?.socialLinks || [],
    });
    const section = (data.site?.sections || []).find((s) => s.key === sectionKey);
    if (section) setSectionForm(section);
  };

  useEffect(() => {
    load().catch((err) => toast.error(err?.message || t('common.error')));
  }, [t]);

  useEffect(() => {
    const section = (site?.sections || []).find((s) => s.key === sectionKey);
    if (section) setSectionForm(section);
  }, [sectionKey, site]);

  const saveSection = async () => {
    try {
      await platformSiteApi.updateSection(sectionKey, sectionForm);
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const addFaq = async () => {
    try {
      await platformSiteApi.createFaq(faqForm);
      toast.success(t('common.success'));
      setFaqForm({ question: { ar: '', en: '' }, answer: { ar: '', en: '' }, published: true, order: 0 });
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const removeFaq = async (id) => {
    try {
      await platformSiteApi.deleteFaq(id);
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const addTestimonial = async () => {
    try {
      await platformSiteApi.createTestimonial(testimonialForm);
      toast.success(t('common.success'));
      setTestimonialForm(emptyTestimonial);
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const toggleTestimonial = async (item, patch) => {
    try {
      await platformSiteApi.updateTestimonial(item._id, patch);
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const removeTestimonial = async (id) => {
    try {
      await platformSiteApi.removeTestimonial(id);
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const saveFooter = async () => {
    try {
      await platformSiteApi.updateFooter(footerForm);
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const saveBackupSettings = async () => {
    try {
      await platformSiteApi.updateBackupSettings(backupForm);
      toast.success(t('common.success'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const runBackup = async () => {
    setRunningBackup(true);
    try {
      await platformSiteApi.runBackup();
      toast.success(t('admin.backupSuccess'));
      load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setRunningBackup(false);
    }
  };

  const updateSocialLink = (index, field, value) => {
    const next = [...(footerForm.socialLinks || [])];
    next[index] = { ...next[index], [field]: value };
    setFooterForm({ ...footerForm, socialLinks: next });
  };

  const addSocialLink = () => {
    setFooterForm({
      ...footerForm,
      socialLinks: [...(footerForm.socialLinks || []), { label: '', url: '', platform: 'facebook' }],
    });
  };

  const removeSocialLink = (index) => {
    setFooterForm({
      ...footerForm,
      socialLinks: (footerForm.socialLinks || []).filter((_, i) => i !== index),
    });
  };

  const featuredMode = sectionForm.content?.mode || sectionForm.content?.type || 'programming_tracks';

  return (
    <div className="space-y-6">
      <PageHeader title={t('admin.cmsTitle')} subtitle={t('admin.cmsSubtitle')} />

      <div className="flex flex-wrap gap-2 border-b border-[var(--ce-border)] pb-3">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === key ? 'bg-[var(--ce-primary)] text-white' : 'bg-[var(--ce-bg)] text-[var(--ce-primary)]'}`}
            onClick={() => setTab(key)}
          >
            {t(`admin.tab.${key}`)}
          </button>
        ))}
      </div>

      {tab === 'sections' && (
        <div className="ce-card space-y-4 p-6">
          <h3 className="font-bold text-[var(--ce-primary)]">{t('admin.sections')}</h3>
          <select className="ce-input max-w-md" value={sectionKey} onChange={(e) => setSectionKey(e.target.value)}>
            {(site?.sections || []).map((s) => <option key={s.key} value={s.key}>{s.key}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={sectionForm.enabled} onChange={(e) => setSectionForm({ ...sectionForm, enabled: e.target.checked })} />
            {t('admin.enabled')}
          </label>
          <label className="block">
            <span className="ce-label">{t('admin.title')}</span>
            <input className="ce-input" value={sectionForm.title?.[lang] || ''} onChange={(e) => setSectionForm({ ...sectionForm, title: { ...sectionForm.title, [lang]: e.target.value } })} />
          </label>
          <label className="block">
            <span className="ce-label">{t('admin.subtitle')}</span>
            <input className="ce-input" value={sectionForm.subtitle?.[lang] || ''} onChange={(e) => setSectionForm({ ...sectionForm, subtitle: { ...sectionForm.subtitle, [lang]: e.target.value } })} />
          </label>
          {sectionKey === 'featured' && (
            <label className="block">
              <span className="ce-label">{t('admin.featuredMode')}</span>
              <select
                className="ce-input max-w-md"
                value={featuredMode}
                onChange={(e) => setSectionForm({ ...sectionForm, content: { ...sectionForm.content, mode: e.target.value, type: e.target.value } })}
              >
                <option value="programming_tracks">{t('admin.featuredProgramming')}</option>
                <option value="top_academies">{t('admin.featuredAcademies')}</option>
              </select>
            </label>
          )}
          <button type="button" className="ce-btn ce-btn-primary" onClick={saveSection}>{t('common.save')}</button>
        </div>
      )}

      {tab === 'faq' && (
        <div className="ce-card space-y-4 p-6">
          <h3 className="font-bold text-[var(--ce-primary)]">{t('admin.faq')}</h3>
          <input className="ce-input" placeholder={t('admin.questionAr')} value={faqForm.question.ar} onChange={(e) => setFaqForm({ ...faqForm, question: { ...faqForm.question, ar: e.target.value } })} />
          <input className="ce-input" placeholder={t('admin.questionEn')} value={faqForm.question.en} onChange={(e) => setFaqForm({ ...faqForm, question: { ...faqForm.question, en: e.target.value } })} />
          <textarea className="ce-input min-h-[80px]" placeholder={t('admin.answerAr')} value={faqForm.answer.ar} onChange={(e) => setFaqForm({ ...faqForm, answer: { ...faqForm.answer, ar: e.target.value } })} />
          <textarea className="ce-input min-h-[80px]" placeholder={t('admin.answerEn')} value={faqForm.answer.en} onChange={(e) => setFaqForm({ ...faqForm, answer: { ...faqForm.answer, en: e.target.value } })} />
          <button type="button" className="ce-btn ce-btn-accent" onClick={addFaq}>{t('admin.addFaq')}</button>
          <div className="space-y-2 text-sm max-h-96 overflow-y-auto">
            {faq.map((item) => (
              <div key={item._id} className="flex items-start justify-between gap-3 rounded-xl bg-[var(--ce-bg)] p-3">
                <p className="font-semibold">{item.question?.[lang]}</p>
                <button type="button" className="ce-btn ce-btn-ghost text-xs shrink-0" onClick={() => removeFaq(item._id)}>{t('content.delete')}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'testimonials' && (
        <div className="ce-card space-y-4 p-6">
          <h3 className="font-bold text-[var(--ce-primary)]">{t('admin.testimonials')}</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="ce-input" placeholder={t('admin.authorName')} value={testimonialForm.authorName} onChange={(e) => setTestimonialForm({ ...testimonialForm, authorName: e.target.value })} />
            <input className="ce-input" placeholder={t('admin.academyName')} value={testimonialForm.academyName} onChange={(e) => setTestimonialForm({ ...testimonialForm, academyName: e.target.value })} />
            <textarea className="ce-input min-h-[70px] md:col-span-2" placeholder={t('admin.reviewAr')} value={testimonialForm.review.ar} onChange={(e) => setTestimonialForm({ ...testimonialForm, review: { ...testimonialForm.review, ar: e.target.value } })} />
            <textarea className="ce-input min-h-[70px] md:col-span-2" placeholder={t('admin.reviewEn')} value={testimonialForm.review.en} onChange={(e) => setTestimonialForm({ ...testimonialForm, review: { ...testimonialForm.review, en: e.target.value } })} />
          </div>
          <button type="button" className="ce-btn ce-btn-accent" onClick={addTestimonial}>{t('admin.addTestimonial')}</button>
          <div className="grid gap-3 md:grid-cols-2">
            {testimonials.map((item) => (
              <article key={item._id} className="rounded-xl border border-[var(--ce-border)] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{item.authorName}</p>
                    <p className="text-xs text-[var(--ce-muted)]">{item.review?.[lang]}</p>
                  </div>
                  <StatusBadge status={item.status === 'approved' ? 'approved' : 'pending'} label={item.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => toggleTestimonial(item, { visible: !item.visible })}>
                    {item.visible ? t('admin.hide') : t('admin.show')}
                  </button>
                  <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => toggleTestimonial(item, { order: (item.order || 0) - 1 })}>↑</button>
                  <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => toggleTestimonial(item, { order: (item.order || 0) + 1 })}>↓</button>
                  <button type="button" className="ce-btn ce-btn-ghost text-xs" onClick={() => removeTestimonial(item._id)}>{t('content.delete')}</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === 'footer' && (
        <div className="ce-card space-y-4 p-6">
          <h3 className="font-bold text-[var(--ce-primary)]">{t('admin.footer')}</h3>
          <label className="block">
            <span className="ce-label">{t('admin.footerText')}</span>
            <textarea className="ce-input min-h-[80px]" value={footerForm.text?.[lang] || ''} onChange={(e) => setFooterForm({ ...footerForm, text: { ...footerForm.text, [lang]: e.target.value } })} />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="ce-label">{t('admin.contactEmail')}</span>
              <input className="ce-input" value={footerForm.contactEmail} onChange={(e) => setFooterForm({ ...footerForm, contactEmail: e.target.value })} />
            </label>
            <label className="block">
              <span className="ce-label">{t('admin.contactPhone')}</span>
              <input className="ce-input" value={footerForm.contactPhone} onChange={(e) => setFooterForm({ ...footerForm, contactPhone: e.target.value })} />
            </label>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold text-[var(--ce-primary)]">{t('admin.socialLinks')}</span>
              <button type="button" className="ce-btn ce-btn-ghost text-sm" onClick={addSocialLink}>+ {t('admin.addLink')}</button>
            </div>
            <div className="space-y-3">
              {(footerForm.socialLinks || []).map((link, index) => (
                <div key={index} className="grid gap-2 rounded-xl border border-[var(--ce-border)] p-3 md:grid-cols-4">
                  <input className="ce-input" placeholder={t('admin.platform')} value={link.platform || ''} onChange={(e) => updateSocialLink(index, 'platform', e.target.value)} />
                  <input className="ce-input" placeholder={t('admin.linkLabel')} value={link.label || ''} onChange={(e) => updateSocialLink(index, 'label', e.target.value)} />
                  <input className="ce-input md:col-span-2" placeholder="URL" value={link.url || ''} onChange={(e) => updateSocialLink(index, 'url', e.target.value)} />
                  <button type="button" className="ce-btn ce-btn-ghost text-xs md:col-span-4" onClick={() => removeSocialLink(index)}>{t('content.delete')}</button>
                </div>
              ))}
            </div>
          </div>
          <button type="button" className="ce-btn ce-btn-primary" onClick={saveFooter}>{t('common.save')}</button>
        </div>
      )}

      {tab === 'backup' && (
        <div className="ce-card space-y-4 p-6">
          <h3 className="font-bold text-[var(--ce-primary)]">{t('admin.backupTitle')}</h3>
          <p className="text-sm text-[var(--ce-muted)]">{t('admin.backupHint')}</p>
          <label className="block">
            <span className="ce-label">{t('admin.backupFrequency')}</span>
            <select className="ce-input max-w-xs" value={backupForm.frequency} onChange={(e) => setBackupForm({ ...backupForm, frequency: e.target.value })}>
              <option value="daily">{t('admin.freq.daily')}</option>
              <option value="every_3_days">{t('admin.freq.every3')}</option>
              <option value="weekly">{t('admin.freq.weekly')}</option>
              <option value="monthly">{t('admin.freq.monthly')}</option>
              <option value="custom">{t('admin.freq.custom')}</option>
            </select>
          </label>
          {site?.backupSettings?.lastBackupAt && (
            <p className="text-sm">{t('admin.lastBackup')}: {new Date(site.backupSettings.lastBackupAt).toLocaleString()}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <button type="button" className="ce-btn ce-btn-primary" onClick={saveBackupSettings}>{t('common.save')}</button>
            <button type="button" className="ce-btn ce-btn-accent" onClick={runBackup} disabled={runningBackup}>
              {runningBackup ? t('common.loading') : t('admin.runBackup')}
            </button>
          </div>
          <div className="space-y-2 text-sm">
            {(site?.backupLogs || []).slice(0, 5).map((log, i) => (
              <div key={i} className="rounded-xl bg-[var(--ce-bg)] p-3">
                {log.ranAt ? new Date(log.ranAt).toLocaleString() : '—'} — {log.status} — {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
