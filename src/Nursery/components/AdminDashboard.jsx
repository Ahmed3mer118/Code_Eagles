import React from "react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="container">
      <h2 className="my-4">لوحة تحكم المشرف</h2>
      <nav>
        <ul className="list-group">
          <li className="list-group-item">
            <Link to="/admin/users" className="btn btn-outline-primary w-100">إدارة المستخدمين</Link>
          </li>
          <li className="list-group-item">
            <Link to="/admin/children" className="btn btn-outline-primary w-100">إدارة الأطفال</Link>
          </li>
          <li className="list-group-item">
            <Link to="/admin/attendance" className="btn btn-outline-primary w-100">إدارة الحضور</Link>
          </li>
          <li className="list-group-item">
            <Link to="/admin/activities" className="btn btn-outline-primary w-100">إدارة الأنشطة</Link>
          </li>
          <li className="list-group-item">
            <Link to="/admin/payments" className="btn btn-outline-primary w-100">إدارة المدفوعات</Link>
          </li>
          <li className="list-group-item">
            <Link to="/admin/notifications" className="btn btn-outline-primary w-100">إرسال الإشعارات</Link>
          </li>
          <li className="list-group-item">
            <Link to="/admin/messages" className="btn btn-outline-primary w-100">إرسال الرسائل</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminDashboard;
