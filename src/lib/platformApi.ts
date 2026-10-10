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

/** JSON multilanguage (ar/en) */
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

// ============================================================
// API Methods
// ============================================================
export const platformApi = {
  // ---------- Public: Academies ----------
  async getAcademies(params?: { q?: string }): Promise<AcademyCard[]> {
    const { data } = await api.get('/api/platform/academies', { params });
    return data.data ?? data;
  },

  async getAcademyBySlug(slug: string): Promise<AcademyCard> {
    const { data } = await api.get(`/api/platform/academies/${slug}`);
    return data.data ?? data;
  },

  // ---------- Public: Stats ----------
  async getStats(): Promise<PlatformStats> {
    const { data } = await api.get('/api/platform/stats');
    return data.data ?? data;
  },

  // ---------- Public: FAQs ----------
  async getFaqs(): Promise<PlatformFaq[]> {
    const { data } = await api.get('/api/platform/faqs');
    return data.data ?? data;
  },

  // ---------- Public: Testimonials ----------
  async getTestimonials(): Promise<Testimonial[]> {
    const { data } = await api.get('/api/platform/testimonials');
    return data.data ?? data;
  },

  // ---------- Public: Plans ----------
  async getPlans(): Promise<PlatformPlan[]> {
    const { data } = await api.get('/api/platform/plans');
    return data.data ?? data;
  },

  // ---------- Public: Site Content ----------
  async getSiteContent(): Promise<PlatformSiteContent> {
    const { data } = await api.get('/api/platform/site');
    return data.data ?? data;
  },

  // ---------- Public: Contact ----------
  async sendContactMessage(payload: ContactMessagePayload) {
    const { data } = await api.post('/api/platform/contact', payload);
    return data;
  },

  // ---------- Student: Testimonials (requires auth) ----------
  async submitTestimonial(payload: SubmitTestimonialPayload) {
    const { data } = await api.post('/api/student/testimonials', payload);
    return data;
  },

  async getMyTestimonials(): Promise<Testimonial[]> {
    const { data } = await api.get('/api/student/testimonials/me');
    return data.data ?? data;
  },
};

export default platformApi;