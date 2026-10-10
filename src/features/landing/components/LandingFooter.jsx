import { Link } from 'react-router-dom';
import { useI18n } from '../../../shared/i18n';

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

const SendIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
    <path d="m21.854 2.147-10.94 10.939" />
  </svg>
);

export default function LandingFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-white/10 bg-[var(--ce-brand)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/images/LOGO.png"
                alt="Code Eagles"
                className="h-11 w-11 rounded-2xl bg-white/10 p-1 object-contain"
              />
              <div>
                <div className="text-xl font-extrabold">Code Eagles</div>
                <p className="text-sm text-white/70">{t('landing.brandTagline')}</p>
              </div>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              {t('landing.footer.about')}
            </p>

            <div className="mt-5 flex gap-3">
              <Link to="/contact" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-[var(--ce-accent)] hover:text-[#1a1200]">
                <FacebookIcon />
              </Link>
              <Link to="/contact" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-[var(--ce-accent)] hover:text-[#1a1200]">
                <InstagramIcon />
              </Link>
              <Link to="/contact" aria-label="Youtube" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-[var(--ce-accent)] hover:text-[#1a1200]">
                <YoutubeIcon />
              </Link>
              <a href="mailto:contact@code-eagles.com" aria-label="Email" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-[var(--ce-accent)] hover:text-[#1a1200]">
                <MailIcon />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-extrabold">{t('landing.footer.platform')}</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li>
                <Link to="/" className="transition hover:text-[var(--ce-accent-soft)]">
                  {t('landing.footer.home')}
                </Link>
              </li>
              <li>
                <a href="#academies" className="transition hover:text-[var(--ce-accent-soft)]">
                  {t('landing.footer.academies')}
                </a>
              </li>
              <li>
                <a href="#teacher-cta" className="transition hover:text-[var(--ce-accent-soft)]">
                  {t('landing.footer.pricing')}
                </a>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-[var(--ce-accent-soft)]">
                  {t('landing.footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h3 className="font-extrabold">{t('landing.footer.learn')}</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li>
                <Link to="/auth/register?role=student" className="transition hover:text-[var(--ce-accent-soft)]">
                  {t('landing.footer.joinAsStudent')}
                </Link>
              </li>
              <li>
                <a href="#categories" className="transition hover:text-[var(--ce-accent-soft)]">
                  {t('landing.footer.programming')}
                </a>
              </li>
              <li>
                <a href="#categories" className="transition hover:text-[var(--ce-accent-soft)]">
                  {t('landing.footer.secondary')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-extrabold">{t('landing.footer.legal')}</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li>
                <Link to="/contact" className="transition hover:text-[var(--ce-accent-soft)]">
                  {t('landing.footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-[var(--ce-accent-soft)]">
                  {t('landing.footer.privacy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-10 grid gap-4 border-t border-white/10 pt-8 md:grid-cols-[1fr_auto] md:items-center">
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              placeholder={t('landing.footer.newsletterPlaceholder')}
              className="flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-white placeholder-white/50 outline-none focus:border-[var(--ce-accent)]"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--ce-accent)] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
            >
              <SendIcon />
              {t('landing.footer.subscribe')}
            </button>
          </form>
          <p className="text-sm text-white/60">{t('landing.footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}