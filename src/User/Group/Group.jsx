import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DataContext } from "../Context/Context";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { toast } from "react-hot-toast";
import Loading from "../shared/Loading";

function Group() {
  const { URLAPI, getTokenUser } = useContext(DataContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${URLAPI}/api/groups`, {
          headers: { Authorization: `${getTokenUser}` },
        });
        setGroups(response.data);
      } catch (err) {
        console.error("Error fetching groups:", err);
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [URLAPI, getTokenUser]);

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <>
      <Helmet>
        <title>Code Eagles | Available Courses</title>
      </Helmet>

      <div className="container-fluid py-5 bg-light">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h1 className="display-4 fw-bold text-primary mb-3">Available Courses</h1>
              <p className="lead text-muted">
                Explore our wide range of programming courses and start your learning journey today
              </p>
            </div>
            <div className="row g-4">
            {groups?.map((group) => (
              <div key={group._id} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm hover-shadow transition">
                  <div className="card-body d-flex flex-column p-4">
                    <h5 className="card-title text-primary fw-bold mb-3">{group.title}</h5>
                    <p className="card-text text-muted flex-grow-1">{group.description}</p>
                    <div className="mt-4">
                      <Link
                        to={`/courses/${group._id}`}
                        className="btn btn-success w-100 py-2 fw-semibold"
                      >
                        View Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>

         

          {groups?.length === 0 && (
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

export default Group;
