import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { DataContext } from "../../Users/Context/Context";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";


function DetailStudent() {
  const { URLAPI, getTokenAdmin, getTokenInstructor } = useContext(DataContext);
  const [adminService] = useState(new AdminService(URLAPI, getTokenAdmin));
  const [instructorService] = useState(new InstructorService(URLAPI, getTokenInstructor));
  const [students, setStudents] = useState({});
  const [groupIdByStd, setGroupIdByStd] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataUpdateStudent, setDataUpdateStudent] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [currentStatus, setCurrentStatus] = useState({});
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendance, setAttendance] = useState({ present: 0, absent: 0 });
  const [taskData, setTaskData] = useState([]);
  const [groupDetails, setGroupDetails] = useState([]);
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [lecturesSpecial, setSelectedLectures] = useState([]);
  
  const location = useLocation();



  // Fetch Student Data
  useEffect(() => {
    if (!getTokenAdmin && !getTokenInstructor) {
      toast.error("Not authorized. Please login.");
      if (window.location.pathname.includes("/admin")) {
        navigate("/login");
      } else {
        navigate("/login");
      }
      return;
    }

    const fetchStudent = async () => {
      try {
        setLoading(true);
    
        if (!getTokenAdmin && !getTokenInstructor) {
          throw new Error("No valid service found");
        }
        let studentData;
        if(window.location.pathname.includes("/admin")){
           studentData = await adminService.getStudentDetails(studentId);
        }
        else{
           studentData = await instructorService.getStudentDetails(studentId);
           console.log(studentData)
        }
        setStudents(studentData);

        if (studentData.groups && studentData.groups.length > 0) {
          setGroupIdByStd(studentData.groups);
          const statusMap = {};
          studentData.groups.forEach((group) => {
            statusMap[group.groupId] = group.status || "pending";
          });
          setCurrentStatus(statusMap);

          for (const group of studentData.groups) {
            if (group.status === "special" && group.lecturesSpecial) {
              setSelectedLectures(group.lecturesSpecial);
              break;
            }
          }
        } else {
          setGroupIdByStd([]);
          setCurrentStatus({});
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId, getTokenAdmin, getTokenInstructor, URLAPI, navigate]);

  // Fetch Group Details
  useEffect(() => {
    if (groupIdByStd && groupIdByStd.length > 0) {
      const fetchGroupDetails = async () => {
        try {
          const details = await Promise.all(
            groupIdByStd.map(async (group) => {
              try {
                const groupData = await adminService.getGroupDetails(group.groupId);
                return groupData;
              } catch (error) {
                console.error(`Error fetching group ${group.groupId}:`, error);
                return null;
              }
            })
          );
          const validDetails = details.filter(detail => detail !== null);
          setGroupDetails(validDetails);
        } catch (error) {
          console.error("Error fetching group details:", error);
          toast.error(error.message);
        }
      };

      fetchGroupDetails();
    }
  }, [groupIdByStd]);

  // Delete Student
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }
    
    try {
     
      await adminService.deleteStudent(id);
      toast.success("Student deleted successfully");
      setTimeout(() => {
        navigate("/admin/allStudent");
      }, 2000);
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error(error.message);
    }
  };

  // Toggle User Status
  const handleStopUser = async (id, groupId) => {
    if (!getTokenAdmin && !getTokenInstructor) {
      toast.error("Not authorized. Please login.");
      if (window.location.pathname.includes("/admin")) {
        navigate("/login/admin");
      } else {
        navigate("/login");
      }
      return;
    }

    if (!groupIdByStd || groupIdByStd.length === 0) {
      toast.error("No groups available for this student.");
      return;
    }

    const currentGroupStatus = currentStatus[groupId] || "pending";
    let newStatus = "";
    switch (currentGroupStatus) {
      case "pending":
        newStatus = "approved";
        break;
      case "approved":
        newStatus = "pending";
        break;
      default:
        newStatus = "approved";
        break;
    }

    try {
      if (!getTokenAdmin && !getTokenInstructor) {
        throw new Error("No valid service found");
      }

      if(window.location.pathname.includes("/admin")){
        await adminService.updateStudentStatus(id, newStatus, groupId);
      }
      else{
        await instructorService.updateStudentStatus(id, newStatus, groupId);
      }
      setCurrentStatus((prevStatus) => ({
        ...prevStatus,
        [groupId]: newStatus,
      }));

      const updatedStudent = await adminService.getStudentDetails(id);
      if (updatedStudent.groups && updatedStudent.groups.length > 0) {
        const updatedStatusMap = {};
        updatedStudent.groups.forEach((group) => {
          updatedStatusMap[group.groupId] = group.status || "pending";
        });
        setCurrentStatus(updatedStatusMap);
      }

      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      console.error("Status update error:", error);
      // toast.error(error.message);
    }
  };

  // show Details Student
  const showDetailsStd = async (studentId, groupId) => {
    setLoading(true);
    navigate("", { state: groupId });

    try {
      if(window.location.pathname.includes("/admin")){
        const attendanceData = await adminService.getStudentAttendance( studentId, groupId);
        console.log(attendanceData);
        setAttendanceData(attendanceData.groupLectures || []);
        setAttendance({
        present: attendanceData.attendedLecturesCount || 0,
        absent: attendanceData.notAttendedLecturesCount || 0,
      });

      const tasksData = await adminService.getGroupTasks(studentId, groupId);
      setTaskData(tasksData.tasks || []);

      const lecturesData = await adminService.getStudentAttendance(studentId,groupId);
      setLectures(lecturesData.lectures || []);

      if (currentStatus[groupId] === "special") {
        const studentData = await adminService.getStudentDetails(studentId);
        const specialGroup = studentData.groups.find(g => g.groupId === groupId);
        if (specialGroup && specialGroup.lecturesSpecial) {
          setSelectedLectures(specialGroup.lecturesSpecial);
        }
      }
    } 
    else{
      const attendanceData = await instructorService.getStudentAttendance( studentId, groupId);
      console.log(attendanceData);
      setAttendanceData(attendanceData.groupLectures || []);
      setAttendance({
        present: attendanceData.attendedLecturesCount || 0,
        absent: attendanceData.notAttendedLecturesCount || 0,
      });

      const tasksData = await instructorService.getGroupTasks(studentId, groupId);
      setTaskData(tasksData.tasks || []);
      
    } 
  }
    catch (error) {
      console.error("Error in showDetailsStd:", error);
      // toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // update lecture selection
  const handleLectureSelection = (lectureId) => {
    setSelectedLectures((prevSelected) => {
      if (prevSelected.includes(lectureId)) {
        return prevSelected.filter((id) => id !== lectureId);
      } else {
        return [...prevSelected, lectureId];
      }
    });
  };

  // const handleUpdateLectures = async () => {
  //   if (!getTokenAdmin) {
  //     toast.error("Not authorized. Please login.");
  //     if (window.location.pathname.includes("/admin")) {
  //       navigate("/login");
  //     } else {
  //       navigate("/login");
  //     }
  //     return;
  //   }
  
  //   if (!location.state) {
  //     toast.error("No group selected. Please select a group first.");
  //     return;
  //   }
  
  //   const lecturesToAdd = lecturesSpecial.filter(
  //     (lectureId) => lectures.find((lecture) => lecture._id === lectureId)
  //   );
    
  //   const lecturesToRemove = lectures
  //     .filter((lecture) => !lecturesSpecial.includes(lecture._id))
  //     .map((lecture) => lecture._id);
  
  //   const payload = {
  //     groupId: location.state,
  //     userId: studentId,
  //     lecturesToAdd: lecturesToAdd,
  //     lecturesToRemove: lecturesToRemove
  //   };
  
  //   try {
  //     await adminService.updateStudentLectures(payload);
  //     toast.success("Lectures updated successfully");
      
  //     await adminService.updateStudentStatus(studentId, location.state, "special");
      
  //     setCurrentStatus((prevStatus) => ({
  //       ...prevStatus,
  //       [location.state]: "special",
  //     }));
      
  //     setTimeout(() => {
  //       window.location.reload();
  //     }, 2000);
  //   } catch (error) {
  //     console.error("Update lectures error:", error);
  //     toast.error(error.message);
  //   }
  // };

  // Update Student Role
  const handleUpdateRole = async (studentId, newRole) => {
    try {
      if(window.location.pathname.includes("/admin")){
        await adminService.updateStudentRole(studentId, newRole);
      }
      else{
        await instructorService.updateStudentRole(studentId, newRole);
      }
      const updatedStudent = await adminService.getStudentDetails(studentId);
      setStudents(updatedStudent);
      toast.success(`Student role updated to ${newRole}`);
    } catch (error) {
      console.error("Error updating student role:", error);
      toast.error(error.message);
    }
  };

  return (
    <>
    <Toaster />
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="text-center mb-4">Student Details: {students.name || "Loading..."}</h1>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6 col-md-12 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">Student Information</h5>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Number</th>
                        
                        <th>{getTokenAdmin ? "Role" : ""}</th>
                        <th>{getTokenAdmin ? "Actions" : ""}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{students.name?.split(" ")[0] || "Not available"}</td>
                        <td>{students.email?.split("@")[0] || "Not available"}</td>
                        <td>{students.phone_number || "Not available"}</td>
                        <td> 
                          {
                            getTokenAdmin && (
                              <select
                                className="form-select form-select-sm"
                            value={students.role || "user"}
                            onChange={(e) => handleUpdateRole(students._id, e.target.value)}
                          >
                            <option value="user">Student</option>
                            <option value="admin">Admin</option>
                            <option value="instructor">Instructor</option>
                          </select>
                            )
                          }
                        </td>
                        <td>
                          {getTokenAdmin && (
                            <button
                              onClick={() => handleDelete(studentId)}
                              className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                          )
                        }
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card shadow-sm mt-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Groups</h5>
                {groupDetails.length === 0 ? (
                  <div className="alert alert-info">No groups available for this student</div>
                ) : (
                  groupDetails.map((group, index) => (
                    <div key={index} className="card mb-3">
                      <div className="card-body">
                        <h6 className="card-title">{group.title || "No title"}</h6>
                        <p className="card-text">
                          Start Date: {group.start_date?.split("T")[0] || "Not available"}
                        </p>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => showDetailsStd(studentId, group._id)}
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStopUser(studentId, group._id)}
                            className={`btn btn-sm ${
                              currentStatus[group._id] === "approved" || currentStatus[group._id] === "special"
                                ? "btn-success"
                                : "btn-danger"
                            }`}
                          >
                            {currentStatus[group._id] === "approved" || currentStatus[group._id] === "special"
                              ? "Approved"
                              : "Pending"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="col-12 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title mb-4">Attendance</h5>
                    <div className="mb-3">
                      <p className="mb-1">
                        <strong>Present:</strong> {attendance.present || 0}
                      </p>
                      <p className="mb-1">
                        <strong>Absent:</strong> {attendance.absent || 0}
                      </p>
                    </div>
                    <div className="list-group">
                      {Array.isArray(attendanceData) && attendanceData.length > 0 ? (
                        attendanceData.map((item, index) => (
                          <div
                            key={index}
                            className={`list-group-item list-group-item-action ${
                              item.status === "present"
                                ? "list-group-item-success"
                                : "list-group-item-danger"
                            }`}
                          >
                            <strong>Lecture {index + 1}</strong>:
                            {item.status === "present" ? " Present" : " Absent"}
                          </div>
                        ))
                      ) : (
                        <div className="alert alert-info">No attendance data available</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title mb-4">Tasks</h5>
                    <div className="list-group">
                      {taskData && taskData.length > 0 ? (
                        taskData.map((item, index) => (
                          <div
                            key={index}
                            className={`list-group-item list-group-item-action ${
                              item.score / 2 > 0
                                ? "list-group-item-success"
                                : "list-group-item-danger"
                            }`}
                          >
                            <strong>{item.taskName || "No title"}</strong>
                            <br />
                            Score: {item.score || 0}
                            <br />
                            Feedback: {item.feedback || "No feedback"}
                          </div>
                        ))
                      ) : (
                        <div className="alert alert-info">No tasks available</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {lectures.length > 0 && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-4">Special Lectures</h5>
                  <div className="list-group">
                    {lectures.map((lecture) => (
                      <div className="list-group-item" key={lecture._id}>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={lecture._id}
                            checked={lecturesSpecial.includes(lecture._id)}
                            onChange={() => handleLectureSelection(lecture._id)}
                          />
                          <label className="form-check-label" htmlFor={lecture._id}>
                            {lecture.title || "No title"} - {lecture.description || "No description"}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleUpdateLectures}
                      className="btn btn-primary"
                      disabled={!location.state}
                    >
                      Update Lectures
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default DetailStudent;
