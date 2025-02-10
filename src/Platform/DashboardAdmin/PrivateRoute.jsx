import React, { useContext, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext ";
import { DataContext } from "../Users/Context/Context";

function PrivateRoute({ element }) {
  const { getTokenAdmin } = useContext(DataContext);
  const location = useLocation();

  const isLoggedIn = !!getTokenAdmin;


  const protectedPatterns = [   /^\/admin(\/.*)?$/];

  const isProtected = protectedPatterns.some((pattern) => {
    pattern.test(location.pathname);

  });


  if (!isLoggedIn && !isProtected || !isLoggedIn && isProtected) {
    return <Navigate to="/login/admin" state={{ from: location }} />;
  }

  return element;
}

export default PrivateRoute;
