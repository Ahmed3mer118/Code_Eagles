import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
// import { DataContext } from "../../Users/Context/Context";
import FingerprintJs from "@fingerprintjs/fingerprintjs";
import AuthServices from "../../classes/Auth";

function RegisterForm() {
  const authServices = new AuthServices();
  const URLAPI = authServices.URLAPI;
  const [register, setRegister] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [countryCode, setCountryCode] = useState("+20"); 
  const [phoneLength, setPhoneLength] = useState(11);

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
      const res =  await authServices.register(register)
      if (res) {
        toast.success(`Hello ${register.name}, please check your email.`);
        setTimeout(() => {
          navigate("/auth/verif-email", { state: register.email });
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
    <div className="min-h-screen flex justify-center items-center">

      <form
        className="max-w-2xl mx-auto mt-2 bg-white p-8 rounded-lg shadow-md "
        onSubmit={handleRegister}
      >
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Create Your Account
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={register.name}
              onChange={(e) =>
                setRegister({ ...register, name: e.target.value })
              }
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={register.email}
              onChange={(e) =>
                setRegister({ ...register, email: e.target.value })
              }
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={register.password}
              onChange={(e) =>
                setRegister({ ...register, password: e.target.value })
              }
              placeholder="Enter password"
              minLength={10}
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              minLength={10}
            />
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Country
          </label>
          <select
            id="country"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div className="mb-6">
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              {countryCode}
            </span>
            <input
              type="text"
              id="phoneNumber"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={register.phone_number}
              onChange={handlePhoneNumberChange}
              placeholder="Enter phone number"
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
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
                Processing...
              </>
            ) : (
              "Register"
            )}
          </button>

          <Link
            to="/auth/login"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Sign In"
          >
            Already have an account? Sign In
          </Link>
        </div>
      </form>
    </div>
    </>
  );
}

export default RegisterForm;
