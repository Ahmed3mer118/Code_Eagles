import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import AuthServices from "../../classes/Auth";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";

const UpdateQuiz = () => {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const adminServices = new AdminService(token);
  const instructorService = new InstructorService(token);
  const { slugLecture, slug , slugQuiz } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    duration: "",
    questions: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        let res;
        if (window.location.href.includes("/admin")) {
          res = await adminServices.getQuiz(slugQuiz);
        } else {
          res = await instructorService.getQuiz(slugQuiz);
        }
        setQuiz(res);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        toast.error(error.response?.data?.message || "Error fetching quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [slug]);

  const handleQuestionChange = (questionIndex, field, value) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value,
    };
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleAnswerChange = (questionIndex, answerIndex, field, value) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].answers[answerIndex] = {
      ...updatedQuestions[questionIndex].answers[answerIndex],
      [field]: value,
    };
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleDeleteQuestion = (questionIndex) => {
    const updatedQuestions = quiz.questions.filter(
      (_, index) => index !== questionIndex
    );
    setQuiz({ ...quiz, questions: updatedQuestions });
    toast.success("Question deleted successfully");
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      question: "",
      answers: [
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
      ],
    };
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const service = window.location.pathname.includes("/admin")
        ? adminServices
        : instructorService;
  
      const updatedData = {
        title: quiz.quizTitle,
        questions: quiz.questions,
      };
  
      await service.updateQuiz(slugQuiz, updatedData);
  
      toast.success("Quiz updated successfully");
  
      if (window.location.pathname.includes("/admin")) {
        navigate(`/dashboard/admin/group/${slug}/quiz`);
      } else {
        window.history.back();
      }
    } catch (error) {
      console.error("Error updating quiz:", error);
      toast.error(error.response?.data?.message || "Error updating quiz");
    }
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
              Update Quiz
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={quiz?.quizTitle || ""}
                    onChange={(e) =>
                      setQuiz({ ...quiz, title: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Questions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quiz.questions.map((question, questionIndex) => (
                    <div
                      key={questionIndex}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-md font-medium text-gray-700">
                          Question {questionIndex + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(questionIndex)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                        >
                          <FaTrash />
                        </button>
                      </div>

                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:ring-blue-500 focus:border-blue-500"
                        value={question.question}
                        onChange={(e) =>
                          handleQuestionChange(
                            questionIndex,
                            "question",
                            e.target.value
                          )
                        }
                        placeholder="Enter question"
                        required
                      />

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Answers
                        </label>
                        {question.answers.map((answer, answerIndex) => (
                          <div key={answerIndex} className="flex items-center">
                            <input
                              type="text"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                              value={answer.text}
                              onChange={(e) =>
                                handleAnswerChange(
                                  questionIndex,
                                  answerIndex,
                                  "text",
                                  e.target.value
                                )
                              }
                              placeholder={`Answer ${answerIndex + 1}`}
                              required
                            />
                            <label className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-100 rounded-r-md">
                              <input
                                type="radio"
                                name={`correct-${questionIndex}`}
                                checked={answer.correct}
                                onChange={() => {
                                  const updatedAnswers = question.answers.map(
                                    (a, i) => ({
                                      ...a,
                                      correct: i === answerIndex,
                                    })
                                  );
                                  handleQuestionChange(
                                    questionIndex,
                                    "answers",
                                    updatedAnswers
                                  );
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add Question
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateQuiz;
