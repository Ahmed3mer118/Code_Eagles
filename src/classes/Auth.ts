import axios, { AxiosInstance } from "axios";
import { jwtDecode } from "jwt-decode";

class AuthServices {
  private URLAPI: string;
  private token: string;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.URLAPI = import.meta.env.VITE_API_URL;
    this.token = localStorage.getItem("token") || "";
    this.axiosInstance = axios.create({
      baseURL: this.URLAPI,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    if (this.token) {
      this.axiosInstance.defaults.headers["Authorization"] = this.token;
    }

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // تحقق من وجود token قبل محاولة التجديد
        if (error.response?.status === 401 && !originalRequest._retry && this.getToken()) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              // تحديث الـ token في الطلب الأصلي
              originalRequest.headers["Authorization"] = newToken;
              return this.axiosInstance(originalRequest);
            } else {
              // إذا فشل الـ refresh، أعد توجيه للدخول
              console.log("❌ فشل في تجديد الـ token، إعادة توجيه للدخول");
              this.handleLogout();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            console.log("❌ خطأ في تجديد الـ token، إعادة توجيه للدخول");
            this.handleLogout();
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async register(userData: string) {
    try {
      const response = await this.axiosInstance.post(
        `/api/users/register`,
        userData
      );
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  }

  async verifyEmail(email: string, code: string) {
    try {
      const response = await this.axiosInstance.post(
        `/api/users/verify-email`,
        { email, code }
      );
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  }
  
  async login(email: string, password: string) {
    try {
      const response = await this.axiosInstance.post(`/api/users/login`, {
        email,
        password,
      },{ withCredentials: true});
      
      // Store access token after successful login
      if (response.data.accessToken) {
        this.setToken(response.data.accessToken);
      }
      
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  }
  
  async loginWithGoogle() {
    try {
      const response = await this.axiosInstance.get(`/api/users/google`);
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  }
  
  async forgotPassword(email: string) {
    try {
      const response = await this.axiosInstance.post(
        `/api/users/forgot-password`,
        { email }
      );
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  }

  async resetPassword(email: string, newPassword: string, resetCode: string) {
    try {
      const response = await this.axiosInstance.post(
        `/api/users/reset-password`,
        { email, newPassword, resetCode }
      );
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  }

  async logout() {
    try {
      const response = await this.axiosInstance.post(
        `/api/users/logout`,
        {},
        {
          headers: {
            Authorization: "",
          },
          withCredentials: true, 
        }
      );
  
      this.handleLogout(); 
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  }
  

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("token", token);
    this.axiosInstance.defaults.headers["Authorization"] = token;
  }

  getToken(): string {
    return this.token || localStorage.getItem("token") || "";
  }
  
  decoded(token: string) {
    return jwtDecode(token);
  }
  
  getRole(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = this.decoded(token);
      return decodedToken?.role || null;
    }
    return null;
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      const decodedToken: any = this.decoded(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  private isRefreshing = false;

  async refreshToken() {
    if (!this.getToken()) {
      console.log("⚠️ لا يوجد token للتجديد");
      return null;
    }
  
    // لو في عملية تجديد شغالة بالفعل، ماتنفذش تاني
    if (this.isRefreshing) {
      console.log("⏳ عملية تجديد أخرى جارية، في انتظارها...");
      return null;
    }
  
    this.isRefreshing = true;
  
    try {
      console.log("🔄 محاولة تجديد الـ token...");
      const response = await this.axiosInstance.post("/api/users/refresh-token", {}, { withCredentials: true });
  
      if (response.data.accessToken) {
        const newAccessToken = response.data.accessToken;
        this.setToken(newAccessToken);
        console.log("✅ تم تجديد الـ token بنجاح");
        return newAccessToken;
      }
      return null;
    } catch (error: any) {
      console.error("❌ فشل في تجديد الـ token:", error?.response?.data?.message || error?.message);
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }
  

  handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiration");
    this.token = "";
    this.axiosInstance.defaults.headers["Authorization"] = "";
    console.log("User logged out, tokens cleared");
  }

  // Get axios instance with automatic token refresh
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export default AuthServices;
