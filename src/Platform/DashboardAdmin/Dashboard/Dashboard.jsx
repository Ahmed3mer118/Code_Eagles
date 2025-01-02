import React, { useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import axios from "axios";
import { IoMenu } from "react-icons/io5";
import { DataContext } from "../../Users/Context/Context";

function Dashboard() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const [groups, setGroups] = useState({ online: [], offline: [] });
  const [openSections, setOpenSections] = useState({
    online: true,
    offline: true,
  });

  const expiration = localStorage.getItem("tokenExpirationAdmin");
  if (getTokenAdmin && expiration) {
    const currentTime = Date.now();
    if (currentTime > expiration) {
      localStorage.removeItem("tokenAdmin");
      localStorage.removeItem("tokenExpirationAdmin");
      toast.error("Session expired. Please log in again.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    }
  }

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
        const response = await axios.get(`${URLAPI}/api/groups`, {
          headers: { Authorization: `${getTokenAdmin}` },
        });
    
        if (response.data) {
          const onlineGroup = response.data.filter(
            (item) => item.type_course === "online"
          );
          const offlineGroup = response.data.filter(
            (item) => item.type_course !== "online"
          );
          setGroups({ online: onlineGroup, offline: offlineGroup });
        }
    
    };
    
    fetchData();
  }, []);

  const handleOpen = (tag) => {
    setOpenSections((prevState) => ({...prevState, [tag]: !prevState[tag],}));
  };
 
  
  return (
    <div className="row">
      <div className="col-lg-3 col-md-4 col-sm-12 p-0">
        <div className="toggleMenu">
          <button className="btn btn-success" onClick={toggleSidebar}>
            <IoMenu />
          </button>
        </div>
        <ul className={`dashboard-left p-2 m-0 ${toggleNav ? "" : "toggle"}`}>
          <li className="d-flex align-items-center">
            <button className="btn btn-warning text-dark">
              <Link to="/admin/newGroup" className="text-dark">
                New Group
              </Link>
            </button>
            <button className="btn btn-dark text m-2" onClick={toggleDarkMode}>
              Dark
            </button>
          </li>
          <li>
            <Link to="/admin/allGroups">
              <button className="btn btn-warning text-dark w-100 text-start">
                All Groups
              </button>
            </Link>
          </li>
          <li>
            <Link to="/admin/allStudent">
              <button className="btn btn-warning text-dark w-100 text-start">
                All Students
              </button>
            </Link>
          </li>
          {["online", "offline"].map((type) => (
            <li key={type}>
              <button
                className="btn btn-warning dropdown-toggle w-100 text-start"
                onClick={() => handleOpen(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
              <ul className={openSections[type] ? "ulShow" : "ulHide"}>
                {groups[type]?.map((group) => (
                  <li key={group._id}>
                    <Link to={`/admin/${group._id}`} className="text-light">
                      {group.type_course} - {group.start_date.slice(0, 10)}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}

         
          <li>
            <Link to="/admin/emails">
              <button className="btn btn-warning text-dark w-100 text-start">
                Emails
              </button>
            </Link>
          </li>
          <li>
            <Link to="/admin/get-all-message-by-admin">
              <button className="btn btn-warning text-dark w-100 text-start">
                Messages
              </button>
            </Link>
          </li>
          
        </ul>
      </div>
      <div className={`col outlet ${dark ? "bg-dark text-light" : ""}`}>
        <Outlet />
      </div>
    </div>
  );
}

export default Dashboard;
