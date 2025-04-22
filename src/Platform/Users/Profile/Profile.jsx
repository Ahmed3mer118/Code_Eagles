import axios from "axios";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { DataContext } from "../Context/Context";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie"
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { URLAPI, getTokenUser } = useContext(DataContext);
  const [userData, setUserData] = useState(null); // user data
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false)
  const [updatedData, setUpdatedData] = useState({
    name: "",
    email: "",
    phone_number: "",
  });

  const navigate = useNavigate();

  useEffect(() => {

    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${URLAPI}/api/users`, {
          headers: { Authorization: ` ${getTokenUser}` },
        });
        if (res.data) {
          setUserData(res.data);
          setUpdatedData({
            name: res.data.name,
            email: res.data.email,
            phone_number: res.data.phone_number,
          });
        }
        setLoading(false)
      } catch (error) {
        setLoading(false)
        if (error.response) {
          setLoading(false)

        } else if (error.request) {
          console.log("No response received:", error.request);
        } else {
          console.log("Error setting up request:", error.message);
        }
      }
    };

    fetchData();
  }, [URLAPI, getTokenUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {

      if (!getTokenUser) {
        toast.error("Please log in again");
        navigate("/login");
        return;
      }

      const formData = {
        name: updatedData.name,
        phone_number: updatedData.phone_number,
      }

      const response = await axios.put(
        `${URLAPI}/api/users`,
        formData,
        {
          headers: {
            Authorization: `${getTokenUser}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Update Profile Successfully");
        setEditing(false);
      }
    } catch (err) {

      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      } 
    }
  };

  const handleLoggout = async () => {
    try {
      const refreshToken = Cookies.get("refreshTokenUser");
      if (refreshToken) {
        await axios.post(`${URLAPI}/api/users/logout`, {
          refreshToken
        });
      }

      localStorage.removeItem("tokenUser");
      localStorage.removeItem("tokenExpirationUser");
      Cookies.remove("refreshTokenUser");

      toast.error("Session expired. Please log in again.");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      console.error("Error during logout:", err);
      toast.error("Error during logout");
    }
  };
  // alert delete account
  const handleDeleteAccount = () => {
    const userConfirmed = window.confirm(
      "Are you sure you want to delete your account ? This action cannot be undone."
    );
    if (userConfirmed) {
      toast.info("Deleting your account...");
      axios
        .delete(`${URLAPI}/api/users`, {
          headers: { Authorization: `${getTokenUser}` },
        })
        .then(() => {
          toast.success(
            "Your account has been deleted successfully. We hope to see you again!"
          );
          localStorage.removeItem("tokenExpirationUser");
          localStorage.removeItem("tokenUser");
          Cookies.remove("refreshTokenUser");

          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        })
        .catch((error) => {
          toast.error(
            "An error occurred while deleting your account. Please try again."
          );
          return;
        });
    } else {
      toast.info("Account deletion canceled.");
      return;
    }
  };
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
    <>

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
                  <strong>Name:</strong> {userData?.role == "user" && userData?.name || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {userData?.role == "user" && userData?.email || "N/A"}
                </p>
                <p>
                  <strong>Phone number:</strong>{" "}
                  {userData?.role == "user" && userData?.phone_number || "N/A"}
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setEditing(true)}
                  aria-label="Submit"
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

                <button className="btn btn-success" onClick={handleUpdateProfile}>
                  Save
                </button>
                <button
                  className="btn btn-secondary ms-2"
                  onClick={() => setEditing(false)}
                  aria-label="Submit"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        {/* <div className="row">
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
        </div> */}
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <button
            onClick={handleLoggout}
            className="btn btn-outline-info m-2"
            aria-label="Submit"
          >
            Logout
          </button>
          <button
            onClick={handleDeleteAccount}
            className="btn btn-outline-danger m-2"
            aria-label="Submit"
          >
            Delete Account
          </button>
        </div>
      </div>
    </>
  );
}

export default Profile;
