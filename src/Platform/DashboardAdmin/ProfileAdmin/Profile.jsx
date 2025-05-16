import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../../Users/Context/Context";
import { Toaster, toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import AdminService from "../../classes/AdminService";

function Profile() {
  const { URLAPI, getTokenAdmin, getTokenInstructor, maintenanceMode, setMaintenanceMode } = useContext(DataContext);
  const [adminService] = useState(new AdminService(URLAPI, getTokenAdmin, setMaintenanceMode));
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    email: "",
    phone_number: "",
  });
  const navigate = useNavigate();

  // منع الأزرار أثناء الصيانة (ماعدا زر التبديل)
  useEffect(() => {
    const buttons = document.querySelectorAll("button");
    buttons.forEach((btn) => {
      if (!btn.classList.contains("maintenance-toggle")) {
        btn.disabled = maintenanceMode;
      }
    });
  }, [maintenanceMode]);

  useEffect(() => {
    if (maintenanceMode) {
      adminService.isBlocked = true;
    } else {
      adminService.isBlocked = false;
    }
  }, [maintenanceMode, adminService]);

  useEffect(() => {
    const fetchData = async () => {
      if (maintenanceMode) return; // منع جلب البيانات وقت الصيانة
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
  }, [URLAPI, getTokenAdmin, maintenanceMode, getTokenInstructor, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (maintenanceMode) {
      toast.error("Cannot update profile while in maintenance mode.");
      return;
    }
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
    if (maintenanceMode) {
      toast.error("Cannot logout during maintenance mode.");
      return;
    }
    try {
      const refreshToken = Cookies.get("refreshToken");
      if (refreshToken) {
        await axios.post(`${URLAPI}/api/users/logout`, {
          refreshToken
        });

        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiration");
        Cookies.remove("refreshToken");
      }


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
    if (maintenanceMode) {
      toast.error("Cannot delete account during maintenance mode.");
      return;
    }
    const userConfirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
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
      toast.loading("Account deletion canceled.", {
        duration: 2000,
      });
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
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-4">
                  <h4 className="fw-bold text-primary mb-4 border-bottom pb-2"> Personal Information</h4>

                  {!editing ? (
                    <div className="mb-4">
                      <div className="mb-3 d-flex">
                        <strong className="text-dark w-25">Name:</strong>
                        <span className="text-muted">{userData?.name || "Not available"}</span>
                      </div>
                      <div className="mb-3 d-flex">
                        <strong className="text-dark w-25">Email:</strong>
                        <span className="text-muted">{userData?.email || "Not available"}</span>
                      </div>
                      <div className="mb-4 d-flex">
                        <strong className="text-dark w-25">Phone:</strong>
                        <span className="text-muted">{userData?.phone_number || "Not available"}</span>
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className="btn btn-primary"
                          onClick={() => setEditing(true)}
                          disabled={maintenanceMode}
                        >
                          ✏️ Edit Profile
                        </button>

                        <button
                          className={`btn maintenance-toggle ${maintenanceMode ? "btn-danger" : "btn-success"}`}
                          onClick={() => {
                            adminService.toggleMaintenanceMode(!maintenanceMode);
                            setMaintenanceMode(!maintenanceMode);
                          }}
                        >
                          {maintenanceMode ? "🔧 Close Maintenance" : "🔧 Open Maintenance"}
                        </button>
                      </div>
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
                          disabled={maintenanceMode}
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
                          disabled={maintenanceMode}
                        />
                      </div>

                      <div className="d-flex flex-wrap gap-2 mt-3">
                        <button
                          type="submit"
                          className="btn btn-success"
                          disabled={maintenanceMode}
                        >
                          💾 Save Changes
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setEditing(false)}
                          disabled={maintenanceMode}
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  <hr className="my-4" />
                  <div className="d-flex flex-wrap justify-content-between gap-2">
                    <button
                      className="btn btn-warning"
                      onClick={handleLogout}
                      disabled={maintenanceMode}
                    >
                      🚪 Logout
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={handleDeleteAccount}
                      disabled={maintenanceMode}
                    >
                      🗑️ Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default Profile;
