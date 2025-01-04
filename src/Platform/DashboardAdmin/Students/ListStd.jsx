import React, { useState, useContext } from "react";
import { ToastContainer } from "react-toastify";
import { DataContext } from "../../Users/Context/Context";
import { FaPenToSquare } from "react-icons/fa6";

function ListStd() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const [showForm, setShowForm] = useState(false);
  const [studentData, setStudentData] = useState({
    name: "",
    email: "",
    phone_number: "",
    group: "",
  });
  const [showListStd, setShowlistStd] = useState([
    {
      id: 0,
      name: "ahmed amer",
      email: "amer@gmail.com",
      phone_number: "01033705805",
      group: "2024-12-12",
    },
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentData({ ...studentData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // هنا يمكنك إضافة الكود لإرسال البيانات إلى الخادم
    setShowlistStd(studentData);
    // بعد الإرسال، يمكنك إغلاق النموذج
    setShowForm(false);
    // يمكنك إضافة Toast لإعلام المستخدم
  };
  const handleUpdate = (item) => {
    setShowForm(true);
    setStudentData({
      name: item.name,
      email: item.email,
      phone_number: item.phone_number,
      group: item.group,
    });
    setShowlistStd(studentData)

  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h3 className="mb-4">Add List Student</h3>
      <button
        className="btn btn-primary mb-3"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Cancel" : "Add Student In List"}
      </button>

      {showForm && (
        <div className="transition-form">
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="form-group mt-2">
              <label>Name : </label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={studentData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group mt-2">
              <label>Email : </label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={studentData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group mt-2">
              <label>Phone Number : </label>
              <input
                type="text"
                name="phone_number"
                className="form-control"
                value={studentData.phone_number}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group mt-2">
              <label>Group :</label>
              <input
                type="date"
                name="group"
                className="form-control"
                value={studentData.group}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-success mt-3 mb-3 ">
              Submit
            </button>
          </form>
        </div>
      )}

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Group</th>
            <th className="text-center">Update</th>
          </tr>
        </thead>
        <tbody>
          {/* هنا يمكنك إضافة بيانات الطلاب */}
          {Array.isArray(showListStd) &&
            showListStd.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.phone_number}</td>
                <td>{item.group}</td>
                <td className="text-center">
                  <FaPenToSquare
                  className="text-success"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleUpdate(item)}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListStd;
