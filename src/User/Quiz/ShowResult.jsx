import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserService from '../../classes/UserService';
import { toast } from 'react-hot-toast';
import AuthServices from '../../classes/Auth';
import Loading from '../shared/Loading';

const ShowResult = () => {
  const { slugQuiz, slugLec, slug } = useParams();
  const navigate = useNavigate();
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const userService = new UserService(token)
  const [score, setScore] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextLectureId, setNextLectureId] = useState(null);

  useEffect(() => {
    window.scrollTo(0,0)
    const fetchQuiz = async () => {
      const dataAllLectures = await userService.getLectures(slug);
      const dataLecture = await userService.getQuizzesByLectureId(slugLec);
      const solveQuiz = await userService.getScore(slugQuiz);
      try {
        const currentLectureIndex = dataAllLectures.lectures.findIndex(
          lecture => lecture.slugLec === slugLec
        );
        
        if (currentLectureIndex !== -1 && currentLectureIndex < dataAllLectures.lectures.length - 1) {
          setNextLectureId(dataAllLectures.lectures[currentLectureIndex + 1].slugLec);
        }
        setScore(solveQuiz);
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
  }, [slugLec]);

  const handleNextLecture = () => {
    if (nextLectureId) {
      navigate(`/course/${slug}/lecture/${nextLectureId}`);
    } else {
      toast.error('No next lecture available');
    }
  };

  const handleRetake = () => {
    navigate(`/course/${slug}/lecture/${slugLec}/quiz/${slugQuiz}/questions`);
    localStorage.removeItem(`quiz_${slugQuiz}_answers`);
  };

  if (loading) {
    return (
      <Loading />
    );
  }



  if (!quiz) {
    return null;
  }

  return (
    <div className="container mx-auto py-5">
    <div className="flex justify-center">
      <div className="w-full md:w-2/3">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4">
            <h4 className="text-xl font-semibold">Quiz Result</h4>
          </div>
  
          <div className="p-6 text-center">
            <h3 className="text-2xl font-medium mb-6">
              Your Score: {parseInt(score.quizScore.score) || 0}%
            </h3>
            
            {parseInt(score.quizScore.score) >= 50 ? (
              <div className="space-y-4">
                <p className="text-green-600 text-lg font-medium">
                  Congratulations! You passed the quiz.
                </p>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                  onClick={handleNextLecture}
                >
                  Go to Next Lecture
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <svg 
                  className="w-6 h-6 text-red-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
                <p className="text-red-600 text-lg font-medium">
                  You need to score 50% or more to pass.
                </p>
              </div>
              
              <button
                onClick={handleRetake}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                Retake Quiz
              </button>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default ShowResult;