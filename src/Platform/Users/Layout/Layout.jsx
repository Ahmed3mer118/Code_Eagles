import React, { useContext, useEffect, useState } from "react";
import Navbar from "./Navbar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Footer from "../Footer";
import { toast, Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { DataContext } from "../Context/Context";
import Cookies from "js-cookie";
import UserService from "../../classes/UserService";

function Layout() {
  const navigate = useNavigate();
  const { getTokenUser } = useContext(DataContext);
  const [userService] = useState(new UserService(getTokenUser));
  const location = useLocation();

  const showFooter =
    location.pathname === "/my-courses" ||
    location.pathname === "/profile" ||
    location.pathname === "/courses";

  const handleLogout = async () => {
    try {
      const refreshToken = Cookies.get("refreshTokenUser");
      if (refreshToken) {
        await userService.logout(refreshToken);
      }
      userService.handleLogout();
    } catch (err) {
      console.error("Error logging out:", err);
      toast.error("Error logging out");
    }
  };

  useEffect(() => {
    const checkTokenExpiration = async () => {
      const expiration = JSON.parse(localStorage.getItem("tokenExpirationUser"));
      if (!expiration) return;

      const timeLeft = expiration - Date.now();

      if (timeLeft <= 15 * 60 * 1000) {
        const refreshToken = Cookies.get("refreshTokenUser");
        if (refreshToken) {
          try {
            const response = await userService.refreshToken(refreshToken);
            const expirationTime = Date.now() + 15 * 60 * 1000;
            localStorage.setItem("tokenExpirationUser", JSON.stringify(expirationTime));
          } catch (error) {
            console.error("Failed to refresh token:", error);
            handleLogout();
          }
        } else {
          handleLogout();
        }
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [navigate]);

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
