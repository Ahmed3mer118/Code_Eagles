import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { DataContext } from "../Context/Context";

export const QuizContext = createContext();

const QuizProvider = ({ children }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {URLAPI ,getTokenUser} = useContext(DataContext)

 
  const fetchQuiz = async (lectureId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${URLAPI}/api/quizzes/lecture/${lectureId}`,{
        headers:{
          Authorization:`${getTokenUser}`
        }
      });
      setQuiz(response.data);
      // setUserAnswers(Array(response.data.questions.length).fill(null));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAnswer = async (answerIndex) => {
    if (!quiz) return;

    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);

    const currentQuestionData = quiz.questions[currentQuestion];
    const selectedAnswer = currentQuestionData.answers[answerIndex];

    if (selectedAnswer.correct) {
      setScore((prev) => prev + 1);
    }

      const solve ={
        quizId: quiz._id,
        answers: [{
          questionId: currentQuestionData._id,
          answer: selectedAnswer.text
        }]
      }

    try {
       await axios.post(`${URLAPI}/api/quizzes/solve`,solve , {
        headers:{
          Authorization:getTokenUser
        }
      });


    } catch (err) {
      console.error('Error submitting answer:', err);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setUserAnswers(Array(quiz.questions.length).fill(null));
    setScore(0);
    setShowResult(false);
    setShowAnswers(false);

  };

  return (
    <QuizContext.Provider
      value={{
        currentQuestion,
        userAnswers,
        score,
        showResult,
        showAnswers,
        quiz,
        loading,
        error,
        handleAnswer,
        handleNextQuestion,
        handlePrevQuestion,
        handleRestart,
        setShowAnswers,
        setShowResult,
        fetchQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export default QuizProvider;
