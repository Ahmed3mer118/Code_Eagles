import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthServices from "../classes/Auth";

function PrivateInstructor({ element }) {
  const location = useLocation();
  const auth = new AuthServices();
  const token = auth.getToken();
  const role = auth.getRole();

  const isLoggedIn = !!token;
  const allowedRoutes = [
    /^\/instructor(\/.*)?$/
  ];

  const isAllowed = role === "instructor" && allowedRoutes.some(pattern =>
    pattern.test(location.pathname)
  );

  if (!isLoggedIn) {
    return <Navigate to="/auth/login" state={{ from: location }} />;
  }

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return element;
}

export default PrivateInstructor;
