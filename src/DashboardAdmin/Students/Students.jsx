import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { DataContext } from "../../Users/Context/Context";

function Students() {
  const { groupId } = useParams();
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const [students, setStudents] = useState([]);
  const [allDataTasks, setAllDataTasks] = useState({
    allAttendace: 0,
    allTasks: 0,
    allQuiz: 0,
  });

  const [evaluation, setEvaluation] = useState(0);
  const [newStudent, setNewStudent] = useState(false);
  const [newDataStudent, setNewDataStudent] = useState({
    groupId: groupId || null,
    name: "",
    email: "",
    password: "",
    phone_number: "",
    role: "user",
  });

  const [allAttendace, setAllAttendace] = useState(10);
  const [allTasks, setAllTasks] = useState(10);
  const [allQuiz, setAllQuiz] = useState(10);

  // حساب التقييم بشكل دقيق
  const calculateEvaluation = () => {
    const totalTasks = allAttendace + allTasks + allQuiz;
    const totalMaxTasks =
      allDataTasks.allAttendace + allDataTasks.allTasks + allDataTasks.allQuiz;
    return totalTasks > 0 ? (totalMaxTasks / totalTasks) * 100 : 0;
  };

  useEffect(() => {
    setEvaluation(calculateEvaluation());
  }, [allAttendace, allTasks, allQuiz, allDataTasks]);

  // add student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!getTokenAdmin) {
      toast.error("Unauthorized. Please log in.");
      return;
    }
    await axios
      .post(`${URLAPI}/api/users/adduser`, newDataStudent, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${getTokenAdmin}`,
        },
      })
      .then(() => {
        toast.success("Successfully added new student");
        setNewStudent(false);
      });
   
  };

  // get all student
  useEffect(() => {
    axios
      .get(`${URLAPI}/api/users/all-users`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      })
      .then((res) => {
        const filterStudentGroup = res.data.filter((item) => {
          return item.groups.some((group) => group.groupId === groupId);
        });
        setStudents(filterStudentGroup);
      })
      .catch((err) => {
        console.error("Error fetching students:", err);
      });
  }, [groupId]);

  const handleChangeStudents = (e) => {
    e.preventDefault();
    setNewStudent(!newStudent);
  };

  return (
    <>
      <ToastContainer />
      <div>
        <button className="btn btn-success m-2" onClick={handleChangeStudents}>
          {!newStudent ? "New Student" : "Show Students"}
        </button>
      </div>

      {!newStudent ? (
        <table className="table text-center m-auto mt-2 mb-2">
          <thead>
            <tr>
              <th className="border">ID</th>
              <th className="border">Name</th>
              <th className="border">Email</th>
              <th className="border">Attendance</th>
              <th className="border">Tasks</th>
              <th className="border">total</th>
              <th className="border">Evaluation</th>
              <th className="border">All Details</th>
            </tr>
          </thead>
          <tbody>
            {students.map((item, index) => (
              <tr key={index}>
                <td className="border">{index + 1}</td>
                <td className="border">{item.name}</td>
                <td className="border">{item.email}</td>
                <td className="border">
                  {Array.isArray(item.attendance) ? item.totalPresent : 0} / 14
                </td>
                <td className="border">
                  {Array.isArray(item.tasks) ? item.tasks.length : 0}
                </td>
                <td className="border">
                {(item.attendance.length + item.tasks.length) }
                </td>
                <td className="border">{evaluation.toFixed(2)}%</td>
                <td className="border">
                  <Link to={`/admin/student/${item._id}`}>See More</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        /* نموذج إضافة طالب جديد */
        <>
          <form className="row m-2 w-100" onSubmit={handleAddStudent}>
            <h2>New Student</h2>
            <input
              type="text"
              value={groupId}
              disabled
              className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5"
            />
            <input
              type="text"
              placeholder="Username"
              className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5"
              onChange={(e) =>
                setNewDataStudent({
                  ...newDataStudent,
                  name: e.target.value,
                })
              }
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5"
              onChange={(e) =>
                setNewDataStudent({ ...newDataStudent, email: e.target.value })
              }
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5"
              onChange={(e) =>
                setNewDataStudent({
                  ...newDataStudent,
                  password: e.target.value,
                })
              }
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5"
              onChange={(e) =>
                setNewDataStudent({
                  ...newDataStudent,
                  phone_number: e.target.value,
                })
              }
              required
            />
            <select
              className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5"
              onChange={(e) =>
                setNewDataStudent({
                  ...newDataStudent,
                  role: e.target.value,
                })
              }
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="btn btn-primary col-3 m-3">
              Create
            </button>
          </form>
        </>
      )}
    </>
  );
}

export default Students;
