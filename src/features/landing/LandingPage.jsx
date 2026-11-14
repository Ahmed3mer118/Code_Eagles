// src/features/landing/LandingPage.jsx
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, BookOpen, BarChart3, Video, Award, Users, Code,
  MonitorSmartphone, Layers, Brain, LineChart, Shield,
  GraduationCap, Sparkles, Quote, Star, ChevronDown,
  ArrowUpRight, BadgeCheck, Plus, X, Send, RotateCw,
  CheckCircle2, AlertCircle, Play, TrendingUp, Zap, Megaphone,
  Clock, ShieldCheck, Target, ArrowRight, Calendar, Rocket,
  PlayCircle, Menu, Sun, Moon, Globe,
} from 'lucide-react';

import { platformApi } from '../../lib/platformApi';
import { useI18n } from '../../shared/i18n';
import { useTheme } from '../../shared/context/ThemeContext';
import { onLiveUpdate } from '../../shared/utils/liveUpdates';

import LandingFooter from './components/LandingFooter';
import ContactSection from './components/ContactSection';
import CodeMockup from './components/CodeMockup';
import StatPill from './components/StatPill';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const REFRESH_INTERVAL_MS = 30_000;

const FALLBACK_STATS = { students: '250+', teachers: '50k+', academies: '2M+' };

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

function formatStatValue(value, suffix) {
  const v = Number(value) || 0;
  if (v === 0) return '0';
  const s = suffix === null || suffix === undefined ? '+' : suffix;
  return `${v}${s}`;
}

