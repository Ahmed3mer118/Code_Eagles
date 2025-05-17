import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { DataContext } from "../../Users/Context/Context";

function AttendanceList() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const { lectureId } = useParams();
  const [attendedUsers, setAttendedUsers] = useState([]);
  const [notAttendedUsers, setNotAttendedUsers] = useState([]);
  const [lectureTitle, setLectureTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (lectureId) {
      axios
        .get(`${URLAPI}/api/lectures/${lectureId}/get-lecture-attendance-details`, {
          headers: { Authorization: `${getTokenAdmin}` },
        })
        .then((res) => {
          setLoading(false);
          setAttendedUsers(res.data.attendance || []);
          setNotAttendedUsers(res.data.notAttendedUsers || []);
          setLectureTitle(res.data.lectureTitle || "Unknown Lecture");
        })
        .catch((err) => {
          console.error("Error fetching attendance data:", err);
          toast.error("Failed to load attendance data!");
          setLoading(false);
        });
    }
  }, [lectureId, URLAPI, getTokenAdmin]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "70vh" }}>
        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <Toaster position="top-center" />
      <h3 className="mb-4 text-center">Attendance List for "{lectureTitle}"</h3>

      <div className="row">
        {/* جدول الحضور */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Present Students ✅</h5>
            </div>
            <div className="card-body p-0">
              {attendedUsers.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Attended At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendedUsers.map((student, index) => (
                        <tr key={student.userId._id}>
                          <td>{index + 1}</td>
                          <td>{student.userId.name}</td>
                          <td>{student.userId.email}</td>
                          <td>{new Date(student.attendedAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="m-3 text-muted">No attendance yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* جدول الغياب */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">Absent Students ❌</h5>
            </div>
            <div className="card-body p-0">
              {notAttendedUsers.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notAttendedUsers.map((student, index) => (
                        <tr key={student.userId}>
                          <td>{index + 1}</td>
                          <td>{student.name}</td>
                          <td>{student.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="m-3 text-muted">No absent students.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceList;
