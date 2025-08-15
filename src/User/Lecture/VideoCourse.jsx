import React, { Fragment, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import UserService from "../../classes/UserService";
import AuthServices from "../../classes/Auth";
import Loading from "../shared/Loading";

function VideoCourse({
  lectures,
  currentLectureIndex,
  onNextLecture,
  onPrevLecture,
  attendanceStatus,
}) {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const userService = new UserService(token);
  const { slugLecture, slug } = useParams();
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
  const [quiz, setQuiz] = useState(null);
  const [score, setScore] = useState(null);
  useEffect(() => {
    const fetchLecture = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!slugLecture) {
          toast.loading(
            "Please record your attendance first to open the video last time",
            { duration: 4000 }
          );
          return;
        }

        if(slugLecture){
          const lectureRes = await userService.getLectureById(slugLecture);
          setLecture(lectureRes.lecture);
          setDisabledInput(attendanceStatus[slugLecture] || false);
  
          if (lectureRes.lecture.tasks?.length > 0) {
            const task = lectureRes.lecture.tasks[0];
            const backendDeadline = new Date(task.end_date);
            const today = new Date();
            const timeDifference = backendDeadline - today;
            const daysRemaining = Math.ceil(
              timeDifference / (1000 * 60 * 60 * 24)
            );
  
            if (daysRemaining < 0) {
              setIsSubmissionAllowed(false);
              setDeadline(
                `The deadline for this task has passed ${
                  daysRemaining * -1
                } days ago.`
              );
            } else {
              setIsSubmissionAllowed(true);
              setDeadline(
                `You have ${daysRemaining} days remaining to submit the task.`
              );
            }
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
  }, [slug, token, slugLecture]);

  useEffect(() => {
    const fetchCourseInfo = async () => {
      try {
        const response = await userService.getGroupById(slug);
        setCourseInfo({
          title: response.title,
          description: response.description,
        });
        setGroupName(response);
      } catch (err) {
        console.error("Error fetching course info:", err);
        toast.error("Failed to load course information");
      }
    };

    fetchCourseInfo();
  }, [slug, token]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        if (slugLecture) {
          const getQuiz = await userService.getQuizzesByLectureId(slugLecture);
          if (getQuiz) {
            setQuiz(getQuiz);
            const getScore = await userService.getScore(getQuiz.slugQuize);
            setScore(getScore);
            
          }
        }
      } catch (error) {
        console.log("Error fetching quiz:", error.message);
        // toast.error(error.message)
      }
    };
    
    fetchQuiz();
  }, [slug , slugLecture]); 

  const handleAttend = async (e) => {
    e.preventDefault();
    if (disabledInput) {
      toast.success("You have already attended this lecture.");
      return;
    }
    try {
      await userService.attendLecture(slugLecture, attendCode.code);
      toast.success("Attendance recorded successfully!");
      setDisabledInput(true);
    } catch (error) {
      if (error.response) {
        toast.error("You already attended this lecture.");
      } 
      else {
        toast.error("Failed to record attendance. Please try again.");
      }
    }
  };

  const handleSendTask = (slug, slugLecture, slugTask) => {
    navigate(`/course/${slug}/lecture/${slugLecture}/Add-Task/${slugTask}`);
  };

  const handleNext = () => {
    onNextLecture(); 
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <>
      <Toaster />
      <div className="max-w-4xl mx-auto p-6">
        {/* Lecture Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-600">
            {slugLecture
              ? `Lecture: ${lecture?.title}`
              : `Course: ${courseInfo.title}`}
          </h2>
        </div>

        {/* Video Container */}
        <div className="relative mb-8 rounded-xl overflow-hidden shadow-lg">
          {lecture?.resources ? (
            <iframe
              src={lecture.resources || lecture.resources[0]}
              loading="lazy"
              className="w-full h-96 md:h-[500px]"
              sandbox="allow-scripts allow-same-origin allow-presentation"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-96 md:h-[500px] bg-gray-100 flex flex-col items-center justify-center text-gray-500">
              <svg
                className="w-12 h-12 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="text-lg">No video available currently</span>
            </div>
          )}
          <div className="absolute top-3 left-3 text-white bg-black bg-opacity-60 px-3 py-1 rounded-md text-sm pointer-events-none z-10">
            By: {groupName?.instructorName}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mb-8">
          <button
            onClick={onPrevLecture}
            disabled={currentLectureIndex === 0 || loading}
            className={`flex items-center px-4 py-2 rounded-lg border ${
              currentLectureIndex === 0 || loading
                ? "border-gray-300 text-gray-400 cursor-not-allowed"
                : "border-blue-500 text-blue-600 hover:bg-blue-50"
            }`}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous Lecture
          </button>
          <button
            onClick={handleNext}
            disabled={!slugLecture || loading}
            className={`flex items-center px-4 py-2 rounded-lg ${
              !slugLecture || loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            Next Lecture
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {slugLecture && (
          <div className="space-y-6">
            {/* Attendance Code Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Attendance Code:{" "}
                <span className="font-normal">
                  {disabledInput ? "Hidden" : lecture?.code}
                </span>
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <input
                  type="text"
                  placeholder="Enter the code"
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  onChange={(e) =>
                    setAttendCode({ code: e.target.value.trim() })
                  }
                  disabled={disabledInput}
                />
                <button
                  onClick={handleAttend}
                  disabled={disabledInput}
                  className={`px-6 py-2 rounded-lg ${
                    disabledInput
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white`}
                >
                  Attend
                </button>
              </div>
            </div>

            {/* Tasks Section */}
            {lecture?.tasks?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Tasks</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {lecture.tasks.map((item, index) => {
                    const currentDate = new Date();
                    const endDate = new Date(item.end_date);
                    const isDeadlinePassed = currentDate > endDate;
                    const daysRemaining = Math.ceil(
                      (endDate - currentDate) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <div key={index} className="p-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          {item.description_task}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Due: {item.end_date?.slice(0, 10)}
                        </p>
                        {isDeadlinePassed ? (
                          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg
                                  className="h-5 w-5 text-red-500"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-red-700">
                                  Deadline expired {daysRemaining * -1} days
                                  ago. Submissions are closed.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              handleSendTask(slug, lecture.slugLec, item.slugTask)
                            }
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                          >
                            Submit Task
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quizzes Section */}
            {quiz && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Quizzes
                </h2>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                  <p className="text-blue-800">
                    Score:{" "}
                    <span className="font-semibold">
                      {score?.quizScore?.score || "No score yet"}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default VideoCourse;
