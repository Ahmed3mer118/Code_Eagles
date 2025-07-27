import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import UserService from '../../classes/UserService';
import { toast } from 'react-hot-toast';
import ShowQuestions from './ShowQuestions';
import ShowAnswers from './ShowAnswers';
import ShowResult from './ShowResult';
import AuthServices from '../../classes/Auth';
import Loading from '../shared/Loading';

const Quiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const userService = new UserService(token)

  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizStatus, setQuizStatus] = useState(null);
  const { slug, slugQuiz, slugLec } = useParams();
  useEffect(() => {
    window.scrollTo(0,0)

    const fetchQuiz = async () => {
      try {
        const quizStatus = await userService.getQuizById(slugQuiz);
        setQuiz(quizStatus)
        // setQuiz(data)
        setQuizStatus(quizStatus);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error('Failed to load quiz');
      }
    };

    fetchQuiz();
  }, [slugLec]);

  useEffect(() => {
    const checkPathValidity = () => {
      const currentPath = location.pathname;
      const basePath = `/course/${slug}/lecture/${slugLec}/quiz/${slugQuiz}`;

      if (currentPath === `${basePath}/questions`) {
        if (quizStatus?.status === 'completed') {
          toast.error('You have already completed this quiz');
          navigate(`${basePath}/result`);
          return;
        }
      }

      if (currentPath === `${basePath}/answers` || currentPath === `${basePath}/result`) {
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
      const formattedAnswers = Object.entries(answers).map(([questionId, answerId]) => ({
        questionId,
        answer: answerId
      }));

      const result = await userService.solveQuiz(slugQuiz, formattedAnswers);
      console.log('Quiz Result:', result);

      if (result.score >= 50) {
        navigate(`/course/${slug}/lecture/${slugLec}/quiz/${slugQuiz}/result`);
      } else {
        navigate(`/course/${slug}/lecture/${slugLec}/quiz/${slugQuiz}/answers`);
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      toast.error('Failed to submit quiz');
    }
  };

  if (loading) {
    return (
      <Loading />
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
  const basePath = `/course/${slug}/lecture/${slugLec}/quiz/${slugQuiz}`;

  return (
    <div className="container py-5 mx-auto">
      <div className="row justify-content-center p-3">
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
            slugQuiz={slugQuiz}
            onSubmit={handleSubmit}

          />
        )}
        {location.pathname === `${basePath}/answers` && (
          <ShowAnswers
            quiz={quiz}
            slugQuiz={slugQuiz}

          />
        )}
        {location.pathname === `${basePath}/result` && (
          <ShowResult
            quiz={quiz}
            slugQuiz={slugQuiz}

          />
        )}
      </div>
    </div>
  );
};

export default Quiz;