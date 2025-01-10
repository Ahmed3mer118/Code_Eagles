import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { DataContext } from "../Context/Context";

function AllCourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { URLAPI, getTokenUser } = useContext(DataContext);
  const navigate = useNavigate();

  // Fetch all groups and filter approved ones
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!getTokenUser) {
          toast.error("Please login to view your courses.");
          return;
        }

        // Fetch user details to get groups
        const userRes = await axios.get(`${URLAPI}/api/users`, {
          headers: { Authorization: ` ${getTokenUser}` },
        });

        // Filter groups where the user is approved
        const approvedCourses = userRes.data.groups.filter(
          (group) => group.status === "approved"
        );

        // Fetch details for each approved course
        const courseDetails = await Promise.all(
          approvedCourses.map(async (element) => {
            const res = await axios.get(
              `${URLAPI}/api/groups/${element.groupId}`,
              {
                headers: { Authorization: getTokenUser },
              }
            );
            return res.data;
          })
        );

        // Set the courses state with the fetched details
        setCourses(courseDetails);
      } catch (err) {
        console.error("Error fetching courses:", err);
        toast.error("Failed to fetch courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [URLAPI, getTokenUser]);

  // Handle navigation to course details
  const handleViewCourse = (groupId) => {
    navigate(`/course/${groupId}`);
  };

  if (loading) {
    return <h1 className="text-center mt-5 mb-5">Loading...</h1>;
  }

  return (
    <div className="container mt-5 mb-5">
      <h1 className="mb-4">Your courses</h1>
      <div className="row">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div className="col-md-4 mb-4" key={course._id}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Course: {course.title}</h5>

                  <p className="card-text">
                    <strong className="text-muted">
                      Start Date : {course.start_date?.split("T")[0]}
                    </strong>
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleViewCourse(course._id)}
                  >
                    Show Course
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <p>There are no registered courses</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllCourse;
