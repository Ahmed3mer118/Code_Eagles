import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { tenantApi, uploadApi } from '../../shared/api/platformApi';

const PACKAGE_KEYS = [
  { key: 'lecturesOnly', packageType: 'lectures_only', pricingKey: 'lecturesOnly' },
  { key: 'examsOnly', packageType: 'exams_only', pricingKey: 'examsOnly' },
  { key: 'lecturesAndExams', packageType: 'lectures_and_exams', pricingKey: 'lecturesAndExams' },
];

const emptyLink = () => ({ label: '', url: '' });
const emptyCard = () => ({ title: '', description: '' });
const emptyReview = () => ({ name: '', comment: '', rating: 5, helpful: 0 });
const emptyFaq = () => ({ question: '', answer: '' });

function ListEditor({ items, onChange, renderItem, onAdd, addLabel }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-xl border border-[var(--ce-border)] p-4">
          {renderItem(item, index)}
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-[var(--ce-danger)]"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" className="ce-btn ce-btn-ghost text-sm" onClick={onAdd}>
        + {addLabel}
      </button>
    </div>
  );
}

export default function AcademySettingsEditor({ tenant, onSaved }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState('branding');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [branding, setBranding] = useState({
    name: tenant.name || '',
    description: tenant.description || '',
    logoUrl: tenant.logoUrl || '',
    coverUrl: tenant.coverUrl || '',
    contactWhatsapp: tenant.contactWhatsapp || '',
    contactFacebook: tenant.contactFacebook || '',
    theme: {
      primary: tenant.theme?.primary || '#0B1F33',
      accent: tenant.theme?.accent || '#E8A317',
      background: tenant.theme?.background || '#F5F7FA',
    },
  });

  const [packages, setPackages] = useState({
    lecturesOnly: tenant.studentPackages?.lecturesOnly || 0,
    examsOnly: tenant.studentPackages?.examsOnly || 0,
    lecturesAndExams: tenant.studentPackages?.lecturesAndExams || 0,
  });

  const [publicPage, setPublicPage] = useState(() => {
    const page = tenant.publicPage || {};
    const pricing = page.pricing || {};
    const withFeaturesText = (tier) => ({
      ...(tier || {}),
      featuresText: (tier?.features || []).join('\n'),
    });
    return {
      aboutTitle: page.aboutTitle || '',
      aboutSubtitle: page.aboutSubtitle || '',
      aboutCards: page.aboutCards?.length ? page.aboutCards : [emptyCard(), emptyCard()],
      instructorBio: page.instructorBio || '',
      instructorRole: page.instructorRole || '',
      reviews: page.reviews?.length ? page.reviews : [emptyReview()],
      faq: page.faq?.length ? page.faq : [emptyFaq()],
      footerText: page.footerText || '',
      footerLinks: page.footerLinks?.length ? page.footerLinks : [emptyLink()],
      pricing: {
        lecturesOnly: withFeaturesText(pricing.lecturesOnly),
        examsOnly: withFeaturesText(pricing.examsOnly),
        lecturesAndExams: withFeaturesText(pricing.lecturesAndExams || { featured: true }),
      },
      gallery: page.gallery?.length ? page.gallery : [],
      paymentInstructions: page.paymentInstructions || '',
      vodafoneNumber: page.vodafoneNumber || '',
      instapayId: page.instapayId || '',
      bankDetails: page.bankDetails || '',
    };
  });

  const tabs = useMemo(() => ([
    { id: 'branding', label: t('settings.tabs.branding') },
    { id: 'page', label: t('settings.tabs.page') },
    { id: 'pricing', label: t('settings.tabs.pricing') },
    { id: 'payment', label: t('settings.tabs.payment') },
  ]), [t]);

  const uploadField = async (file, field) => {
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadApi.uploadImage(file);
      setBranding((prev) => ({ ...prev, [field]: data.url }));
      toast.success(t('settings.uploadSuccess'));
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    } finally {
      setUploading(false);
    }
  };

  const saveBranding = async () => {
    setSaving(true);
    try {
      const data = await tenantApi.updateBranding(tenant._id || tenant.id, branding);
      onSaved?.(data.tenant);
      toast.success(t('common.success'));
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const savePackages = async () => {
    setSaving(true);
    try {
      const data = await tenantApi.updatePackages(tenant._id || tenant.id, { studentPackages: packages });
      onSaved?.(data.tenant);
      toast.success(t('common.success'));
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const savePublicPage = async () => {
    setSaving(true);
    try {
      const payload = {
        ...publicPage,
        aboutCards: publicPage.aboutCards.filter((c) => c.title || c.description),
        reviews: publicPage.reviews.filter((r) => r.name || r.comment),
        faq: publicPage.faq.filter((f) => f.question || f.answer),
        footerLinks: publicPage.footerLinks.filter((l) => l.label && l.url),
        pricing: {
          lecturesOnly: {
            ...publicPage.pricing.lecturesOnly,
            features: (publicPage.pricing.lecturesOnly.featuresText || '')
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean),
          },
          examsOnly: {
            ...publicPage.pricing.examsOnly,
            features: (publicPage.pricing.examsOnly.featuresText || '')
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean),
          },
          lecturesAndExams: {
            ...publicPage.pricing.lecturesAndExams,
            features: (publicPage.pricing.lecturesAndExams.featuresText || '')
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean),
          },
        },
      };
      delete payload.pricing.lecturesOnly.featuresText;
      delete payload.pricing.examsOnly.featuresText;
      delete payload.pricing.lecturesAndExams.featuresText;

      const data = await tenantApi.updatePublicPage(tenant._id || tenant.id, { publicPage: payload });
      onSaved?.(data.tenant);
      toast.success(t('common.success'));
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              tab === item.id ? 'bg-[var(--ce-primary)] text-white' : 'bg-[var(--ce-bg)] text-[var(--ce-muted)]'
            }`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'branding' && (
        <div className="ce-card space-y-4 p-6">
          <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{t('settings.tabs.branding')}</h3>
          <label className="block">
            <span className="ce-label">{t('settings.academyName')}</span>
            <input className="ce-input" value={branding.name} onChange={(e) => setBranding({ ...branding, name: e.target.value })} />
          </label>
          <label className="block">
            <span className="ce-label">{t('settings.description')}</span>
            <textarea className="ce-input min-h-[100px]" value={branding.description} onChange={(e) => setBranding({ ...branding, description: e.target.value })} />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="ce-label">{t('settings.logo')}</span>
              <input type="file" accept="image/*" className="ce-input" onChange={(e) => uploadField(e.target.files?.[0], 'logoUrl')} disabled={uploading} />
              {branding.logoUrl && <img src={branding.logoUrl} alt="" className="mt-2 h-16 w-16 rounded-xl object-cover" />}
            </label>
            <label className="block">
              <span className="ce-label">{t('settings.cover')}</span>
              <input type="file" accept="image/*" className="ce-input" onChange={(e) => uploadField(e.target.files?.[0], 'coverUrl')} disabled={uploading} />
              {branding.coverUrl && <img src={branding.coverUrl} alt="" className="mt-2 h-16 w-full rounded-xl object-cover" />}
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {['primary', 'accent', 'background'].map((key) => (
              <label key={key} className="block">
                <span className="ce-label">{t(`settings.theme.${key}`)}</span>
                <input
                  type="color"
                  className="h-11 w-full rounded-xl border border-[var(--ce-border)]"
                  value={branding.theme[key]}
                  onChange={(e) => setBranding({ ...branding, theme: { ...branding.theme, [key]: e.target.value } })}
                />
              </label>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="ce-label">WhatsApp</span>
              <input className="ce-input" value={branding.contactWhatsapp} onChange={(e) => setBranding({ ...branding, contactWhatsapp: e.target.value })} />
            </label>
            <label className="block">
              <span className="ce-label">Facebook</span>
              <input className="ce-input" value={branding.contactFacebook} onChange={(e) => setBranding({ ...branding, contactFacebook: e.target.value })} />
            </label>
          </div>
          <button type="button" className="ce-btn ce-btn-primary" disabled={saving} onClick={saveBranding}>
            {t('common.save')}
          </button>
        </div>
      )}

      {tab === 'page' && (
        <div className="ce-card space-y-5 p-6">
          <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{t('settings.tabs.page')}</h3>
          <label className="block">
            <span className="ce-label">{t('settings.aboutTitle')}</span>
            <input className="ce-input" value={publicPage.aboutTitle} onChange={(e) => setPublicPage({ ...publicPage, aboutTitle: e.target.value })} />
          </label>
          <label className="block">
            <span className="ce-label">{t('settings.aboutSubtitle')}</span>
            <textarea className="ce-input min-h-[80px]" value={publicPage.aboutSubtitle} onChange={(e) => setPublicPage({ ...publicPage, aboutSubtitle: e.target.value })} />
          </label>

          <div>
            <p className="ce-label">{t('settings.aboutCards')}</p>
            <ListEditor
              items={publicPage.aboutCards}
              onChange={(aboutCards) => setPublicPage({ ...publicPage, aboutCards })}
              addLabel={t('settings.addCard')}
              onAdd={() => setPublicPage({ ...publicPage, aboutCards: [...publicPage.aboutCards, emptyCard()] })}
              renderItem={(item, index) => (
                <div className="space-y-2">
                  <input className="ce-input" placeholder={t('settings.cardTitle')} value={item.title} onChange={(e) => {
                    const aboutCards = [...publicPage.aboutCards];
                    aboutCards[index] = { ...item, title: e.target.value };
                    setPublicPage({ ...publicPage, aboutCards });
                  }} />
                  <textarea className="ce-input min-h-[70px]" placeholder={t('settings.cardDesc')} value={item.description} onChange={(e) => {
                    const aboutCards = [...publicPage.aboutCards];
                    aboutCards[index] = { ...item, description: e.target.value };
                    setPublicPage({ ...publicPage, aboutCards });
                  }} />
                </div>
              )}
            />
          </div>

          <label className="block">
            <span className="ce-label">{t('settings.instructorRole')}</span>
            <input className="ce-input" value={publicPage.instructorRole} onChange={(e) => setPublicPage({ ...publicPage, instructorRole: e.target.value })} />
          </label>
          <label className="block">
            <span className="ce-label">{t('settings.instructorBio')}</span>
            <textarea className="ce-input min-h-[120px]" value={publicPage.instructorBio} onChange={(e) => setPublicPage({ ...publicPage, instructorBio: e.target.value })} />
          </label>

          <div>
            <p className="ce-label">{t('settings.reviews')}</p>
            <ListEditor
              items={publicPage.reviews}
              onChange={(reviews) => setPublicPage({ ...publicPage, reviews })}
              addLabel={t('settings.addReview')}
              onAdd={() => setPublicPage({ ...publicPage, reviews: [...publicPage.reviews, emptyReview()] })}
              renderItem={(item, index) => (
                <div className="space-y-2">
                  <input className="ce-input" placeholder={t('settings.reviewerName')} value={item.name} onChange={(e) => {
                    const reviews = [...publicPage.reviews];
                    reviews[index] = { ...item, name: e.target.value };
                    setPublicPage({ ...publicPage, reviews });
                  }} />
                  <textarea className="ce-input min-h-[70px]" placeholder={t('settings.reviewComment')} value={item.comment} onChange={(e) => {
                    const reviews = [...publicPage.reviews];
                    reviews[index] = { ...item, comment: e.target.value };
                    setPublicPage({ ...publicPage, reviews });
                  }} />
                </div>
              )}
            />
          </div>

          <div>
            <p className="ce-label">{t('settings.faq')}</p>
            <ListEditor
              items={publicPage.faq}
              onChange={(faq) => setPublicPage({ ...publicPage, faq })}
              addLabel={t('settings.addFaq')}
              onAdd={() => setPublicPage({ ...publicPage, faq: [...publicPage.faq, emptyFaq()] })}
              renderItem={(item, index) => (
                <div className="space-y-2">
                  <input className="ce-input" placeholder={t('settings.faqQuestion')} value={item.question} onChange={(e) => {
                    const faq = [...publicPage.faq];
                    faq[index] = { ...item, question: e.target.value };
                    setPublicPage({ ...publicPage, faq });
                  }} />
                  <textarea className="ce-input min-h-[70px]" placeholder={t('settings.faqAnswer')} value={item.answer} onChange={(e) => {
                    const faq = [...publicPage.faq];
                    faq[index] = { ...item, answer: e.target.value };
                    setPublicPage({ ...publicPage, faq });
                  }} />
                </div>
              )}
            />
          </div>

          <div>
            <p className="ce-label">{t('settings.gallery')}</p>
            <ListEditor
              items={publicPage.gallery || []}
              onChange={(gallery) => setPublicPage({ ...publicPage, gallery })}
              addLabel={t('settings.addGalleryImage')}
              onAdd={() => setPublicPage({ ...publicPage, gallery: [...(publicPage.gallery || []), { url: '', caption: '', order: (publicPage.gallery?.length || 0) }] })}
              renderItem={(item, index) => (
                <div className="space-y-2">
                  <input type="file" accept="image/*" className="ce-input" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const data = await uploadApi.uploadImage(file);
                      const gallery = [...(publicPage.gallery || [])];
                      gallery[index] = { ...item, url: data.url };
                      setPublicPage({ ...publicPage, gallery });
                    } catch (err) {
                      toast.error(err?.message || t('common.error'));
                    }
                  }} />
                  {item.url && <img src={item.url} alt="" className="h-24 rounded-xl object-cover" />}
                  <input className="ce-input" placeholder={t('settings.galleryCaption')} value={item.caption || ''} onChange={(e) => {
                    const gallery = [...(publicPage.gallery || [])];
                    gallery[index] = { ...item, caption: e.target.value };
                    setPublicPage({ ...publicPage, gallery });
                  }} />
                </div>
              )}
            />
          </div>

          <label className="block">
            <span className="ce-label">{t('settings.footerText')}</span>
            <textarea className="ce-input min-h-[70px]" value={publicPage.footerText} onChange={(e) => setPublicPage({ ...publicPage, footerText: e.target.value })} />
          </label>

          <div>
            <p className="ce-label">{t('settings.footerLinks')}</p>
            <ListEditor
              items={publicPage.footerLinks}
              onChange={(footerLinks) => setPublicPage({ ...publicPage, footerLinks })}
              addLabel={t('settings.addLink')}
              onAdd={() => setPublicPage({ ...publicPage, footerLinks: [...publicPage.footerLinks, emptyLink()] })}
              renderItem={(item, index) => (
                <div className="grid gap-2 md:grid-cols-2">
                  <input className="ce-input" placeholder={t('settings.linkLabel')} value={item.label} onChange={(e) => {
                    const footerLinks = [...publicPage.footerLinks];
                    footerLinks[index] = { ...item, label: e.target.value };
                    setPublicPage({ ...publicPage, footerLinks });
                  }} />
                  <input className="ce-input" placeholder={t('settings.linkUrl')} value={item.url} onChange={(e) => {
                    const footerLinks = [...publicPage.footerLinks];
                    footerLinks[index] = { ...item, url: e.target.value };
                    setPublicPage({ ...publicPage, footerLinks });
                  }} />
                </div>
              )}
            />
          </div>

          <button type="button" className="ce-btn ce-btn-primary" disabled={saving} onClick={savePublicPage}>
            {t('common.save')}
          </button>
        </div>
      )}

      {tab === 'pricing' && (
        <div className="ce-card space-y-5 p-6">
          <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{t('settings.tabs.pricing')}</h3>
          {PACKAGE_KEYS.map(({ key, pricingKey }) => (
            <div key={key} className="rounded-xl border border-[var(--ce-border)] p-4 space-y-3">
              <p className="font-bold text-[var(--ce-primary)]">{t(`payments.${key === 'lecturesOnly' ? 'lecturesOnly' : key === 'examsOnly' ? 'examsOnly' : 'fullPackage'}`)}</p>
              <label className="block">
                <span className="ce-label">{t('payments.amount')}</span>
                <input type="number" min="0" className="ce-input" value={packages[key]} onChange={(e) => setPackages({ ...packages, [key]: Number(e.target.value) })} />
              </label>
              <label className="block">
                <span className="ce-label">{t('settings.tierTitle')}</span>
                <input className="ce-input" value={publicPage.pricing[pricingKey].title || ''} onChange={(e) => setPublicPage({
                  ...publicPage,
                  pricing: { ...publicPage.pricing, [pricingKey]: { ...publicPage.pricing[pricingKey], title: e.target.value } },
                })} />
              </label>
              <label className="block">
                <span className="ce-label">{t('settings.tierFeatures')}</span>
                <textarea
                  className="ce-input min-h-[90px]"
                  value={publicPage.pricing[pricingKey].featuresText || ''}
                  onChange={(e) => setPublicPage({
                    ...publicPage,
                    pricing: { ...publicPage.pricing, [pricingKey]: { ...publicPage.pricing[pricingKey], featuresText: e.target.value } },
                  })}
                />
              </label>
            </div>
          ))}
          <button type="button" className="ce-btn ce-btn-primary" disabled={saving} onClick={async () => { await savePackages(); await savePublicPage(); }}>
            {t('common.save')}
          </button>
        </div>
      )}

      {tab === 'payment' && (
        <div className="ce-card space-y-4 p-6">
          <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{t('settings.tabs.payment')}</h3>
          <label className="block">
            <span className="ce-label">{t('settings.vodafoneNumber')}</span>
            <input className="ce-input" value={publicPage.vodafoneNumber} onChange={(e) => setPublicPage({ ...publicPage, vodafoneNumber: e.target.value })} />
          </label>
          <label className="block">
            <span className="ce-label">{t('settings.instapayId')}</span>
            <input className="ce-input" value={publicPage.instapayId} onChange={(e) => setPublicPage({ ...publicPage, instapayId: e.target.value })} />
          </label>
          <label className="block">
            <span className="ce-label">{t('settings.bankDetails')}</span>
            <textarea className="ce-input min-h-[80px]" value={publicPage.bankDetails} onChange={(e) => setPublicPage({ ...publicPage, bankDetails: e.target.value })} />
          </label>
          <label className="block">
            <span className="ce-label">{t('settings.paymentInstructions')}</span>
            <textarea className="ce-input min-h-[100px]" value={publicPage.paymentInstructions} onChange={(e) => setPublicPage({ ...publicPage, paymentInstructions: e.target.value })} />
          </label>
          <button type="button" className="ce-btn ce-btn-primary" disabled={saving} onClick={savePublicPage}>
            {t('common.save')}
          </button>
        </div>
      )}
    </div>
  );
}
