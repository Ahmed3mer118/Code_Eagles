import { Link, useParams } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import LanguageSwitcher from '../ui/LanguageSwitcher';
import resolveMediaUrl from '../utils/mediaUrl';

import ThemeToggle from '../../features/marketing/components/ThemeToggle';



const sectionLinks = [

  { key: 'about', href: '#about' },

  { key: 'courses', href: '#courses' },

  { key: 'groups', href: '#groups' },

  { key: 'pricing', href: '#pricing' },

];



export default function AcademyLayout({ tenant, children }) {

  const { t } = useTranslation();

  const { slug } = useParams();

  const page = tenant?.publicPage || {};

  const footerLinks = (page.footerLinks || []).filter((link) => link.label && link.url);



  const theme = tenant?.theme || {};

  const style = {

    '--ce-primary': theme.primary || '#0B1F33',

    '--ce-accent': theme.accent || '#E8A317',

    '--ce-bg': theme.background || '#F5F7FA',

    '--ce-surface': theme.surface || '#FFFFFF',

    '--ce-text': theme.text || '#0F172A',

  };



  const renderFooterLink = (link) => {

    const isExternal = /^https?:\/\//i.test(link.url);

    if (isExternal) {

      return (

        <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noreferrer" className="hover:text-[var(--ce-accent-soft)]">

          {link.label}

        </a>

      );

    }

    return (

      <a key={`${link.label}-${link.url}`} href={link.url} className="hover:text-[var(--ce-accent-soft)]">

        {link.label}

      </a>

    );

  };



  return (

    <div className="min-h-screen pb-mobile-nav" style={style}>

      <header className="sticky top-0 z-50 border-b border-[var(--ce-border)] bg-[var(--ce-surface)]/90 backdrop-blur-xl">

        <div className="ce-container flex items-center justify-between gap-4 py-3">

          <Link to={`/academy/${slug}`} className="flex min-w-0 items-center gap-3">

            {tenant?.logoUrl ? (

              <img src={resolveMediaUrl(tenant.logoUrl)} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />

            ) : (

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--ce-primary)] text-sm font-extrabold text-white">

                {tenant?.name?.charAt(0)}

              </div>

            )}

            <div className="min-w-0">

              <div className="truncate text-lg font-extrabold text-[var(--ce-primary)]">{tenant?.name}</div>

              <div className="text-xs text-[var(--ce-muted)]">{t('academy.poweredBy')}</div>

            </div>

          </Link>



          <nav className="hidden items-center gap-4 text-sm font-semibold lg:flex">

            {sectionLinks.map((link) => (

              <a key={link.key} href={link.href} className="text-[var(--ce-text)] hover:text-[var(--ce-accent)]">

                {t(`academy.nav.${link.key}`)}

              </a>

            ))}

          </nav>



          <div className="flex items-center gap-2">

            <ThemeToggle />

            <LanguageSwitcher />

            <Link to={`/auth/login?academy=${slug}`} className="ce-btn ce-btn-ghost hidden text-sm sm:inline-flex">

              {t('nav.login')}

            </Link>

            <Link to={`/auth/register?role=student&academy=${slug}`} className="ce-btn ce-btn-accent text-sm">

              {t('academy.joinNow')}

            </Link>

          </div>

        </div>

      </header>



      {children}



      <footer className="border-t border-[var(--ce-border)] bg-[var(--ce-primary)] text-white">

        <div className="ce-container flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="text-xl font-extrabold">{tenant?.name}</div>

            <p className="text-sm text-white/70">{page.footerText || t('academy.footerHint')}</p>

          </div>

          <div className="flex flex-wrap gap-4 text-sm text-white/75">

            {footerLinks.length > 0 ? (

              footerLinks.map(renderFooterLink)

            ) : (

              <>

                <a href="#about">{t('academy.nav.about')}</a>

                <a href="#courses">{t('academy.nav.courses')}</a>

                <a href="#pricing">{t('academy.nav.pricing')}</a>

              </>

            )}

            <Link to="/" className="hover:text-[var(--ce-accent-soft)]">{t('brand.name')}</Link>

          </div>

        </div>

      </footer>

    </div>

  );

}


