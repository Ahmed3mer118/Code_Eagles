import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { DataContext } from "../../Users/Context/Context";
import axios from "axios";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";
function Students() {
  const { URLAPI, getTokenAdmin, getTokenInstructor } = useContext(DataContext);
  const { groupId } = useParams();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [adminService] = useState(new AdminService(URLAPI, getTokenAdmin));
  const [instructorService] = useState(new InstructorService(URLAPI, getTokenInstructor));
  const navigate = useNavigate();
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      if (window.location.pathname.includes("/admin")) {
       const response = await adminService.getStudents();
        const filterStudentGroup = response?.filter((item) => {
          return item.groups.some((group) => group.groupId === groupId);
        });

        setStudents(filterStudentGroup);
        setLoading(false);
      }
      else {
        const response = await instructorService.getStudents(groupId);
        const filterStudentGroup = response?.filter((item) => {
          return item.groups.some((group) => group.groupId === groupId);
        });
        setStudents(filterStudentGroup);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error(error.message || "Failed to fetch students");
      setLoading(false);
    }
  };

  const handleDetails = (studentId) => {
    if (window.location.pathname.includes("/admin")) {
      navigate(`/admin/student/${studentId}`);
    } else {
      navigate(`/instructor/${groupId}/student/${studentId}`);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="mb-0">Students Management</h2>
        </div>
      </div>

      <div className="row">
        {students?.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info text-center">
              No students available in this group.
            </div>
          </div>
        ) : (
          <div className="col-12">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    Array.isArray(students) &&
                    students.map((student) => (
                      <tr key={student._id}>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{student.phone_number}</td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleDetails(student._id)}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Students;
