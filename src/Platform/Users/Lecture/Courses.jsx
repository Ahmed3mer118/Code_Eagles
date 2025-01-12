import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DataContext } from "../Context/Context";
import OutletCourse from "./OutletCourse";
import { Helmet } from "react-helmet-async";

function Courses() {
  const { URLAPI, getTokenUser } = useContext(DataContext);
  const [lectures, setLectures] = useState([]);
  const [error, setError] = useState(null);
  const { lecCoruse, groupId } = useParams(); // للحصول على ID المحاضرة من الـ URL
  const [tasks, setTasks] = useState([]); // show tasks
  const [attendance, setAttendance] = useState({ present: 0, absent: 0 }); // calc
  const [attendanceData, setAttendanceData] = useState([]);
  const [totalTaskGrades, setTotalTaskGrades] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
         // جلب بيانات الطالب
         const userRes = await axios.get(
          `${URLAPI}/api/users`,
          {
            headers: { Authorization: ` ${getTokenUser}` },
          }
        );
        // جلب بيانات الحضور
        const attendedRes = await axios.get(
          `${URLAPI}/api/lectures/${groupId}/attended-lectures`,
          {
            headers: { Authorization: ` ${getTokenUser}` },
          }
        );

        // جلب بيانات الغياب
        const nonAttendedRes = await axios.get(
          `${URLAPI}/api/lectures/${groupId}/non-attended-lectures`,
          {
            headers: { Authorization: ` ${getTokenUser}` },
          }
        );
        // console.log(nonAttendedRes.data)

        // تجميع بيانات الحضور والغياب
        const attendedLectures = attendedRes.data.attendedLectures || [];
        const nonAttendedLectures = nonAttendedRes.data.notAttendedLectures || [];

        // حساب عدد الحضور والغياب
        const presentCount = attendedLectures.length;
        const absentCount = nonAttendedLectures.length;

        setAttendance({ present: presentCount, absent: absentCount });
        setAttendanceData([...attendedLectures, ...nonAttendedLectures]);

        // جلب بيانات المهام

        const taskData = userRes.data.tasks || [];
        setTasks(taskData);
        setTotalTaskGrades(taskData.reduce((sum, task) => sum + task.score, 0));
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again later.");
      }
    };

    fetchData();
  }, [URLAPI, getTokenUser, groupId]);

  useEffect(() => {
    axios
      .get(`${URLAPI}/api/lectures/group/${groupId}`, {
        headers: {
          Authorization: `${getTokenUser}`,
        },
      })
      .then((res) => {
        setLectures(res.data.lectures);
      })
      .catch((err) => {
        setError("Error fetching lectures. Please try again later.");
        console.log("Error details:", err);
      });
  }, [groupId, getTokenUser]);

  return (
    <>
      <Helmet>
        <title>Code Eagles | Lectures</title>
      </Helmet>
      <div className="container mt-4 mb-4">
        <div className="row">
          {/* Content Section */}
          <div className="col-12 col-md-8 bg-light p-4">
            <OutletCourse />
          </div>

          {/* Sidebar Section */}
          {lectures && lectures.length > 0 && (
            <div className="col-12 col-md-4 text-dark p-4">
              <h4 className="mb-3">Lectures</h4>
              {lectures.map((item, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-primary me-2">{index + 1}</span>
                    <strong>{item.title}</strong>
                  </div>
                  <Link
                    to={`/course/${groupId}/lecture/${item._id}`}
                    className="text-dark text-decoration-none"
                  >
                    <p className="m-2">{item.description}</p>
                  </Link>
                  <hr />
                </div>
              ))}
            </div>
          )}

          {/* Attendance and Tasks Section */}
          {/* <div className="row mt-3 mb-4 col-12 col-md-8">
            <div className="col-md-6">
              <div className="card mb-4">
                <div className="card-body">
                  <h3 className="text-center">Attendance</h3>
                  <p>
                    <strong>Present:</strong> {attendance.present}
                  </p>
                  <p>
                    <strong>Absent:</strong> {attendance.absent}
                  </p>
                  <ul>
                    {attendanceData.map((item, index) => (
                      <li key={index}>
                        {console.log(item)}
                        <strong>{item.title} </strong>:
                        <span
                          className={
                            item.title ? "text-success" : "text-danger"
                          }
                        >
                          {item.title ? " Attended" : " Absent"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card mb-4">
                <div className="card-body">
                  <h3 className="card-title text-center">Tasks</h3>
                  <p>
                    <strong>Total Score:</strong> {totalTaskGrades}
                  </p>
                  <ul>
                    {tasks.map((task, index) => (
                      <li key={index}>
                        <strong>Task {index + 1}</strong> : {task.score || 0} -{" "}
                        {task.feedback || "No Feedback"}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
}

export default Courses;