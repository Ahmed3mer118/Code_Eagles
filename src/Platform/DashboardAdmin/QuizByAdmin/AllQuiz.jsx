import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast , Toaster } from "react-hot-toast";
import { DataContext } from "../../Users/Context/Context";
import { FaTrash, FaEdit, FaUsers } from "react-icons/fa";

import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";

const AllQuiz = () => {
  const { URLAPI, getTokenAdmin, getTokenInstructor } = useContext(DataContext);
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [adminService] = useState(new AdminService(URLAPI, getTokenAdmin))
  const [instructorService] = useState(new InstructorService(URLAPI, getTokenInstructor))
  
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [studentsScores, setStudentsScores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        let response ;
        if (window.location.pathname.includes("/admin")) {
          response = await adminService.getQuizzes(groupId)
        } else {
          response = await instructorService.getQuizzes(groupId)
        }
      
        if (response && Array.isArray(response)) {
          setQuizzes(response);

        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        toast.error(error.response?.data?.message || "Failed to fetch quizzes");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [groupId, getTokenAdmin, URLAPI]);

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) {
      return;
    }


    // API call commented out
    try {
      await axios.delete(`${URLAPI}/api/quizzes/${quizId}`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      });
      setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz._id !== quizId));
      toast.success("Quiz deleted successfully");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error(error.response?.data?.message || "Failed to delete quiz");
    }
  };

  const handleEditQuiz = (quizId) => {
    if (window.location.pathname.includes("/admin")) {
      navigate(`/admin/${groupId}/quiz/edit/${quizId}`);
    } else {
      navigate(`/instructor/${groupId}/quiz/edit/${quizId}`);
    }
  };

  const handleShowStudents = async (quiz) => {
    try {
      setLoadingScores(true);
      setSelectedQuiz(quiz);
      setShowStudents(true);
      
      const response = await axios.get(`${URLAPI}/api/quizzes/get-score-all/${groupId}`, {
        headers: {
          Authorization: `${getTokenAdmin}`,
        },
      });
      
      setStudentsScores(response.data.membersQuizScores);
    } catch (error) {
      console.error("Error fetching students scores:", error);
      toast.error(error.response?.data?.message || "Failed to fetch students scores");
    } finally {
      setLoadingScores(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <Toaster />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quizzes</h2>
      
      </div>
      
      {quizzes?.length === 0 ? (
        <div className="alert alert-info">
          No quizzes available for this group.
        </div>
      ) : (
        <div className="row">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{quiz.lectureId.title || "Untitled Quiz"}</h5>
                  {/* <p className="card-text">{quiz.lectureId.description || "No description"}</p> */}
                  <div className="mt-2">
                    <small className="text-muted">
                      Questions: {quiz.questions?.length || 0} | 
                      Duration: {quiz.duration || "Not specified"} minutes
                    </small>
                  </div>
                </div>
                <div className="card-footer bg-transparent d-flex justify-content-between align-items-center gap-2">
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => handleShowStudents(quiz)}
                    >
                      <FaUsers /> Students
                    </button>
                  <button 
                    className="btn btn-sm btn-warning"
                    onClick={() => handleEditQuiz(quiz._id)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteQuiz(quiz._id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for showing students scores */}
      {showStudents && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Students Scores - {selectedQuiz?.lectureId?.title}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowStudents(false)}
                ></button>
              </div>
              <div className="modal-body">
                {loadingScores ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsScores.map((student) => {
                          const quizScore = student.quizScores.find(
                            (score) => score.quizId === selectedQuiz._id
                          );
                          return (
                            <tr key={student.userId}>
                              <td>{student.name}</td>
                              <td>{student.email}</td>
                              <td>
                                <span className={`badge bg-${student.status === 'approved' ? 'success' : 'warning'}`}>
                                  {student.status}
                                </span>
                              </td>
                              <td>{quizScore ? quizScore.score : 'Not taken'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowStudents(false)}
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
