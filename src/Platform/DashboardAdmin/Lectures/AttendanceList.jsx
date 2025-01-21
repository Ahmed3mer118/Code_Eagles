import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { DataContext } from "../../Users/Context/Context";

function AttendanceList() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const { lectureId } = useParams(); // الحصول على معرف المحاضرة من الـ URL
  const [attendanceData, setAttendanceData] = useState([]);
  const [lectureTitle, setLectureTitle] = useState("");
  const [loading,setLoading] = useState(false)

  // جلب بيانات الحضور
  useEffect(() => {
    setLoading(true)
    if (lectureId) {
      axios
        .get(`${URLAPI}/api/lectures/${lectureId}/attendance`, {
          headers: { Authorization: `${getTokenAdmin}` },
        })
        .then((res) => {
          setLoading(false)
          setAttendanceData(res.data.attendance || []);
          console.log(res.data.attendance || []);
          setLectureTitle(res.data.lectureTitle || "Unknown Lecture");
        })
        .catch((err) => {
          console.error("Error fetching attendance data:", err);
          toast.error("Failed to load attendance data!");
        });
    }
  }, [lectureId, URLAPI, getTokenAdmin]);
 if (loading) {
      return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "70vh",
      }}
    >
      <svg
        className="loading"
        viewBox="25 25 50 50"
        style={{ width: "3.25em" }}
      >
        <circle r="20" cy="50" cx="50"></circle>
      </svg>
    </div>
      );
    }
  return (
    <div className="container mt-4">
      <ToastContainer />
      <h3 className="mb-4">Attendance List for "{lectureTitle}"</h3>
      {attendanceData.length > 0 ? (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Attended At</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((student, index) => (
              <tr key={student.userId._id}>
                <td>{index + 1}</td>
                <td>{student.userId.name}</td>
                <td>{student.userId.email}</td>
                <td>{new Date(student.attendedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No attendance records found for this lecture.</p>
      )}
    </div>
  );
}

export default AttendanceList;
