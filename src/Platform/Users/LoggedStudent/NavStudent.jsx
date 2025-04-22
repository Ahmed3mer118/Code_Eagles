import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { DataContext } from "../Context/Context";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";

function NavStudent({ menuOpen, setMenuOpen }) {
  const { URLAPI } = useContext(DataContext);
  const [loggedUser, setLoggedUser] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [statusUser, setStatusUser] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("tokenUser"));
        const refreshToken = Cookies.get("refreshTokenUser");

        if (!token || !refreshToken) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`${URLAPI}/api/users`, {
          headers: { Authorization: `${token}` },
        });

        if (response.data) {
          setLoggedUser(response.data);
          setIsEnrolled(response.data.groups?.length > 0);
          setStatusUser(response.data.groups || []);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("tokenUser");
          localStorage.removeItem("tokenExpirationUser");
          Cookies.remove("refreshTokenUser");
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [URLAPI, navigate]);

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
    <ul className={menuOpen ? "nav responsive" : "nav align-items-center"}>
      <li className="nav-item">
        <NavLink
          onClick={closeNavbar}
          to="/"
          className={({ isActive }) =>
            `nav-link  ${isActive ? "text-success" : "text-dark"}`
          }
        >
          Home
        </NavLink>
      </li>
      {isEnrolled && statusUser.some((item) => item.status === "approved") && (
        <li className="nav-item">
          <NavLink
            onClick={closeNavbar}
            to={`/my-courses`}
            className={({ isActive }) =>
              `nav-link  ${isActive ? "text-success" : "text-dark"}`
            }
          >
            My Courses
          </NavLink>
        </li>
      )}
      <li className="nav-item">
        <NavLink
          onClick={closeNavbar}
          to="/profile"
          className={({ isActive }) =>
            `nav-link  ${isActive ? "text-success" : "text-dark"}`
          }
        >
          Profile
        </NavLink>
      </li>
    </ul>
  );
}

export default NavStudent;
