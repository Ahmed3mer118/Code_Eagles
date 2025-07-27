import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import UserService from '../../classes/UserService';
import { Toaster, toast } from 'react-hot-toast';
import AuthServices from '../../classes/Auth';
import Loading from '../shared/Loading';

const ShowAnswers = () => {
  const navigate = useNavigate();
  const { slugQuiz, slugLec, slug } = useParams();
  const location = useLocation();
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const userService = new UserService(token)
  const [quiz, setQuiz] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    window.scrollTo(0,0)
    const fetchQuiz = async () => {
      try {
        const answersFromState = location.state?.answers || [];
        const quizStatus = await userService.getQuizById(slugQuiz);
        setStudentAnswers(answersFromState);
        setQuiz(quizStatus);
        setLoading(false);
      } catch (err) {
        console.log(err.message);
        setLoading(false);
        toast.error('Failed to load quiz');
      }
    };

    fetchQuiz();
    
  }, [slugLec, location.state]);
  const handleFinishQuiz = async () => {
    try {
      const result = await userService.solveQuiz(slugQuiz, studentAnswers);
      if (parseInt(result.score) >= 50) {
        toast.success('Congratulations! You passed the quiz');
        handleRestart();
        navigate(`/course/${slug}/lecture/${slugLec}/quiz/${slugQuiz}/result`);
      } else {
        handleRestart();
        setTimeout(() => {
          navigate(`/course/${slug}/lecture/${slugLec}/quiz/${slugQuiz}/result`);
        }, 2000);
      }
    } catch (err) {
      toast.error('Failed to submit quiz');
    }
  };
  const handleRestart = () => {
      localStorage.removeItem(`quiz_${slugQuiz}_answers`);
  };

  const handleShowQuestions = () => {
    navigate(`/course/${slug}/lecture/${slugLec}/quiz/${slugQuiz}/questions`);
  };

  if (loading) {
    return (
      <Loading /> 
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-danger">
        <h4>Error</h4>
        <p>{error}</p>
          Back to questions
        <button className="btn btn-primary mt-3" onClick={() => navigate(`/course/${slug}/lecture/${slugLec}/quiz/${slugQuiz}/questions`)}>
        </button>
      </div>
    );
  }

  if (!quiz || !quiz.questions) {
    return (
      <Loading />
    );
  }

  return (
    <>
    <Toaster position='top-center' />
    <div className="container mx-auto py-5">
    <div className="flex justify-center">
      <div className="w-full md:w-2/3">
        <div className="bg-white rounded-lg shadow-md">
          <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
            <h4 className="text-xl font-semibold">Your Answers</h4>
          </div>
  
          <div className="p-6 select-none" onCopy={(e) => e.preventDefault()}>
            {quiz.questions.map((question, index) => {
              const studentAnswer = studentAnswers.find(
                answer => answer.questionId === question._id
              )?.answer;
  
              return (
                <div key={question._id} className="mb-8">
                  <h5 className="text-lg font-medium">Question {index + 1}</h5>
                  <p className="text-gray-700 text-lg mb-4">{question.question}</p>
  
                  <div className="space-y-2">
                    {question.answers && question.answers.map((answer) => (
                      <div
                        key={answer._id}
                        className={`p-3 rounded ${answer.text === studentAnswer 
                          ? 'bg-gray-600 text-white' 
                          : 'bg-gray-100'}`}
                        onCopy={(e) => e.preventDefault()}
                      >
                        <div className="flex justify-between items-center">
                          <span>{answer.text}</span>
                          {answer.text === studentAnswer && (
                            <span className="text-sm italic">Your Answer</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
  
            <div className="flex justify-center space-x-4 mt-6">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={handleFinishQuiz}
              >
                Finish Quiz
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={handleShowQuestions}
              >
                Show Questions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    </>
  );
};

export default ShowAnswers;
