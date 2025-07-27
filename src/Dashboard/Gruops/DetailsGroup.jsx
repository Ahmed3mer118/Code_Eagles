import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { NavLink, Outlet } from "react-router-dom";
import AuthServices from "../../classes/Auth";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";

const DetailsGroup = () => {
  const { slug } = useParams();
  const [showDetailsGroup, setShowDetailsGroup] = useState([]);
  const [loading, setLoading] = useState(false);
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const URLAPI = authServices.URLAPI;
  const adminServices = new AdminService(token);
  const instructorService = new InstructorService(token);
  useEffect(() => {
    const fetchDetailsGroup = async () => {
      setLoading(true);
      const res = await adminServices.getGroupDetails(slug);
      if (res) {
        setShowDetailsGroup(res);
        setLoading(false);
      } else {
        console.log("No Group : " + err);
        setLoading(false);
      }
    };
    fetchDetailsGroup();
  }, [slug, token]);

  // const handleRemoveStudent = async (studentId) => {
  //   if (!window.confirm("Are you sure you want to remove this student from the group?")) {
  //     return;
  //   }

  //   try {
  //     await axios.delete(`${URLAPI}/api/groups/${slug}/students/${studentId}`, {
  //       headers: { Authorization: `${token}` }
  //     });
  //     toast.success("Student removed successfully");
  //     fetchGroupDetails();
  //   } catch (error) {
  //     console.error("Error removing student:", error);
  //     toast.error("Error removing student");
  //   }
  // };

  const getLinkClassName = ({ isActive }) =>
    isActive ? "btn btn-success m-2" : "btn btn-warning m-2";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!showDetailsGroup) {
    return (
      <div className="container-fluid py-5">
        <div className="alert alert-danger">Group not found</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {showDetailsGroup.title
            ? `${showDetailsGroup.title} | ${showDetailsGroup.start_date?.slice(
                0,
                10
              )}`
            : "Loading Group..."}
        </title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {showDetailsGroup.title ? (
                <>
                  Group:{" "}
                  <span className="text-blue-600">
                    {showDetailsGroup.title}
                  </span>
                  <span className="text-gray-600 ml-2">
                    - {showDetailsGroup.start_date?.slice(0, 10)}
                  </span>
                </>
              ) : (
                <div className="h-8 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
              )}
            </h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <NavLink
              to={`/dashboard/admin/group/${slug}/students`}
              className={({ isActive }) =>
                `px-6 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`
              }
              aria-label="Students"
            >
              Students
            </NavLink>
            <NavLink
              to={`/dashboard/admin/group/${slug}/lectures`}
              className={({ isActive }) =>
                `px-6 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`
              }
              aria-label="Lectures"
            >
              Lectures
            </NavLink>
            <NavLink
              to={`/dashboard/admin/group/${slug}/tasks`}
              className={({ isActive }) =>
                `px-6 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`
              }
              aria-label="Tasks"
            >
              Tasks
            </NavLink>
            <NavLink
              to={`/dashboard/admin/group/${slug}/quiz`}
              className={({ isActive }) =>
                `px-6 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`
              }
              aria-label="Quiz"
            >
              Quiz
            </NavLink>
            <NavLink
              to={`/dashboard/admin/group/${slug}/update`}
              className={({ isActive }) =>
                `px-6 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`
              }
              aria-label="Update"
            >
              Update
            </NavLink>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsGroup;
