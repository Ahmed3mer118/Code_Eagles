import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext ";

function PrivateRoute({ element }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (isLoggedIn == false) {
      return navigate("/login/admin");
    }
  }, []);
  return element;
}

export default PrivateRoute;
