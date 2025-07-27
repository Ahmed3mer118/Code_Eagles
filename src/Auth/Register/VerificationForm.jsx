import React, { useState, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthServices from "../../classes/Auth";

function VerificationForm() {
  const [codeDigits, setCodeDigits] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const authServices = new AuthServices();
  const email = location.state;

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) return;

    const newDigits = [...codeDigits];
    newDigits[index] = value[0]; // allow only one digit
    setCodeDigits(newDigits);

    // Move to next input
    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (codeDigits[index]) {
        const newDigits = [...codeDigits];
        newDigits[index] = "";
        setCodeDigits(newDigits);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    const code = codeDigits.join("");
    if (code.length < 6) {
      toast.error("Enter the full 6-digit code");
      return;
    }

    setLoading(true);
    try {
      
      const res = await authServices.verifyEmail(email, code);
      if (res) {
        toast.success(`Welcome ${email}`);
        setTimeout(() => navigate("/auth/login"), 2000);
      } else {
        toast.error("Verification failed");
      }
    } catch (error) {
      toast.error("An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Toaster />
      <form
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-6"
        onSubmit={handleVerification}
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Verification Code
        </h2>

        <div className="flex justify-between gap-2">
          {codeDigits.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputsRef.current[index] = el)}
              className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              pattern="\d*"
              inputMode="numeric"
              required
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={codeDigits.join("").length < 6 || loading}
          className={`w-full py-2 text-white rounded-md transition ${
            codeDigits.join("").length < 6 || loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? (
            <span className="flex justify-center items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              Verifying...
            </span>
          ) : (
            "Verify Code"
          )}
        </button>

        {/* <div className="text-center">
          <Link
            to="/register"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Didn't receive code? Register again
          </Link>
        </div> */}
      </form>
    </div>
  );
}

export default VerificationForm;
