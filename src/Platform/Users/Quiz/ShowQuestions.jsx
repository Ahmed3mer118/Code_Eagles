import React, { useState, useEffect, useRef, useContext } from 'react';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import UserService from '../../classes/UserService';
import { DataContext } from '../Context/Context';

const QUESTION_TIME = 60; // ثانية لكل سؤال

const ShowQuestions = ({ quiz, onSubmit }) => {
  const { getTokenUser } = useContext(DataContext);
  const { groupId, lecCourse, quizId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [questionTimes, setQuestionTimes] = useState([]);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const [userService] = useState(new UserService(getTokenUser));


  useEffect(() => {
    const savedAnswers = localStorage.getItem(`quiz_${quizId}_answers`);
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
    window.scrollTo(0, 0);
  }, [quizId]);


  useEffect(() => {
    localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(answers));
  }, [answers, quizId]);


  useEffect(() => {
    setTimeLeft(QUESTION_TIME);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentQuestionIndex]);


  useEffect(() => {
    if (timeLeft === 0) {
      handleNext(true); 
    }
  }, [timeLeft]);

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prevAnswers => {
      const existingAnswerIndex = prevAnswers.findIndex(
        ans => ans.questionId === questionId
      );
      if (existingAnswerIndex !== -1) {
        const newAnswers = [...prevAnswers];
        newAnswers[existingAnswerIndex] = {
          questionId,
          answer
        };
        return newAnswers;
      } else {
        return [...prevAnswers, { questionId, answer }];
      }
    });
    
    setTimeout(() => handleNext(false), 500);
  };


  const handleNext = (auto = false) => {
    setQuestionTimes(prev => {
      const newTimes = [...prev];
      newTimes[currentQuestionIndex] = QUESTION_TIME - timeLeft;
      return newTimes;
    });
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowReview(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleRestart = () => {
  
      localStorage.removeItem(`quiz_${quizId}_answers`);
      setAnswers([]);
      setCurrentQuestionIndex(0);
      setQuestionTimes([]);
      setShowReview(false);
      setTimeLeft(QUESTION_TIME);
      toast.success('Quiz Restarted Successfully');
   
  };

  const handleReview = async () => {
    const totalTime = questionTimes.reduce((acc, t) => acc + (t || 0), 0);
    toast.success(`Total Time: ${totalTime} seconds`);
    navigate(`/course/${groupId}/lecture/${lecCourse}/quiz/${quizId}/answers`, { state: { answers, totalTime } });
  };

  const handleQuestionClick = (index) => {
    setCurrentQuestionIndex(index);
    setShowReview(false);
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const totalTime = questionTimes.reduce((acc, t) => acc + (t || 0), 0);

  return (
    <>
      {!showReview ? (
        <>
          <div className="mb-4 card p-4">
            <h5>Question {currentQuestionIndex + 1} of {quiz.questions.length}</h5>
            <p
              className="lead text-center no-select"
              onCopy={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
              }}
            >
              {currentQuestion.question}
            </p>
            <div className="mb-2 text-end">
              <span className="badge bg-warning text-dark">Time Left: {timeLeft} seconds</span>
            </div>
            <div className="list-group">
              {currentQuestion.answers && currentQuestion.answers.map((option, index) => {
                const isSelected = answers.some(
                  ans => ans.questionId === currentQuestion._id && ans.answer === option.text
                );
                return (
                  <button
                    key={index}
                    onCopy={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    className={`list-group-item list-group-item-action ${isSelected ? 'active bg-primary text-white' : ''
                      }`}
                    onClick={() => handleAnswerSelect(currentQuestion._id, option.text)}
                    style={{
                      transition: 'all 0.3s ease',
                      border: isSelected ? '2px solid #0d6efd' : '1px solid rgba(0,0,0,.125)',
                      marginBottom: '5px',
                      borderRadius: '5px',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                    }}
                  >
                    {index + 1}. {option.text}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-outline-primary"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <IoArrowBack /> Previous
            </button>
            {isLastQuestion ? (
              <button
                className="btn btn-success"
                onClick={handleReview}
              >
                Review & Submit
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => handleNext(false)}
              >
                Next <IoArrowForward />
              </button>
            )}
          </div>
          {/* <div className="mt-3 text-center">
            <button className="btn btn-warning" onClick={handleRestart}>
              Restart Quiz
            </button>
          </div> */}
        </>
      ) : (
        <div className="text-center mt-5 card box-shadow p-4 rounded-3">
          <h4>You have finished the quiz!</h4>
          <p>Total Time: <span className="fw-bold">{totalTime} seconds</span></p>
          <button className="btn btn-primary mt-3" onClick={handleReview}>
            View Answers
          </button>
        </div>
      )}
    </>
  );
};

export default ShowQuestions;
