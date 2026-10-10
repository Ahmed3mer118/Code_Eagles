import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, BookOpen, BarChart3, Video, Award, Users, Code,
  MonitorSmartphone, Layers, Brain, LineChart, Shield,
  GraduationCap, Sparkles, Quote, Star, ChevronDown,
  ChevronLeft, ChevronRight, ArrowUpRight, BadgeCheck,
  Plus, X, Send, RotateCw, CheckCircle2, AlertCircle,
} from 'lucide-react';

import { platformApi } from '../../lib/platformApi';
import { useI18n } from '../../shared/i18n';
import { getAccessToken, getStoredUser } from '../../shared/api/client';

import LandingHeader from './components/LandingHeader';
import LandingFooter from './components/LandingFooter';

// ============================================================
// Constants
// ============================================================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function resolveImage(url) {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
}

const CATEGORY_KEYS = [
  { icon: Code,              key: 'programming' },
  { icon: MonitorSmartphone, key: 'frontend' },
  { icon: Layers,            key: 'backend' },
  { icon: Brain,             key: 'ai' },
  { icon: LineChart,         key: 'data' },
  { icon: Shield,            key: 'cyber' },
  { icon: BookOpen,          key: 'g1' },
  { icon: GraduationCap,     key: 'g2' },
  { icon: Award,             key: 'g3' },
];

const FEATURE_KEYS = [
  { icon: Users,             key: 'teachers' },
  { icon: Video,             key: 'live' },
  { icon: BookOpen,          key: 'recorded' },
  { icon: BarChart3,         key: 'quizzes' },
  { icon: Award,             key: 'certs' },
  { icon: Users,             key: 'parent' },
  { icon: MonitorSmartphone, key: 'mobile' },
  { icon: Sparkles,          key: 'smart' },
];

const HERO_FEATURE_KEYS = [
  { icon: BookOpen,  key: 'recorded' },
  { icon: BarChart3, key: 'quizzes' },
  { icon: Video,     key: 'live' },
  { icon: Award,     key: 'certs' },
];

