import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { DataContext } from "../../Users/Context/Context";

function AllStudents() {
  const { groupId } = useParams();
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [evaluation, setEvaluation] = useState(0);
  const [allDataTasks, setAllDataTasks] = useState({
    allAttendance: 14,
    allTasks: 14,
    allQuiz: 14,
  });

  // const [userProgress, setUserProgress] = useState({
  //   attendance: 10,
  //   tasks: 10,
  //   quiz: 10,
  // });
  // const [newStudent, setNewStudent] = useState(false);
  // const [newDataStudent, setNewDataStudent] = useState({
  //   groupId: groupId || null,
  //   name: "",
  //   email: "",
  //   password: "",
  //   phone_number: "",
  //   role: "user",
  // });

  // useEffect(() => {
  //   const totalPossible =
  //     allDataTasks.allAttendance + allDataTasks.allTasks + allDataTasks.allQuiz;
  //   const totalAchieved =
  //     userProgress.attendance + userProgress.tasks + userProgress.quiz;
  //   const calcEvaluation = totalPossible
  //     ? ((totalAchieved / totalPossible) * 100).toFixed(2)
  //     : 0;
  //   setEvaluation(calcEvaluation);
  // }, [allDataTasks, userProgress]);

  useEffect(() => {
    axios
      .get(`${URLAPI}/api/users/all-users`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      })
      .then((res) => {
        const data = res.data;

        if (Array.isArray(data) && data.length > 0) {
          // إنشاء مصفوفة جديدة تحتوي على تفاصيل كل طالب
          const studentsWithProgress = data.map((student) => ({
            ...student,
            attendance: student.attendance.length || 0,
            tasks: student.tasks.length || 0,
          }));
          setStudents(studentsWithProgress);
        } else {
          setStudents([]);
          toast.warn("No students found.");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch students.");
      });
  }, [URLAPI, getTokenAdmin, location.pathname]);

  // const handleAddStudent = async (e) => {
  //   e.preventDefault();
  //   if (!getTokenAdmin) {
  //     toast.error("Unauthorized. Please log in.");
  //     return;
  //   }
  //   console.log(newDataStudent)
  //   try {
  //     await axios.post(`${URLAPI}/api/users/adduser`, newDataStudent, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `${getTokenAdmin}`,
  //       },
  //     });
  //     toast.success("Successfully added new student");
  //     setNewStudent(false);
  //     setNewDataStudent({
  //       groupId: groupId || null,
  //       name: "",
  //       email: "",
  //       password: "",
  //       phone_number: "",
  //       role: "user",
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Failed to add student");
  //   }
  // };

  return (
    <>
      <ToastContainer />
      <div>
        <h1>Students</h1>
        {/* <button
          className="btn btn-success"
          onClick={() => setNewStudent(!newStudent)}
        >
          {!newStudent ? "New Student" : "Show Students"}
        </button> */}
      </div>

      <table className="table text-center m-auto mt-2 mb-2">
        <thead>
          <tr>
            <th className="border">ID</th>
            <th className="border">Name</th>
            <th className="border">Email</th>
            <th className="border">Attendance</th>
            <th className="border">Tasks</th>
            {/* <th className="border">Quiz</th> */}
            <th className="border">Evaluation</th>
            <th className="border">All Details</th>
          </tr>
        </thead>
        <tbody>
          {students.length == 0 ? (
            <tr>
              <td colSpan="8">No students found.</td>
            </tr>
          ) : (
            students.map((item, index) => {
              let totalPossible =
                allDataTasks.allAttendance + allDataTasks.allTasks;
              let totalAchieved = item.attendance + item.tasks + 0;

              let evaluation = totalPossible
                ? ((totalAchieved / totalPossible) * 100).toFixed(2)
                : 0;
              return (
                <tr key={index}>
                  <td className="border">{index + 1}</td>
                  <td className="border">{item.name}</td>
                  <td className="border">{item.email}</td>
                  <td className="border">
                    {item.attendance} / {allDataTasks.allTasks}
                  </td>
                  <td className="border">
                    {item.tasks} / {allDataTasks.allTasks}
                  </td>
                  {/* <td className="border"> */}
                  {/* {userProgress.quiz} / {allDataTasks.allQuiz} */}
                  {/* </td> */}
                  <td className="border">
                    {evaluation}
                    %
                  </td>
                  <td className="border">
                    <Link
                      to={`/admin/student/${item._id}`}
                      className="text-primary"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* <form className="row m-2 w-100">
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
           />
           <input
             type="email"
             placeholder="Email"
             className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5"
             onChange={(e) =>
               setNewDataStudent({ ...newDataStudent, email: e.target.value })
             }
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
           />
           <select
             className="border rounded p-2 m-2 col-lg-6 col-md-10 col-sm-5"
             onChange={(e) =>
               setNewDataStudent({
                 ...newDataStudent,
                 role: e.target.value,
              })
           }
           >
           <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            className="btn btn-primary col-3 m-3"
            onClick={handleAddStudent}
          >
            Create
          </button>
        </form> */}
    </>
  );
}

export default AllStudents;
