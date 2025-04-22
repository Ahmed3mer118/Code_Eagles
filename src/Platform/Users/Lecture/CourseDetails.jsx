import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DataContext } from "../Context/Context";

function CourseDetail() {
  const { courseDetails, contentId } = useParams(); // Get the course name from the URL
  const [course, setCourse] = useState(null); // State to hold the specific course details
  const { URLAPI, getTokenUser } = useContext(DataContext);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (courseDetails) {
      setLoading(true);
      axios
        .get(`${URLAPI}/api/groups/${contentId}`, {
          headers: {
            Authorization: getTokenUser,
          },
        })
        .then((res) => {
          setLoading(false);
          const foundCourse = res.data.course_details.find(
            (c) => c._id === courseDetails
          );

          setCourse(foundCourse || null);
        })
        .catch((error) => {
          console.error("Error fetching course details:", error);
        });
    }

    window.scrollTo(0, 0);
  }, [courseDetails, URLAPI, getTokenUser]);

  if (!course) {
    return (
      <div className="text-center">
        {loading ? (
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
        ) : (
          <h2 className="text-center mt-4 mb-4">Course not found</h2>
        )}
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-3">
      <div className="row">
        <div className="col-md-6 text-center">
          <img
            src={`${course.image}`}
            alt={course.title}
            className="img-fluid rounded"
            style={{
              height: "300px",
              objectFit: "cover",
            }}
          />
          <h1 className="text-center">{course.title}</h1>
        </div>
        <div className="col-md-6 col mt-3">
          <h3 className="m-3">Course Details:</h3>
          <ol className="list-group">
            {course.description.split(". ").map((item, idx) => (
              <li key={idx} className="list-group-item p-2 p-md-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  <span className="text-wrap">{item}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
