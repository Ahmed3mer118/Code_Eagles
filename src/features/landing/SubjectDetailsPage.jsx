// src/features/landing/SubjectDetailsPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Users, Calendar, Layers,
  AlertCircle, FolderOpen, ChevronLeft, ChevronDown,
  Video, ClipboardList, Lock, PlayCircle
} from 'lucide-react';
import { platformApi } from '../../lib/platformApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function resolveImage(url) {
  if (!url) return undefined;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_URL}${url}`;
}

export default function SubjectDetailsPage() {
  const { slug, subjectId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await platformApi.getPublicSubjectDetails(slug, subjectId);
        
        // ✅ الكونسول بتاع التشخيص
        console.log('====================================');
        console.log('✅ Subject Details Response:', res);
        if (res?.courses) {
          console.log(`📦 Courses Count: ${res.courses.length}`);
          res.courses.forEach((c) => {
            const modulesCount = c.modules?.length || 0;
            console.log(`  - Course: "${c.title}" | Modules: ${modulesCount}`);
            if (c.modules) {
              c.modules.forEach((m) => {
                console.log(`    * Module: "${m.title}" | Lectures: ${m.lectures?.length || 0} | Quizzes: ${m.quizzes?.length || 0}`);
              });
            }
          });
        } else {
          console.warn('⚠️ No courses array found in response');
        }
        console.log('====================================');

        if (mounted) setData(res);
      } catch (err) {
        console.error('❌ Subject details load error:', err);
        if (mounted) {
          setError(err?.response?.status === 404 ? 'not-found' : 'unknown');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug, subjectId]);

  const toggleCourse = (courseId) => {
    setExpandedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--ce-bg)] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--ce-accent)] border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--ce-bg)] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-[var(--ce-surface)] rounded-2xl shadow-lg p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-2xl font-extrabold text-[var(--ce-primary)]">
            المادة غير موجودة
          </h1>
          <p className="mt-2 text-[var(--ce-muted)]">
            قد تكون المادة محذوفة أو غير منشورة.
          </p>
          <Link
            to={`/academy/${slug}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--ce-brand)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--ce-brand-soft)]"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للأكاديمية
          </Link>
        </div>
      </div>
    );
  }

  const { subject, courses = [], groups = [] } = data;
  const cover = resolveImage(subject.coverImage);

  return (
    <div className="min-h-screen bg-[var(--ce-bg)]" dir="rtl">
      {/* HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--ce-brand)] via-[#122544] to-[var(--ce-brand-soft)] text-white">
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <Link
            to={`/academy/${slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-2 text-sm font-bold text-white hover:bg-white/25 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للأكاديمية
          </Link>

          <div className="flex flex-col sm:flex-row items-start gap-6">
            {cover ? (
              <img src={cover} alt={subject.name} className="h-32 w-32 rounded-2xl object-cover border-4 border-white/20 shadow-xl" />
            ) : (
              <div className="h-32 w-32 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                <FolderOpen className="h-14 w-14 text-white/60" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold">{subject.name}</h1>
                {subject.gradeLevel && (
                  <span className="inline-flex items-center rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-bold">
                    {subject.gradeLevel}
                  </span>
                )}
              </div>
              {subject.description && (
                <p className="mt-3 text-white/80 leading-relaxed max-w-2xl">{subject.description}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> {courses.length} كورس
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1.5">
                  <Users className="h-3.5 w-3.5" /> {groups.length} جروب
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">
        
        {/* COURSES & CONTENT */}
        {courses.length > 0 && (
          <section>
            <h2 className="text-xl font-extrabold text-[var(--ce-primary)] mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[var(--ce-accent)]" />
              محتوى الكورسات
            </h2>
            <div className="space-y-4">
              {courses.map((c) => {
                const isCourseExpanded = expandedCourses[c.id];
                const modules = c.modules || []; 

                return (
                  <div key={c.id} className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] overflow-hidden transition-all">
                    {/* Course Header (Clickable) */}
                    <div 
                      onClick={() => toggleCourse(c.id)}
                      className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[var(--ce-bg)] transition"
                    >
                      <div className="flex items-center gap-4">
                        {c.coverImage ? (
                          <img src={resolveImage(c.coverImage)} alt={c.title} className="h-16 w-16 rounded-xl object-cover" />
                        ) : (
                          <div className="h-16 w-16 rounded-xl bg-[var(--ce-accent)]/10 flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-[var(--ce-accent)]/50" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-lg text-[var(--ce-primary)]">{c.title}</h3>
                          <p className="text-xs text-[var(--ce-muted)] mt-1">{modules.length} وحدات</p>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-[var(--ce-muted)] transition-transform ${isCourseExpanded ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Modules List (Collapsible) */}
                    {isCourseExpanded && (
                      <div className="border-t border-[var(--ce-border)] bg-[var(--ce-bg)] p-4 space-y-3">
                        {modules.length === 0 ? (
                          <p className="text-sm text-[var(--ce-muted)] text-center py-4">لا توجد وحدات منشورة بعد.</p>
                        ) : (
                          modules.map(m => {
                            const isModuleExpanded = expandedModules[m.id];
                            const lectures = m.lectures || [];
                            const quizzes = m.quizzes || [];

                            return (
                              <div key={m.id} className="rounded-xl border border-[var(--ce-border)] bg-[var(--ce-surface)] overflow-hidden">
                                {/* Module Header */}
                                <div 
                                  onClick={() => toggleModule(m.id)}
                                  className="p-3 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-[var(--ce-bg)]/50 transition"
                                >
                                  <div className="flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-[var(--ce-accent)]" />
                                    <span className="font-semibold text-[var(--ce-text)]">{m.title}</span>
                                  </div>
                                  <ChevronDown className={`h-4 w-4 text-[var(--ce-muted)] transition-transform ${isModuleExpanded ? 'rotate-180' : ''}`} />
                                </div>

                                {/* Lectures & Quizzes */}
                                {isModuleExpanded && (
                                  <div className="border-t border-[var(--ce-border)] p-3 space-y-2">
                                    
                                    {/* Lectures */}
                                    {lectures.map(l => (
                                      <div key={l.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--ce-bg)] transition">
                                        <div className="flex items-center gap-2">
                                          <Video className="h-4 w-4 text-gray-400" />
                                          <span className="text-sm">{l.title}</span>
                                          {l.isFree && (
                                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">مجاني</span>
                                          )}
                                        </div>
                                        {l.isFree && l.videoUrl ? (
                                          <a 
                                            href={l.videoUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-1 rounded"
                                          >
                                            <PlayCircle className="h-3.5 w-3.5" /> مشاهدة
                                          </a>
                                        ) : (
                                          <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                            <Lock className="h-3 w-3" /> مدفوع
                                          </div>
                                        )}
                                      </div>
                                    ))}

                                    {/* Quizzes */}
                                    {quizzes.map(q => (
                                      <div key={q.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--ce-bg)] transition">
                                        <div className="flex items-center gap-2">
                                          <ClipboardList className="h-4 w-4 text-gray-400" />
                                          <span className="text-sm">{q.title}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                          <Lock className="h-3 w-3" /> مقفول
                                        </div>
                                      </div>
                                    ))}

                                    {lectures.length === 0 && quizzes.length === 0 && (
                                      <p className="text-xs text-[var(--ce-muted)] text-center py-2">لا يوجد محتوى في هذه الوحدة.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* GROUPS */}
        {groups.length > 0 && (
          <section>
            <h2 className="text-xl font-extrabold text-[var(--ce-primary)] mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-[var(--ce-accent)]" />
              الجروبات المتاحة
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((g) => {
                const enrolled = g._count?.members ?? 0;
                const full = g.capacity && enrolled >= g.capacity;
                const percent = g.capacity ? Math.min(100, Math.round((enrolled / g.capacity) * 100)) : 0;
                return (
                  <div key={g.id} className="rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-surface)] p-5 hover:shadow-lg transition">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-[var(--ce-primary)] flex-1">{g.name}</h3>
                      {full ? (
                        <span className="shrink-0 rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-bold">مكتمل</span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-bold">متاح</span>
                      )}
                    </div>
                    {g.schedule && (
                      <p className="mt-2 text-sm text-[var(--ce-muted)] flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-[var(--ce-accent)]" /> {g.schedule}
                      </p>
                    )}
                    {g.capacity != null && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-[var(--ce-muted)] mb-1">
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {enrolled} / {g.capacity} طالب</span>
                          <span className="font-bold">{percent}%</span>
                        </div>
                        <div className="h-2 w-full bg-[var(--ce-bg)] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition ${full ? 'bg-red-500' : 'bg-[var(--ce-accent)]'}`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* EMPTY */}
        {courses.length === 0 && groups.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--ce-border)] bg-[var(--ce-surface)] py-16 text-center text-[var(--ce-muted)]">
            <FolderOpen className="mx-auto h-12 w-12 opacity-40" />
            <p className="mt-3">لا يوجد محتوى منشور في هذه المادة بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}
