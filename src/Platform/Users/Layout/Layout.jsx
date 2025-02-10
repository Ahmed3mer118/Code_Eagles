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
        throw new Error("No refresh token found");
      }

      const response = await axios.post(`${URLAPI}/api/users/refresh-token`, {
        refreshToken: refreshTokenLocal,
      });

      const { accessToken, refreshToken } = response.data;
      const expirationTime = Date.now() + 15 * 60 * 1000; 

      localStorage.setItem("tokenUser", JSON.stringify(accessToken) );
      localStorage.setItem("tokenExpirationUser", JSON.stringify(expirationTime));
      // Cookies.set("refreshTokenUser", refreshToken, { expires: 10 });

      axios.defaults.headers.common["Authorization"] = `${accessToken}`;

      console.log("Token refreshed successfully");
    } catch (error) {
      console.error(" Failed to refresh token:", error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("tokenUser");
    localStorage.removeItem("tokenExpirationUser");
    Cookies.remove("refreshTokenUser");

    toast.error("Session expired. Please log in again.");
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  useEffect(() => {
    const checkTokenExpiration = () => {
      const expiration = JSON.parse(localStorage.getItem("tokenExpirationUser"));
      if (!expiration) return;

      const timeLeft = expiration - Date.now();
      if (timeLeft <= 0) {
        refreshToken();
      }
    };

    checkTokenExpiration();

    
    const interval = setInterval(checkTokenExpiration,  60 * 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div>
      <ToastContainer />
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
