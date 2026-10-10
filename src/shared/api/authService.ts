import apiClient, { setAuthSession, clearAuth } from './client';
import { STORAGE_KEYS } from '../config/apiBase';

/* ========== Types ========== */
export type AccountType = 'teacher' | 'student' | 'parent';
export type OnboardingRole = 'teacher' | 'student' | 'parent';
export type PreferredLanguage = 'ar' | 'en';

export interface RegisterPayload {
  accountType: AccountType;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  preferredLanguage?: PreferredLanguage;
  academyName?: string;
  requestedPlanId?: string;
  gradeLevel?: string;
  parentContact?: string;
  childContact?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  platformRole?: string | null;
  emailVerified?: boolean;
  isVerified?: boolean;
  needsOnboarding?: boolean;
  preferredLanguage?: string;
  profileImageUrl?: string | null;
  gradeLevel?: string | null;
  phoneNumber?: string | null;
}

export interface CurrentTenant {
  tenantId: string;
  role: string;
  tenantName?: string;
  tenantSlug?: string;
  tenantLogoUrl?: string | null;
  tenantStatus?: string;
  tenantApprovalStatus?: string;
  status?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  currentTenant?: CurrentTenant | null;
  memberships?: CurrentTenant[];
  isNewUser?: boolean;
  needsOnboarding?: boolean;
  requiresTenantSelection?: boolean;
}

export interface MeResponse {
  user: AuthUser;
  currentTenant?: CurrentTenant | null;
  memberships?: CurrentTenant[];
  needsOnboarding?: boolean;
}

/* ========== Service ========== */
export const authService = {
  /* ---- Register ---- */
  async register(payload: RegisterPayload) {
    const { data } = await apiClient.post<AuthResponse>(
      '/auth/register',
      payload,
    );
    // الباك مش بيرجّع توكن وقت التسجيل — محتاج verify الأول
    return data;
  },

  /* ---- Login ---- */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    setAuthSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tenantId: data.currentTenant?.tenantId,
      user: data.user,
    });
    return data;
  },

  /* ---- Logout ---- */
  async logout() {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } finally {
      clearAuth();
    }
  },

  async logoutAll() {
    try {
      await apiClient.post('/auth/logout-all');
    } finally {
      clearAuth();
    }
  },

  /* ---- Refresh ---- */
  async refresh(refreshToken: string, tenantId?: string) {
    const { data } = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
      tenantId,
    });
    setAuthSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tenantId: data.currentTenant?.tenantId,
      user: data.user,
    });
    return data;
  },

  /* ---- Password reset ---- */
  async forgotPassword(email: string) {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string,
  ) {
    const { data } = await apiClient.post('/auth/reset-password', {
      token,
      password,
      confirmPassword,
    });
    return data;
  },

  /* ---- Email verification ---- */
  async verifyEmail(token: string) {
    const { data } = await apiClient.post('/auth/verify-email', { token });
    return data;
  },

  async resendVerification(email: string) {
    const { data } = await apiClient.post('/auth/resend-verification', {
      email,
    });
    return data;
  },

  /* ---- Tenant switch ---- */
  async switchTenant(tenantId: string) {
    const { data } = await apiClient.post<AuthResponse>(
      '/auth/switch-tenant',
      { tenantId },
    );

    setAuthSession({
      accessToken: data?.accessToken,
      refreshToken: data?.refreshToken,
      tenantId: data?.currentTenant?.tenantId || tenantId,
      user: data?.user,
    });

    return data;
  },

  /* ---- Onboarding ---- */
  async selectRole(role: OnboardingRole) {
    const { data } = await apiClient.post('/auth/onboarding/select-role', {
      role,
    });
    return data;
  },

  async createAcademy(payload: {
    academyName: string;
    requestedPlanId: string;
    description?: string;
  }) {
    const { data } = await apiClient.post(
      '/auth/onboarding/teacher/create-academy',
      payload,
    );
    return data;
  },

  async completeOnboarding(payload: {
    role: OnboardingRole;
    phoneNumber?: string;
    academyName?: string;
    requestedPlanId?: string;
    gradeLevel?: string;
    parentContact?: string;
    childContact?: string;
  }) {
    const { data } = await apiClient.post(
      '/auth/onboarding/complete',
      payload,
    );
    return data;
  },

  /* ---- Me ---- */
  async me(tenantId?: string): Promise<MeResponse> {
    const { data } = await apiClient.get<MeResponse>('/auth/me', {
      params: tenantId ? { tenantId } : undefined,
    });
    return data;
  },
};

export default authService;