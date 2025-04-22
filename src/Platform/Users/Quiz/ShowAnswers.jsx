import React, { useContext, useEffect, useState } from "react";
import { QuizContext } from "./QuizProvider";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { DataContext } from "../Context/Context";
import axios from "axios";

function ShowAnswers({ onFinish }) {
  const { quiz, userAnswers, setShowResult, setShowAnswers, setCurrentQuestion } = useContext(QuizContext);
  const { URLAPI, getTokenUser } = useContext(DataContext);
  const { lecCourse } = useParams();
  const navigate = useNavigate();
  const [quizScore, setQuizScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizScore = async () => {
      try {
        const response = await axios.get(
          `${URLAPI}/api/quizzes/score/${quiz._id}`,
          { headers: { Authorization: getTokenUser } }
        );
        setQuizScore(response.data.quizScore);
      } catch (error) {
        console.error("Error fetching quiz score:", error);
        toast.error("Error fetching quiz score");
      } finally {
        setLoading(false);
      }
    };

    if (quiz?._id) {
      fetchQuizScore();
    }
  }, [quiz?._id, URLAPI, getTokenUser]);

  if (!quiz || loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const handleGoToQuestion = (index) => {
    setCurrentQuestion(index);
    setShowAnswers(false);
  };

  return (
    <div className="card shadow-lg p-4 mt-4 mb-3 text-center w-80 mx-auto">
      <h2 className="fw-bold text-primary mb-4">Quiz Answers</h2>


      <div className="list-group">
        {quiz.questions.map((question, index) => {
          const userAnswer = userAnswers[index];
          const correctAnswer = question.answers.find(answer => answer.correct);
          const isCorrect = userAnswer === correctAnswer?.text;
          
          return (
            <div key={index} className="list-group-item mb-2">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">Question {index + 1}</h5>
                {/* <span className={`badge ${isCorrect ? "bg-success" : "bg-danger"}`}>
                  {isCorrect ? "Correct" : "Wrong"}
                </span> */}
              </div>
              <p className="mb-2">{question.question}</p>
              <div className="mb-2">
                {/* <p className="mb-1">Your Answer: {userAnswer || "Not answered"}</p> */}
                <p className="mb-1">Correct Answer: {correctAnswer?.text || "No correct answer found"}</p>
              </div>
            
            </div>
          );
        })}
      </div>

      <div className="mt-4 d-flex justify-content-between">
  
        <button
          className="btn btn-secondary"
          onClick={() => setShowAnswers(false)}
        >
          Back to Questions
        </button>
      </div>
    </div>
  );
}

export default ShowAnswers;
