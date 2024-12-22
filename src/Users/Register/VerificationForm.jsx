import React, { useContext, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DataContext } from "../Context/Context";
import "./register.css";
function VerificationForm() {
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { URLAPI } = useContext(DataContext);
  const navigate = useNavigate()
  const handleVerification = async (e) => {
    e.preventDefault();

    const code = number.replace(/\s+/g, "");
    setLoading(true);
    await axios
      .post(`${URLAPI}/api/users/verify-Email`, {
        email: location.state,
        code,
      })
      .then((res) => {
        if (res.data) {
        toast.success("Welcome " + location.state);
        setLoading(false);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error("Verification failed");
        setLoading(false);
      }
      })
      .catch(() => {
        toast.error("An error occurred during verification." );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle input change for verification code
  const handleChangeValue = (e) => {
    const inputNumber = e.target.value.replace(/\D/g, "");
    if (inputNumber.length <= 6) {
      const formattedInput = inputNumber.split("").join(" ").substr(0, 13);
      setNumber(formattedInput);
    } else {
      toast.error("Verification code must be 6 digits");
    }
  };

  return (
    <div className="bg-form">
      <ToastContainer />
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
        <Link className="btn text-decoration-underline" to={"/register"}>
          New Register
        </Link>
      </form>
    </div>
  );
}

export default VerificationForm;
