import React, { useContext, useEffect, useState } from "react";
import { QuizContext } from "./QuizProvider";
import toast, { Toaster } from "react-hot-toast";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { DataContext } from "../Context/Context";
import axios from "axios";
function ShowResult({ cardStyles, lectures, setShowQuiz , onComplete }) {
  const { quiz, score, handleRestart, setShowAnswers } = useContext(QuizContext);
  const navigate = useNavigate();
  const { groupId } = useParams();
  const location = useLocation();
  let path = location.pathname;
  const lectureId = path.replace(/^.*\/lecture\//, "");
  const { URLAPI, getTokenUser } = useContext(DataContext);

  // تحديد index المحاضرة الحالية
  const currentLectureIndex = lectures.findIndex(lecture => lecture._id === lectureId);

  if (!quiz) return null;


  const totalQuestions = quiz.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const isPassed = percentage >= 50;

  const getMessage = () => {
    if (percentage >= 90) return "Excellent! Great work! ";
    if (percentage >= 70) return "Good!";
    if (percentage >= 50) return "Passed!";
    return "You need more practice";
  };

  const handleFinish = async () => {
    try {
      const response = await axios.get(
        `${URLAPI}/api/quizzes/score/${quiz._id}`,
        { headers: { Authorization: getTokenUser } }
      );
      
      const score = parseInt(response.data.quizScore.score);
      onComplete(score);

      if (score >= 50) {
        if (currentLectureIndex !== -1 && currentLectureIndex < lectures.length - 1) {
          const nextLecture = lectures[currentLectureIndex + 1];
          toast.success("success quiz");
          localStorage.setItem("ShowQuiz", "false");
          setShowQuiz(false);
        } else {
          toast.success("congratulations! you have completed all the lectures!");
          setShowQuiz(false);
        }
      } else {
        toast.error("you must get 50% or more to pass the quiz");
        localStorage.setItem("ShowQuiz", "true");
        setShowQuiz(true);
      }
    } catch (error) {
      console.error("Error checking quiz score:", error);
      toast.error("error checking quiz score");
    }
  };

  return (
    <div className="card shadow-lg p-4 text-center mt-3 mb-4" style={cardStyles}>
      <Toaster position="top-center" />
      <h1 className="fw-bold text-primary mb-4">Final result</h1>

      <div className="mb-4">
        <div className="progress mb-2" style={{ height: "20px" }}>
          <div
            className={`progress-bar ${isPassed ? 'bg-success' : 'bg-danger'}`}
            role="progressbar"
            style={{ width: `${percentage}%` }}
            aria-valuenow={percentage}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
        <h2 className={`fw-bold ${isPassed ? "text-success" : "text-danger"}`}>
          {score} of {totalQuestions} ({percentage}%)
        </h2>
        <p className="lead">{getMessage()}</p>
      </div>

      <div className="mt-3 d-flex flex-wrap justify-content-center gap-3">
        {score && (<>
        <button
          className="btn btn-success fw-bold"
          onClick={handleFinish}
        >
          Finish and go to the next lecture
        </button>
          <button
            className="btn btn-warning px-4 fw-bold"
            onClick={() => setShowAnswers(true)}
          >
            View the correct answers
          </button>
        </>
        )}
        {
          !score && (
            <button className="btn btn-danger px-4 fw-bold" onClick={handleRestart}>
              Restart the quiz
            </button>
          )
        }
        
     
      </div>
    </div>
  );
}

export default ShowResult;
