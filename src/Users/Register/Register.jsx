import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { DataContext } from "../Context/Context";
import { Helmet } from "react-helmet-async";

function Register() {
  const { URLAPI } = useContext(DataContext);
  const navigate = useNavigate();

  const [showInputVerif, setShowInputVerif] = useState(
    JSON.parse(localStorage.getItem("showVerif")) || false
  );
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [register, setRegister] = useState(
    JSON.parse(localStorage.getItem("registerData")) || {
      name: "",
      email: "",
      password: "",
      phone_number: "",
    }
  );

  useEffect(() => {
    localStorage.setItem("registerData", JSON.stringify(register.email));
    localStorage.setItem("showVerif", JSON.stringify(showInputVerif));
  }, [register, showInputVerif]);

  // تسجيل المستخدم
  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !register.name ||
      !register.email ||
      !register.password ||
      !register.phone_number
    ) {
      toast.error("Please fill out all fields.");
      return;
    }

    if (register.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    setTimeout(() => {
      localStorage.removeItem("showVerif");
    }, 20000);
    try {
      const res = await axios.post(`${URLAPI}/api/users/register`, register, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data) {
        setShowInputVerif(true);
        toast.success(`Hello ${register.name}, please check your email.`);
      } else {
        toast.error("Error in Form");
      }
    } catch (error) {
      toast.error("An error occurred during registration.");
    }
  };

  // التحقق من البريد الإلكتروني
  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    const code = number.replace(/\s+/g, "");

    try {
      const res = await axios.post(`${URLAPI}/api/users/verify-Email`, {
        email: register.email,
        code,
      });

      if (res.data) {
        toast.success("Welcome " + register.name);
        setLoading(false);
        localStorage.removeItem("showVerif");
        localStorage.removeItem("registerData");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error("Verification failed");
        setLoading(false);
      }
    } catch (error) {
      toast.error("An error occurred during verification.");
      setLoading(false);
    }
  };

  const handleChangeValue = (e) => {
    const inputNumber = e.target.value.replace(/\D/g, "");
    if (inputNumber.length <= 6) {
      const formattedInput = inputNumber.split("").join(" ").substr(0, 13);
      setNumber(formattedInput);
    } else {
      toast.error("يجب ادخال 6 ارقام");
    }
  };

  return (
    <>
      <ToastContainer />
      <Helmet>
        <title>Register</title>
      </Helmet>
      <div className="bg-form">
        {!showInputVerif ? (
          <form className="p-3 rounded" onSubmit={handleRegister}>
            <h1 className="text-center">Register</h1>
            <input
              type="text"
              placeholder="Name"
              className="form-control border rounded mt-3"
              value={register.name}
              onChange={(e) =>
                setRegister({ ...register, name: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Email"
              className="form-control border rounded mt-3"
              value={register.email}
              onChange={(e) =>
                setRegister({ ...register, email: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              className="form-control border rounded mt-3"
              value={register.password}
              minLength={10}
              onChange={(e) =>
                setRegister({ ...register, password: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="form-control border rounded mt-3"
              value={register.phone_number}
              onChange={(e) =>
                setRegister({ ...register, phone_number: e.target.value })
              }
            />
            <div className="mt-2 p-2">
              <button className="btn btn-primary d-block w-100 m-auto">
                Submit
              </button>
            </div>
            <Link
              to={"/login"}
              className="text-decoration-underline text-light p-2 mt-2"
            >
              Sign In
            </Link>
          </form>
        ) : (
          <form className="p-3 rounded" onSubmit={handleVerification}>
            <h1 className="text-center">Verification</h1>
            <input
              type="text"
              placeholder="- - - - - -"
              className="form-control border rounded mt-3 text-center"
              required
              value={number || ""}
              onChange={handleChangeValue}
            />
            <div className="mt-2 p-2">
              <button
                className="btn btn-primary d-block w-100 m-auto"
                disabled={number.replace(/\s+/g, "").length < 6}
              >
                {!loading ? "Send" : "Loading..."}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

export default Register;