export default function LandingPage() {
  const { lang, t, setLang } = useI18n();
  const { isDark, toggleTheme } = useTheme();

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
  const [mobileMenu, setMobileMenu] = useState(false);

  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

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
    return () => { mountedRef.current = false; };
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') loadData(true);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'visible') loadData(true); };
    const onFocus = () => loadData(true);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = onLiveUpdate(() => loadData(true));
    return unsubscribe;
  }, [loadData]);

  const txt = (key) => siteText(site, key, lang) || t(key);

  const filtered = search.trim()
    ? academies.filter(
        (a) =>
          a.name?.includes(search) ||
          a.ownerName?.includes(search) ||
          a.description?.includes(search),
      )
    : academies;

  const handleSubmitted = async () => {
    setShowForm(false);
    await loadData(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--ce-bg)]">
        <SimpleHeader />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--ce-accent)] border-t-transparent" />
        </div>
      </div>
    );
  }

  const registerStudentPath = txt('landing.links.registerStudent') ?? '/register?role=student';
  const registerTeacherPath = txt('landing.links.registerTeacher') ?? '/register?role=teacher';

  const heroStats = {
    students: stats?.totalStudents ? `${stats.totalStudents}+` : FALLBACK_STATS.students,
    teachers: stats?.totalTeachers ? `${stats.totalTeachers}+` : FALLBACK_STATS.teachers,
    academies: stats?.activeAcademies ? `${stats.activeAcademies}+` : FALLBACK_STATS.academies,
  };

  // Features الأربعة زي الصورة
  const features4 = [
    {
      icon: Zap,
      title: txt('landing.features.items.teachers.title') || 'Learn Smarter',
      desc: txt('landing.features.items.teachers.desc') ||
        'Structured lessons, practice exercises, and real-world projects tailored to your experience level.',
    },
    {
      icon: Calendar,
      title: txt('landing.features.items.live.title') || 'Built for Your Schedule',
      desc: txt('landing.features.items.live.desc') ||
        'Flexible, self-paced learning designed to fit around your routine. Study anywhere, anytime — and stay on track.',
    },
    {
      icon: GraduationCap,
      title: txt('landing.features.items.recorded.title') || 'Learn from the Best',
      desc: txt('landing.features.items.recorded.desc') ||
        'Courses created by industry professionals with years of hands-on experience, so you\'re always learning the most relevant, practical skills.',
    },
    {
      icon: ShieldCheck,
      title: txt('landing.features.items.quizzes.title') || 'Production-First Reviews',
      desc: txt('landing.features.items.quizzes.desc') ||
        'Master code review, debugging, testing, and best practices as part of every course, with feedback from real production engineers.',
    },
  ];

  // كروت الكورسات (6) — من academies
  const courseCards = filtered.slice(0, 6);

  return (
    <div className="min-h-screen bg-[var(--ce-bg)]">
      {/* ============================================================
          HEADER
         ============================================================ */}
      <header className="sticky top-0 z-50 border-b border-[var(--ce-border)] bg-[var(--ce-bg)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/images/LOGO.png"
              alt="Code Eagles"
              className="h-9 w-9 rounded-xl object-contain"
            />
            <div className="hidden sm:block">
              <div className="text-sm font-extrabold tracking-tight text-[var(--ce-text)]">
                CODE EAGLES
              </div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--ce-accent)]">
                Academy
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[var(--ce-text)] lg:flex">
            <a href="#features" className="transition hover:text-[var(--ce-accent)]">
              {t('landing.nav.features') || 'Courses'}
            </a>
            <a href="#academies" className="transition hover:text-[var(--ce-accent)]">
              {t('landing.nav.academies') || 'Academies'}
            </a>
            <a href="#pricing" className="transition hover:text-[var(--ce-accent)]">
              {t('landing.nav.pricing') || 'Pricing'}
            </a>
            <Link to="/contact" className="transition hover:text-[var(--ce-accent)]">
              {t('landing.nav.contact') || 'About'}
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)] text-[var(--ce-text)] transition hover:border-[var(--ce-accent)] hover:text-[var(--ce-accent)] sm:flex"
              aria-label="Toggle language"
            >
              <Globe className="h-4 w-4" />
            </button>
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)] text-[var(--ce-text)] transition hover:border-[var(--ce-accent)] hover:text-[var(--ce-accent)]"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              to="/auth/login"
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-[var(--ce-text)] transition hover:text-[var(--ce-accent)] sm:block"
            >
              {t('landing.nav.login') || 'Sign In'}
            </Link>
            <Link
              to={registerTeacherPath}
              className="rounded-full bg-[var(--ce-accent)] px-4 py-2 text-sm font-bold text-[#0a0f1a] shadow-sm transition hover:brightness-110"
            >
              {t('landing.nav.register') || 'Get Started'}
            </Link>
            <button
              onClick={() => setMobileMenu((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--ce-border)] lg:hidden"
              aria-label="Menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="border-t border-[var(--ce-border)] bg-[var(--ce-surface)] px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-3 text-sm font-semibold">
              <a href="#features" onClick={() => setMobileMenu(false)}>Courses</a>
              <a href="#academies" onClick={() => setMobileMenu(false)}>Academies</a>
              <a href="#pricing" onClick={() => setMobileMenu(false)}>Pricing</a>
              <Link to="/contact" onClick={() => setMobileMenu(false)}>Contact</Link>
            </div>
          </div>
        )}
      </header>

      {emergency?.enabled && (
        <div className="relative z-30 bg-gradient-to-r from-red-600 to-red-500 px-4 py-2.5 text-center text-sm font-bold text-white shadow-lg">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
            <Megaphone className="h-4 w-4 shrink-0" />
            <span>
              {emergency.message?.[lang] ?? emergency.message?.ar ?? emergency.message?.en ?? ''}
            </span>
          </div>
        </div>
      )}

      {/* ============================================================
          HERO
         ============================================================ */}
      <section className="relative overflow-hidden bg-[#0a0f1a] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -start-[10%] -top-[10%] h-[400px] w-[400px] rounded-full bg-[var(--ce-accent)] opacity-15 blur-[130px]" />
          <div className="absolute -bottom-[20%] -end-[10%] h-[350px] w-[350px] rounded-full bg-amber-600 opacity-10 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:py-20 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/70 backdrop-blur">
                <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--ce-accent)]" />
                {txt('landing.hero.badge') || 'Master Modern Code'}
              </div>

              <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-[3.75rem]">
                {txt('landing.hero.title') ? (
                  txt('landing.hero.title')
                ) : (
                  <>
                    Master Modern Code That{' '}
                    <span className="text-[var(--ce-accent)]">Moves You Forward</span>
                  </>
                )}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
                {txt('landing.hero.subtitle') ||
                  'Master in-demand software skills with structured guidance, hands-on projects, and career-focused learning to help you advance your tech career.'}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={registerStudentPath}
                  className="group inline-flex items-center gap-2 rounded-full bg-[var(--ce-accent)] px-6 py-3 text-sm font-bold text-[#0a0f1a] transition hover:brightness-110"
                >
                  {txt('landing.hero.startLearning') || 'Start Learning Today'}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#courses"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <PlayCircle className="h-4 w-4" />
                  {txt('landing.hero.exploreAcademies') || 'Explore Courses'}
                </a>
              </div>

              <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
                <StatPill variant="hero" value={heroStats.students} label={txt('landing.hero.students') || 'Students Enrolled'} />
                <StatPill variant="hero" value={heroStats.teachers} label={txt('landing.hero.teachers') || 'Courses Available'} />
                <StatPill variant="hero" value={heroStats.academies} label={txt('landing.hero.academiesCount') || 'Projects Completed'} />
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <CodeMockup variant="hero" />
                <div className="absolute -start-4 -top-4 hidden xl:flex items-center gap-2 rounded-xl border border-white/10 bg-[#0f172a]/95 px-3 py-2 shadow-2xl backdrop-blur">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white">
                      {txt('landing.hero.badge1') || 'Real-world Projects'}
                    </p>
                    <p className="text-[9px] text-white/50">
                      {txt('landing.hero.badge1sub') || 'Build production apps'}
                    </p>
                  </div>
                </div>
                <div className="absolute -end-4 -bottom-4 hidden xl:flex items-center gap-2 rounded-xl border border-white/10 bg-[#0f172a]/95 px-3 py-2 shadow-2xl backdrop-blur">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--ce-accent)]/20">
                    <Zap className="h-3.5 w-3.5 text-[var(--ce-accent)]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white">
                      {txt('landing.hero.badge2') || 'Lifetime Access'}
                    </p>
                    <p className="text-[9px] text-white/50">
                      {txt('landing.hero.badge2sub') || 'Learn at your pace'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SEARCH BAR
         ============================================================ */}
      <section className="relative z-20 -mt-6 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-3 shadow-xl">
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2 sm:flex-row">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ce-muted)]" />
                <input
                  type="search"
                  placeholder={txt('landing.hero.searchPlaceholder') || 'Search courses, academies, or topics...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] px-4 py-3 ps-11 text-sm text-[var(--ce-text)] outline-none transition focus:border-[var(--ce-accent)]"
                />
              </label>
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-[var(--ce-accent)] px-6 py-3 text-sm font-bold text-[#0a0f1a] transition hover:brightness-110"
              >
                {txt('landing.hero.search') || 'Search'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURES (4 cards)
         ============================================================ */}
      <section id="features" className="bg-[var(--ce-bg)] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold text-[var(--ce-text)] sm:text-4xl">
              {txt('landing.features.title') || 'Smart Learning, Real Results'}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)]">
              {txt('landing.features.subtitle') ||
                'We make coding education simple and impactful — step-by-step guidance, expert support, and practical projects that prepare you for real-world success.'}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features4.map(({ icon: Icon, title, desc }, i) => (
              <article
                key={i}
                className="group relative rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-6 transition hover:-translate-y-1 hover:border-[var(--ce-accent)]/40"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--ce-accent)]/15 text-[var(--ce-accent)] transition group-hover:bg-[var(--ce-accent)] group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-extrabold text-[var(--ce-text)]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ce-muted)]">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          DASHBOARD PREVIEW
         ============================================================ */}
      <section className="bg-[var(--ce-surface)] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Dashboard mockup */}
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)] shadow-xl">
                <div className="flex items-center justify-between border-b border-[var(--ce-border)] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--ce-accent)]">
                      <Zap className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-xs font-extrabold text-[var(--ce-text)]">
                      {txt('landing.dashboard.title') || 'Learning Dashboard'}
                    </span>
                  </div>
                  <div className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    ● Live
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-4">
                  {[
                    { label: 'Streak', value: '12d' },
                    { label: 'XP', value: '2,847' },
                    { label: 'Rank', value: '#48' },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--ce-muted)]">{label}</div>
                      <div className="mt-1 text-lg font-extrabold text-[var(--ce-text)]">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 px-4 pb-4">
                  {[
                    { name: 'React Fundamentals', progress: 82 },
                    { name: 'Node.js & APIs', progress: 64 },
                    { name: 'TypeScript Deep Dive', progress: 41 },
                  ].map(({ name, progress }) => (
                    <div key={name}>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[var(--ce-text)]">{name}</span>
                        <span className="font-bold text-[var(--ce-accent)]">{progress}%</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--ce-border)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--ce-accent)] to-[var(--ce-accent-soft)]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <h2 className="text-3xl font-extrabold leading-tight text-[var(--ce-text)] sm:text-4xl">
                {txt('landing.dashboard.title2') || 'Built to Keep You Going'}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--ce-muted)]">
                {txt('landing.dashboard.subtitle') ||
                  'Every course is designed to keep you motivated, focused, and progressing toward your goal. From hands-on practice and real-world challenges to expert feedback — everything you need is here.'}
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  txt('landing.dashboard.bullet1') || 'Smart Daily Coding Streaks & Milestones',
                  txt('landing.dashboard.bullet2') || 'Gamified XP & Skill Progress Tracking',
                  txt('landing.dashboard.bullet3') || 'Hands-On Practice, Not Passive Watching',
                  txt('landing.dashboard.bullet4') || 'Real-World Learning Through Structured Projects',
                  txt('landing.dashboard.bullet5') || 'Verifiable Completion & Skill Verification',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm font-semibold text-[var(--ce-text)]">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={registerStudentPath}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--ce-accent)] px-6 py-3 text-sm font-bold text-[#0a0f1a] transition hover:brightness-110"
              >
                <PlayCircle className="h-4 w-4" />
                {txt('landing.hero.startLearning') || 'Start Learning Now'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CODE REVIEW
         ============================================================ */}
      <section className="bg-[var(--ce-bg)] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--ce-accent)]/30 bg-[var(--ce-accent)]/10 px-3 py-1 text-xs font-bold text-[var(--ce-accent)]">
                <Code className="h-3.5 w-3.5" />
                {txt('landing.codeReview.badge') || 'Code Review'}
              </span>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight text-[var(--ce-text)] sm:text-4xl">
                {txt('landing.codeReview.title') || 'Direct Mentoring, No Guesswork'}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--ce-muted)]">
                {txt('landing.codeReview.subtitle') ||
                  "At Code Eagles, you don't wrestle through endless generic docs. Our expert mentors guide you line by line, helping you understand not just what to write, but why it works and how to debug it properly."}
              </p>
              <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)]">
                {txt('landing.codeReview.subtitle2') ||
                  "Whether you're preparing for complex backend projects or a live production deployment, our senior advisors ensure your code conforms to industry standards and scalable architecture."}
              </p>
              <Link
                to="/contact"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--ce-accent)] px-6 py-3 text-sm font-bold text-[#0a0f1a] transition hover:brightness-110"
              >
                {txt('landing.codeReview.cta') || 'Get Code Review'}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[var(--ce-border)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ce-accent)]/15 text-xs font-bold text-[var(--ce-accent)]">
                    L
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[var(--ce-text)]">
                      {txt('landing.codeReview.reviewerName') || 'LiamCodeReviewer'}
                    </p>
                    <p className="text-[10px] text-[var(--ce-muted)]">
                      {txt('landing.codeReview.reviewerRole') || 'Senior Engineer'}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ Verified
                </span>
              </div>

              <div className="mt-3 rounded-xl bg-[#0a0f1a] p-3 font-mono text-[11px] leading-relaxed" dir="ltr">
                <div className="text-[#c3e88d]">"implementation looks clean, but remember..."</div>
                <div className="mt-2 text-white/70">
                  <span className="text-[#f07178]">if</span> (amount &lt;= balance) {'{'}
                </div>
                <div className="text-white/70">
                  &nbsp;&nbsp;transfer.<span className="text-[#82aaff]">execute</span>(amount);
                </div>
                <div className="text-white/70">{'}'}</div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-[var(--ce-border)] bg-[var(--ce-bg)] p-2.5 text-center">
                  <div className="text-xs font-extrabold text-[var(--ce-text)]">+ 3 AI Reviews</div>
                </div>
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5 text-center">
                  <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Built-in Linter</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          COURSES GRID
         ============================================================ */}
      <section id="courses" className="bg-[var(--ce-surface)] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--ce-accent)]/30 bg-[var(--ce-accent)]/10 px-3 py-1 text-xs font-bold text-[var(--ce-accent)]">
              <Star className="h-3.5 w-3.5" />
              {txt('landing.courses.badge') || 'Popular Courses'}
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-[var(--ce-text)] sm:text-4xl">
              {txt('landing.courses.title') || "This Month's Most-Loved Courses"}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)]">
              {txt('landing.courses.subtitle') ||
                "Trusted by developers — take a look at what's inspiring attention and delivering the highest learner satisfaction."}
            </p>
          </div>

          {courseCards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--ce-border)] bg-[var(--ce-bg)] py-16 text-center text-[var(--ce-muted)]">
              {txt('landing.academies.empty') || 'No courses available'}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {courseCards.map((a) => (
                <CourseCard key={a.id} academy={a} />
              ))}
            </div>
          )}

          {filtered.length > 6 && (
            <div className="mt-10 text-center">
              <a
                href="#academies"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--ce-border)] bg-[var(--ce-bg)] px-6 py-3 text-sm font-bold text-[var(--ce-text)] transition hover:border-[var(--ce-accent)] hover:text-[var(--ce-accent)]"
              >
                {txt('landing.courses.viewAll') || 'View All Courses'}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          ACADEMIES (كل الأكاديميات)
         ============================================================ */}
      {filtered.length > 0 && (
        <section id="academies" className="bg-[var(--ce-bg)] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold text-[var(--ce-text)] sm:text-4xl">
                {txt('landing.academies.title') || 'All Academies'}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)]">
                {txt('landing.academies.subtitle') || 'Explore verified academies led by expert teachers.'}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {filtered.map((a) => (
                <AcademyCardItem key={a.id} academy={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          TESTIMONIALS
         ============================================================ */}
      {testimonials.length > 0 && (
        <section className="bg-[var(--ce-surface)] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold text-[var(--ce-text)] sm:text-4xl">
                {txt('landing.testimonials.title') || 'Stories from Code Eagles Learners'}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)]">
                {txt('landing.testimonials.subtitle') || 'Thousands of learners share what Code Eagles meant for their growth.'}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 3).map((ts) => (
                <TestimonialCard key={ts.id} testimonial={ts} />
              ))}
            </div>

            {txt('landing.testimonials.addButton') && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--ce-border)] bg-[var(--ce-bg)] px-5 py-2.5 text-sm font-bold text-[var(--ce-text)] transition hover:border-[var(--ce-accent)] hover:text-[var(--ce-accent)]"
                >
                  <Plus className="h-4 w-4" />
                  {txt('landing.testimonials.addButton')}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============================================================
          CTA BANNER
         ============================================================ */}
      <section className="bg-[var(--ce-bg)] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="overflow-hidden rounded-3xl bg-[#0a0f1a] text-white">
            <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--ce-accent)]">
                  <Sparkles className="h-3 w-3" />
                  {txt('landing.cta.badge') || 'Learn from the Best'}
                </span>
                <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
                  {txt('landing.cta.title') || 'Ready to Grow with Code Eagles?'}
                </h2>
                <p className="mt-3 max-w-lg text-white/70">
                  {txt('landing.cta.subtitle') ||
                    'Join 50,000+ learners taking their software craft. Master core skills and follow a modern learning path.'}
                </p>
                <Link
                  to={registerStudentPath}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--ce-accent)] px-6 py-3 text-sm font-bold text-[#0a0f1a] transition hover:brightness-110"
                >
                  {txt('landing.cta.button') || 'Explore Courses'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="hidden lg:block">
                <CodeMockup variant="cta" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="bg-[var(--ce-surface)] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold text-[var(--ce-text)] sm:text-4xl">
                {txt('landing.faq.title') || 'Frequently Asked Questions'}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)]">
                {txt('landing.faq.subtitle') || 'Answers for students, parents, and teachers.'}
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

