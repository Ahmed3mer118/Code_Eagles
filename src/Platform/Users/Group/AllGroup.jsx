import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { DataContext } from "../Context/Context";
import { Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";

function AllGroup() {
  const { URLAPI } = useContext(DataContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${URLAPI}/api/groups`);
        setGroups(response.data);
      } catch (err) {
        console.error("Error fetching groups:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [URLAPI]);

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
    <>
      <Helmet>
        <title>Code Eagles </title>
      </Helmet>

      
      
      <div className="container-fluid py-5 bg-light">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h1 className="display-4 fw-bold text-primary mb-3">Available Courses</h1>
              <p className="lead text-muted">
                Explore our comprehensive programming courses and start your learning journey today
              </p>
            </div>
          </div>

          <div className="row g-4">
            {Array.isArray(groups) && groups.map((group) => (
              <div className="col-12 col-md-6 col-lg-4" key={group._id}>
                <div className="card h-100 border-0 shadow-sm hover-shadow transition">
                  <div className="card-body p-0">
                    <div className="position-relative">
                      <img 
                        src={group.imageCourse} 
                        alt={group.title} 
                        className="card-img-top"
                        style={{ height: "100%", objectFit: "cover" }}
                      />
                      <div className="position-absolute top-0 end-0 p-2">
                        <span className="badge bg-dark rounded-pill">
                          {group.start_date?.slice(0, 10) || "Coming Soon"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="card-title h4 fw-bold text-center text-dark mb-3">{group.title}</h3>
                      
                      <div className="d-flex align-items-center mb-3">
                        {/* <div className="avatar me-2">
                          <img 
                            src="/images/default-avatar.jpg" 
                            alt="Instructor" 
                            className="rounded-circle"
                            style={{ width: "40px", height: "40px", objectFit: "cover" }}
                          />
                        </div> */}
                        <div className="d-flex align-items-center  w-100">
                          <h4 className="fw-semibold text-center w-100">Instructor : {group.instructorName || "Ahmed Amer"} </h4>
                      
                        </div>
                      </div>

                      <Link 
                        to={`/content/${group._id}`} 
                        className="btn btn-success w-100 py-2 fw-semibold"
                      >
                        View Course Details
                      </Link>
                    </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {(!Array.isArray(groups) || groups.length === 0) && (
            <div className="row mt-5">
              <div className="col-12 text-center">
                <div className="alert alert-info" role="alert">
                  <h4 className="alert-heading">No Courses Available</h4>
                  <p className="mb-0">Please check back later for new courses.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AllGroup;
