import React, { useState, useEffect, useContext } from "react";
import { FaBars } from "react-icons/fa";
import { NavLink, useLocation } from "react-router-dom";
import NavStudent from "../LoggedStudent/NavStudent";
import { DataContext } from "../Context/Context";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./nav.css";

function Navbar() {
  const { getTokenUser } = useContext(DataContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // حالة تسجيل الدخول

  useEffect(() => {
    if (getTokenUser) {
      setIsLoggedIn(!isLoggedIn);
    }
  }, [getTokenUser]);

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
                to="/content"
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
