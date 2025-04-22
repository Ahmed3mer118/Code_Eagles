import React, { useContext, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { DataContext } from "../Users/Context/Context";

function PrivateRouteInstructor({ element }) {
  const { getTokenInstructor } = useContext(DataContext);
  const location = useLocation();

  const isLoggedIn = !!getTokenInstructor;


  const protectedPatterns = [    /^\/instructor(\/.*)?$/];

  const isProtected = protectedPatterns.some((pattern) => {
    pattern.test(location.pathname);

  });


  if (!isLoggedIn && !isProtected || !isLoggedIn && isProtected) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return element;
}

export default PrivateRouteInstructor;
