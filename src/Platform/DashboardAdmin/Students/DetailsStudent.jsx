import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { DataContext } from "../../Users/Context/Context";
import "../Tasks/Task.css";

function DetailStudent() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);

  const [students, setStudents] = useState([]);
  const [groupIdByStd, setGroupIdByStd] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataUpdateStudent, setDataUpdateStudent] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [currentRole, setCurrentRole] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendance, setAttendance] = useState({ present: 0, absent: 0 });
  const [taskData, setTaskData] = useState([]);
  const [groupDetails, setGroupDetails] = useState([]); // تفاصيل الجروب
  const { studentId } = useParams();
  const navigate = useNavigate();

  // Fetch Student Data
  useEffect(() => {
    if (!getTokenAdmin) {
      toast.error("Unauthorized. Please log in.");
      return;
    }

    const fetchStudent = async () => {
      try {
        const res = await axios.get(`${URLAPI}/api/users/${studentId}`, {
          headers: {
            Authorization: `${getTokenAdmin}`,
          },
        });
        setStudents(res.data);

        // تحقق من أن هناك مجموعة للطالب
        if (res.data.groups && res.data.groups.length > 0) {
          setGroupIdByStd(res.data.groups);
          setCurrentStatus(res.data.groups[0].status);
          setDataUpdateStudent({
            name: res.data.name,
            email: res.data.email,
            role: res.data.groups[0].status,
          });
        } else {
          setGroupIdByStd([]); // في حال لم توجد مجموعة
          setCurrentStatus("N/A"); // استخدم قيمة بديلة إذا لم توجد مجموعة
        }

        setCurrentRole(res.data.role);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch student data.");
        console.error(error);
      }
    };

    fetchStudent();
  }, [studentId, getTokenAdmin]);

  // Fetch Attendance and Tasks
  useEffect(() => {
    if (studentId) {
      axios
        .get(`${URLAPI}/api/users/${studentId}`, {
          headers: {
            Authorization: ` ${getTokenAdmin}`,
          },
        })
        .then((res) => {
          const attendanceCount = res.data.attendance;
          setAttendanceData(attendanceCount);
          const presentCount = attendanceCount.filter(
            (item) => item.attendanceStatus === "present"
          ).length;
          const absentCount = attendanceCount.filter(
            (item) => item.attendanceStatus === "absent"
          ).length;
          setAttendance({ present: presentCount, absent: absentCount });
          setTaskData(res.data.tasks);
        })
        .catch((error) => {
          console.error("Error fetching attendance:", error);
        });
    }
  }, [studentId, URLAPI, getTokenAdmin]);

  // Fetch Group Details
  useEffect(() => {
    if (groupIdByStd.length > 0) {
      const fetchGroupDetails = async () => {
        try {
          const details = await Promise.all(
            groupIdByStd.map(async (group) => {
              const res = await axios.get(
                `${URLAPI}/api/groups/${group.groupId}`,
                {
                  headers: {
                    Authorization: `${getTokenAdmin}`,
                  },
                }
              );
              return res.data;
            })
          );
          setGroupDetails(details);
        } catch (error) {
          console.error("Error fetching group details:", error);
        }
      };

      fetchGroupDetails();
    }
  }, [groupIdByStd, URLAPI, getTokenAdmin]);

  // Update Student
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${URLAPI}/api/users/${studentId}`, dataUpdateStudent, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${getTokenAdmin}`,
        },
      });
      toast.success("Student updated successfully");
    } catch (error) {
      toast.error("Failed to update student");
      console.error("Update error:", error);
    }
  };

  // Delete Student
  const handleDelete = (id) => {
    axios
      .delete(`${URLAPI}/api/users/${id}`, {
        headers: {
          Authorization: ` ${getTokenAdmin}`,
        },
      })
      .then(() => {
        toast.success("Deleted Student Successfully");
        setTimeout(() => {
          navigate("/admin/allStudent");
        }, 3000);
      })
      .catch((error) => {
        toast.error("Failed to delete student");
      });
  };

  // Toggle User Status
  const handleStopUser = async (id, currentStatus) => {
    if (!getTokenAdmin) {
      toast.error("Unauthorized. Please log in.");
      return;
    }

    if (!groupIdByStd || groupIdByStd.length === 0) {
      toast.error("No group available for this student.");
      return;
    }

    let newStatus = "";
    switch (currentStatus) {
      case "pending":
        newStatus = "approved";
        break;
      case "approved":
        newStatus = "rejected";
        break;
      case "rejected":
        newStatus = "approved";
        break;
      default:
        newStatus = "approved";
        break;
    }

    const updateStatus = {
      status: newStatus,
    };
    const groupId = groupIdByStd[0]?.groupId;

    try {
      await axios.put(
        `${URLAPI}/api/users/update-join-request/${groupId}/${id}`,
        updateStatus,
        {
          headers: {
            Authorization: `${getTokenAdmin}`,
          },
        }
      );

      toast.success(`User status changed to ${newStatus}`);
      setCurrentStatus(newStatus);
    } catch (error) {
      toast.error("Failed to update user status");
      console.error("Status update error:", error);
    }
  };

  return (
    <>
      <ToastContainer />

      <h1 className="text-center mt-2">Student Name: {students.name}</h1>

      <div className="container p-1">
        <div className="row">
          <div className="col-lg-6 col-md-12 mb-3">
            {/* بيانات الطالب */}
            <table className="table text-center">
              <thead>
                <tr>
                  <th className="border">Name</th>
                  <th className="border">Email</th>
                  <th className="border">Phone Number</th>

                  <th className="border">Delete</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border">{students.name?.split(" ")[0]}</td>
                  <td className="border">{students.email?.split("@")[0]}</td>
                  <td className="border">{students.phone_number}</td>

                  <td className="border">
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDelete(studentId)}
                      className="text-danger cursor"
                    >
                      Delete
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* تفاصيل الجروب */}
            <div className="mt-4">
              <h3>Group Name</h3>
              {groupDetails.map((group) => (
                <div key={group._id} className="card mb-3">
                  <div className="card-body">
                    <h5 className="card-title">{group.title}</h5>
                    <p className="card-text">
                      Start Date: {group.start_date?.split("T")[0]}
                    </p>
                    <button
                      className="btn btn-primary"
                      // onClick={() => navigate(`/group/${group._id}`)}
                    >
                      Show Details Student
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStopUser(studentId, currentStatus)}
                      className={`btn ${
                        currentStatus === "approved"
                          ? "btn-danger"
                          : "btn-success"
                      }  ms-3`}
                    >
                      {currentStatus === "approved"
                        ? "Reject User"
                        : "Approve User"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
            <div className="card p-3">
              {/* الحضور والغياب */}
              <h3 className="text-center">Attendance</h3>
              <p>
                <strong>Present:</strong> {attendance.present}
              </p>
              <p>
                <strong>Absent:</strong> {attendance.absent}
              </p>
              <div>
                {Array.isArray(attendanceData) &&
                  attendanceData.map((item, index) => (
                    <li key={index}>
                      <strong>Lecture {index + 1}</strong>:
                      <span
                        className={
                          item.attendanceStatus === "present"
                            ? "text-success"
                            : "text-danger"
                        }
                      >
                        {" "}
                        {item.attendanceStatus === "present"
                          ? " Attended"
                          : " Absent"}
                      </span>
                    </li>
                  ))}
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-sm-12 mb-3">
            <div className="card p-3">
              {/* المهام */}
              <h3 className="text-center">Tasks</h3>
              <ol>
                {Array.isArray(taskData) &&
                  taskData.map((item, index) => (
                    <li key={index}>
                      <span
                        className={
                          item.score > 0 ? "text-success" : "text-danger"
                        }
                      >
                        {item.score > 0 ? "Done" : "Not Submit"} -{" "}
                        {item.score || 0}
                      </span>
                    </li>
                  ))}
              </ol>
            </div>
          </div>
        </div>

        <div className="row mt-3">
          <form className="col-lg-6 p-3" onSubmit={handleUpdate}>
            <h2 className="text-center">Update Student</h2>
            <input
              type="text"
              placeholder="Name"
              value={dataUpdateStudent.name}
              disabled
              className="border rounded p-2 m-2 col-12"
            />
            <input
              type="email"
              placeholder="Email"
              value={dataUpdateStudent.email}
              disabled
              className="border rounded p-2 m-2 col-12"
            />

            <select
              value={dataUpdateStudent.role}
              className="border rounded p-2 m-2 w-100"
              onChange={(e) =>
                setDataUpdateStudent({
                  ...dataUpdateStudent,
                  role: e.target.value,
                })
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <div className="row p-4">
              <button
                type="submit"
                className="btn btn-primary col-lg-6 col-md-10 col-sm-5 ms-2 m-2"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default DetailStudent;
