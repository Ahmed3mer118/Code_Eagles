import axios from "axios";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { DataContext } from "../../Users/Context/Context";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { URLAPI, getTokenAdmin , getTokenInstructor } = useContext(DataContext);

  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    email: "",
    phone_number: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${URLAPI}/api/users`, {
          headers: { Authorization: `${getTokenAdmin || getTokenInstructor}` },
        });
        if (res.data) {
            
          setUserData(res.data);
          setUpdatedData({
            name: res.data.name,
            email: res.data.email,
            phone_number: res.data.phone_number,
          });
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          // navigate("/login/admin");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [URLAPI, getTokenAdmin, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      if (!getTokenAdmin) {
        toast.error("Please log in again.");
        navigate("/login/admin");
        return;
      }

      const formData = {
        name: updatedData.name,
        phone_number: updatedData.phone_number,
      };

      const response = await axios.put(
        `${URLAPI}/api/users`,
        formData,
        {
          headers: {
            Authorization: `${getTokenAdmin || getTokenInstructor}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Profile updated successfully");
        setUserData(response.data);
        setEditing(false);
      }
    } catch (err) {
      console.error("Error updating the profile:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "An error occurred while updating the profile");
      }
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = Cookies.get("refreshToken");
      if (refreshToken) {
        await axios.post(`${URLAPI}/api/users/logout`, {
          refreshToken
        });
      }

      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiration");
      Cookies.remove("refreshToken");

      toast.success("Logout successfully");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      console.error("Error logging out:", err);
      toast.error("An error occurred while logging out");
    }
  };

  const handleDeleteAccount = () => {
    const userConfirmed = window.confirm(
      "Are you sure you want to delete your account ? This action cannot be undone."
    );
    if (userConfirmed) {
      toast.info("Deleting your account...");
      axios
        .delete(`${URLAPI}/api/admin`, {
          headers: { Authorization: `${getTokenAdmin}` },
        })
        .then(() => {
          toast.success(
            "Your account has been deleted successfully. We hope to see you again!"
          );
          localStorage.removeItem("token");
          localStorage.removeItem("tokenExpiration");
          Cookies.remove("refreshToken");

          setTimeout(() => {
            window.location.href = "/login/admin";
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
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Code Eagles | Admin Dashboard</title>
      </Helmet>

      <div className="container-fluid py-5 bg-light">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12">
              <h1 className="text-center text-dark mb-2">Admin Dashboard</h1>
              <p className="lead text-muted text-center">
                Manage your account and update your personal information
              </p>
            </div>
          </div>

          <div className="row">
            <div className="col-12 col-lg-8 mx-auto">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h5 className="card-title fw-bold text-primary mb-4">Personal Information</h5>
                  
                  {!editing ? (
                    <div className="mb-4">
                      <div className="mb-3 d-flex alige-items-center">
                        <strong className="text-dark">Name:</strong>
                        <p className="text-muted">{userData?.name || "Not available"}</p>
                      </div>
                      <div className="mb-3 d-flex alige-items-center">
                        <strong className="text-dark">Email:</strong>
                        <p className="text-muted">{userData?.email || "Not available"}</p>
                      </div>
                      <div className="mb-3 d-flex alige-items-center">
                        <strong className="text-dark">Phone number:</strong>
                        <p className="text-muted">{userData?.phone_number || "Not available"}</p>
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={() => setEditing(true)}
                      >
                        Edit Profile
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateProfile}>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Name</label>
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
                        <label className="form-label fw-semibold">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={updatedData.email}
                          disabled
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Phone number</label>
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
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-success">
                          Save Changes
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setEditing(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-between mt-4">
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-primary"
                >
                  Logout
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="btn btn-outline-danger"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
