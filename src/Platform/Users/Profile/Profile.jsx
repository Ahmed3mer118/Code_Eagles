import axios from "axios";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { DataContext } from "../Context/Context";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

function Profile() {
  const { URLAPI, getTokenUser } = useContext(DataContext);
  const [userData, setUserData] = useState(null); // user data
  const [tasks, setTasks] = useState([]); // show  tasks
  const [attendance, setAttendance] = useState({ present: 0, absent: 0 }); // calc
  const [attendacneData, setAttendanceData] = useState([]);
  const [totalTaskGrades, setTotalTaskGrades] = useState(0);
  const [editing, setEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    email: "",
    phone_number: "",
  });
  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${URLAPI}/api/users`, {
          headers: { Authorization: `${getTokenUser}` },
        });

        if (res.data) {
          setUserData(res.data);
          setUpdatedData({
            name: res.data.name,
            email: res.data.email,
            phone_number: res.data.phone_number,
          });

          // Extract attendance data from the response
          const attendanceData = res.data.attendance; // Ensure it's an array

          setAttendanceData(res.data.attendance);
          const presentCount = attendanceData.filter(
            (item) => item.attendanceStatus == "present"
          ).length;
          const absentCount = attendanceData.filter(
            (item) => item.attendanceStatus == "absent"
          ).length;

          // If you want to store attendance, make sure to structure the state correctly
          setAttendance({ present: presentCount, absent: absentCount }); // Store the whole attendance data if needed

          // Extract task data from the response
          const taskData = res.data.tasks || []; // Ensure it's an array
          setTasks(taskData);

          setTotalTaskGrades(
            taskData.reduce((sum, task) => sum + task.score, 0) // Sum task grades
          );
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [getTokenUser]);

  const handleUpdate = async () => {
    console.log(updatedData);
    try {
      const updateRes = await axios.put(`${URLAPI}/api/users`, updatedData, {
        headers: { Authorization: `${getTokenUser}` },
      });
      setUserData(updateRes.data);

      toast.success("Profile updated successfully!");
      setTimeout(() => {
        window.location.reload();

        setEditing(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error("Failed to update profile.");
    }
  };

  const handleLoggout = () => {
    localStorage.removeItem("tokenExpirationUser");
    localStorage.removeItem("tokenUser");
    toast.success("logout successfully");
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  };
  const handleDeleteAccount = () => {
    const userConfirmed = window.confirm(
      "Are you sure you want to delete your account ?"
    );
    if (userConfirmed) {
      toast.info("Deleting your account...");
      axios
        .delete(`${URLAPI}/api/users`, {
          headers: { Authorization: `${getTokenUser}` },
        })
        .then(() => {
          toast.success(
            "Your account has been deleted successfully. Come back to us again!"
          );
          localStorage.removeItem("tokenExpirationUser");
          localStorage.removeItem("tokenUser");
          // إعادة توجيه المستخدم بعد فترة قصيرة
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        })
        .catch((error) => {
          toast.error(
            "An error occurred while deleting your account. Please try again."
          );
        });
    } else {
      toast.info("Account deletion canceled.");
    }
  };

  return (
    <>
      <ToastContainer />
      <Helmet>
        <title>Profile</title>
      </Helmet>
      <div className="container mt-4">
        <h2 className="mb-4">User Dashboard</h2>

        {/* User Info */}
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Personal Information</h5>
            {!editing ? (
              <>
                <p>
                  <strong>Name:</strong> {userData?.name || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {userData?.email || "N/A"}
                </p>
                <p>
                  <strong>Phone number:</strong>{" "}
                  {userData?.phone_number || "N/A"}
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <div>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={updatedData.name}
                    onChange={(e) =>
                      setUpdatedData({ ...updatedData, name: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="text"
                    className="form-control"
                    value={updatedData.email}
                    onChange={(e) =>
                      setUpdatedData({ ...updatedData, email: e.target.value })
                    }
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={updatedData.phone_number}
                    onChange={(e) =>
                      setUpdatedData({
                        ...updatedData,
                        phone_number: e.target.value,
                      })
                    }
                  />
                </div>

                <button className="btn btn-success" onClick={handleUpdate}>
                  Save
                </button>
                <button
                  className="btn btn-secondary ms-2"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-body">
                {/* attendance */}
                <h3 className="text-center">Attendance</h3>

                <p>
                  <strong>Present:</strong> {attendance.present}
                </p>
                <p>
                  <strong>Absent:</strong> {attendance.absent}
                </p>
                <>
                  {attendacneData.map((item, index) => (
                    <li key={index}>
                      <strong>Lecture {index + 1}</strong>:
                      <span
                        className={
                          item.attendanceStatus === "present"
                            ? "text-success"
                            : "text-danger"
                        }
                      >
                        {item.attendanceStatus === "present"
                          ? " Attended"
                          : " Absent"}
                      </span>
                    </li>
                  ))}
                </>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-body">
                <h3 className="card-title text-center">Tasks</h3>
                <p>
                  <strong>Total Score :</strong> {totalTaskGrades}
                </p>
                <>
                  {tasks.map((task, index) => (
                    <li key={index}>
                      <strong>Task {index + 1}</strong> :
                      {task.score ? task.score : 0} -
                      {task.feedback ? task.feedback : "No Send Task"}
                    </li>
                  ))}
                </>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <button onClick={handleLoggout} className="btn btn-outline-info m-2">
            Logout
          </button>
          <button
            onClick={handleDeleteAccount}
            className="btn btn-outline-danger m-2"
          >
            Delete Account
          </button>
        </div>
      </div>
    </>
  );
}

export default Profile;
