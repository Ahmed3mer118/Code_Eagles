// src/features/landing/AcademyPublicPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Users, GraduationCap, BadgeCheck,
  Layers, Calendar, AlertCircle, FolderOpen, ChevronLeft,
} from 'lucide-react';
import { platformApi } from '../../lib/platformApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function resolveImage(url) {
  if (!url) return undefined;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_URL}${url}`;
}

export default function AcademyPublicPage() {
  const { slug } = useParams();

  const [tenant, setTenant] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [tRes, sRes, cRes, gRes, pRes] = await Promise.allSettled([
          platformApi.getPublicTenant(slug),
          platformApi.getPublicSubjects(slug),
          platformApi.getPublicCourses(slug),
          platformApi.getPublicGroups(slug),
          platformApi.getPublicTenantPlans(slug),
        ]);

        if (!mounted) return;

        if (tRes.status === 'fulfilled') {
          setTenant(tRes.value);
        } else {
          setError('not-found');
        }

        if (sRes.status === 'fulfilled') {
          console.log('✅ Subjects loaded:', sRes.value);
          setSubjects(sRes.value || []);
        } else {
          console.warn('⚠️ Subjects failed:', sRes.reason);
        }

        if (cRes.status === 'fulfilled') {
          console.log('✅ Courses loaded:', cRes.value);
          setCourses(cRes.value || []);
        } else {
          console.warn('⚠️ Courses failed:', cRes.reason);
        }

        if (gRes.status === 'fulfilled') {
          console.log('✅ Groups loaded:', gRes.value);
          setGroups(gRes.value || []);
        } else {
          console.warn('⚠️ Groups failed:', gRes.reason);
        }

        if (pRes.status === 'fulfilled') {
          console.log('✅ Plans loaded:', pRes.value);
          setPlans(pRes.value || []);
        } else {
          console.warn('⚠️ Plans failed:', pRes.reason);
        }
      } catch (err) {
        console.error('Academy load error:', err);
        if (mounted) setError('unknown');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--ce-bg)] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--ce-accent)] border-t-transparent" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-[var(--ce-bg)] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-[var(--ce-surface)] rounded-2xl shadow-lg p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-2xl font-extrabold text-[var(--ce-primary)]">
            الأكاديمية غير موجودة
          </h1>
          <p className="mt-2 text-[var(--ce-muted)]">
            قد تكون الأكاديمية محذوفة أو غير معتمدة بعد.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--ce-brand)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--ce-brand-soft)]"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const logo = resolveImage(tenant.logoUrl);
  const cover = resolveImage(tenant.coverUrl);
  const initial = tenant.name?.charAt(0) ?? '';
  const isEmpty =
    subjects.length === 0 &&
    courses.length === 0 &&
    groups.length === 0 &&
    plans.length === 0;

  return (
    <div className="min-h-screen bg-[var(--ce-bg)]" dir="rtl">
      {/* COVER */}
      <div className="relative h-64 sm:h-80 overflow-hidden bg-gradient-to-br from-[var(--ce-brand)] to-[var(--ce-brand-soft)]">
        {cover ? (
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-7xl font-extrabold text-white/20">
            {initial}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <Link
          to="/"
          className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-2 text-sm font-bold text-white hover:bg-white/25"
        >
          <ArrowLeft className="h-4 w-4" />
          الرئيسية
        </Link>
      </div>

      {/* HEADER CARD */}
      <div className="mx-auto max-w-5xl px-4 -mt-20 relative z-10">
        <div className="bg-[var(--ce-surface)] rounded-3xl shadow-xl p-6 sm:p-8 border border-[var(--ce-border)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {logo && (
              <img
                src={logo}
                alt={tenant.name}
                className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-lg -mt-16 sm:-mt-20"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--ce-primary)]">
                  {tenant.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  معتمدة
                </span>
              </div>
              {tenant.description && (
                <p className="mt-2 text-[var(--ce-muted)] leading-relaxed">
                  {tenant.description}
                </p>
              )}

              {/* Stats badges */}
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                {subjects.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--ce-accent)]/10 text-[var(--ce-accent)] px-2.5 py-1">
                    <FolderOpen className="h-3 w-3" />
                    {subjects.length} مادة
                  </span>
                )}
                {courses.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--ce-accent)]/10 text-[var(--ce-accent)] px-2.5 py-1">
                    <BookOpen className="h-3 w-3" />
                    {courses.length} كورس
                  </span>
                )}
                {groups.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--ce-accent)]/10 text-[var(--ce-accent)] px-2.5 py-1">
                    <Users className="h-3 w-3" />
                    {groups.length} جروب
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">
        {/* ✅ SUBJECTS — قابلين للضغط */}
        {subjects.length > 0 && (
          <section>
            <h2 className="text-xl font-extrabold text-[var(--ce-primary)] mb-4 flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-[var(--ce-accent)]" />
              المواد الدراسية
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((s) => (
                <Link
                  key={s.id}
                  to={`/academy/${slug}/subject/${s.id}`}
                  className="group rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-4 hover:shadow-lg hover:-translate-y-0.5 hover:border-[var(--ce-accent)]/40 transition block"
                >
                  {s.coverImage && (
                    <img
                      src={resolveImage(s.coverImage)}
                      alt={s.name}
                      className="h-32 w-full object-cover rounded-xl mb-3"
                      loading="lazy"
                    />
                  )}
                  {!s.coverImage && (
                    <div className="h-32 w-full rounded-xl mb-3 bg-gradient-to-br from-[var(--ce-accent)]/15 to-[var(--ce-brand)]/10 flex items-center justify-center">
                      <FolderOpen className="h-10 w-10 text-[var(--ce-accent)]/60" />
                    </div>
                  )}
                  <h3 className="font-bold text-[var(--ce-primary)] group-hover:text-[var(--ce-accent)] transition">
                    {s.name}
                  </h3>
                  {s.gradeLevel && (
                    <p className="mt-1 text-xs text-[var(--ce-muted)]">
                      {s.gradeLevel}
                    </p>
                  )}
                  {s.description && (
                    <p className="mt-1 text-sm text-[var(--ce-muted)] line-clamp-2">
                      {s.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs font-bold text-[var(--ce-accent)]">
                    <span>عرض التفاصيل</span>
                    <ChevronLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* COURSES */}
        {courses.length > 0 && (
          <section>
            <h2 className="text-xl font-extrabold text-[var(--ce-primary)] mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[var(--ce-accent)]" />
              الكورسات
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-4 hover:shadow-lg transition"
                >
                  {c.coverImage ? (
                    <img
                      src={resolveImage(c.coverImage)}
                      alt={c.title}
                      className="h-32 w-full object-cover rounded-xl mb-3"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-32 w-full rounded-xl mb-3 bg-gradient-to-br from-[var(--ce-accent)]/15 to-[var(--ce-brand)]/10 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-[var(--ce-accent)]/60" />
                    </div>
                  )}
                  <h3 className="font-bold text-[var(--ce-primary)]">{c.title}</h3>
                  {c.description && (
                    <p className="mt-1 text-sm text-[var(--ce-muted)] line-clamp-2">
                      {c.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* GROUPS */}
        {groups.length > 0 && (
          <section>
            <h2 className="text-xl font-extrabold text-[var(--ce-primary)] mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-[var(--ce-accent)]" />
              الجروبات
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-4"
                >
                  <h3 className="font-bold text-[var(--ce-primary)]">{g.name}</h3>
                  {g.gradeLevel && (
                    <p className="mt-1 text-xs text-[var(--ce-muted)]">
                      {g.gradeLevel}
                    </p>
                  )}
                  {g.schedule && (
                    <p className="mt-1 text-sm text-[var(--ce-muted)] flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {g.schedule}
                    </p>
                  )}
                  {g.capacity && (
                    <p className="mt-1 text-sm text-[var(--ce-muted)] flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {g.capacity} طالب
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PLANS */}
        {plans.length > 0 && (
          <section>
            <h2 className="text-xl font-extrabold text-[var(--ce-primary)] mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-[var(--ce-accent)]" />
              الباقات
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-5"
                >
                  <h3 className="font-bold text-[var(--ce-primary)]">{p.name}</h3>
                  {p.description && (
                    <p className="mt-1 text-sm text-[var(--ce-muted)]">
                      {p.description}
                    </p>
                  )}
                  <p className="mt-3 text-2xl font-extrabold text-[var(--ce-accent)]">
                    {Number(p.price) === 0 ? 'مجاني' : `${p.price} ج.م`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EMPTY */}
        {isEmpty && (
          <div className="rounded-2xl border border-dashed border-[var(--ce-border)] bg-[var(--ce-surface)] py-16 text-center text-[var(--ce-muted)]">
            <GraduationCap className="mx-auto h-12 w-12 opacity-40" />
            <p className="mt-3">لا يوجد محتوى منشور بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}
