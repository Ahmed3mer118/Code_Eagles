import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Code2,
  GraduationCap,
  Layers,
  LineChart,
  MonitorSmartphone,
  Shield,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';
import { statsApi, tenantApi, platformSiteApi } from '../../shared/api/platformApi';
import { loadPlatformSite, isSectionVisible, sectionText } from '../../shared/utils/platformSiteCache';
import SectionHeader from './components/SectionHeader';
import HeroSearchBar from './components/HeroSearchBar';
import AcademyCard from './components/AcademyCard';
import CourseCard from './components/CourseCard';
import CategoryCard from './components/CategoryCard';
import TestimonialCarousel from './components/TestimonialCarousel';
import AnimatedCounter from './components/AnimatedCounter';
import FaqAccordion from './components/FaqAccordion';
import PlatformLogo from '../../shared/ui/PlatformLogo';

const CATEGORY_DEFS = [
  { key: 'programming', icon: Code2, desc: 'Full-stack and software engineering paths' },
  { key: 'frontend', icon: MonitorSmartphone, desc: 'Modern UI, React, and responsive design' },
  { key: 'backend', icon: Layers, desc: 'APIs, databases, and scalable systems' },
  { key: 'ai', icon: Brain, desc: 'Machine learning and intelligent tools' },
  { key: 'dataScience', icon: LineChart, desc: 'Analytics, Python, and data pipelines' },
  { key: 'cyberSecurity', icon: Shield, desc: 'Security fundamentals and ethical hacking' },
  { key: 'firstSecondary', icon: BookOpen, desc: 'First secondary school curriculum' },
  { key: 'secondSecondary', icon: GraduationCap, desc: 'Second secondary exam preparation' },
  { key: 'thirdSecondary', icon: Award, desc: 'Third secondary and university admission' },
];

const WHY_FEATURES = [
  { key: 'expertTeachers', icon: Users },
  { key: 'liveClasses', icon: Video },
  { key: 'recordedLectures', icon: BookOpen },
  { key: 'quizzes', icon: BarChart3 },
  { key: 'certificates', icon: Award },
  { key: 'parentDashboard', icon: Users },
  { key: 'mobileFriendly', icon: MonitorSmartphone },
  { key: 'aiTools', icon: Sparkles },
];

