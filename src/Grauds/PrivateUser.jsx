import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthServices from "../classes/Auth";

function PrivateUser({ element }) {
  const location = useLocation();
  const auth = new AuthServices();
  const token = auth.getToken();
  const role = auth.getRole();

  const isLoggedIn = !!token;
  const allowedRoutes = [
    /^\/my-courses(\/.*)?$/,
    /^\/course\/[^\/]+(\/.*)?$/,
    /^\/profile$/
  ];

  const isAllowed = role === "user" && allowedRoutes.some(pattern =>
    pattern.test(location.pathname)
  );

  if (!isLoggedIn) {
    sessionStorage.setItem("redirectLocation", window.location.pathname);
    return <Navigate to="/auth/login" state={{ from: location }} />;
  }

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return element;
}

export default PrivateUser;
