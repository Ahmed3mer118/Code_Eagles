import React, { useEffect } from "react";
import Navbar from "./Navbar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Footer from "../Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Helmet } from "react-helmet-async";

function Layout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("tokenUser");
  const expiration = localStorage.getItem("tokenExpirationUser");
  const location = useLocation();

  const showFooter =
    location.pathname === "/my-courses" || location.pathname === "/profile";

  // التحقق من انتهاء صلاحية الـ token
  useEffect(() => {
    if (token && expiration) {
      const currentTime = Date.now();
      if (currentTime > expiration) {
        localStorage.removeItem("tokenUser");
        localStorage.removeItem("tokenExpirationUser");
        toast.error("Session expired. Please log in again.");
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      }
    }
  }, [token, expiration]);


  // دالة لإنشاء سلسلة عشوائية
  const generateRandomString = (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }

    return result;
  };

  // إضافة مستمعات الأحداث
  useEffect(() => {
    window.addEventListener("paste", (event) => {
      const pastedText = event.clipboardData.getData("tokenUser");
      console.log(pastedText);

      // التحقق مما إذا كان النص الملصق هو الـ token
      if (pastedText === token) {
        event.preventDefault(); // منع اللصق الأصلي

        // تغيير القيمة الملصقة
        const newValue = generateRandomString(100); // إنشاء قيمة عشوائية
        document.execCommand("insertText", false, newValue);

        console.log("تم تغيير الـ token عند اللصق:", newValue);
      }
    });
    window.addEventListener("copy", (event) => {
      const selectedText = window.getSelection().toString();

      // التحقق مما إذا كان النص المنسوخ هو الـ token
      if (selectedText === token) {
        event.preventDefault(); // منع النسخ الأصلي
        console.log("تم منع نسخ الـ token!");
      }
    });

  }, [token]);

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
