import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { DataContext } from "../Context/Context";
import "./Courses.css";
import { Helmet } from "react-helmet-async";

function AllCourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { URLAPI, getTokenUser } = useContext(DataContext);
  const navigate = useNavigate();

  var attendedLectures = 0;
  // let totalLectures = 0;
  // let percentage = (attendedLectures / totalLectures) * 100;
  // attendancePercentage

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

        // for (let i = 0; i < userRes.data.groups.length; i++) {
        //   const element = userRes.data.groups[i];
        //   attendedLectures = element.attendancePercentage;

        //   console.log(attendedLectures);
        // }

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
            return {
              ...res.data,
              attendancePercentage: element.attendancePercentage,
            };
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
      <Helmet>
        <title>Code Eagles | My Couses</title>
      </Helmet>
      <div className="container mt-5 mb-5">
        <h1 className="mb-4">Your courses</h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {courses.length > 0 ? (
            courses.map((course) => {
              const percentage = course.attendancePercentage || 0;
              const startDate = course.start_date
                ? course.start_date.split("T")[0]
                : "N/A";

              return (
                <div key={course._id}>
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Course: {course.title}</h5>

                      <div className="card-text d-flex justify-content-between align-items-center">
                        <strong className="text-muted">
                          Start Date: {startDate}
                        </strong>
                        <div
                          style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            background: `conic-gradient(#28a745 ${percentage}%, transparent ${percentage}% 100%)`,
                            zIndex: 1,
                          }}
                        >
                          <span
                            className="text-center"
                            style={{
                              width: "50px",
                              height: "60px",
                              borderRadius: "50%",
                              backgroundColor: "#fff",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              padding: "30px",
                              fontSize: "14px",
                              fontWeight: "bold",
                              color: "#28a745",
                            }}
                          >
                            {`${Math.round(percentage)}%`}
                          </span>
                        </div>
                      </div>

                      <button
                        className="btn btn-primary"
                        onClick={() => handleViewCourse(course._id)}
                        aria-label="Submit"
                      >
                        Show Course
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-12">
              <p>There are no registered courses</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AllCourse;
