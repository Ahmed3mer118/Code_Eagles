import React, { useContext, useEffect } from "react";
import Navbar from "./Navbar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Footer from "../Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Helmet } from "react-helmet-async";
import { DataContext } from "../Context/Context";
import axios from "axios";
import Cookies from "js-cookie";
import { Toaster } from "react-hot-toast";

function Layout() {
  const navigate = useNavigate();
  const { URLAPI } = useContext(DataContext);
  const location = useLocation();

  const showFooter =
    location.pathname === "/my-courses" ||
    location.pathname === "/profile" ||
    location.pathname === "/courses";

  const refreshToken = async () => {
    try {
      const refreshTokenLocal = Cookies.get("refreshTokenUser");

      if (!refreshTokenLocal) {
        handleLogout();
        throw new Error("لم يتم العثور على توكن التحديث");
      }

      const response = await axios.post(`${URLAPI}/api/users/refresh-token`, {
        refreshToken: refreshTokenLocal,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      const expirationTime = Date.now() + 15 * 60 * 1000; // 15 دقائق

      localStorage.setItem("tokenUser", JSON.stringify(accessToken));
      localStorage.setItem("tokenExpirationUser", JSON.stringify(expirationTime));
      Cookies.set("refreshTokenUser", newRefreshToken, {
        expires: 7,
        secure: true,
        sameSite: "strict",
      });

      axios.defaults.headers.common["Authorization"] = `${accessToken}`;

      return true;
    } catch (error) {
      console.error("فشل في تحديث التوكن:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = Cookies.get("refreshTokenUser");
      if (refreshToken) {
        await axios.post(`${URLAPI}/api/users/logout`, {
          refreshToken
        });
      }
          
      localStorage.removeItem("tokenUser");
      localStorage.removeItem("tokenExpirationUser");
      Cookies.remove("refreshTokenUser");
    

      toast.success("Logged out successfully");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      console.error("خطأ أثناء تسجيل الخروج:", err);
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  useEffect(() => {
    const checkTokenExpiration = async () => {
      const expiration = JSON.parse(localStorage.getItem("tokenExpirationUser"));
      if (!expiration) return;

      const timeLeft = expiration - Date.now();

      if (timeLeft <= 15 * 60 * 1000) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          handleLogout();
        }
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 15 * 60 * 1000);
    return () => clearInterval(interval);
  },[navigate]);

  return (
    <div>
     
      <Helmet>
        <title>Code Eagles</title>
      </Helmet>
      <Navbar />
      <main>
        <Outlet />
      </main>
      {!showFooter && <Footer />}
    </div>
  );
}

export default Layout;
