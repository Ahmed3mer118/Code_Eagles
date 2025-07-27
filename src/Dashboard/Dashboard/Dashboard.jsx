import React, { Fragment, useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import axios from "axios";
import { IoClose, IoMenu } from "react-icons/io5";
import Cookies from "js-cookie";
import { Helmet } from "react-helmet-async";
import { toast, Toaster } from "react-hot-toast";
import AuthServices from "../../classes/Auth";
import AdminService from "../../classes/AdminService";
import {
  FiChevronDown,
  FiGrid,
  FiList,
  FiMail,
  FiMessageSquare,
  FiPlus,
  FiUser,
  FiUsers,
  FiWifi,
} from "react-icons/fi";
import { RiFilterOffLine } from "react-icons/ri";
function Dashboard() {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const URLAPI = authServices.URLAPI;
  const adminServices = new AdminService(token);
  const [groups, setGroups] = useState({ online: [], offline: [] });
  const [openSections, setOpenSections] = useState({
    online: true,
    offline: true,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [dark, setDark] = useState(false);
  const [toggleNav, setToggleNav] = useState(true);

  const toggleDarkMode = (e) => {
    e.preventDefault();
    setDark(!dark);
  };

  const toggleSidebar = (e) => {
    e.preventDefault();
    setToggleNav(!toggleNav);
  };

  // get type course
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await adminServices.getAllGroups();

        if (response) {
          const onlineGroup = response.filter(
            (item) => item.type_course === "online"
          );
          const offlineGroup = response.filter(
            (item) => item.type_course !== "online"
          );
          setGroups({ online: onlineGroup, offline: offlineGroup });
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        toast.error("Failed to load groups data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleOpen = (tag) => {
    setOpenSections((prevState) => ({ ...prevState, [tag]: !prevState[tag] }));
  };

  const handleAdminLogout = async () => {
    console.log("logout");
  };

  return (
    <Fragment>
      <Helmet>
        <title>Code Eagles | Admin Dashboard</title>
      </Helmet>

      <div className="flex flex-col md:flex-row min-h-screen relative">
        {/* Toggle Button (Top-Right Fixed) */}
        <button
          onClick={toggleSidebar}
          className="fixed top-4 right-4 z-50 p-2 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white shadow-lg transition-all duration-300"
          aria-label="Toggle sidebar"
        >
          {toggleNav ? (
            <IoClose className="text-xl" />
          ) : (
            <IoMenu className="text-xl" />
          )}
        </button>

        {/* Sidebar */}
        <div
          className={`fixed md:relative min-h-screen z-40 bg-emerald-900 text-white transition-all duration-300 ease-in-out ${
            toggleNav
              ? "w-64 left-0"
              : "-left-full md:left-0 md:w-20 overflow-x-hidden"
          }`}
        >
          <nav className="p-4 md:pt-4 space-y-2">
            {/* New Group Button */}
            <Link
              to="/dashboard/admin/newGroup"
              className={`flex items-center p-3 rounded-lg bg-amber-400 hover:bg-amber-500 text-emerald-900 font-medium transition-colors ${
                !toggleNav && "justify-center"
              }`}
            >
              {toggleNav ? "New Group" : <FiPlus className="text-xl" />}
            </Link>

            {/* All Groups */}
            <Link
              to="/dashboard/admin/allGroups"
              className={`flex items-center p-3 rounded-lg hover:bg-emerald-800 transition-colors ${
                !toggleNav && "justify-center"
              }`}
            >
              {toggleNav ? (
                <>
                  <FiGrid className="mr-3 text-xl" />
                  All Groups
                </>
              ) : (
                <FiGrid className="text-xl" />
              )}
            </Link>

            {/* All Students */}
            <Link
              to="/dashboard/admin/allStudent"
              className={`flex items-center p-3 rounded-lg hover:bg-emerald-800 transition-colors ${
                !toggleNav && "justify-center"
              }`}
            >
              {toggleNav ? (
                <>
                  <FiUsers className="mr-3 text-xl" />
                  All Students
                </>
              ) : (
                <FiUsers className="text-xl" />
              )}
            </Link>

            {/* Online/Offline Groups Sections */}
            {["online", "offline"].map((type) => (
              <div key={type} className="space-y-1">
                <button
                  onClick={() => handleOpen(type)}
                  className={`flex items-center w-full p-3 rounded-lg hover:bg-emerald-800 transition-colors ${
                    !toggleNav ? "justify-center" : "justify-between"
                  }`}
                >
                  <div className="flex items-center">
                    {type === "online" ? (
                      <FiWifi
                        className={`${toggleNav ? "mr-3" : ""} text-xl`}
                      />
                    ) : (
                      <RiFilterOffLine
                        className={`${toggleNav ? "mr-3" : ""} text-xl`}
                      />
                    )}
                    {toggleNav && (
                      <span>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    )}
                  </div>
                  {toggleNav && (
                    <FiChevronDown
                      className={`transition-transform ${
                        openSections[type] ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                <div
                  className={`${toggleNav ? "pl-8" : "pl-2"} space-y-1 ${
                    openSections[type] ? "block" : "hidden"
                  }`}
                >
                  {groups[type]?.map((group) => (
                    <Link
                      key={group._id}
                      to={`/dashboard/admin/group/${group.slug}`}
                      className="block p-2 rounded hover:bg-emerald-700 text-sm transition-colors truncate"
                      title={`${group.title} - ${group.start_date.slice(
                        0,
                        10
                      )}`}
                    >
                      {toggleNav
                        ? `${group.title} - ${group.start_date.slice(0, 10)}`
                        : group.title.substring(0, 3)}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Additional Links */}
            <Link
              to="/dashboard/admin/emails"
              className={`flex items-center p-3 rounded-lg hover:bg-emerald-800 transition-colors ${
                !toggleNav && "justify-center"
              }`}
            >
              {toggleNav ? (
                <>
                  <FiMail className="mr-3 text-xl" />
                  All Request Emails
                </>
              ) : (
                <FiMail className="text-xl" />
              )}
            </Link>

            <Link
              to="/dashboard/admin/get-all-message-by-admin"
              className={`flex items-center p-3 rounded-lg hover:bg-emerald-800 transition-colors ${
                !toggleNav && "justify-center"
              }`}
            >
              {toggleNav ? (
                <>
                  <FiMessageSquare className="mr-3 text-xl" />
                  All Message Emails
                </>
              ) : (
                <FiMessageSquare className="text-xl" />
              )}
            </Link>

            <Link
              to="/dashboard/admin/list-for-Students-by-admin"
              className={`flex items-center p-3 rounded-lg hover:bg-emerald-800 transition-colors ${
                !toggleNav && "justify-center"
              }`}
            >
              {toggleNav ? (
                <>
                  <FiList className="mr-3 text-xl" />
                  List For Students
                </>
              ) : (
                <FiList className="text-xl" />
              )}
            </Link>

            <Link
              to="/dashboard/admin/profile-admin"
              className={`flex items-center p-3 rounded-lg hover:bg-emerald-800 transition-colors ${
                !toggleNav && "justify-center"
              }`}
            >
              {toggleNav ? (
                <>
                  <FiUser className="mr-3 text-xl" />
                  Profile
                </>
              ) : (
                <FiUser className="text-xl" />
              )}
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300  ${dark ? "bg-gray-900 text-white" : "bg-gray-50"}`}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </Fragment>
  );
}

export default Dashboard;
