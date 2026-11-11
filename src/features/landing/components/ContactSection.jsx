// src/features/landing/components/ContactSection.jsx
import { useEffect, useRef, useState } from 'react';
import { platformApi } from '../../../lib/platformApi';
import { useI18n } from '../../../shared/i18n';
import contactService from '../../../shared/api/contactService';

const MailIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 6 10 7 10-7" />
  </svg>
);
const UserIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);
const PhoneIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const AlertIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);
const SendIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
    <path d="m21.854 2.147-10.94 10.939" />
  </svg>
);

function siteText(site, key, lang) {
  const val = site?.[key];
  if (val == null) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val[lang] ?? val.ar ?? val.en ?? null;
  return null;
}

export default function ContactSection() {
  const { lang } = useI18n();
  const [site, setSite] = useState({});
  const [loadingSite, setLoadingSite] = useState(true);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  // ✅ نستخدم ref بدل state مباشر للـ status عشان نتجنب مشاكل insertBefore
  const [statusType, setStatusType] = useState(null); // 'success' | 'error' | null
  const [statusText, setStatusText] = useState('');
  const statusIdRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await platformApi.getSiteContent();
        if (mounted) setSite(res || {});
      } catch (err) {
        console.error('Contact section load error:', err);
      } finally {
        if (mounted) setLoadingSite(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const txt = (key) => siteText(site, key, lang);

  const contactEmail = txt('landing.contact.email');
  const contactPhone = txt('landing.contact.phone');
  const contactHours = txt('landing.contact.hours');
  const socialFacebook = txt('landing.contact.social.facebook');
  const socialInstagram = txt('landing.contact.social.instagram');
  const socialYoutube = txt('landing.contact.social.youtube');

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const showStatus = (type, text) => {
    statusIdRef.current += 1;
    setStatusType(type);
    setStatusText(text);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const msgRequired = txt('landing.contact.form.messageRequired');
    const msgShort = txt('landing.contact.form.messageTooShort');

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      showStatus('error', msgRequired ?? '');
      return;
    }
    if (form.message.trim().length < 10) {
      showStatus('error', msgShort ?? '');
      return;
    }

    setLoading(true);
    try {
      await contactService.send({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject.trim() || undefined,
        message: form.message.trim(),
      });

      // ✅ نستخدم setTimeout لتأجيل التحديث للـ tick التالي
      // عشان نتجنب insertBefore error
      setTimeout(() => {
        showStatus('success', txt('landing.contact.form.successMessage') ?? '');
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
        setLoading(false);
      }, 50);
    } catch (err) {
      setTimeout(() => {
        showStatus(
          'error',
          err?.response?.data?.message ??
            txt('landing.contact.form.errorMessage') ??
            '',
        );
        setLoading(false);
      }, 50);
    }
  };

  const hasContent =
    txt('landing.contact.title') ||
    contactEmail ||
    contactPhone ||
    txt('landing.contact.form.submit');

  if (loadingSite) {
    return (
      <section className="bg-[var(--ce-bg)] py-20">
        <div className="mx-auto max-w-5xl px-4 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--ce-accent)] border-t-transparent" />
        </div>
      </section>
    );
  }

  if (!hasContent) return null;

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[var(--ce-bg)] py-20 sm:py-24"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-[var(--ce-accent)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        {(txt('landing.contact.title') || txt('landing.contact.subtitle')) && (
          <div className="mx-auto mb-12 max-w-2xl text-center">
            {txt('landing.contact.badge') && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--ce-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--ce-accent)]">
                <MailIcon />
                {txt('landing.contact.badge')}
              </div>
            )}
            {txt('landing.contact.title') && (
              <h2 className="text-3xl font-extrabold tracking-tight text-[var(--ce-primary)] sm:text-4xl">
                {txt('landing.contact.title')}
              </h2>
            )}
            {txt('landing.contact.subtitle') && (
              <p className="mt-3 text-sm text-[var(--ce-muted)] sm:text-base">
                {txt('landing.contact.subtitle')}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-8 rounded-3xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-6 shadow-xl shadow-black/5 sm:grid-cols-5 sm:p-10">
          <div className="sm:col-span-2 space-y-5">
            {txt('landing.contact.info.title') && (
              <div>
                <h3 className="text-lg font-bold text-[var(--ce-primary)]">
                  {txt('landing.contact.info.title')}
                </h3>
                {txt('landing.contact.info.description') && (
                  <p className="mt-1 text-sm leading-relaxed text-[var(--ce-muted)]">
                    {txt('landing.contact.info.description')}
                  </p>
                )}
              </div>
            )}

            {(contactEmail || contactPhone) && (
              <div className="space-y-3 rounded-2xl bg-[var(--ce-bg)] p-4 text-sm">
                {contactEmail && (
                  <div className="flex items-center gap-3 text-[var(--ce-text)]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ce-accent)]/15 text-[var(--ce-accent)]">
                      <MailIcon />
                    </div>
                    <div className="min-w-0">
                      {txt('landing.contact.emailLabel') && (
                        <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--ce-muted)]">
                          {txt('landing.contact.emailLabel')}
                        </div>
                      )}
                      <a
                        href={`mailto:${contactEmail}`}
                        className="font-semibold break-all hover:text-[var(--ce-accent)]"
                        dir="ltr"
                      >
                        {contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {contactPhone && (
                  <div className="flex items-center gap-3 text-[var(--ce-text)]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                      <PhoneIcon />
                    </div>
                    <div className="min-w-0">
                      {txt('landing.contact.phoneLabel') && (
                        <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--ce-muted)]">
                          {txt('landing.contact.phoneLabel')}
                        </div>
                      )}
                      <a
                        href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                        className="font-semibold hover:text-[var(--ce-accent)]"
                        dir="ltr"
                      >
                        {contactPhone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {contactHours && (
              <p className="text-xs leading-relaxed text-[var(--ce-muted)]">
                {contactHours}
              </p>
            )}

            {(socialFacebook || socialInstagram || socialYoutube) && (
              <div className="flex gap-2 pt-2">
                {socialFacebook && (
                  <a
                    href={socialFacebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ce-bg)] text-[var(--ce-muted)] transition hover:bg-[var(--ce-accent)] hover:text-white"
                    aria-label="Facebook"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                )}
                {socialInstagram && (
                  <a
                    href={socialInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ce-bg)] text-[var(--ce-muted)] transition hover:bg-[var(--ce-accent)] hover:text-white"
                    aria-label="Instagram"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </a>
                )}
                {socialYoutube && (
                  <a
                    href={socialYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ce-bg)] text-[var(--ce-muted)] transition hover:bg-[var(--ce-accent)] hover:text-white"
                    aria-label="Youtube"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                      <path d="m10 15 5-3-5-3z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="sm:col-span-3 space-y-4">
            {/* ✅ status message — key فريد يمنع insertBefore */}
            {statusType && statusText && (
              <div
                key={`status-${statusIdRef.current}`}
                className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                  statusType === 'success'
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20'
                    : 'bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20'
                }`}
              >
                <span className="shrink-0 mt-0.5">
                  {statusType === 'success' ? <CheckIcon /> : <AlertIcon />}
                </span>
                <span>{statusText}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {txt('landing.contact.form.nameLabel') && (
                <Field label={txt('landing.contact.form.nameLabel')} icon={<UserIcon />}>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={update('name')}
                    placeholder={txt('landing.contact.form.namePlaceholder') ?? ''}
                    className="w-full rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] px-3 py-2.5 text-sm text-[var(--ce-text)] outline-none transition focus:border-[var(--ce-accent)] focus:ring-4 focus:ring-[var(--ce-accent)]/10"
                  />
                </Field>
              )}

              {txt('landing.contact.form.emailLabel') && (
                <Field label={txt('landing.contact.form.emailLabel')} icon={<MailIcon />}>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={update('email')}
                    placeholder={txt('landing.contact.form.emailPlaceholder') ?? ''}
                    dir="ltr"
                    className="w-full rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] px-3 py-2.5 text-sm text-[var(--ce-text)] outline-none transition focus:border-[var(--ce-accent)] focus:ring-4 focus:ring-[var(--ce-accent)]/10"
                  />
                </Field>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {txt('landing.contact.form.phoneLabel') && (
                <Field label={txt('landing.contact.form.phoneLabel')} icon={<PhoneIcon />}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={update('phone')}
                    placeholder={txt('landing.contact.form.phonePlaceholder') ?? ''}
                    dir="ltr"
                    className="w-full rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] px-3 py-2.5 text-sm text-[var(--ce-text)] outline-none transition focus:border-[var(--ce-accent)] focus:ring-4 focus:ring-[var(--ce-accent)]/10"
                  />
                </Field>
              )}

              {txt('landing.contact.form.subjectLabel') && (
                <Field label={txt('landing.contact.form.subjectLabel')}>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={update('subject')}
                    placeholder={txt('landing.contact.form.subjectPlaceholder') ?? ''}
                    className="w-full rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] px-3 py-2.5 text-sm text-[var(--ce-text)] outline-none transition focus:border-[var(--ce-accent)] focus:ring-4 focus:ring-[var(--ce-accent)]/10"
                  />
                </Field>
              )}
            </div>

            {txt('landing.contact.form.messageLabel') && (
              <Field label={txt('landing.contact.form.messageLabel')}>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={update('message')}
                  placeholder={txt('landing.contact.form.messagePlaceholder') ?? ''}
                  className="w-full resize-y rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] px-3 py-2.5 text-sm text-[var(--ce-text)] outline-none transition focus:border-[var(--ce-accent)] focus:ring-4 focus:ring-[var(--ce-accent)]/10"
                />
              </Field>
            )}

            {txt('landing.contact.form.submit') && (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--ce-accent)] to-[var(--ce-accent-soft)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--ce-accent)]/25 transition hover:shadow-xl hover:shadow-[var(--ce-accent)]/35 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {txt('landing.contact.form.sending') ?? ''}
                  </>
                ) : (
                  <>
                    <SendIcon />
                    {txt('landing.contact.form.submit')}
                  </>
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, icon, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[var(--ce-text)]">
        {icon && <span className="text-[var(--ce-accent)]">{icon}</span>}
        {label}
      </span>
      {children}
    </label>
  );
}
