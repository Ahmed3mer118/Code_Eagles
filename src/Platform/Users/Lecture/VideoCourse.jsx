import React, { Fragment, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { DataContext } from "../Context/Context";
import { toast, Toaster } from "react-hot-toast";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import UserService from "../../classes/UserService";

function VideoCourse({ lectures, currentLectureIndex, onNextLecture, onPrevLecture, attendanceStatus }) {
  const { URLAPI, getTokenUser } = useContext(DataContext);
  const { lecCourse, groupId } = useParams();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [disabledInput, setDisabledInput] = useState(false);
  const [attendCode, setAttendCode] = useState({ code: "" });
  const [isSubmissionAllowed, setIsSubmissionAllowed] = useState(true);
  const [deadline, setDeadline] = useState("");
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [courseInfo, setCourseInfo] = useState({ title: "", description: "" });
  const [userService] = useState(new UserService(getTokenUser));
  const [quiz, setQuiz] = useState(null);
  const [score, setScore] = useState(null);
  useEffect(() => {
    const fetchLecture = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!lecCourse) {
          toast.loading("Please record your attendance first to open the video last time", { duration: 4000 });
          console.warn("No lecture selected");
          return;
        }

        const lectureRes = await userService.getLectureById(lecCourse);
        setLecture(lectureRes.lecture);

        setDisabledInput(attendanceStatus[lecCourse] || false);

        if (lectureRes.lecture.tasks?.length > 0) {
          const task = lectureRes.lecture.tasks[0];
          const backendDeadline = new Date(task.end_date);
          const today = new Date();
          const timeDifference = backendDeadline - today;
          const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

          if (daysRemaining < 0) {
            setIsSubmissionAllowed(false);
            setDeadline(`The deadline for this task has passed ${daysRemaining * -1} days ago.`);
          } else {
            setIsSubmissionAllowed(true);
            setDeadline(`You have ${daysRemaining} days remaining to submit the task.`);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to load lecture data");
      } finally {
        setLoading(false);
      }
    };

    fetchLecture();
  }, [groupId, getTokenUser, URLAPI, lecCourse, attendanceStatus]);

  useEffect(() => {
    const fetchCourseInfo = async () => {
      try {
        const response = await userService.getGroupById(groupId);
        setCourseInfo({
          title: response.title,
          description: response.description
        });
        setGroupName(response);
      } catch (err) {
        console.error("Error fetching course info:", err);
        toast.error("Failed to load course information");
      }
    };

    fetchCourseInfo();
  }, [groupId, getTokenUser, URLAPI]);

  useEffect(() => {
    const fetchQuiz = async () => {
      const getQuiz = await userService.getQuizzesByLectureId(lecCourse);
      const getScore = await userService.getScore(getQuiz._id);
      setQuiz(getQuiz._id);
      setScore(getScore);
    }
    fetchQuiz();
  }, [lecture]);

  const handleAttend = async (e) => {
    e.preventDefault();
    if (disabledInput) {
      toast.success("You have already attended this lecture.");
      return;
    }
    try {
      await userService.attendLecture(lecCourse, attendCode.code);
      toast.success("Attendance recorded successfully!");
      setDisabledInput(true);
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error("You already attended this lecture.");
      } else {
        toast.error("Failed to record attendance. Please try again.");
      }
    }
  };

  const handleSendTask = (groupId, lectureId, itemId) => {
    navigate(`/course/${groupId}/lecture/${lectureId}/Add-Task/${itemId}`);
  };



  const handleNext = () => {
    onNextLecture(false); // No quiz involved
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

  return (
    <>
      <Toaster />
      <div className="lecture-container" style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
        <div className="card mb-4">
          <div className="card-body">
            <h4 className="card-title text-primary">{lecCourse ? `Title: ${lecture?.description}` : `Course : ${courseInfo.title}`}</h4>
          </div>
        </div>

        <div style={{ position: "relative", marginBottom: "30px" }}>
          {lecture?.resources ? (
            <iframe
              src={lecture.resources}
              loading="lazy"
              style={{
                width: "100%",
                height: "400px",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              }}
              sandbox="allow-scripts allow-same-origin allow-presentation"
              allowFullScreen
            />
          ) : (
            <div style={{
              width: "100%",
              height: "400px",
              borderRadius: "10px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              backgroundColor: "#f0f0f0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "1.2rem",
              color: "#555",
            }}>
              ⚠️ No video available currently
            </div>
          )}

          <div style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            color: "rgba(255, 255, 255, 0.8)",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "0.85rem",
            pointerEvents: "none",
            zIndex: 1,
          }}>
            By: {groupName?.instructorName}
          </div>
        </div>

        <div className="d-flex justify-content-between mb-4">
          <button
            className="btn btn-outline-secondary"
            onClick={onPrevLecture}
            disabled={currentLectureIndex === 0 || loading}
          >
            <FaArrowLeft className="me-2" />
            Previous Lecture
          </button>
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={currentLectureIndex === lectures.length - 1 || loading}
          >
            Next Lecture
            <FaArrowRight className="ms-2" />
          </button>
        </div>

        <div>
          {lecCourse && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <strong style={{ fontSize: "1.2rem", color: "#555" }}>
                  Attendance Code: {disabledInput ? "Hidden" : lecture?.code}
                </strong>
                <div className="d-flex align-items-center mt-2">
                  <input
                    type="text"
                    placeholder="Enter the code"
                    className="form-control m-2 w-50"
                    style={{ borderRadius: "5px", border: "1px solid #ccc", padding: "10px" }}
                    required
                    onChange={(e) => setAttendCode({ code: e.target.value.trim() })}
                    disabled={disabledInput}
                  />
                  <button
                    className="btn btn-primary"
                    style={{ padding: "10px 20px" }}
                    onClick={handleAttend}
                    disabled={disabledInput}
                  >
                    Attend
                  </button>
                </div>
              </div>

              {lecture?.tasks?.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "15px", color: "#333" }}>
                    Tasks
                  </h2>
                  {lecture.tasks.map((item, index) => {
                    const currentDate = new Date();
                    const endDate = new Date(item.end_date);
                    const isDeadlinePassed = currentDate > endDate;
                    const daysRemaining = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));

                    return (
                      <div
                        key={index}
                        style={{
                          padding: "15px",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          marginBottom: "15px",
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        <h3 style={{ fontSize: "1.2rem", marginBottom: "10px", color: "#444" }}>
                          Task: {item.description_task}
                        </h3>
                        <p style={{ color: "#777", fontSize: "0.9rem" ,fontWeight:"bold" }}>
                          Final Date: {item.end_date?.slice(0, 10)}
                        </p>
                        {isDeadlinePassed ? (
                          <div>
                            <p className="text-danger fw-bold">Deadline expired</p>
                            <p className="text-muted ">You can't submit the task because the deadline has passed {daysRemaining * -1} days ago.</p>
                          </div>
                        ) : (
                          <button
                            className="btn btn-success"
                            onClick={() => handleSendTask(groupId, lecture._id, item._id)}
                          >
                            Submit Task
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}


              {quiz?.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "15px", color: "#333" }}>
                    Quizzes
                  </h2>

                  <div style={{
                    padding: "15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    marginBottom: "15px",
                    backgroundColor: "#f9f9f9",
                  }}>


                    <h3 style={{ color: "#777" }}>
                      Score: {score?.quizScore?.score || "No score yet"}
                    </h3>

                  </div>
                </div>
              )}

            </>
          )}

        </div>
      </div>
    </>
  );
}

export default VideoCourse;
