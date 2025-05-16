import React, { Fragment, useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import axios from "axios";
import { IoMenu } from "react-icons/io5";
import { DataContext } from "../../Users/Context/Context";
import Cookies from "js-cookie";
import { Helmet } from "react-helmet-async";
import {toast ,Toaster } from "react-hot-toast";
import AdminService from "../../classes/AdminService";
function Dashboard() {
  const { getTokenAdmin } = useContext(DataContext);
  const [adminService] = useState(new AdminService(getTokenAdmin));
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
        const response = await adminService.getAllGroups();

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
  }, [ getTokenAdmin]);

  const handleOpen = (tag) => {
    setOpenSections((prevState) => ({ ...prevState, [tag]: !prevState[tag] }));
  };

  const refreshTokenAdmin = async () => {
    try {
      const refreshTokenLocal = Cookies.get("refreshToken");
      if (!refreshTokenLocal) {
        console.error("No refresh token found");
        handleAdminLogout();
        return false;
      }

      const response = await adminService.refreshToken(refreshTokenLocal);
      const { accessToken, refreshToken } = response;
      const expirationTime = Date.now() + 15 * 60 * 1000; // 15 minutes

      localStorage.setItem("token", JSON.stringify(accessToken));
      localStorage.setItem("tokenExpiration", JSON.stringify(expirationTime));
      Cookies.set("refreshToken", refreshToken, {
        expires: 7,
        secure: true,
        sameSite: "strict"
      });
      
      axios.defaults.headers.common["Authorization"] = `${accessToken}`;
      console.log("Admin Token refreshed successfully");
      return true;
    } catch (error) {
      console.error("Failed to refresh admin token:", error);
      handleAdminLogout();
      return false;
    }
  };
  
  const handleAdminLogout = async () => {
    try {
      const refreshToken = Cookies.get("refreshToken");
      if (refreshToken) {
        await adminService.logout(refreshToken);
      }
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiration");
      Cookies.remove("refreshToken");
      toast.success("Logout successfully");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  };
  
  useEffect(() => {
    const checkAdminTokenExpiration = () => {
      const expiration = JSON.parse(localStorage.getItem("tokenExpiration"));
      if (!expiration) {
        handleAdminLogout();
        return;
      }

      const timeLeft = expiration - Date.now();
      if (timeLeft <= 30 * 1000) {
        refreshTokenAdmin();
      }
    };

    const token = localStorage.getItem("token");
    const refreshToken = Cookies.get("refreshToken");
    
    if (!token && !refreshToken) {
      handleAdminLogout();
      return;
    }

    checkAdminTokenExpiration();
    const interval = setInterval(checkAdminTokenExpiration, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Fragment>
      <Helmet>
        <title>Code Eagles | Admin Dashboard</title>
      </Helmet>

      <div className="row">
        <div className="col-lg-3 col-md-4 col-sm-12 p-0">
          <div className="toggleMenu">
            <button
              className="btn btn-success"
              onClick={toggleSidebar}
              aria-label="submit"
            >
              <IoMenu />
            </button>
          </div>
          <ul
            className={`p-2 m-0 ${toggleNav ? "" : "toggle"}`}
            style={{
              backgroundColor: "#004643",
              color: "white",
              minHeight: "100vh",
              transition: "0.6s",
            }}
          >
            <li className="d-flex align-items-center">
              <button className="btn btn-warning text-dark" aria-label="submit">
                <Link to="/admin/newGroup" className="text-dark">
                  New Group
                </Link>
              </button>
            </li>
            <li>
              <button
                className="btn btn-warning text-dark w-100 text-start"
                aria-label="su"
              >
                <Link to="/admin/allGroups" className="text-dark">All Groups</Link>
              </button>
            </li>
            <li>
              <button
                className="btn btn-warning text-dark w-100 text-start"
                aria-label="su"
              >
                <Link to="/admin/allStudent" className="text-dark">All Students</Link>
              </button>
            </li>
            {["online", "offline"].map((type) => (
              <li key={type}>
                <button
                  className="btn btn-warning dropdown-toggle w-100 text-start"
                  onClick={() => handleOpen(type)}
                  aria-label="submit"
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
                <ul className={openSections[type] ? "ulShow" : "ulHide"}>
                  {groups[type]?.map((group) => (
                    <li key={group._id}>
                      <Link to={`/admin/${group._id}`} className="text-light">
                        {group.title}- {group.start_date.slice(0, 10)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}

            <li>
              <button
                className="btn btn-warning text-dark w-100 text-start"
                aria-label="submit"
              >
                <Link to="/admin/emails" className="text-dark">All Request Emails</Link>
              </button>
            </li>
            <li>
              <button
                className="btn btn-warning text-dark w-100 text-start"
                aria-label="submit"
              >
                <Link to="/admin/get-all-message-by-admin" className="text-dark">All Message Emails</Link>
              </button>
            </li>
            <li>
              <button
                className="btn btn-warning text-dark w-100 text-start"
                aria-label="submit"
              >
                <Link to="/admin/list-for-Students-by-admin" className="text-dark">List For Students</Link>
              </button>
            </li>
            <li>
              <button
                className="btn btn-warning text-dark w-100 text-start"
                aria-label="submit"
              >
                <Link to="/admin/profile-admin" className="text-dark">Profile</Link>
              </button>
            </li>
          </ul>
        </div>
        <div className={`col outlet ${dark ? "bg-dark text-light" : ""}`}>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "70vh",
              }}
            >
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </Fragment>
  );
}

export default Dashboard;
