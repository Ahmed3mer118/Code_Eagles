import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { DataContext } from "../Context/Context";

function ForgetPass() {
  const { URLAPI } = useContext(DataContext);
  const [forgetPass, setForgetPass] = useState({
    resetCode: "",
    newPassword: "",
  });
  const forget_password_token = JSON.parse(
    localStorage.getItem("forget-password-token")
  );
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // HandleResetPassword
  const handleReset = (e) => {
    e.preventDefault();
    setLoading(true);
    const code = forgetPass.resetCode.replace(/\s+/g, "");
    axios
      .post(
        `${URLAPI}/api/users/reset-password`,
        {
          resetCode: code,
          newPassword: forgetPass.newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: forget_password_token,
          },
        }
      )
      .then(() => {
        toast.success("Reset Successful");
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      })
      .catch((err) => {
        setLoading(false);
        toast.error("Error : Reset Code");
      });
  };
  const handleChangeValue = (e) => {
    const inputNumber = e.target.value.replace(/\D/g, "");
    if (inputNumber.length <= 6) {
      const formattedInput = inputNumber.split("").join(" ").substr(0, 13);
      setForgetPass({ ...forgetPass, resetCode: formattedInput });
    } else {
      toast.error("يجب ادخال 6 ارقام");
    }
  };
  return (
    <>
      <ToastContainer />
      <Helmet>
        <title>Forget Password </title>
      </Helmet>
      <div className="bg-form">
        <form className="p-3 rounded" onSubmit={handleReset}>
          <h1 className="text-center text-light">Forget Password</h1>

          <input
            type="text"
            placeholder="Reset Code"
            className="form-control border rounded mt-3 "
            required
            value={forgetPass.resetCode}
            onChange={handleChangeValue}
          />
          <input
            type="password"
            placeholder="New Password"
            className="form-control border rounded mt-3 "
            required
            onChange={(e) =>
              setForgetPass({ ...forgetPass, newPassword: e.target.value })
            }
            minLength={10}
          />

          <div className="mt-2 p-2">
            <button className="btn btn-primary   d-block w-100 m-atuo" disabled={loading}>
              {loading ? "loading" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default ForgetPass;
