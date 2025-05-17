import React, { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { DataContext } from "../../Users/Context/Context";
import { Toaster } from "react-hot-toast";

const CreateQuiz = () => {
  const { URLAPI, getTokenAdmin , getTokenInstructor } = useContext(DataContext);
  const { lectureId , groupId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState({
    lectureId: lectureId,
    questions: [
      {
        question: "",
        answers: [
          { text: "", correct: false },
          { text: "", correct: false },
          { text: "", correct: false },
          { text: "", correct: false }
        ]
      }
    ]
  });

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index].question = value;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const handleAnswerChange = (questionIndex, answerIndex, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].answers[answerIndex].text = value;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const handleCorrectAnswerChange = (questionIndex, answerIndex) => {
    const updatedQuestions = [...quizData.questions];
    // Set all answers to false first
    updatedQuestions[questionIndex].answers.forEach(answer => {
      answer.correct = false;
    });
    // Then set the selected answer to true
    updatedQuestions[questionIndex].answers[answerIndex].correct = true;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

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
            { text: "", correct: false }
          ]
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    if (quizData.questions.length > 1) {
      const updatedQuestions = [...quizData.questions];
      updatedQuestions.splice(index, 1);
      setQuizData({ ...quizData, questions: updatedQuestions });
    } else {
      toast.warning("You must have at least one question");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate quiz data
    if (!quizData.lectureId) {
      toast.error("Lecture ID is required");
      return;
    }
    
    // Check if all questions have text
    const hasEmptyQuestions = quizData.questions.some(q => !q.question.trim());
    if (hasEmptyQuestions) {
      toast.error("All questions must have text");
      return;
    }
    
    // Check if all answers have text
    const hasEmptyAnswers = quizData.questions.some(q => 
      q.answers.some(a => !a.text.trim())
    );
    if (hasEmptyAnswers) {
      toast.error("All answers must have text");
      return;
    }
    
    // Check if each question has exactly one correct answer
    const hasNoCorrectAnswer = quizData.questions.some(q => 
      !q.answers.some(a => a.correct)
    );
    if (hasNoCorrectAnswer) {
      toast.error("Each question must have exactly one correct answer");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${URLAPI}/api/quizzes`,
        quizData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${getTokenAdmin || getTokenInstructor}`
          }
        }
      );
      
      toast.success("Quiz created successfully!");
      if (response.status === 201 || response.status === 200) {
        setTimeout(() => {
          if (window.location.pathname.includes("/admin")) {
            navigate(`/admin/${groupId}/lectures`);
          } else {
            navigate(`/instructor/${groupId}/lectures`);
          }
        }, 2000);
      } else {
        toast.error("Failed to create quiz");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error(error.response?.data?.message || "Error creating quiz");
    } finally {
      setLoading(false);
    }
  };

  // Group questions into rows of 2
  const questionsPerRow = 2;
  const questionRows = [];
  
  for (let i = 0; i < quizData.questions.length; i += questionsPerRow) {
    const rowQuestions = quizData.questions.slice(i, i + questionsPerRow);
    questionRows.push(rowQuestions);
  }

  return (
    <div className="container py-4">
      <Toaster position="top-right"/>
      <div className="card shadow-sm">
        <div className="card-header bg-muted text-dark d-flex justify-content-between mb-4">
          <h4 className="mb-0">Create Quiz</h4>
         
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} style={{width:"100%"}}>
            {questionRows.map((row, rowIndex) => (
              <div key={rowIndex} className="row mb-4">
                {row.map((question, questionIndex) => {
                  const globalIndex = rowIndex * questionsPerRow + questionIndex;
                  return (
                    <div key={globalIndex} className="col-lg-6 col-md-12 col-sm-12">
                      <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">Question {globalIndex + 1}</h5>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removeQuestion(globalIndex)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Question Text</label>
                            <input
                              type="text"
                              className="form-control"
                              value={question.question}
                              onChange={(e) => handleQuestionChange(globalIndex, e.target.value)}
                              placeholder="Enter your question"
                              required
                            />
                          </div>
                          
                          <div className="mb-3">
                            <label className="form-label">Answers</label>
                            {question.answers.map((answer, answerIndex) => (
                              <div key={answerIndex} className="input-group mb-2">
                                <div className="input-group-text">
                                  <input
                                    type="radio"
                                    name={`correct-${globalIndex}`}
                                    checked={answer.correct}
                                    onChange={() => handleCorrectAnswerChange(globalIndex, answerIndex)}
                                    required
                                  />
                                </div>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={answer.text}
                                  onChange={(e) => handleAnswerChange(globalIndex, answerIndex, e.target.value)}
                                  placeholder={`Answer ${answerIndex + 1}`}
                                  required
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            
            <div className="d-flex justify-content-between mb-4">
              <button
                type="button"
                className="btn btn-success"
                onClick={addQuestion}
              >
                Add Question
              </button>
              
             
            </div>
            <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
          
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : (
                  "Create Quiz"
                )}
              </button>
              </form>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz; 