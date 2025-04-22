import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { DataContext } from "../../Users/Context/Context";
import { Helmet } from "react-helmet-async";

function AllStudents() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [allDataTasks, setAllDataTasks] = useState({
    allAttendance: 14,
    allTasks: 14,
    allQuiz: 14,
  });
  const [searchStd, setSearchStd] = useState("");
  const [loading, setLoading] = useState(false);

  // const [newStudent, setNewStudent] = useState(false);
  // const [newDataStudent, setNewDataStudent] = useState({
  //   groupId: groupId || null,
  //   name: "",
  //   email: "",
  //   password: "",
  //   phone_number: "",
  //   role: "user",
  // });

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${URLAPI}/api/users/all-users`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      })
      .then((res) => {
        setLoading(true);
        const data = res.data;

        if (Array.isArray(data) && data.length > 0) {
          const studentsWithProgress = data.map((student) => ({
            ...student,
            // attendance: student.attendance.length || 0,
            // tasks: student.tasks || 0,
          }));
          const searchStdByNumber = studentsWithProgress.filter(
            (num) => num.phone_number == searchStd
          );

          if (searchStdByNumber.length > 0) {
            setLoading(false);
            setStudents(searchStdByNumber);
          } else {
            setLoading(false);
            setStudents(studentsWithProgress);
          }
        } else {
          setStudents([]);
          toast.warn("No students found.");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch students.");
      });
  }, [URLAPI, getTokenAdmin, location.pathname, searchStd]);

  return (
    <>
      <Helmet>
        <title>All Students</title>
      </Helmet>
      <Toaster position="top-center" />
      
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <h1 className="h3 mb-0">Students</h1>
              {/* <input
                type="text"
                placeholder="Search By Number"
                className="m-2"
                style={{
                  outline: "none",
                  border: "none",
                  borderBottom: "2px solid black",
                }}
                onChange={(e) => setSearchStd(e.target.value)}
              /> */}
            </div>
            {/* <button
            className="btn btn-success"
            onClick={() => setNewStudent(!newStudent)}
          >
            {!newStudent ? "New Student" : "Show Students"}
          </button> */}
          </div>
        </div>

        {loading ? (
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="table-responsive table-striped">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone Number</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center">No students found.</td>
                      </tr>
                    ) : (
                      students.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.name}</td>
                          <td>{item.email}</td>
                          <td>{item.phone_number}</td>
                          <td>
                            <Link
                              to={`/admin/student/${item._id}`}
                              className="btn btn-primary btn-sm"
                            >
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AllStudents;