function HeroIllustration() {
  const { t } = useTranslation();
  const cards = [
    { icon: BookOpen, labelKey: 'landing.hero.cardCourses', progress: 92 },
    { icon: BarChart3, labelKey: 'landing.hero.cardExams', progress: 78 },
    { icon: Video, labelKey: 'landing.hero.cardLive', progress: 65 },
    { icon: Award, labelKey: 'landing.hero.cardCerts', progress: 100 },
  ];

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[var(--ce-accent)]/20 to-[var(--ce-primary)]/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[var(--ce-brand)] to-[var(--ce-brand-soft)] p-6 shadow-2xl">
        <div className="flex flex-col gap-3">
          {cards.map(({ icon: Icon, labelKey, progress }) => (
            <div key={labelKey} className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Icon className="h-5 w-5 text-[var(--ce-accent-soft)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white">{t(labelKey)}</p>
                {/* <div className="mt-2 h-2 rounded-full bg-white/20">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[var(--ce-accent)] to-[var(--ce-accent-soft)]"
                    // style={{ width: `${progress}%` }}
                  />
                </div> */}
              </div>
              {/* <span className="text-sm font-extrabold text-[var(--ce-accent-soft)]">{progress}%</span> */}
            </div>
          ))}
        </div>
     
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ar';
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('programming');
  const [academies, setAcademies] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [platformSite, setPlatformSite] = useState(null);
  const [platformContent, setPlatformContent] = useState(null);
  const [loading, setLoading] = useState(true);

  const sections = platformSite?.sections || [];
  const show = (key) => isSectionVisible(sections, key);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [academyRes, courseRes, statsRes, siteRes] = await Promise.all([
          tenantApi.listPublic({ limit: 8 }).catch(() => ({ academies: [] })),
          tenantApi.listFeaturedCourses({ limit: 6 }).catch(() => ({ courses: [] })),
          statsApi.public().catch(() => ({ stats: null })),
          loadPlatformSite(() => platformSiteApi.getPublic()),
        ]);
        if (!cancelled) {
          setAcademies(academyRes.academies || []);
          setCourses(courseRes.courses || []);
          setStats(statsRes.stats || null);
          setPlatformSite(siteRes?.site || null);
          setPlatformContent(siteRes || null);
        }
      } catch {
        if (!cancelled) {
          setAcademies([]);
          setCourses([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const scrollTargets = {
      '/courses': 'courses',
      '/academies': 'academies',
    };
    const sectionId = scrollTargets[location.pathname];
    if (!sectionId) return;
    const target = document.getElementById(sectionId) || document.getElementById('academies');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.pathname, loading]);

  const heroMetrics = useMemo(
    () => [
      { value: stats?.students || 0, suffix: '+', label: t('landing.metrics.students') },
      { value: stats?.courses || 0, suffix: '+', label: t('landing.metrics.courses') },
      { value: stats?.teachers || 0, suffix: '+', label: t('landing.metrics.teachers') },
    ],
    [stats, t]
  );

  const testimonials = useMemo(() => {
    if (platformContent?.testimonials?.length) {
      return platformContent.testimonials.map((item) => ({
        name: item.authorName,
        academy: item.academyName,
        review: item.review?.en || item.review?.ar || '',
        rating: item.rating || 5,
        outcome: '',
      }));
    }
    return [1, 2, 3].map((i) => ({
      name: t(`landing.testimonials.${i}.name`),
      academy: t(`landing.testimonials.${i}.academy`),
      review: t(`landing.testimonials.${i}.review`),
      rating: Number(t(`landing.testimonials.${i}.rating`)),
      outcome: t(`landing.testimonials.${i}.outcome`),
    }));
  }, [platformContent, t]);

  const faqItems = useMemo(() => {
    if (platformContent?.faq?.length) {
      return platformContent.faq.map((item) => ({
        question: item.question?.en || item.question?.ar || '',
        answer: item.answer?.en || item.answer?.ar || '',
      }));
    }
    return [1, 2, 3, 4, 5].map((i) => ({
      question: t(`landing.faq.${i}.q`),
      answer: t(`landing.faq.${i}.a`),
    }));
  }, [platformContent, t]);

  const filteredAcademies = useMemo(() => {
    if (!search.trim()) return academies;
    const q = search.toLowerCase();
    return academies.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.ownerName?.toLowerCase().includes(q) ||
        a.slug?.toLowerCase().includes(q)
    );
  }, [academies, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    document.getElementById('academies')?.scrollIntoView({ behavior: 'smooth' });
  };

  const pageUrl = location.pathname === '/'
    ? 'https://www.code-eagles.com/'
    : `https://www.code-eagles.com${location.pathname}`;

  return (
    <>
      <Helmet>
        <title>{t('brand.name')} — {t('brand.tagline')}</title>
        <meta name="description" content={t('landing.subheadline')} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={`${t('brand.name')} — ${t('brand.tagline')}`} />
        <meta property="og:description" content={t('landing.subheadline')} />
        <meta property="og:image" content="https://www.code-eagles.com/images/LOGO.png" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: t('brand.name'),
            description: t('landing.subheadline'),
          })}
        </script>
      </Helmet>

      {show('hero') && (
      <section className="ce-hero-shell relative overflow-hidden pb-12 pt-6 sm:pt-10">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute start-[-10%] top-[-5%] h-80 w-80 rounded-full bg-[var(--ce-accent)] blur-[130px]" />
          <div className="absolute bottom-[-10%] end-[-5%] h-72 w-72 rounded-full bg-sky-500 blur-[120px]" />
        </div>

        <div className="ce-container relative z-10 py-6 text-white sm:py-10">
          <div className="ce-hero-grid items-center">
            <div>
              <div className="ce-fade-up flex items-center gap-3">
                <PlatformLogo className="h-14 w-14" imgClassName="rounded-2xl object-contain bg-white/10 p-1.5 shadow-lg" />
                <span className="ce-eyebrow !border !border-white/15 !bg-white/10 !text-[var(--ce-accent-soft)]">
                  {t('brand.name')}
                </span>
              </div>
              <h1 className="ce-fade-up mt-5 max-w-3xl text-4xl font-extrabold leading-[1.15] sm:text-5xl lg:text-[3.4rem]">
                {sectionText(sections, 'hero', 'title', lang, t('landing.headline'))}
              </h1>
              <p className="ce-fade-up-delay mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                {sectionText(sections, 'hero', 'subtitle', lang, t('landing.subheadline'))}
              </p>

              <div className="ce-fade-up-delay mt-8 flex flex-wrap gap-3">
                <Link to="/auth/register?role=student" className="ce-btn ce-btn-accent shadow-lg shadow-[var(--ce-accent)]/25">
                  {t('landing.ctaStartLearning')}
                </Link>
                <a href="#academies" className="ce-btn border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/15">
                  {t('landing.ctaExploreAcademies')}
                </a>
              </div>

              <div className="ce-fade-up-delay mt-8 max-w-xl">
                <HeroSearchBar value={search} onChange={setSearch} onSubmit={handleSearch} />
              </div>

              <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                    <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                      {metric.value.toLocaleString()}{metric.suffix}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/70">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="ce-fade-up-delay hidden lg:block">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>
      )}

      {show('statistics') && (
      <section className="ce-section ce-section-alt">
        <div className="ce-container">
          <SectionHeader
            eyebrow={t('landing.trustedEyebrow')}
            title={t('landing.trustedTitle')}
            subtitle={t('landing.trustedSubtitle')}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: t('landing.trustedStats.academies'), value: stats?.academies || 0 },
              { label: t('landing.trustedStats.students'), value: stats?.students || 0 },
              { label: t('landing.trustedStats.courses'), value: stats?.courses || 0 },
              { label: t('landing.trustedStats.exams'), value: stats?.examsCompleted || 0 },
            ].map((item) => (
              <div key={item.label} className="ce-stat-card text-center">
                <p className="text-2xl font-extrabold text-[var(--ce-primary)]">
                  {item.value.toLocaleString()}+
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--ce-muted)]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      <section id="academies" className="ce-section">
        <div className="ce-container">
          <SectionHeader
            eyebrow={t('landing.academiesEyebrow')}
            title={t('landing.academiesTitle')}
            subtitle={t('landing.academiesSubtitle')}
          />
          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="ce-card ce-skeleton h-80" />
              ))}
            </div>
          ) : filteredAcademies.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {filteredAcademies.map((academy) => (
                <AcademyCard key={academy._id} academy={academy} />
              ))}
            </div>
          ) : (
            <div className="ce-card p-8 text-center">
              <p className="font-bold text-[var(--ce-primary)]">{t('landing.noAcademies')}</p>
              <Link to="/auth/register?role=teacher" className="ce-btn ce-btn-accent mt-4">
                {t('landing.ctaTeacher')}
              </Link>
            </div>
          )}
        </div>
      </section>

      <section id="categories" className="ce-section ce-section-alt">
        <div className="ce-container">
          <SectionHeader
            eyebrow={t('landing.categoriesEyebrow')}
            title={t('landing.categoriesTitle')}
            subtitle={t('landing.categoriesSubtitle')}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORY_DEFS.map((category) => (
              <CategoryCard
                key={category.key}
                category={category}
                icon={category.icon}
                active={activeCategory === category.key}
                onClick={() => {
                  setActiveCategory(category.key);
                  navigate(`/#academies`);
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* {show('featured') && (
      <section className="ce-section">
        <div className="ce-container">
          <SectionHeader
            eyebrow={t('landing.coursesEyebrow')}
            title={t('landing.coursesTitle')}
            subtitle={t('landing.coursesSubtitle')}
          />
          {courses.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="ce-card p-8 text-center text-[var(--ce-muted)]">
              {t('landing.noCourses')}
            </div>
          )}
        </div>
      </section>
      )} */}

      {show('features') && (
      <section id="features" className="ce-section ce-section-alt">
        <div className="ce-container">
          <SectionHeader
            eyebrow={t('landing.featuresTitle')}
            title={t('landing.whyTitle')}
            subtitle={t('landing.whySubtitle')}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_FEATURES.map(({ key, icon: Icon }) => (
              <article key={key} className="ce-card ce-card-hover p-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ce-accent)]/15 text-[var(--ce-accent)]">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-extrabold text-[var(--ce-primary)]">
                  {t(`landing.why.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ce-muted)]">
                  {t(`landing.why.${key}.desc`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      )}

      {show('testimonials') && (
      <section className="ce-section">
        <div className="ce-container">
          <SectionHeader
            eyebrow={t('landing.testimonialsEyebrow')}
            title={t('landing.testimonialsTitle')}
            subtitle={t('landing.testimonialsSubtitle')}
          />
          <TestimonialCarousel items={testimonials} />
        </div>
      </section>
      )}

      {show('statistics') && (
      <section className="ce-section ce-section-alt">
        <div className="ce-container">
          <SectionHeader title={t('landing.statsTitle')} subtitle={t('landing.statsSubtitle')} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <AnimatedCounter end={stats?.students || 0} suffix="+" label={t('landing.metrics.students')} />
            <AnimatedCounter end={stats?.academies || 0} suffix="+" label={t('landing.metrics.academies')} />
            <AnimatedCounter end={stats?.teachers || 0} suffix="+" label={t('landing.metrics.teachers')} />
            <AnimatedCounter end={stats?.hoursWatched || 0} suffix="+" label={t('landing.metrics.hoursWatched')} />
            <AnimatedCounter end={stats?.examsCompleted || 0} suffix="+" label={t('landing.metrics.examsCompleted')} />
          </div>
        </div>
      </section>
      )}

      {show('cta') && (
      <section id="teacher-cta" className="ce-section">
        <div className="ce-container">
          <div className="ce-brand-panel ce-gradient-border overflow-hidden rounded-[2rem] p-8 sm:p-12">
            <div className="max-w-2xl">
              <span className="ce-eyebrow !border-white/20 !bg-white/10 !text-[var(--ce-accent-soft)]">
                {t('landing.teacherEyebrow')}
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
                {t('landing.teacherHeadline')}
              </h2>
              <p className="mt-4 text-white/80">{t('landing.teacherDesc')}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/auth/register?role=teacher" className="ce-btn ce-btn-accent">
                  {t('landing.createAcademy')}
                </Link>
                {/* <Link to="/auth/register?role=teacher" className="ce-btn border border-black/30 bg-black/10 text-black">
                  {t('landing.becomeTeacher')}
                </Link> */}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {show('faq') && (
      <section className="ce-section ce-section-alt">
        <div className="ce-container">
          <SectionHeader title={t('landing.faqTitle')} subtitle={t('landing.faqSubtitle')} />
          <FaqAccordion items={faqItems} />
        </div>
      </section>
      )}

      <div className="ce-sticky-cta lg:hidden">
        <Link to="/auth/register?role=student" className="ce-btn ce-btn-accent w-full shadow-xl">
          {t('landing.ctaStartLearning')}
        </Link>
      </div>
    </>
  );
}
