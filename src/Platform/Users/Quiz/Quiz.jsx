import React, { useContext, useEffect, useState } from "react";
import { QuizContext } from "./QuizProvider";
import ShowQuestions from "./ShowQuestions";
import ShowResult from "./ShowResult";
import ShowAnswers from "./ShowAnswers";
import { useParams } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../Context/Context";
import axios from "axios";
import { toast } from "react-hot-toast";

function Quiz({ setShowQuiz, lectures, onComplete }) {
  const {
    showResult,
    showAnswers,
    loading,
    error,
    fetchQuiz,
    setShowResult,
    setShowAnswers,
    setCurrentQuestion,
    setUserAnswers
  } = useContext(QuizContext);
  const { URLAPI, getTokenUser } = useContext(DataContext);
  const { lecCourse, groupId } = useParams();
  const navigate = useNavigate();
  const [hasQuiz, setHasQuiz] = useState(true);
  const [quizScore, setQuizScore] = useState(null);
  const [canRetake, setCanRetake] = useState(true);

  const handleCloseQuiz = () => {
    setShowQuiz(false);
    setShowResult(false);
    setShowAnswers(false);
    setCurrentQuestion(0);
    setUserAnswers([]);
    localStorage.removeItem("ShowQuiz");
  };

  useEffect(() => {
    const checkQuiz = async () => {
      try {
        const response = await axios.get(`${URLAPI}/api/quizzes/lecture/${lecCourse}`, {
          headers: { Authorization: `${getTokenUser}` }
        });
        
        if (!response.data || !response.data.questions || response.data.questions.length === 0) {
          setHasQuiz(false);
          setShowQuiz(false);
          onComplete(100);
        } else {
          fetchQuiz(lecCourse);
        }
      } catch (err) {
        console.error("Error checking quiz:", err);
        setHasQuiz(false);
        setShowQuiz(false);
        onComplete(100);
      }
    };

    if (lecCourse) {
      checkQuiz();
    }
  }, [lecCourse]);

  if (!hasQuiz) {
    return null;
  }

  if (error) {
    return <div className="text-center p-4 text-danger">خطأ: {error}</div>;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div
        className="bg-white p-4 rounded shadow-lg position-relative"
        style={{
          width: "90%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        <h1 className="title text-primary fw-bold mb-4">quiz</h1>

        <IoClose
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            fontSize: "24px",
            cursor: "pointer",
            color: "#666",
            transition: "color 0.3s"
          }}
          onClick={handleCloseQuiz}
          onMouseOver={(e) => e.target.style.color = "#dc3545"}
          onMouseOut={(e) => e.target.style.color = "#666"}
        />

        <div className="mt-4">
          {!showResult && !showAnswers && (
            <ShowQuestions onComplete={onComplete} />
          )}
          {showResult && (
            <ShowResult 
              lectures={lectures} 
              setShowQuiz={setShowQuiz} 
              onComplete={onComplete}
              canRetake={canRetake}
            />
          )}
          {showAnswers && (
            <ShowAnswers 
              onFinish={() => {
                if (quizScore >= 50) {
                  setShowResult(true);
                } else {
                  setShowAnswers(false);
                  setUserAnswers([]);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Quiz;
