import React, { useContext, useEffect, useState } from "react";
import AllGroup from "../../Group/AllGroup";
import FeedBack from "../../FeedBack/FeedBack";
import Contact from "../../Contact/Contact";
import { GoArrowUp } from "react-icons/go";
import WhyLearnWithUs from "../../WhyLearnWithUs/WhyLearnWithUs";
import AuthServices from "../../../classes/Auth";
import toast, { Toaster } from "react-hot-toast";

function Main() {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  let currentTime = Date.now();
  const [showScoll, setShowScoll] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const scrollSpan = 500;
      window.scrollY > scrollSpan ? setShowScoll(true) : setShowScoll(false);
    };
    window.addEventListener("scroll", handleScroll);
    const fetchAccess = async () => {
      let redirectLocation = sessionStorage.getItem("redirectLocation");
      const res = await authServices.refreshToken();
      if (res) {
        let expirationTime = currentTime + 3 * 60 * 1000;
        let role = authServices.getRole();
        authServices.setToken(res);
        localStorage.setItem("tokenExpiration", expirationTime);
        let redirectPath = "/";
        if (role == "admin") {
            window.location.href = "/dashboard";
        } else if (role == "instructor") {
           window.location.href = "/instructor";
        }else  if (role == "user" && redirectLocation) {
          redirectPath = redirectLocation;
          sessionStorage.removeItem("redirectLocation");
          window.location.href = redirectPath;
        } 
   
      }
    };

    fetchAccess();
  }, []);
  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/bg.webp"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 "></div>
        </div>

        <div className="max-w-3xl text-center relative z-10 ">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
            <span className="">Code Eagles Platform</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 text-bold mb-10 max-w-2xl mx-auto leading-relaxed">
            Master programming and build modern websites using cutting-edge
            technologies with our comprehensive courses.
          </p>
          <div className="px-8 py-3 w-fit mx-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-indigo-800">
            <a
              // onClick={handleWhatsAppRedirect}
              href="#courses"
              aria-label="Book Now"
            >
              <span className="flex items-center justify-center gap-2">
                Book Now
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>

      <WhyLearnWithUs />
      <AllGroup />
      <FeedBack />
      <Contact />

      {showScoll && (
        <span
          onClick={scrollTop}
          aria-label="span"
          className="bg-success"
          style={{
            position: "fixed",
            bottom: "10px",
            right: "30px",
            borderRadius: "50%",
            cursor: "pointer",
            padding: "10px",
            height: "40px",
            width: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "18px",
            color: "white",
          }}
        >
          <GoArrowUp />
        </span>
      )}
    </>
  );
}

export default Main;