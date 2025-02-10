import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { DataContext } from "../Context/Context";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
function AllGroup() {
  const { URLAPI, handleJoinGroup } = useContext(DataContext);
  const [groups, setGroups] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showAllGroup, setshowAllGroup] = useState(false);

  // Fetch all groups
  useEffect(() => {
    axios
      .get(`${URLAPI}/api/groups`)
      .then((res) => {
        setGroups(res.data);
        setshowAllGroup(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setshowAllGroup(true);
        setLoading(false);
      });
  }, [URLAPI]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <svg
          className="loading"
          viewBox="25 25 50 50"
          style={{ width: "3.25em" }}
        >
          <circle r="20" cy="50" cx="50"></circle>
        </svg>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      {showAllGroup && (
        <div className="container mb-3" style={{ width: "80%" }}>
          <h1 className="text-center my-4">Available Courses</h1>
          <div className="row g-4">
         
          {    Array.isArray(groups) &&
              groups.map((group) => (
                <div className="col-md-4" key={group._id}>
                  <div className="card shadow-sm">
                    <div className="card-body text-center">
           
                    <img src={group.imageCourse} alt="Course Image" loading="lazy" style={{width:"100%", maxHeight:"300px"}} />
                      <h3 className="card-title">{group.title}</h3>
                      {/* <p className="card-text">
                         {group.start_date?.slice(0, 10)}
                      </p> */}

                    
                      <h5>Instructor : {group.instructorName || "Ahmed Amer"}</h5>
                      <Link to={`/content/${group._id}`} className="btn btn-success mt-2" > Read More</Link>
                    </div>
                  </div>
                </div>
              ))}
           
          </div>
        </div>
      )}
    </>
  );
}

export default AllGroup;
