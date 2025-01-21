import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { DataContext } from "../../Users/Context/Context";
import { Helmet } from "react-helmet-async";

function AllStudents() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [allDataTasks, setAllDataTasks] = useState({
    allAttendance: 14,
    allTasks: 14,
    allQuiz: 14,
  });
  const [searchStd, setSearchStd] = useState("");
  const [loading, setLoading] = useState(false);

  // const [newStudent, setNewStudent] = useState(false);
  // const [newDataStudent, setNewDataStudent] = useState({
  //   groupId: groupId || null,
  //   name: "",
  //   email: "",
  //   password: "",
  //   phone_number: "",
  //   role: "user",
  // });

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${URLAPI}/api/users/all-users`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      })
      .then((res) => {
        setLoading(true);
        const data = res.data;

        if (Array.isArray(data) && data.length > 0) {
          const studentsWithProgress = data.map((student) => ({
            ...student,
            // attendance: student.attendance.length || 0,
            // tasks: student.tasks || 0,
          }));
          const searchStdByNumber = studentsWithProgress.filter(
            (num) => num.phone_number == searchStd
          );

          if (searchStdByNumber.length > 0) {
            setLoading(false);
            setStudents(searchStdByNumber);
          } else {
            setLoading(false);
            setStudents(studentsWithProgress);
          }
        } else {
          setStudents([]);
          toast.warn("No students found.");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch students.");
      });
  }, [URLAPI, getTokenAdmin, location.pathname, searchStd]);

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
  // if (loading) {
  //   return (
  //     <div
  //       style={{
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         height: "70vh",
  //       }}
  //     >
  //       <svg
  //         className="loading"
  //         viewBox="25 25 50 50"
  //         style={{ width: "3.25em" }}
  //       >
  //         <circle r="20" cy="50" cx="50"></circle>
  //       </svg>
  //     </div>
  //   );
  // }
  return (
    <>
      <Helmet>
        <title>All Students</title>
      </Helmet>
      <ToastContainer />
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
        <>
        <div>
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="m-2">Students</h1>
            {/* <input
              type="text"
              placeholder="Search By Number"
              className="m-2"
              style={{
                outline: "none",
                border: "none",
                borderBottom: "2px solid black",
              }}
              onChange={(e) => setSearchStd(e.target.value)}
            /> */}
          </div>
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
            <th className="border">PNumber</th>
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
              return (
                <tr key={index}>
                  <td className="border">{index + 1}</td>
                  <td className="border">{item.name}</td>
                  <td className="border">{item.email}</td>
                  <td className="border">{item.phone_number}</td>

                  <td className="border">
                    <Link
                      to={`/admin/student/${item._id}`}
                      className="text-primary"
                      aria-label="link"
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
        </>
        
      )}



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
