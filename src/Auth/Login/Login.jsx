import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import FingerprintJs from "@fingerprintjs/fingerprintjs";
import AuthServices from "../../classes/Auth";

function Login() {
  const authServices = new AuthServices();
  const [login, setLogin] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  let currentTime = Date.now();
  let expirationTime;

  //  login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authServices.login(login.email, login.password);
      let redirectLocation = sessionStorage.getItem("redirectLocation");
      if (res) {
        toast.success("Login Successfully");
        const accessToken = res.accessToken;
        expirationTime = currentTime + 3 * 60 * 1000;
        let role = authServices.getRole();
        if (accessToken) {
          authServices.setToken(accessToken);
          localStorage.setItem("tokenExpiration", expirationTime);
          let redirectPath = "/";

          if (role == "admin") window.location.href = "/dashboard";
          else if (role == "instructor") window.location.href = "/instructor";
          else if (role == "user" && redirectLocation) {
            window.location.href = redirectLocation;
            sessionStorage.removeItem("redirectLocation");
            return;
          }
    
          window.location.href = redirectPath;
        }
      }
    } catch (error) {
      setLoading(false);
      if (error.response) {
        toast.error("The email or password is incorrect");
      } else if (error.response && error.response.status === 500) {
        toast.error("An error occurred on the server. Please try again later");
      } else {
        toast.error("Invaild Email Or Password ");
      }
    }
  };
  const handleLoginWithGoogle = () => {
    const googleLoginUrl = authServices.googleLoginUrl;
    window.location.href = googleLoginUrl;
  };

  useEffect(() => {
    async function getFingerPrint() {
      const fp = await FingerprintJs.load();
      const result = await fp.get();
      const fingerprint = result.visitorId;
      setLogin({ ...login, fingerprint });
      return result.visitorId;
    }

    getFingerPrint();
    const handleMessage = (event) => {
      const allowedOrigins = import.meta.env.VITE_ALLOWEDORIGINS.split(",")
      if (!allowedOrigins.includes(event.origin)) return;
      const { token } = event.data;
      if (token) {
        authServices.setToken(token);
        toast.success("Logged in successfully");

        const redirectUrl = sessionStorage.getItem("redirectAfterLogin") || "/";
        sessionStorage.removeItem("redirectAfterLogin");

        popup?.close();
        window.location.href = redirectUrl;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Password Reset Handler
  const handleForgetPass = async (e) => {
    e.preventDefault();
    if (!login.email) {
      toast.error("Please enter your email.");
    } else {
      setLoading(true);
      const res = await authServices.forgotPassword(login.email);
      if (res) {
        toast.success("Password reset email sent. Please check your inbox.");
        localStorage.setItem(
          "forget-password-token",
          JSON.stringify(token)
        );
        setTimeout(() => {
          navigate("/auth/forget-password");
        }, 2500);
      } else {
        console.log(res.message);
        toast.error("An error occurred on the server. Please try again later");
      }
    }
    setLoading(false);
  };

  return (
    <>
      <Toaster position="top-center" />
      {/* <Helmet>
        <title>Login</title>
      </Helmet> */}
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Login</h2>
            </div>

            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                  onChange={(e) =>
                    setLogin({ ...login, email: e.target.value })
                  }
                  value={login.email}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={10}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  onChange={(e) =>
                    setLogin({ ...login, password: e.target.value })
                  }
                  value={login.password}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={handleForgetPass}
                  disabled={loading}
                  className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                  aria-label="Forgot Password"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Submit"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>

            <div className="text-center text-sm">
              <Link
                to="/auth/register"
                className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                disabled={loading}
              >
                Don't have an account? Sign up
              </Link>
            </div>
          </form>
          {/* <div className="w-full flex justify-center">
            <button
              onClick={handleLoginWithGoogle}
              className="cursor-pointer text-black flex gap-2 items-center bg-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-zinc-300 transition-all ease-in duration-200"
            >
              <svg
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6"
              >
                <path
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  fill="#FFC107"
                ></path>
                <path
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  fill="#FF3D00"
                ></path>
                <path
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  fill="#4CAF50"
                ></path>
                <path
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  fill="#1976D2"
                ></path>
              </svg>
              Continue with Google
            </button>
          </div> */}
        </div>
      </div>
    </>
  );
}

export default Login;