// ============================================================
// Main Component
// ============================================================
export default function LandingPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const [academies, setAcademies] = useState([]);
  const [stats, setStats] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const isLoggedIn = !!getAccessToken();

  // Load
  const loadData = async () => {
    try {
      const [ac, st, fq, ts] = await Promise.all([
        platformApi.getAcademies(),
        platformApi.getStats(),
        platformApi.getFaqs(),
        platformApi.getTestimonials(),
      ]);
      setAcademies(ac || []);
      setStats(st);
      setFaqs(fq || []);
      setTestimonials(ts || []);
    } catch (err) {
      console.error('Landing load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [ac, st, fq, ts] = await Promise.all([
          platformApi.getAcademies(),
          platformApi.getStats(),
          platformApi.getFaqs(),
          platformApi.getTestimonials(),
        ]);
        if (!mounted) return;
        setAcademies(ac || []);
        setStats(st);
        setFaqs(fq || []);
        setTestimonials(ts || []);
      } catch (err) {
        console.error('Landing load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleAddTestimonial = () => {
    if (!isLoggedIn) {
      navigate('/login?redirect=/&action=testimonial');
      return;
    }
    setShowForm(true);
  };

  const handleSubmitted = async () => {
    setShowForm(false);
    // reload testimonials (لسه مش هيظهر لحد ما يتراجع)
    await loadData();
  };

  const filtered = search.trim()
    ? academies.filter(
        (a) =>
          a.name?.includes(search) ||
          a.ownerName?.includes(search) ||
          a.description?.includes(search),
      )
    : academies;

  return (
    <div className="min-h-screen pb-20 lg:pb-0 bg-[var(--ce-bg)]">
      <LandingHeader />

      {/* ============================================================
          HERO
         ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ce-brand)] via-[#122544] to-[var(--ce-brand-soft)] pb-16 pt-8 text-white sm:pt-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -start-[10%] -top-[5%] h-80 w-80 rounded-full bg-[var(--ce-accent)] opacity-25 blur-[130px] ce-float" />
          <div className="absolute -bottom-[10%] -end-[5%] h-72 w-72 rounded-full bg-sky-500 opacity-25 blur-[120px] ce-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:py-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="ce-fade-up">
              <div className="flex items-center gap-3">
                <img
                  src="/images/LOGO.png"
                  alt="Code Eagles"
                  className="h-14 w-14 rounded-2xl bg-white/10 p-1.5 object-contain shadow-lg backdrop-blur"
                />
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-[var(--ce-accent-soft)] backdrop-blur">
                  {t('landing.hero.badge')}
                </span>
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.15] sm:text-5xl lg:text-[3.4rem]">
                {t('landing.hero.title')}
              </h1>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/auth/register?role=student"
                  className="ce-shine rounded-full bg-[var(--ce-accent)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--ce-accent)]/30 transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t('landing.hero.startLearning')}
                </Link>
                <a
                  href="#academies"
                  className="rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  {t('landing.hero.exploreAcademies')}
                </a>
              </div>

              <div className="mt-8 max-w-xl">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="flex w-full flex-col gap-2 sm:flex-row"
                >
                  <label className="relative flex-1">
                    <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/55" />
                    <input
                      type="search"
                      placeholder={t('landing.hero.searchPlaceholder')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-3.5 ps-12 text-white placeholder-white/55 outline-none backdrop-blur transition focus:border-[var(--ce-accent)] focus:bg-white/15"
                    />
                  </label>
                  <button
                    type="submit"
                    className="shrink-0 rounded-full bg-[var(--ce-accent)] px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.02]"
                  >
                    {t('landing.hero.search')}
                  </button>
                </form>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <HeroStat value={stats?.totalStudents ?? 0} label={t('landing.hero.students')} />
                <HeroStat value={stats?.totalTeachers ?? 0} label={t('landing.hero.teachers')} />
                <HeroStat value={stats?.activeAcademies ?? 0} label={t('landing.hero.academiesCount')} />
              </div>
            </div>

            <div className="hidden lg:block ce-fade-up-2">
              <div className="relative mx-auto w-full max-w-lg">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[var(--ce-accent)]/20 to-sky-500/10 blur-2xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 shadow-2xl backdrop-blur">
                  <div className="flex flex-col gap-3">
                    {HERO_FEATURE_KEYS.map(({ icon: Icon, key }, idx) => (
                      <div
                        key={key}
                        className="group flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur transition hover:bg-white/15"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 transition group-hover:scale-110">
                          <Icon className="h-5 w-5 text-[var(--ce-accent-soft)]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-white">
                            {t(`landing.heroFeatures.${key}`)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          TRUSTED BY
         ============================================================ */}
      <section className="bg-[var(--ce-bg)] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-12 max-w-3xl text-center ce-fade-up">
            <span className="inline-flex items-center rounded-full border border-[var(--ce-accent)]/30 bg-[var(--ce-accent)]/10 px-3 py-1 text-xs font-bold text-[var(--ce-accent)]">
              {t('landing.trusted.badge')}
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
              {t('landing.trusted.title')}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)] sm:text-lg">
              {t('landing.trusted.subtitle')}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatBox value={stats?.activeAcademies ?? 0} label={t('landing.trusted.activeAcademies')} />
            <StatBox value={stats?.totalStudents ?? 0} label={t('landing.trusted.studentsRegistered')} />
            <StatBox value={stats?.totalCourses ?? 0} label={t('landing.trusted.publishedCourses')} />
            <StatBox value={stats?.totalQuizAttempts ?? 0} label={t('landing.trusted.completedQuizzes')} />
          </div>
        </div>
      </section>

      {/* ============================================================
          ACADEMIES
         ============================================================ */}
      <section id="academies" className="bg-[var(--ce-surface)] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-[var(--ce-accent)]/30 bg-[var(--ce-accent)]/10 px-3 py-1 text-xs font-bold text-[var(--ce-accent)]">
              {t('landing.academies.badge')}
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
              {t('landing.academies.title')}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)] sm:text-lg">
              {t('landing.academies.subtitle')}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--ce-accent)] border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--ce-border)] bg-[var(--ce-surface)] py-16 text-center text-[var(--ce-muted)]">
              {t('landing.academies.empty')}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {filtered.map((a) => (
                <AcademyCardItem key={a.id} academy={a} t={t} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          CATEGORIES
         ============================================================ */}
      <section id="categories" className="bg-[var(--ce-bg)] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-[var(--ce-accent)]/30 bg-[var(--ce-accent)]/10 px-3 py-1 text-xs font-bold text-[var(--ce-accent)]">
              {t('landing.categories.badge')}
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
              {t('landing.categories.title')}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)] sm:text-lg">
              {t('landing.categories.subtitle')}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORY_KEYS.map(({ icon: Icon, key }, i) => (
              <button
                key={key}
                type="button"
                className={`ce-hover-lift group flex flex-col items-start gap-3 rounded-2xl border bg-[var(--ce-surface)] p-5 text-start shadow-sm transition ${
                  i === 0
                    ? 'border-[var(--ce-accent)] ring-2 ring-[var(--ce-accent)]/40'
                    : 'border-[var(--ce-border)] hover:border-[var(--ce-accent)]/40'
                }`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ce-accent)]/15 text-[var(--ce-accent)] transition group-hover:scale-110 group-hover:bg-[var(--ce-accent)] group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-extrabold text-[var(--ce-primary)]">
                    {t(`landing.categories.items.${key}.title`)}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--ce-muted)]">
                    {t(`landing.categories.items.${key}.desc`)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURES
         ============================================================ */}
      <section id="features" className="bg-[var(--ce-surface)] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-[var(--ce-accent)]/30 bg-[var(--ce-accent)]/10 px-3 py-1 text-xs font-bold text-[var(--ce-accent)]">
              {t('landing.features.badge')}
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
              {t('landing.features.title')}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)] sm:text-lg">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURE_KEYS.map(({ icon: Icon, key }) => (
              <article
                key={key}
                className="ce-hover-lift group rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-5 shadow-sm"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ce-accent)]/15 text-[var(--ce-accent)] transition group-hover:scale-110 group-hover:bg-[var(--ce-accent)] group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-extrabold text-[var(--ce-primary)]">
                  {t(`landing.features.items.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ce-muted)]">
                  {t(`landing.features.items.${key}.desc`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          TESTIMONIALS — Grid with FLIP cards
         ============================================================ */}
      <section className="bg-[var(--ce-bg)] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-[var(--ce-accent)]/30 bg-[var(--ce-accent)]/10 px-3 py-1 text-xs font-bold text-[var(--ce-accent)]">
              {t('landing.testimonials.badge')}
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
              {t('landing.testimonials.title')}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)] sm:text-lg">
              {t('landing.testimonials.subtitle')}
            </p>

            {/* Add testimonial button */}
            <button
              type="button"
              onClick={handleAddTestimonial}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--ce-brand)] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:scale-[1.03] hover:bg-[var(--ce-brand-soft)] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              {isLoggedIn
                ? (lang === 'ar' ? 'أضف تجربتك' : 'Add your story')
                : (lang === 'ar' ? 'سجّل دخول وأضف تجربتك' : 'Login to share')}
            </button>

            <p className="mt-3 text-xs text-[var(--ce-muted)]">
              <RotateCw className="inline h-3 w-3" />{' '}
              {lang === 'ar'
                ? 'اضغط على أي كارت لقلبه ورؤية التقييم'
                : 'Click any card to flip and see the rating'}
            </p>
          </div>

          {testimonials.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--ce-border)] bg-[var(--ce-surface)] py-16 text-center">
              <Quote className="mx-auto h-12 w-12 text-[var(--ce-accent)]/40" />
              <p className="mt-4 text-[var(--ce-muted)]">
                {lang === 'ar' ? 'كن أول من يشارك تجربته!' : 'Be the first to share your story!'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 9).map((testimonial) => (
                <FlipTestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  lang={lang}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          IMPACT
         ============================================================ */}
      <section className="bg-[var(--ce-surface)] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
              {t('landing.impact.title')}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)] sm:text-lg">
              {t('landing.impact.subtitle')}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <ImpactBox value={stats?.totalStudents ?? 0} label={t('landing.impact.students')} />
            <ImpactBox value={stats?.activeAcademies ?? 0} label={t('landing.impact.academies')} />
            <ImpactBox value={stats?.totalTeachers ?? 0} label={t('landing.impact.teachers')} />
            <ImpactBox value={0} label={t('landing.impact.watchHours')} />
            <ImpactBox value={stats?.totalQuizAttempts ?? 0} label={t('landing.impact.completedQuizzes')} />
          </div>
        </div>
      </section>

      {/* ============================================================
          TEACHER CTA
         ============================================================ */}
      <section id="teacher-cta" className="bg-[var(--ce-bg)] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[var(--ce-brand)] via-[#122544] to-[var(--ce-brand-soft)] p-8 text-white shadow-2xl sm:p-12">
            <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0px)',
                backgroundSize: '32px 32px',
              }}
            />
            <div className="relative max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-[var(--ce-accent-soft)] backdrop-blur">
                {t('landing.teacherCta.badge')}
              </span>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                {t('landing.teacherCta.title')}
              </h2>
              <p className="mt-4 text-white/80">{t('landing.teacherCta.subtitle')}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/auth/register?role=teacher"
                  className="ce-shine rounded-full bg-[var(--ce-accent)] px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.02]"
                >
                  {t('landing.teacherCta.button')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FAQ
         ============================================================ */}
      {faqs.length > 0 && (
        <section className="bg-[var(--ce-surface)] py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
                {t('landing.faq.title')}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)] sm:text-lg">
                {t('landing.faq.subtitle')}
              </p>
            </div>

            <div className="mx-auto flex max-w-3xl flex-col gap-3">
              {faqs.map((f) => (
                <FaqItem key={f.id} faq={f} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}

      <LandingFooter />

      {/* ============================================================
          TESTIMONIAL FORM MODAL
         ============================================================ */}
      {showForm && (
        <TestimonialFormModal
          lang={lang}
          onClose={() => setShowForm(false)}
          onSubmitted={handleSubmitted}
        />
      )}
    </div>
  );
}

// ============================================================
// Sub Components
// ============================================================

function HeroStat({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md transition hover:bg-white/15">
      <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">{value}+</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/70">
        {label}
      </p>
    </div>
  );
}

function StatBox({ value, label }) {
  return (
    <div className="ce-hover-lift rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-5 text-center shadow-sm">
      <p className="text-2xl font-extrabold text-[var(--ce-primary)]">{value}+</p>
      <p className="mt-1 text-sm font-semibold text-[var(--ce-muted)]">{label}</p>
    </div>
  );
}

function ImpactBox({ value, label }) {
  return (
    <div className="ce-hover-lift rounded-2xl border border-[var(--ce-border)] bg-gradient-to-br from-[var(--ce-surface)] to-[var(--ce-bg)] p-5 text-center shadow-sm">
      <div className="bg-gradient-to-br from-[var(--ce-accent)] to-[var(--ce-accent-soft)] bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
        {value}+
      </div>
      <p className="mt-2 text-sm font-semibold text-[var(--ce-muted)]">{label}</p>
    </div>
  );
}

// ------------------------------------------------------------
// Academy Card
// ------------------------------------------------------------
function AcademyCardItem({ academy, t }) {
  const logo = resolveImage(academy.logoUrl);
  const cover = resolveImage(academy.coverUrl);
  const initial = academy.name?.charAt(0) ?? '؟';

  return (
    <article className="ce-hover-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] shadow-sm">
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[var(--ce-brand)] to-[var(--ce-brand-soft)]">
        {cover ? (
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-extrabold text-white/20">
            {initial}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        {logo && (
          <img
            src={logo}
            alt={academy.name}
            loading="lazy"
            className="absolute bottom-3 start-3 h-12 w-12 rounded-xl border-2 border-white object-cover shadow-lg transition group-hover:scale-110"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-extrabold text-[var(--ce-primary)]">
              {academy.name}
            </h3>
            {academy.ownerName && (
              <p className="mt-1 truncate text-sm text-[var(--ce-muted)]">
                {academy.ownerName}
              </p>
            )}
          </div>
          {academy.approvalStatus === 'approved' && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              <BadgeCheck className="h-3.5 w-3.5" />
              {t('landing.academies.verified')}
            </span>
          )}
        </div>

        {academy.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--ce-muted)]">
            {academy.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-[var(--ce-muted)]">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-[var(--ce-accent)]" />
            {academy.studentsCount} {t('landing.academies.studentsCount')}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-[var(--ce-accent)]" />
            {academy.coursesCount} {t('landing.academies.coursesCount')}
          </span>
        </div>

        <Link
          to={`/academy/${academy.slug}`}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ce-brand)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--ce-brand-soft)] sm:mt-5"
        >
          {t('landing.academies.view')}
          <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
}

// ------------------------------------------------------------
// Flip Testimonial Card
// ------------------------------------------------------------
function FlipTestimonialCard({ testimonial, lang }) {
  const [flipped, setFlipped] = useState(false);
  const content = testimonial.content?.[lang] ?? testimonial.content?.ar ?? '';
  const initial = testimonial.name?.charAt(0) ?? '؟';
  const rating = testimonial.rating ?? 5;

  return (
    <div
      className="ce-perspective h-72 cursor-pointer"
      onClick={() => setFlipped((v) => !v)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') setFlipped((v) => !v);
      }}
    >
      <div className={`ce-flip-inner ${flipped ? 'is-flipped' : ''}`}>
        {/* FRONT */}
        <div className="ce-flip-face flex flex-col justify-between border border-[var(--ce-border)] bg-[var(--ce-surface)] p-6 shadow-sm">
          <div>
            <Quote className="h-8 w-8 text-[var(--ce-accent)]/40" />
            <p className="mt-4 line-clamp-5 text-base leading-relaxed text-[var(--ce-text)]">
              "{content}"
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-[var(--ce-border)] pt-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--ce-brand)] to-[var(--ce-accent)] text-sm font-extrabold text-white">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-[var(--ce-primary)]">
                {testimonial.name ?? '—'}
              </p>
              <p className="truncate text-xs text-[var(--ce-muted)]">
                {testimonial.role ?? ''}
              </p>
            </div>
            <RotateCw className="h-4 w-4 shrink-0 text-[var(--ce-muted)]" />
          </div>
        </div>

        {/* BACK */}
        <div className="ce-flip-face ce-flip-back flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[var(--ce-brand)] to-[var(--ce-brand-soft)] p-6 text-center text-white shadow-lg">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <span className="text-2xl font-extrabold">{initial}</span>
          </div>
          <p className="text-lg font-extrabold">{testimonial.name ?? '—'}</p>
          <p className="text-sm text-white/70">{testimonial.role ?? ''}</p>

          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`h-6 w-6 ${
                  n <= rating
                    ? 'fill-[var(--ce-accent)] text-[var(--ce-accent)]'
                    : 'text-white/30'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-white/60">
            {rating} / 5 {lang === 'ar' ? 'نجوم' : 'stars'}
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(false);
            }}
            className="mt-3 inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur transition hover:bg-white/20"
          >
            <RotateCw className="h-3 w-3" />
            {lang === 'ar' ? 'رجوع' : 'Back'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// FAQ Item
// ------------------------------------------------------------
function FaqItem({ faq, lang }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] shadow-sm transition hover:border-[var(--ce-accent)]/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start transition hover:bg-[var(--ce-bg)]"
        aria-expanded={open}
      >
        <span className="font-bold text-[var(--ce-primary)]">
          {faq.question?.[lang] ?? faq.question?.ar}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[var(--ce-accent)] transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="ce-fade-in border-t border-[var(--ce-border)] px-5 pb-5 pt-3 leading-relaxed text-[var(--ce-muted)]">
          {faq.answer?.[lang] ?? faq.answer?.ar}
        </div>
      )}
    </article>
  );
}

