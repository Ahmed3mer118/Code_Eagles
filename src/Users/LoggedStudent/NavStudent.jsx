import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { DataContext } from "../Context/Context";

function NavStudent({ menuOpen }) {
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
          // console.log(res.data);
          setIsEnrolled(res.data.groups?.length > 0); // التحقق إذا كان المستخدم مسجلاً في مجموعات
          setStatusUser(res.data.groups || []); // تعيين المجموعات أو مصفوفة فارغة
        })
        .catch((err) => console.error("Error fetching user data:", err));
    }
  }, [getTokenUser]);

  return (
    <ul className={menuOpen ? "nav responsive" : "nav align-items-center"}>
      <li className="nav-item">
        <NavLink to="/" className="nav-link text-dark">
          Home
        </NavLink>
      </li>
      {isEnrolled && statusUser.some((item) => item.status === "approved") && (
        <li className="nav-item">
          <NavLink
            to={`/${statusUser
              .filter((item) => item.status === "approved") 
              .map((item) => item.groupId)
              }/course`}
            className="nav-link text-dark"
          >
            My Courses
          </NavLink>
        </li>
      ) }
      <li className="nav-item">
        <NavLink to="/profile" className="nav-link text-dark">
          Profile
        </NavLink>
      </li>
    </ul>
  );
}

export default NavStudent;
