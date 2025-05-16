import React, { useContext, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext ";
import { DataContext } from "../Users/Context/Context";

function PrivateRoute({ element }) {
  const { getTokenAdmin, getTokenInstructor } = useContext(DataContext);
  const location = useLocation();

  const isLoggedIn = !!getTokenAdmin || !!getTokenInstructor;


  const protectedPatterns = [   /^\/admin(\/.*)?$/, /^\/instructor(\/.*)?$/];

  const isProtected = protectedPatterns.some((pattern) => {
    pattern.test(location.pathname);

  });


  if (!isLoggedIn && !isProtected || !isLoggedIn && isProtected) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return element;
}

export default PrivateRoute;
