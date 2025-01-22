import React, { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

function PrivateUser({ element }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("tokenUser")
  );
  console.log(isLoggedIn);
  const navigate = useNavigate();
  useEffect(() => {
    if (isLoggedIn == false) {
      return navigate("/login");
    }
  }, []);

  return element;
}

export default PrivateUser;
