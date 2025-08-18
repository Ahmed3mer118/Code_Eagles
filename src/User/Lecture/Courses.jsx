import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import VideoCourse from "./VideoCourse";
import UserService from "../../classes/UserService";
import AuthServices from "../../classes/Auth";
import Loading from "../shared/Loading";

function Courses() {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const userService = new UserService(token)
  const { slug, slugLecture } = useParams();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  const fetchLectures = useCallback(async () => {
    window.scrollTo(0, 0);
    try {
      setLoading(true);
      setError(null);
      const lecturesRes = await userService.getLectures(slug);
      const lecturesData = lecturesRes.lectures;
      setLectures(lecturesData);
      const savedData = await userService.getAttendance(
        slug
      );
      const attended = {};
      savedData.lectures.forEach((lecture) => {
        if (lecture.status === "present") {
          attended[lecture.lectureSlug] = true;
        }
      });

      setAttendanceStatus(attended);
      if (slugLecture) {

        const currentIndex = lecturesData.findIndex(
          (lec) => lec.slugLec === slugLecture
        );
        if (currentIndex !== -1) {
          setCurrentLectureIndex(currentIndex);
        }
      }
    } catch (err) {
      console.error("Error fetching lectures:", err);
      if (err.response?.status === 403) {
        setError(
          "You don't have permission to access this course. Please contact the instructor."
        );
        toast.error("You don't have permission to access this course");
      } else {
        setError(err?.response?.data?.message || "Failed to load lectures");
        toast.error("Failed to load lectures");
      }
    } finally {
      setLoading(false);
    }
  }, [slug, slugLecture]);

  useEffect(() => {
    fetchLectures();
  }, [slugLecture]);

  const handleLectureClick = (slugLec, index) => {
    setCurrentLectureIndex(index);
    navigate(`/course/${slug}/lecture/${slugLec}`);
  };


  const handleNextLecture = useCallback(async () => {
    const currentLectureId = lectures[currentLectureIndex].slugLec;
    const nextLectureIndex = currentLectureIndex + 1;
    const goToNextLecture = () => {
      if (nextLectureIndex < lectures.length) {
        const nextLectureId = lectures[nextLectureIndex].slugLec;
        navigate(`/course/${slug}/lecture/${nextLectureId}`);
        toast.success("Continued successfully");
        setTimeout(() => {
          window.location.reload()
        }, 2000);
      } else {
        toast.success("Congratulations! You've completed all lectures");
        setTimeout(() => {
          navigate(`/my-courses`);
        }, 3000);
      }
    };

    try {
      const getQuiz = await userService.getQuizzesByLectureId(currentLectureId);
      if (!getQuiz || !getQuiz.quizId) {
        goToNextLecture();
        return;
      }

      try {
        const solveQuiz = await userService.getScore(getQuiz.slugQuize);
        const score = parseInt(solveQuiz?.quizScore?.score);
        if (score >= 50) {
          goToNextLecture();
        } else {
          toast.loading("You need to pass the quiz to continue", {
            duration: 2000,
          });
          setTimeout(() => {
            navigate(
              `/course/${slug}/lecture/${currentLectureId}/quiz/${getQuiz.slugQuize}/questions`
            );
          }, 2000);
        }
      } catch (err) {
        toast.loading("You need to pass the quiz to continue", {
          duration: 2000,
        });
        setTimeout(() => {
          navigate(
            `/course/${slug}/lecture/${currentLectureId}/quiz/${getQuiz.slugQuize}/questions`
          );
        }, 2000);
      }
    } catch (err) {
      if (err?.message === "Quiz for this lecture not found") {
        goToNextLecture();
      } else {
        toast.error("An error occurred while processing your request.");
        toast.error(err?.message);
      }
    }
  }, [currentLectureIndex, lectures, slug, navigate]);

  const handlePrevLecture = useCallback(() => {
    if (currentLectureIndex > 0) {
      const prevLecture = lectures[currentLectureIndex - 1];
      navigate(`/course/${slug}/lecture/${prevLecture.slugLec}`);
    }
  }, [currentLectureIndex, lectures, slug, navigate]);
  const handleLeaveGroup = (slug) => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      if (confirmationText.toLowerCase() === "leave group") {
        userService.leaveGroup(slug);
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
      <Loading />
    );
  }

  if (error) {
    return (

      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div
          className="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 border border-red-200 dark:border-red-800"
          role="alert"
        >
          <svg className="flex-shrink-0 inline w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
          </svg>
          <span className="sr-only">Error</span>
          <div>
            <span className="font-medium">Error!</span> {error}
          </div>
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
            aria-label="Close"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
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
      <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Video Player Section */}
            <div className="lg:w-2/3">
              {lectures.length > 0 ? (
                <VideoCourse
                  lectures={lectures}
                  currentLectureIndex={currentLectureIndex}
                  onNextLecture={handleNextLecture}
                  onPrevLecture={handlePrevLecture}
                  attendanceStatus={attendanceStatus}
                />
              ) : (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-blue-800">
                        No lectures available
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          Lectures will be added soon. Please check back later.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Course Content Sidebar */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 bg-gray-50">
                  <h3 className="text-xl font-bold text-blue-600 mb-4">
                    Course Content
                  </h3>
                  <div className="space-y-3">
                    {lectures.filter((lecture) => !lecture.isDeleted).map((lecture, index) => {
                      // console.log(lecture)
                      const isAttended = attendanceStatus[lecture.slugLec];
                      const isCurrent = index === currentLectureIndex;
                      const isUnlocked = isAttended || isCurrent;
                      // console.log(isUnlocked)
                      const isLocked = !isUnlocked;

                      return (
                        <div
                          key={lecture._id}
                          onClick={() =>
                            !isLocked && handleLectureClick(lecture.slugLec, index)
                          }
                          className={`p-4 rounded-lg transition-all duration-200  ${isCurrent
                              ? "bg-blue-600 text-white shadow-md"
                              : isLocked
                                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                : "bg-white hover:bg-gray-50 cursor-pointer border border-gray-200"
                            }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3">
                              {isLocked ? (
                                <svg
                                  className="h-5 w-5 text-gray-400 mt-0.5"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="h-5 w-5 text-green-500 mt-0.5"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                              <div>
                                <h4
                                  className={`text-sm font-medium ${isCurrent
                                      ? "text-white"
                                      : isLocked
                                        ? "text-gray-500"
                                        : "text-gray-900"
                                    }`}
                                >
                                  {lecture.title}
                                </h4>
                                <p
                                  className={`text-xs ${isCurrent
                                      ? "text-blue-100"
                                      : "text-gray-500"
                                    }`}
                                >
                                  {lecture.description}
                                </p>
                              </div>
                            </div>
                            {isAttended && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            )}
                            {isLocked && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Locked
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Leave Group Button */}
              <button
                onClick={() => setShowConfirmation(true)}
                className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Leave Group
              </button>

              {/* Confirmation Modal */}
              {showConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Confirm Leaving Group
                    </h3>
                    <p className="text-gray-600 mb-4">
                      This action will remove you from the group and you will no
                      longer have access to its content.
                    </p>
                    <p className="text-gray-600 mb-4">
                      Type <span className="font-bold">"leave group"</span> to
                      confirm:
                    </p>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="leave group"
                    />
                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        onClick={() => setShowConfirmation(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleLeaveGroup(slug)}
                        disabled={
                          confirmationText.toLowerCase() !== "leave group"
                        }
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${confirmationText.toLowerCase() !== "leave group"
                            ? "bg-red-300 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          }`}
                      >
                        Confirm Leave
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Courses;
