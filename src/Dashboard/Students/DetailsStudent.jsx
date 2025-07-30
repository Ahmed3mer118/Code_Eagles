import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import AuthServices from "../../classes/Auth";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";

function DetailStudent() {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const role = authServices.getRole()
  const URLAPI = authServices.URLAPI;
  const adminServices = new AdminService(token);
  const instructorService = new InstructorService(token);

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
  const { studentSlug ,email } = useParams();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [lecturesSpecial, setSelectedLectures] = useState([]);
  const [quizData, setQuizData] = useState([]);
  const location = useLocation();

  // Fetch Student Data
  useEffect(() => {
    if (!token) {
      toast.error("Not authorized. Please login.");
      navigate("/auth/login");
      return;
    }

    const fetchStudent = async () => {
      try {
        setLoading(true);

        if (!token) {
          throw new Error("No valid service found");
        }
        let studentData;
        if (window.location.pathname.includes("/dashboard")) {
          studentData = await adminServices.getStudentDetails(studentSlug || email);
        } else {
          studentData = await instructorService.getStudentDetails(studentSlug || email);
        }
        setStudents(studentData);

        if (studentData.groups && studentData.groups.length > 0) {
          setGroupIdByStd(studentData.groups);
          const statusMap = {};
          studentData.groups.forEach((group) => {
            statusMap[group.groupInfo.slug] = group.status || "pending";
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
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentSlug, token, URLAPI, navigate]);

  // Fetch Group Details
  useEffect(() => {
    if (groupIdByStd && groupIdByStd.length > 0) {
      const fetchGroupDetails = async () => {
        try {
          const details = await Promise.all(
            groupIdByStd.map(async (group) => {
              try {
                const groupData = await adminServices.getGroupDetails(
                  group.groupInfo.slug
                );
                return groupData;
              } catch (error) {
                console.error(
                  `Error fetching group ${group.groupSlug}:`,
                  error
                );
                return null;
              }
            })
          );
          const validDetails = details.filter((detail) => detail !== null);
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
      await adminServices.deleteStudent(id);
      toast.success("Student deleted successfully");
      setTimeout(() => {
        navigate("/dashboard/admin/allStudent");
      }, 2000);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Toggle User Status
  const handleStopUser = async (studentSlug, groupSlug) => {
    if (!token) {
      toast.error("Not authorized. Please login.");
      navigate("/auth/login");
      return;
    }

    if (!groupIdByStd || groupIdByStd.length === 0) {
      toast.error("No groups available for this student.");
      return;
    }

    try {
      const currentGroupStatus = currentStatus[groupSlug] || "pending";
      let newStatus = "";
      switch (currentGroupStatus) {
        case "pending":
          newStatus = "approved";
          break;
        case "approved":
        case "special":
          newStatus = "pending";
          break;
        default:
          newStatus = "approved";
          break;
      }

      const service = window.location.pathname.includes("/dashboard")
        ? adminServices
        : instructorService;

      if (currentGroupStatus === "special") {
        await service.updateStudentStatusSpecial(
          studentSlug,
          newStatus,
          groupSlug
        );
      } else {
        await service.updateStudentStatus(studentSlug, newStatus, groupSlug);
      }

      setCurrentStatus((prevStatus) => ({
        ...prevStatus,
        [groupSlug]: newStatus,
      }));

      // const updatedStudent = await service.getStudentDetails(studentSlug);
      // if (updatedStudent.groups && updatedStudent.groups.length > 0) {
      //   const updatedStatusMap = {};
      //   updatedStudent.groups.forEach((group) => {
      //     // updatedStatusMap[group.groupInfo.slug] = group.status 
      //     console.log(group.groupInfo.slug)
      //     console.log( updatedStatusMap[group.groupInfo.slug] = group.status )
      //   });
      //   setCurrentStatus(updatedStatusMap);
      // }

      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating student status:", error);
      toast.error(error?.message || "Failed to update student status");
    }
  };

  // show Details Student
  const showDetailsStd = async (email, groupId) => {
    setLoading(true);
    navigate("", { state: groupId });

    try {
      if (window.location.pathname.includes("/admin")) {
        const attendanceData = await adminServices.getStudentAttendance(
          email,
          groupId
        );
        setAttendanceData(attendanceData.groupLectures || []);
        setAttendance({
          present: attendanceData.attendedLecturesCount || 0,
          absent: attendanceData.notAttendedLecturesCount || 0,
        });

        const taskData = await adminServices.getStudentDetails(email);
        const tasksData = taskData.groups.find(
          (group) => group.groupId === groupId
        ).tasks;
        setTaskData(tasksData || []);

        const quizData = await adminServices.showAllQuizzesScore(
          email,
          groupId
        );
        setQuizData(quizData.quizScores || []);
        const lecturesData = await adminServices.getStudentAttendance(
          email,
          groupId
        );
        setLectures(lecturesData.lectures || []);

        if (currentStatus[groupId] === "special") {
          const studentData = await adminServices.getStudentDetails(email);
          const specialGroup = studentData.groups.find(
            (g) => g.groupId === groupId
          );
          if (specialGroup && specialGroup.lecturesSpecial) {
            setSelectedLectures(specialGroup.lecturesSpecial);
          }
        }
      } else {
        const attendanceData = await instructorService.getStudentAttendance(
          email,
          groupId
        );

        setAttendanceData(attendanceData.groupLectures || []);
        setAttendance({
          present: attendanceData.attendedLecturesCount || 0,
          absent: attendanceData.notAttendedLecturesCount || 0,
        });

        const taskData = await instructorService.getStudentDetails(email);
        const tasksData = taskData.groups.find(
          (group) => group.groupId === groupId
        ).tasks;

        setTaskData(tasksData || []);

        const quizData = await instructorService.showAllQuizzesScore(
          email,
          groupId
        );
        setQuizData(quizData.quizScores || []);
      }
    } catch (error) {
      toast.error(error?.message);
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
  //   if (!token) {
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
  //     userId: email,
  //     lecturesToAdd: lecturesToAdd,
  //     lecturesToRemove: lecturesToRemove
  //   };

  //   try {
  //     await adminService.updateStudentLectures(payload);
  //     toast.success("Lectures updated successfully");

  //     await adminService.updateStudentStatus(email, location.state, "special");

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
  const handleUpdateRole = async (studentSlug, newRole) => {
    try {
      if (window.location.pathname.includes("/admin")) {
        await adminServices.updateStudentRole(studentSlug, newRole);
      } else {
        await instructorService.updateStudentRole(studentSlug, newRole);
      }
      const updatedStudent = await adminServices.getStudentDetails(studentSlug);
      setStudents(updatedStudent);
      toast.success(`Student role updated to ${newRole}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <Helmet>
        <title>Student Details: {students.name || "Loading..."}</title>
      </Helmet>
      <Toaster />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Student Details: {students.name || "Loading..."}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Student Information
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Number
                        </th>
                        {token && (
                          <>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                              Role
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                              Actions
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      <tr>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                          {students.name?.split(" ")[0] || "Not available"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                          {students.email || "Not available"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                          {students.phone_number || "Not available"}
                        </td>
                        {token && (
                          <>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <select
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                value={students.role || "user"}
                                onChange={(e) =>
                                  handleUpdateRole(
                                    students.email,
                                    e.target.value
                                  )
                                }
                              >
                                <option value="user">Student</option>
                                {role === "admin" &&  <option value="admin">Admin</option>}
                               
                                <option value="instructor">Instructor</option>
                              </select>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleDelete(email)}
                                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                              >
                                Delete
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Groups
                </h2>
                {groupDetails.length === 0 ? (
                  <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-md dark:bg-blue-900 dark:text-blue-200">
                    No groups available for this student
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupDetails.map((group, index) => {
                      const status = currentStatus[group.slug];
                      const isApprovedOrSpecial =
                        status === "approved" || status === "special";
                      return (
                        <div
                          key={group.slug}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow dark:border-gray-700"
                        >
                          <h3 className="font-medium text-lg text-gray-800 dark:text-white">
                            {group.title || "No title"}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            Start Date:{" "}
                            {group.start_date?.split("T")[0] || "Not available"}
                          </p>
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                              onClick={() =>
                                showDetailsStd(studentSlug, group.slug)
                              }
                            >
                              View Details
                            </button>
                            <button
                              onClick={() =>
                                handleStopUser(studentSlug, group.slug)
                              }
                              className={`px-3 py-1 rounded-md text-sm ${
                                currentStatus[group.slug] === "approved" ||
                                currentStatus[group.slug] === "special"
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "bg-red-600 hover:bg-red-700 text-white"
                              }`}
                            >
                              {currentStatus[group.slug] === "approved" ||
                              currentStatus[group.slug] === "special"
                                ? "Approved" || "Special"
                                : "Pending"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Quizzes
                </h2>
                {Array.isArray(quizData) && quizData.length > 0 ? (
                  <div className="space-y-2">
                    {quizData.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg dark:border-gray-700"
                      >
                        <strong className="text-gray-800 dark:text-white">
                          {item.lectureTitle || "No title"}:{" "}
                          <span className="text-blue-600 dark:text-blue-400">
                            {item.score || 0}
                          </span>
                        </strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-md dark:bg-blue-900 dark:text-blue-200">
                    No quizzes available
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Attendance
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 p-3 rounded-lg dark:bg-green-900 dark:bg-opacity-20">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Present
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {attendance.present || 0}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg dark:bg-red-900 dark:bg-opacity-20">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Absent
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {attendance.absent || 0}
                    </p>
                  </div>
                </div>

                {Array.isArray(attendanceData) && attendanceData.length > 0 ? (
                  <div className="space-y-2">
                    {attendanceData.map((item, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          item.status === "present"
                            ? "bg-green-50 text-green-800 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-200"
                            : "bg-red-50 text-red-800 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-200"
                        }`}
                      >
                        <strong>Lecture {index + 1}</strong>:{" "}
                        {item.status === "present" ? "Present" : "Absent"}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-md dark:bg-blue-900 dark:text-blue-200">
                    No attendance data available
                  </div>
                )}
              </div>
            </div>

            {/* Tasks Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Tasks
                </h2>
                {taskData && taskData.length > 0 ? (
                  <div className="space-y-3">
                    {taskData.map((item, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg ${
                          item.score / 2 > 0
                            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900 dark:bg-opacity-20"
                            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900 dark:bg-opacity-20"
                        }`}
                      >
                        <strong className="text-gray-800 dark:text-white">
                          {item.taskName || "No title"}
                        </strong>
                        <p className="text-gray-600 dark:text-gray-400">
                          Score: {item.score || 0}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Feedback: {item.feedback || "No feedback"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-md dark:bg-blue-900 dark:text-blue-200">
                    No tasks available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Special Lectures Section */}
        {lectures.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Special Lectures
                </h2>
                <div className="space-y-2">
                  {lectures.map((lecture) => (
                    <div
                      key={lecture._id}
                      className="flex items-center p-3 border rounded-lg dark:border-gray-700"
                    >
                      <input
                        type="checkbox"
                        id={lecture._id}
                        checked={lecturesSpecial.includes(lecture._id)}
                        onChange={() => handleLectureSelection(lecture._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor={lecture._id}
                        className="ml-3 block text-gray-800 dark:text-gray-200"
                      >
                        <span className="font-medium">
                          {lecture.title || "No title"}
                        </span>{" "}
                        - {lecture.description || "No description"}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleUpdateLectures}
                    disabled={!location.state}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update Lectures
                  </button>
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
