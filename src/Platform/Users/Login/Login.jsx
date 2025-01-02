import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import "../Register/register.css";
import { DataContext } from "../Context/Context";

function Login() {
  const { URLAPI } = useContext(DataContext);
  const [login, setLogin] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${URLAPI}/api/users/login`, {
        email: login.email,
        password: login.password,
      });

      if (res.data) {
        toast.success("Login successful!");

        const currentTime = Date.now();
        const expirationTime = currentTime + 3 * 60 * 60 * 1000;
        if (res.data.user.role === "admin") {
          localStorage.setItem("tokenAdmin", JSON.stringify(res.data.token));
          localStorage.setItem("tokenExpirationAdmin", expirationTime);
          setTimeout(() => {
            navigate("/admin");
          }, 3000);
        } else {
          localStorage.setItem("tokenUser", JSON.stringify(res.data.token));
          localStorage.setItem("tokenExpirationUser", expirationTime);
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        }
      }
    } catch (error) {
      setLoading(false);

      if (error.response) {
        // إذا كانت بيانات تسجيل الدخول غير صحيحة
        toast.error("Invalid email or password.");
      } else if (error.response && error.response.status === 500) {
        // إذا حدث خطأ في الخادم
        toast.error("Server error. Please try again later.");
      } else {
        // لأي خطأ آخر
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Password Reset Handler
  const handleForgetPass = async (e) => {
    e.preventDefault();
    if (!login.email) {
      toast.error("Please enter your email.");
    } else {
      setLoading(true);
      toast.success("Password reset email sent. Please check your inbox.");
      await axios
        .post(`${URLAPI}/api/users/forgot-password`, {
          email: login.email,
        })
        .then(() => {
          toast.success("Password reset email sent. Please check your inbox.");
          navigate("/forgetpassword");
        })
        .catch((err) => {
          toast.error("Failed to send password reset email.");
          setLoading(false);
        });
    }
  };

  return (
    <>
      <ToastContainer />
      <Helmet>
        <title>Login</title>
      </Helmet>
      <div className="bg-form">
        <form className="p-3 rounded" onSubmit={handleLogin}>
          <h1 className="text-center text-light">Login</h1>

          <input
            type="email"
            placeholder="Email"
            className="form-control border rounded mt-3"
            required
            onChange={(e) => setLogin({ ...login, email: e.target.value })}
            value={login.email}
          />
          <input
            type="password"
            placeholder="Password"
            className="form-control border rounded mt-3"
            required
            onChange={(e) => setLogin({ ...login, password: e.target.value })}
            value={login.password}
            minLength={10}
          />

          <div className="mt-2 p-2">
            <button
              className="btn btn-primary d-block w-100 m-auto"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Submit"}
            </button>
          </div>

          <Link
            to={"/register"}
            className="text-decoration-underline p-2 mt-2 text-light btn"
          >
            Sign up
          </Link>

          <button
            onClick={handleForgetPass}
            className="btn mt-2 text-light"
            disabled={loading}
          >
            Forgot Password
          </button>
        </form>
      </div>
    </>
  );
}

export default Login;
