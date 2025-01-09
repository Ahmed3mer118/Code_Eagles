import React, { useState, useContext, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsResponse = await axios.get(`${URLAPI}/api/groups`, {
          headers: { Authorization: getTokenAdmin },
        });
        setGroups(groupsResponse.data);

        const studentsResponse = await axios.get(
          `${URLAPI}/api/users/get-allowed-emails`,
          {
            headers: { Authorization: getTokenAdmin },
          }
        );
        setShowListStd(studentsResponse.data.group);
        setAllStudentInList(studentsResponse.data.group.users);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data.");
      }
    };

    fetchData();
  }, [URLAPI, getTokenAdmin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentData({ ...studentData, [name]: value });
  };
// add Email
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(studentData);
    axios
      .post(`${URLAPI}/api/users/add-allowed-emails`, studentData, {
        headers: { Authorization: `${getTokenAdmin}` },
      })
      .then((res) => {
        setShowListStd((prevList) => [...prevList, res.data]);
        toast.success("Student added successfully!");
        setShowForm(false);
        setStudentData({
          groupId: "",
          allowedEmails: "",
        });
      })
      .catch((error) => {
        console.error("Error adding student:", error);
        toast.error("Failed to add student.");
      });
  };
// update Email
  const handleUpdate = (item) => {
    setShowForm(true);
    setIsEditing(true);
    setCurrentStudent(item);
    setStudentData({
      allowedEmails: item.email,
      groupId: showListStd._id,
    });
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const updateStd = {
      allowedEmails: studentData.allowedEmails,
      groupId: studentData.groupId,
    };

    axios
      .put(`${URLAPI}/api/users/update-allowed-emails`, updateStd, {
        headers: { Authorization: `${getTokenAdmin}` },
      })
      .then((res) => {
        toast.success("Student Updated successfully!");
        setShowForm(false);
        setIsEditing(false);
        setStudentData({
          groupId: "",
          allowedEmails: "",
        });
        // setAllStudentInList((prevList) =>
        //   prevList.map((student) =>
        //     student.email === currentStudent.email
        //       ? { ...student, email: studentData.allowedEmails }
        //       : student
        //   )
        // );
      })
      .catch((error) => {
        console.error("Error updating student:", error);
        toast.error("Failed to update student.");
      });
  };
// delete Email
  const handleDelete = (item) => {
    axios
      .delete(`${URLAPI}/api/users/remove-allowed-email`, {
        data: {
          email: item.email,
          groupId: showListStd._id,
        },
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      })
      .then(() => {
        toast.success("Student deleted successfully");
        setAllStudentInList((prevList) =>
          prevList.filter((student) => student.email !== item.email)
        );
      })
      .catch(() => {
        toast.error("Student Not deleted successfully");
      });
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <Helmet>
        <title>Code Eagles | Waiting List</title>
      </Helmet>
      <h3 className="mb-4">Add List Student</h3>
      <button
        className={showForm ? "btn btn-secondary mb-3" : "btn btn-primary mb-3"}
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Cancel" : "Add Student In List"}
      </button>

      {showForm && (
        <div className="transition-form">
          <form
            onSubmit={isEditing ? handleUpdateSubmit : handleSubmit}
            className="mb-4"
          >
            <div className="form-group mt-2">
              <label>Email : </label>
              <input
                type="email"
                name="allowedEmails"
                className="form-control"
                value={studentData.allowedEmails}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group mt-2">
              <label>Group :</label>
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
            <button
              type="submit"
              className={
                isEditing
                  ? "btn btn-success mt-3 mb-3"
                  : "btn btn-primary mt-3 mb-3"
              }
            >
              {isEditing ? "Update" : "Submit"}
            </button>
          </form>
        </div>
      )}

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Group</th>
            <th className="text-center">Update</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(allStudentInList) &&
            allStudentInList.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.phone_number}</td>
                <td>{showListStd.title}</td>
                <td className="text-center">
                  <FaPenToSquare
                    className="text-success me-3"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleUpdate(item)}
                  />
                  <MdDelete
                    className="text-danger ms-3"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDelete(item)}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListStd;
