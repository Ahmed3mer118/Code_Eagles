import React, { useContext, useEffect, useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { toast , Toaster } from "react-hot-toast";
import "./Lecture.css";
import { DataContext } from "../../Users/Context/Context";
import axios from "axios";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";

function Lectures() {
  const { URLAPI, getTokenAdmin  , getTokenInstructor} = useContext(DataContext);
  const { groupId } = useParams();
  const [loading, setLoading] = useState(false);
  const [tableLecture, setTableLecture] = useState(false);
  const [lectures, setLectures] = useState([]);
  const [adminService] = useState(new AdminService(URLAPI, getTokenAdmin));
  const [instructorService] = useState(new InstructorService(URLAPI, getTokenInstructor));
  const [formData, setFormData] = useState({
    group_id: groupId,
    title: "",
    description: "",
    article: "",
    resources: "",
  });

  useEffect(() => {
    if (getTokenAdmin || getTokenInstructor) {
      fetchLectures();
    } else {
      toast.error("Unauthorized. Please log in.");
    }
  }, [groupId, tableLecture]);

  const fetchLectures = async () => {
    setLoading(true);
    try {
      if(window.location.pathname.includes("/admin")) { 
        const response = await adminService.getLectures(groupId);
        setLectures(response.lectures);
        setLoading(false);
      }
      else {
        const response = await instructorService.getLectures(groupId);
        setLectures(response.lectures);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching lectures:", error);
      // toast.error("Failed to fetch lectures");
      setLoading(false);
    }
  };

  const handleChangeLecture = (e) => {
    e.preventDefault();
    setTableLecture(!tableLecture);
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.article || !formData.resources) {
      toast.error("Please fill in all required fields!");
      return;
    }

    try {
      let response;
      if(window.location.pathname.includes("/admin")) {
         response = await adminService.createLecture(formData);
      }
      else {
         response = await instructorService.createLecture(formData);
      }
      if (response) {
        toast.success("Lecture created successfully!");
        setTableLecture(false);
        setFormData({
          group_id: groupId,
          title: "",
          description: "",
          article: "",
          resources: "",
        });
        fetchLectures();
      } else {
        throw new Error(response.message || "Failed to create lecture");
      }
    } catch (error) {
      console.error("Error creating lecture:", error);
      // toast.error(error.response?.data?.message || "Failed to create lecture");
    }
  };

  const handleDeleteLecture = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lecture?")) {
      return;
    }

    try {
      if(window.location.pathname.includes("/admin")) { 
        await adminService.deleteLecture(id)
      }
      else {
        await instructorService.deleteLecture(id)
      }
      toast.success("Lecture deleted successfully");
      fetchLectures();
    } catch (error) {
      console.error("Error deleting lecture:", error);
      toast.error(error.message || "Failed to delete lecture");
    }
  };

  return (
    <div className="container-fluid py-4">
        <Toaster position="top-center" />
      {loading ? (
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="mb-0">Lectures Management</h2>
                <div>
                  <button
                    className={`btn ${tableLecture ? "btn-primary" : "btn-success"} me-2`}
                    onClick={handleChangeLecture}
                  >
                    {tableLecture ? "Show Lectures" : "New Lecture"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {!tableLecture ? (
            <div className="row">
              {!lectures || lectures.length === 0 ? (
                <div className="col-12">
                  <div className="alert alert-info text-center">
                    No lectures available. Create a new lecture to get started.
                  </div>
                </div>
              ) : (
                Array.isArray(lectures) &&
                lectures.map((lecture, index) => (
                  <div className="col-12 col-md-6 col-lg-4 mb-4" key={lecture._id}>
                    <div className="card shadow-sm h-100">
                      <div className="card-header bg-light text-dark">
                        <h5 className="card-title mb-0">Lecture #{index + 1}</h5>
                      </div>
                      <div className="card-body">
                        <h6 className="card-subtitle mb-2 text-muted">{lecture.title}</h6>
                        <p className="card-text">{lecture.description}</p>
                        <div className="mb-2">
                          <strong>Article:</strong> {lecture.article}
                        </div>
                        {lecture.resources && (
                          <div className="mb-2">
                            <a
                              href={lecture.resources}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary"
                            >
                              <i className="bi bi-link-45deg me-1"></i>
                              Lecture Resources
                            </a>
                          </div>
                        )}
                        <div className="mb-2">
                          <strong>Attendance:</strong>{" "}
                          <Link to={`/admin/${groupId}/lectures/${lecture._id}/attendance`}>
                            {lecture.attendanceCount || 0}
                          </Link>
                        </div>
                      </div>
                      <div className="card-footer bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                          <Link
                            to={`/${window.location.pathname.includes("/admin") ? "admin" : "instructor"}/${groupId}/lectures/${lecture._id}/newTask`}
                            className="btn btn-sm btn-success"
                          >
                            Task
                          </Link>
                          <Link
                            to={`/${window.location.pathname.includes("/admin") ? "admin" : "instructor"  }/${groupId}/lectures/${lecture._id}/quiz`}
                            className="btn btn-sm btn-success"
                          >
                            Quiz
                          </Link>
                          <Link
                            to={`/${window.location.pathname.includes("/admin") ? "admin" : "instructor"}/${groupId}/lectures/update/${lecture._id}`}
                            className="btn btn-sm btn-primary"
                          >
                            Update
                          </Link>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteLecture(lecture._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0">New Lecture</h5>
              </div>
              <div className="card-body">
                <form className="row g-3" onSubmit={handleAddLecture}>
                  <div className="col-md-6">
                    <label htmlFor="title" className="form-label">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="form-control"
                      placeholder="Enter lecture title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="article" className="form-label">
                      Article
                    </label>
                    <input
                      type="text"
                      id="article"
                      className="form-control"
                      placeholder="Enter article"
                      value={formData.article}
                      onChange={(e) =>
                        setFormData({ ...formData, article: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      id="description"
                      className="form-control"
                      rows="3"
                      placeholder="Enter lecture description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      required
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label htmlFor="resources" className="form-label">
                      Resources URL
                    </label>
                    <input
                      type="url"
                      id="resources"
                      className="form-control"
                      placeholder="Enter lecture resources URL"
                      value={formData.resources}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          resources: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary">
                      Create Lecture
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
      <Outlet />
    
    </div>
  );
}

export default Lectures;
