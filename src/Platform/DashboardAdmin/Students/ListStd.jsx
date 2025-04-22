import React, { useState, useContext, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { DataContext } from "../../Users/Context/Context";
import { FaPenToSquare } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { Helmet } from "react-helmet-async";

function ListStd() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const [showForm, setShowForm] = useState(false);
  const [studentData, setStudentData] = useState({
    groupId: "",
    allowedEmails: "",
  });
  const [showListStd, setShowListStd] = useState([]);
  const [groups, setGroups] = useState([]);
  const [allStudentInList, setAllStudentInList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lectures, setLectures] = useState([]);
  const [lecturesSpecial, setSelectedLectures] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupsResponse, studentsResponse] = await Promise.all([
          axios.get(`${URLAPI}/api/groups`, {
            headers: { Authorization: getTokenAdmin },
          }),
          axios.get(`${URLAPI}/api/users/get-allowed-emails`, {
            headers: { Authorization: getTokenAdmin },
          }),
        ]);

        setGroups(groupsResponse.data);
        const filteredGroups = studentsResponse.data.groups.filter(
          (group) => group.allowedEmails.length > 0
        );
        setAllStudentInList(filteredGroups);
      } catch (error) {
        // Silently handle error without showing toast
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [URLAPI, getTokenAdmin]);

  const fetchLectures = async (groupId) => {
    try {
      const response = await axios.get(
        `${URLAPI}/api/lectures/group/${groupId}`,
        {
          headers: { Authorization: getTokenAdmin },
        }
      );
      setLectures(response.data.lectures);
    } catch (error) {
      // Silently handle error without showing toast
      console.error("Error fetching lectures:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentData({ ...studentData, [name]: value });

    if (name === "groupId" && value) {
      fetchLectures(value);
    }
  };

  const handleLectureSelection = (lectureId) => {
    setSelectedLectures((prevSelected) => {
      if (prevSelected.includes(lectureId)) {
        return prevSelected.filter((id) => id !== lectureId);
      } else {
        return [...prevSelected, lectureId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...studentData,
        lecturesSpecial,
      };

      const res = await axios.post(
        `${URLAPI}/api/users/add-allowed-emails`,
        payload,
        {
          headers: { Authorization: getTokenAdmin },
        }
      );

      setShowListStd((prevList) => [...prevList, res.data]);
      toast.success("Student added successfully!");
      setShowForm(false);
      setStudentData({
        groupId: "",
        allowedEmails: "",
      });
      setSelectedLectures([]);
    } catch (error) {
      // Silently handle error without showing toast
      console.error("Error adding student:", error);
    }
  };

  const handleUpdate = (group, item) => {
    setShowForm(true);
    setIsEditing(true);
    setCurrentStudent(item);
    setStudentData({
      allowedEmails: item.email,
      groupId: group.groupId,
    });
    fetchLectures(group.groupId);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateStd = {
        allowedEmails: studentData.allowedEmails,
        groupId: studentData.groupId,
        lecturesSpecial,
      };

      await axios.put(
        `${URLAPI}/api/users/update-allowed-emails`,
        updateStd,
        {
          headers: { Authorization: getTokenAdmin },
        }
      );

      toast.success("Student updated successfully!");
      setShowForm(false);
      setIsEditing(false);
      setStudentData({
        groupId: "",
        allowedEmails: "",
      });
      setSelectedLectures([]);

      setAllStudentInList((prevList) =>
        prevList.map((group) => {
          if (group.groupId === studentData.groupId) {
            return {
              ...group,
              allowedEmails: group.allowedEmails.map((item) =>
                item.email === currentStudent.email
                  ? { ...item, email: studentData.allowedEmails }
                  : item
              ),
            };
          }
          return group;
        })
      );
    } catch (error) {
      // Silently handle error without showing toast
      console.error("Error updating student:", error);
    }
  };

  const handleDelete = async (group, item) => {
    try {
      const payload = {
        data: {
          groupId: group.groupId,
          allowedEmails: item.email,
        },
        headers: {
          Authorization: getTokenAdmin,
        },
      };

      await axios.delete(`${URLAPI}/api/users/remove-allowed-email`, payload);
      toast.success("Student removed successfully");
      setAllStudentInList((prevList) =>
        prevList.map((group) => {
          if (group.groupId === group.groupId) {
            return {
              ...group,
              allowedEmails: group.allowedEmails.filter(
                (student) => student.email !== item.email
              ),
            };
          }
          return group;
        })
      );
    } catch (error) {
      // Silently handle error without showing toast
      console.error("Error deleting student:", error);
    }
  };

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
    <div className="container-fluid py-4">
      <Toaster position="top-center" />
      <Helmet>
        <title>Code Eagles | Waiting List</title>
      </Helmet>

      <div className="row mb-4">
        <div className="col-12">
          <h3 className="mb-4">Add List Student</h3>
          <button
            className={`btn ${
              showForm ? "btn-secondary" : "btn-primary"
            } mb-3`}
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
            {showForm ? "Cancel" : "Add Student In List"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <form
              onSubmit={isEditing ? handleUpdateSubmit : handleSubmit}
              className="row g-3"
            >
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="allowedEmails"
                  className="form-control"
                  value={studentData.allowedEmails}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Group</label>
                <select
                  name="groupId"
                  value={studentData.groupId}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="">Select a group</option>
                  {groups.map((item) => (
                    <option value={item._id} key={item._id}>
                      {item.title} - {item.start_date?.split("T")[0]}
                    </option>
                  ))}
                </select>
              </div>

              {lectures.length > 0 && (
                <div className="col-12">
                  <label className="form-label">Special Lectures</label>
                  <div className="card">
                    <div className="card-body">
                      {lectures.map((lecture) => (
                        <div className="form-check mb-2" key={lecture._id}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={lecture._id}
                            checked={lecturesSpecial.includes(lecture._id)}
                            onChange={() => handleLectureSelection(lecture._id)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={lecture._id}
                          >
                            {lecture.title} - {lecture.description}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="col-12">
                <button
                  type="submit"
                  className={`btn ${
                    isEditing ? "btn-success" : "btn-primary"
                  }`}
                >
                  {isEditing ? "Update" : "Add Student with Selected Lectures"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Group</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(allStudentInList) &&
                  allStudentInList.map((group, groupIndex) =>
                    group.allowedEmails.map((item, index) => (
                      <tr key={`${groupIndex}-${index}`}>
                        <td>{index + 1}</td>
                        <td>{item.user?.name || "N/A"}</td>
                        <td>{item.email || "N/A"}</td>
                        <td>{item.user?.phone_number || "N/A"}</td>
                        <td>{group.title || "N/A"}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-link text-success p-0 me-3"
                            onClick={() => handleUpdate(group, item)}
                            title="Edit"
                          >
                            <FaPenToSquare size={20} />
                          </button>
                          <button
                            className="btn btn-link text-danger p-0"
                            onClick={() => handleDelete(group, item)}
                            title="Delete"
                          >
                            <MdDelete size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListStd;
