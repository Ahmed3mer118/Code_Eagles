import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Moon, Sun, Menu, BookOpen, BarChart3, Video, Award,
  Users, Code, MonitorSmartphone, Layers, Brain, LineChart,
  Shield, GraduationCap, Sparkles, Quote, Star, ChevronDown,
  ChevronLeft, ChevronRight, ArrowUpRight, Facebook, Instagram,
  Youtube, Mail, Send, BadgeCheck,
} from 'lucide-react';
import { platformApi } from '../../lib/platformApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function resolveImage(url) {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
}

// ============================================================
// Categories (static - design only)
// ============================================================
const CATEGORIES = [
  { icon: Code,                title: 'برمجة',           desc: 'أساسيات هندسة البرمجيات والبرمجة' },
  { icon: MonitorSmartphone,   title: 'واجهات أمامية',  desc: 'تطوير واجهات حديثة وReact' },
  { icon: Layers,              title: 'واجهات خلفية',   desc: 'واجهات برمجية وقواعد بيانات' },
  { icon: Brain,               title: 'ذكاء اصطناعي',   desc: 'تعلم آلي وأدوات ذكية' },
  { icon: LineChart,           title: 'علم البيانات',   desc: 'تحليلات وبيانات وسير عمل Python' },
  { icon: Shield,              title: 'أمن سيبراني',    desc: 'أساسيات الأمان والحماية' },
  { icon: BookOpen,            title: 'أولى ثانوي',     desc: 'منهج أولى ثانوي' },
  { icon: GraduationCap,       title: 'ثانية ثانوي',    desc: 'تحضير ثانية ثانوي' },
  { icon: Award,               title: 'ثالثة ثانوي',    desc: 'تحضير ثالثة ثانوي والجامعة' },
];

const FEATURES = [
  { icon: Users,             title: 'مدرسون خبراء',    desc: 'تعلم من مدربين موثقين بسجل نتائج مثبت.' },
  { icon: Video,             title: 'حصص مباشرة',      desc: 'انضم لجدول حصص مع تفاعل مباشر مع المدرس.' },
  { icon: BookOpen,          title: 'محاضرات مسجلة',   desc: 'شاهد الدروس في أي وقت مع متابعة التقدم.' },
  { icon: BarChart3,         title: 'اختبارات',         desc: 'تدرّب عبر امتحانات تعزز نواتج التعلم.' },
  { icon: Award,             title: 'شهادات',           desc: 'احتفل بالإنجازات والمحطات المهمة.' },
  { icon: Users,             title: 'لوحة ولي الأمر',  desc: 'يتابع الأولياء التقدم والحضور والنتائج.' },
  { icon: MonitorSmartphone, title: 'متوافق مع الجوال', desc: 'تجربة سريعة ومناسبة للمس على الهاتف.' },
  { icon: Sparkles,          title: 'أدوات تعلم ذكية', desc: 'دعم ذكي للمراجعة والملاحظات ومسارات الدراسة.' },
];

