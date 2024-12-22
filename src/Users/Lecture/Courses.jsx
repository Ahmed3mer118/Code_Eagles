import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DataContext } from "../Context/Context";
import OutletCourse from "./OutletCourse";
import { Helmet } from "react-helmet-async";

function MyCourses() {
  const { URLAPI, getTokenUser } = useContext(DataContext);
  const userId = JSON.parse(localStorage.getItem("userId"));
  const [lectures, setLectures] = useState([]);
  const [error, setError] = useState(null);
  const { lectureId, groupId } = useParams(); // للحصول على ID المحاضرة من الـ URL
  const [selectedLecture, setSelectedLecture] = useState(null);

  useEffect(() => {
    axios
      .get(`${URLAPI}/api/lectures/group/${groupId}`, {
        headers: {
          Authorization: `${getTokenUser}`,
        },
      })
      .then((res) => {
        setLectures(res.data.lectures);
      })
      .catch((err) => {
        setError("Error fetching lectures. Please try again later.");
        console.log("Error details:", err);
      });
  }, [groupId, getTokenUser]);

  return (
    <>
      <Helmet>
        <title>Lectures</title>
      </Helmet>
      <div className="container mt-4 mb-4">
        <div className="row">
          {/* Content Section */}
          <div className="col-12 col-md-8 bg-light p-4">
            <OutletCourse />
          </div>

          {/* Sidebar Section */}

          {lectures && lectures.length > 0 && (
            <div className="col-12 col-md-4 text-dark p-4 ">
              <h4 className="mb-3">Lectures</h4>
              {lectures.map((item, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-primary me-2">{index + 1}</span>
                    <strong>{item.title}</strong>
                  </div>
                  <Link
                    to={`/${groupId}/course/${item._id}`}
                    className="text-dark text-decoration-none"
                  >
                    <p className="m-2">{item.description}</p>
                  </Link>
                  <hr />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyCourses;
