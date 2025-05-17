// باقي الاستيرادات كما هي
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../../Users/Context/Context";
import { Toaster, toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import AdminService from "../../classes/AdminService";

function Profile() {
  const {
    URLAPI,
    getTokenAdmin,
    getTokenInstructor } = useContext(DataContext);
  const [maintenanceMode, setMaintenanceMode] = useState( null);
  const [adminService] = useState(
    new AdminService(URLAPI, getTokenAdmin)
  );


  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    email: "",
    phone_number: "",
  });

  const navigate = useNavigate();
  const [showCodePrompt, setShowCodePrompt] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [codeType, setCodeType] = useState("");

  useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      try {
        const res = await adminService.getLockCode();
        setMaintenanceMode(res.isActive);
  
        const buttons = document.querySelectorAll("button");
        buttons.forEach((btn) => {
          if (!btn.classList.contains("maintenance-toggle")) {
            btn.disabled = res.isActive;
          }
        });
      } catch (error) {
        console.error("Error fetching maintenance status:", error);
      }
    };
  
    fetchMaintenanceStatus();
  }, []);

  useEffect(() => {
    adminService.isBlocked = maintenanceMode;
  }, [maintenanceMode, adminService]);

  useEffect(() => {
    const fetchData = async () => {
      if (maintenanceMode) return;
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

      const response = await axios.put(`${URLAPI}/api/users`, formData, {
        headers: {
          Authorization: `${getTokenAdmin || getTokenInstructor}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        toast.success("Profile updated successfully");
        setUserData(response.data);
        setEditing(false);
      }
    } catch (err) {
      console.error("Error updating the profile:", err);
      toast.error("An error occurred while updating the profile");
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
        await axios.post(`${URLAPI}/api/users/logout`, { refreshToken });

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

  const handleSendLockCode = async () => {
    try {
      await adminService.sendLockCode();
      toast.success("Lock code sent to your email.");
      setCodeType("lock");
      setShowCodePrompt(true);
      const res = await adminService.getLockCode();
      setMaintenanceMode(res.isActive);
     

    } catch (error) {
      console.error("Error sending lock code:", error);
      toast.error("An error occurred while sending the lock code");
    }
  };

  const handleSendUnlockCode = async () => {

    try {
      await adminService.sendUnlockCode();
      toast.success("Unlock code sent to your email.");
      setCodeType("unlock");
      setShowCodePrompt(true);

    } catch (error) {
      console.error("Error sending unlock code:", error);
      toast.error("An error occurred while sending the unlock code");
    }
  };

  const handleVerifyCode = async () => {
    try {
      if (codeType === "lock") {
        const res = await adminService.verifyLockCode(verificationCode);

        if (res.isActive) {
          toast.success("Maintenance mode enabled");
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } else if (codeType === "unlock") {
        const res = await adminService.verifyUlockCode(verificationCode);
        if (res.isActive) {
        toast.success("Maintenance mode disabled");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        // const res2 = await adminService.getLockCode();
          setMaintenanceMode(res.isActive);
          window.location.reload();
        }
      }
      setShowCodePrompt(false);
      setVerificationCode("");
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error("Invalid verification code");
    }
  };

  const handleDeleteAccount = () => {
    if (maintenanceMode) {
      toast.error("Cannot delete account during maintenance mode.");
      return;
    }

    const userConfirmed = window.confirm("Are you sure you want to delete your account?");
    if (userConfirmed) {
      toast.info("Deleting your account...");
      axios
        .delete(`${URLAPI}/api/admin`, {
          headers: { Authorization: `${getTokenAdmin}` },
        })
        .then(() => {
          toast.success("Account deleted successfully.");
          localStorage.removeItem("token");
          localStorage.removeItem("tokenExpiration");
          Cookies.remove("refreshToken");
          setTimeout(() => {
            window.location.href = "/login/admin";
          }, 3000);
        })
        .catch((error) => {
          toast.error("An error occurred while deleting your account.");
        });
    }
  };

  if (loading) {
    return <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden"></span>
      </div>
    </div>;
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard</title>
      </Helmet>

      <div className="container py-5">
        <h1 className="text-center mb-4">Admin Dashboard</h1>
        <div className="card p-4 shadow-sm">
          {!editing ? (
            <>
              <p><strong>Name:</strong> {userData?.name || "N/A"}</p>
              <p><strong>Email:</strong> {userData?.email || "N/A"}</p>
              <p><strong>Phone:</strong> {userData?.phone_number || "N/A"}</p>

              <div className="d-flex flex-wrap gap-2 mt-3">
                <button className="btn btn-primary" onClick={() => setEditing(true)}>
                  ✏️ Edit Profile
                </button>

                {maintenanceMode  ? (
                  <button
                    className="btn btn-danger maintenance-toggle"
                    disabled={false} 
                    onClick={handleSendUnlockCode}
                  >
                    🔓 Send Unlock Code
                  </button>
                ) : (
                  <button
                    className="btn btn-success maintenance-toggle"
                    disabled={false} 
                    onClick={handleSendLockCode}
                  >
                    🔒 Send Lock Code
                  </button>
                )}
             
                <span className={`text-${maintenanceMode  ? "danger" : "muted"}`}>
                  {maintenanceMode  ? "Maintenance Mode is Inactive" : "Maintenance Mode is Active"}
                </span>
              </div>
            </>
          ) : (
            <form onSubmit={handleUpdateProfile}>
              <div className="mb-3">
                <label>Name</label>
                <input
                  className="form-control"
                  value={updatedData.name}
                  onChange={(e) =>
                    setUpdatedData({ ...updatedData, name: e.target.value })
                  }
                  disabled={maintenanceMode}
                />
              </div>
              <div className="mb-3">
                <label>Email</label>
                <input className="form-control" value={updatedData.email} disabled />
              </div>
              <div className="mb-3">
                <label>Phone</label>
                <input
                  className="form-control"
                  value={updatedData.phone_number}
                  onChange={(e) =>
                    setUpdatedData({ ...updatedData, phone_number: e.target.value })
                  }
                  disabled={maintenanceMode}
                />
              </div>

              <button type="submit" className="btn btn-success me-2" disabled={maintenanceMode}>
                💾 Save
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditing(false)}
                disabled={maintenanceMode}
              >
                ❌ Cancel
              </button>
            </form>
          )}

          <hr />
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <button className="btn btn-warning" onClick={handleLogout}>
              🚪 Logout
            </button>
            <button className="btn btn-danger" onClick={handleDeleteAccount}>
              🗑️ Delete Account
            </button>
          </div>
        </div>
      </div>

      {showCodePrompt && (
        <div className="overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div

            className="confirmation-box bg-white p-4 rounded"
            style={{
              width: "90%",
              maxWidth: "400px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h5>Enter {codeType === "lock" ? "Lock" : "Unlock"} Code</h5>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Enter code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <button className="btn btn-primary w-100 mb-2" onClick={handleVerifyCode}>
              ✅ Submit
            </button>
            <button className="btn btn-secondary w-100" onClick={() => setShowCodePrompt(false)}>
              ❌ Cancel
            </button>
          </div>
        </div>
      )}

      <Toaster position="top-center" />
    </>
  );
}

export default Profile;