// ------------------------------------------------------------
// Testimonial Submission Modal
// ------------------------------------------------------------
function TestimonialFormModal({ lang, onClose, onSubmitted }) {
  const user = getStoredUser?.() || {};
  const [form, setForm] = useState({
    name: user.name || '',
    role: lang === 'ar' ? 'طالب' : 'Student',
    content: '',
    rating: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'

  const isAr = lang === 'ar';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.content.trim().length < 10) {
      setStatus('error');
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      await platformApi.submitTestimonial({
        name: form.name || undefined,
        role: form.role || undefined,
        content: { [lang]: form.content, ar: form.content },
        rating: form.rating,
      });
      setStatus('success');
      setTimeout(() => {
        onSubmitted?.();
      }, 1500);
    } catch (err) {
      console.error('Submit testimonial failed:', err);
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ce-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="ce-slide-in w-full max-w-lg overflow-hidden rounded-3xl bg-[var(--ce-surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--ce-border)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ce-accent)]/15">
              <Quote className="h-5 w-5 text-[var(--ce-accent)]" />
            </div>
            <div>
              <h3 className="font-extrabold text-[var(--ce-primary)]">
                {isAr ? 'شارك تجربتك' : 'Share Your Story'}
              </h3>
              <p className="text-xs text-[var(--ce-muted)]">
                {isAr ? 'سيتم مراجعتها قبل النشر' : 'Will be reviewed before publishing'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--ce-muted)] transition hover:bg-[var(--ce-bg)] hover:text-[var(--ce-text)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        {status === 'success' ? (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="text-xl font-extrabold text-[var(--ce-primary)]">
              {isAr ? 'تم الإرسال بنجاح!' : 'Submitted successfully!'}
            </h4>
            <p className="text-sm text-[var(--ce-muted)]">
              {isAr
                ? 'شكراً لمشاركتك! سيتم مراجعة تجربتك ونشرها قريباً.'
                : 'Thanks for sharing! Your testimonial will be reviewed and published soon.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-[var(--ce-primary)]">
                {isAr ? 'الاسم' : 'Name'}
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] px-4 py-2.5 text-sm text-[var(--ce-text)] outline-none transition focus:border-[var(--ce-accent)] focus:ring-2 focus:ring-[var(--ce-accent)]/20"
                placeholder={isAr ? 'اسمك أو اسمك المستعار' : 'Your name or pseudonym'}
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-[var(--ce-primary)]">
                {isAr ? 'الصفة' : 'Role'}
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] px-4 py-2.5 text-sm text-[var(--ce-text)] outline-none transition focus:border-[var(--ce-accent)] focus:ring-2 focus:ring-[var(--ce-accent)]/20"
              >
                <option value={isAr ? 'طالب' : 'Student'}>
                  {isAr ? 'طالب' : 'Student'}
                </option>
                <option value={isAr ? 'ولي أمر' : 'Parent'}>
                  {isAr ? 'ولي أمر' : 'Parent'}
                </option>
                <option value={isAr ? 'مدرس' : 'Teacher'}>
                  {isAr ? 'مدرس' : 'Teacher'}
                </option>
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-[var(--ce-primary)]">
                {isAr ? 'التقييم' : 'Rating'}
              </label>
              <div className="mt-1.5 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    className="transition hover:scale-110"
                    aria-label={`${n} stars`}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        n <= form.rating
                          ? 'fill-[var(--ce-accent)] text-[var(--ce-accent)]'
                          : 'text-[var(--ce-border)]'
                      }`}
                    />
                  </button>
                ))}
                <span className="ms-2 text-sm font-semibold text-[var(--ce-muted)]">
                  {form.rating} / 5
                </span>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-[var(--ce-primary)]">
                {isAr ? 'تجربتك' : 'Your story'}
              </label>
              <textarea
                required
                minLength={10}
                maxLength={1000}
                rows={4}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="mt-1.5 w-full resize-none rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] px-4 py-2.5 text-sm text-[var(--ce-text)] outline-none transition focus:border-[var(--ce-accent)] focus:ring-2 focus:ring-[var(--ce-accent)]/20"
                placeholder={
                  isAr
                    ? 'اكتب تجربتك مع المنصة (10 أحرف على الأقل)...'
                    : 'Write your experience with the platform (at least 10 chars)...'
                }
              />
              <p className="mt-1 text-xs text-[var(--ce-muted)]">
                {form.content.length} / 1000
              </p>
            </div>

            {/* Error */}
            {status === 'error' && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {isAr
                  ? 'تأكد إن النص 10 أحرف على الأقل، وحاول تاني.'
                  : 'Make sure the text is at least 10 chars, then try again.'}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-[var(--ce-border)] px-4 py-2.5 text-sm font-semibold text-[var(--ce-text)] transition hover:bg-[var(--ce-bg)]"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting || form.content.trim().length < 10}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--ce-accent)] px-4 py-2.5 text-sm font-bold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {isAr ? 'جاري الإرسال...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {isAr ? 'إرسال' : 'Submit'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}