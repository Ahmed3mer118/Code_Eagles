import React, { Fragment, useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import AuthServices from "../classes/Auth";
import UserService from "../classes/UserService";
import Loading from "../User/shared/Loading";

function ProfileInstructor() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    email: "",
    phone_number: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  // Initialize services
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const userService = new UserService(token);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!token) {
          toast.error("Please log in again");
          navigate("/auth/login");
          return;
        }

        const res = await userService.getUserById();
        if (res) {
          setUserData(res);
          setUpdatedData({
            name: res.name || "",
            email: res.email || "",
            phone_number: res.phone_number || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.status === 401) {
          toast.error("Session expired. Please log in again.");
          navigate("/auth/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
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
        toast.success("Profile updated successfully");
        setEditing(false);
        // Refresh user data
        const refreshedData = await userService.getUserById();
        if (refreshedData) {
          setUserData(refreshedData);
        }
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      if (err.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/auth/login");
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setLoading(false);
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

  const handleDeleteAccount = async () => {
    try {
      if (!token) {
        toast.error("Please log in again");
        navigate("/auth/login");
        return;
      }

      await userService.deleteUser();
      toast.success("Your account has been deleted successfully. We hope to see you again!");
      
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("An error occurred while deleting your account. Please try again.");
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

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Instructor Profile</h2>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6">
            <h5 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h5>
            
            {!editing ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-700 sm:w-32">Name:</span>
                  <span className="text-gray-900 mt-1 sm:mt-0">
                    {userData?.role === "instructor" && userData?.name ? userData.name : "N/A"}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-700 sm:w-32">Email:</span>
                  <span className="text-gray-900 mt-1 sm:mt-0">
                    {userData?.role === "instructor" && userData?.email ? userData.email : "N/A"}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center py-3">
                  <span className="text-sm font-medium text-gray-700 sm:w-32">Phone Number:</span>
                  <span className="text-gray-900 mt-1 sm:mt-0">
                    {userData?.role === "instructor" && userData?.phone_number ? userData.phone_number : "N/A"}
                  </span>
                </div>
                
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={updatedData.name}
                    onChange={(e) =>
                      setUpdatedData({ ...updatedData, name: e.target.value })
                    }
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    value={updatedData.email}
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={updatedData.phone_number}
                    onChange={(e) =>
                      setUpdatedData({
                        ...updatedData,
                        phone_number: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <button
            onClick={handleLoggout}
            className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Logout
          </button>
          
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Delete Account
          </button>
        </div>

        {/* Delete Account Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 rounded-full p-2 mr-3">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Warning!</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-red-600 font-semibold mb-3">
                  Your account will be deleted permanently and cannot be restored.
                </p>
                <p className="text-gray-700 mb-3">Please type <code className="bg-gray-100 px-2 py-1 rounded">delete account</code> to confirm:</p>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="delete account"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  onClick={() => {
                    setShowModal(false);
                    setConfirmationText("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  disabled={confirmationText.toLowerCase() !== "delete account"}
                  onClick={() => {
                    setShowModal(false);
                    setConfirmationText("");
                    handleDeleteAccount();
                  }}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ProfileInstructor;
