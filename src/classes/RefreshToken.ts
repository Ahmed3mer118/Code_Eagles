import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";
import AuthServices from "./Auth";

class RefreshToken {
  private URLAPI: string;
  private token: string | null;
  private axiosInstance: AxiosInstance;

  constructor( private _authServices :AuthServices) {
    this.URLAPI = import.meta.env.VITE_API_URL;
    this.token = this._authServices.getToken();

    this.axiosInstance = axios.create({
      baseURL: this.URLAPI,
      headers: {
        "Content-Type": "application/json",
        Authorization: ` ${this.token}`,
      },
    });
  }

  public async refresh(): Promise<string> {
    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token found in cookies");
    }

    try {
      const response = await this.axiosInstance.post("/api/users/refresh-token", {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      this._authServices.setToken(accessToken)
      Cookies.set("refreshToken", newRefreshToken, {
        expires: 7,
        secure: true,
        sameSite: "strict",
      });

      this.token = accessToken;
      this.axiosInstance.defaults.headers["Authorization"] = ` ${accessToken}`;

      return accessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  }


  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export default RefreshToken;
