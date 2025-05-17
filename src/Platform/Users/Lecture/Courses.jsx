import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DataContext } from "../Context/Context";
import { toast, Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import VideoCourse from "./VideoCourse";
import { FaLock, FaLockOpen } from "react-icons/fa";
import UserService from "../../classes/UserService";

function Courses() {
  const { getTokenUser } = useContext(DataContext);
  const { groupId, lecCourse } = useParams();
  const navigate = useNavigate();
  const [userService] = useState(new UserService(getTokenUser));
  const [lectures, setLectures] = useState([]);
  const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");


  const fetchLectures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const lecturesRes = await userService.getLectures(groupId);
      const lecturesData = lecturesRes.lectures;
      setLectures(lecturesData);
      const savedData = await userService.getUserAttendanceStatusInGroup(groupId);
      const attended = {};
      savedData.lectures.forEach((lecture) => {
        if (lecture.status === "present") {
          attended[lecture.lectureId] = true;
        }
      });

      setAttendanceStatus(attended);

      if (lecCourse) {
        const currentIndex = lecturesData.findIndex((lec) => lec._id === lecCourse);
        if (currentIndex !== -1) {
          setCurrentLectureIndex(currentIndex);
        }
      }
    } catch (err) {
      console.error("Error fetching lectures:", err);
      if (err.response?.status === 403) {
        setError("You don't have permission to access this course. Please contact the instructor.");
        toast.error("You don't have permission to access this course");
      } else {
        setError(err.response?.data?.message || "Failed to load lectures");
        toast.error("Failed to load lectures");
      }
    } finally {
      setLoading(false);
    }
  }, [groupId, lecCourse, userService]);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  // === تحديث حالة الحضور وحفظها في localStorage ===

  const handleLectureClick = useCallback(
    (lectureId, index) => {
      setCurrentLectureIndex(index);
      navigate(`/course/${groupId}/lecture/${lectureId}`);
    },
    [groupId, navigate]
  );

  const handleNextLecture = useCallback(async () => {
    const currentLectureId = lectures[currentLectureIndex]._id;
    const nextLectureIndex = currentLectureIndex + 1;

    // دالة مساعدة للانتقال للمحاضرة التالية
    const goToNextLecture = () => {
      if (nextLectureIndex < lectures.length) {
        const nextLectureId = lectures[nextLectureIndex]._id;
        navigate(`/course/${groupId}/lecture/${nextLectureId}`);
        toast.success("Continued successfully");
      } else {
        toast.success("Congratulations! You've completed all lectures");
        setTimeout(() => {
          navigate(`/my-courses`);
        }, 3000);
      }
    };

    try {
      const getQuiz = await userService.getQuizzesByLectureId(currentLectureId);
      console.log(getQuiz);
      if (!getQuiz || !getQuiz._id) {
        goToNextLecture();
        return;
      }


      try {
        const solveQuiz = await userService.getScore(getQuiz._id);
        const score = parseInt(solveQuiz?.quizScore?.score);
        if (score >= 50) {
          goToNextLecture();
        } else {
          toast.loading("You need to pass the quiz to continue", {
            duration: 2000,
          });
          setTimeout(() => {
            navigate(`/course/${groupId}/lecture/${currentLectureId}/quiz/${getQuiz._id}/questions`);
          }, 2000);
        }
      } catch (err) {
        toast.loading("You need to pass the quiz to continue", {
          duration: 2000,
        });
        setTimeout(() => {
          navigate(`/course/${groupId}/lecture/${currentLectureId}/quiz/${getQuiz._id}/questions`);
        }, 2000);
      }

    } catch (err) {
      if (err?.message === "Quiz for this lecture not found") {
        goToNextLecture();
      }
      else {
        toast.error("An error occurred while processing your request.");
        toast.error(err?.message);
      }
    }
  }, [currentLectureIndex, lectures, groupId, navigate, userService]);


  const handlePrevLecture = useCallback(() => {
    if (currentLectureIndex > 0) {
      const prevLecture = lectures[currentLectureIndex - 1];
      navigate(`/course/${groupId}/lecture/${prevLecture._id}`);
    }
  }, [currentLectureIndex, lectures, groupId, navigate]);
  const handleLeaveGroup = (groupId) => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      if (confirmationText.toLowerCase() === "leave group") {
        userService.leaveGroup(groupId);
        setShowConfirmation(false);
        toast.success("You have left the group successfully.");
        setTimeout(() => {
          navigate("/my-courses");
          window.location.reload();
        }, 2000);
      } else {
        toast.error("You must type 'leave group' to confirm.");
      }

    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-muted" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Code Eagles | Lectures</title>
      </Helmet>
      <Toaster />
      <div className="container-fluid py-4">
        <div className="row container m-auto">
          <div className="col-lg-8">
            {lectures.length > 0 ? (
              <VideoCourse
                lectures={lectures}
                currentLectureIndex={currentLectureIndex}
                onNextLecture={handleNextLecture}
                onPrevLecture={handlePrevLecture}
                attendanceStatus={attendanceStatus}
              />
            ) : (
              <div className="alert alert-info text-center">
                <h4>No lectures available at the moment</h4>
                <p>Lectures will be added soon</p>
              </div>
            )}
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-body bg-light">
                <h5 className="card-title mb-4 text-primary fw-bold">Course Content</h5>
                <div className="list-group list-group-flush">
                  {lectures.map((lecture, index) => {
                    const isAttended = attendanceStatus[lecture._id];
                    const isCurrent = index === currentLectureIndex;
                    const isUnlocked = isAttended || isCurrent;
                    const isLocked = !isUnlocked;

                    return (
                      <div
                        key={lecture._id}
                        className={`list-group-item list-group-item-action border-0 mb-2 rounded-3 
                          ${isCurrent ? "bg-primary text-white" : isLocked ? "bg-light opacity-75 text-muted" : "bg-white"}
                        `}
                        onClick={() => !isLocked && handleLectureClick(lecture._id, index)}
                        style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-2 w-100">
                              <div className="d-flex align-items-center">
                                {isLocked ? (
                                  <FaLock className="me-2" />
                                ) : (
                                  <FaLockOpen className="me-2 text-success" />
                                )}
                                <h6 className={`mb-0 ${isLocked ? "text-muted" : isCurrent ? "text-white" : "text-dark"} fw-semibold`}>
                                  {lecture.title}
                                </h6>
                              </div>
                              <span className="ms-2">
                                {isAttended && (
                                  <span className="badge bg-success rounded-pill px-3 py-2">
                                    <i className="fas fa-check me-1"></i>
                                    Completed
                                  </span>
                                )}
                                {isLocked && (
                                  <span className="badge bg-muted text-dark rounded-pill px-3 py-2">
                                    <i className="fas fa-lock me-1"></i>
                                    Locked
                                  </span>
                                )}
                              </span>
                            </div>
                            <p className={`small mb-2 ${isLocked ? "text-muted" : isCurrent ? "text-white-50" : "text-muted"}`}>
                              {lecture.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <button className="btn btn-danger mt-3 mb-3" onClick={() => setShowConfirmation(true)}>
              Leave Group
            </button>
            {showConfirmation && (
              <div
                className="overlay"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999,
                }}
              >
                <div
                  className="confirmation-box bg-white p-4 rounded"
                  style={{
                    width: "90%",
                    maxWidth: "400px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <p className="text-muted fw-semibold mb-2 text-center">
                    This action will remove you from the group and you will no longer be able to access the group's content and all data related to it.
                  </p>
                  <p className="text-muted mb-2 text-center">
                    Please type <strong>"leave group"</strong> to confirm:
                  </p>
                  <input
                    type="text"
                    className="form-control mb-3"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="Type here to confirm"
                  />
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-danger"
                      onClick={() => handleLeaveGroup(groupId)}
                    >
                      Confirm Leave
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowConfirmation(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

export default Courses;
