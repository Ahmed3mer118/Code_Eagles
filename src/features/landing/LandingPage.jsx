// src/features/landing/LandingPage.jsx
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, BookOpen, BarChart3, Video, Award, Users, Code,
  MonitorSmartphone, Layers, Brain, LineChart, Shield,
  GraduationCap, Sparkles, Quote, Star, ChevronDown,
  ArrowUpRight, BadgeCheck, Plus, X, Send, RotateCw,
  CheckCircle2, AlertCircle, Play, TrendingUp, Zap, Megaphone,
} from 'lucide-react';

import { platformApi } from '../../lib/platformApi';
import { useI18n } from '../../shared/i18n';
import { onLiveUpdate } from '../../shared/utils/liveUpdates';

import LandingHeader from './components/LandingHeader';
import LandingFooter from './components/LandingFooter';
import ContactSection from './components/ContactSection';

// ============================================================
// Constants
// ============================================================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const REFRESH_INTERVAL_MS = 30_000;

const ICON_REGISTRY = {
  code: Code, frontend: MonitorSmartphone, backend: Layers,
  ai: Brain, data: LineChart, cyber: Shield,
  book: BookOpen, graduation: GraduationCap, award: Award,
  users: Users, video: Video, 'bar-chart': BarChart3,
  sparkles: Sparkles, play: Play, zap: Zap, trending: TrendingUp,
};

function getIcon(name, Fallback = Sparkles) {
  return ICON_REGISTRY[name] || Fallback;
}

