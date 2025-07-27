import axios from "axios";
import React, { Fragment, useContext, useEffect, useState } from "react";
// import { DataContext } from "../Context/Context";
import { toast, Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import AuthServices from "../../classes/Auth";
import UserService from "../../classes/UserService";
import CountUp from 'react-countup';
import Loading from "../shared/Loading";

function Profile() {
  const authServices = new AuthServices();
  const URLAPI = authServices.URLAPI;
  const token = authServices.getToken();
  const userService = new UserService(token);
  // const { URLAPI, getTokenUser } = useContext(DataContext);
  const [userData, setUserData] = useState(null); // user data
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    email: "",
    phone_number: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0,0)
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await userService.getUserById();
        if (res) {
          setUserData(res);
          setUpdatedData({
            name: res.name,
            email: res.email,
            phone_number: res.phone_number,
          });
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        if (error.response) {
          setLoading(false);
        } else if (error.request) {
          console.log("No response received:", error.request);
        } else {
          console.log("Error setting up request:", error.message);
        }
      }
    };

    fetchData();
  }, [URLAPI, token]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      if (!token) {
        toast.error("Please log in again");
        navigate("/auth/login");
        return;
      }

      const formData = {
        name: updatedData.name,
        phone_number: updatedData.phone_number,
      };

   
      const response = await userService.updateProfile(formData);
      if (response) {
        toast.success("Update Profile Successfully");
        setEditing(false);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/auth/login");
      }
    }
  };

  const handleLoggout = async () => {
    try {
        await authServices.logout();
      toast.success("Logout Successfuly ");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      console.error("Error during logout:", err);
      toast.error("Error during logout");
    }
  };
  // alert delete account
  const handleDeleteAccount = async () => {
    const userConfirmed = window.confirm(
      "Are you sure you want to delete your account ?"
    );
    if (userConfirmed) {
      toast.loading("Deleting your account...", { duration: 2000 });
      await userService
        .deleteUser()
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
      toast.error("Account deletion canceled.");
      return;
    }
  };
  if (loading) {
    return (
     <Loading />
    );
  }

  return (
    <>
      <Helmet>
        <title>Profile</title>
      </Helmet>
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          User Dashboard
        </h2>

        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
              Personal Information
            </h3>

            {!editing ? (
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-gray-600 font-medium w-32">Name:</span>
                  <span className="text-gray-800">
                    {userData?.role === "user" ? userData?.name : "N/A"}
                  </span>
                </div>

                <div className="flex items-start">
                  <span className="text-gray-600 font-medium w-32">Email:</span>
                  <span className="text-gray-800">
                    {userData?.role === "user" ? userData?.email : "N/A"}
                  </span>
                </div>

                <div className="flex items-start">
                  <span className="text-gray-600 font-medium w-32">Phone:</span>
                  <span className="text-gray-800">
                    {userData?.role === "user" ? userData?.phone_number : "N/A"}
                  </span>
                </div>

                <button
                  onClick={() => setEditing(true)}
                  className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  aria-label="Edit profile"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={updatedData.name}
                    onChange={(e) =>
                      setUpdatedData({ ...updatedData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    value={updatedData.email}
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={updatedData.phone_number}
                    onChange={(e) =>
                      setUpdatedData({
                        ...updatedData,
                        phone_number: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={handleUpdateProfile}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors duration-200"
                    aria-label="Cancel editing"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-between gap-4">
          <button
            onClick={handleLoggout}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-200"
            aria-label="Logout"
          >
            Logout
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
            aria-label="Delete account"
          >
            Delete Account
          </button>
        </div>

        {/* Delete Account Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-red-600">Warning!</h3>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setConfirmationText("");
                    }}
                    className="text-gray-400 hover:text-gray-500"
                    aria-label="Close modal"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-red-600 font-medium">
                    Your account will be deleted permanently and cannot be
                    restored.
                  </p>
                  <p className="text-gray-700">
                    Please type{" "}
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      delete account
                    </span>{" "}
                    to confirm:
                  </p>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="delete account"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setConfirmationText("");
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      handleDeleteAccount();
                    }}
                    disabled={
                      confirmationText.toLowerCase() !== "delete account"
                    }
                    className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 ${
                      confirmationText.toLowerCase() !== "delete account"
                        ? "bg-red-300 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Profile;
