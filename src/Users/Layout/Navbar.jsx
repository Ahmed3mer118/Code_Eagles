import React, { useState, useEffect, useContext } from "react";
import { FaBars } from "react-icons/fa";
import { NavLink, useLocation } from "react-router-dom";
import NavStudent from "../LoggedStudent/NavStudent";
import { DataContext } from "../Context/Context";

function Navbar() {
  const { getTokenUser } = useContext(DataContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!getTokenUser); // حالة تسجيل الدخول
  const location = useLocation();
  useEffect(() => {
    const token =
      localStorage.getItem("tokenUser") || localStorage.getItem("tokenAdmin");
    const expirationTime = localStorage.getItem("tokenExpiration");

    if (token && expirationTime) {
      const currentTime = Date.now();
      if (currentTime > expirationTime) {
        localStorage.removeItem("tokenUser");
        localStorage.removeItem("tokenAdmin");
        localStorage.removeItem("tokenExpiration");
        toast.error("Session expired. Please log in again.");
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    // تحقق عند تغيير التوكن أو الموقع
    setIsLoggedIn(!!getTokenUser);
  }, [getTokenUser, location.pathname]);

  const toggleNavbar = () => {
    setMenuOpen(!menuOpen);
  };

  const closeNavbar = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container">
        <img src="/images/LOGO.png" alt="logo" loading="lazy" style={{width:"100px", height:"80px", borderRadius:"50%"}}/>
        {/* <h1
          className="navbar-brand text-dark"
          id="logo"
          style={{
            fontFamily: "Playwrite DE VA Guides",
            fontWeight: "400",
            fontStyle: "normal",
          }}
        >
          Code Eagles
        </h1> */}
        {!isLoggedIn ? (
          <ul className={menuOpen ? "nav responsive" : "nav"}>
            <li className="nav-item">
              <NavLink
                to="/"
                className="nav-link text-dark"
                onClick={closeNavbar}
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/all-courses"
                className="nav-link text-dark"
                onClick={closeNavbar}
              >
                Courses
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/contact"
                className="nav-link text-dark"
                onClick={closeNavbar}
              >
                Contact us
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/login"
                className="nav-link text-dark"
                onClick={closeNavbar}
              >
                Log In
              </NavLink>
            </li>
          </ul>
        ) : (
          <NavStudent menuOpen={menuOpen} />
        )}
        <button className="navbar-toggler btn btn-dark" onClick={toggleNavbar}>
          <FaBars />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
