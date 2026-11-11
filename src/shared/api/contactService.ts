// src/shared/api/contactService.ts
import apiClient from './client';

export type ContactStatus = 'new_' | 'read_' | 'replied' | 'closed';

export interface ContactMessage {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  status: ContactStatus;
  replyMessage?: string | null;
  readAt?: string | null;
  repliedBy?: string | null;
  repliedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  replier?: { id: string; name: string; email: string } | null;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryContactMessagesParams {
  page?: number;
  limit?: number;
  status?: ContactStatus;
  search?: string;
}

export interface SendContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
}

export const contactService = {
  /* ---------- Public ---------- */
  async send(payload: SendContactPayload) {
    // ✅ بدون /api
    const { data } = await apiClient.post('/platform/contact', payload);
    return data;
  },

  /* ---------- Admin ---------- */
  async list(params: QueryContactMessagesParams = {}) {
    // ✅ بدون /api
    const { data } = await apiClient.get<Paginated<ContactMessage>>(
      '/admin/contact-messages',
      { params },
    );
    return data;
  },

  async getOne(id: string) {
    const { data } = await apiClient.get<ContactMessage>(
      `/admin/contact-messages/${id}`,
    );
    return data;
  },

  async reply(id: string, reply: string) {
    const { data } = await apiClient.patch<ContactMessage>(
      `/admin/contact-messages/${id}/reply`,
      { reply },
    );
    return data;
  },

  async close(id: string) {
    const { data } = await apiClient.patch<ContactMessage>(
      `/admin/contact-messages/${id}/close`,
    );
    return data;
  },

  async remove(id: string) {
    const { data } = await apiClient.delete(
      `/admin/contact-messages/${id}`,
    );
    return data;
  },

  async unreadCount() {
    const { data } = await apiClient.get<{ count: number }>(
      '/admin/contact-messages/unread-count',
    );
    return data;
  },
};

export default contactService;
