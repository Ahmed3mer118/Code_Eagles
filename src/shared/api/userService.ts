// src/shared/api/userService.ts
import apiClient from './client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  preferredLanguage?: string;
  profileImageUrl?: string | null;
  platformRole?: string | null;
  gradeLevel?: string | null;
  parentPhone?: string | null;
  childContact?: string | null;
  emailVerified?: boolean;
  createdAt?: string;
  memberships?: Membership[];
}

export interface Membership {
  id: string;
  tenantId: string;
  role: string;
  tenant?: { id: string; name: string; logo?: string | null };
}

export interface UpdateProfilePayload {
  name?: string;
  phoneNumber?: string;
  preferredLanguage?: 'ar' | 'en';
  profileImageUrl?: string | null;
  gradeLevel?: string;
  parentPhone?: string;
  childContact?: string;
}

export const userService = {
  async getMyProfile(): Promise<UserProfile> {
    const { data } = await apiClient.get('/users/me');        // ✅ بدون /api
    return (data?.user ?? data) as UserProfile;
  },

  async updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const { data } = await apiClient.patch('/users/me', payload);
    return (data?.user ?? data) as UserProfile;
  },

  async deleteMyAccount() {
    const { data } = await apiClient.delete('/users/me');
    return data;
  },

  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    const { data } = await apiClient.post('/users/me/change-password', payload);
    return data;
  },

  async requestEmailChange(payload: { newEmail: string; password: string }) {
    const { data } = await apiClient.post('/users/me/change-email', payload);
    return data;
  },

  async verifyEmailChange(payload: { token: string }) {
    const { data } = await apiClient.post('/users/me/verify-email-change', payload);
    return data;
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async removeAvatar() {
    const { data } = await apiClient.delete('/users/me/avatar');
    return data;
  },

  async getSessions() {
    const { data } = await apiClient.get('/users/me/sessions');
    return Array.isArray(data) ? data : data?.data || [];
  },

  async revokeAllSessions() {
    const { data } = await apiClient.delete('/users/me/sessions');
    return data;
  },

  async revokeSession(id: string) {
    const { data } = await apiClient.delete(`/users/me/sessions/${id}`);
    return data;
  },

  async getLoginHistory(page = 1, limit = 20) {
    const { data } = await apiClient.get('/users/me/login-history', {
      params: { page, limit },
    });
    return data;
  },
};

export default userService;
