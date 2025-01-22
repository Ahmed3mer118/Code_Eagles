import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { DataContext } from "./Context/Context";

function PrivateUser({ element }) {
  const { getTokenUser } = useContext(DataContext);
  const location = useLocation();

  const isLoggedIn = !!getTokenUser;

  // قائمة بالأنماط المحمية (يجب أن يكون المستخدم مسجلًا للوصول إليها)
  const protectedPatterns = [
    /^\/my-courses(\/.*)?$/, 
    /^\/course\/[^\/]+(\/.*)?$/,
  ];

  // التحقق مما إذا كان المسار الحالي محميًا
  const isProtected = protectedPatterns.some((pattern) =>
    pattern.test(location.pathname)
  );

  // إذا كان المستخدم غير مسجل وحاول الوصول إلى مسار محمي
  if (!isLoggedIn && isProtected) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return element;
}

export default PrivateUser;
