import apiClient from './client';

/* ======================= Types ======================= */
export type PlatformRole = 'user' | 'super_admin';
export type ActiveStatus = 'active' | 'inactive' | 'suspended';
export type PreferredLanguage = 'ar' | 'en';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  platformRole: PlatformRole;
  preferredLanguage?: PreferredLanguage;
  profileImageUrl?: string | null;
  isVerified: boolean;
  status: ActiveStatus;
  gradeLevel?: string | null;
  parentPhone?: string | null;
  childContact?: string | null;
  lastLoginAt?: string | null;
  failedLoginCount?: number;
  lockedUntil?: string | null;
  emailVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  metadata?: Record<string, any>;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  platformRole?: PlatformRole;
  status?: ActiveStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeDeleted?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phoneNumber?: string;
  platformRole?: PlatformRole;
  preferredLanguage?: PreferredLanguage;
  gradeLevel?: string;
  parentPhone?: string;
  childContact?: string;
  profileImageUrl?: string;
}

export interface UserSession {
  id: string;
  deviceId?: string;
  deviceName?: string;
  userAgent?: string;
  ipAddress?: string;
  lastUsedAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  success?: boolean;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

/* ======================= Service ======================= */
const ADMIN_BASE = '/api/admin/users';

export const adminUsersService = {
  /* ---- List ---- */
  async list(params: QueryUsersParams = {}): Promise<Paginated<AdminUser>> {
    const { data } = await apiClient.get<Paginated<AdminUser>>(ADMIN_BASE, {
      params,
    });
    return data;
  },

  /* ---- Get one ---- */
  async getOne(id: string): Promise<AdminUser> {
    const { data } = await apiClient.get<AdminUser>(`${ADMIN_BASE}/${id}`);
    return data;
  },

  /* ---- Update ---- */
  async update(id: string, payload: UpdateUserPayload): Promise<AdminUser> {
    const { data } = await apiClient.patch<AdminUser>(
      `${ADMIN_BASE}/${id}`,
      payload,
    );
    return data;
  },

  /* ---- Change status ---- */
  async updateStatus(id: string, status: ActiveStatus) {
    const { data } = await apiClient.patch(`${ADMIN_BASE}/${id}/status`, {
      status,
    });
    return data;
  },

  /* ---- Unlock ---- */
  async unlock(id: string) {
    const { data } = await apiClient.post(`${ADMIN_BASE}/${id}/unlock`);
    return data;
  },

  /* ---- Verify email ---- */
  async verifyEmail(id: string) {
    const { data } = await apiClient.post(
      `${ADMIN_BASE}/${id}/verify-email`,
    );
    return data;
  },

  /* ---- Reset password ---- */
  async resetPassword(
    id: string,
    payload: { newPassword: string; confirmPassword: string },
  ) {
    const { data } = await apiClient.post(
      `${ADMIN_BASE}/${id}/reset-password`,
      payload,
    );
    return data;
  },

  /* ---- Delete ---- */
  async remove(id: string) {
    const { data } = await apiClient.delete(`${ADMIN_BASE}/${id}`);
    return data;
  },

  /* ---- Restore ---- */
  async restore(id: string) {
    const { data } = await apiClient.post(`${ADMIN_BASE}/${id}/restore`);
    return data;
  },

  /* ---- Activity ---- */
  async getActivity(
    id: string,
    page = 1,
    limit = 20,
  ): Promise<Paginated<ActivityItem>> {
    const { data } = await apiClient.get<Paginated<ActivityItem>>(
      `${ADMIN_BASE}/${id}/activity`,
      { params: { page, limit } },
    );
    return data;
  },

  /* ---- Sessions ---- */
  async getSessions(id: string): Promise<UserSession[]> {
    const { data } = await apiClient.get<UserSession[]>(
      `${ADMIN_BASE}/${id}/sessions`,
    );
    return Array.isArray(data) ? data : (data as any)?.data || [];
  },

  async revokeSessions(id: string) {
    const { data } = await apiClient.post(
      `${ADMIN_BASE}/${id}/revoke-sessions`,
    );
    return data;
  },
};

export default adminUsersService;
