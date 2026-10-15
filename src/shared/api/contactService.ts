import apiClient from './client';

/* ======================= Types ======================= */
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
  replier?: {
    id: string;
    name: string;
    email: string;
  } | null;
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

/* ======================= Service ======================= */
export const contactService = {
  /* ---------- Public (Landing Page) ---------- */
  async send(payload: SendContactPayload) {
    const { data } = await apiClient.post('/api/platform/contact', payload);
    return data;
  },

  /* ---------- Admin (Super Admin) ---------- */
  async list(params: QueryContactMessagesParams = {}) {
    const { data } = await apiClient.get<Paginated<ContactMessage>>(
      '/api/admin/contact-messages',
      { params },
    );
    return data;
  },

  async getOne(id: string) {
    const { data } = await apiClient.get<ContactMessage>(
      `/api/admin/contact-messages/${id}`,
    );
    return data;
  },

  async reply(id: string, reply: string) {
    const { data } = await apiClient.patch<ContactMessage>(
      `/api/admin/contact-messages/${id}/reply`,
      { reply },
    );
    return data;
  },

  async close(id: string) {
    const { data } = await apiClient.patch<ContactMessage>(
      `/api/admin/contact-messages/${id}/close`,
    );
    return data;
  },

  async remove(id: string) {
    const { data } = await apiClient.delete(
      `/api/admin/contact-messages/${id}`,
    );
    return data;
  },

  async unreadCount() {
    const { data } = await apiClient.get<{ count: number }>(
      '/api/admin/contact-messages/unread-count',
    );
    return data;
  },
};

export default contactService;
