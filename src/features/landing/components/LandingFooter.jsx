// src/features/landing/components/LandingFooter.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../shared/i18n';
import { platformApi } from '../../../lib/platformApi';
import { onLiveUpdate } from '../../../shared/utils/liveUpdates';

const FacebookIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

const MailIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
    <rect x="2" y="4" width="20" height="16" rx="2" />
  </svg>
);

function siteText(site, key, lang) {
  const val = site?.[key];
  if (val == null) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val[lang] ?? val.ar ?? val.en ?? null;
  return null;
}

export default function LandingFooter() {
  const { lang } = useI18n();
  const [site, setSite] = useState({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await platformApi.getSiteContent();
        if (mounted) setSite(res || {});
      } catch (err) {
        console.error('Footer site load error:', err);
      }
    };
    load();
    const unsubscribe = onLiveUpdate(() => load());
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const txt = (key) => siteText(site, key, lang);

  const brandName = txt('landing.header.brandName') ?? '';
  const logoUrl = txt('landing.header.logoUrl') ?? '';
  const homePath = txt('landing.links.home') ?? '/';
  const contactPath = txt('landing.links.contact') ?? '/contact';
  const loginPath = txt('landing.links.login') ?? '/login';
  const registerPath = txt('landing.links.register') ?? '/register';

  return (
    <footer className="border-t border-white/10 bg-[var(--ce-brand)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-10">
          <div>
            <div className="flex items-center gap-3">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={brandName}
                  className="h-11 w-11 rounded-2xl bg-white/10 p-1 object-contain"
                />
              )}
              <div>
                <div className="text-xl font-extrabold">{brandName}</div>
                {txt('landing.brandTagline') && (
                  <p className="text-sm text-white/70">{txt('landing.brandTagline')}</p>
                )}
              </div>
            </div>

            {txt('landing.footer.about') && (
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
                {txt('landing.footer.about')}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <a
                href={txt('landing.footer.social.facebook') ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-[var(--ce-accent)] hover:text-[#1a1200]"
              >
                <FacebookIcon />
              </a>
              <a
                href={txt('landing.footer.social.instagram') ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-[var(--ce-accent)] hover:text-[#1a1200]"
              >
                <InstagramIcon />
              </a>
              <a
                href={txt('landing.footer.social.youtube') ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Youtube"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-[var(--ce-accent)] hover:text-[#1a1200]"
              >
                <YoutubeIcon />
              </a>
              {txt('landing.footer.social.email') && (
                <a
                  href={txt('landing.footer.social.email')}
                  aria-label="Email"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-[var(--ce-accent)] hover:text-[#1a1200]"
                >
                  <MailIcon />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-extrabold">{txt('landing.footer.platform')}</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li>
                <Link to={homePath} className="transition hover:text-[var(--ce-accent-soft)]">
                  {txt('landing.footer.home')}
                </Link>
              </li>
              <li>
                <a href="#academies" className="transition hover:text-[var(--ce-accent-soft)]">
                  {txt('landing.footer.academies')}
                </a>
              </li>
              <li>
                <a href="#teacher-cta" className="transition hover:text-[var(--ce-accent-soft)]">
                  {txt('landing.footer.forTeachers')}
                </a>
              </li>
              <li>
                <Link to={contactPath} className="transition hover:text-[var(--ce-accent-soft)]">
                  {txt('landing.footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-extrabold">{txt('landing.footer.learn')}</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li>
                <Link to={`${registerPath}?role=student`} className="transition hover:text-[var(--ce-accent-soft)]">
                  {txt('landing.footer.joinAsStudent')}
                </Link>
              </li>
              <li>
                <Link to={`${registerPath}?role=teacher`} className="transition hover:text-[var(--ce-accent-soft)]">
                  {txt('landing.footer.joinAsTeacher')}
                </Link>
              </li>
              <li>
                <a href="#features" className="transition hover:text-[var(--ce-accent-soft)]">
                  {txt('landing.footer.features')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-extrabold">{txt('landing.footer.legal')}</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li>
                <Link to={contactPath} className="transition hover:text-[var(--ce-accent-soft)]">
                  {txt('landing.footer.terms')}
                </Link>
              </li>
              <li>
                <Link to={contactPath} className="transition hover:text-[var(--ce-accent-soft)]">
                  {txt('landing.footer.privacy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-8 text-center text-sm text-white/60">
          {txt('landing.footer.copyright')}
        </div>
      </div>
    </footer>
  );
}
