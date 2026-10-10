import apiClient from './client';

/* ========== Types ========== */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  preferredLanguage?: string;
  profileImageUrl?: string | null;
  platformRole?: string | null;
  gradeLevel?: string | null;
  emailVerified?: boolean;
  createdAt?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phoneNumber?: string;
  preferredLanguage?: 'ar' | 'en';
  profileImageUrl?: string | null;
}

export interface SessionItem {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  createdAt?: string;
  lastActiveAt?: string;
  isCurrent?: boolean;
}

/* ========== Service ========== */
export const userService = {
  /* ----- Profile ----- */
  async getMyProfile(): Promise<UserProfile> {
    const { data } = await apiClient.get('/api/users/me');
    return (data?.user ?? data) as UserProfile;
  },

  async updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const { data } = await apiClient.patch('/api/users/me', payload);
    return (data?.user ?? data) as UserProfile;
  },

  async deleteMyAccount() {
    const { data } = await apiClient.delete('/api/users/me');
    return data;
  },

  /* ----- Change password ----- */
  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    const { data } = await apiClient.post(
      '/api/users/me/change-password',
      payload,
    );
    return data;
  },

  /* ----- Change email ----- */
  async requestEmailChange(payload: { newEmail: string; password: string }) {
    const { data } = await apiClient.post(
      '/api/users/me/change-email',
      payload,
    );
    return data;
  },

  async verifyEmailChange(payload: { token: string }) {
    const { data } = await apiClient.post(
      '/api/users/me/verify-email-change',
      payload,
    );
    return data;
  },

  /* ----- Avatar ----- */
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/api/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async removeAvatar() {
    const { data } = await apiClient.delete('/api/users/me/avatar');
    return data;
  },

  /* ----- Sessions ----- */
  async getSessions(): Promise<SessionItem[]> {
    const { data } = await apiClient.get('/api/users/me/sessions');
    return Array.isArray(data) ? data : data?.data || [];
  },

  async revokeAllSessions() {
    const { data } = await apiClient.delete('/api/users/me/sessions');
    return data;
  },

  async revokeSession(id: string) {
    const { data } = await apiClient.delete(`/api/users/me/sessions/${id}`);
    return data;
  },

  async getLoginHistory(page = 1, limit = 20) {
    const { data } = await apiClient.get('/api/users/me/login-history', {
      params: { page, limit },
    });
    return data;
  },
};

export default userService;