// ============================================================
// Main
// ============================================================
export default function LandingPage() {
  const [academies, setAcademies] = useState([]);
  const [stats, setStats] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });
  const [lang, setLang] = useState('ar');
  const [mobileMenu, setMobileMenu] = useState(false);

  // Load data
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
        setAcademies(ac);
        setStats(st);
        setFaqs(fq);
        setTestimonials(ts);
      } catch (err) {
        console.error('Landing load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('ce-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const filtered = search.trim()
    ? academies.filter(
        (a) =>
          a.name?.includes(search) ||
          a.ownerName?.includes(search) ||
          a.description?.includes(search),
      )
    : academies;

  return (
    <div className="min-h-screen pb-20 lg:pb-0" dir="rtl">
      {/* ============================================================
          HEADER
         ============================================================ */}
      <header className="sticky top-0 z-50 border-b border-[var(--ce-border)] bg-[var(--ce-surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src="/images/LOGO.png"
              alt="Code Eagles"
              className="h-11 w-11 shrink-0 rounded-2xl object-contain"
              width="44"
              height="44"
            />
            <div className="hidden min-w-0 lg:block">
              <div className="truncate text-lg font-extrabold tracking-tight text-[var(--ce-text)]">
                Code Eagles
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--ce-text)] lg:flex">
            <a href="#features" className="hover:text-[var(--ce-accent)]">المميزات</a>
            <a href="#academies" className="hover:text-[var(--ce-accent)]">الأكاديميات</a>
            <a href="#categories" className="hover:text-[var(--ce-accent)]">التخصصات</a>
            <Link to="/contact" className="hover:text-[var(--ce-accent)]">تواصل معنا</Link>
          </nav>

          {/* Right actions */}
          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={() => setDark((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)] text-[var(--ce-text)] transition hover:bg-[var(--ce-accent)] hover:text-white"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="inline-flex items-center rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)] p-1 text-sm">
              <button
                type="button"
                onClick={() => setLang('ar')}
                className={`rounded-full px-3 py-1 font-semibold transition ${
                  lang === 'ar' ? 'bg-[var(--ce-brand)] text-white' : 'text-[var(--ce-muted)]'
                }`}
              >ع</button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`rounded-full px-3 py-1 font-semibold transition ${
                  lang === 'en' ? 'bg-[var(--ce-brand)] text-white' : 'text-[var(--ce-muted)]'
                }`}
              >EN</button>
            </div>

            <Link
              to="/auth/login"
              className="rounded-full border border-[var(--ce-border)] px-4 py-2 text-sm font-semibold text-[var(--ce-text)] transition hover:bg-[var(--ce-surface)]"
            >
              تسجيل الدخول
            </Link>
            <Link
              to="/auth/register"
              className="rounded-full bg-[var(--ce-accent)] px-4 py-2 text-sm font-bold text-white shadow-md transition hover:opacity-90"
            >
              إنشاء حساب
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenu((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ce-border)] lg:hidden"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-[var(--ce-border)] bg-[var(--ce-surface)] lg:hidden">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          <Link to="/" className="rounded-xl px-2 py-2 text-center text-[11px] font-bold">الرئيسية</Link>
          <a href="#academies" className="rounded-xl px-2 py-2 text-center text-[11px] font-bold">الأكاديميات</a>
          <Link to="/contact" className="rounded-xl px-2 py-2 text-center text-[11px] font-bold">تواصل معنا</Link>
          <Link to="/auth/login" className="rounded-xl px-2 py-2 text-center text-[11px] font-bold">تسجيل الدخول</Link>
        </div>
      </nav>

      {/* ============================================================
          HERO
         ============================================================ */}
      <section className="relative overflow-hidden bg-[var(--ce-brand)] pb-12 pt-6 text-white sm:pt-10">
        {/* Dots pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Blur orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -start-[10%] -top-[5%] h-80 w-80 rounded-full bg-[var(--ce-accent)] blur-[130px] opacity-30" />
          <div className="absolute -bottom-[10%] -end-[5%] h-72 w-72 rounded-full bg-sky-500 blur-[120px] opacity-30" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:py-10">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Left side */}
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/images/LOGO.png"
                  alt="Code Eagles"
                  className="h-14 w-14 rounded-2xl bg-white/10 p-1.5 object-contain shadow-lg"
                />
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-[var(--ce-accent-soft)]">
                  Code Eagles
                </span>
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.15] sm:text-5xl lg:text-[3.4rem]">
                تعلّم البرمجة والتعليم الثانوي مع أكاديميات موثوقة
              </h1>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/auth/register?role=student"
                  className="rounded-full bg-[var(--ce-accent)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--ce-accent)]/25 transition hover:opacity-90"
                >
                  ابدأ التعلم
                </Link>
                <a
                  href="#academies"
                  className="rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
                >
                  استكشف الأكاديميات
                </a>
              </div>

              {/* Search */}
              <div className="mt-8 max-w-xl">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="flex w-full flex-col gap-2 sm:flex-row"
                >
                  <label className="relative flex-1">
                    <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/55" />
                    <input
                      type="search"
                      placeholder="ابحث عن أكاديميات أو مدرسين أو مواد..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-3.5 ps-12 text-white placeholder-white/55 outline-none backdrop-blur focus:border-[var(--ce-accent)]"
                    />
                  </label>
                  <button
                    type="submit"
                    className="shrink-0 rounded-full bg-[var(--ce-accent)] px-6 py-3 text-sm font-bold text-white"
                  >
                    بحث...
                  </button>
                </form>
              </div>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <HeroStat value={stats?.totalStudents ?? 0} label="طلاب" />
                <HeroStat value={stats?.totalTeachers ?? 0} label="مدرسون" />
                <HeroStat value={stats?.activeAcademies ?? 0} label="أكاديميات" />
              </div>
            </div>

            {/* Right side — feature showcase */}
            <div className="hidden lg:block">
              <div className="relative mx-auto w-full max-w-lg">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[var(--ce-accent)]/20 to-[var(--ce-primary)]/10 blur-2xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[var(--ce-brand)] to-[var(--ce-brand-soft)] p-6 shadow-2xl">
                  <div className="flex flex-col gap-3">
                    {[
                      { icon: BookOpen, label: 'الدورات والمحاضرات' },
                      { icon: BarChart3, label: 'الاختبارات والتقييم' },
                      { icon: Video, label: 'الحصص المباشرة' },
                      { icon: Award, label: 'الشهادات والإنجازات' },
                    ].map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                          <Icon className="h-5 w-5 text-[var(--ce-accent-soft)]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-white">{label}</p>
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
      <section className="bg-[var(--ce-bg)] py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)] px-3 py-1 text-xs font-bold text-[var(--ce-accent)]">
              موثوق من
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
              منصة مبنية للتميز التعليمي
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)] sm:text-lg">
              أكاديميات ومدرسون رائدون يستخدمون Code Eagles لتقديم تجربة تعليم منظمة.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatBox value={stats?.activeAcademies ?? 0} label="أكاديميات نشطة" />
            <StatBox value={stats?.totalStudents ?? 0} label="طلاب مسجلون" />
            <StatBox value={stats?.totalCourses ?? 0} label="دورات منشورة" />
            <StatBox value={stats?.totalQuizAttempts ?? 0} label="اختبارات مكتملة" />
          </div>
        </div>
      </section>

      {/* ============================================================
          ACADEMIES
         ============================================================ */}
      <section id="academies" className="bg-[var(--ce-surface)] py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)] px-3 py-1 text-xs font-bold text-[var(--ce-accent)]">
              اكتشف
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
              أكاديميات مميزة
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)] sm:text-lg">
              استكشف أكاديميات موثقة يقودها مدرسون خبراء في البرمجة والتعليم الثانوي.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-14">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--ce-accent)] border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] py-14 text-center text-[var(--ce-muted)]">
              لا توجد أكاديميات متاحة
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {filtered.map((a) => (
                <AcademyCardItem key={a.id} academy={a} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          CATEGORIES
         ============================================================ */}
      <section id="categories" className="bg-[var(--ce-bg)] py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)] px-3 py-1 text-xs font-bold text-[var(--ce-accent)]">
              استكشف
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
              تصفح حسب التخصص
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)] sm:text-lg">
              اعثر على المسار المناسب للبرمجة أو التحضير للثانوية العامة.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map(({ icon: Icon, title, desc }, i) => (
              <button
                key={title}
                type="button"
                className={`flex flex-col items-start gap-3 rounded-2xl border bg-[var(--ce-surface)] p-5 text-start shadow-sm transition hover:shadow-md ${
                  i === 0
                    ? 'border-[var(--ce-accent)] ring-2 ring-[var(--ce-accent)]'
                    : 'border-[var(--ce-border)]'
                }`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ce-accent)]/15 text-[var(--ce-accent)]">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-extrabold text-[var(--ce-primary)]">{title}</h3>
                  <p className="mt-1 text-sm text-[var(--ce-muted)]">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURES
         ============================================================ */}
      <section id="features" className="bg-[var(--ce-surface)] py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)] px-3 py-1 text-xs font-bold text-[var(--ce-accent)]">
              لماذا Code Eagles
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
              لماذا Code Eagles
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)] sm:text-lg">
              كل ما تحتاجه للتعليم والتعلم والنمو — بثقة وتجربة عصرية.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <article
                key={title}
                className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-5 shadow-sm transition hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ce-accent)]/15 text-[var(--ce-accent)]">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-extrabold text-[var(--ce-primary)]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ce-muted)]">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          TESTIMONIALS
         ============================================================ */}
      {testimonials.length > 0 && (
        <section className="bg-[var(--ce-bg)] py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <span className="inline-flex items-center rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)] px-3 py-1 text-xs font-bold text-[var(--ce-accent)]">
                قصص نجاح
              </span>
              <h2 className="mt-3 text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
                نجاح الطلاب
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)] sm:text-lg">
                رحلات حقيقية لطلاب حسّنوا درجاتهم ومهاراتهم وثقتهم.
              </p>
            </div>

            <div className="relative mx-auto max-w-4xl">
              <article className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-8 shadow-sm sm:p-10">
                <Quote className="h-10 w-10 text-[var(--ce-accent)]/40" />
                <p className="mt-4 text-lg leading-relaxed text-[var(--ce-text)] sm:text-xl">
                  "{testimonials[0]?.content?.ar ?? 'استطاع ولي أمري متابعة تقدمي، وملاحظات المدرس حافظت على التزامي أسبوعيًا.'}"
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--ce-brand)] to-[var(--ce-accent)] text-lg font-extrabold text-white">
                      {testimonials[0]?.name?.charAt(0) ?? 'ع'}
                    </div>
                    <div>
                      <p className="font-extrabold text-[var(--ce-primary)]">
                        {testimonials[0]?.name ?? 'عمر خالد'}
                      </p>
                      <p className="text-sm text-[var(--ce-muted)]">
                        {testimonials[0]?.role ?? 'Code Eagles Academy'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[var(--ce-accent)]">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
              </article>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)]">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex gap-2">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`h-2.5 rounded-full transition-all ${
                        n === 3 ? 'w-8 bg-[var(--ce-accent)]' : 'w-2.5 bg-[var(--ce-border)]'
                      }`}
                    />
                  ))}
                </div>
                <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)]">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          IMPACT
         ============================================================ */}
      <section className="bg-[var(--ce-surface)] py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
              أثر المنصة
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)] sm:text-lg">
              أرقام تعكس التعلم النشط عبر أكاديميات Code Eagles.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <ImpactBox value={stats?.totalStudents ?? 0} label="طلاب" />
            <ImpactBox value={stats?.activeAcademies ?? 0} label="أكاديميات" />
            <ImpactBox value={stats?.totalTeachers ?? 0} label="مدرسون" />
            <ImpactBox value={0} label="ساعات مشاهدة" />
            <ImpactBox value={stats?.totalQuizAttempts ?? 0} label="اختبارات مكتملة" />
          </div>
        </div>
      </section>

      {/* ============================================================
          TEACHER CTA
         ============================================================ */}
      <section className="bg-[var(--ce-bg)] py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="overflow-hidden rounded-[2rem] bg-[var(--ce-brand)] p-8 text-white sm:p-12">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-[var(--ce-accent-soft)]">
                للمدرسين
              </span>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                أنشئ أكاديميتك في دقائق
              </h2>
              <p className="mt-4 text-white/80">
                أطلق أكاديميتك بعلامتك، انشر الدورات، أدر المجموعات، راجع المدفوعات، ونمِّ مجتمع طلابك.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/auth/register?role=teacher"
                  className="rounded-full bg-[var(--ce-accent)] px-6 py-3 text-sm font-bold text-white"
                >
                  إنشاء أكاديمية
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
        <section className="bg-[var(--ce-surface)] py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <h2 className="text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
                الأسئلة الشائعة
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[var(--ce-muted)] sm:text-lg">
                إجابات لأسئلة الطلاب وأولياء الأمور والمدرسين.
              </p>
            </div>

            <div className="mx-auto flex max-w-3xl flex-col gap-3">
              {faqs.map((f) => (
                <FaqItem key={f.id} faq={f} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          FOOTER
         ============================================================ */}
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
                  <p className="text-sm text-white/70">منصة تعليمية متعددة الأكاديميات</p>
                </div>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
                منصة موثوقة لتعليم البرمجة والتعليم الثانوي عبر أكاديميات معتمدة.
              </p>
              <div className="mt-5 flex gap-3">
                {[
                  { Icon: Facebook, label: 'Facebook' },
                  { Icon: Instagram, label: 'Instagram' },
                  { Icon: Youtube, label: 'Youtube' },
                  { Icon: Mail, label: 'Email' },
                ].map(({ Icon, label }) => (
                  <Link
                    key={label}
                    to="/contact"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-[var(--ce-accent)]"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <h3 className="font-extrabold">المنصة</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/75">
                <li><Link to="/" className="transition hover:text-[var(--ce-accent-soft)]">الرئيسية</Link></li>
                <li><a href="#academies" className="transition hover:text-[var(--ce-accent-soft)]">الأكاديميات</a></li>
                <li><a href="#teacher-cta" className="transition hover:text-[var(--ce-accent-soft)]">الأسعار</a></li>
                <li><Link to="/contact" className="transition hover:text-[var(--ce-accent-soft)]">تواصل معنا</Link></li>
              </ul>
            </div>

            {/* Learn */}
            <div>
              <h3 className="font-extrabold">تعلّم</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/75">
                <li><Link to="/auth/register?role=student" className="transition hover:text-[var(--ce-accent-soft)]">انضم كطالب</Link></li>
                <li><a href="#categories" className="transition hover:text-[var(--ce-accent-soft)]">برمجة</a></li>
                <li><a href="#categories" className="transition hover:text-[var(--ce-accent-soft)]">تعليم ثانوي</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-extrabold">قانوني</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/75">
                <li><Link to="/contact" className="transition hover:text-[var(--ce-accent-soft)]">شروط الاستخدام</Link></li>
                <li><Link to="/contact" className="transition hover:text-[var(--ce-accent-soft)]">سياسة الخصوصية</Link></li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="mt-10 grid gap-4 border-t border-white/10 pt-8 md:grid-cols-[1fr_auto] md:items-center">
            <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                className="flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-white placeholder-white/50 outline-none focus:border-[var(--ce-accent)]"
              />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--ce-accent)] px-5 py-3 text-sm font-bold text-white"
              >
                <Send className="h-4 w-4" />
                اشترك
              </button>
            </form>
            <p className="text-sm text-white/60">© 2026 Code Eagles. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// Sub Components
// ============================================================

function HeroStat({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
      <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        {value}+
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/70">
        {label}
      </p>
    </div>
  );
}

function StatBox({ value, label }) {
  return (
    <div className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-5 text-center shadow-sm">
      <p className="text-2xl font-extrabold text-[var(--ce-primary)]">{value}+</p>
      <p className="mt-1 text-sm font-semibold text-[var(--ce-muted)]">{label}</p>
    </div>
  );
}

function ImpactBox({ value, label }) {
  return (
    <div className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-5 text-center shadow-sm">
      <div className="text-3xl font-extrabold text-[var(--ce-primary)] sm:text-4xl">
        {value}+
      </div>
      <p className="mt-2 text-sm font-semibold text-[var(--ce-muted)]">{label}</p>
    </div>
  );
}

function AcademyCardItem({ academy }) {
  const logo = resolveImage(academy.logoUrl);
  const cover = resolveImage(academy.coverUrl);
  const initial = academy.name?.charAt(0) ?? '؟';

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] shadow-sm transition hover:shadow-lg">
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[var(--ce-brand)] to-[var(--ce-brand-soft)]">
        {cover ? (
          <img src={cover} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-extrabold text-white/20">
            {initial}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {logo && (
          <img
            src={logo}
            alt={academy.name}
            loading="lazy"
            className="absolute bottom-3 start-3 h-12 w-12 rounded-xl border-2 border-white object-cover shadow-lg"
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
              <p className="mt-1 truncate text-sm text-[var(--ce-muted)]">{academy.ownerName}</p>
            )}
          </div>
          {academy.approvalStatus === 'approved' && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              موثق
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
            {academy.studentsCount} طالب
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-[var(--ce-accent)]" />
            {academy.coursesCount} دورة
          </span>
        </div>

        <Link
          to={`/academy/${academy.slug}`}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ce-brand)] px-5 py-2.5 pt-5 text-sm font-bold text-white transition hover:opacity-90 sm:mt-5"
        >
          عرض الأكاديمية
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function FaqItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start transition hover:bg-[var(--ce-bg)]"
        aria-expanded={open}
      >
        <span className="font-bold text-[var(--ce-primary)]">{faq.question?.ar}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[var(--ce-accent)] transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="border-t border-[var(--ce-border)] px-5 pb-5 pt-3 leading-relaxed text-[var(--ce-muted)]">
          {faq.answer?.ar}
        </div>
      )}
    </article>
  );
}