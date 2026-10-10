import apiClient from './client';

/* ======================= Types ======================= */
export type LocalizedText = Record<string, string>; // { ar: "...", en: "..." }

export interface Faq {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Testimonial {
  id: string;
  name?: string;
  role?: string;
  content: LocalizedText;
  rating?: number;
  avatarUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  createdAt?: string;
}

export interface SiteContent {
  id?: string;
  key: string;
  content: Record<string, any>;
  updatedAt?: string;
}

export interface EmergencySettings {
  id?: string;
  enabled: boolean;
  message: LocalizedText;
  updatedAt?: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ======================= Service ======================= */
export const contentService = {
  /* ---------- FAQs ---------- */
  async listFaqs(params?: { page?: number; limit?: number; status?: string }) {
    const { data } = await apiClient.get<Paginated<Faq>>('/api/admin/faqs', { params });
    return data;
  },
  async createFaq(payload: {
    question: LocalizedText;
    answer: LocalizedText;
    sortOrder?: number;
    status?: 'active' | 'inactive';
  }) {
    const { data } = await apiClient.post<Faq>('/api/admin/faqs', payload);
    return data;
  },
  async updateFaq(
    id: string,
    payload: Partial<{
      question: LocalizedText;
      answer: LocalizedText;
      sortOrder: number;
      status: 'active' | 'inactive';
    }>,
  ) {
    const { data } = await apiClient.patch<Faq>(`/api/admin/faqs/${id}`, payload);
    return data;
  },
  async deleteFaq(id: string) {
    const { data } = await apiClient.delete(`/api/admin/faqs/${id}`);
    return data;
  },

  /* ---------- Testimonials ---------- */
  async listTestimonials(params?: { page?: number; limit?: number; status?: string }) {
    const { data } = await apiClient.get<Paginated<Testimonial>>(
      '/api/admin/testimonials',
      { params },
    );
    return data;
  },
  async approveTestimonial(id: string) {
    const { data } = await apiClient.patch(`/api/admin/testimonials/${id}/approve`);
    return data;
  },
  async rejectTestimonial(id: string, reason?: string) {
    const { data } = await apiClient.patch(`/api/admin/testimonials/${id}/reject`, {
      status: 'rejected',
      reason,
    });
    return data;
  },
  async deleteTestimonial(id: string) {
    const { data } = await apiClient.delete(`/api/admin/testimonials/${id}`);
    return data;
  },

  /* ---------- Site Content ---------- */
  async listSiteContent() {
    const { data } = await apiClient.get<SiteContent[]>('/api/admin/site');
    return data;
  },
  async updateSiteContent(key: string, content: Record<string, any>) {
    const { data } = await apiClient.put(`/api/admin/site/${key}`, { content });
    return data;
  },

  /* ---------- Emergency Settings ---------- */
  async getEmergency() {
    const { data } = await apiClient.get<EmergencySettings>(
      '/api/admin/emergency-settings',
    );
    return data;
  },
  async updateEmergency(payload: { enabled?: boolean; message?: LocalizedText }) {
    const { data } = await apiClient.put(
      '/api/admin/emergency-settings',
      payload,
    );
    return data;
  },
};

export default contentService;