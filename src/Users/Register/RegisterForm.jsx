import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { DataContext } from "../Context/Context";

function RegisterForm() {
  const { URLAPI } = useContext(DataContext);
  const [register, setRegister] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
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

    if (register.password.length < 10) {
      toast.error("Password must be at least 10 characters long.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${URLAPI}/api/users/register`, register, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data) {
        toast.success(`Hello ${register.name}, please check your email.`);
      
        setTimeout(() => {
          navigate("/register/verif-email", { state: register.email });
        }, 1500);
      } else {
        toast.error("Error in Form");
      }
    } catch (error) {
      toast.error("An error occurred during registration. please try again after 10 minutes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="p-3 rounded" onSubmit={handleRegister}>
      <h1 className="text-center">Register</h1>
      <input
        type="text"
        placeholder="Name"
        className="form-control border rounded mt-3"
        value={register.name}
        onChange={(e) => setRegister({ ...register, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        className="form-control border rounded mt-3"
        value={register.email}
        onChange={(e) => setRegister({ ...register, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        className="form-control border rounded mt-3"
        value={register.password}
        minLength={10}
        onChange={(e) => setRegister({ ...register, password: e.target.value })}
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
      <div className="mt-2 p-2 mb-2">
        <button
          className="btn btn-primary d-block w-100 m-auto"
          disabled={loading}
        >
          {!loading ? "Send" : "Loading..."}
        </button>
        <button className="btn mt-2">
          <Link
            to={"/login"}
            className=" text-decoration-underline text-light p-2 mt-2 "
          >
            Sign In
          </Link>
        </button>
      </div>
    </form>
  );
}

export default RegisterForm;
