import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import UserService from "../../classes/UserService";
import AuthServices from "../../classes/Auth";

function NavStudent({ menuOpen, setMenuOpen }) {
  const [loggedUser, setLoggedUser] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [statusUser, setStatusUser] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const authServices = new AuthServices();
  const [userService] = useState(new UserService(authServices.getToken()));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = authServices.getToken();
        if (!token) {
          toast.error("Please login to join the group.");
          setTimeout(() => {
            if (window.confirm("If you want to go to login page, click ok.")) {
              sessionStorage.setItem("redirectLocation", window.location.href);
              navigate("/auth/login");
            }
          }, 2500);
          return;
        }
        const response = await userService.getUserById();
        if (response) {
          setLoggedUser(response);
          // console.log(response.groups.some(
          //   (item) => item.status === "approved" || item.status === "special"))
          setIsEnrolled(response.groups?.length > 0);
          setStatusUser(response.groups || []);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        if (err) {
          authServices.logout();
          navigate("/auth/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const closeNavbar = () => {
    setMenuOpen(false);
  };

  if (isLoading) {
    return null;
  }

  if (!loggedUser) {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex space-x-4">
        <NavLink
          to="/"
          onClick={closeNavbar}
          className={({ isActive }) =>
            `px-3 py-2 rounded-md text-sm font-medium ${
              isActive
                ? "text-green-600 bg-green-50"
                : "text-gray-700 hover:text-green-600 hover:bg-green-50"
            } transition-colors duration-200`
          }
        >
          Home
        </NavLink>

        {isEnrolled &&
          statusUser.some(
            (item) => item.status === "approved" || item.status === "special"
          ) && (
            <NavLink
              to="/my-courses"
              onClick={closeNavbar}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? "text-green-600 bg-green-50"
                    : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                } transition-colors duration-200`
              }
            >
              My Courses
            </NavLink>
          )}

        <NavLink
          to="/profile"
          onClick={closeNavbar}
          className={({ isActive }) =>
            `px-3 py-2 rounded-md text-sm font-medium ${
              isActive
                ? "text-green-600 bg-green-50"
                : "text-gray-700 hover:text-green-600 hover:bg-green-50"
            } transition-colors duration-200`
          }
        >
          Profile
        </NavLink>
      </nav>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white shadow-md py-2 px-4">
          <NavLink
            to="/"
            onClick={closeNavbar}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-base font-medium ${
                isActive
                  ? "text-green-600 bg-green-50"
                  : "text-gray-700 hover:text-green-600 hover:bg-green-50"
              } transition-colors duration-200`
            }
          >
            Home
          </NavLink>

          {isEnrolled &&
            statusUser.some(
              (item) => item.status === "approved" || item.status === "special"
            ) && (
              <NavLink
                to="/my-courses"
                onClick={closeNavbar}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? "text-green-600 bg-green-50"
                      : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                  } transition-colors duration-200`
                }
              >
                My Courses
              </NavLink>
            )}

          <NavLink
            to="/profile"
            onClick={closeNavbar}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-base font-medium ${
                isActive
                  ? "text-green-600 bg-green-50"
                  : "text-gray-700 hover:text-green-600 hover:bg-green-50"
              } transition-colors duration-200`
            }
          >
            Profile
          </NavLink>
        </div>
      )}
    </>
  );
}

export default NavStudent;
