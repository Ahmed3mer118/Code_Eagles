import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import AuthServices from "../../classes/Auth";
import AdminService from "../../classes/AdminService";
import UserServices from "../../classes/UserService";

function Profile() {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const adminServices = new AdminService(token);
  const userServices = new UserServices(token);

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
    const fetchData = async () => {
      setLoading(true);
      try {
        // const res = await axios.get(`${URLAPI}/api/users`, {
        //   headers: { Authorization: `${token}` },
        // });
        const res = await userServices.getUserById();

        if (res) {
          setUserData(res);
          setUpdatedData({
            name: res.name,
            email: res.email,
            phone_number: res.phone_number,
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
  }, [token, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      if (!token) {
        toast.error("Please log in again.");
        navigate("/auth/login");
        return;
      }

      const formData = {
        name: updatedData.name,
        phone_number: updatedData.phone_number,
      };

      const res = await userServices.updateProfile(formData);
      if (res) {
        toast.success("Profile updated successfully");
        setUserData(res);
        setEditing(false);
      }
    } catch (err) {
      toast.error("An error occurred while updating the profile");
    }
  };

  const handleLogout = async () => {
    if (!token) {
      toast.error("Please log in again.");
      navigate("/auth/login");
      return;
    }
    try {
      console.log("logout")
      await authServices.logout();
      toast.success("Logout successfully");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      console.log(err?.message)
      toast.error("An error occurred while logging out");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden"></span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard</title>
      </Helmet>
      <Toaster position="top-center" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Toaster position="top-center" />

        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
          Admin Dashboard
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
          {!editing ? (
            // View Mode
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-24">
                  Name:
                </span>
                <span className="text-gray-800 dark:text-white">
                  {userData?.name || "N/A"}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-24">
                  Email:
                </span>
                <span className="text-gray-800 dark:text-white">
                  {userData?.email || "N/A"}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-24">
                  Phone:
                </span>
                <span className="text-gray-800 dark:text-white">
                  {userData?.phone_number || "N/A"}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                  </svg>
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={updatedData.name}
                  onChange={(e) =>
                    setUpdatedData({ ...updatedData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                  value={updatedData.email}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={updatedData.phone_number}
                  onChange={(e) =>
                    setUpdatedData({
                      ...updatedData,
                      phone_number: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Save Changes
                </button>

                <button
                  type="button"
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center disabled:opacity-50"
                  onClick={() => setEditing(false)}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                  Cancel
                </button>
              </div>
            </form>
          )}

          <hr className="my-6 border-gray-200 dark:border-gray-700" />

          <div className="flex flex-wrap justify-between gap-3">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
              Logout
            </button>
          </div>
        </div>

        {showCodePrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
              <h5 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                Enter {codeType === "lock" ? "Lock" : "Unlock"} Code
              </h5>

              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
                placeholder="Enter code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />

              <div className="flex gap-3">
                <button
                  onClick={handleVerifyCode}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowCodePrompt(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Profile;
