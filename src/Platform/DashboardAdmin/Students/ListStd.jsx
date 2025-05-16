// ListStd.jsx
import React, { useState, useContext, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { DataContext } from "../../Users/Context/Context";
import { FaPenToSquare } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import AdminService from "../../classes/AdminService";

function ListStd() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const [adminService] = useState(new AdminService(URLAPI, getTokenAdmin));

  const [showForm, setShowForm] = useState(false);
  const [studentData, setStudentData] = useState({ groupId: "", allowedEmails: "" });
  const [groups, setGroups] = useState([]);
  const [allStudentInList, setAllStudentInList] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [selectedLectures, setSelectedLectures] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const groupsResponse = await adminService.getAllGroups();
        setGroups(groupsResponse || []);
        const filteredGroups = groupsResponse?.filter(
          (group) => group.allowedEmails.length > 0
        );
        setAllStudentInList(filteredGroups);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load groups");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [URLAPI, getTokenAdmin]);

  const fetchLectures = async (groupId) => {
    try {
      const { data } = await axios.get(`${URLAPI}/api/lectures/group/${groupId}`, {
        headers: { Authorization: getTokenAdmin },
      });
      setLectures(data.lectures);
    } catch (error) {
      console.error("Error fetching lectures:", error);
      toast.error("Failed to load lectures");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({ ...prev, [name]: value }));

    if (name === "groupId") {
      fetchLectures(value);
    }
  };

  const handleLectureSelection = (lectureId) => {
    setSelectedLectures((prev) =>
      prev.includes(lectureId)
        ? prev.filter((id) => id !== lectureId)
        : [...prev, lectureId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...studentData, lecturesSpecial: selectedLectures };

      await axios.post(`${URLAPI}/api/users/add-allowed-emails`, payload, {
        headers: { Authorization: getTokenAdmin },
      });

      toast.success("Student added successfully");
      setShowForm(false);
      setStudentData({ groupId: "", allowedEmails: "" });
      setSelectedLectures([]);
      // Refresh list
      const updatedGroups = await adminService.getAllGroups();
      setAllStudentInList(updatedGroups?.groups?.filter((g) => g.allowedEmails.length > 0));
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student");
    }
  };

  const handleUpdate = (group, student) => {
    setShowForm(true);
    setIsEditing(true);
    setCurrentStudent(student);
    setStudentData({ allowedEmails: student.email, groupId: group.groupId });
    fetchLectures(group.groupId);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        allowedEmails: studentData.email,
        groupId: studentData.groupId,
        lecturesSpecial: selectedLectures,
      };

      await axios.put(`${URLAPI}/api/users/update-allowed-emails`, payload, {
        headers: { Authorization: getTokenAdmin },
      });

      toast.success("Student updated successfully");
      setShowForm(false);
      setIsEditing(false);
      setStudentData({ groupId: "", email: "" });
      setSelectedLectures([]);

      const updatedGroups = await adminService.getAllGroups();
      setAllStudentInList(updatedGroups?.groups?.filter((g) => g.allowedEmails.length > 0));
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
    }
  };

  const handleDelete = async (group, student) => {
    try {
      await axios.delete(`${URLAPI}/api/users/remove-allowed-email`, {
        data: { groupId: group.groupId, allowedEmails: student.email },
        headers: { Authorization: getTokenAdmin },
      });

      toast.success("Student removed successfully");
      const updatedGroups = await adminService.getAllGroups();
      setAllStudentInList(updatedGroups?.groups?.filter((g) => g.allowedEmails.length > 0));
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Toaster position="top-center" />
      <Helmet><title>Code Eagles | Waiting List</title></Helmet>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Student List Management</h3>
        <button
          className={`btn ${showForm ? "btn-secondary" : "btn-primary"}`}
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setStudentData({ groupId: "", allowedEmails: "" });
              setSelectedLectures([]);
              setIsEditing(false);
              setCurrentStudent(null);
            }
          }}
        >
          {showForm ? "Cancel" : "Add Student"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={isEditing ? handleUpdateSubmit : handleSubmit}
          className="card card-body mb-4 shadow-sm"
          style={{ maxWidth: "500px" }}
        >
          <div className="row g-3">
            <div className="col-md-12">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={studentData.allowedEmails}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-12">
              <label className="form-label">Group</label>
              <select
                name="groupId"
                className="form-select"
                value={studentData.groupId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Group</option>
                {groups.map((group) => (
                  <option value={group._id} key={group._id}>
                    {group.title} - {group.start_date?.split("T")[0]}
                  </option>
                ))}
              </select>
            </div>

            {lectures.length > 0 && (
              <div className="col-12">
                <label className="form-label">Special Lectures</label>
                <div className="d-block gap-3">
                  {lectures.map((lecture) => (
                    <div className="form-check" key={lecture._id}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={lecture._id}
                        checked={selectedLectures.includes(lecture._id)}
                        onChange={() => handleLectureSelection(lecture._id)}
                      />
                      <label className="form-check-label" htmlFor={lecture._id}>
                        {lecture.title} - {lecture.description}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="col-12">
              <button type="submit" className={`btn ${isEditing ? "btn-success" : "btn-primary"}`}>
                {isEditing ? "Update Student" : "Add Student"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="card shadow-sm">
        <div className="card-body table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Group</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allStudentInList?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted">No students found.</td>
                </tr>
              ) : (
                Array.isArray(allStudentInList) && allStudentInList?.map((group, groupIndex) => (
                  group.allowedEmails.map((student, studentIndex) => (
                    <tr key={`${groupIndex}-${studentIndex}`}>
                      <td>{studentIndex + 1}</td>
                      <td>{student.user?.name || "N/A"}</td>
                      <td>{student || "N/A"}</td>
                      <td>{student.user?.phone_number || "N/A"}</td>
                      <td>{group.title}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-success me-2"
                          onClick={() => handleUpdate(group, student)}
                          title="Edit"
                        >
                          <FaPenToSquare />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(group, student)}
                          title="Delete"
                        >
                          <MdDelete />
                        </button>
                      </td>
                    </tr>
                  ))
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ListStd;
