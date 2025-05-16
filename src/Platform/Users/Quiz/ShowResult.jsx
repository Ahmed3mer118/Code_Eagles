import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataContext } from '../Context/Context';
import UserService from '../../classes/UserService';
import { toast } from 'react-hot-toast';

const ShowResult = () => {
  const { quizId, lecCourse, groupId } = useParams();
  const navigate = useNavigate();
  const { getTokenUser } = useContext(DataContext);
  const [userService] = useState(new UserService(getTokenUser));
  const [score, setScore] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextLectureId, setNextLectureId] = useState(null);

  useEffect(() => {
 

    const fetchQuiz = async () => {
      const dataAllLectures = await userService.getLectures(groupId);
      const dataLecture = await userService.getQuizzesByLectureId(lecCourse);
      const solveQuiz = await userService.getScore(quizId);

      try {

        const currentLectureIndex = dataAllLectures.lectures.findIndex(
          lecture => lecture._id === lecCourse
        );
        
        if (currentLectureIndex !== -1 && currentLectureIndex < dataAllLectures.lectures.length - 1) {
          setNextLectureId(dataAllLectures.lectures[currentLectureIndex + 1]._id);
        }

        setScore(solveQuiz);
        setQuiz(dataLecture);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error('Failed to load quiz');
      }
    };

    fetchQuiz();
  }, [lecCourse]);

  const handleNextLecture = () => {
    if (nextLectureId) {
      navigate(`/course/${groupId}/lecture/${nextLectureId}`);
    } else {
      toast.error('No next lecture available');
    }
  };

  const handleRetake = () => {
    navigate(`/course/${groupId}/lecture/${lecCourse}/quiz/${quizId}/questions`);
    localStorage.removeItem(`quiz_${quizId}_answers`);
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



  if (!quiz) {
    return null;
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">

        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Quiz Result</h4>
            </div>

            <div className="card-body text-center">
              <h3 className="mb-4">Your Score: {parseInt(score.quizScore.score) || 0}%</h3>
              
              
              { parseInt(score.quizScore.score) >= 50 ? (
                <>
                  <p className="text-success mb-4">Congratulations! You passed the quiz.</p>
                  <button
                    className="btn btn-success"
                    onClick={handleNextLecture}
                  >
                    Go to Next Lecture
                  </button>
                </>
              ) : (
                <p className="text-danger">You need to score 50% or more to pass.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowResult;