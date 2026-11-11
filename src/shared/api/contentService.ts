// src/shared/api/contentService.ts
import apiClient from './client';

export type LocalizedText = Record<string, string>;

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

export const contentService = {
  /* ---------- FAQs ---------- */
  async listFaqs(params?: { page?: number; limit?: number; status?: string }) {
    // ✅ بدون /api
    const { data } = await apiClient.get<Paginated<Faq>>('/admin/faqs', {
      params,
    });
    return data;
  },
  async createFaq(payload: {
    question: LocalizedText;
    answer: LocalizedText;
    sortOrder?: number;
    status?: 'active' | 'inactive';
  }) {
    const { data } = await apiClient.post<Faq>('/admin/faqs', payload);
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
    const { data } = await apiClient.patch<Faq>(
      `/admin/faqs/${id}`,
      payload,
    );
    return data;
  },
  async deleteFaq(id: string) {
    const { data } = await apiClient.delete(`/admin/faqs/${id}`);
    return data;
  },

  /* ---------- Testimonials ---------- */
  async listTestimonials(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const { data } = await apiClient.get<Paginated<Testimonial>>(
      '/admin/testimonials',
      { params },
    );
    return data;
  },
  async approveTestimonial(id: string) {
    const { data } = await apiClient.patch(
      `/admin/testimonials/${id}/approve`,
    );
    return data;
  },
  async rejectTestimonial(id: string, reason?: string) {
    const { data } = await apiClient.patch(
      `/admin/testimonials/${id}/reject`,
      { status: 'rejected', reason },
    );
    return data;
  },
  async deleteTestimonial(id: string) {
    const { data } = await apiClient.delete(
      `/admin/testimonials/${id}`,
    );
    return data;
  },

  /* ---------- Site Content ---------- */
  async listSiteContent() {
    // ✅ بدون /api
    const { data } = await apiClient.get<SiteContent[]>('/admin/site');
    return data;
  },

  async getSiteByKey(key: string) {
    const { data } = await apiClient.get<SiteContent>(
      `/admin/site/${encodeURIComponent(key)}`,
    );
    return data;
  },

  async updateSiteContent(key: string, content: Record<string, any>) {
    const { data } = await apiClient.put(
      `/admin/site/${encodeURIComponent(key)}`,
      { content },
    );
    return data;
  },

  async bulkUpdateSiteContent(
    items: Array<{ key: string; content: Record<string, any> }>,
  ) {
    const { data } = await apiClient.put('/admin/site/bulk/update', {
      items,
    });
    return data;
  },

  async seedLandingDefaults() {
    const { data } = await apiClient.post('/admin/site/seed-landing');
    return data;
  },

  async listSiteKeys() {
    const { data } = await apiClient.get<{
      data: Array<{ key: string; updatedAt?: string; preview: string }>;
    }>('/admin/site/keys');
    return data.data ?? data;
  },

  async deleteSiteContent(key: string) {
    const { data } = await apiClient.delete(
      `/admin/site/${encodeURIComponent(key)}`,
    );
    return data;
  },

  /* ---------- Emergency Settings ---------- */
  async getEmergency() {
    const { data } = await apiClient.get<EmergencySettings>(
      '/admin/emergency-settings',
    );
    return data;
  },
  async updateEmergency(payload: {
    enabled?: boolean;
    message?: LocalizedText;
  }) {
    const { data } = await apiClient.put(
      '/admin/emergency-settings',
      payload,
    );
    return data;
  },
};

export default contentService;
