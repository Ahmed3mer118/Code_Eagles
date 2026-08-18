import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Mail, Send, Youtube } from 'lucide-react';
import { readPlatformSiteCache, DEFAULT_PLATFORM_SITE } from '../../../shared/utils/platformSiteCache';

const ICON_MAP = { facebook: Facebook, instagram: Instagram, youtube: Youtube, mail: Mail, email: Mail };

export default function MarketingFooter() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ar';
  const year = new Date().getFullYear();
  const [footer, setFooter] = useState(() => readPlatformSiteCache()?.site?.footer || DEFAULT_PLATFORM_SITE.site.footer);

  useEffect(() => {
    setFooter(readPlatformSiteCache()?.site?.footer || DEFAULT_PLATFORM_SITE.site.footer);
  }, []);

  const aboutText = footer?.text?.[lang] || t('footer.about');
  const socialLinks = footer?.socialLinks?.length
    ? footer.socialLinks
    : [
        { platform: 'facebook', url: '/contact', label: 'Facebook' },
        { platform: 'instagram', url: '/contact', label: 'Instagram' },
        { platform: 'youtube', url: '/contact', label: 'Youtube' },
        { platform: 'mail', url: `mailto:${footer?.contactEmail || 'contact@code-eagles.com'}`, label: 'Email' },
      ];

  const linkGroups = [
    {
      title: t('footer.platform'),
      links: [
        { label: t('nav.home'), to: '/' },
        { label: t('nav.academies'), to: '/#academies' },
        { label: t('nav.pricing'), to: '/#teacher-cta' },
        { label: t('nav.contact'), to: '/contact' },
      ],
    },
    {
      title: t('footer.learn'),
      links: [
        { label: t('landing.ctaStudent'), to: '/auth/register?role=student' },
        { label: t('landing.categories.programming'), to: '/#categories' },
        { label: t('landing.categories.secondary'), to: '/#categories' },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.terms'), to: '/contact' },
        { label: t('footer.privacy'), to: '/contact' },
      ],
    },
  ];

  return (
    <footer className="mt-0 border-t border-white/10 bg-[var(--ce-primary)] text-white">
      <div className="ce-container py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ce-accent)] text-lg font-extrabold text-[#1a1200]">
                CE
              </div>
              <div>
                <div className="text-xl font-extrabold">{t('brand.name')}</div>
                <p className="text-sm text-white/70">{t('brand.tagline')}</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              {aboutText}
            </p>
            <div className="mt-5 flex gap-3">
              {socialLinks.map((item, i) => {
                const Icon = ICON_MAP[item.platform?.toLowerCase()] || Mail;
                return (
                  <a
                    key={i}
                    href={item.url || '/contact'}
                    target={item.url?.startsWith('http') ? '_blank' : undefined}
                    rel={item.url?.startsWith('http') ? 'noreferrer' : undefined}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-[var(--ce-accent)] hover:text-[#1a1200]"
                    aria-label={item.label || item.platform}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="font-extrabold">{group.title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/75">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="transition hover:text-[var(--ce-accent-soft)]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 border-t border-white/10 pt-8 md:grid-cols-[1fr_auto] md:items-center">
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder={t('footer.newsletterPlaceholder')}
              className="ce-input !rounded-full !bg-white/10 !border-white/20 !text-white placeholder:text-white/50"
            />
            <button type="submit" className="ce-btn ce-btn-accent shrink-0">
              <Send className="h-4 w-4" />
              {t('footer.subscribe')}
            </button>
          </form>
          <p className="text-sm text-white/60">{t('footer.copyright', { year })}</p>
        </div>
      </div>
    </footer>
  );
}
