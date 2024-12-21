import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { DataContext } from "../Context/Context";

function NavStudent({ menuOpen  , setMenuOpen}) {
  const { URLAPI, getTokenUser } = useContext(DataContext);
  const [loggedUser, setLoggedUser] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [statusUser, setStatusUser] = useState([]);


  useEffect(() => {
    if (getTokenUser) {
      axios
        .get(`${URLAPI}/api/users`, {
          headers: { Authorization: `${getTokenUser}` },
        })
        .then((res) => {
          setLoggedUser(res.data);
          setIsEnrolled(res.data.groups?.length > 0);
          setStatusUser(res.data.groups || []);
        })
        .catch((err) => console.error("Error fetching user data:", err));
    }
  }, [getTokenUser]);
  const closeNavbar = () => {
    setMenuOpen(false);
  };

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
            to={`/${statusUser
              .filter((item) => item.status == "approved")
              .map((item) => item.groupId)}/course`}
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
