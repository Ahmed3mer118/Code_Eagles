import React, { useState, useEffect, useContext } from "react";
import { FaBars } from "react-icons/fa";
import { NavLink, useLocation } from "react-router-dom";
import NavStudent from "../LoggedStudent/NavStudent";
import { DataContext } from "../Context/Context";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./nav.css";
import Cookies from "js-cookie";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("tokenUser");
      const refreshToken = Cookies.get("refreshTokenUser");
      setIsLoggedIn(!!token && !!refreshToken);
    };

    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  const toggleNavbar = () => {
    setMenuOpen(!menuOpen);
  };

  const closeNavbar = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <ToastContainer />
      <div className="container">
        <img
          src="/images/LOGO.png"
          alt="logo"
          loading="lazy"
          style={{ width: "100px", height: "80px", borderRadius: "50%" }}
        />

        {!isLoggedIn ? (
          <ul className={menuOpen ? "nav responsive" : "nav"}>
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link  ${isActive ? "text-success" : "text-dark"}`
                }
                onClick={closeNavbar}
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/courses"
                className={({ isActive }) =>
                  `nav-link  ${isActive ? "text-success" : "text-dark"}`
                }
                onClick={closeNavbar}
              >
                Courses
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `nav-link  ${isActive ? "text-success" : "text-dark"}`
                }
                onClick={closeNavbar}
              >
                Contact us
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `nav-link  ${isActive ? "text-success" : "text-dark"}`
                }
                onClick={closeNavbar}
              >
                Log In
              </NavLink>
            </li>
          </ul>
        ) : (
          <NavStudent menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        )}
        <button className="navbar-toggler btn btn-dark" onClick={toggleNavbar} aria-label="Toggle navigation">
          <FaBars />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
