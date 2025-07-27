import React, { useState, useEffect, useRef, useContext } from 'react';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import UserService from '../../classes/UserService';
import AuthServices from '../../classes/Auth';

const QUESTION_TIME = 60;

const ShowQuestions = ({ quiz, onSubmit }) => {
 
  const { slug, slugLec, slugQuiz } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [questionTimes, setQuestionTimes] = useState([]);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const userService = new UserService(token)


  useEffect(() => {
    const savedAnswers = localStorage.getItem(`quiz_${slugQuiz}_answers`);
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
    window.scrollTo(0, 0);
  }, [slugQuiz]);


  useEffect(() => {
    localStorage.setItem(`quiz_${slugQuiz}_answers`, JSON.stringify(answers));
  }, [answers, slugQuiz]);


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
      localStorage.removeItem(`quiz_${slugQuiz}_answers`);
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
    navigate(`/course/${slug}/lecture/${slugLec}/quiz/${slugQuiz}/answers`, { state: { answers, totalTime } });
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
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-2xl mx-4 bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100">
        {/* Quiz Header */}
        <div className="bg-blue-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="text-base font-medium">
              Question <span className="text-2xl font-semibold">{currentQuestionIndex + 1}</span>/{quiz.questions.length}
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
              ⏱️ {timeLeft}s remaining
            </div>
          </div>
          <div className="h-1.5 w-full bg-white/30 mt-4 rounded-full">
            <div 
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6 md:p-8">
          <div 
            className="text-xl md:text-2xl font-normal text-center mb-8 px-4 py-6 bg-blue-50 rounded-lg select-none font-sans text-blue-900"
            onCopy={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {currentQuestion.question}
          </div>

          {/* Answer Options */}
          <div className="grid gap-3 mb-8">
            {currentQuestion.answers.map((option, index) => {
              const isSelected = answers.some(
                ans => ans.questionId === currentQuestion._id && ans.answer === option.text
              );
              
              return (
                <button
                  key={index}
                  className={`p-4 text-left rounded-lg border transition-all duration-200 flex items-start ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-100 shadow-sm'
                      : 'border-blue-200 hover:border-blue-300 bg-white'
                  }`}
                  onClick={() => handleAnswerSelect(currentQuestion._id, option.text)}
                >
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full mr-3 flex-shrink-0 ${
                    isSelected 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-50 text-blue-700'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-blue-900">{option.text}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button
              className={`px-5 py-2.5 rounded-lg flex-1 flex items-center justify-center ${
                currentQuestionIndex === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <IoArrowBack className="mr-2" />
              Previous
            </button>

            {isLastQuestion ? (
              <button
                className="flex-1 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors"
                onClick={handleReview}
              >
                Review Answers
              </button>
            ) : (
              <button
                className="flex-1 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors"
                onClick={() => handleNext(false)}
              >
                Next <IoArrowForward className="ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md mx-4 bg-white rounded-xl shadow-sm overflow-hidden text-center p-8 border border-blue-100">
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-blue-800 mb-2 font-sans">Quiz Completed</h3>
          <p className="text-blue-600 mb-1">Total time:</p>
          <p className="text-3xl font-normal text-blue-700 mb-6">{totalTime} seconds</p>
        </div>
        <button 
          className="w-full py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          onClick={handleReview}
        >
          View Your Anwser
        </button>
      </div>
    </div>
  )}
</>
  );
};

export default ShowQuestions;
