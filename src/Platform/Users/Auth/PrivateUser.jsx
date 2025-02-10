import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { DataContext } from "../Context/Context";

function PrivateUser({ element }) {
  const { getTokenUser } = useContext(DataContext);
  const location = useLocation();

  const isLoggedIn = !!getTokenUser;

  
  const protectedPatterns = [
    /^\/my-courses(\/.*)?$/,
    /^\/course\/[^\/]+(\/.*)?$/
  ];

  const isProtected = protectedPatterns.some((pattern) =>
    pattern.test(location.pathname)
  );

 
  if (!isLoggedIn && isProtected) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return element;
}

export default PrivateUser;