function resolveImage(url) {
  if (!url) return undefined;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_URL}${url}`;
}

function siteText(site, key, lang) {
  const val = site?.[key];
  if (val == null) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val[lang] ?? val.ar ?? val.en ?? null;
  return null;
}

function siteItems(site, key) {
  const val = site?.[key];
  if (!val) return null;
  if (Array.isArray(val)) return val;
  if (Array.isArray(val.items)) return val.items;
  return null;
}

// ✅ Suffix default '+'
function formatStatValue(value, suffix) {
  const v = Number(value) || 0;
  if (v === 0) return '0';
  const s = suffix === null || suffix === undefined ? '+' : suffix;
  return `${v}${s}`;
}

// ============================================================
// Main Component
// ============================================================
export default function LandingPage() {
  const { lang } = useI18n();

  const [academies, setAcademies] = useState([]);
  const [stats, setStats] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [site, setSite] = useState({});
  const [plans, setPlans] = useState([]);
  const [emergency, setEmergency] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  // ===== loadData =====
  const loadData = useCallback(async (silent = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (!silent) setLoading(true);

    try {
      const [ac, st, fq, ts, sc, pl, em] = await Promise.allSettled([
        platformApi.getAcademies(),
        platformApi.getStats(),
        platformApi.getFaqs(),
        platformApi.getTestimonials(),
        platformApi.getSiteContent(),
        platformApi.getPlans(),
        platformApi.getEmergency(),
      ]);

      if (!mountedRef.current) return;

      if (ac.status === 'fulfilled') setAcademies(ac.value || []);
      if (st.status === 'fulfilled') setStats(st.value);
      if (fq.status === 'fulfilled') setFaqs(fq.value || []);
      if (ts.status === 'fulfilled') setTestimonials(ts.value || []);
      if (sc.status === 'fulfilled') setSite(sc.value || {});
      if (pl.status === 'fulfilled') setPlans(pl.value || []);
      if (em.status === 'fulfilled') setEmergency(em.value);
    } catch (err) {
      console.error('Landing load error:', err);
    } finally {
      if (!silent) setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadData(false);
    return () => {
      mountedRef.current = false;
    };
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadData(true);
      }
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') loadData(true);
    };
    const onFocus = () => loadData(true);

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = onLiveUpdate(() => loadData(true));
    return unsubscribe;
  }, [loadData]);

  // ===== Helpers =====
  const txt = (key) => siteText(site, key, lang);
  const statSuffix = txt('landing.stats.suffix') ?? '+';

  const features = useMemo(() => {
    const fromApi = siteItems(site, 'landing.features');
    if (!fromApi || !fromApi.length) return [];
    return fromApi.map((f, i) => ({
      key: f.key || `feat-${i}`,
      icon: getIcon(f.icon, Sparkles),
      title: typeof f.title === 'object' ? f.title[lang] ?? f.title.ar : f.title,
      desc: typeof f.desc === 'object' ? f.desc[lang] ?? f.desc.ar : f.desc,
    }));
  }, [site, lang]);

  const heroFeatures = useMemo(() => {
    const fromApi = siteItems(site, 'landing.heroFeatures');
    if (!fromApi || !fromApi.length) return [];
    return fromApi.map((f, i) => ({
      key: f.key || `hf-${i}`,
      icon: getIcon(f.icon, BookOpen),
      label: typeof f.label === 'object' ? f.label[lang] ?? f.label.ar : f.label,
    }));
  }, [site, lang]);

  const teacherBenefits = useMemo(() => {
    const fromApi = siteItems(site, 'landing.teacherCta.benefits');
    if (!fromApi || !fromApi.length) return [];
    return fromApi.map((b) => {
      if (typeof b === 'string') return b;
      return typeof b.text === 'object' ? b.text[lang] ?? b.text.ar : b.text;
    });
  }, [site, lang]);

  const filtered = search.trim()
    ? academies.filter(
        (a) =>
          a.name?.includes(search) ||
          a.ownerName?.includes(search) ||
          a.description?.includes(search),
      )
    : academies;

  // ✅ NEW — بدون شرط تسجيل الدخول
  const handleAddTestimonial = () => {
    setShowForm(true);
  };

  const handleSubmitted = async () => {
    setShowForm(false);
    await loadData(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--ce-bg)]">
        <LandingHeader />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--ce-accent)] border-t-transparent" />
        </div>
        <LandingFooter />
      </div>
    );
  }

  const registerStudentPath = txt('landing.links.registerStudent') ?? '/register?role=student';
  const registerTeacherPath = txt('landing.links.registerTeacher') ?? '/register?role=teacher';
  const logoUrl = txt('landing.hero.logoUrl');

  return (
    <div className="min-h-screen bg-[var(--ce-bg)] pb-20 lg:pb-0">
      <LandingHeader />

      {emergency?.enabled && (
        <div className="relative z-30 bg-gradient-to-r from-red-600 via-red-500 to-red-600 px-4 py-2.5 text-center text-sm font-bold text-white shadow-lg">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
            <Megaphone className="h-5 w-5 shrink-0" />
            <span>
              {emergency.message?.[lang] ?? emergency.message?.ar ?? emergency.message?.en ?? ''}
            </span>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ce-brand)] via-[#122544] to-[var(--ce-brand-soft)] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -start-[10%] -top-[5%] h-[500px] w-[500px] rounded-full bg-[var(--ce-accent)] opacity-20 blur-[140px] ce-float" />
          <div className="absolute -bottom-[15%] -end-[10%] h-[450px] w-[450px] rounded-full bg-sky-500 opacity-20 blur-[130px] ce-float" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
            <div className="ce-fade-up">
              <div className="flex items-center gap-3">
                {logoUrl && (
                  <img
                    src={resolveImage(logoUrl)}
                    alt={txt('landing.hero.brandName') ?? ''}
                    className="h-14 w-14 rounded-2xl bg-white/10 p-1.5 object-contain shadow-lg backdrop-blur"
                  />
                )}
                {txt('landing.hero.badge') && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-[var(--ce-accent-soft)] backdrop-blur">
                    <Sparkles className="h-3.5 w-3.5" />
                    {txt('landing.hero.badge')}
                  </span>
                )}
              </div>

              {txt('landing.hero.title') && (
                <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
                  {txt('landing.hero.title')}
                </h1>
              )}

              {txt('landing.hero.subtitle') && (
                <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                  {txt('landing.hero.subtitle')}
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                {txt('landing.hero.startLearning') && (
                  <Link
                    to={registerStudentPath}
                    className="group inline-flex items-center gap-2 rounded-full bg-[var(--ce-accent)] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[var(--ce-accent)]/30 transition hover:scale-[1.03] active:scale-[0.98]"
                  >
                    {txt('landing.hero.startLearning')}
                    <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                )}
                {txt('landing.hero.exploreAcademies') && (
                  <a
                    href="#academies"
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                  >
                    {txt('landing.hero.exploreAcademies')}
                  </a>
                )}
              </div>

              {stats && (
                <div className="mt-10 flex flex-wrap items-center gap-6">
                  <TrustItem value={stats.totalStudents ?? 0} label={txt('landing.hero.students')} suffix={statSuffix} />
                  <div className="h-10 w-px bg-white/20" />
                  <TrustItem value={stats.totalTeachers ?? 0} label={txt('landing.hero.teachers')} suffix={statSuffix} />
                  <div className="h-10 w-px bg-white/20" />
                  <TrustItem value={stats.activeAcademies ?? 0} label={txt('landing.hero.academiesCount')} suffix={statSuffix} />
                </div>
              )}
            </div>

            {heroFeatures.length > 0 && (
              <div className="hidden lg:block ce-fade-up-2">
                <div className="relative mx-auto w-full max-w-md">
                  <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-[var(--ce-accent)]/25 to-sky-500/15 blur-3xl" />
                  <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ce-accent)]/20">
                          <Zap className="h-4 w-4 text-[var(--ce-accent-soft)]" />
                        </div>
                        <span className="text-sm font-bold text-white">
                          {txt('landing.hero.featuresCardTitle') ?? ''}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-red-400/60" />
                        <div className="h-2 w-2 rounded-full bg-yellow-400/60" />
                        <div className="h-2 w-2 rounded-full bg-green-400/60" />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-3">
                      {heroFeatures.map(({ icon: Icon, key, label }, idx) => (
                        <div
                          key={key}
                          className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:border-[var(--ce-accent)]/30 hover:bg-white/10"
                          style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ce-accent)] to-[var(--ce-accent-soft)] shadow-lg transition group-hover:scale-110">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-white">{label}</p>
                          </div>
                          <CheckCircle2 className="h-4 w-4 text-[var(--ce-accent-soft)]" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SEARCH */}
      {(txt('landing.hero.searchPlaceholder') || txt('landing.hero.search')) && (
        <section className="relative z-20 -mt-8 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-3xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-4 shadow-2xl shadow-black/5 sm:p-6">
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                  <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--ce-muted)]" />
                  <input
                    type="search"
                    placeholder={txt('landing.hero.searchPlaceholder') ?? ''}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)] px-4 py-3.5 ps-12 text-sm text-[var(--ce-text)] outline-none transition focus:border-[var(--ce-accent)] focus:ring-2 focus:ring-[var(--ce-accent)]/20"
                  />
                </label>
                {txt('landing.hero.search') && (
                  <button
                    type="submit"
                    className="shrink-0 rounded-2xl bg-[var(--ce-accent)] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--ce-accent)]/25 transition hover:scale-[1.02]"
                  >
                    {txt('landing.hero.search')}
                  </button>
                )}
              </form>
            </div>
          </div>
        </section>
      )}

      {/* TRUSTED */}
      {stats && (txt('landing.trusted.title') || txt('landing.trusted.badge')) && (
        <section className="bg-[var(--ce-bg)] py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-10 max-w-2xl text-center ce-fade-up">
              {txt('landing.trusted.badge') && (
                <span className="inline-flex items-center rounded-full border border-[var(--ce-accent)]/30 bg-[var(--ce-accent)]/10 px-3 py-1 text-xs font-bold text-[var(--ce-accent)]">
                  {txt('landing.trusted.badge')}
                </span>
              )}
              {txt('landing.trusted.title') && (
                <h2 className="mt-3 text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
                  {txt('landing.trusted.title')}
                </h2>
              )}
              {txt('landing.trusted.subtitle') && (
                <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)]">
                  {txt('landing.trusted.subtitle')}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatBox icon={GraduationCap} value={stats.activeAcademies ?? 0} label={txt('landing.trusted.activeAcademies')} suffix={statSuffix} />
              <StatBox icon={Users} value={stats.totalStudents ?? 0} label={txt('landing.trusted.studentsRegistered')} suffix={statSuffix} />
              <StatBox icon={BookOpen} value={stats.totalCourses ?? 0} label={txt('landing.trusted.publishedCourses')} suffix={statSuffix} />
              <StatBox icon={BarChart3} value={stats.totalQuizAttempts ?? 0} label={txt('landing.trusted.completedQuizzes')} suffix={statSuffix} />
            </div>
          </div>
        </section>
      )}

      {/* ACADEMIES */}
      {(filtered.length > 0 || txt('landing.academies.title')) && (
        <section id="academies" className="bg-[var(--ce-surface)] py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              {txt('landing.academies.badge') && (
                <span className="inline-flex items-center rounded-full border border-[var(--ce-accent)]/30 bg-[var(--ce-accent)]/10 px-3 py-1 text-xs font-bold text-[var(--ce-accent)]">
                  {txt('landing.academies.badge')}
                </span>
              )}
              {txt('landing.academies.title') && (
                <h2 className="mt-3 text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
                  {txt('landing.academies.title')}
                </h2>
              )}
              {txt('landing.academies.subtitle') && (
                <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)]">
                  {txt('landing.academies.subtitle')}
                </p>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--ce-border)] bg-[var(--ce-surface)] py-16 text-center text-[var(--ce-muted)]">
                {txt('landing.academies.empty') ?? ''}
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {filtered.map((a) => (
                  <AcademyCardItem key={a.id} academy={a} site={site} lang={lang} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* FEATURES */}
      {features.length > 0 && (
        <section id="features" className="bg-[var(--ce-bg)] py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              {txt('landing.features.badge') && (
                <span className="inline-flex items-center rounded-full border border-[var(--ce-accent)]/30 bg-[var(--ce-accent)]/10 px-3 py-1 text-xs font-bold text-[var(--ce-accent)]">
                  {txt('landing.features.badge')}
                </span>
              )}
              {txt('landing.features.title') && (
                <h2 className="mt-3 text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
                  {txt('landing.features.title')}
                </h2>
              )}
              {txt('landing.features.subtitle') && (
                <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)]">
                  {txt('landing.features.subtitle')}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, key, title, desc }) => (
                <article
                  key={key}
                  className="group relative overflow-hidden rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[var(--ce-accent)]/40 hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--ce-accent)]/5 to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="relative">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ce-accent)]/15 text-[var(--ce-accent)] transition group-hover:scale-110 group-hover:bg-[var(--ce-accent)] group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 font-extrabold text-[var(--ce-primary)]">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--ce-muted)]">{desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PLANS */}
      {plans.length > 0 && (
        <section id="pricing" className="bg-[var(--ce-surface)] py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              {txt('landing.pricing.badge') && (
                <span className="inline-flex items-center rounded-full border border-[var(--ce-accent)]/30 bg-[var(--ce-accent)]/10 px-3 py-1 text-xs font-bold text-[var(--ce-accent)]">
                  {txt('landing.pricing.badge')}
                </span>
              )}
              {txt('landing.pricing.title') && (
                <h2 className="mt-3 text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
                  {txt('landing.pricing.title')}
                </h2>
              )}
              {txt('landing.pricing.subtitle') && (
                <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)]">
                  {txt('landing.pricing.subtitle')}
                </p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan, idx) => (
                <PlanCard key={plan.id} plan={plan} featured={idx === 1} site={site} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {(testimonials.length > 0 || txt('landing.testimonials.title')) && (
        <section className="bg-[var(--ce-bg)] py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              {txt('landing.testimonials.badge') && (
                <span className="inline-flex items-center rounded-full border border-[var(--ce-accent)]/30 bg-[var(--ce-accent)]/10 px-3 py-1 text-xs font-bold text-[var(--ce-accent)]">
                  {txt('landing.testimonials.badge')}
                </span>
              )}
              {txt('landing.testimonials.title') && (
                <h2 className="mt-3 text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
                  {txt('landing.testimonials.title')}
                </h2>
              )}
              {txt('landing.testimonials.subtitle') && (
                <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)]">
                  {txt('landing.testimonials.subtitle')}
                </p>
              )}

              {/* ✅ الزرار ظاهر دايماً — بدون شرط */}
              {txt('landing.testimonials.addButton') && (
                <button
                  type="button"
                  onClick={handleAddTestimonial}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--ce-brand)] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:scale-[1.03] hover:bg-[var(--ce-brand-soft)]"
                >
                  <Plus className="h-4 w-4" />
                  {txt('landing.testimonials.addButton')}
                </button>
              )}

              {txt('landing.testimonials.flipHint') && (
                <p className="mt-3 text-xs text-[var(--ce-muted)]">
                  <RotateCw className="inline h-3 w-3" /> {txt('landing.testimonials.flipHint')}
                </p>
              )}
            </div>

            {testimonials.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--ce-border)] bg-[var(--ce-surface)] py-16 text-center">
                <Quote className="mx-auto h-12 w-12 text-[var(--ce-accent)]/40" />
                {txt('landing.testimonials.empty') && (
                  <p className="mt-4 text-[var(--ce-muted)]">{txt('landing.testimonials.empty')}</p>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.slice(0, 9).map((testimonial) => (
                  <FlipTestimonialCard key={testimonial.id} testimonial={testimonial} site={site} lang={lang} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* IMPACT */}
      {stats && (txt('landing.impact.title') || txt('landing.impact.subtitle')) && (
        <section className="bg-[var(--ce-surface)] py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              {txt('landing.impact.title') && (
                <h2 className="text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
                  {txt('landing.impact.title')}
                </h2>
              )}
              {txt('landing.impact.subtitle') && (
                <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)]">
                  {txt('landing.impact.subtitle')}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ImpactBox icon={Users} value={stats.totalStudents ?? 0} label={txt('landing.impact.students')} suffix={statSuffix} />
              <ImpactBox icon={GraduationCap} value={stats.activeAcademies ?? 0} label={txt('landing.impact.academies')} suffix={statSuffix} />
              <ImpactBox icon={BookOpen} value={stats.totalTeachers ?? 0} label={txt('landing.impact.teachers')} suffix={statSuffix} />
              <ImpactBox icon={BarChart3} value={stats.totalQuizAttempts ?? 0} label={txt('landing.impact.completedQuizzes')} suffix={statSuffix} />
            </div>
          </div>
        </section>
      )}

      {/* TEACHER CTA */}
      {(txt('landing.teacherCta.title') || teacherBenefits.length > 0) && (
        <section id="teacher-cta" className="bg-[var(--ce-bg)] py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[var(--ce-brand)] via-[#122544] to-[var(--ce-brand-soft)] p-8 text-white shadow-2xl sm:p-14">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0px)',
                  backgroundSize: '32px 32px',
                }}
              />
              <div className="pointer-events-none absolute -end-20 -top-20 h-64 w-64 rounded-full bg-[var(--ce-accent)] opacity-20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -start-20 h-64 w-64 rounded-full bg-sky-500 opacity-20 blur-3xl" />

              <div className="relative grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
                <div className="max-w-2xl">
                  {txt('landing.teacherCta.badge') && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-[var(--ce-accent-soft)] backdrop-blur">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {txt('landing.teacherCta.badge')}
                    </span>
                  )}
                  {txt('landing.teacherCta.title') && (
                    <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                      {txt('landing.teacherCta.title')}
                    </h2>
                  )}
                  {txt('landing.teacherCta.subtitle') && (
                    <p className="mt-4 text-white/80">{txt('landing.teacherCta.subtitle')}</p>
                  )}
                  {txt('landing.teacherCta.button') && (
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link
                        to={registerTeacherPath}
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--ce-accent)] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[var(--ce-accent)]/30 transition hover:scale-[1.02]"
                      >
                        {txt('landing.teacherCta.button')}
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </div>

                {teacherBenefits.length > 0 && (
                  <div className="hidden lg:block">
                    <div className="space-y-3">
                      {teacherBenefits.map((text, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ce-accent)]/20">
                            <CheckCircle2 className="h-4 w-4 text-[var(--ce-accent-soft)]" />
                          </div>
                          <span className="text-sm font-semibold text-white">{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="bg-[var(--ce-surface)] py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              {txt('landing.faq.title') && (
                <h2 className="text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
                  {txt('landing.faq.title')}
                </h2>
              )}
              {txt('landing.faq.subtitle') && (
                <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)]">
                  {txt('landing.faq.subtitle')}
                </p>
              )}
            </div>

            <div className="mx-auto flex max-w-3xl flex-col gap-3">
              {faqs.map((f) => (
                <FaqItem key={f.id} faq={f} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ContactSection />

      <LandingFooter />

      {showForm && (
        <TestimonialFormModal
          site={site}
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

function TrustItem({ value, label, suffix }) {
  if (!label) return null;
  return (
    <div className="text-start">
      <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        {formatStatValue(value, suffix)}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-white/60">{label}</p>
    </div>
  );
}

function StatBox({ icon: Icon, value, label, suffix }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[var(--ce-accent)]/40 hover:shadow-xl">
      <div className="absolute -end-4 -top-4 h-24 w-24 rounded-full bg-[var(--ce-accent)]/5 transition group-hover:bg-[var(--ce-accent)]/10" />
      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--ce-accent)]/15 text-[var(--ce-accent)]">
          <Icon className="h-5 w-5" />
        </div>
        <p className="mt-4 text-3xl font-extrabold text-[var(--ce-primary)]">
          {formatStatValue(value, suffix)}
        </p>
        {label && <p className="mt-1 text-sm font-semibold text-[var(--ce-muted)]">{label}</p>}
      </div>
    </div>
  );
}

function ImpactBox({ icon: Icon, value, label, suffix }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--ce-border)] bg-gradient-to-br from-[var(--ce-surface)] to-[var(--ce-bg)] p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--ce-accent)] to-[var(--ce-accent-soft)] text-white shadow-lg">
        <Icon className="h-6 w-6" />
      </div>
      <div className="mt-4 bg-gradient-to-br from-[var(--ce-accent)] to-[var(--ce-accent-soft)] bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
        {formatStatValue(value, suffix)}
      </div>
      {label && <p className="mt-2 text-sm font-semibold text-[var(--ce-muted)]">{label}</p>}
    </div>
  );
}

function PlanCard({ plan, featured, site, lang }) {
  const txt = (key) => siteText(site, key, lang);
  const price = Number(plan.price) || 0;
  const features = plan.features || {};
  const featureList = Array.isArray(features)
    ? features
    : Object.entries(features)
        .filter(([_, v]) => v === true || typeof v === 'string')
        .map(([k, v]) => (typeof v === 'string' ? v : k));

  const freeLabel = txt('landing.pricing.free');
  const perMonthLabel = txt('landing.pricing.perMonth');
  const mostPopularLabel = txt('landing.pricing.mostPopular');
  const ctaLabel = txt('landing.pricing.ctaButton');
  const studentsTemplate = txt('landing.pricing.upToStudents');
  const assistantsTemplate = txt('landing.pricing.upToAssistants');
  const currency = txt('landing.pricing.currency') ?? '';
  const registerTeacherPath = txt('landing.links.registerTeacher') ?? '/register?role=teacher';

  return (
    <article
      className={`relative flex flex-col rounded-3xl border p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
        featured
          ? 'border-[var(--ce-accent)] bg-gradient-to-br from-[var(--ce-surface)] to-[var(--ce-accent)]/5 ring-2 ring-[var(--ce-accent)]/30'
          : 'border-[var(--ce-border)] bg-[var(--ce-surface)]'
      }`}
    >
      {featured && mostPopularLabel && (
        <span className="absolute -top-3 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--ce-accent)] px-3 py-1 text-xs font-bold text-white shadow-lg">
          {mostPopularLabel}
        </span>
      )}

      <h3 className="text-xl font-extrabold text-[var(--ce-primary)]">{plan.name}</h3>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold text-[var(--ce-primary)]">
          {price === 0 ? freeLabel ?? '' : `${price}${currency}`}
        </span>
        {price > 0 && perMonthLabel && (
          <span className="text-sm text-[var(--ce-muted)]">
            / {plan.periodMonths} {perMonthLabel}
          </span>
        )}
      </div>

      <ul className="mt-6 flex-1 space-y-3 text-sm text-[var(--ce-muted)]">
        {plan.maxStudents != null && studentsTemplate && (
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--ce-accent)]" />
            {studentsTemplate.replace('{count}', String(plan.maxStudents))}
          </li>
        )}
        {plan.maxAssistants != null && assistantsTemplate && (
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--ce-accent)]" />
            {assistantsTemplate.replace('{count}', String(plan.maxAssistants))}
          </li>
        )}
        {featureList.slice(0, 5).map((f, i) => (
          <li key={i} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--ce-accent)]" />
            {typeof f === 'string' ? f : String(f)}
          </li>
        ))}
      </ul>

      {ctaLabel && (
        <Link
          to={`${registerTeacherPath}&plan=${plan.id}`}
          className={`mt-7 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition hover:scale-[1.02] ${
            featured
              ? 'bg-[var(--ce-accent)] text-white shadow-lg shadow-[var(--ce-accent)]/25'
              : 'bg-[var(--ce-brand)] text-white hover:bg-[var(--ce-brand-soft)]'
          }`}
        >
          {ctaLabel}
        </Link>
      )}
    </article>
  );
}

function AcademyCardItem({ academy, site, lang }) {
  const txt = (key) => siteText(site, key, lang);
  const logo = resolveImage(academy.logoUrl);
  const cover = resolveImage(academy.coverUrl);
  const initial = academy.name?.charAt(0) ?? '';

  const verifiedLabel = txt('landing.academies.verified');
  const studentsLabel = txt('landing.academies.studentsCount');
  const coursesLabel = txt('landing.academies.coursesCount');
  const viewLabel = txt('landing.academies.view');
  const academyBasePath = txt('landing.links.academyBasePath') ?? '/academy';

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] shadow-sm transition hover:-translate-y-1 hover:border-[var(--ce-accent)]/40 hover:shadow-xl">
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[var(--ce-brand)] to-[var(--ce-brand-soft)]">
        {cover ? (
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl font-extrabold text-white/20">
            {initial}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {logo && (
          <img
            src={logo}
            alt={academy.name}
            loading="lazy"
            className="absolute bottom-3 start-3 h-14 w-14 rounded-xl border-2 border-white object-cover shadow-lg transition group-hover:scale-110"
          />
        )}
        {academy.approvalStatus === 'approved' && verifiedLabel && (
          <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-1 text-xs font-bold text-white backdrop-blur">
            <BadgeCheck className="h-3.5 w-3.5" />
            {verifiedLabel}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
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

        {academy.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--ce-muted)]">
            {academy.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-[var(--ce-muted)]">
          {studentsLabel && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-[var(--ce-accent)]" />
              {academy.studentsCount} {studentsLabel}
            </span>
          )}
          {coursesLabel && (
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-[var(--ce-accent)]" />
              {academy.coursesCount} {coursesLabel}
            </span>
          )}
        </div>

        {viewLabel && (
          <Link
            to={`${academyBasePath}/${academy.slug}`}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ce-brand)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--ce-brand-soft)] sm:mt-5"
          >
            {viewLabel}
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        )}
      </div>
    </article>
  );
}

function FlipTestimonialCard({ testimonial, site, lang }) {
  const txt = (key) => siteText(site, key, lang);
  const [flipped, setFlipped] = useState(false);
  const content = testimonial.content?.[lang] ?? testimonial.content?.ar ?? '';
  const initial = testimonial.name?.charAt(0) ?? '';
  const rating = testimonial.rating ?? 5;
  const starsLabel = txt('landing.testimonials.starsLabel');
  const backLabel = txt('landing.testimonials.backButton');
  const quoteOpen = txt('landing.testimonials.quoteOpen') ?? '"';
  const quoteClose = txt('landing.testimonials.quoteClose') ?? '"';

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
        <div className="ce-flip-face flex flex-col justify-between border border-[var(--ce-border)] bg-[var(--ce-surface)] p-6 shadow-sm">
          <div>
            <Quote className="h-8 w-8 text-[var(--ce-accent)]/40" />
            <p className="mt-4 line-clamp-5 text-base leading-relaxed text-[var(--ce-text)]">
              {quoteOpen}{content}{quoteClose}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-[var(--ce-border)] pt-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--ce-brand)] to-[var(--ce-accent)] text-sm font-extrabold text-white">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-[var(--ce-primary)]">
                {testimonial.name ?? ''}
              </p>
              {testimonial.role && (
                <p className="truncate text-xs text-[var(--ce-muted)]">
                  {testimonial.role}
                </p>
              )}
            </div>
            <RotateCw className="h-4 w-4 shrink-0 text-[var(--ce-muted)]" />
          </div>
        </div>

        <div className="ce-flip-face ce-flip-back flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[var(--ce-brand)] to-[var(--ce-brand-soft)] p-6 text-center text-white shadow-lg">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <span className="text-2xl font-extrabold">{initial}</span>
          </div>
          <p className="text-lg font-extrabold">{testimonial.name ?? ''}</p>
          {testimonial.role && <p className="text-sm text-white/70">{testimonial.role}</p>}
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`h-6 w-6 ${
                  n <= rating ? 'fill-[var(--ce-accent)] text-[var(--ce-accent)]' : 'text-white/30'
                }`}
              />
            ))}
          </div>
          {starsLabel && (
            <p className="text-xs text-white/60">
              {rating} / 5 {starsLabel}
            </p>
          )}
          {backLabel && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(false);
              }}
              className="mt-3 inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur transition hover:bg-white/20"
            >
              <RotateCw className="h-3 w-3" />
              {backLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

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
          {faq.question?.[lang] ?? faq.question?.ar ?? ''}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[var(--ce-accent)] transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="ce-fade-in border-t border-[var(--ce-border)] px-5 pb-5 pt-3 leading-relaxed text-[var(--ce-muted)]">
          {faq.answer?.[lang] ?? faq.answer?.ar ?? ''}
        </div>
      )}
    </article>
  );
}

function TestimonialFormModal({ site, lang, onClose, onSubmitted }) {
  const txt = (key) => siteText(site, key, lang);

  const [form, setForm] = useState({
    name: '',
    role: '',
    content: '',
    rating: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const roleOptions = useMemo(() => {
    const arr = siteItems(site, 'landing.testimonialModal.roles');
    return arr || [];
  }, [site]);

  useEffect(() => {
    if (!form.role && roleOptions.length > 0) {
      setForm((f) => ({
        ...f,
        role:
          typeof roleOptions[0] === 'string'
            ? roleOptions[0]
            : roleOptions[0]?.label?.[lang] ?? roleOptions[0]?.label?.ar ?? '',
      }));
    }
  }, [roleOptions, lang]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.content.trim().length < 10) {
      setStatus('error');
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      // ✅ NEW — Public submission (بدون auth)
      await platformApi.submitPublicTestimonial({
        name: form.name || undefined,
        role: form.role || undefined,
        content: { ar: form.content, en: form.content },
        rating: form.rating,
      });
      setStatus('success');
      setTimeout(() => onSubmitted?.(), 1500);
    } catch (err) {
      console.error('Submit testimonial failed:', err);
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="ce-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="ce-slide-in w-full max-w-lg overflow-hidden rounded-3xl bg-[var(--ce-surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between border-b border-[var(--ce-border)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ce-accent)]/15">
              <Quote className="h-5 w-5 text-[var(--ce-accent)]" />
            </div>
            <div>
              {txt('landing.testimonialModal.title') && (
                <h3 className="font-extrabold text-[var(--ce-primary)]">
                  {txt('landing.testimonialModal.title')}
                </h3>
              )}
              {txt('landing.testimonialModal.subtitle') && (
                <p className="text-xs text-[var(--ce-muted)]">
                  {txt('landing.testimonialModal.subtitle')}
                </p>
              )}
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

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            {txt('landing.testimonialModal.successTitle') && (
              <h4 className="text-xl font-extrabold text-[var(--ce-primary)]">
                {txt('landing.testimonialModal.successTitle')}
              </h4>
            )}
            {txt('landing.testimonialModal.successMessage') && (
              <p className="text-sm text-[var(--ce-muted)]">
                {txt('landing.testimonialModal.successMessage')}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            {txt('landing.testimonialModal.nameLabel') && (
              <div>
                <label className="block text-sm font-semibold text-[var(--ce-primary)]">
                  {txt('landing.testimonialModal.nameLabel')}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] px-4 py-2.5 text-sm text-[var(--ce-text)] outline-none transition focus:border-[var(--ce-accent)] focus:ring-2 focus:ring-[var(--ce-accent)]/20"
                  placeholder={txt('landing.testimonialModal.namePlaceholder') ?? ''}
                />
              </div>
            )}

            {roleOptions.length > 0 && txt('landing.testimonialModal.roleLabel') && (
              <div>
                <label className="block text-sm font-semibold text-[var(--ce-primary)]">
                  {txt('landing.testimonialModal.roleLabel')}
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] px-4 py-2.5 text-sm text-[var(--ce-text)] outline-none transition focus:border-[var(--ce-accent)] focus:ring-2 focus:ring-[var(--ce-accent)]/20"
                >
                  {roleOptions.map((r, i) => {
                    const value =
                      typeof r === 'string'
                        ? r
                        : r?.value ?? r?.label?.[lang] ?? r?.label?.ar ?? '';
                    const label =
                      typeof r === 'string'
                        ? r
                        : r?.label?.[lang] ?? r?.label?.ar ?? r?.value ?? '';
                    return (
                      <option key={i} value={value}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {txt('landing.testimonialModal.ratingLabel') && (
              <div>
                <label className="block text-sm font-semibold text-[var(--ce-primary)]">
                  {txt('landing.testimonialModal.ratingLabel')}
                </label>
                <div className="mt-1.5 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, rating: n })}
                      className="transition hover:scale-110"
                      aria-label={`${n}`}
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
            )}

            {txt('landing.testimonialModal.contentLabel') && (
              <div>
                <label className="block text-sm font-semibold text-[var(--ce-primary)]">
                  {txt('landing.testimonialModal.contentLabel')}
                </label>
                <textarea
                  required
                  minLength={10}
                  maxLength={1000}
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="mt-1.5 w-full resize-none rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] px-4 py-2.5 text-sm text-[var(--ce-text)] outline-none transition focus:border-[var(--ce-accent)] focus:ring-2 focus:ring-[var(--ce-accent)]/20"
                  placeholder={txt('landing.testimonialModal.contentPlaceholder') ?? ''}
                />
                <p className="mt-1 text-xs text-[var(--ce-muted)]">
                  {form.content.length} / 1000
                </p>
              </div>
            )}

            {status === 'error' && txt('landing.testimonialModal.errorMessage') && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {txt('landing.testimonialModal.errorMessage')}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {txt('landing.testimonialModal.cancel') && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-full border border-[var(--ce-border)] px-4 py-2.5 text-sm font-semibold text-[var(--ce-text)] transition hover:bg-[var(--ce-bg)]"
                >
                  {txt('landing.testimonialModal.cancel')}
                </button>
              )}
              {txt('landing.testimonialModal.submit') && (
                <button
                  type="submit"
                  disabled={submitting || form.content.trim().length < 10}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--ce-accent)] px-4 py-2.5 text-sm font-bold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {txt('landing.testimonialModal.sending') ?? ''}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {txt('landing.testimonialModal.submit')}
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
