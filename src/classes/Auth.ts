import axios, { AxiosInstance } from "axios";
import { jwtDecode } from "jwt-decode";
// import Cookies from "js-cookie";

class AuthServices {
  private URLAPI: string;
  private token: string;
  private axiosInstance: AxiosInstance;
  private role: any;
  googleLoginUrl: string;
  private readonly TOKEN_KEY = "token";

  constructor() {
    this.URLAPI = import.meta.env.VITE_API_URL;
    this.token = this.getToken() || "";
    this.googleLoginUrl = this.URLAPI + "/api/users/google";

    this.axiosInstance = axios.create({
      baseURL: this.URLAPI,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.token,
      },
      withCredentials: true,
    });
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
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
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

  async refreshToken() {
    try {
      const response = await this.axiosInstance.post(
        "/api/users/refresh-token",
        {},
        {
          withCredentials: true,
        }
      );
      // if (response.data.accessToken) {
        const newAccessToken = response.data.accessToken;
        this.setToken(newAccessToken)
        return newAccessToken;
      // }
      // return null;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message;

    if (errorMessage === "No refresh token provided" || errorMessage === "Invalid refresh token") {
      console.warn("Refresh token not available, user may be logged out.");
      return null;
    }

    console.error(error?.response?.data || error.message || error);
    return null;
    }
  }

  handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiration");
  }

}
export default AuthServices;