function SimpleHeader() {
  return (
    <header className="border-b border-[var(--ce-border)] bg-[var(--ce-bg)] px-4 py-3.5">
      <div className="mx-auto flex max-w-7xl items-center gap-2.5">
        <img src="/images/LOGO.png" alt="" className="h-9 w-9 rounded-xl object-contain" />
        <div className="text-sm font-extrabold text-[var(--ce-text)]">CODE EAGLES</div>
      </div>
    </header>
  );
}

function CourseCard({ academy }) {
  const cover = resolveImage(academy.coverUrl);
  const logo = resolveImage(academy.logoUrl);

  // badge حسب الـ id (نوع عشوائي بس ثابت)
  const badges = [
    { label: 'Beginner', color: 'amber' },
    { label: 'Intermediate', color: 'sky' },
    { label: 'Advanced', color: 'emerald' },
    { label: 'Beginner', color: 'rose' },
    { label: 'Intermediate', color: 'violet' },
    { label: 'Advanced', color: 'orange' },
  ];
  const badge = badges[(academy.id?.length || 0) % badges.length];

  const badgeColors = {
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    sky: 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400',
    emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    rose: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400',
    violet: 'border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400',
    orange: 'border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400',
  };

  return (
    <Link
      to={`/academy/${academy.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)] transition hover:-translate-y-1 hover:border-[var(--ce-accent)]/40 hover:shadow-xl"
    >
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-[#0a0f1a] to-[#1a2332]">
        {cover ? (
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-extrabold text-white/10">
            {academy.name?.charAt(0) || '?'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className={`absolute start-3 top-3 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${badgeColors[badge.color]}`}>
          {badge.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 text-base font-extrabold text-[var(--ce-text)]">
          {academy.name}
        </h3>
        {academy.ownerName && (
          <p className="mt-1 line-clamp-1 text-xs text-[var(--ce-muted)]">
            by {academy.ownerName}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--ce-muted)]">
          <Star className="h-3 w-3 fill-[var(--ce-accent)] text-[var(--ce-accent)]" />
          <span className="font-bold text-[var(--ce-text)]">4.9</span>
          <span>·</span>
          <Users className="h-3 w-3" />
          <span>{academy.studentsCount || 0}</span>
          <span>·</span>
          <BookOpen className="h-3 w-3" />
          <span>{academy.coursesCount || 0} lessons</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div>
            <div className="text-lg font-extrabold text-[var(--ce-accent)]">
              {academy.price ? `$${academy.price}` : 'Free'}
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--ce-accent)] px-3 py-1.5 text-[11px] font-bold text-[#0a0f1a]">
            Enroll
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function AcademyCardItem({ academy }) {
  const cover = resolveImage(academy.coverUrl);
  const logo = resolveImage(academy.logoUrl);

  return (
    <Link
      to={`/academy/${academy.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] transition hover:-translate-y-1 hover:border-[var(--ce-accent)]/40 hover:shadow-xl"
    >
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#0a0f1a] to-[#1a2332]">
        {cover ? (
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl font-extrabold text-white/10">
            {academy.name?.charAt(0) || '?'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {logo && (
          <img
            src={logo}
            alt={academy.name}
            className="absolute bottom-3 start-3 h-12 w-12 rounded-xl border-2 border-white object-cover"
          />
        )}
        {academy.approvalStatus === 'approved' && (
          <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
            <BadgeCheck className="h-3 w-3" />
            Verified
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate text-base font-extrabold text-[var(--ce-text)]">{academy.name}</h3>
        {academy.ownerName && (
          <p className="mt-1 truncate text-xs text-[var(--ce-muted)]">{academy.ownerName}</p>
        )}
        {academy.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--ce-muted)]">
            {academy.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3 text-[11px] text-[var(--ce-muted)]">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3 text-[var(--ce-accent)]" />
            {academy.studentsCount || 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-[var(--ce-accent)]" />
            {academy.coursesCount || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}

function TestimonialCard({ testimonial }) {
  const rating = testimonial.rating ?? 5;
  return (
    <article className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)] p-6">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`h-4 w-4 ${
              n <= rating ? 'fill-[var(--ce-accent)] text-[var(--ce-accent)]' : 'text-[var(--ce-border)]'
            }`}
          />
        ))}
      </div>
      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-[var(--ce-text)]">
        "{testimonial.content?.en || testimonial.content?.ar || ''}"
      </p>
      <div className="mt-5 flex items-center gap-3 border-t border-[var(--ce-border)] pt-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--ce-accent)] to-amber-600 text-sm font-extrabold text-[#0a0f1a]">
          {testimonial.name?.charAt(0) || '?'}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-[var(--ce-text)]">
            {testimonial.name || 'Anonymous'}
          </p>
          {testimonial.role && (
            <p className="truncate text-[11px] text-[var(--ce-muted)]">{testimonial.role}</p>
          )}
        </div>
      </div>
    </article>
  );
}

function FaqItem({ faq, lang }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
      >
        <span className="font-bold text-[var(--ce-text)]">
          {faq.question?.[lang] ?? faq.question?.ar ?? ''}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[var(--ce-accent)] transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="border-t border-[var(--ce-border)] px-5 pb-5 pt-3 text-sm leading-relaxed text-[var(--ce-muted)]">
          {faq.answer?.[lang] ?? faq.answer?.ar ?? ''}
        </div>
      )}
    </article>
  );
}

function TestimonialFormModal({ site, lang, onClose, onSubmitted }) {
  const txt = (key) => siteText(site, key, lang) || '';
  const [form, setForm] = useState({ name: '', role: '', content: '', rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.content.trim().length < 10) {
      setStatus('error');
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      await platformApi.submitPublicTestimonial({
        name: form.name || undefined,
        role: form.role || undefined,
        content: { ar: form.content, en: form.content },
        rating: form.rating,
      });
      setStatus('success');
      setTimeout(() => onSubmitted?.(), 1500);
    } catch (err) {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-[var(--ce-surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between border-b border-[var(--ce-border)] px-5 py-4">
          <h3 className="font-extrabold text-[var(--ce-text)]">Share Your Story</h3>
          <button onClick={onClose} className="text-[var(--ce-muted)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <h4 className="text-lg font-extrabold text-[var(--ce-text)]">Thank you!</h4>
            <p className="text-sm text-[var(--ce-muted)]">Your testimonial is pending review.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 px-5 py-5">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              className="w-full rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] px-4 py-2.5 text-sm outline-none focus:border-[var(--ce-accent)]"
            />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, rating: n })}
                  className="transition hover:scale-110"
                >
                  <Star
                    className={`h-7 w-7 ${
                      n <= form.rating
                        ? 'fill-[var(--ce-accent)] text-[var(--ce-accent)]'
                        : 'text-[var(--ce-border)]'
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              required
              minLength={10}
              maxLength={1000}
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Tell us your story..."
              className="w-full resize-none rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] px-4 py-2.5 text-sm outline-none focus:border-[var(--ce-accent)]"
            />
            {status === 'error' && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                Please write at least 10 characters
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-[var(--ce-border)] py-2.5 text-sm font-semibold text-[var(--ce-text)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || form.content.trim().length < 10}
                className="flex-1 rounded-full bg-[var(--ce-accent)] py-2.5 text-sm font-bold text-[#0a0f1a] disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}