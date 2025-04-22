import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { DataContext } from "../Context/Context";
import { toast , Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import VideoCourse from "./VideoCourse";
import Quiz from "../Quiz/Quiz";
import { FaLock, FaLockOpen } from "react-icons/fa";

function Courses() {
  const { URLAPI, getTokenUser } = useContext(DataContext);
  const { groupId, lecCourse } = useParams();
  const [lectures, setLectures] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passed, setPassed] = useState(0);
  const navigate = useNavigate();
  const styleCard = "bg-primary text-light";
  const [attendedLectures, setAttendedLectures] = useState([]);
  const [lectureCodes, setLectureCodes] = useState({});
  const [quizBlocked, setQuizBlocked] = useState(false);
  const [quizMessage, setQuizMessage] = useState("");

  const fetchLectures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [lecturesRes, attendanceRes] = await Promise.all([
        axios.get(`${URLAPI}/api/lectures/group/${groupId}`, {
          headers: { Authorization: `${getTokenUser}` }
        }),
        axios.get(`${URLAPI}/api/lectures/${groupId}/get-user-attendance-status-in-group`, {
          headers: { Authorization: `${getTokenUser}` }
        }).catch(() => ({ data: { lectures: [] } }))
      ]);

      const lecturesData = lecturesRes.data.lectures;
      setLectures(lecturesData);

      const codesMap = {};
      lecturesData.forEach(lecture => {
        codesMap[lecture._id] = lecture.code;
      });
      setLectureCodes(codesMap);

      const attended = attendanceRes.data.lectures
        .filter(lecture => lecture.status === "present")
        .map(lecture => lecture.lectureId);
      setAttendedLectures(attended);

      const currentIndex = lecturesData.findIndex(lec => lec._id === lecCourse);
      if (currentIndex !== -1) {
        setCurrentLectureIndex(currentIndex);
     

      } 
      else if (lecturesData.length > 0) {
        const firstAccessibleIndex = lecturesData.findIndex(lecture => 
          attended.includes(lecture._id)
        );
        const indexToUse = firstAccessibleIndex !== -1 ? firstAccessibleIndex : 0;
        navigate(`/course/${groupId}/lecture/${lecturesData[indexToUse]._id}`);
      }

    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to load lectures");
      toast.error("Failed to load lectures");
    } finally {
      setLoading(false);
    }
  }, [groupId, getTokenUser, URLAPI, lecCourse, navigate]);



  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  const handleLectureClick = useCallback((lectureId, index) => {
    if (attendedLectures.includes(lectureId)) {
      setCurrentLectureIndex(index);
      navigate(`/course/${groupId}/lecture/${lectureId}`);
    } else {
        toast.success("you must attend the lecture first");
    }
  }, [attendedLectures, groupId, navigate]);

  const handleNextLecture = useCallback(async () => {
    if (currentLectureIndex >= lectures.length - 1) {
      toast.success("Congratulations! You have completed all lectures");
      return;
    }
    const nextLecture = lectures[currentLectureIndex + 1];
    try {
   
      if (!quizBlocked) {
        toast.success("You must pass the quiz first");
        setShowQuiz(true);
      }else{
        setCurrentLectureIndex(currentLectureIndex + 1);
        navigate(`/course/${groupId}/lecture/${nextLecture._id}`);
      }


    } catch (err) {
      console.error("Error moving to next lecture:", err);
      toast.error("An error occurred while moving to the next lecture");
    }
  }, [currentLectureIndex, lectures, attendedLectures, lectureCodes, 
      URLAPI, getTokenUser, groupId, navigate, quizBlocked, quizMessage]);

  const handlePrevLecture = useCallback(() => {
    if (currentLectureIndex > 0) {
      const prevLecture = lectures[currentLectureIndex - 1];
      navigate(`/course/${groupId}/lecture/${prevLecture._id}`);
    }
  }, [currentLectureIndex, lectures, groupId, navigate]);

  const handleQuizComplete = useCallback(async (quizScore) => {
    try {
      if (quizScore >= 50) {
        setQuizBlocked(false);
        setShowQuiz(false);
        
        const nextLecture = lectures[currentLectureIndex + 1];
        if (nextLecture) {
          setCurrentLectureIndex(currentLectureIndex + 1);
          navigate(`/course/${groupId}/lecture/${nextLecture._id}`);
        } else {
          toast.success("congratulations! you have completed all the lectures");
        }
      } else {
        setQuizBlocked(true);
        setShowQuiz(true);
        toast.error(`you must get 50% or more to pass the quiz (your score: ${quizScore}%)`);
      }
    } catch (err) {
      console.error("Error handling quiz completion:", err);
      toast.error("error handling quiz completion");
    }
  }, [currentLectureIndex, lectures, groupId, navigate]);

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
        <div className="alert alert-danger" role="alert">
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
      <div className="container-fluid py-4">
        <div className="row container m-auto">
          <div className="col-lg-8">
            {lectures.length > 0 ? (
              <>
                <VideoCourse
                  lectures={lectures}
                  currentLectureIndex={currentLectureIndex}
                  onNextLecture={handleNextLecture}
                  onPrevLecture={handlePrevLecture}
                  quizBlocked={quizBlocked}
                />
                {(showQuiz || quizBlocked) && (
                  <Quiz
                    setShowQuiz={setShowQuiz}
                    onComplete={handleQuizComplete}
                    lectureId={lecCourse}
                    lectures={lectures}
                    initialMessage={quizMessage}
                  />
                )}
              </>
            ) : (
              <div className="alert alert-info text-center">
                <h4>No lectures available currently</h4>
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
                    const isCurrent = lecture._id === lecCourse;
                    const isAttended = attendedLectures.includes(lecture._id);
                    const quizPassed = isAttended && !quizBlocked;

                    return (
                      <div
                        key={lecture._id}
                        className={`list-group-item list-group-item-action border-0 mb-2 rounded-3 ${
                          isCurrent ? styleCard : "bg-white"
                        } ${!isAttended ? "opacity-75" : ""}`}
                        onClick={() => handleLectureClick(lecture._id, index)}
                        style={{
                          cursor: isAttended ? "pointer" : "not-allowed",
                          transition: "all 0.3s ease",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                          border: "1px solid rgba(0,0,0,0.05)",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-2 w-100">
                              <h6 className={`mb-0 ${isCurrent ? "text-white" : "text-dark"} fw-semibold`}>
                                {lecture.title}
                              </h6>
                              <span className="ms-2">
                                {isAttended ? (
                                  <FaLockOpen className="text-dark" />
                                ) : (
                                  <FaLock className="text-muted" />
                                )}
                              </span>
                            </div>
                            <p className={`small mb-2 ${isCurrent ? "text-white-50" : "text-muted"}`}>
                              {lecture.description}
                            </p>
                            <div className="d-flex align-items-center">
                              {isAttended ? (
                                quizPassed ? (
                                  <span className="badge bg-success">
                                    <i className="bi bi-check-circle me-1"></i>
                                    Completed
                                  </span>
                                ) : (
                                  <span className="badge bg-primary">
                                    <i className="bi bi-play-circle me-1"></i>
                                    Available
                                  </span>
                                )
                              ) : (
                                <span className="badge bg-secondary">
                                  <i className="bi bi-lock me-1"></i>
                                  Locked
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Courses;