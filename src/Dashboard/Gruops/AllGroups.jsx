import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { GiNextButton } from "react-icons/gi";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";
import AuthServices from "../../classes/Auth";

function AllGroups() {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const URLAPI = authServices.URLAPI;
  const adminServices = new AdminService(token);
  const instructorService = new InstructorService(token);
  const [offline, setOffline] = useState([]);
  const [online, setOnline] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        let response;

        if (window.location.pathname.includes("/admin")) {
          response = await adminServices.getAllGroups();
        } else if (window.location.pathname.includes("/instructor")) {
          response = await instructorService.getAllGroups();
        }

        if (response && Array.isArray(response)) {
          const onlineGroup = response.filter(
            (item) => item.type_course === "online"
          );
          setOnline(onlineGroup);

          const offlineGroup = response.filter(
            (item) => item.type_course !== "online"
          );
          setOffline(offlineGroup);
        } else {
          setOnline([]);
          setOffline([]);
          toast.error("No groups found");
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        toast.error("Failed to fetch groups");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [location.pathname]);

  const renderGroupButtons = (groupList) => {
    return groupList.map((item) => (
      <div className="mb-6" key={item._id}>
        <div className="bg-white rounded-xl shadow-md overflow-hidden h-full transition-transform hover:scale-[1.02] hover:shadow-lg">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {item.title}
            </h3>
            <p className="text-gray-600 mb-4">
              <span className="font-medium">Start Date:</span>{" "}
              {item.start_date?.slice(0, 10)}
            </p>
            <Link
              to={`/dashboard/admin/group/${item.slug}`}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200"
            >
              <GiNextButton className="mr-2 text-lg" />
              View Details
            </Link>
          </div>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-center" />
      <Helmet>
        <title>All Groups | Admin Dashboard</title>
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Course Groups</h1>
        <p className="text-gray-600">
          Manage all online and offline course groups
        </p>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Online Groups Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Online Groups</h2>
          </div>
          <div className="p-6">
            {online.length === 0 ? (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      No online groups available
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderGroupButtons(online)}
              </div>
            )}
          </div>
        </div>

        {/* Offline Groups Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-cyan-600 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Offline Groups</h2>
          </div>
          <div className="p-6">
            {offline.length === 0 ? (
              <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4 rounded-r">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-cyan-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-cyan-700">
                      No offline groups available
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderGroupButtons(offline)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllGroups;
