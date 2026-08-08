import axios, { AxiosInstance } from "axios";
import { jwtDecode } from "jwt-decode";

type DecodedToken = {
  userId?: string;
  role?: string;
  tenantId?: string | null;
  exp?: number;
  name?: string;
};

const ROLE_DASHBOARD: Record<string, string> = {
  super_admin: "/dashboard/super-admin",
  teacher: "/dashboard/teacher",
  assistant: "/dashboard/assistant",
  parent: "/dashboard/parent",
  student: "/dashboard/student",
  admin: "/dashboard/super-admin",
  instructor: "/dashboard/teacher",
  user: "/dashboard/student",
};

const normalizeRole = (role?: string | null) => {
  if (!role) return null;
  if (role === "admin") return "super_admin";
  if (role === "instructor") return "teacher";
  if (role === "user") return "student";
  return role;
};

class AuthServices {
  private URLAPI: string;
  private token: string;
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;

  constructor() {
    this.URLAPI = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    this.token = localStorage.getItem("token") || "";
    this.axiosInstance = axios.create({
      baseURL: this.URLAPI,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });

    if (this.token) {
      this.axiosInstance.defaults.headers["Authorization"] = `Bearer ${this.token}`;
    }
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use((config) => {
      try {
        const fromSession = sessionStorage.getItem('ce_tenant_slug');
        const raw = localStorage.getItem('ce_tenant');
        const slug = fromSession || (raw ? JSON.parse(raw)?.slug : null);
        if (slug) {
          config.headers = config.headers || {};
          config.headers['X-Tenant-Slug'] = slug;
        }
      } catch {
        /* ignore */
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && this.getToken()) {
          originalRequest._retry = true;
          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            }
            this.handleLogout();
          } catch {
            this.handleLogout();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async register(userData: Record<string, unknown> | string) {
    const response = await this.axiosInstance.post(`/api/auth/register`, userData);
    return response.data;
  }

  async verifyEmail(email: string, code: string) {
    const response = await this.axiosInstance.post(`/api/auth/verify-email`, { email, code });
    if (response.data.accessToken) {
      this.setToken(response.data.accessToken);
      if (response.data.user?.name) localStorage.setItem("ce_user_name", response.data.user.name);
      if (response.data.tenant) localStorage.setItem("ce_tenant", JSON.stringify(response.data.tenant));
      if (response.data.tenant?.slug) sessionStorage.setItem("ce_tenant_slug", response.data.tenant.slug);
    }
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.axiosInstance.post(
      `/api/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    if (response.data.accessToken) this.setToken(response.data.accessToken);
    if (response.data.user?.name) localStorage.setItem("ce_user_name", response.data.user.name);
    if (response.data.user?.preferredLanguage) localStorage.setItem("ce_lang", response.data.user.preferredLanguage);
    if (response.data.tenant) localStorage.setItem("ce_tenant", JSON.stringify(response.data.tenant));
    if (response.data.tenant?.slug) sessionStorage.setItem("ce_tenant_slug", response.data.tenant.slug);
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.axiosInstance.post(`/api/auth/forgot-password`, { email });
    return response.data;
  }

  async resetPassword(email: string, newPassword: string, resetCode: string) {
    const response = await this.axiosInstance.post(`/api/auth/reset-password`, { email, newPassword, resetCode });
    return response.data;
  }

  async logout() {
    try {
      const response = await this.axiosInstance.post(`/api/auth/logout`, {}, { withCredentials: true });
      this.handleLogout();
      return response.data;
    } catch (error) {
      this.handleLogout();
      throw error;
    }
  }

  async me() {
    const response = await this.axiosInstance.get(`/api/auth/me`);
    return response.data;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("token", token);
    this.axiosInstance.defaults.headers["Authorization"] = `Bearer ${token}`;
  }

  getToken(): string {
    return this.token || localStorage.getItem("token") || "";
  }

  decoded(token: string): DecodedToken {
    return jwtDecode(token);
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return normalizeRole(this.decoded(token)?.role || null);
    } catch {
      return null;
    }
  }

  getDashboardPath(role?: string | null): string {
    const r = normalizeRole(role || this.getRole());
    return (r && ROLE_DASHBOARD[r]) || "/dashboard/student";
  }

  getUserName(): string {
    return localStorage.getItem("ce_user_name") || "User";
  }

  getTenantId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return this.decoded(token)?.tenantId || null;
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const decodedToken = this.decoded(token);
      return !decodedToken.exp || decodedToken.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  }

  async refreshToken() {
    if (!this.getToken() || this.isRefreshing) return null;
    this.isRefreshing = true;
    try {
      const response = await this.axiosInstance.post("/api/auth/refresh", {}, { withCredentials: true });
      if (response.data.accessToken) {
        this.setToken(response.data.accessToken);
        return response.data.accessToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  async updateProfile(payload: { name?: string; phone_number?: string; gradeLevel?: string }) {
    const response = await this.axiosInstance.patch("/api/auth/profile", payload);
    return response.data;
  }

  handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiration");
    localStorage.removeItem("ce_user_name");
    localStorage.removeItem("ce_tenant");
    this.token = "";
    this.axiosInstance.defaults.headers["Authorization"] = "";
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export default AuthServices;
export { ROLE_DASHBOARD, normalizeRole };
