import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { NavLink, Outlet } from "react-router-dom";
import { DataContext } from "../../Users/Context/Context";


const DetailsGroup = () => {
  const { groupId } = useParams();
  const [showDetailsGroup, setShowDetailsGroup] = useState([]);
  const [loading, setLoading] = useState(false);
  const { URLAPI, getTokenAdmin } = useContext(DataContext);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${URLAPI}/api/groups/${groupId}`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      })
      .then((res) => { setShowDetailsGroup(res.data), setLoading(false) })
      .catch((err) => {
        console.log("No Group : " + err);
        setLoading(false);
      });
  }, [groupId, URLAPI, getTokenAdmin]);

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to remove this student from the group?")) {
      return;
    }

    try {
      await axios.delete(`${URLAPI}/api/groups/${groupId}/students/${studentId}`, {
        headers: { Authorization: `${getTokenAdmin}` }
      });
      toast.success("Student removed successfully");
      fetchGroupDetails();
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Error removing student");
    }
  };

  const getLinkClassName = ({ isActive }) =>
    isActive ? "btn btn-success m-2" : "btn btn-warning m-2";

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

  if (!showDetailsGroup) {
    return (
      <div className="container-fluid py-5">
        <div className="alert alert-danger">
          Group not found
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          Group :
          {showDetailsGroup.title
            ? ` ${showDetailsGroup.title} ${showDetailsGroup.start_date?.slice(
                0,
                10
              )}`
            : ` loading... `}
        </title>
      </Helmet>

      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="text-center mb-4">
              {showDetailsGroup.title
                ? ` Group : ${
                    showDetailsGroup.title
                  } - ${showDetailsGroup.start_date?.slice(0, 10)} `
                : " loading.."}
            </h1>
            
            <div className="d-flex flex-wrap justify-content-center">
              <NavLink
                to={`/admin/${groupId}/students`}
                className={getLinkClassName}
                aria-label="Students"
              >
                Students
              </NavLink>
              <NavLink
                to={`/admin/${groupId}/lectures`}
                className={getLinkClassName}
                aria-label="Lectures"
              >
                Lectures
              </NavLink>
              <NavLink
                to={`/admin/${groupId}/tasks`}
                className={getLinkClassName}
                aria-label="Tasks"
              >
                Tasks
              </NavLink>
               <NavLink
                to={`/admin/${groupId}/quiz`}
                className={getLinkClassName}
                aria-label="Quiz"
              >
                Quiz
              </NavLink>
              <NavLink
                to={`/admin/${groupId}/update`}
                className={getLinkClassName}
                aria-label="Update"
              >
                Update
              </NavLink>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsGroup;
