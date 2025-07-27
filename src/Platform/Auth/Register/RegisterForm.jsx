import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { DataContext } from "../../Users/Context/Context";
import FingerprintJs from "@fingerprintjs/fingerprintjs";

function RegisterForm() {
  const { URLAPI } = useContext(DataContext);
  const [register, setRegister] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [countryCode, setCountryCode] = useState("+20"); // Default to Egypt
  const [phoneLength, setPhoneLength] = useState(11); // Default length for Egypt

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

    if (register.password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${URLAPI}/api/users/register`, register, {
        headers: { "Content-Type": "application/json" },
      });
      // conosle.log(res.data)

      if (res.data) {
        toast.success(`Hello ${register.name}, please check your email.`);
        // localStorage.setItem(
        //   "verif-email-token",
        //   JSON.stringify(res.data.token)
        // );
        setTimeout(() => {
          navigate("/register/verif-email", { state: register.email });
        }, 2500);
      } else {
        toast.error("Error in Form");
      }
    } catch (error) {
      toast.error(
        "An error occurred during registration. please try again after 10 minutes."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    switch (country) {
      case "Egypt":
        setCountryCode("+20");
        setPhoneLength(11);
        break;
      case "Saudi Arabia":
        setCountryCode("+966");
        setPhoneLength(9);
        break;
      case "UAE":
        setCountryCode("+971");
        setPhoneLength(9);
        break;
      case "Algeria":
        setCountryCode("+213");
        setPhoneLength(9);
        break;
      case "Tunisia":
        setCountryCode("+216");
        setPhoneLength(8);
        break;
      case "Oman":
        setCountryCode("+968");
        setPhoneLength(8);
        break;
      case "Lebanon":
        setCountryCode("+961");
        setPhoneLength(8);
        break;
      case "Syria":
        setCountryCode("+963");
        setPhoneLength(9);
        break;
      case "Morocco":
        setCountryCode("+212");
        setPhoneLength(9);
        break;
      case "Tunisia":
        setCountryCode("+216");
        setPhoneLength(8);
        break;
      case "Iraq":
        setCountryCode("+964");
        setPhoneLength(10);
        break;
      case "Jordan":
        setCountryCode("+962");
        setPhoneLength(9);
        break;
      case "Kuwait":
        setCountryCode("+965");
        setPhoneLength(8);
        break;
      case "Bahrain":
        setCountryCode("+973");
        setPhoneLength(8);
        break;
      case "Qatar":
        setCountryCode("+974");
        setPhoneLength(8);
        break;
      case "Palestine":
        setCountryCode("+970");
        setPhoneLength(9);
        break;
      case "Yemen":
        setCountryCode("+967");
        setPhoneLength(9);
        break;
      case "Kuwait":
        setCountryCode("+965");
        setPhoneLength(8);
        break;
      case "Oman":
        setCountryCode("+968");
        setPhoneLength(8);
        break;
      case "United States":
        setCountryCode("+1");
        setPhoneLength(10);
        break;
      case "Canada":
        setCountryCode("+1");
        setPhoneLength(10);
        break;
      case "Other":
        setCountryCode("");
        setPhoneLength(14);
        break;
      default:
        setCountryCode("+20");
        setPhoneLength(11);
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
    if (value.length <= phoneLength) {
      setRegister({ ...register, phone_number: value });
    }
  };

  useEffect(() => {
    async function getFingerPrint() {
      const fp = await FingerprintJs.load();
      const result = await fp.get();
      const fingerprint = result.visitorId;
      setRegister({ ...register, fingerprint });
      return result.visitorId;
    }

    getFingerPrint();
  }, []);

  return (
    <>
      <form className="p-3 rounded register-form" onSubmit={handleRegister}>
        <h1 className="text-center text-light mb-4">Register</h1>

        <div className="row mb-3">
          <div className="col-md-6 col-sm-">
            <label htmlFor="name" className="form-label text-light">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="form-control"
              value={register.name}
              onChange={(e) =>
                setRegister({ ...register, name: e.target.value })
              }
              placeholder="Enter your name"
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="email" className="form-label text-light">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={register.email}
              onChange={(e) =>
                setRegister({ ...register, email: e.target.value })
              }
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="password" className="form-label text-light">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={register.password}
              onChange={(e) =>
                setRegister({ ...register, password: e.target.value })
              }
              placeholder="Enter password"
              minLength={10}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="confirmPassword" className="form-label text-light">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              minLength={10}
            />
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="country" className="form-label text-light">
            Country
          </label>
          <select
            id="country"
            className="form-control"
            onChange={handleCountryChange}
          >
            <option value="Egypt">Egypt</option>
            <option value="Saudi Arabia">Saudi Arabia</option>
            <option value="UAE">UAE</option>
            <option value="Algeria">Algeria</option>
            <option value="Tunisia">Tunisia</option>
            <option value="Oman">Oman</option>
            <option value="Lebanon">Lebanon</option>
            <option value="Syria">Syria</option>
            <option value="Morocco">Morocco</option>
            <option value="Iraq">Iraq</option>
            <option value="Jordan">Jordan</option>
            <option value="Kuwait">Kuwait</option>
            <option value="Bahrain">Bahrain</option>
            <option value="Qatar">Qatar</option>
            <option value="Palestine">Palestine</option>
            <option value="Yemen">Yemen</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="phoneNumber" className="form-label text-light">
            Phone Number
          </label>
          <div className="input-group">
            <span className="input-group-text">{countryCode}</span>
            <input
              type="text"
              id="phoneNumber"
              className="form-control"
              value={register.phone_number}
              onChange={handlePhoneNumberChange}
              placeholder="Enter phone number"
            />
          </div>
        </div>

        <div className="d-grid gap-2">
          <button
            className="btn btn-primary"
            disabled={loading}
            aria-label="Submit"
          >
            {!loading ? "Register" : "Loading..."}
          </button>
          <Link
            to="/login"
            className="btn btn-outline-light"
            aria-label="Sign In"
          >
            Already have an account? Sign In
          </Link>
        </div>
        {/* <div>
          <p className="alert alert-warning p-2">
            Use one device on which you registered the email
          </p>
        </div> */}
      </form>
    </>
  );
}

export default RegisterForm;
