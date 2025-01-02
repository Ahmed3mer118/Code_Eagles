import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext ";

function PrivateRoute({ element }) {
  const { isLoggedIn } = useAuth();


  return isLoggedIn ? element : <Navigate to="/login/admin" replace />;
}

export default PrivateRoute;
