import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { DataContext } from '../Context/Context';
import UserService from '../../classes/UserService';
import { toast } from 'react-hot-toast';

const ShowAnswers = () => {
  const { quizId, lecCourse, groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getTokenUser } = useContext(DataContext);
  const [userService] = useState(new UserService(getTokenUser));
  const [quiz, setQuiz] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const dataLecture = await userService.getQuizzesByLectureId(lecCourse);
        const answersFromState = location.state?.answers || [];
        setStudentAnswers(answersFromState);
        setQuiz(dataLecture);
        setLoading(false);
      } catch (err) {
        console.log(err.message);
        setLoading(false);
        toast.error('Failed to load quiz');
      }
    };

    fetchQuiz();
  }, [lecCourse, location.state]);

  const handleFinishQuiz = async () => {
    try {
      const result = await userService.solveQuiz(quizId, studentAnswers);
      if (parseInt(result.score) >= 50) {
        toast.success('Congratulations! You passed the quiz');
        navigate(`/course/${groupId}/lecture/${lecCourse}/quiz/${quizId}/result`);
        handleRestart();
      } else {
        toast.error('You need to score 50% or more to pass');
        handleRestart();
        setTimeout(() => {
          navigate(`/course/${groupId}/lecture/${lecCourse}/quiz/${quizId}/questions`);
        }, 2000);
      }
    } catch (err) {
      toast.error('Failed to submit quiz');
    }
  };
  const handleRestart = () => {
      localStorage.removeItem(`quiz_${quizId}_answers`);
      toast.success('Quiz Restarted Successfully');
   
  };

  const handleShowQuestions = () => {
    navigate(`/course/${groupId}/lecture/${lecCourse}/quiz/${quizId}/questions`);
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
        <h4>Error</h4>
        <p>{error}</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate(`/course/${groupId}/lecture/${lecCourse}/quiz/${quizId}/questions`)}>
          Back to questions
        </button>
      </div>
    );
  }

  if (!quiz || !quiz.questions) {
    return null;
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Your Answers</h4>
            </div>

            <div className="card-body" onCopy={(e) => e.preventDefault()} style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}>
              {quiz.questions.map((question, index) => {
                const studentAnswer = studentAnswers.find(
                  answer => answer.questionId === question._id
                )?.answer;

                return (
                  <div key={question._id} className="mb-4">
                    <h5>Question {index + 1}</h5>
                    <p className="lead">{question.question}</p>

                    <div className="list-group">
                      {question.answers && question.answers.map((answer) => (
                        <div
                          key={answer._id}
                          className={`list-group-item ${answer.text === studentAnswer ? 'bg-secondary text-white' : ''
                            }`}
                          onCopy={(e) => e.preventDefault()}
                          style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
                        >
                          {answer.text}
                          {answer.text === studentAnswer && (
                            <span className="float-end">Your Answer</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="d-flex justify-content-center gap-3">
                <button
                  className="btn btn-success"
                  onClick={handleFinishQuiz}
                >
                  Finish Quiz
                </button>
                <button
                  className="btn btn-primary"
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
  );
};

export default ShowAnswers;
