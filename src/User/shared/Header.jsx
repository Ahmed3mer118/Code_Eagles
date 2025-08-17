import React, { useState, useEffect, useContext } from "react";
import { FaBars } from "react-icons/fa";
import { NavLink, useLocation } from "react-router-dom";
import NavStudent from "./NavStudent";
import Cookies from "js-cookie";
import AuthServices from "../../classes/Auth";

function Header() {
  const authServices = new AuthServices();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = authServices.getToken();
      setIsLoggedIn(!!token);
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
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <img
              src="/images/LOGO.png"
              alt="Code Eagles"
              loading="lazy"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
            />
          </div>

          {!isLoggedIn ? (
             <nav className="hidden md:flex space-x-8">
             <NavLink
               to="/"
               className={({ isActive }) =>
                 `px-3 py-2 rounded-md text-sm font-medium ${
                   isActive
                     ? "text-blue-600 bg-blue-50"
                     : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                 } transition-colors duration-200`
               }
             >
               Home
             </NavLink>
             <NavLink
               to="/courses"
               className={({ isActive }) =>
                 `px-3 py-2 rounded-md text-sm font-medium ${
                   isActive
                     ? "text-blue-600 bg-blue-50"
                     : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                 } transition-colors duration-200`
               }
             >
               Courses
             </NavLink>
             <NavLink
               to="/contact"
               className={({ isActive }) =>
                 `px-3 py-2 rounded-md text-sm font-medium ${
                   isActive
                     ? "text-blue-600 bg-blue-50"
                     : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                 } transition-colors duration-200`
               }
             >
               Contact us
             </NavLink>
             <NavLink
               to="/auth/login"
               className={({ isActive }) =>
                 `px-3 py-2 rounded-md text-sm font-medium ${
                   isActive
                     ? "text-blue-600 bg-blue-50"
                     : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                 } transition-colors duration-200`
               }
             >
               Log In
             </NavLink>
           </nav>
          ) : (
            // <h1>Test </h1>
            <NavStudent menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleNavbar}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Toggle navigation"
            >
              <FaBars className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {!isLoggedIn && menuOpen && (
          <div className="md:hidden pb-4">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavLink
                to="/"
                onClick={closeNavbar}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  } transition-colors duration-200`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/courses"
                onClick={closeNavbar}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  } transition-colors duration-200`
                }
              >
                Courses
              </NavLink>
              <NavLink
                to="/contact"
                onClick={closeNavbar}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  } transition-colors duration-200`
                }
              >
                Contact us
              </NavLink>
              <NavLink
                to="/auth/login"
                onClick={closeNavbar}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  } transition-colors duration-200`
                }
              >
                Log In
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
