import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// صفحات و مكونات
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import ManageChildren from "./components/ManageChildren";
import Attendance from "./components/Attendance";
import AddChild from "./components/AddChild";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/children" element={<ManageChildren />} />
        <Route path="/admin/attendance" element={<Attendance />} />
        <Route path="/admin/add-child" element={<AddChild />} />
      </Routes>
    </Router>
  );
}

export default App;
