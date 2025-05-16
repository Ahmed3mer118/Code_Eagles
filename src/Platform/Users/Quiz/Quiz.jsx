import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { DataContext } from '../Context/Context';
import UserService from '../../classes/UserService';
import { toast } from 'react-hot-toast';
import ShowQuestions from './ShowQuestions';
import ShowAnswers from './ShowAnswers';
import ShowResult from './ShowResult';

const Quiz = () => {
  const { quizId, lecCourse, groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getTokenUser } = useContext(DataContext);
  const [userService] = useState(new UserService(getTokenUser));
  
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizStatus, setQuizStatus] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await userService.getQuizzesByLectureId(lecCourse);
        const quizStatus = await userService.getQuizById(quizId);
        setQuiz(data)
        setQuizStatus(quizStatus);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error('Failed to load quiz');
      }
    };

    fetchQuiz();
  }, [lecCourse]);

  useEffect(() => {
    const checkPathValidity = () => {
      const currentPath = location.pathname;
      const basePath = `/course/${groupId}/lecture/${lecCourse}/quiz/${quizId}`;
      
      if (currentPath === `${basePath}/questions`) {
    
        // التحقق من حالة الاختبار
        if (quizStatus?.status === 'completed') {
          toast.error('You have already completed this quiz');
          navigate(`${basePath}/result`);
          return;
        }
      }
      
      if (currentPath === `${basePath}/answers` || currentPath === `${basePath}/result`) {
        // التحقق من وجود نتيجة للاختبار
        if (!quizStatus) {
          toast.error('You must complete the quiz first');
          navigate(`${basePath}/questions`);
          return;
        }
      }
    };

    if (!loading) {
      checkPathValidity();
    }
  }, [location.pathname, loading, quizStatus]);

  const handleSubmit = async (answers) => {
    try {
      // تحويل الإجابات إلى الشكل المطلوب من API
      const formattedAnswers = Object.entries(answers).map(([questionId, answerId]) => ({
        questionId,
        answer: answerId
      }));

      const result = await userService.solveQuiz(quizId, formattedAnswers);
      console.log('Quiz Result:', result);
      
      if (result.score >= 50) {
        navigate(`/course/${groupId}/lecture/${lecCourse}/quiz/${quizId}/result`);
      } else {
        navigate(`/course/${groupId}/lecture/${lecCourse}/quiz/${quizId}/answers`);
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      toast.error('Failed to submit quiz');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-danger">
        Error: {error}
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="text-center p-4">
        <h3>No questions available in this quiz</h3>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }
  const basePath = `/course/${groupId}/lecture/${lecCourse}/quiz/${quizId}`;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        {window.location.pathname === basePath && (
        <>

        <button className="btn btn-primary" onClick={() => navigate(`${basePath}/questions`)}>
          Start Quiz
        </button>
        </> 
        )}
        {location.pathname === `${basePath}/questions` && (
          <ShowQuestions 
            quiz={quiz} 
            quizId={quizId} 
            onSubmit={handleSubmit}

          />
        )}
        {location.pathname === `${basePath}/answers` && (
          <ShowAnswers 
            quiz={quiz}
            quizId={quizId}

          />
        )}
        {location.pathname === `${basePath}/result` && (
          <ShowResult 
            quiz={quiz}
            quizId={quizId}

          />
        )}
      </div>
    </div>
  );
};

export default Quiz;