import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { DataContext } from "../../Users/Context/Context";
import { Helmet } from "react-helmet-async";
import { GiNextButton } from "react-icons/gi";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";

function AllGroups() {
  const { URLAPI, getTokenAdmin, getTokenInstructor } = useContext(DataContext);
  const [offline, setOffline] = useState([]);
  const [online, setOnline] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [adminService] = useState(new AdminService(URLAPI, getTokenAdmin));
  const [instructorService] = useState(new InstructorService(URLAPI, getTokenInstructor));

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        let response;
        
        if (window.location.pathname.includes("/admin")) {
          response = await adminService.getAllGroups();
        } else {
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
      <div className=" mb-3" key={item._id}>
        <div className="card h-100 shadow-sm">
          <div className="card-body">
            <h5 className="card-title">{item.title}</h5>
            <p className="card-text text-muted">
              Start Date: {item.start_date?.slice(0, 10)}
            </p>
            <Link 
              to={`/admin/${item._id}`} 
              className="btn btn-success w-100"
            >
              <GiNextButton className="me-2" />
              View Details
            </Link>
          </div>
        </div>
      </div>
    ));
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
    <div className="container-fluid py-4">
      <Toaster position="top-center" />
      <Helmet>
        <title>All Groups | Admin Dashboard</title>
      </Helmet>
      
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-0">Course Groups</h1>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 col-md-12 col-sm-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h2 className="h5 mb-0">Online Groups</h2>
            </div>
            <div className="card-body">
              <div className="row">
                {online.length === 0 ? (
                  <div className="col-12">
                    <div className="alert alert-info mb-0">
                      No online groups available
                    </div>
                  </div>
                ) : (
                  renderGroupButtons(online)
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6 col-md-12 col-sm-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h2 className="h5 mb-0">Offline Groups</h2>
            </div>
            <div className="card-body">
              <div className="row">
                {offline.length === 0 ? (
                  <div className="col-12">
                    <div className="alert alert-info mb-0">
                      No offline groups available
                    </div>
                  </div>
                ) : (
                  renderGroupButtons(offline)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllGroups;