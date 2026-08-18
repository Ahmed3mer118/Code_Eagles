import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  BadgeCheck,
  BookOpen,
  Facebook,
  Mail,
  Phone,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import { tenantApi } from '../../shared/api/platformApi';
import resolveMediaUrl from '../../shared/utils/mediaUrl';
import AcademyLayout from '../../shared/layouts/AcademyLayout';
import LoadingScreen from '../../shared/ui/LoadingScreen';
import SectionHeader from '../marketing/components/SectionHeader';
import CourseCard from '../marketing/components/CourseCard';
import AcademyGroupCourseCard from './components/AcademyGroupCourseCard';
import LearningPathTimeline from '../marketing/components/LearningPathTimeline';
import PricingTiers from '../marketing/components/PricingTiers';
import ReviewCard from '../marketing/components/ReviewCard';
import FaqAccordion from '../marketing/components/FaqAccordion';

function AcademyLanding({
  tenant,
  subjects,
  groups,
  stats,
  learningPath,
  isApproved,
  slug,
  paymentPlans = [],
}) {
  const { t } = useTranslation();
  const [courseFilter, setCourseFilter] = useState('all');
  const ownerName = tenant.ownerId?.name || '';
  const packages = tenant.studentPackages || {};
  const page = tenant.publicPage || {};
  const pricingMeta = page.pricing || {};

  const joinLink = (groupId) => {
    const path = groupId
      ? `/dashboard/student/join?academy=${slug}&group=${groupId}`
      : `/dashboard/student/join?academy=${slug}`;
    return `/auth/login?returnTo=${encodeURIComponent(path)}`;
  };

  const registerLink = (groupId) => {
    const params = new URLSearchParams({ role: 'student', academy: slug });
    const path = `/dashboard/student/join?${new URLSearchParams({
      academy: slug,
      ...(groupId ? { group: groupId } : {}),
    }).toString()}`;
    params.set('returnTo', path);
    return `/auth/register?${params.toString()}`;
  };

  const pricingTiers = useMemo(() => {
    if (paymentPlans?.length) {
      const featuredIndex = Math.min(1, paymentPlans.length - 1);
      return paymentPlans.map((plan, index) => ({
        key: plan._id || String(index),
        label: plan.name,
        price: plan.price ?? 0,
        features: plan.description ? plan.description.split('\n').filter(Boolean) : [],
        featured: index === featuredIndex && paymentPlans.length > 1,
      }));
    }

    const tierDefs = [
      {
        key: 'basic',
        metaKey: 'lecturesOnly',
        priceKey: 'lecturesOnly',
        fallbackLabel: t('academy.pricing.basic.title'),
        fallbackFeatures: [t('academy.pricing.basic.f1')],
        featured: false,
      },
      {
        key: 'standard',
        metaKey: 'examsOnly',
        priceKey: 'examsOnly',
        fallbackLabel: t('academy.pricing.standard.title'),
        fallbackFeatures: [t('academy.pricing.standard.f1'), t('academy.pricing.standard.f2')],
        featured: false,
      },
      {
        key: 'premium',
        metaKey: 'lecturesAndExams',
        priceKey: 'lecturesAndExams',
        fallbackLabel: t('academy.pricing.premium.title'),
        fallbackFeatures: [
          t('academy.pricing.premium.f1'),
          t('academy.pricing.premium.f2'),
          t('academy.pricing.premium.f3'),
        ],
        featured: true,
      },
    ];

    return tierDefs
      .map((tier) => {
        const meta = pricingMeta[tier.metaKey] || {};
        const price = packages[tier.priceKey] || 0;
        return {
          key: tier.key,
          label: meta.title || tier.fallbackLabel,
          price,
          features: meta.features?.length ? meta.features : tier.fallbackFeatures,
          featured: meta.featured ?? tier.featured,
        };
      })
      .filter((tier) => tier.price > 0);
  }, [paymentPlans, packages, pricingMeta, t]);

  const galleryItems = useMemo(
    () => (page.gallery || []).filter((item) => item.url).sort((a, b) => (a.order || 0) - (b.order || 0)),
    [page.gallery]
  );

  const groupCatalog = useMemo(
    () =>
      groups.map((group) => ({
        _id: group._id,
        name: group.name,
        description: group.subjectDetail?.description || group.subjectId?.name || '',
        subjectName: group.subjectDetail?.name || group.subjectId?.name || '',
        gradeLevel: group.gradeLevel || group.subjectDetail?.gradeLevel || group.subjectId?.gradeLevel,
        lessonCount: group.contentStats?.lessonCount || group.subjectDetail?.lessonCount || 0,
        group,
      })),
    [groups]
  );

  const orphanSubjects = useMemo(() => {
    const linkedIds = new Set(
      groups
        .map((g) => g.subjectDetail?._id || g.subjectId?._id || g.subjectId)
        .filter(Boolean)
        .map((id) => id.toString())
    );
    return subjects
      .filter((s) => !linkedIds.has(s._id.toString()))
      .map((subject) => ({
        type: 'subject',
        _id: subject._id,
        name: subject.name,
        description: subject.description,
        coverImage: subject.coverImage,
        gradeLevel: subject.gradeLevel,
        lessonCount: subject.lessonCount || 0,
        studentCount: stats?.students || 0,
        price:
          packages.lecturesAndExams ||
          packages.lecturesOnly ||
          packages.examsOnly ||
          0,
        teacherName: ownerName,
        academyName: tenant.name,
        academySlug: slug,
        durationHours: Math.max((subject.lessonCount || 1) * 2, 4),
      }));
  }, [groups, subjects, stats, packages, ownerName, tenant.name, slug]);

  const catalogItems = useMemo(
    () => [...groupCatalog.map((g) => ({ ...g, type: 'group' })), ...orphanSubjects],
    [groupCatalog, orphanSubjects]
  );

  const matchesCourseFilter = (item, filter) => {
    if (filter === 'all') return true;

    const label = `${item.name || ''} ${item.description || ''} ${item.subjectName || ''}`.toLowerCase();
    const grade = item.gradeLevel || '';

    if (filter === 'secondary') {
      return grade.startsWith('grade_') || /ثانو|secondary|prep|grade/i.test(label);
    }
    if (filter === 'programming') {
      return grade === 'general' || /program|code|برمج|react|js|python|web|dev/i.test(label);
    }
    if (filter === 'beginner') {
      return item.type === 'group' || (item.lessonCount || 0) <= 8;
    }
    if (filter === 'advanced') {
      return item.type !== 'group' && (item.lessonCount || 0) > 8;
    }
    return true;
  };

  const filteredCourses = useMemo(
    () => catalogItems.filter((item) => matchesCourseFilter(item, courseFilter)),
    [catalogItems, courseFilter]
  );

  const reviews = useMemo(() => {
    if (page.reviews?.length) {
      return page.reviews.map((review) => ({
        name: review.name,
        comment: review.comment,
        rating: review.rating || 5,
        verified: true,
        helpful: review.helpful || 0,
      }));
    }
    return [1, 2, 3].map((i) => ({
      name: t(`academy.reviews.${i}.name`),
      comment: t(`academy.reviews.${i}.comment`),
      rating: Number(t(`academy.reviews.${i}.rating`)),
      verified: true,
      helpful: Number(t(`academy.reviews.${i}.helpful`)),
    }));
  }, [page.reviews, t]);

  const faqItems = useMemo(() => {
    if (page.faq?.length) {
      return page.faq.map((item) => ({ question: item.question, answer: item.answer }));
    }
    return [1, 2, 3, 4].map((i) => ({
      question: t(`academy.faq.${i}.q`),
      answer: t(`academy.faq.${i}.a`, { name: tenant.name }),
    }));
  }, [page.faq, t, tenant.name]);

  const aboutCards = useMemo(() => {
    if (page.aboutCards?.length) {
      return page.aboutCards.filter((c) => c.title || c.description);
    }
    return [
      { title: t('academy.mission'), desc: t('academy.missionDesc') },
      { title: t('academy.teachingStyle'), desc: t('academy.teachingStyleDesc') },
      { title: t('academy.experience'), desc: t('academy.experienceDesc', { count: stats?.students || 0 }) },
      { title: t('academy.achievements'), desc: t('academy.achievementsDesc') },
    ];
  }, [page.aboutCards, stats?.students, t]);

  const resultMetrics = [
    { label: t('academy.results.students'), value: stats?.students || 0, icon: Users },
    { label: t('academy.results.courses'), value: stats?.courses || subjects.length, icon: BookOpen },
    { label: t('academy.results.quizzes'), value: stats?.quizzes || 0, icon: Trophy },
    { label: t('academy.results.groups'), value: stats?.groups || groups.length, icon: Star },
  ];

  return (
    <>
      <Helmet>
        <title>{tenant.name} — {t('brand.name')}</title>
        <meta name="description" content={tenant.description || tenant.name} />
        <link rel="canonical" href={`https://www.code-eagles.com/academy/${tenant.slug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://www.code-eagles.com/academy/${tenant.slug}`} />
        <meta property="og:title" content={`${tenant.name} — ${t('brand.name')}`} />
        <meta property="og:description" content={tenant.description || tenant.name} />
        <meta property="og:image" content={tenant.logoUrl ? resolveMediaUrl(tenant.logoUrl) : 'https://www.code-eagles.com/images/LOGO.png'} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: tenant.name,
            description: tenant.description,
            provider: { '@type': 'Organization', name: t('brand.name') },
          })}
        </script>
      </Helmet>

      {!isApproved && (
        <div className="bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
          {t('academy.pendingApproval')}
        </div>
      )}

      <section className="relative overflow-hidden">
        {tenant.coverUrl ? (
          <div className="absolute inset-0">
            <img src={resolveMediaUrl(tenant.coverUrl)} alt="" className="h-full w-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-[var(--ce-brand)]/85" />
          </div>
        ) : (
          <div className="absolute inset-0 ce-hero-shell bg-gradient-to-br from-[var(--ce-brand)] to-[var(--ce-brand-soft)]" />
        )}

        <div className="ce-container relative z-10 py-16 text-white md:py-24">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4">
                {tenant.logoUrl ? (
                  <img
                    src={resolveMediaUrl(tenant.logoUrl)}
                    alt=""
                    className="h-16 w-16 rounded-2xl border-2 border-white/30 object-cover shadow-xl"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-extrabold">
                    {tenant.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-extrabold sm:text-5xl">{tenant.name}</h1>
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                        <BadgeCheck className="h-4 w-4 text-[var(--ce-accent-soft)]" />
                        {t('landing.verified')}
                      </span>
                    )}
                  </div>
                  {ownerName && (
                    <p className="mt-2 text-white/80">
                      {t('academy.instructor')}: <span className="font-semibold text-white">{ownerName}</span>
                    </p>
                  )}
                </div>
              </div>

              {tenant.description && (
                <p className="mt-6 text-lg leading-relaxed text-white/85">{tenant.description}</p>
              )}

              <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                  <Users className="h-4 w-4 text-[var(--ce-accent-soft)]" />
                  {stats?.students || 0} {t('landing.studentsLabel')}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                  <BookOpen className="h-4 w-4 text-[var(--ce-accent-soft)]" />
                  {subjects.length} {t('landing.coursesLabel')}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={`/auth/register?role=student&academy=${slug}`} className="ce-btn ce-btn-accent">
                  {t('academy.joinNow')}
                </Link>
                <a href="#courses" className="ce-btn border border-white/30 bg-white/10 text-white">
                  {t('academy.viewCourses')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="ce-section">
        <div className="ce-container grid gap-8 lg:grid-cols-2">
          <div>
            <SectionHeader
              align="start"
              eyebrow={t('academy.aboutEyebrow')}
              title={page.aboutTitle || t('academy.aboutTitle')}
              subtitle={page.aboutSubtitle || tenant.description || t('academy.aboutFallback')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {aboutCards.map((item) => (
              <article key={item.title} className="ce-card p-5">
                <h3 className="font-extrabold text-[var(--ce-primary)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ce-muted)]">{item.description || item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="instructor" className="ce-section ce-section-alt">
        <div className="ce-container">
          <div className="ce-card overflow-hidden">
            <div className="grid lg:grid-cols-[280px_1fr]">
              <div className="bg-gradient-to-br from-[var(--ce-brand)] to-[var(--ce-brand-soft)] p-8 text-white">
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-white/15 text-4xl font-extrabold">
                  {ownerName?.charAt(0) || 'T'}
                </div>
                <h2 className="mt-5 text-center text-2xl font-extrabold">{ownerName}</h2>
                <p className="mt-2 text-center text-sm text-white/75">{page.instructorRole || t('academy.instructorRole')}</p>
                <div className="mt-6 space-y-2 text-sm">
                  <p>{t('academy.instructorStudents', { count: stats?.students || 0 })}</p>
                  <p>{t('academy.instructorExperience')}</p>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-extrabold text-[var(--ce-primary)]">{t('academy.instructorBioTitle')}</h3>
                <p className="mt-4 leading-relaxed text-[var(--ce-muted)]">
                  {page.instructorBio || t('academy.instructorBio', { name: ownerName, academy: tenant.name })}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {tenant.contactWhatsapp && (
                    <a
                      href={`https://wa.me/${tenant.contactWhatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ce-btn ce-btn-ghost text-sm"
                    >
                      <Phone className="h-4 w-4" />
                      WhatsApp
                    </a>
                  )}
                  {tenant.contactFacebook && (
                    <a href={tenant.contactFacebook} target="_blank" rel="noreferrer" className="ce-btn ce-btn-ghost text-sm">
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </a>
                  )}
                  {tenant.ownerId?.email && (
                    <a href={`mailto:${tenant.ownerId.email}`} className="ce-btn ce-btn-ghost text-sm">
                      <Mail className="h-4 w-4" />
                      {t('nav.contact')}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {galleryItems.length > 0 && (
        <section id="gallery" className="ce-section ce-section-alt">
          <div className="ce-container">
            <SectionHeader
              title={page.sectionTitles?.gallery || t('academy.galleryTitle')}
              subtitle={t('academy.gallerySubtitle')}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galleryItems.map((item) => (
                <figure key={item.url} className="ce-card overflow-hidden">
                  <img src={resolveMediaUrl(item.url)} alt={item.caption || tenant.name} className="h-56 w-full object-cover" loading="lazy" />
                  {item.caption && <figcaption className="p-4 text-sm text-[var(--ce-muted)]">{item.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="courses" className="ce-section">
        <div className="ce-container">
          <SectionHeader
            eyebrow={t('academy.coursesEyebrow')}
            title={t('academy.coursesTitle')}
            subtitle={t('academy.coursesSubtitle')}
          />
          {/* <div className="mb-6 flex flex-wrap gap-2">
            {['all', 'programming', 'secondary', 'beginner', 'advanced'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setCourseFilter(filter)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  courseFilter === filter
                    ? 'bg-[var(--ce-primary)] text-white'
                    : 'bg-[var(--ce-bg)] text-[var(--ce-muted)]'
                }`}
              >
                {t(`academy.filters.${filter}`)}
              </button>
            ))}
          </div> */}
          {filteredCourses.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((item) => (
                item.type === 'group' ? (
                  <AcademyGroupCourseCard
                    key={`group-${item._id}`}
                    group={item.group}
                    joinLink={joinLink}
                    registerLink={registerLink}
                    isApproved={isApproved}
                  />
                  // <CourseCard key={item._id} course={item} />
                ) : (
                  <CourseCard key={item._id} course={item} />
                )
              ))}
            </div>
          ) : (
            <div className="ce-card p-8 text-center text-[var(--ce-muted)]">{t('academy.noCourses')}</div>
          )}
        </div>
      </section>

      {/* {learningPath?.length > 0 && (
        <section className="ce-section ce-section-alt">
          <div className="ce-container">
            <SectionHeader
              title={t('academy.learningPathTitle')}
              subtitle={t('academy.learningPathSubtitle')}
            />
            <LearningPathTimeline steps={learningPath} />
          </div>
        </section>
      )} */}

      <section className="ce-section">
        <div className="ce-container">
          <SectionHeader title={t('academy.resultsTitle')} subtitle={t('academy.resultsSubtitle')} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {resultMetrics.map(({ label, value, icon: Icon }) => (
              <div key={label} className="ce-stat-card">
                <Icon className="h-5 w-5 text-[var(--ce-accent)]" />
                <p className="mt-3 text-2xl font-extrabold text-[var(--ce-primary)]">{value}</p>
                <p className="text-sm font-semibold text-[var(--ce-muted)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ce-section ce-section-alt">
        <div className="ce-container">
          <SectionHeader title={t('academy.reviewsTitle')} subtitle={t('academy.reviewsSubtitle')} />
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={review.name} review={review} />
            ))}
          </div>
        </div>
      </section>

      {pricingTiers.length > 0 && (
        <section id="pricing" className="ce-section">
          <div className="ce-container">
            <SectionHeader title={t('academy.packages')} subtitle={t('academy.pricingSubtitle')} />
            <PricingTiers tiers={pricingTiers} slug={slug} />
          </div>
        </section>
      )}

      <section className="ce-section ce-section-alt">
        <div className="ce-container">
          <SectionHeader title={t('academy.faqTitle')} subtitle={t('academy.faqSubtitle')} />
          <FaqAccordion items={faqItems} />
        </div>
      </section>

      <section className="ce-section">
        <div className="ce-container">
          <div className="ce-brand-panel ce-gradient-border overflow-hidden rounded-[2rem] p-8 sm:p-12">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              {t('academy.finalCta', { name: ownerName || tenant.name })}
            </h2>
            <p className="mt-4 max-w-2xl text-white/80">{t('academy.finalCtaDesc')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={`/auth/register?role=student&academy=${slug}`} className="ce-btn ce-btn-accent">
                {t('academy.joinNow')}
              </Link>
              <a href="#courses" className="ce-btn border border-white/30 bg-white/10 text-white">
                {t('academy.viewCourses')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="ce-sticky-cta lg:hidden">
        <Link to={`/auth/register?role=student&academy=${slug}`} className="ce-btn ce-btn-accent w-full shadow-xl">
          {t('academy.joinNow')}
        </Link>
      </div>
    </>
  );
}

export default function AcademyPublicPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setState({ loading: true, error: null, data: null });
      try {
        const data = await tenantApi.getBySlug(slug);
        if (!cancelled) setState({ loading: false, error: null, data });
      } catch (err) {
        if (!cancelled) {
          setState({
            loading: false,
            error: err?.response?.data?.message || err?.message || t('academy.notFound'),
            data: null,
          });
        }
      }
    })();
    return () => { cancelled = true; };
  }, [slug, t]);

  if (state.loading) return <LoadingScreen />;

  if (state.error || !state.data?.tenant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="ce-card max-w-md p-8">
          <h1 className="text-2xl font-extrabold text-[var(--ce-primary)]">{t('academy.notFound')}</h1>
          <p className="mt-3 text-[var(--ce-muted)]">{state.error}</p>
          <Link to="/" className="ce-btn ce-btn-primary mt-6 inline-flex">{t('nav.home')}</Link>
        </div>
      </div>
    );
  }

  const { tenant, subjects = [], groups = [], stats, learningPath = [], isApproved, paymentPlans = [] } = state.data;

  return (
    <AcademyLayout tenant={tenant}>
      <AcademyLanding
        tenant={tenant}
        subjects={subjects}
        groups={groups}
        stats={stats}
        learningPath={learningPath}
        isApproved={isApproved}
        slug={slug}
        paymentPlans={paymentPlans}
      />
    </AcademyLayout>
  );
}
