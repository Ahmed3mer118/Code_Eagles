import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { FaTrash, FaEdit, FaUsers } from "react-icons/fa";
import AuthServices from "../../classes/Auth";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";
import Loading from "../../User/shared/Loading";

const AllQuiz = () => {
  const { slug ,slugLecture } = useParams();
  const navigate = useNavigate();
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const adminService = new AdminService(token);
  const instructorService = new InstructorService(token);
  
  const [quizzes, setQuizzes] = useState([]);
  const [countQuiz, setCountQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [studentsScores, setStudentsScores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);
  const [isDeleted,setIsDeleted] = useState(false)

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const service = window.location.pathname.includes("/dashboard") 
        ? adminService 
        : instructorService;
      
      const response = await service.getQuizzes(slug)
      setQuizzes(response?.quizzes || []);
      setCountQuiz(response?.count || 0);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (slugQuize) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;

    try {
      const service = window.location.pathname.includes("/admin") 
        ? adminService 
        : instructorService;
      
      await service.deleteQuiz(slugQuize);
      setQuizzes(prev => prev.filter(quiz => quiz.slugQuize !== slugQuize));
      toast.success("Quiz deleted successfully");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error(error.response?.data?.message || "Failed to delete quiz");
    }
  };

  const fetchStudentScores = async (slugQuize) => {
    try {
      setLoadingScores(true);
      const service = window.location.pathname.includes("/admin") 
        ? adminService 
        : instructorService;
      
      const response = await service.getAllScoreByGroupSlug(slug);
      setStudentsScores(response?.membersQuizScores || []);
    } catch (error) {
      console.error("Error fetching scores:", error);
      toast.error(error.response?.data?.message || "Failed to fetch scores");
    } finally {
      setLoadingScores(false);
    }
  };

  const handleShowStudents = async (quiz) => {
    setSelectedQuiz(quiz);
    setShowStudents(true);
    await fetchStudentScores(quiz.slugQuize);
  };

  const handleEditQuiz = (quizSlug,slugLec) => {
    const basePath = window.location.pathname.includes("/admin") 
      ? "/dashboard/admin" 
      : "/instructor";
    navigate(`${basePath}/group/${slug}/lecture/${slugLec}/quiz/updateQuiz/${quizSlug}`);
  };

  useEffect(() => {
    fetchQuizzes();
  }, [slug]);

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Quizzes</h1>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {countQuiz || 0} quizzes
        </span>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">No quizzes available for this group.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.quizId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {quiz.quizTitle}
                  </h3>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {quiz.slugQuize}
                  </span>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Lecture:</span> {quiz.lecture.title}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Group:</span> {quiz.group.title}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-between">
                <button
                  onClick={() => handleShowStudents(quiz)}
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                >
                  <FaUsers className="mr-1" /> Students
                </button>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditQuiz(quiz.slugQuize,quiz.lecture.slugLec)}
                    className="text-yellow-600 hover:text-yellow-800 flex items-center text-sm"
                  >
                    <FaEdit className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => deleteQuiz(quiz.slugQuize)}
                    className="text-red-600 hover:text-red-800 flex items-center text-sm"
                  >
                    <FaTrash className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Students Scores Modal */}
      {showStudents && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Student Scores - {selectedQuiz?.quizTitle}
                </h3>
                <button
                  onClick={() => setShowStudents(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {loadingScores ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {studentsScores.length > 0 ? (
                          studentsScores.map((student) => {
                            const quizScore = student.quizScores?.find(
                              (score) => score.slugQuize === selectedQuiz?.slugQuize
                            );
                            return (
                              <tr key={student.userId}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {student.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {student.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    student.status === 'approved' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {student.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {quizScore?.score ?? 'Not taken'}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                              No student scores available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowStudents(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllQuiz;