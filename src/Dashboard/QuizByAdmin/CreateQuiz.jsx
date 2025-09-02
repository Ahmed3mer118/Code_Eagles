import React, { useState ,useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import AuthServices from "../../classes/Auth";
import AdminService from "../../classes/AdminService";
import InstructorService from "../../classes/InstructorService";

const CreateQuiz = () => {
  const authServices = new AuthServices();
  const token = authServices.getToken();
  const adminService = new AdminService(token);
  const instructorService = new InstructorService(token);
  const { slugLecture, slug } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);

  const savedQuiz = sessionStorage.getItem("quizData");
  const initialQuizData = savedQuiz
    ? JSON.parse(savedQuiz)
    : {
        title: slugLecture,
        slugLec: slugLecture,
        questions: [
          {
            question: "",
            answers: [
              { text: "", correct: false },
              { text: "", correct: false },
              { text: "", correct: false },
              { text: "", correct: false },
            ],
          },
        ],
      };

  const [quizData, setQuizData] = useState(initialQuizData);

  useEffect(() => {
    sessionStorage.setItem("quizData", JSON.stringify(quizData));
  }, [quizData]);

  // Handle question text change
  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index].question = value;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  // Handle answer text change
  const handleAnswerChange = (questionIndex, answerIndex, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].answers[answerIndex].text = value;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  // Handle correct answer selection
  const handleCorrectAnswerChange = (questionIndex, answerIndex) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].answers.forEach((answer) => {
      answer.correct = false;
    });
    updatedQuestions[questionIndex].answers[answerIndex].correct = true;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  // Add new question
  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          question: "",
          answers: [
            { text: "", correct: false },
            { text: "", correct: false },
            { text: "", correct: false },
            { text: "", correct: false },
          ],
        },
      ],
    });
  };

  // Remove question
  const removeQuestion = (index) => {
    if (quizData.questions.length > 1) {
      const updatedQuestions = [...quizData.questions];
      updatedQuestions.splice(index, 1);
      setQuizData({ ...quizData, questions: updatedQuestions });
    } else {
      toast.error("You must have at least one question");
    }
  };

  // Validate quiz data before submission
  const validateQuiz = () => {
    if (!quizData.slugLec) {
      toast.error("Lecture slug is required");
      return false;
    }

    const hasEmptyQuestions = quizData.questions.some((q) => !q.question.trim());
    if (hasEmptyQuestions) {
      toast.error("All questions must have text");
      return false;
    }

    const hasEmptyAnswers = quizData.questions.some((q) =>
      q.answers.some((a) => !a.text.trim())
    );
    if (hasEmptyAnswers) {
      toast.error("All answers must have text");
      return false;
    }

    const hasNoCorrectAnswer = quizData.questions.some(
      (q) => !q.answers.some((a) => a.correct)
    );
    if (hasNoCorrectAnswer) {
      toast.error("Each question must have exactly one correct answer");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateQuiz()) return;

    setLoading(true);

    try {
      const service = window.location.pathname.includes("/dashboard")
        ? adminService
        : instructorService;

      await service.createQuiz(quizData);

      toast.success("Quiz created successfully!");
      sessionStorage.removeItem("quizData");

      setTimeout(() => {
        const basePath = window.location.pathname.includes("/dashboard")
          ? `/dashboard/admin/group/${slug}/lectures`
          : `/instructor/group/${slug}/lectures`;
        navigate(basePath);
      }, 1500);
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error(error.response?.data?.message || "Error creating quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="bg-white shadow rounded-lg overflow-hidden">
    {/* Header */}
    <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Create New Quiz
        </h2>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 self-start sm:self-auto">
          {slugLecture}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Create a quiz for this lecture by adding questions and answers below
      </p>
    </div>

    {/* Main Form */}
    <div className="px-4 sm:px-6 py-6">
      <form onSubmit={handleSubmit}>
        {/* Questions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {quizData.questions.map((question, questionIndex) => (
            <div
              key={questionIndex}
              className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-800">
                  Question {questionIndex + 1}
                </h3>
                {quizData.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(questionIndex)}
                    className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Question Input */}
              <div className="mb-4">
                <label
                  htmlFor={`question-${questionIndex}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Question Text
                </label>
                <input
                  type="text"
                  id={`question-${questionIndex}`}
                  value={question.question}
                  onChange={(e) =>
                    handleQuestionChange(questionIndex, e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Enter your question"
                  required
                />
              </div>

              {/* Answers */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Answers (Select the correct one)
                </label>
                {question.answers.map((answer, answerIndex) => (
                  <div key={answerIndex} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`correct-${questionIndex}`}
                      checked={answer.correct}
                      onChange={() =>
                        handleCorrectAnswerChange(questionIndex, answerIndex)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      required
                    />
                    <input
                      type="text"
                      value={answer.text}
                      onChange={(e) =>
                        handleAnswerChange(
                          questionIndex,
                          answerIndex,
                          e.target.value
                        )
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      placeholder={`Answer ${answerIndex + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm sm:text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Question
          </button>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm sm:text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm sm:text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Quiz"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>

    </div>
  );
};

export default CreateQuiz;