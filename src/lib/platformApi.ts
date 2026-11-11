// src/lib/platformApi.ts
import api from './api';

// ============================================================
// Types
// ============================================================
export interface AcademyCard {
  id: string;
  slug: string;
  name: string;
  ownerName: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  description: string | null;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  studentsCount: number;
  coursesCount: number;
}

export interface PlatformStats {
  activeAcademies: number;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalQuizAttempts: number;
}

export type LocalizedText = Record<string, string>;

export interface PlatformFaq {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
  sortOrder: number;
}

export interface Testimonial {
  id: string;
  name: string | null;
  role: string | null;
  content: LocalizedText | null;
  rating: number | null;
  avatarUrl: string | null;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

export interface PlatformPlan {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  periodMonths: number;
  features: Record<string, any>;
  maxStudents: number | null;
  maxAssistants: number | null;
  sortOrder: number;
  status: 'active' | 'inactive' | 'archived';
}

export interface PlatformSiteContent {
  [key: string]: any;
}

export interface SubmitTestimonialPayload {
  name?: string;
  role?: string;
  content: LocalizedText;
  rating?: number;
}

export interface ContactMessagePayload {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface EmergencySettings {
  id?: string;
  enabled: boolean;
  message: Record<string, string>;
  updatedAt?: string;
}

export interface PublicTenant {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  coverUrl: string | null;
  description: string | null;
  publicPage?: Record<string, any>;
  features?: Record<string, any>;
  studentPackages?: any[];
  createdAt?: string;
}

export interface PublicSubject {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  coverImage?: string | null;
  gradeLevel?: string | null;
}

export interface PublicCourse {
  id: string;
  title: string;
  slug?: string;
  description?: string | null;
  coverImage?: string | null;
  gradeLevel?: string | null;
  term?: string | null;
}

export interface PublicGroup {
  id: string;
  name: string;
  gradeLevel?: string | null;
  schedule?: string | null;
  meetingDays?: any;
  capacity?: number;
}

export interface PublicPlan {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  packageType?: string;
  durationDays?: number | null;
  trialDays?: number;
}

export interface SubjectDetails {
  subject: PublicSubject & { createdAt?: string };
  courses: PublicCourse[];
  groups: PublicGroup[];
}

// ============================================================
// ⭐ Base path — الـ prefix الصحيح
// ============================================================
const BASE = '/api/v1';

function noCacheParams() {
  return { _t: Date.now() };
}

// ============================================================
// API Methods
// ============================================================
export const platformApi = {
  // ---------- Public: Academies ----------
  async getAcademies(params?: { q?: string }): Promise<AcademyCard[]> {
    const { data } = await api.get(`${BASE}/platform/academies`, {
      params: { ...params, ...noCacheParams() },
    });
    return data.data ?? data;
  },

  async getPublicSubjectDetails(
  slug: string,
  subjectId: string,
): Promise<SubjectDetails> {
  const { data } = await api.get(
    `${BASE}/public/tenants/${slug}/subjects/${subjectId}`,
    { params: noCacheParams() },
  );
  return data.data ?? data;
},
  async getAcademyBySlug(slug: string): Promise<AcademyCard> {
    const { data } = await api.get(`${BASE}/platform/academies/${slug}`);
    return data.data ?? data;
  },

  // ---------- Public: Stats ----------
  async getStats(): Promise<PlatformStats> {
    const { data } = await api.get(`${BASE}/platform/stats`, {
      params: noCacheParams(),
    });
    return data.data ?? data;
  },

  // ---------- Public: FAQs ----------
  async getFaqs(): Promise<PlatformFaq[]> {
    const { data } = await api.get(`${BASE}/platform/faqs`, {
      params: noCacheParams(),
    });
    return data.data ?? data;
  },

  // ---------- Public: Testimonials ----------
  async getTestimonials(): Promise<Testimonial[]> {
    const { data } = await api.get(`${BASE}/platform/testimonials`, {
      params: noCacheParams(),
    });
    return data.data ?? data;
  },

  // ---------- Public: Plans ----------
  async getPlans(): Promise<PlatformPlan[]> {
    const { data } = await api.get(`${BASE}/platform/plans`, {
      params: noCacheParams(),
    });
    return data.data ?? data;
  },

  // ---------- Public: Site Content ----------
  async getSiteContent(): Promise<PlatformSiteContent> {
    const { data } = await api.get(`${BASE}/platform/site`, {
      params: noCacheParams(),
    });
    return data.data ?? data;
  },

  async getSiteByKey(key: string): Promise<any> {
    const { data } = await api.get(
      `${BASE}/platform/site/${encodeURIComponent(key)}`,
      { params: noCacheParams() },
    );
    return data.data ?? data;
  },

  // ---------- Public: Emergency ----------
  async getEmergency(): Promise<EmergencySettings> {
    const { data } = await api.get(`${BASE}/platform/emergency`, {
      params: noCacheParams(),
    });
    return data.data ?? data;
  },

  // ---------- Public: Contact ----------
  async sendContactMessage(payload: ContactMessagePayload) {
    const { data } = await api.post(`${BASE}/platform/contact`, payload);
    return data;
  },

  // ---------- Student: Testimonials ----------
  async submitTestimonial(payload: SubmitTestimonialPayload) {
    const { data } = await api.post(`${BASE}/student/testimonials`, payload);
    return data;
  },
async submitPublicTestimonial(payload: SubmitTestimonialPayload) {
  // ✅ بدون auth
  const { data } = await api.post(
    '/api/v1/platform/testimonials/submit',
    payload,
  );
  return data;
},


  async getMyTestimonials(): Promise<Testimonial[]> {
    const { data } = await api.get(`${BASE}/student/testimonials/me`);
    return data.data ?? data;
  },

  // ---------- Public Tenant ----------
  async getPublicTenant(slug: string): Promise<PublicTenant> {
    const { data } = await api.get(`${BASE}/public/tenants/${slug}`);
    return data.data ?? data;
  },

  async getPublicSubjects(slug: string): Promise<PublicSubject[]> {
    const { data } = await api.get(
      `${BASE}/public/tenants/${slug}/subjects`,
      { params: noCacheParams() },
    );
    return data.data ?? data;
  },

  async getPublicCourses(slug: string): Promise<PublicCourse[]> {
    const { data } = await api.get(
      `${BASE}/public/tenants/${slug}/courses`,
      { params: noCacheParams() },
    );
    return data.data ?? data;
  },

  async getPublicGroups(slug: string): Promise<PublicGroup[]> {
    const { data } = await api.get(
      `${BASE}/public/tenants/${slug}/groups`,
      { params: noCacheParams() },
    );
    return data.data ?? data;
  },

  async getPublicTenantPlans(slug: string): Promise<PublicPlan[]> {
    const { data } = await api.get(
      `${BASE}/public/tenants/${slug}/plans`,
      { params: noCacheParams() },
    );
    return data.data ?? data;
  },
};

export default platformApi;
