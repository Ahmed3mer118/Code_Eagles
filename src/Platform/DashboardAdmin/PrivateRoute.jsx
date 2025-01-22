import React, { useContext, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext ";
import { DataContext } from "../Users/Context/Context";

function PrivateRoute({ element }) {
  const { getTokenAdmin } = useContext(DataContext);
  const location = useLocation(); 
  const navigate = useNavigate();


    const isLoggedIn = !!getTokenAdmin;

    // قائمة بالأنماط المحمية (يجب أن يكون المستخدم مسجلًا للوصول إليها)
    const protectedPatterns = [
      /^\/admin(\/.*)?$/, 
      /^\/course\/[^\/]+(\/.*)?$/,

    ];
  
    // التحقق مما إذا كان المسار الحالي محميًا
    const isProtected = protectedPatterns.some((pattern) =>
      pattern.test(location.pathname)
    );
  
    // إذا كان المستخدم غير مسجل وحاول الوصول إلى مسار محمي
    if (!isLoggedIn && isProtected) {
      return <Navigate to="/login/admin" state={{ from: location }} />;
    }
  
    // إذا كان المستخدم مسجلًا أو المسار غير محمي
    return element;

}

export default PrivateRoute;
