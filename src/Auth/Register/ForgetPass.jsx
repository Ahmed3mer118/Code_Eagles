import axios from "axios";
import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AuthServices from "../../classes/Auth";

function ForgetPass() {
  const authServices = new AuthServices();
  const URL = authServices.URLAPI;

  const [forgetPass, setForgetPass] = useState({
    email: "",
    resetCode: "",
    newPassword: "",
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const code = forgetPass.resetCode.replace(/\s+/g, "");
      const res = await authServices.resetPassword(
        forgetPass.email,
        forgetPass.newPassword,
        code
      );
      if (res) {
        setLoading(false);
        toast.success("Reset Successful , Please Login");
        localStorage.removeItem("forget-password-token")
        setTimeout(() => navigate("/auth/login"), 2500);
      } else {
        setLoading(false);
        toast.error("Error: Invalid Reset Code");
    } 
 
    }catch (error) {
      setLoading(false);
      toast.error(error?.message)
  }
  };

  const handleChangeValue = (e) => {
    const inputNumber = e.target.value.replace(/\D/g, "");
    if (inputNumber.length <= 6) {
      const formattedInput = inputNumber.split("").join(" ");
      setForgetPass({ ...forgetPass, resetCode: formattedInput });

    } else {
      toast.error("Must be 6 digits");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Toaster />
      <form
        onSubmit={handleReset}
        className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md space-y-5"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Forget Password
        </h2>

        <input
          type="email"
          placeholder="Email"
          required
          value={forgetPass.email}
          onChange={(e) =>
            setForgetPass({ ...forgetPass, email: e.target.value })
          }
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Reset Code"
          required
          value={forgetPass.resetCode}
          onChange={handleChangeValue}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="New Password (min 10 chars)"
          required
          minLength={10}
          onChange={(e) =>
            setForgetPass({ ...forgetPass, newPassword: e.target.value })
          }
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default ForgetPass;
