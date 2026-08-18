import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import toast, { Toaster } from 'react-hot-toast';
import { contactApi } from '../../shared/api/contactApi';

export default function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactApi.send(form);
      toast.success(t('common.success'));
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('nav.contact')} — {t('brand.name')}</title>
        <meta name="description" content={t('brand.tagline')} />
        <link rel="canonical" href="https://www.code-eagles.com/contact" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.code-eagles.com/contact" />
        <meta property="og:title" content={`${t('nav.contact')} — ${t('brand.name')}`} />
        <meta property="og:description" content={t('brand.tagline')} />
        <meta property="og:image" content="https://www.code-eagles.com/images/LOGO.png" />
      </Helmet>
    <div className="ce-container py-12">
      <Toaster position="top-center" />
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-[var(--ce-primary)]">{t('nav.contact')}</h1>
          <p className="mt-2 text-[var(--ce-muted)]">{t('brand.tagline')}</p>
        </div>
        <form onSubmit={onSubmit} className="ce-card p-6 md:p-8">
          <label className="ce-label">{t('auth.name')}</label>
          <input className="ce-input mb-4" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

          <label className="ce-label">{t('auth.email')}</label>
          <input type="email" className="ce-input mb-4" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />

          <label className="ce-label">{t('nav.contact')}</label>
          <textarea className="ce-input mb-5 min-h-[140px]" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />

          <button type="submit" className="ce-btn ce-btn-primary w-full" disabled={loading}>
            {loading ? t('common.loading') : t('common.save')}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
